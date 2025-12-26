"""
Text-to-Speech Service - Generate audio versions of reports.

Uses OpenAI's TTS API to convert report summaries to audio.
"""

import os
import logging
import hashlib
from pathlib import Path
from typing import Optional

import httpx

from config import PROJECT_ROOT
from database import get_report_by_id

logger = logging.getLogger(__name__)

# Audio cache directory
AUDIO_DIR = PROJECT_ROOT / "audio"
AUDIO_DIR.mkdir(exist_ok=True)

# OpenAI TTS settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TTS_API_URL = "https://api.openai.com/v1/audio/speech"

# Available voices
VOICES = {
    "alloy": "Neutral and balanced",
    "echo": "Warm and conversational",
    "fable": "Expressive and dynamic",
    "onyx": "Deep and authoritative",
    "nova": "Friendly and upbeat",
    "shimmer": "Clear and calm",
}

DEFAULT_VOICE = "nova"


def get_audio_path(report_id: int, voice: str) -> Path:
    """Get the audio file path for a report."""
    return AUDIO_DIR / f"report_{report_id}_{voice}.mp3"


def extract_summary_text(content: str, max_chars: int = 4000) -> str:
    """
    Extract the most important parts of a report for TTS.

    Prioritizes: title, executive summary, key takeaways.
    """
    lines = content.split('\n')
    sections = []
    current_section = []
    current_header = ""

    for line in lines:
        if line.startswith('# '):
            if current_section:
                sections.append((current_header, '\n'.join(current_section)))
            current_header = line[2:].strip()
            current_section = []
        elif line.startswith('## '):
            if current_section:
                sections.append((current_header, '\n'.join(current_section)))
            current_header = line[3:].strip()
            current_section = []
        else:
            current_section.append(line)

    if current_section:
        sections.append((current_header, '\n'.join(current_section)))

    # Prioritize sections
    priority_keywords = [
        'summary', 'executive', 'takeaway', 'key', 'main', 'insight', 'conclusion'
    ]

    priority_sections = []
    other_sections = []

    for header, text in sections:
        header_lower = header.lower()
        if any(kw in header_lower for kw in priority_keywords):
            priority_sections.append((header, text))
        else:
            other_sections.append((header, text))

    # Build output
    output_parts = []
    total_chars = 0

    # Add title first
    if sections and sections[0][0]:
        title = sections[0][0]
        output_parts.append(title)
        total_chars += len(title)

    # Add priority sections
    for header, text in priority_sections:
        section_text = f"\n\n{header}.\n{text}"
        if total_chars + len(section_text) > max_chars:
            break
        output_parts.append(section_text)
        total_chars += len(section_text)

    # Fill with other sections if space
    for header, text in other_sections:
        if header in ['My Notes', 'Source', 'Date', 'Type']:
            continue
        section_text = f"\n\n{header}.\n{text}"
        if total_chars + len(section_text) > max_chars:
            break
        output_parts.append(section_text)
        total_chars += len(section_text)

    return ''.join(output_parts).strip()


def clean_for_speech(text: str) -> str:
    """Clean text for better TTS output."""
    import re

    # Remove markdown formatting
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Bold
    text = re.sub(r'\*([^*]+)\*', r'\1', text)  # Italic
    text = re.sub(r'`([^`]+)`', r'\1', text)  # Code
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # Links

    # Remove bullet points but keep content
    text = re.sub(r'^[\-\*] ', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\. ', '', text, flags=re.MULTILINE)

    # Remove checkboxes
    text = re.sub(r'\[[ x]\] ', '', text)

    # Clean up extra whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()

    return text


async def generate_audio(
    report_id: int,
    voice: str = DEFAULT_VOICE,
    force_regenerate: bool = False,
) -> dict:
    """
    Generate audio for a report.

    Args:
        report_id: The report ID
        voice: TTS voice to use
        force_regenerate: Regenerate even if cached

    Returns:
        Dict with audio file path and metadata
    """
    if not OPENAI_API_KEY:
        return {"error": "OPENAI_API_KEY not set. Add it to web/backend/.env"}

    if voice not in VOICES:
        voice = DEFAULT_VOICE

    audio_path = get_audio_path(report_id, voice)

    # Check cache
    if audio_path.exists() and not force_regenerate:
        return {
            "audio_path": str(audio_path.relative_to(PROJECT_ROOT)),
            "voice": voice,
            "cached": True,
        }

    # Get report
    report = await get_report_by_id(report_id)
    if not report:
        return {"error": f"Report {report_id} not found"}

    content = report.get("content", "")
    if not content:
        return {"error": "Report has no content"}

    # Extract and clean text
    summary = extract_summary_text(content)
    speech_text = clean_for_speech(summary)

    if len(speech_text) < 50:
        return {"error": "Not enough content to generate audio"}

    try:
        # Call OpenAI TTS API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                TTS_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "tts-1",
                    "input": speech_text,
                    "voice": voice,
                    "response_format": "mp3",
                },
                timeout=60.0,
            )

            if response.status_code != 200:
                logger.error(f"TTS API error: {response.status_code} - {response.text}")
                return {"error": f"TTS API error: {response.status_code}"}

            # Save audio file
            audio_path.write_bytes(response.content)

            return {
                "audio_path": str(audio_path.relative_to(PROJECT_ROOT)),
                "voice": voice,
                "duration_estimate": len(speech_text) // 15,  # Rough estimate: 15 chars/sec
                "cached": False,
            }

    except Exception as e:
        logger.exception(f"TTS generation failed: {e}")
        return {"error": str(e)}


async def get_available_audio(report_id: int) -> list[dict]:
    """Get all available audio versions for a report."""
    available = []

    for voice in VOICES:
        audio_path = get_audio_path(report_id, voice)
        if audio_path.exists():
            available.append({
                "voice": voice,
                "description": VOICES[voice],
                "path": str(audio_path.relative_to(PROJECT_ROOT)),
            })

    return available


def get_voices() -> dict:
    """Get available TTS voices."""
    return VOICES
