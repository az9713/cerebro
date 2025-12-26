---
description: Analyze a Twitter/X thread from a URL or thread content
---

# Analyze Twitter/X Thread

Analyze the Twitter/X thread: $ARGUMENTS

## Steps

1. **Get the thread content**:
   - If URL provided: Fetch using WebFetch (try nitter.net mirror if twitter.com/x.com fails)
   - If text content provided: Use directly
   - Ask user for URL or content if not provided
2. If fetch fails:
   - Inform user: "Could not fetch thread content from this URL"
   - Suggest: "Try copying the thread text manually and running /thread with the text"
   - Stop here
3. **Read the analysis prompt** from `prompts/thread.md`
4. **Extract thread metadata**:
   - Author handle and name
   - Thread topic
   - Number of tweets
5. **Generate analysis** following the prompt structure exactly
6. **Create output directory** `reports/threads/` if needed
7. **Save the report** to `reports/threads/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title is from the topic, lowercase, spaces→hyphens, max 50 chars
8. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist
   - Add entry under "## Threads Read" section (create if needed)
   - Format: `- [Title](../reports/threads/filename.md) - HH:MM`
9. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Thread Topic/Title]

**Source**: [URL or "Manual Input"]
**Author**: [@handle]
**Date**: YYYY-MM-DD
**Type**: Twitter/X Thread

---

[Analysis content following prompts/thread.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If URL is invalid: Suggest correct format or manual copy
- If thread is too short: Still analyze but note limited content
- If prompts/thread.md missing: Use prompts/default.md
