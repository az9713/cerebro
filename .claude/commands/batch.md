---
description: Process multiple items (videos, articles, papers) from a batch list file
---

# Batch Process Multiple Items

Process multiple items from the batch file at: $ARGUMENTS

## Batch File Format

The batch file supports two formats:

### Format 1: Explicit Commands
```
# Lines starting with # are comments (ignored)
# Empty lines are ignored
# Format: COMMAND ARGUMENT

yt inbox/video1.txt
yt https://youtube.com/watch?v=abc123
read https://example.com/article1
arxiv https://arxiv.org/abs/2401.12345
```

### Format 2: Auto-Detect (URLs only)
```
# Just list URLs - type is auto-detected

https://youtube.com/watch?v=abc123
https://youtu.be/def456
https://example.substack.com/p/article
https://arxiv.org/abs/2401.12345
```

**Auto-detection rules:**
- Contains `youtube.com` or `youtu.be` → treat as YouTube video
- Contains `arxiv.org` → treat as arXiv paper
- Other URLs → treat as article

## Steps

1. **Read the batch file** at the path provided
2. If file not found:
   - Inform user: "Batch file not found at [path]"
   - Stop here
3. **Parse the file**:
   - Skip empty lines
   - Skip lines starting with #
   - For each valid line, determine the type:
     - If line starts with `yt`, `read`, `arxiv`, `analyze` → use explicit command
     - If line is a URL → auto-detect type
     - If line is a file path → ask user or treat as generic content
4. **Process each item sequentially**:
   - For YouTube URLs: Run yt-dlp first to fetch transcript, then analyze
   - For `yt` with file path: Read file directly, then analyze
   - For `read`: Follow the /read workflow
   - For `arxiv`: Follow the /arxiv workflow
   - For `analyze`: Follow the /analyze workflow
   - Track successes and failures
5. **After all items processed**, show summary:
   - Total items processed
   - Successful: [count]
   - Failed: [count] (list any failures with reasons)
   - Reports saved to: reports/ subfolders
   - Activity logged to: logs/YYYY-MM-DD.md

## YouTube URL Processing

When a YouTube URL is encountered (either explicit `yt <url>` or auto-detected):

1. Run yt-dlp to fetch transcript:
   ```bash
   yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --convert-subs srt -o "inbox/%(title)s" "<URL>"
   ```
2. Read the downloaded `.en.srt` file from `inbox/`
3. Proceed with normal YouTube analysis workflow

## Error Handling

- If a single item fails, continue with the next item
- Track all failures and report them at the end
- Don't stop the entire batch for one failure
- For yt-dlp errors: Log the failure and continue

**Common yt-dlp errors:**
- yt-dlp not installed → Log: "yt-dlp not found. Install with: pip install yt-dlp"
- No captions → Log: "No English captions found for [URL]"
- Network error → Log: "Failed to fetch transcript for [URL]"

## Example Batch Files

**Mixed explicit commands:**
```
# My reading list for today
yt inbox/saved-transcript.txt
yt https://youtube.com/watch?v=abc123
read https://blog.example.com/article
arxiv https://arxiv.org/abs/2401.12345
```

**URL-only (auto-detect):**
```
# Just paste URLs
https://youtube.com/watch?v=video1
https://youtu.be/video2
https://newsletter.substack.com/p/post
https://arxiv.org/abs/2401.00001
```

## Example Output

```
Batch processing complete!

Processed: 5 items
- Successful: 4
- Failed: 1

Failures:
- https://youtube.com/watch?v=private123 - No English captions found

Reports saved to:
- reports/youtube/ (2 files)
- reports/articles/ (1 file)
- reports/papers/ (1 file)

Transcripts saved to:
- inbox/ (2 files downloaded via yt-dlp)

Activity logged to: logs/2024-12-22.md
```
