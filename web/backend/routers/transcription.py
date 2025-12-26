"""Transcription router - audio transcription endpoints."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import tempfile
from pathlib import Path
import shutil

from services.transcription import (
    transcribe_audio,
    transcribe_url,
    check_whisper_availability,
    TranscriptionError,
    AUDIO_FORMATS,
)

router = APIRouter()


class TranscribeUrlRequest(BaseModel):
    url: str
    use_api: bool = True
    local_model: str = "base"


class TranscriptionResponse(BaseModel):
    transcript: str
    title: str
    duration_hint: Optional[str] = None


@router.get("/status")
async def get_transcription_status():
    """Check Whisper availability (API and local)."""
    status = await check_whisper_availability()
    return {
        "openai_api": status["api"],
        "local_whisper": status["local"],
        "api_key_configured": status["api_key_set"],
        "supported_formats": list(AUDIO_FORMATS),
    }


@router.post("/url", response_model=TranscriptionResponse)
async def transcribe_from_url(request: TranscribeUrlRequest):
    """
    Transcribe audio from a URL (YouTube, podcast, etc.).

    The URL will be downloaded using yt-dlp, then transcribed with Whisper.
    """
    try:
        transcript, title = await transcribe_url(
            url=request.url,
            use_api=request.use_api,
            local_model=request.local_model,
            keep_audio=False,
        )

        return TranscriptionResponse(
            transcript=transcript,
            title=title,
        )

    except TranscriptionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/file", response_model=TranscriptionResponse)
async def transcribe_uploaded_file(
    file: UploadFile = File(...),
    use_api: bool = Form(True),
    local_model: str = Form("base"),
):
    """
    Transcribe an uploaded audio file.

    Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg, flac
    """
    # Validate file extension
    suffix = Path(file.filename).suffix.lower() if file.filename else ""
    if suffix not in AUDIO_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {suffix}. Supported: {', '.join(AUDIO_FORMATS)}"
        )

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = Path(tmp.name)

    try:
        transcript = await transcribe_audio(
            audio_path=tmp_path,
            use_api=use_api,
            local_model=local_model,
        )

        title = Path(file.filename).stem if file.filename else "Uploaded Audio"

        return TranscriptionResponse(
            transcript=transcript,
            title=title,
        )

    except TranscriptionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        # Clean up temp file
        if tmp_path.exists():
            tmp_path.unlink()
