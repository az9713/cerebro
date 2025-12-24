---
description: Analyze a YouTube video transcript and generate a structured report
---

# Analyze YouTube Video Transcript

Analyze the YouTube video from: $ARGUMENTS

## Step 0: Detect Input Type

Check if `$ARGUMENTS` is a **YouTube URL** or a **file path**:

**YouTube URL patterns:**
- Contains `youtube.com/watch`
- Contains `youtu.be/`
- Contains `youtube.com/shorts/`

**If YouTube URL → Go to Step 1A**
**If file path → Go to Step 1B**

## Step 1A: Fetch Transcript with yt-dlp (URL Input)

Run yt-dlp to download the transcript:

```bash
yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --convert-subs srt -o "inbox/%(title)s" "<URL>"
```

**After running:**
1. Look for the output file in `inbox/` (format: `<video-title>.en.srt`)
2. If successful, note the file path and proceed to Step 2
3. Store the original YouTube URL for the report's Source field

**Error handling:**
- If yt-dlp not found: Tell user "yt-dlp not installed. Install with: pip install yt-dlp"
- If no captions available: Tell user "No English captions found for this video"
- If network error: Tell user "Failed to fetch transcript. Check URL and connection."

## Step 1B: Read Transcript File (File Path Input)

1. **Read the transcript file** at the path provided
2. If file not found: Tell user and suggest checking the path
3. If file is empty: Inform user and ask if they want to proceed

## Step 2: Read Analysis Prompt

Read the analysis prompt from `prompts/yt.md`

## Step 3: Extract Video Title

- From SRT file: Parse the filename (remove `.en.srt` suffix)
- From transcript content: Look for video title in first few lines
- If unclear: Ask user for the title

## Step 4: Generate Analysis

Generate analysis following the prompt structure exactly

## Step 5: Save the Report

Save to `reports/youtube/YYYY-MM-DD_sanitized-title.md` where:
- YYYY-MM-DD is today's date
- sanitized-title is the title in lowercase, spaces replaced with hyphens, special chars removed

## Step 6: Update Activity Log

Update the activity log at `logs/YYYY-MM-DD.md`:
- Create file if it doesn't exist
- Add entry under "## Videos Watched" section
- Format: `- [Title](../reports/youtube/filename.md) - HH:MM`

## Step 7: Confirm to User

Tell user what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Video Title]

**Source**: [YouTube URL or file path]
**Date**: YYYY-MM-DD
**Type**: YouTube Video

---

[Analysis content following prompts/yt.md structure]

---

## My Notes

[Empty space for user notes]
```

## Examples

**From URL:**
```
/yt https://youtube.com/watch?v=abc123
```
→ Fetches transcript to `inbox/Video Title.en.srt`
→ Analyzes and saves report

**From file:**
```
/yt inbox/my-transcript.txt
```
→ Reads file directly
→ Analyzes and saves report
