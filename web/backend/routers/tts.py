"""TTS Router - Generate audio versions of reports."""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from pathlib import Path

from config import PROJECT_ROOT
from services.tts_service import (
    generate_audio,
    get_available_audio,
    get_voices,
    VOICES,
    DEFAULT_VOICE,
)

router = APIRouter()


class GenerateRequest(BaseModel):
    voice: str = DEFAULT_VOICE
    force_regenerate: bool = False


class AudioInfo(BaseModel):
    voice: str
    description: str
    path: str


class GenerateResponse(BaseModel):
    audio_path: str
    voice: str
    duration_estimate: Optional[int] = None
    cached: bool


class VoiceInfo(BaseModel):
    id: str
    description: str


@router.get("/voices")
async def list_voices():
    """Get available TTS voices."""
    return {
        "voices": [
            VoiceInfo(id=voice_id, description=desc)
            for voice_id, desc in get_voices().items()
        ],
        "default": DEFAULT_VOICE,
    }


@router.post("/{report_id}", response_model=GenerateResponse)
async def generate_report_audio(report_id: int, request: GenerateRequest):
    """
    Generate audio for a report using text-to-speech.

    The audio is cached, so subsequent requests return quickly.
    Set force_regenerate=true to regenerate even if cached.
    """
    result = await generate_audio(
        report_id=report_id,
        voice=request.voice,
        force_regenerate=request.force_regenerate,
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return GenerateResponse(
        audio_path=result["audio_path"],
        voice=result["voice"],
        duration_estimate=result.get("duration_estimate"),
        cached=result["cached"],
    )


@router.get("/{report_id}")
async def get_report_audio(report_id: int):
    """Get available audio versions for a report."""
    available = await get_available_audio(report_id)
    return {"report_id": report_id, "audio_versions": available}


@router.get("/{report_id}/stream/{voice}")
async def stream_audio(report_id: int, voice: str):
    """
    Stream the audio file for a report.

    Returns the MP3 file directly for playback.
    """
    if voice not in VOICES:
        raise HTTPException(status_code=400, detail=f"Invalid voice: {voice}")

    audio_path = PROJECT_ROOT / "audio" / f"report_{report_id}_{voice}.mp3"

    if not audio_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Audio not found. Generate it first using POST."
        )

    return FileResponse(
        path=audio_path,
        media_type="audio/mpeg",
        filename=f"report_{report_id}_{voice}.mp3",
    )
