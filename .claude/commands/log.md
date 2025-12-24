---
description: Display today's activity log showing all content processed
---

# Show Today's Activity Log

Display the activity log for today.

## Steps

1. **Determine today's date** in YYYY-MM-DD format
2. **Check if log file exists** at `logs/YYYY-MM-DD.md`
3. If file doesn't exist:
   - Say: "No activity logged today yet."
   - Optionally mention: "Use /yt, /read, /arxiv, or /analyze to process content."
   - Stop here
4. If file exists:
   - **Read the log file**
   - **Display the contents** to the user in a readable format

## Log File Format

The log file typically looks like:
```markdown
# Activity Log: YYYY-MM-DD

## Videos Watched
- [Video Title](../reports/youtube/filename.md) - 14:32
- [Another Video](../reports/youtube/filename2.md) - 16:45

## Articles Read
- [Article Title](../reports/articles/filename.md) - 10:15

## Papers Reviewed
- [Paper Title](../reports/papers/filename.md) - 11:30
```

## Optional Arguments

If the user provides a date as argument (e.g., `/log 2024-12-20`), show that day's log instead of today's.

## Error Handling

- If specified date's log doesn't exist: "No activity logged for [date]."
