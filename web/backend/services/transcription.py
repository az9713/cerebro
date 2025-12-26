"""Audio transcription service using Whisper (API or local)."""

import asyncio
import subprocess
import logging
import os
import tempfile
from pathlib import Path
from typing import Optional, Tuple
import httpx

from config import INBOX_DIR, PROJECT_ROOT

logger = logging.getLogger(__name__)

# OpenAI API configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_URL = "https://api.openai.com/v1/audio/transcriptions"

# Supported audio formats
AUDIO_FORMATS = {".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".wav", ".webm", ".ogg", ".flac"}


class TranscriptionError(Exception):
    """Error during transcription process."""
    pass


def _download_audio_sync(url: str, output_path: Path) -> Tuple[int, str, str]:
    """Download audio from URL using yt-dlp (sync for thread pool)."""
    result = subprocess.run(
        [
            "yt-dlp",
            "-x",  # Extract audio
            "--audio-format", "mp3",
            "--audio-quality", "0",  # Best quality
            "-o", str(output_path),
            url,
        ],
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
    )
    return result.returncode, result.stdout, result.stderr


async def download_audio(url: str, filename: Optional[str] = None) -> Path:
    """
    Download audio from a URL (YouTube, podcast, etc.) using yt-dlp.

    Args:
        url: URL to download audio from
        filename: Optional custom filename (without extension)

    Returns:
        Path to downloaded audio file

    Raises:
        TranscriptionError: If download fails
    """
    INBOX_DIR.mkdir(parents=True, exist_ok=True)

    if filename:
        output_path = INBOX_DIR / f"{filename}.%(ext)s"
    else:
        output_path = INBOX_DIR / "%(title)s.%(ext)s"

    logger.info(f"Downloading audio from: {url}")

    returncode, stdout, stderr = await asyncio.to_thread(
        _download_audio_sync, url, output_path
    )

    if returncode != 0:
        if "yt-dlp" in stderr.lower() or "not found" in stderr.lower():
            raise TranscriptionError("yt-dlp not installed. Install with: pip install yt-dlp")
        raise TranscriptionError(f"Audio download failed: {stderr[:200]}")

    # Find the downloaded audio file
    audio_files = list(INBOX_DIR.glob("*.mp3")) + list(INBOX_DIR.glob("*.m4a"))
    if not audio_files:
        raise TranscriptionError("No audio file found after download")

    # Get most recently modified
    audio_file = max(audio_files, key=lambda f: f.stat().st_mtime)
    logger.info(f"Downloaded audio: {audio_file.name}")

    return audio_file


async def transcribe_with_openai_api(audio_path: Path) -> str:
    """
    Transcribe audio using OpenAI Whisper API.

    Args:
        audio_path: Path to audio file

    Returns:
        Transcribed text

    Raises:
        TranscriptionError: If transcription fails
    """
    if not OPENAI_API_KEY:
        raise TranscriptionError(
            "OpenAI API key not configured. Set OPENAI_API_KEY in .env file."
        )

    # Check file size (OpenAI limit is 25MB)
    file_size = audio_path.stat().st_size
    if file_size > 25 * 1024 * 1024:
        raise TranscriptionError(
            f"Audio file too large ({file_size / 1024 / 1024:.1f}MB). "
            "OpenAI API limit is 25MB. Consider splitting the audio."
        )

    logger.info(f"Transcribing with OpenAI Whisper API: {audio_path.name}")

    async with httpx.AsyncClient(timeout=300.0) as client:
        with open(audio_path, "rb") as f:
            files = {"file": (audio_path.name, f, "audio/mpeg")}
            data = {
                "model": "whisper-1",
                "language": "en",
                "response_format": "text",
            }

            response = await client.post(
                OPENAI_API_URL,
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                files=files,
                data=data,
            )

    if response.status_code != 200:
        raise TranscriptionError(f"OpenAI API error: {response.text[:200]}")

    transcript = response.text.strip()
    logger.info(f"Transcription complete: {len(transcript)} characters")

    return transcript


def _run_local_whisper_sync(audio_path: Path, model: str = "base") -> Tuple[int, str, str]:
    """Run local Whisper transcription (sync for thread pool)."""
    result = subprocess.run(
        [
            "whisper",
            str(audio_path),
            "--model", model,
            "--language", "en",
            "--output_format", "txt",
            "--output_dir", str(audio_path.parent),
        ],
        capture_output=True,
        text=True,
    )
    return result.returncode, result.stdout, result.stderr


async def transcribe_with_local_whisper(
    audio_path: Path,
    model: str = "base"
) -> str:
    """
    Transcribe audio using local Whisper installation.

    Args:
        audio_path: Path to audio file
        model: Whisper model size (tiny, base, small, medium, large)

    Returns:
        Transcribed text

    Raises:
        TranscriptionError: If transcription fails
    """
    logger.info(f"Transcribing with local Whisper ({model}): {audio_path.name}")

    returncode, stdout, stderr = await asyncio.to_thread(
        _run_local_whisper_sync, audio_path, model
    )

    if returncode != 0:
        if "whisper" in stderr.lower() and "not found" in stderr.lower():
            raise TranscriptionError(
                "Local Whisper not installed. Install with: pip install openai-whisper"
            )
        raise TranscriptionError(f"Local Whisper failed: {stderr[:200]}")

    # Read the output text file
    txt_path = audio_path.with_suffix(".txt")
    if not txt_path.exists():
        raise TranscriptionError("Whisper output file not found")

    transcript = txt_path.read_text(encoding="utf-8").strip()
    logger.info(f"Transcription complete: {len(transcript)} characters")

    return transcript


async def transcribe_audio(
    audio_path: Path,
    use_api: bool = True,
    local_model: str = "base"
) -> str:
    """
    Transcribe audio file using Whisper (API or local).

    Args:
        audio_path: Path to audio file
        use_api: If True, use OpenAI API; if False, use local Whisper
        local_model: Model size for local Whisper

    Returns:
        Transcribed text
    """
    if not audio_path.exists():
        raise TranscriptionError(f"Audio file not found: {audio_path}")

    if audio_path.suffix.lower() not in AUDIO_FORMATS:
        raise TranscriptionError(
            f"Unsupported audio format: {audio_path.suffix}. "
            f"Supported: {', '.join(AUDIO_FORMATS)}"
        )

    if use_api and OPENAI_API_KEY:
        return await transcribe_with_openai_api(audio_path)
    else:
        return await transcribe_with_local_whisper(audio_path, local_model)


async def transcribe_url(
    url: str,
    use_api: bool = True,
    local_model: str = "base",
    keep_audio: bool = False
) -> Tuple[str, str]:
    """
    Download and transcribe audio from a URL.

    Args:
        url: URL to audio/video content
        use_api: If True, use OpenAI API; if False, use local Whisper
        local_model: Model size for local Whisper
        keep_audio: If True, don't delete the downloaded audio file

    Returns:
        Tuple of (transcript_text, audio_title)
    """
    # Download audio
    audio_path = await download_audio(url)
    title = audio_path.stem

    try:
        # Transcribe
        transcript = await transcribe_audio(audio_path, use_api, local_model)
        return transcript, title
    finally:
        # Clean up audio file unless requested to keep
        if not keep_audio and audio_path.exists():
            try:
                audio_path.unlink()
                logger.info(f"Cleaned up audio file: {audio_path.name}")
            except Exception as e:
                logger.warning(f"Failed to clean up audio file: {e}")


async def check_whisper_availability() -> dict:
    """
    Check which Whisper options are available.

    Returns:
        Dict with 'api' and 'local' availability status
    """
    result = {"api": False, "local": False, "api_key_set": bool(OPENAI_API_KEY)}

    # Check API availability
    if OPENAI_API_KEY:
        result["api"] = True

    # Check local Whisper
    try:
        proc = await asyncio.to_thread(
            subprocess.run,
            ["whisper", "--help"],
            capture_output=True,
            text=True,
        )
        result["local"] = proc.returncode == 0
    except FileNotFoundError:
        result["local"] = False

    return result
