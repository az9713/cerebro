---
description: Fetch and analyze a web article or blog post from a URL
---

# Analyze Web Article

Fetch and analyze the web article at: $ARGUMENTS

## Steps

1. **Fetch the webpage** using WebFetch from the URL provided
2. If fetch fails:
   - Inform user: "Could not fetch content from this URL"
   - Suggest: "Try copying the content manually to inbox/ and use /analyze"
   - Stop here
3. **Read the analysis prompt** from `prompts/article.md`
4. **Extract the article title** from the page content
5. **Generate analysis** following the prompt structure exactly
6. **Save the report** to `reports/articles/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title is the title in lowercase, spaces replaced with hyphens, special chars removed
7. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist
   - Add entry under "## Articles Read" section
   - Format: `- [Title](../reports/articles/filename.md) - HH:MM`
8. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Article Title]

**Source**: [URL]
**Date**: YYYY-MM-DD
**Type**: Article

---

[Analysis content following prompts/article.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If URL is invalid: Tell user to check the URL format
- If website blocks access: Suggest manual copy method
- If prompts/article.md missing: Use a basic summary structure
