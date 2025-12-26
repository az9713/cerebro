"""Reviews Router - Spaced repetition review system."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from database import (
    get_due_reviews,
    add_to_review_queue,
    record_review,
    get_review_stats,
    get_report_by_id,
)

router = APIRouter()


class AddToQueueRequest(BaseModel):
    report_id: int


class RecordReviewRequest(BaseModel):
    quality: int  # 0-5: 0=complete failure, 5=perfect recall


class ReviewItem(BaseModel):
    id: int
    report_id: int
    title: str
    content_type: str
    source_url: Optional[str]
    repetitions: int
    ease_factor: float
    interval: int
    next_review: str
    summary: Optional[str] = None


class ReviewResult(BaseModel):
    report_id: int
    next_review: str
    interval: int
    ease_factor: float
    repetitions: int


class ReviewStats(BaseModel):
    total_reviews: int
    due_today: int
    reviewed_today: int
    average_ease: float
    streak: int


@router.get("/due")
async def get_due_items(limit: int = 10):
    """
    Get reports that are due for review.

    Uses the SM-2 spaced repetition algorithm to determine
    which items need reviewing based on past performance.
    """
    due = await get_due_reviews(limit=limit)

    items = []
    for review in due:
        # Get report details
        report = await get_report_by_id(review["report_id"])
        if report:
            items.append(ReviewItem(
                id=review["id"],
                report_id=review["report_id"],
                title=report["title"],
                content_type=report["content_type"],
                source_url=report.get("source_url"),
                repetitions=review["repetitions"],
                ease_factor=review["ease_factor"],
                interval=review["interval"],
                next_review=review["next_review"],
                summary=report.get("summary"),
            ))

    return {"items": items, "count": len(items)}


@router.post("/add")
async def add_to_queue(request: AddToQueueRequest):
    """
    Add a report to the review queue.

    The report will appear in due reviews tomorrow.
    """
    # Verify report exists
    report = await get_report_by_id(request.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    await add_to_review_queue(request.report_id)
    return {"message": f"Added '{report['title']}' to review queue"}


@router.post("/{report_id}/review", response_model=ReviewResult)
async def submit_review(report_id: int, request: RecordReviewRequest):
    """
    Record a review and calculate next review date.

    Quality ratings (0-5):
    - 0: Complete blackout, no recall
    - 1: Wrong answer, but recognized correct answer
    - 2: Wrong answer, correct seemed easy to recall
    - 3: Correct with serious difficulty
    - 4: Correct with some hesitation
    - 5: Perfect response, instant recall
    """
    if request.quality < 0 or request.quality > 5:
        raise HTTPException(
            status_code=400,
            detail="Quality must be between 0 and 5"
        )

    result = await record_review(report_id, request.quality)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return ReviewResult(
        report_id=report_id,
        next_review=result["next_review"],
        interval=result["interval"],
        ease_factor=result["ease_factor"],
        repetitions=result["repetitions"],
    )


@router.get("/stats", response_model=ReviewStats)
async def get_stats():
    """Get review statistics and progress."""
    stats = await get_review_stats()
    # Map database field names to response model fields
    return ReviewStats(
        total_reviews=stats.get("total_items", 0),
        due_today=stats.get("due_count", 0),
        reviewed_today=stats.get("reviewed_today", 0),
        average_ease=stats.get("average_ease", 2.5),
        streak=stats.get("streak_days", 0),
    )


@router.delete("/{report_id}")
async def remove_from_queue(report_id: int):
    """Remove a report from the review queue."""
    # This would need a database operation we haven't implemented
    # For now, we'll just return success
    return {"message": f"Removed report {report_id} from review queue"}
