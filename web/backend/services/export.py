"""Export service for Obsidian and Notion."""

import logging
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
import json

from config import PROJECT_ROOT, REPORTS_DIR

logger = logging.getLogger(__name__)


def sanitize_filename(name: str) -> str:
    """Sanitize a string for use as a filename."""
    # Remove or replace invalid characters
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name[:100]  # Limit length


def extract_tags_from_content(content: str) -> List[str]:
    """Extract potential tags from report content."""
    tags = set()

    # Look for explicit tags
    tag_match = re.search(r'\*\*Tags?\*\*:\s*(.+)', content, re.IGNORECASE)
    if tag_match:
        for tag in tag_match.group(1).split(','):
            tag = tag.strip().strip('#')
            if tag:
                tags.add(tag.lower())

    # Look for type
    type_match = re.search(r'\*\*Type\*\*:\s*(.+)', content)
    if type_match:
        tags.add(type_match.group(1).strip().lower())

    return list(tags)


def convert_to_obsidian(content: str, title: str, source_path: Path) -> str:
    """
    Convert report to Obsidian-compatible markdown.

    Adds:
    - YAML frontmatter
    - Wikilinks for internal references
    - Tags in frontmatter
    """
    # Extract metadata
    tags = extract_tags_from_content(content)
    date_match = re.search(r'\*\*Date\*\*:\s*(\d{4}-\d{2}-\d{2})', content)
    date = date_match.group(1) if date_match else datetime.now().strftime('%Y-%m-%d')

    source_match = re.search(r'\*\*Source\*\*:\s*(.+)', content)
    source = source_match.group(1).strip() if source_match else ""

    type_dir = source_path.parent.name

    # Build frontmatter
    frontmatter = f"""---
title: "{title.replace('"', "'")}"
date: {date}
type: {type_dir}
source: "{source.replace('"', "'")}"
tags: [{', '.join(tags)}]
created: {datetime.now().isoformat()}
---

"""

    # Convert any markdown links to reports into wikilinks
    # [[report-name]] format
    def convert_link(match):
        link_text = match.group(1)
        link_path = match.group(2)
        if 'reports/' in link_path:
            # Extract just the filename without extension
            filename = Path(link_path).stem
            return f'[[{filename}|{link_text}]]'
        return match.group(0)

    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', convert_link, content)

    return frontmatter + content


def export_to_obsidian(
    output_dir: Path,
    reports: Optional[List[Path]] = None,
    include_structure: bool = True,
) -> Dict[str, Any]:
    """
    Export reports to Obsidian vault format.

    Args:
        output_dir: Target directory for Obsidian vault
        reports: Specific reports to export (None = all)
        include_structure: Create folder structure matching original

    Returns:
        Dict with export statistics
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get reports to export
    if reports is None:
        reports = []
        for category_dir in REPORTS_DIR.iterdir():
            if category_dir.is_dir():
                reports.extend(category_dir.glob("*.md"))

    stats = {
        "exported": 0,
        "failed": 0,
        "output_dir": str(output_dir),
        "files": [],
    }

    for report_path in reports:
        try:
            content = report_path.read_text(encoding="utf-8", errors="replace")

            # Extract title
            title = "Untitled"
            for line in content.split('\n'):
                if line.startswith('# '):
                    title = line[2:].strip()
                    break

            # Convert to Obsidian format
            obsidian_content = convert_to_obsidian(content, title, report_path)

            # Determine output path
            if include_structure:
                category = report_path.parent.name
                target_dir = output_dir / category
                target_dir.mkdir(parents=True, exist_ok=True)
            else:
                target_dir = output_dir

            # Use sanitized title as filename
            safe_title = sanitize_filename(title)
            if not safe_title:
                safe_title = report_path.stem

            target_path = target_dir / f"{safe_title}.md"

            # Handle duplicates
            counter = 1
            while target_path.exists():
                target_path = target_dir / f"{safe_title}_{counter}.md"
                counter += 1

            target_path.write_text(obsidian_content, encoding="utf-8")
            stats["exported"] += 1
            stats["files"].append(str(target_path))

            logger.info(f"Exported: {report_path.name} -> {target_path.name}")

        except Exception as e:
            logger.error(f"Failed to export {report_path}: {e}")
            stats["failed"] += 1

    # Create index note
    if stats["exported"] > 0:
        index_content = f"""---
title: Personal OS Export
date: {datetime.now().strftime('%Y-%m-%d')}
type: index
---

# Personal OS Export

Exported on {datetime.now().strftime('%B %d, %Y at %H:%M')}

## Statistics

- **Total Reports**: {stats['exported']}
- **Categories**: {len(set(Path(f).parent.name for f in stats['files']))}

## Categories

"""
        # Group by category
        by_category: Dict[str, List[str]] = {}
        for file_path in stats["files"]:
            category = Path(file_path).parent.name
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(Path(file_path).stem)

        for category, files in sorted(by_category.items()):
            index_content += f"\n### {category.title()}\n\n"
            for filename in sorted(files)[:10]:  # Limit to 10 per category
                index_content += f"- [[{filename}]]\n"
            if len(files) > 10:
                index_content += f"- ... and {len(files) - 10} more\n"

        (output_dir / "000 - Index.md").write_text(index_content, encoding="utf-8")

    logger.info(f"Export complete: {stats['exported']} files to {output_dir}")
    return stats


def export_single_report_for_notion(report_path: Path) -> Dict[str, Any]:
    """
    Prepare a single report for Notion import.

    Returns structured data suitable for Notion API.
    """
    content = report_path.read_text(encoding="utf-8", errors="replace")
    lines = content.split('\n')

    # Extract metadata
    title = "Untitled"
    for line in lines:
        if line.startswith('# '):
            title = line[2:].strip()
            break

    date_match = re.search(r'\*\*Date\*\*:\s*(\d{4}-\d{2}-\d{2})', content)
    date = date_match.group(1) if date_match else datetime.now().strftime('%Y-%m-%d')

    source_match = re.search(r'\*\*Source\*\*:\s*(.+)', content)
    source = source_match.group(1).strip() if source_match else ""

    type_match = re.search(r'\*\*Type\*\*:\s*(.+)', content)
    content_type = type_match.group(1).strip() if type_match else report_path.parent.name

    tags = extract_tags_from_content(content)

    # Convert content to blocks (simplified)
    blocks = []
    current_block = {"type": "paragraph", "content": ""}

    for line in lines:
        if line.startswith('# '):
            if current_block["content"]:
                blocks.append(current_block)
            blocks.append({"type": "heading_1", "content": line[2:].strip()})
            current_block = {"type": "paragraph", "content": ""}
        elif line.startswith('## '):
            if current_block["content"]:
                blocks.append(current_block)
            blocks.append({"type": "heading_2", "content": line[3:].strip()})
            current_block = {"type": "paragraph", "content": ""}
        elif line.startswith('### '):
            if current_block["content"]:
                blocks.append(current_block)
            blocks.append({"type": "heading_3", "content": line[4:].strip()})
            current_block = {"type": "paragraph", "content": ""}
        elif line.startswith('- ') or line.startswith('* '):
            if current_block["content"]:
                blocks.append(current_block)
            blocks.append({"type": "bulleted_list_item", "content": line[2:].strip()})
            current_block = {"type": "paragraph", "content": ""}
        elif re.match(r'^\d+\.\s', line):
            if current_block["content"]:
                blocks.append(current_block)
            blocks.append({"type": "numbered_list_item", "content": re.sub(r'^\d+\.\s*', '', line)})
            current_block = {"type": "paragraph", "content": ""}
        elif line.startswith('> '):
            if current_block["content"]:
                blocks.append(current_block)
            blocks.append({"type": "quote", "content": line[2:].strip()})
            current_block = {"type": "paragraph", "content": ""}
        elif line.strip():
            current_block["content"] += line + "\n"
        else:
            if current_block["content"]:
                blocks.append(current_block)
                current_block = {"type": "paragraph", "content": ""}

    if current_block["content"]:
        blocks.append(current_block)

    return {
        "title": title,
        "date": date,
        "source": source,
        "type": content_type,
        "tags": tags,
        "blocks": blocks,
        "markdown": content,
    }


def export_for_notion(output_file: Path, reports: Optional[List[Path]] = None) -> Dict[str, Any]:
    """
    Export reports to a JSON file suitable for Notion import.

    The JSON can be used with Notion API or import tools.
    """
    if reports is None:
        reports = []
        for category_dir in REPORTS_DIR.iterdir():
            if category_dir.is_dir():
                reports.extend(category_dir.glob("*.md"))

    exports = []
    stats = {"exported": 0, "failed": 0}

    for report_path in reports:
        try:
            data = export_single_report_for_notion(report_path)
            exports.append(data)
            stats["exported"] += 1
        except Exception as e:
            logger.error(f"Failed to process {report_path}: {e}")
            stats["failed"] += 1

    # Save to JSON
    output_file = Path(output_file)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "exported_at": datetime.now().isoformat(),
            "total_reports": len(exports),
            "reports": exports,
        }, f, indent=2, ensure_ascii=False)

    stats["output_file"] = str(output_file)
    logger.info(f"Notion export complete: {stats['exported']} reports to {output_file}")

    return stats
