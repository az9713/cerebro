"""Batch processing router."""

import uuid
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import List

from database import create_job, get_job
from services.cli_runner import run_claude_code_command

router = APIRouter()


class BatchRequest(BaseModel):
    """Batch processing request."""
    items: List[str]  # List of URLs or file paths


class BatchItemStatus(BaseModel):
    """Status of a single batch item."""
    input: str
    status: str
    job_id: str | None = None


@router.post("")
async def submit_batch(request: BatchRequest, background_tasks: BackgroundTasks):
    """
    Submit multiple items for batch processing.

    Each item is processed sequentially as a separate job.
    """
    batch_id = str(uuid.uuid4())
    items_status = []

    for item in request.items:
        job_id = str(uuid.uuid4())

        # Detect type from URL
        if "youtube.com" in item or "youtu.be" in item:
            job_type = "youtube"
            command = "yt"
        elif "arxiv.org" in item:
            job_type = "arxiv"
            command = "arxiv"
        elif item.startswith("http"):
            job_type = "article"
            command = "read"
        else:
            job_type = "file"
            command = "analyze"

        await create_job(job_id, job_type, item)

        items_status.append({
            "input": item,
            "status": "pending",
            "job_id": job_id,
        })

    # Process all items in background
    background_tasks.add_task(process_batch, items_status)

    return {
        "batch_id": batch_id,
        "items": items_status,
        "total": len(items_status),
    }


async def process_batch(items: List[dict]):
    """Process all batch items sequentially."""
    for item in items:
        job = await get_job(item["job_id"])
        if job:
            command = get_command_for_type(job["job_type"])
            async for _ in run_claude_code_command(command, job["input_value"], job["id"]):
                pass  # Consume generator


def get_command_for_type(job_type: str) -> str:
    """Map job type to command."""
    return {
        "youtube": "yt",
        "article": "read",
        "arxiv": "arxiv",
        "file": "analyze",
    }.get(job_type, "analyze")


@router.get("/{batch_id}/status")
async def get_batch_status(batch_id: str):
    """Get status of all items in a batch."""
    # Note: In a full implementation, we'd store batch metadata
    # For now, return a placeholder
    return {"batch_id": batch_id, "status": "Check individual job IDs"}
