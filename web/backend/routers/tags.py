"""Tags router - manage tags and report-tag associations."""

from fastapi import APIRouter, HTTPException
from typing import List

from database import (
    get_all_tags, create_tag, update_tag, delete_tag,
    add_tag_to_report, remove_tag_from_report,
    get_report_tags, get_reports_by_tag
)
from models import Tag, TagCreate, TagUpdate, TagList, Report

router = APIRouter()


@router.get("", response_model=TagList)
async def list_tags():
    """Get all tags."""
    tags = await get_all_tags()
    return TagList(items=[Tag(**t) for t in tags])


@router.post("", response_model=Tag)
async def create_new_tag(tag: TagCreate):
    """Create a new tag."""
    try:
        result = await create_tag(tag.name, tag.color)
        return Tag(**result)
    except Exception as e:
        if "UNIQUE constraint" in str(e):
            raise HTTPException(status_code=400, detail="Tag name already exists")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{tag_id}", response_model=Tag)
async def update_existing_tag(tag_id: int, tag: TagUpdate):
    """Update a tag."""
    result = await update_tag(tag_id, tag.name, tag.color)
    if not result:
        raise HTTPException(status_code=404, detail="Tag not found")
    return Tag(**result)


@router.delete("/{tag_id}")
async def delete_existing_tag(tag_id: int):
    """Delete a tag."""
    await delete_tag(tag_id)
    return {"message": "Tag deleted"}


@router.get("/{tag_id}/reports")
async def get_tag_reports(tag_id: int) -> List[Report]:
    """Get all reports with a specific tag."""
    reports = await get_reports_by_tag(tag_id)
    return [Report(
        id=r["id"],
        filename=r["filename"],
        filepath=r["filepath"],
        title=r["title"],
        source_url=r.get("source_url"),
        content_type=r["content_type"],
        created_at=r["created_at"],
        summary=r.get("summary"),
        word_count=r.get("word_count"),
    ) for r in reports]


@router.post("/reports/{report_id}/tags/{tag_id}")
async def add_tag(report_id: int, tag_id: int):
    """Add a tag to a report."""
    await add_tag_to_report(report_id, tag_id)
    return {"message": "Tag added to report"}


@router.delete("/reports/{report_id}/tags/{tag_id}")
async def remove_tag(report_id: int, tag_id: int):
    """Remove a tag from a report."""
    await remove_tag_from_report(report_id, tag_id)
    return {"message": "Tag removed from report"}


@router.get("/reports/{report_id}", response_model=TagList)
async def get_tags_for_report(report_id: int):
    """Get all tags for a specific report."""
    tags = await get_report_tags(report_id)
    return TagList(items=[Tag(**t) for t in tags])
