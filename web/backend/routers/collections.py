"""Collections router - manage collections and report associations."""

from fastapi import APIRouter, HTTPException
from typing import List

from database import (
    get_all_collections, create_collection, update_collection, delete_collection,
    get_collection_by_id, add_report_to_collection, remove_report_from_collection,
    get_collection_reports, get_report_collections
)
from models import Collection, CollectionCreate, CollectionUpdate, CollectionList, Report

router = APIRouter()


@router.get("", response_model=CollectionList)
async def list_collections():
    """Get all collections with report counts."""
    collections = await get_all_collections()
    return CollectionList(items=[Collection(**c) for c in collections])


@router.post("", response_model=Collection)
async def create_new_collection(collection: CollectionCreate):
    """Create a new collection."""
    try:
        result = await create_collection(
            collection.name,
            collection.description,
            collection.color
        )
        result["report_count"] = 0
        return Collection(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{collection_id}", response_model=Collection)
async def get_collection(collection_id: int):
    """Get a single collection."""
    collection = await get_collection_by_id(collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return Collection(**collection)


@router.put("/{collection_id}", response_model=Collection)
async def update_existing_collection(collection_id: int, collection: CollectionUpdate):
    """Update a collection."""
    result = await update_collection(
        collection_id,
        collection.name,
        collection.description,
        collection.color
    )
    if not result:
        raise HTTPException(status_code=404, detail="Collection not found")
    # Get updated with report count
    updated = await get_collection_by_id(collection_id)
    return Collection(**updated)


@router.delete("/{collection_id}")
async def delete_existing_collection(collection_id: int):
    """Delete a collection."""
    await delete_collection(collection_id)
    return {"message": "Collection deleted"}


@router.get("/{collection_id}/reports")
async def get_reports_in_collection(collection_id: int) -> List[Report]:
    """Get all reports in a collection."""
    reports = await get_collection_reports(collection_id)
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


@router.post("/{collection_id}/reports/{report_id}")
async def add_report(collection_id: int, report_id: int):
    """Add a report to a collection."""
    await add_report_to_collection(collection_id, report_id)
    return {"message": "Report added to collection"}


@router.delete("/{collection_id}/reports/{report_id}")
async def remove_report(collection_id: int, report_id: int):
    """Remove a report from a collection."""
    await remove_report_from_collection(collection_id, report_id)
    return {"message": "Report removed from collection"}


@router.get("/reports/{report_id}", response_model=CollectionList)
async def get_collections_for_report(report_id: int):
    """Get all collections containing a specific report."""
    collections = await get_report_collections(report_id)
    # Add report_count to each (set to 0 as placeholder)
    for c in collections:
        c["report_count"] = 0
    return CollectionList(items=[Collection(**c) for c in collections])
