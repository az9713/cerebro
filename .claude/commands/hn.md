---
description: Analyze a Hacker News post and its discussion
---

# Analyze Hacker News Post

Analyze the Hacker News post: $ARGUMENTS

## Steps

1. **Parse the HN URL**:
   - Accept URLs like `news.ycombinator.com/item?id=XXXXX`
   - Extract the item ID
2. **Fetch the HN post** using WebFetch or HN API:
   - Get the post title, link, and points
   - Get top comments (aim for top 20-30 comments)
3. **If post links to content**: Also fetch the linked article/project
4. If fetching fails:
   - Inform user: "Could not fetch HN post content"
   - Suggest checking URL format
   - Stop here
5. **Read the analysis prompt** from `prompts/hn.md`
6. **Extract post metadata**:
   - Title, author, points
   - Post type (Show HN, Ask HN, etc.)
   - Number of comments
7. **Generate analysis** covering both linked content AND discussion
8. **Create output directory** `reports/hackernews/` if needed
9. **Save the report** to `reports/hackernews/YYYY-MM-DD_sanitized-title.md`
10. **Update the activity log** at `logs/YYYY-MM-DD.md`:
    - Add entry under "## HN Discussions" section (create if needed)
    - Format: `- [Title](../reports/hackernews/filename.md) - HH:MM`
11. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Post Title]

**Source**: [HN URL]
**Linked Content**: [Original URL if any]
**Points**: [Score]
**Comments**: [Count]
**Date**: YYYY-MM-DD
**Type**: Hacker News Discussion

---

[Analysis content following prompts/hn.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If URL format wrong: Suggest correct HN URL format
- If post deleted: Inform user
- If comments fail to load: Analyze post only, note limited discussion
- If prompts/hn.md missing: Use prompts/default.md
