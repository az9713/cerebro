# Watchdog File Monitoring Guide

This guide explains how to use the `watchdog` library to monitor filesystem changes in Python. This is essential for features like auto-indexing, live reload, and real-time synchronization.

---

## Table of Contents

1. [What is Watchdog?](#what-is-watchdog)
2. [Installation](#installation)
3. [Core Concepts](#core-concepts)
4. [Basic Usage](#basic-usage)
5. [Event Types](#event-types)
6. [Creating Event Handlers](#creating-event-handlers)
7. [Observer Patterns](#observer-patterns)
8. [Thread Safety with Async](#thread-safety-with-async)
9. [Debouncing Events](#debouncing-events)
10. [Error Handling](#error-handling)
11. [This Project's Implementation](#this-projects-implementation)
12. [Practice Exercises](#practice-exercises)

---

## What is Watchdog?

**Watchdog** is a Python library that monitors filesystem events. It watches directories for:

- File creation
- File modification
- File deletion
- File moves/renames

### Why Use Watchdog?

```
┌─────────────────────────────────────────────────────────────────┐
│                     Without Watchdog                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  while True:                                                     │
│      files = os.listdir(directory)                              │
│      for file in files:                                         │
│          if file not in known_files:                            │
│              process(file)  # Wasteful polling!                 │
│      time.sleep(1)                                              │
│                                                                  │
│  Problems:                                                       │
│  ✗ CPU-intensive (constant polling)                             │
│  ✗ Delayed detection (up to sleep interval)                     │
│  ✗ Complex state tracking                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      With Watchdog                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  observer.schedule(handler, directory)                          │
│  observer.start()  # Runs in background thread                  │
│                                                                  │
│  Benefits:                                                       │
│  ✓ Event-driven (no polling)                                    │
│  ✓ Instant detection                                            │
│  ✓ Low CPU usage                                                │
│  ✓ Uses OS-native APIs (inotify, FSEvents, etc.)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Comparison with Alternatives

| Approach | CPU Usage | Detection Speed | Complexity |
|----------|-----------|-----------------|------------|
| Polling (os.listdir) | High | Delayed | Low |
| Watchdog | Low | Instant | Medium |
| OS-specific (inotify) | Low | Instant | High |

Watchdog provides a cross-platform abstraction over OS-specific APIs.

---

## Installation

```bash
# Install watchdog
pip install watchdog

# Or with all dependencies
pip install watchdog[watchmedo]

# Verify installation
python -c "import watchdog; print(watchdog.__version__)"
```

### Platform Support

| Platform | Backend |
|----------|---------|
| Linux | inotify |
| macOS | FSEvents |
| Windows | ReadDirectoryChangesW |
| BSD | kqueue |

Watchdog automatically selects the best backend for your platform.

---

## Core Concepts

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Watchdog Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────────┐     ┌────────────────────┐   │
│  │ Observer │────▶│ Event Queue  │────▶│ Your Handler       │   │
│  │ (Thread) │     │              │     │ (on_created, etc.) │   │
│  └──────────┘     └──────────────┘     └────────────────────┘   │
│       │                                                          │
│       │ watches                                                  │
│       ▼                                                          │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              Filesystem (OS Native API)               │       │
│  │  /reports/youtube/  /reports/articles/  /logs/        │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Observer**: Background thread that monitors directories
2. **Handler**: Your code that responds to events
3. **Event**: Information about what changed (path, type)

---

## Basic Usage

### Minimal Example

```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time

# 1. Create a handler class
class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        print(f"Created: {event.src_path}")

    def on_modified(self, event):
        print(f"Modified: {event.src_path}")

    def on_deleted(self, event):
        print(f"Deleted: {event.src_path}")

# 2. Create and configure observer
observer = Observer()
handler = MyHandler()
observer.schedule(handler, path="./my_folder", recursive=True)

# 3. Start watching
observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()

observer.join()
```

### Running the Example

```bash
# Terminal 1: Run the watcher
python watcher.py

# Terminal 2: Create/modify files
touch my_folder/test.txt        # "Created: ./my_folder/test.txt"
echo "hello" > my_folder/test.txt  # "Modified: ./my_folder/test.txt"
rm my_folder/test.txt           # "Deleted: ./my_folder/test.txt"
```

---

## Event Types

### FileSystemEvent Properties

```python
from watchdog.events import FileSystemEvent

# Every event has these properties:
event.src_path      # Path to the file/directory
event.is_directory  # True if event is for a directory
event.event_type    # 'created', 'modified', 'deleted', 'moved'
```

### Event Classes

| Event Class | Description |
|-------------|-------------|
| `FileCreatedEvent` | A file was created |
| `FileModifiedEvent` | A file was modified |
| `FileDeletedEvent` | A file was deleted |
| `FileMovedEvent` | A file was moved (has `dest_path`) |
| `DirCreatedEvent` | A directory was created |
| `DirModifiedEvent` | A directory was modified |
| `DirDeletedEvent` | A directory was deleted |
| `DirMovedEvent` | A directory was moved |

### Move Events

```python
def on_moved(self, event):
    # FileMovedEvent has additional property
    print(f"Moved from: {event.src_path}")
    print(f"Moved to: {event.dest_path}")
```

---

## Creating Event Handlers

### Handler Methods

```python
from watchdog.events import FileSystemEventHandler

class MyHandler(FileSystemEventHandler):
    """Complete handler with all event methods."""

    def on_any_event(self, event):
        """Called for ANY event (catch-all)."""
        print(f"Event: {event.event_type} - {event.src_path}")

    def on_created(self, event):
        """Called when file/directory is created."""
        if event.is_directory:
            print(f"Directory created: {event.src_path}")
        else:
            print(f"File created: {event.src_path}")

    def on_modified(self, event):
        """Called when file/directory is modified."""
        if not event.is_directory:
            print(f"File modified: {event.src_path}")

    def on_deleted(self, event):
        """Called when file/directory is deleted."""
        print(f"Deleted: {event.src_path}")

    def on_moved(self, event):
        """Called when file/directory is moved."""
        print(f"Moved: {event.src_path} -> {event.dest_path}")
```

### Filtering by File Type

```python
from pathlib import Path

class MarkdownHandler(FileSystemEventHandler):
    """Only process .md files."""

    def on_created(self, event):
        # Skip directories
        if event.is_directory:
            return

        # Only process .md files
        if not event.src_path.endswith('.md'):
            return

        filepath = Path(event.src_path)
        print(f"New markdown file: {filepath.name}")
        self.process_markdown(filepath)

    def process_markdown(self, filepath):
        content = filepath.read_text()
        # Do something with the content...
```

### Pattern Matching Handler

```python
from watchdog.events import PatternMatchingEventHandler

class MyHandler(PatternMatchingEventHandler):
    """Use glob patterns to filter files."""

    def __init__(self):
        super().__init__(
            patterns=["*.md", "*.txt"],      # Include these patterns
            ignore_patterns=["*.tmp", ".*"], # Exclude these patterns
            ignore_directories=True,          # Don't trigger on dir events
            case_sensitive=False              # Case-insensitive matching
        )

    def on_created(self, event):
        print(f"New file: {event.src_path}")
```

---

## Observer Patterns

### Watching Multiple Directories

```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

observer = Observer()
handler = MyHandler()

# Watch multiple directories with same handler
observer.schedule(handler, "/path/to/reports", recursive=True)
observer.schedule(handler, "/path/to/logs", recursive=True)
observer.schedule(handler, "/path/to/inbox", recursive=False)  # Not recursive

observer.start()
```

### Different Handlers per Directory

```python
class ReportsHandler(FileSystemEventHandler):
    def on_created(self, event):
        print(f"New report: {event.src_path}")

class LogsHandler(FileSystemEventHandler):
    def on_modified(self, event):
        print(f"Log updated: {event.src_path}")

observer = Observer()
observer.schedule(ReportsHandler(), "/path/to/reports", recursive=True)
observer.schedule(LogsHandler(), "/path/to/logs", recursive=True)
observer.start()
```

### Graceful Shutdown

```python
import signal
import sys

observer = Observer()
observer.schedule(handler, path, recursive=True)
observer.start()

def shutdown(signum, frame):
    """Handle Ctrl+C gracefully."""
    print("\nShutting down...")
    observer.stop()
    observer.join()
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

# Keep main thread alive
while observer.is_alive():
    observer.join(1)
```

---

## Thread Safety with Async

Watchdog runs in a **separate thread**, but your FastAPI/asyncio application runs in the **main thread**. You cannot directly call async functions from watchdog's thread.

### The Problem

```python
# ❌ WRONG: This will crash or hang
class BadHandler(FileSystemEventHandler):
    async def process_file(self, filepath):
        await database.insert(filepath)  # Async function

    def on_created(self, event):
        # Cannot await in sync context!
        await self.process_file(event.src_path)  # SyntaxError!
```

### The Solution: `asyncio.run_coroutine_threadsafe`

```python
import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class AsyncAwareHandler(FileSystemEventHandler):
    """Handler that safely calls async functions."""

    def __init__(self, loop):
        self.loop = loop  # Reference to main event loop

    def on_created(self, event):
        if event.is_directory:
            return

        # Schedule async work on the main thread's event loop
        asyncio.run_coroutine_threadsafe(
            self.process_file(event.src_path),
            self.loop
        )

    async def process_file(self, filepath):
        """This runs on the main thread."""
        await database.insert(filepath)
        print(f"Indexed: {filepath}")


# In your FastAPI app:
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Get the main event loop
    loop = asyncio.get_event_loop()

    # Create observer with loop reference
    observer = Observer()
    handler = AsyncAwareHandler(loop)
    observer.schedule(handler, "reports/", recursive=True)
    observer.start()

    yield  # App runs here

    # Cleanup
    observer.stop()
    observer.join()

app = FastAPI(lifespan=lifespan)
```

### Visual Explanation

```
┌─────────────────────────────────────────────────────────────────┐
│                     Thread Communication                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Watchdog Thread              Main Thread (asyncio)             │
│  ───────────────              ─────────────────────             │
│                                                                  │
│  on_created() fires           Event Loop Running                │
│       │                              ▲                          │
│       │                              │                          │
│       │  run_coroutine_threadsafe() │                          │
│       └──────────────────────────────┘                          │
│                                       │                          │
│                               async process_file()              │
│                               await database.insert()           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Debouncing Events

File editors often create multiple events for a single save (write temp file, rename, etc.). Debouncing prevents duplicate processing.

### Simple Debounce with Time Check

```python
import time
from pathlib import Path

class DebouncedHandler(FileSystemEventHandler):
    """Ignore rapid duplicate events."""

    def __init__(self, debounce_seconds=0.5):
        self.debounce_seconds = debounce_seconds
        self._last_event = {}  # {filepath: timestamp}

    def on_modified(self, event):
        if event.is_directory:
            return

        now = time.time()
        filepath = event.src_path

        # Check if we processed this file recently
        last_time = self._last_event.get(filepath, 0)
        if now - last_time < self.debounce_seconds:
            return  # Skip duplicate

        self._last_event[filepath] = now
        self.process_file(filepath)

    def process_file(self, filepath):
        print(f"Processing: {filepath}")
```

### Advanced Debounce with Threading

```python
import threading
import time

class SmartDebouncedHandler(FileSystemEventHandler):
    """Wait for file to 'settle' before processing."""

    def __init__(self, settle_time=1.0, callback=None):
        self.settle_time = settle_time
        self.callback = callback
        self._pending = {}  # {filepath: timer}
        self._lock = threading.Lock()

    def on_modified(self, event):
        if event.is_directory:
            return

        filepath = event.src_path

        with self._lock:
            # Cancel existing timer for this file
            if filepath in self._pending:
                self._pending[filepath].cancel()

            # Start new timer
            timer = threading.Timer(
                self.settle_time,
                self._handle_settled,
                args=[filepath]
            )
            self._pending[filepath] = timer
            timer.start()

    def _handle_settled(self, filepath):
        """Called after file has settled (no more events)."""
        with self._lock:
            del self._pending[filepath]

        if self.callback:
            self.callback(filepath)
```

---

## Error Handling

### Handling Handler Exceptions

```python
import logging
from watchdog.events import FileSystemEventHandler

logger = logging.getLogger(__name__)

class RobustHandler(FileSystemEventHandler):
    """Handler that catches and logs exceptions."""

    def on_created(self, event):
        try:
            self._handle_created(event)
        except Exception as e:
            logger.error(f"Error handling {event.src_path}: {e}")

    def _handle_created(self, event):
        if event.is_directory:
            return

        # Your processing logic here
        filepath = Path(event.src_path)
        content = filepath.read_text()  # May raise exception
        # Process content...
```

### Handling Observer Failures

```python
import time
import logging

logger = logging.getLogger(__name__)

def start_observer_with_retry(handler, path, max_retries=3):
    """Start observer with automatic retry on failure."""
    retries = 0

    while retries < max_retries:
        try:
            observer = Observer()
            observer.schedule(handler, path, recursive=True)
            observer.start()
            logger.info(f"Observer started for: {path}")
            return observer

        except Exception as e:
            retries += 1
            logger.error(f"Observer failed (attempt {retries}): {e}")
            time.sleep(1)

    raise RuntimeError(f"Failed to start observer after {max_retries} attempts")
```

---

## This Project's Implementation

Personal OS uses watchdog for auto-indexing reports. Here's how it's implemented:

### Location: `web/backend/services/indexer.py`

```python
class FileWatcher:
    """Watch reports directory for changes and auto-index new/modified files."""

    def __init__(self):
        self._observer = None
        self._loop = None

    def start(self):
        """Start watching for file changes."""
        try:
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler

            # Capture the main event loop for thread-safe async calls
            self._loop = asyncio.get_event_loop()
            watcher = self  # Reference for inner class

            class ReportHandler(FileSystemEventHandler):
                def on_created(self, event):
                    if event.is_directory or not event.src_path.endswith('.md'):
                        return
                    filepath = Path(event.src_path)
                    content_type = get_content_type_from_path(filepath)
                    if content_type and watcher._loop:
                        # Schedule async task from watchdog thread
                        asyncio.run_coroutine_threadsafe(
                            index_report_file(filepath, content_type),
                            watcher._loop
                        )
                        logger.info(f"Auto-indexing new file: {filepath.name}")

                def on_modified(self, event):
                    # Similar pattern for modifications
                    ...

            self._observer = Observer()
            handler = ReportHandler()
            self._observer.schedule(handler, str(REPORTS_DIR), recursive=True)
            self._observer.start()
            logger.info(f"File watcher started for: {REPORTS_DIR}")

        except ImportError:
            logger.warning("watchdog not installed - run: pip install watchdog")

    def stop(self):
        """Stop watching for file changes."""
        if self._observer:
            self._observer.stop()
            self._observer.join()
```

### Integration in FastAPI: `web/backend/main.py`

```python
from services.indexer import FileWatcher

# Global file watcher instance
file_watcher = FileWatcher()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await run_initial_index()
    file_watcher.start()

    yield  # App runs here

    # Shutdown
    file_watcher.stop()

app = FastAPI(lifespan=lifespan)
```

### Key Design Decisions

1. **Filter by extension**: Only `.md` files are processed
2. **Recursive watching**: Monitors all subdirectories in `reports/`
3. **Thread-safe async**: Uses `run_coroutine_threadsafe` for database calls
4. **Graceful fallback**: Logs warning if watchdog isn't installed
5. **Lifespan management**: Properly starts/stops with FastAPI

---

## Practice Exercises

### Exercise 1: Log Watcher

Create a watcher that monitors a log file and prints new lines:

```python
# Hint: Track file position and read only new content
class LogWatcher(FileSystemEventHandler):
    def __init__(self, filepath):
        self.filepath = filepath
        self.position = 0  # Last read position

    def on_modified(self, event):
        if event.src_path != str(self.filepath):
            return
        # Read and print new lines...
```

### Exercise 2: Sync Watcher

Create a watcher that syncs files to a backup directory:

```python
# Hint: Copy files on create/modify, delete on delete
import shutil

class SyncHandler(FileSystemEventHandler):
    def __init__(self, source_dir, backup_dir):
        self.source_dir = Path(source_dir)
        self.backup_dir = Path(backup_dir)

    def on_created(self, event):
        # Copy to backup directory...
```

### Exercise 3: Debounced Indexer

Modify the project's FileWatcher to include debouncing:

1. Wait 0.5 seconds after last modification before indexing
2. Handle rapid saves from text editors
3. Test with VS Code auto-save

---

## Summary

| Concept | Key Points |
|---------|------------|
| Observer | Background thread, monitors directories |
| Handler | Your event callback methods |
| Events | created, modified, deleted, moved |
| Thread Safety | Use `run_coroutine_threadsafe` for async |
| Debouncing | Prevent duplicate event handling |

### When to Use Watchdog

- Auto-indexing files (this project)
- Live reload for development
- Log file monitoring
- Backup/sync tools
- Build system triggers

---

*Learning Guide - Watchdog File Monitoring*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
