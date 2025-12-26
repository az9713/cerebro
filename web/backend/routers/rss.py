"""RSS feed management router."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.rss import (
    add_feed,
    remove_feed,
    list_feeds,
    get_feed,
    check_feed,
    check_all_feeds,
    get_feed_items,
    get_unprocessed_items,
    mark_item_processed,
    RSSFeed,
    RSSItem,
)

router = APIRouter()


class AddFeedRequest(BaseModel):
    url: str
    category: str = "article"
    auto_queue: bool = True


class FeedResponse(BaseModel):
    id: str
    url: str
    title: str
    description: str
    category: str
    last_checked: Optional[str]
    last_item_date: Optional[str]
    enabled: bool
    auto_queue: bool


class ItemResponse(BaseModel):
    id: str
    feed_id: str
    title: str
    url: str
    published: str
    description: str
    processed: bool
    queued: bool


class CheckFeedsResponse(BaseModel):
    feeds_checked: int
    new_items_total: int
    new_items_by_feed: dict


@router.get("/feeds", response_model=List[FeedResponse])
async def get_feeds():
    """Get all RSS feed subscriptions."""
    feeds = list_feeds()
    return [FeedResponse(
        id=f.id,
        url=f.url,
        title=f.title,
        description=f.description,
        category=f.category,
        last_checked=f.last_checked,
        last_item_date=f.last_item_date,
        enabled=f.enabled,
        auto_queue=f.auto_queue,
    ) for f in feeds]


@router.post("/feeds", response_model=FeedResponse)
async def create_feed(request: AddFeedRequest):
    """Add a new RSS feed subscription."""
    try:
        feed = await add_feed(
            url=request.url,
            category=request.category,
            auto_queue=request.auto_queue,
        )
        return FeedResponse(
            id=feed.id,
            url=feed.url,
            title=feed.title,
            description=feed.description,
            category=feed.category,
            last_checked=feed.last_checked,
            last_item_date=feed.last_item_date,
            enabled=feed.enabled,
            auto_queue=feed.auto_queue,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add feed: {str(e)}")


@router.get("/feeds/{feed_id}", response_model=FeedResponse)
async def get_feed_by_id(feed_id: str):
    """Get a specific feed by ID."""
    feed = get_feed(feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    return FeedResponse(
        id=feed.id,
        url=feed.url,
        title=feed.title,
        description=feed.description,
        category=feed.category,
        last_checked=feed.last_checked,
        last_item_date=feed.last_item_date,
        enabled=feed.enabled,
        auto_queue=feed.auto_queue,
    )


@router.delete("/feeds/{feed_id}")
async def delete_feed(feed_id: str):
    """Remove a feed subscription."""
    success = await remove_feed(feed_id)
    if not success:
        raise HTTPException(status_code=404, detail="Feed not found")
    return {"status": "deleted", "feed_id": feed_id}


@router.post("/feeds/{feed_id}/check", response_model=List[ItemResponse])
async def check_single_feed(feed_id: str):
    """Check a specific feed for new items."""
    feed = get_feed(feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    try:
        new_items = await check_feed(feed)
        return [ItemResponse(
            id=i.id,
            feed_id=i.feed_id,
            title=i.title,
            url=i.url,
            published=i.published,
            description=i.description,
            processed=i.processed,
            queued=i.queued,
        ) for i in new_items]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check feed: {str(e)}")


@router.post("/feeds/check-all", response_model=CheckFeedsResponse)
async def check_all():
    """Check all enabled feeds for new items."""
    try:
        results = await check_all_feeds()
        total_new = sum(len(items) for items in results.values())

        return CheckFeedsResponse(
            feeds_checked=len(list_feeds()),
            new_items_total=total_new,
            new_items_by_feed={
                feed_id: len(items) for feed_id, items in results.items()
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check feeds: {str(e)}")


@router.get("/feeds/{feed_id}/items", response_model=List[ItemResponse])
async def get_items_for_feed(feed_id: str, limit: int = 50):
    """Get items for a specific feed."""
    feed = get_feed(feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    items = get_feed_items(feed_id, limit)
    return [ItemResponse(
        id=i.id,
        feed_id=i.feed_id,
        title=i.title,
        url=i.url,
        published=i.published,
        description=i.description,
        processed=i.processed,
        queued=i.queued,
    ) for i in items]


@router.get("/items/unprocessed", response_model=List[ItemResponse])
async def get_unprocessed(limit: int = 100):
    """Get all unprocessed items across feeds."""
    items = get_unprocessed_items(limit)
    return [ItemResponse(
        id=i.id,
        feed_id=i.feed_id,
        title=i.title,
        url=i.url,
        published=i.published,
        description=i.description,
        processed=i.processed,
        queued=i.queued,
    ) for i in items]


@router.post("/items/{item_id}/processed")
async def mark_processed(item_id: str):
    """Mark an item as processed."""
    mark_item_processed(item_id)
    return {"status": "marked_processed", "item_id": item_id}
