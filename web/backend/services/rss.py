"""RSS feed monitoring and management service."""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, asdict
import hashlib

import httpx

from config import PROJECT_ROOT, INBOX_DIR

logger = logging.getLogger(__name__)

# RSS data storage
RSS_DATA_FILE = PROJECT_ROOT / "data" / "rss_feeds.json"
RSS_ITEMS_FILE = PROJECT_ROOT / "data" / "rss_items.json"


@dataclass
class RSSFeed:
    """RSS feed subscription."""
    id: str
    url: str
    title: str
    description: str
    category: str  # youtube, article, podcast
    last_checked: Optional[str] = None
    last_item_date: Optional[str] = None
    enabled: bool = True
    auto_queue: bool = True  # Auto-add new items to queue


@dataclass
class RSSItem:
    """Individual RSS feed item."""
    id: str
    feed_id: str
    title: str
    url: str
    published: str
    description: str
    processed: bool = False
    queued: bool = False


def _generate_id(url: str) -> str:
    """Generate a unique ID from URL."""
    return hashlib.md5(url.encode()).hexdigest()[:12]


def _ensure_data_dir():
    """Ensure data directory exists."""
    (PROJECT_ROOT / "data").mkdir(parents=True, exist_ok=True)


def _load_feeds() -> List[RSSFeed]:
    """Load feeds from storage."""
    _ensure_data_dir()
    if not RSS_DATA_FILE.exists():
        return []

    try:
        data = json.loads(RSS_DATA_FILE.read_text())
        return [RSSFeed(**feed) for feed in data]
    except Exception as e:
        logger.error(f"Failed to load feeds: {e}")
        return []


def _save_feeds(feeds: List[RSSFeed]):
    """Save feeds to storage."""
    _ensure_data_dir()
    data = [asdict(feed) for feed in feeds]
    RSS_DATA_FILE.write_text(json.dumps(data, indent=2))


def _load_items() -> List[RSSItem]:
    """Load feed items from storage."""
    _ensure_data_dir()
    if not RSS_ITEMS_FILE.exists():
        return []

    try:
        data = json.loads(RSS_ITEMS_FILE.read_text())
        return [RSSItem(**item) for item in data]
    except Exception as e:
        logger.error(f"Failed to load items: {e}")
        return []


def _save_items(items: List[RSSItem]):
    """Save feed items to storage."""
    _ensure_data_dir()
    data = [asdict(item) for item in items]
    RSS_ITEMS_FILE.write_text(json.dumps(data, indent=2))


async def add_feed(url: str, category: str = "article", auto_queue: bool = True) -> RSSFeed:
    """
    Add a new RSS feed subscription.

    Args:
        url: RSS feed URL
        category: Content type (youtube, article, podcast)
        auto_queue: Whether to auto-queue new items

    Returns:
        Created RSSFeed object
    """
    feeds = _load_feeds()

    # Check for duplicate
    for feed in feeds:
        if feed.url == url:
            raise ValueError(f"Feed already exists: {feed.title}")

    # Fetch feed info
    feed_info = await fetch_feed(url)

    feed = RSSFeed(
        id=_generate_id(url),
        url=url,
        title=feed_info.get("title", "Untitled Feed"),
        description=feed_info.get("description", ""),
        category=category,
        last_checked=datetime.now().isoformat(),
        auto_queue=auto_queue,
    )

    feeds.append(feed)
    _save_feeds(feeds)

    logger.info(f"Added feed: {feed.title}")
    return feed


async def remove_feed(feed_id: str) -> bool:
    """Remove a feed subscription."""
    feeds = _load_feeds()
    original_count = len(feeds)
    feeds = [f for f in feeds if f.id != feed_id]

    if len(feeds) == original_count:
        return False

    _save_feeds(feeds)

    # Also remove associated items
    items = _load_items()
    items = [i for i in items if i.feed_id != feed_id]
    _save_items(items)

    return True


def list_feeds() -> List[RSSFeed]:
    """Get all feed subscriptions."""
    return _load_feeds()


def get_feed(feed_id: str) -> Optional[RSSFeed]:
    """Get a specific feed by ID."""
    feeds = _load_feeds()
    for feed in feeds:
        if feed.id == feed_id:
            return feed
    return None


async def fetch_feed(url: str) -> Dict[str, Any]:
    """
    Fetch and parse an RSS feed.

    Returns dict with: title, description, items[]
    """
    try:
        import feedparser
    except ImportError:
        raise ImportError("feedparser not installed. Run: pip install feedparser")

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; PersonalOS/1.0)"
        })
        response.raise_for_status()
        content = response.text

    # Parse feed (feedparser is sync, run in thread)
    feed = await asyncio.to_thread(feedparser.parse, content)

    if feed.bozo and not feed.entries:
        raise ValueError(f"Invalid RSS feed: {feed.bozo_exception}")

    items = []
    for entry in feed.entries[:50]:  # Limit to 50 items
        items.append({
            "id": _generate_id(entry.get("link", entry.get("id", ""))),
            "title": entry.get("title", "Untitled"),
            "url": entry.get("link", ""),
            "published": entry.get("published", entry.get("updated", "")),
            "description": entry.get("summary", "")[:500],
        })

    return {
        "title": feed.feed.get("title", "Untitled Feed"),
        "description": feed.feed.get("description", ""),
        "link": feed.feed.get("link", url),
        "items": items,
    }


async def check_feed(feed: RSSFeed) -> List[RSSItem]:
    """
    Check a feed for new items.

    Returns list of new items found.
    """
    feed_data = await fetch_feed(feed.url)
    existing_items = _load_items()
    existing_ids = {i.id for i in existing_items if i.feed_id == feed.id}

    new_items = []
    for item_data in feed_data["items"]:
        if item_data["id"] not in existing_ids:
            item = RSSItem(
                id=item_data["id"],
                feed_id=feed.id,
                title=item_data["title"],
                url=item_data["url"],
                published=item_data["published"],
                description=item_data["description"],
            )
            new_items.append(item)

    if new_items:
        # Save new items
        all_items = existing_items + new_items
        _save_items(all_items)

        # Update feed last_checked
        feeds = _load_feeds()
        for f in feeds:
            if f.id == feed.id:
                f.last_checked = datetime.now().isoformat()
                if new_items:
                    f.last_item_date = new_items[0].published
                break
        _save_feeds(feeds)

        # Auto-queue if enabled
        if feed.auto_queue:
            await queue_items(new_items, feed.category)

    return new_items


async def check_all_feeds() -> Dict[str, List[RSSItem]]:
    """
    Check all enabled feeds for new items.

    Returns dict mapping feed_id to list of new items.
    """
    feeds = _load_feeds()
    results = {}

    for feed in feeds:
        if not feed.enabled:
            continue

        try:
            new_items = await check_feed(feed)
            if new_items:
                results[feed.id] = new_items
                logger.info(f"Found {len(new_items)} new items in {feed.title}")
        except Exception as e:
            logger.error(f"Failed to check feed {feed.title}: {e}")

    return results


async def queue_items(items: List[RSSItem], category: str):
    """Add items to the processing queue."""
    queue_file = INBOX_DIR / "queue.txt"
    INBOX_DIR.mkdir(parents=True, exist_ok=True)

    # Read existing queue
    existing = set()
    if queue_file.exists():
        for line in queue_file.read_text().splitlines():
            if line.strip() and not line.startswith("#"):
                parts = line.split(" | ")
                if parts:
                    existing.add(parts[0].strip())

    # Add new items
    new_entries = []
    for item in items:
        if item.url and item.url not in existing:
            timestamp = datetime.now().isoformat()
            new_entries.append(f"{item.url} | {category} | {timestamp}")
            item.queued = True

    if new_entries:
        with open(queue_file, "a") as f:
            for entry in new_entries:
                f.write(entry + "\n")

        # Update items
        all_items = _load_items()
        item_ids = {i.id for i in items}
        for i in all_items:
            if i.id in item_ids:
                i.queued = True
        _save_items(all_items)


def get_feed_items(feed_id: str, limit: int = 50) -> List[RSSItem]:
    """Get items for a specific feed."""
    items = _load_items()
    feed_items = [i for i in items if i.feed_id == feed_id]
    return sorted(feed_items, key=lambda x: x.published, reverse=True)[:limit]


def get_unprocessed_items(limit: int = 100) -> List[RSSItem]:
    """Get all unprocessed items across feeds."""
    items = _load_items()
    unprocessed = [i for i in items if not i.processed]
    return sorted(unprocessed, key=lambda x: x.published, reverse=True)[:limit]


def mark_item_processed(item_id: str):
    """Mark an item as processed."""
    items = _load_items()
    for item in items:
        if item.id == item_id:
            item.processed = True
            break
    _save_items(items)
