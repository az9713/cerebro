---
description: Manage RSS feed subscriptions (add, remove, list, check for updates)
---

# RSS Feed Management

Manage RSS feeds: $ARGUMENTS

## Usage

```
/rss add <url> [category]    # Subscribe to a feed
/rss remove <id-or-title>    # Unsubscribe from a feed
/rss list                    # Show all subscriptions
/rss check                   # Check all feeds for new content
/rss check <id>              # Check specific feed
/rss items <id>              # Show recent items from a feed
```

## Supported Categories

- `youtube` - YouTube channel RSS feeds
- `article` - Blog/news RSS feeds (default)
- `podcast` - Podcast RSS feeds

## Steps

### Add Feed (`/rss add <url> [category]`)

1. Parse URL and optional category from arguments
2. Validate URL is accessible
3. Fetch feed metadata (title, description)
4. Store in `data/rss_feeds.json`:
   ```json
   {
     "id": "abc123",
     "url": "https://example.com/feed.xml",
     "title": "Example Blog",
     "category": "article",
     "auto_queue": true,
     "enabled": true
   }
   ```
5. Confirm: "Subscribed to: Example Blog (12 items available)"

### Remove Feed (`/rss remove <id-or-title>`)

1. Find feed by ID or title match
2. Remove from `data/rss_feeds.json`
3. Optionally remove cached items
4. Confirm removal

### List Feeds (`/rss list`)

1. Read `data/rss_feeds.json`
2. Display formatted list:
   ```
   ## RSS Subscriptions (5 feeds)

   | # | Title | Category | Last Checked | Items |
   |---|-------|----------|--------------|-------|
   | 1 | Tech Blog | article | 2h ago | 24 |
   | 2 | AI Channel | youtube | 1h ago | 15 |
   | 3 | Podcast Show | podcast | 30m ago | 8 |
   ```

### Check Feeds (`/rss check [id]`)

1. If ID provided: Check single feed
2. Otherwise: Check all enabled feeds
3. For each feed:
   - Fetch latest items
   - Compare with stored items
   - Identify new content
   - If `auto_queue` enabled: Add to `inbox/queue.txt`
4. Report findings:
   ```
   ## Feed Check Complete

   - Tech Blog: 3 new articles (queued)
   - AI Channel: 1 new video (queued)
   - Podcast Show: No new episodes

   Total: 4 new items added to queue
   ```

### Show Items (`/rss items <id>`)

1. Find feed by ID
2. Load cached items from `data/rss_items.json`
3. Display recent items:
   ```
   ## Recent from: Tech Blog

   1. [New] Building with AI - Jan 15
   2. [New] Python Tips - Jan 14
   3. [Processed] Docker Guide - Jan 12
   4. [Processed] Git Workflows - Jan 10
   ```

## Auto-Queue Behavior

When `auto_queue` is enabled (default):
- New items are automatically added to `inbox/queue.txt`
- Use `/queue process` to analyze them
- Disable with: `/rss add <url> --no-auto-queue`

## YouTube Channel Feeds

To subscribe to a YouTube channel:

1. Find channel ID (from channel URL or About page)
2. Construct feed URL:
   ```
   https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
   ```
3. Subscribe:
   ```
   /rss add https://www.youtube.com/feeds/videos.xml?channel_id=UC... youtube
   ```

## Examples

```bash
# Subscribe to a blog
/rss add https://example.com/feed.xml

# Subscribe to YouTube channel
/rss add https://www.youtube.com/feeds/videos.xml?channel_id=UCxyz youtube

# Subscribe to podcast
/rss add https://podcast.example.com/feed.xml podcast

# Check for new content
/rss check

# See what's in a feed
/rss items abc123
```

## Data Storage

- Feeds: `data/rss_feeds.json`
- Items: `data/rss_items.json`
- Queue: `inbox/queue.txt`

## Requirements

- feedparser library: `pip install feedparser`

## Error Handling

- Invalid feed URL: "Could not parse RSS feed at URL"
- Feed not found: "No feed found with ID or title matching..."
- Network error: "Failed to fetch feed: [error]"

## Related

- Queue: `/queue` command
- API: `GET/POST /api/rss/feeds`
