# OpenAI Whisper API Guide

This guide explains the OpenAI Whisper API for developers who want to add audio transcription to their applications. We'll cover how to transcribe audio files and handle the output.

---

## Table of Contents

1. [What is Whisper?](#what-is-whisper)
2. [Getting Started](#getting-started)
3. [Your First Transcription](#your-first-transcription)
4. [API Parameters](#api-parameters)
5. [Response Formats](#response-formats)
6. [Handling Long Audio](#handling-long-audio)
7. [Translation](#translation)
8. [Error Handling](#error-handling)
9. [Local Whisper vs API](#local-whisper-vs-api)
10. [Best Practices](#best-practices)
11. [This Project's Usage](#this-projects-usage)
12. [Practice Exercises](#practice-exercises)

---

## What is Whisper?

**Whisper** is OpenAI's speech recognition model that converts audio to text. It can:

- Transcribe speech in 99+ languages
- Translate to English
- Handle background noise
- Identify multiple speakers

```
┌──────────────────────────────────────────────────────────────────┐
│                         Your Application                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Audio File (MP3, WAV, M4A, etc.)                                │
│                                                                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                        OpenAI Whisper API                         │
│                     api.openai.com/v1/audio                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Whisper model processes audio → generates text                  │
│                                                                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Your Application                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│   "Hello, this is the transcribed text from the audio..."        │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Use Cases

| Use Case | Description |
|----------|-------------|
| Podcast Transcription | Convert podcast episodes to text |
| Video Subtitles | Generate captions for videos |
| Meeting Notes | Transcribe recorded meetings |
| Voice Notes | Convert voice memos to searchable text |
| Accessibility | Make audio content accessible |

---

## Getting Started

### 1. Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new key
5. Copy the key (starts with `sk-...`)

### 2. Store the Key Safely

```bash
# Add to .env file (NEVER commit this!)
OPENAI_API_KEY=sk-your-key-here
```

### 3. Install the SDK

```bash
pip install openai
```

---

## Your First Transcription

### Using Python SDK

```python
from openai import OpenAI

# Create client (reads OPENAI_API_KEY from environment)
client = OpenAI()

# Open audio file
audio_file = open("audio.mp3", "rb")

# Transcribe
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file
)

print(transcript.text)
```

### Using cURL

```bash
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@audio.mp3" \
  -F model="whisper-1"
```

### Supported File Formats

| Format | Extension | Max Size |
|--------|-----------|----------|
| MP3 | .mp3 | 25 MB |
| MP4 | .mp4 | 25 MB |
| MPEG | .mpeg | 25 MB |
| MPGA | .mpga | 25 MB |
| M4A | .m4a | 25 MB |
| WAV | .wav | 25 MB |
| WebM | .webm | 25 MB |

---

## API Parameters

### Basic Parameters

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",           # Required: model name
    file=audio_file,             # Required: audio file
    language="en",               # Optional: language code (ISO 639-1)
    prompt="",                   # Optional: context/vocabulary hints
    response_format="text",      # Optional: output format
    temperature=0                # Optional: randomness (0-1)
)
```

### Parameter Details

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Always "whisper-1" |
| `file` | file | Audio file (max 25 MB) |
| `language` | string | Language code (e.g., "en", "es", "fr") |
| `prompt` | string | Context text to guide transcription |
| `response_format` | string | Output format (see below) |
| `temperature` | float | 0 for deterministic, 1 for creative |

### Language Codes

Common language codes:

| Code | Language |
|------|----------|
| en | English |
| es | Spanish |
| fr | French |
| de | German |
| it | Italian |
| pt | Portuguese |
| ja | Japanese |
| ko | Korean |
| zh | Chinese |

Full list: ISO 639-1 codes

### Using Prompts

Prompts help with:
- Spelling of names
- Technical vocabulary
- Formatting style

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    prompt="The speakers discuss FastAPI, Anthropic Claude, and Next.js."
)
```

---

## Response Formats

### Plain Text (Default)

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="text"
)

print(transcript.text)
# "Hello, this is the transcribed text..."
```

### JSON

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="json"
)

print(transcript.text)
# "Hello, this is the transcribed text..."
```

### Verbose JSON (with timestamps)

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="verbose_json"
)

print(transcript.text)        # Full text
print(transcript.language)    # Detected language
print(transcript.duration)    # Audio duration
print(transcript.segments)    # List of segments with timestamps
```

Segment structure:
```python
{
    "id": 0,
    "seek": 0,
    "start": 0.0,
    "end": 4.5,
    "text": "Hello and welcome to the show.",
    "tokens": [...],
    "temperature": 0.0,
    "avg_logprob": -0.25,
    "compression_ratio": 1.2,
    "no_speech_prob": 0.01
}
```

### SRT Subtitles

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="srt"
)

print(transcript)
# 1
# 00:00:00,000 --> 00:00:04,500
# Hello and welcome to the show.
#
# 2
# 00:00:04,500 --> 00:00:08,200
# Today we're discussing AI transcription.
```

### VTT Subtitles

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    response_format="vtt"
)

print(transcript)
# WEBVTT
#
# 00:00:00.000 --> 00:00:04.500
# Hello and welcome to the show.
#
# 00:00:04.500 --> 00:00:08.200
# Today we're discussing AI transcription.
```

---

## Handling Long Audio

The API has a 25 MB file size limit. For longer audio:

### Option 1: Compress Audio

```python
import subprocess

def compress_audio(input_path, output_path, bitrate="64k"):
    """Compress audio using FFmpeg."""
    subprocess.run([
        "ffmpeg", "-i", input_path,
        "-b:a", bitrate,
        "-y", output_path
    ], check=True)

compress_audio("large_podcast.mp3", "compressed.mp3", "32k")
```

### Option 2: Split Audio

```python
from pydub import AudioSegment

def split_audio(file_path, chunk_duration_ms=600000):
    """Split audio into chunks (default: 10 minutes)."""
    audio = AudioSegment.from_file(file_path)
    chunks = []

    for i, start in enumerate(range(0, len(audio), chunk_duration_ms)):
        chunk = audio[start:start + chunk_duration_ms]
        chunk_path = f"chunk_{i}.mp3"
        chunk.export(chunk_path, format="mp3")
        chunks.append(chunk_path)

    return chunks

# Split and transcribe each chunk
chunks = split_audio("long_podcast.mp3")
full_transcript = ""

for chunk_path in chunks:
    with open(chunk_path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f
        )
        full_transcript += transcript.text + " "
```

### Option 3: Extract Audio from Video

```python
import subprocess

def extract_audio(video_path, audio_path):
    """Extract audio track from video."""
    subprocess.run([
        "ffmpeg", "-i", video_path,
        "-vn",              # No video
        "-acodec", "mp3",   # MP3 codec
        "-ab", "128k",      # Bitrate
        "-y", audio_path
    ], check=True)

extract_audio("video.mp4", "audio.mp3")
```

---

## Translation

Whisper can translate audio to English:

```python
# Translate Spanish audio to English text
with open("spanish_audio.mp3", "rb") as f:
    translation = client.audio.translations.create(
        model="whisper-1",
        file=f
    )

print(translation.text)
# Output is in English, regardless of input language
```

### Transcription vs Translation

| Endpoint | Input | Output |
|----------|-------|--------|
| `/transcriptions` | Any language | Same language |
| `/translations` | Any language | English only |

---

## Error Handling

### Common Errors

```python
from openai import OpenAI, OpenAIError

client = OpenAI()

try:
    with open("audio.mp3", "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f
        )
except FileNotFoundError:
    print("Audio file not found")
except OpenAIError as e:
    print(f"API error: {e}")
```

### Error Types

| Error | Cause | Solution |
|-------|-------|----------|
| `FileNotFoundError` | File doesn't exist | Check file path |
| `APIError` | General API error | Check response message |
| `RateLimitError` | Too many requests | Add delays |
| `InvalidRequestError` | Bad parameters | Check file format/size |
| `AuthenticationError` | Invalid API key | Check OPENAI_API_KEY |

### File Validation

```python
import os

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
SUPPORTED_FORMATS = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'}

def validate_audio_file(file_path):
    """Validate audio file before upload."""

    # Check existence
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # Check format
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported format: {ext}")

    # Check size
    size = os.path.getsize(file_path)
    if size > MAX_FILE_SIZE:
        raise ValueError(f"File too large: {size / 1024 / 1024:.1f} MB (max 25 MB)")

    return True
```

---

## Local Whisper vs API

### OpenAI Whisper API

**Pros:**
- No GPU required
- Always latest model
- Simple to use
- Scales automatically

**Cons:**
- Costs money per minute
- Requires internet
- 25 MB file limit
- Privacy (audio sent to OpenAI)

### Local Whisper

**Pros:**
- Free (after setup)
- Offline capable
- No file size limit
- Private (data stays local)

**Cons:**
- Requires GPU (or slow on CPU)
- Complex setup
- You manage updates
- Uses local resources

### Running Whisper Locally

```bash
# Install
pip install openai-whisper

# Optional: Install FFmpeg
# Windows: winget install ffmpeg
# Mac: brew install ffmpeg
# Linux: apt install ffmpeg
```

```python
import whisper

# Load model (downloads on first run)
model = whisper.load_model("base")  # tiny, base, small, medium, large

# Transcribe
result = model.transcribe("audio.mp3")
print(result["text"])
```

### Model Sizes

| Model | Parameters | VRAM | Speed |
|-------|------------|------|-------|
| tiny | 39 M | ~1 GB | ~32x |
| base | 74 M | ~1 GB | ~16x |
| small | 244 M | ~2 GB | ~6x |
| medium | 769 M | ~5 GB | ~2x |
| large | 1550 M | ~10 GB | 1x |

---

## Best Practices

### 1. Validate Files First

```python
def transcribe_safely(file_path):
    """Transcribe with validation and error handling."""
    validate_audio_file(file_path)

    with open(file_path, "rb") as f:
        try:
            return client.audio.transcriptions.create(
                model="whisper-1",
                file=f
            )
        except Exception as e:
            print(f"Transcription failed: {e}")
            return None
```

### 2. Use Prompts for Technical Content

```python
# For a programming podcast
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    prompt="Discussion about Python, FastAPI, React, TypeScript, and Claude AI. \
            Technical terms: API, SDK, REST, JSON, async/await."
)
```

### 3. Cache Transcriptions

```python
import hashlib
import json
from pathlib import Path

CACHE_DIR = Path("transcripts_cache")
CACHE_DIR.mkdir(exist_ok=True)

def transcribe_with_cache(file_path):
    """Transcribe with caching to avoid repeat API calls."""
    # Create cache key from file content hash
    with open(file_path, "rb") as f:
        file_hash = hashlib.md5(f.read()).hexdigest()

    cache_file = CACHE_DIR / f"{file_hash}.json"

    if cache_file.exists():
        with open(cache_file) as f:
            return json.load(f)

    # Not cached, transcribe
    with open(file_path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json"
        )

    # Cache result
    cache_data = {
        "text": result.text,
        "language": result.language,
        "duration": result.duration
    }
    with open(cache_file, "w") as f:
        json.dump(cache_data, f)

    return cache_data
```

### 4. Get Timestamps for Long Content

```python
def transcribe_with_timestamps(file_path):
    """Transcribe and return segments with timestamps."""
    with open(file_path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json"
        )

    # Format segments
    formatted = []
    for seg in result.segments:
        formatted.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip()
        })

    return formatted

# Result:
# [
#     {"start": 0.0, "end": 4.5, "text": "Hello and welcome"},
#     {"start": 4.5, "end": 8.2, "text": "Today we discuss..."},
#     ...
# ]
```

### 5. Handle Multiple Languages

```python
def transcribe_detect_language(file_path):
    """Transcribe and detect language."""
    with open(file_path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json"
        )

    return {
        "text": result.text,
        "language": result.language,  # Detected language code
        "duration": result.duration
    }
```

---

## This Project's Usage

### YouTube Video Workflow

For YouTube videos, this project primarily uses:
1. **yt-dlp** to download auto-generated captions (SRT format)
2. **Whisper API** as fallback when no captions available

```python
# services/content_fetcher.py (simplified)
import subprocess
from pathlib import Path

async def get_youtube_transcript(video_url: str) -> str:
    """Get transcript from YouTube video."""

    # Try to get auto-captions first (free, instant)
    try:
        result = subprocess.run([
            "yt-dlp",
            "--write-auto-sub",
            "--sub-lang", "en",
            "--skip-download",
            "--output", "temp/%(id)s",
            video_url
        ], capture_output=True, text=True)

        # Find the subtitle file
        srt_file = find_srt_file("temp/")
        if srt_file:
            return parse_srt_to_text(srt_file)
    except Exception:
        pass

    # Fallback: Download audio and use Whisper
    audio_path = await download_audio(video_url)
    transcript = await transcribe_audio(audio_path)
    return transcript

async def transcribe_audio(file_path: str) -> str:
    """Transcribe audio file using Whisper API."""
    from openai import OpenAI

    client = OpenAI()

    with open(file_path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="text"
        )

    return result.text
```

### Podcast Analysis

```python
async def analyze_podcast(audio_url: str):
    """Download and analyze podcast audio."""

    # Download audio
    audio_path = await download_audio(audio_url)

    # Transcribe
    transcript = await transcribe_audio(audio_path)

    # Analyze with Claude
    analysis = await analyze_content(transcript, content_type="podcast")

    return analysis
```

---

## Practice Exercises

### Exercise 1: Basic Transcription

Write a script that:
1. Takes an audio file path as argument
2. Transcribes it using Whisper API
3. Saves the transcript to a text file

### Exercise 2: Subtitle Generator

Create a function that:
1. Takes a video file path
2. Extracts audio using FFmpeg
3. Generates SRT subtitles
4. Returns the SRT content

### Exercise 3: Long Audio Handler

Build a pipeline that:
1. Checks if audio exceeds 25 MB
2. Splits into chunks if needed
3. Transcribes each chunk
4. Merges transcripts

### Exercise 4: Language Detector

Create a function that:
1. Transcribes audio
2. Detects the language
3. Optionally translates to English
4. Returns both original and translation

### Exercise 5: Transcript Search

Build a tool that:
1. Transcribes audio with timestamps
2. Allows searching for keywords
3. Returns matching segments with time codes

---

## Summary

| Concept | What It Does |
|---------|-------------|
| `client.audio.transcriptions.create()` | Transcribe audio to text |
| `client.audio.translations.create()` | Translate audio to English |
| `model="whisper-1"` | The Whisper model to use |
| `language="en"` | Hint the audio language |
| `prompt` | Vocabulary/context hints |
| `response_format` | Output format (text, json, srt, vtt) |
| `verbose_json` | Get timestamps and segments |

---

## Quick Reference

### Basic Transcription

```python
from openai import OpenAI

client = OpenAI()

with open("audio.mp3", "rb") as f:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=f
    )

print(transcript.text)
```

### With Timestamps

```python
with open("audio.mp3", "rb") as f:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=f,
        response_format="verbose_json"
    )

for segment in transcript.segments:
    print(f"[{segment['start']:.1f}s] {segment['text']}")
```

### Generate Subtitles

```python
with open("audio.mp3", "rb") as f:
    srt = client.audio.transcriptions.create(
        model="whisper-1",
        file=f,
        response_format="srt"
    )

with open("subtitles.srt", "w") as f:
    f.write(srt)
```

### Translate to English

```python
with open("french_audio.mp3", "rb") as f:
    translation = client.audio.translations.create(
        model="whisper-1",
        file=f
    )

print(translation.text)  # English text
```

---

## Congratulations!

You've completed the Personal OS learning path! You now understand:

1. **Python** - For backend development
2. **JavaScript/TypeScript** - For frontend development
3. **REST APIs** - How frontend and backend communicate
4. **Async Programming** - Handling concurrent operations
5. **React** - Building user interfaces
6. **Next.js** - Full-stack React applications
7. **FastAPI** - Building Python APIs
8. **Anthropic Claude API** - AI text generation
9. **OpenAI Whisper API** - Audio transcription

You're ready to contribute to and extend this project!

---

*OpenAI Whisper API Guide - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
