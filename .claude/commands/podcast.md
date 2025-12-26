---
description: Analyze a podcast episode (transcript file or audio URL)
---

# Analyze Podcast Episode

Analyze the podcast episode: $ARGUMENTS

## Supported Inputs

- **Transcript file**: `.txt`, `.srt`, `.md` file with episode transcript
- **Audio URL**: Direct audio link or podcast platform URL (will be transcribed)
- **Audio file**: `.mp3`, `.m4a`, `.wav` file (will be transcribed)

## Steps

1. **Determine input type**:
   - If file path with text extension: Read transcript directly
   - If audio file path (`.mp3`, `.m4a`, etc.): Transcribe with Whisper
   - If URL provided: Download and transcribe audio with Whisper
   - Ask user for input if not provided

2. **For audio transcription** (URLs or audio files):
   - Use yt-dlp to download audio (supports many podcast platforms)
   - Transcribe using OpenAI Whisper API (requires OPENAI_API_KEY in .env)
   - Fallback to local Whisper if available
   - Note: Transcription may take a few minutes for long episodes

3. **For transcript files**:
   - Verify file exists and is readable
   - Read the transcript content
   - Parse SRT format if applicable

4. If content retrieval fails:
   - Inform user about the issue
   - For audio: Check OPENAI_API_KEY is set
   - For files: Suggest checking file path
   - Stop here

5. **Read the analysis prompt** from `prompts/podcast.md`
6. **Extract episode metadata** from content:
   - Podcast name
   - Episode title
   - Host(s) and guest(s)
   - Duration if mentioned
7. **Generate analysis** following the prompt structure exactly
8. **Create output directory** `reports/podcasts/` if needed
9. **Save the report** to `reports/podcasts/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title from episode title, lowercase, spaces→hyphens, max 50 chars
10. **Update the activity log** at `logs/YYYY-MM-DD.md`:
    - Create file if it doesn't exist
    - Add entry under "## Podcasts Listened" section (create if needed)
    - Format: `- [Title](../reports/podcasts/filename.md) - HH:MM`
11. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Episode Title]

**Podcast**: [Show Name]
**Host(s)**: [Names]
**Guest(s)**: [Names if any]
**Source**: [file path or URL]
**Date**: YYYY-MM-DD
**Type**: Podcast Episode

---

[Analysis content following prompts/podcast.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If file doesn't exist: Tell user to check path
- If transcript too short: Note limited content but analyze
- If no speaker identification: Do best effort analysis
- If prompts/podcast.md missing: Use prompts/default.md
- If audio download fails: Check yt-dlp is installed (`pip install yt-dlp`)
- If transcription fails: Check OPENAI_API_KEY is configured in .env
- If audio file too large: OpenAI API limit is 25MB, suggest splitting

## Examples

```
/podcast inbox/episode-transcript.txt
/podcast https://www.youtube.com/watch?v=abc123
/podcast https://podcasts.apple.com/podcast/episode
/podcast inbox/episode.mp3
```

## Requirements for Audio

- yt-dlp for downloading audio (`pip install yt-dlp`)
- OpenAI API key for transcription (set OPENAI_API_KEY in web/backend/.env)
- Alternatively: Local Whisper installation (`pip install openai-whisper`)
