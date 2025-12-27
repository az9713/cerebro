"""Reports router - list, get, search, favorite, delete, move reports."""

import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, List
from pydantic import BaseModel

from database import (
    get_reports, get_report_by_id, search_reports, toggle_favorite, get_favorite_reports,
    get_report_filepath_by_id, delete_report_by_id, update_report_category
)
from models import Report, ReportList, SearchResult, FavoriteResponse
from config import CONTENT_TYPES


class BulkDeleteRequest(BaseModel):
    report_ids: List[int]


class BulkDeleteResponse(BaseModel):
    deleted: List[int]
    errors: List[dict]


class MoveCategoryRequest(BaseModel):
    new_category: str

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


@router.get("/favorites")
async def list_favorites():
    """Get all favorited reports."""
    items = await get_favorite_reports()
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


@router.post("/{report_id}/favorite", response_model=FavoriteResponse)
async def toggle_report_favorite(report_id: int):
    """Toggle favorite status for a report."""
    is_favorite = await toggle_favorite(report_id)
    return FavoriteResponse(report_id=report_id, is_favorite=is_favorite)


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


@router.delete("/{report_id}")
async def delete_report_endpoint(report_id: int):
    """Delete a report (file and database record)."""
    # Get filepath before deleting from DB
    filepath = await get_report_filepath_by_id(report_id)
    if not filepath:
        raise HTTPException(status_code=404, detail="Report not found")

    # Delete from database (cascades to tags, collections, etc.)
    deleted = await delete_report_by_id(report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Report not found")

    # Delete file from filesystem
    file_path = Path(filepath)
    if file_path.exists():
        file_path.unlink()

    return {"status": "deleted", "report_id": report_id}


@router.post("/bulk-delete", response_model=BulkDeleteResponse)
async def bulk_delete_reports(request: BulkDeleteRequest):
    """Delete multiple reports at once."""
    deleted = []
    errors = []

    for report_id in request.report_ids:
        try:
            # Get filepath before deleting
            filepath = await get_report_filepath_by_id(report_id)
            if not filepath:
                errors.append({"id": report_id, "error": "Report not found"})
                continue

            # Delete from database
            success = await delete_report_by_id(report_id)
            if not success:
                errors.append({"id": report_id, "error": "Failed to delete from database"})
                continue

            # Delete file
            file_path = Path(filepath)
            if file_path.exists():
                file_path.unlink()

            deleted.append(report_id)
        except Exception as e:
            errors.append({"id": report_id, "error": str(e)})

    return BulkDeleteResponse(deleted=deleted, errors=errors)


@router.patch("/{report_id}/category")
async def move_report_category(report_id: int, request: MoveCategoryRequest):
    """Move a report to a different category."""
    new_category = request.new_category

    # Validate category
    if new_category not in CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {list(CONTENT_TYPES.keys())}"
        )

    # Get current filepath
    current_filepath = await get_report_filepath_by_id(report_id)
    if not current_filepath:
        raise HTTPException(status_code=404, detail="Report not found")

    current_path = Path(current_filepath)
    if not current_path.exists():
        raise HTTPException(status_code=404, detail="Report file not found")

    # Compute new filepath
    new_dir = CONTENT_TYPES[new_category]
    new_dir.mkdir(parents=True, exist_ok=True)
    new_filepath = new_dir / current_path.name

    # Check if file already exists at destination
    if new_filepath.exists() and new_filepath != current_path:
        raise HTTPException(
            status_code=409,
            detail="A file with this name already exists in the target category"
        )

    # Move file
    if current_path != new_filepath:
        shutil.move(str(current_path), str(new_filepath))

    # Update database
    await update_report_category(report_id, str(new_filepath), new_category)

    return {
        "status": "moved",
        "report_id": report_id,
        "new_category": new_category,
        "new_filepath": str(new_filepath)
    }
