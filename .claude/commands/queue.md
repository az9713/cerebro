---
description: Manage the content processing queue (add, list, process items)
---

# Queue Management

Manage the content queue: $ARGUMENTS

## Usage

```
/queue <url>           # Add URL to queue
/queue add <url>       # Add URL to queue (explicit)
/queue list            # Show pending items
/queue clear           # Clear all pending items
/queue process         # Process all queued items
/queue process <n>     # Process first n items
```

## Queue File

The queue is stored in `inbox/queue.txt`, one URL per line with optional metadata:

```
# Format: URL | type | added_timestamp
https://youtube.com/watch?v=abc123 | youtube | 2024-01-15T10:30:00
https://arxiv.org/abs/2401.12345 | arxiv | 2024-01-15T11:00:00
https://example.com/article | article | 2024-01-15T11:30:00
```

## Steps

### Add to Queue (`/queue <url>` or `/queue add <url>`)

1. Parse the URL from arguments
2. Auto-detect content type:
   - youtube.com, youtu.be → `youtube`
   - arxiv.org → `arxiv`
   - Otherwise → `article`
3. Read existing `inbox/queue.txt` (create if not exists)
4. Check for duplicates (skip if already queued)
5. Append new entry with timestamp
6. Confirm addition to user

### List Queue (`/queue list`)

1. Read `inbox/queue.txt`
2. If empty: "Queue is empty"
3. Display formatted list:
   ```
   ## Pending Queue (N items)

   1. [YouTube] Title or URL - added 2 hours ago
   2. [arXiv] 2401.12345 - added yesterday
   3. [Article] example.com/... - added 3 days ago
   ```

### Clear Queue (`/queue clear`)

1. Confirm with user before clearing
2. Create backup at `inbox/queue.txt.bak`
3. Empty the queue file
4. Confirm: "Queue cleared (N items removed)"

### Process Queue (`/queue process [n]`)

1. Read `inbox/queue.txt`
2. If empty: "Queue is empty, nothing to process"
3. Determine count: all items or first `n`
4. For each item:
   - Display "Processing [type]: URL..."
   - Call appropriate command (/yt, /arxiv, /read)
   - On success: Remove from queue
   - On failure: Keep in queue, note error
5. Summary: "Processed X/Y items successfully"

## Examples

```bash
# Add items to queue
/queue https://youtube.com/watch?v=abc123
/queue add https://arxiv.org/abs/2401.12345
/queue https://example.com/interesting-post

# Check what's queued
/queue list

# Process everything
/queue process

# Process just the first 3
/queue process 3

# Start fresh
/queue clear
```

## Error Handling

- Invalid URL: Warn user, don't add to queue
- Duplicate URL: Skip, inform user it's already queued
- Processing failure: Keep item in queue, continue with next
- Empty queue: Inform user, no action needed

## Related

- Queue file: `inbox/queue.txt`
- Uses: `/yt`, `/read`, `/arxiv` commands for processing
