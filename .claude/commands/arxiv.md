---
description: Fetch and analyze an arXiv research paper, explaining it in plain English
---

# Analyze arXiv Research Paper

Fetch and analyze the arXiv paper at: $ARGUMENTS

## Steps

1. **Fetch the paper content** using WebFetch from the arXiv URL provided
   - If URL is abstract page (arxiv.org/abs/...), fetch that
   - Extract title, authors, abstract, and available content
2. If fetch fails:
   - Inform user: "Could not fetch content from arXiv"
   - Suggest: "Try copying the abstract manually to inbox/ and use /analyze"
   - Stop here
3. **Read the analysis prompt** from `prompts/paper.md`
4. **Extract the paper title** from the fetched content
5. **Generate analysis** following the prompt structure exactly
   - Focus on making complex research accessible
   - Use plain English explanations
6. **Save the report** to `reports/papers/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title is the title in lowercase, spaces replaced with hyphens, special chars removed
7. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist
   - Add entry under "## Papers Reviewed" section
   - Format: `- [Title](../reports/papers/filename.md) - HH:MM`
8. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Paper Title]

**Source**: [arXiv URL]
**Authors**: [Author names if available]
**Date**: YYYY-MM-DD
**Type**: Research Paper

---

[Analysis content following prompts/paper.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If URL is not an arXiv URL: Inform user and suggest correct format
- If paper not found: Tell user to verify the paper ID
- If prompts/paper.md missing: Use a basic summary structure
