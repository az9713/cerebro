---
description: Analyze any content file (video transcript, article, notes, etc.)
---

# Analyze Generic Content

Analyze the content file at: $ARGUMENTS

## Steps

1. **Read the content file** at the path provided
2. If file not found:
   - Inform user: "File not found at [path]"
   - Suggest checking the path
   - Stop here
3. **Ask the user** for:
   - A title for this content
   - Category: video, article, paper, or other
4. **Read the appropriate analysis prompt**:
   - If video: `prompts/yt.md`
   - If article: `prompts/article.md`
   - If paper: `prompts/paper.md`
   - If other: `prompts/default.md`
5. **Generate analysis** following the prompt structure exactly
6. **Save the report** to `reports/{category}/YYYY-MM-DD_sanitized-title.md` where:
   - {category} is youtube, articles, papers, or other
   - YYYY-MM-DD is today's date
   - sanitized-title is the title in lowercase, spaces replaced with hyphens, special chars removed
7. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist
   - Add entry under appropriate section based on category
   - Format: `- [Title](../reports/{category}/filename.md) - HH:MM`
8. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Title]

**Source**: [File path]
**Date**: YYYY-MM-DD
**Type**: [Category]

---

[Analysis content following appropriate prompt structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If file is empty: Inform user and ask if they want to proceed
- If prompt file missing: Use prompts/default.md or basic structure
