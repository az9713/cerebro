"""Analysis router - trigger analysis jobs and stream progress."""

import uuid
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sse_starlette.sse import EventSourceResponse

from models import AnalysisRequest, AnalysisJob
from database import create_job, get_job
from config import ANTHROPIC_API_KEY, MODELS
from services.analyzer import run_full_analysis

router = APIRouter()


async def run_analysis_background(
    job_id: str,
    url: str,
    content_type: str,
    model: str
):
    """Background task to run analysis."""
    async for _ in run_full_analysis(url, content_type, model, job_id):
        pass  # Consume the generator in background mode


@router.get("/status")
async def check_status():
    """Check if API is ready (has API key configured)."""
    has_key = bool(ANTHROPIC_API_KEY)
    return {
        "api_ready": has_key,
        "message": "Ready" if has_key else "ANTHROPIC_API_KEY not configured in .env",
        "models": list(MODELS.keys()),
    }


@router.get("/models")
async def get_models():
    """Get available models with pricing info."""
    return {
        "models": [
            {
                "key": key,
                "id": info["id"],
                "name": info["name"],
                "description": info["description"],
                "input_cost": info["input_cost"],
                "output_cost": info["output_cost"],
            }
            for key, info in MODELS.items()
        ],
        "default": "sonnet",
    }


@router.post("/youtube")
async def analyze_youtube(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Submit YouTube URL for analysis."""
    job_id = str(uuid.uuid4())
    await create_job(job_id, "youtube", request.url)

    # Start analysis in background
    background_tasks.add_task(
        run_analysis_background,
        job_id,
        request.url,
        "youtube",
        request.model
    )

    return {"job_id": job_id, "status": "pending", "model": request.model}


@router.post("/article")
async def analyze_article(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Submit article URL for analysis."""
    job_id = str(uuid.uuid4())
    await create_job(job_id, "article", request.url)

    background_tasks.add_task(
        run_analysis_background,
        job_id,
        request.url,
        "article",
        request.model
    )

    return {"job_id": job_id, "status": "pending", "model": request.model}


@router.post("/arxiv")
async def analyze_arxiv(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Submit arXiv URL for analysis."""
    job_id = str(uuid.uuid4())
    await create_job(job_id, "arxiv", request.url)

    background_tasks.add_task(
        run_analysis_background,
        job_id,
        request.url,
        "arxiv",
        request.model
    )

    return {"job_id": job_id, "status": "pending", "model": request.model}


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get current job status (for polling)."""
    job = await get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return AnalysisJob(**job)


@router.get("/jobs/{job_id}/stream")
async def stream_job_progress(job_id: str):
    """
    SSE endpoint for real-time progress.

    Note: This endpoint currently only streams job status updates.
    The actual analysis runs in background and updates job status.
    """
    job = await get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        import asyncio

        # Poll for updates until job is complete
        while True:
            current_job = await get_job(job_id)
            if not current_job:
                break

            yield {
                "event": "progress",
                "data": current_job.get("progress_message", "Processing..."),
            }

            status = current_job.get("status")
            if status in ("completed", "failed"):
                yield {
                    "event": "complete",
                    "data": current_job,
                }
                break

            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())
