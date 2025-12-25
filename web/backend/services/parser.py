"""Markdown parsing utilities for extracting metadata from reports."""

import re
from typing import Optional
from datetime import datetime


def parse_report_markdown(content: str) -> dict:
    """
    Parse a report markdown file and extract metadata.

    Expected format:
    # Title

    **Source**: URL
    **Date**: YYYY-MM-DD
    **Type**: YouTube Video / Article / Research Paper / Other

    ---

    ## 1. Summary
    Content...

    Returns dict with: title, source, date, type, summary, text_content
    """
    result = {
        "title": "",
        "source": None,
        "date": None,
        "type": None,
        "summary": None,
        "text_content": "",
    }

    lines = content.split("\n")

    # Extract title (first H1)
    for line in lines:
        if line.startswith("# "):
            result["title"] = line[2:].strip()
            break

    # Extract metadata fields
    source_match = re.search(r"\*\*Source\*\*:\s*(.+)", content)
    if source_match:
        result["source"] = source_match.group(1).strip()

    date_match = re.search(r"\*\*Date\*\*:\s*(\d{4}-\d{2}-\d{2})", content)
    if date_match:
        result["date"] = date_match.group(1)

    type_match = re.search(r"\*\*Type\*\*:\s*(.+)", content)
    if type_match:
        result["type"] = type_match.group(1).strip()

    # Extract summary (content under ## 1. Summary or ## Summary)
    summary_match = re.search(
        r"##\s*(?:1\.\s*)?Summary\s*\n+(.*?)(?=\n##|\n---|\Z)",
        content,
        re.DOTALL | re.IGNORECASE
    )
    if summary_match:
        summary_text = summary_match.group(1).strip()
        # Take first paragraph (up to 500 chars)
        first_para = summary_text.split("\n\n")[0]
        result["summary"] = first_para[:500] if len(first_para) > 500 else first_para

    # Get full text content (for search indexing)
    # Strip markdown formatting for cleaner search
    text_content = content
    # Remove markdown links but keep text
    text_content = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text_content)
    # Remove markdown formatting
    text_content = re.sub(r"[*_`#>]", "", text_content)
    # Collapse whitespace
    text_content = re.sub(r"\s+", " ", text_content).strip()

    result["text_content"] = text_content

    return result


def parse_date_from_filename(filename: str) -> Optional[datetime]:
    """
    Extract date from filename like '2025-12-23_title.md'.

    Returns datetime or None if parsing fails.
    """
    match = re.match(r"(\d{4}-\d{2}-\d{2})_", filename)
    if match:
        try:
            return datetime.strptime(match.group(1), "%Y-%m-%d")
        except ValueError:
            pass
    return None


def parse_activity_log(content: str) -> dict:
    """
    Parse an activity log markdown file.

    Expected format:
    # Activity Log - YYYY-MM-DD

    ## Videos Watched
    - [Title](../reports/youtube/filename.md) - HH:MM

    ## Articles Read
    ...

    Returns dict with: date, videos, articles, papers, other
    """
    result = {
        "date": None,
        "videos": [],
        "articles": [],
        "papers": [],
        "other": [],
    }

    # Extract date from header
    date_match = re.search(r"#\s*Activity Log\s*-\s*(\d{4}-\d{2}-\d{2})", content)
    if date_match:
        result["date"] = date_match.group(1)

    # Parse each section
    sections = {
        "Videos Watched": "videos",
        "Articles Read": "articles",
        "Papers Reviewed": "papers",
        "Other": "other",
    }

    for section_name, key in sections.items():
        # Find section content
        pattern = rf"##\s*{re.escape(section_name)}\s*\n(.*?)(?=\n##|\Z)"
        match = re.search(pattern, content, re.DOTALL)

        if match:
            section_content = match.group(1)
            # Parse entries: - [Title](path) - HH:MM
            entry_pattern = r"-\s*\[([^\]]+)\]\(([^)]+)\)\s*-\s*(\d{1,2}:\d{2})"

            for entry_match in re.finditer(entry_pattern, section_content):
                result[key].append({
                    "title": entry_match.group(1),
                    "report_path": entry_match.group(2),
                    "time": entry_match.group(3),
                })

    return result
