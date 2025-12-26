---
description: Export reports to Obsidian vault or Notion-compatible format
---

# Export Reports

Export reports: $ARGUMENTS

## Usage

```
/export obsidian [path]      # Export to Obsidian vault
/export notion [path]        # Export to Notion JSON
/export obsidian ~/vault     # Specific output directory
/export notion ./export.json # Specific output file
```

## Obsidian Export

Exports reports as Obsidian-compatible markdown with:

- **YAML Frontmatter**: title, date, type, source, tags
- **Wikilinks**: Internal report references become `[[links]]`
- **Folder Structure**: Preserves category folders (youtube/, articles/, etc.)
- **Index Note**: Creates `000 - Index.md` with links to all reports

### Output Structure

```
obsidian-vault/
├── 000 - Index.md           # Master index with links
├── youtube/
│   ├── Video Title.md
│   └── Another Video.md
├── articles/
│   └── Article Title.md
├── papers/
│   └── Paper Title.md
└── podcasts/
    └── Episode Title.md
```

### Frontmatter Example

```yaml
---
title: "Building Better Habits"
date: 2024-01-15
type: youtube
source: "https://youtube.com/watch?v=..."
tags: [habits, productivity, self-improvement]
created: 2024-01-15T10:30:00
---
```

## Notion Export

Exports reports as JSON suitable for Notion API or import tools:

```json
{
  "exported_at": "2024-01-15T10:30:00",
  "total_reports": 25,
  "reports": [
    {
      "title": "Building Better Habits",
      "date": "2024-01-15",
      "source": "https://youtube.com/...",
      "type": "youtube",
      "tags": ["habits", "productivity"],
      "blocks": [
        {"type": "heading_1", "content": "Title"},
        {"type": "paragraph", "content": "..."},
        {"type": "bulleted_list_item", "content": "..."}
      ],
      "markdown": "# Full markdown content..."
    }
  ]
}
```

## Steps

### Obsidian Export

1. Parse output path (default: `exports/obsidian/`)
2. Scan all reports in `reports/`
3. For each report:
   - Extract metadata (title, date, source, type)
   - Extract/infer tags
   - Convert internal links to wikilinks
   - Add YAML frontmatter
   - Save with sanitized title as filename
4. Create index note with links
5. Report stats: "Exported 42 reports to ~/obsidian-vault"

### Notion Export

1. Parse output path (default: `exports/notion-export.json`)
2. Scan all reports in `reports/`
3. For each report:
   - Extract metadata
   - Parse content into blocks
   - Structure for Notion API
4. Save as JSON
5. Report stats

## Examples

```bash
# Export to Obsidian vault in home directory
/export obsidian ~/Documents/Obsidian/Personal-OS

# Export to Notion JSON for import
/export notion ./my-export.json

# Quick export with defaults
/export obsidian
/export notion
```

## Default Paths

- Obsidian: `exports/obsidian/`
- Notion: `exports/notion-export.json`

## Obsidian Tips

After export:

1. Open Obsidian and select the exported folder as vault
2. Install recommended plugins:
   - Dataview (for querying reports)
   - Calendar (for date-based navigation)
   - Tag Wrangler (for tag management)
3. Use the index note as a starting point

## Notion Tips

After export:

1. Use Notion API to import the JSON
2. Or use third-party import tools like Notion-py
3. The markdown field can be pasted directly into Notion

## Error Handling

- Invalid path: "Cannot write to [path]. Check permissions."
- No reports: "No reports found to export."
- Write error: "Failed to export [report]: [error]"

## Related

- Reports: `reports/`
- Export service: `web/backend/services/export.py`
