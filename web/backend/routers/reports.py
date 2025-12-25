"""Reports router - list, get, search reports."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from database import get_reports, get_report_by_id, search_reports
from models import Report, ReportList, SearchResult

router = APIRouter()


@router.get("", response_model=ReportList)
async def list_reports(
    content_type: Optional[str] = Query(None, description="Filter by type: youtube, article, paper, other"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """List all reports with pagination."""
    items, total = await get_reports(
        content_type=content_type,
        page=page,
        page_size=page_size,
    )

    # Convert to Report models
    reports = []
    for item in items:
        reports.append(Report(
            id=item["id"],
            filename=item["filename"],
            filepath=item["filepath"],
            title=item["title"],
            source_url=item.get("source_url"),
            content_type=item["content_type"],
            created_at=item["created_at"],
            summary=item.get("summary"),
            word_count=item.get("word_count"),
        ))

    return ReportList(
        items=reports,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/recent")
async def get_recent_reports(limit: int = Query(10, ge=1, le=50)):
    """Get most recent reports across all types."""
    items, _ = await get_reports(page=1, page_size=limit)

    return [
        Report(
            id=item["id"],
            filename=item["filename"],
            filepath=item["filepath"],
            title=item["title"],
            source_url=item.get("source_url"),
            content_type=item["content_type"],
            created_at=item["created_at"],
            summary=item.get("summary"),
            word_count=item.get("word_count"),
        )
        for item in items
    ]


@router.get("/search")
async def search(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
):
    """Full-text search across all reports."""
    results = await search_reports(q, limit=limit)

    return [
        SearchResult(
            id=r["id"],
            title=r["title"],
            filename=r["filename"],
            content_type=r["content_type"],
            created_at=r["created_at"],
            snippet=r["snippet"],
        )
        for r in results
    ]


@router.get("/{report_id}", response_model=Report)
async def get_report(report_id: int):
    """Get a single report with full markdown content."""
    report = await get_report_by_id(report_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return Report(
        id=report["id"],
        filename=report["filename"],
        filepath=report["filepath"],
        title=report["title"],
        source_url=report.get("source_url"),
        content_type=report["content_type"],
        created_at=report["created_at"],
        summary=report.get("summary"),
        word_count=report.get("word_count"),
        content=report.get("content"),
    )
