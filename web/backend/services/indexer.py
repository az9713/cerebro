"""Filesystem indexer - syncs reports and logs with SQLite database."""

import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional
import logging

from config import REPORTS_DIR, LOGS_DIR, CONTENT_TYPES
from database import upsert_report, init_db
from services.parser import parse_report_markdown, parse_date_from_filename

logger = logging.getLogger(__name__)


async def index_report_file(filepath: Path, content_type: str) -> bool:
    """
    Parse and index a single report file.

    Returns True if indexed successfully, False otherwise.
    """
    try:
        stat = filepath.stat()
        content = filepath.read_text(encoding="utf-8")

        parsed = parse_report_markdown(content)

        # Get date from filename or parsed content
        created_at = parse_date_from_filename(filepath.name)
        if not created_at and parsed.get("date"):
            try:
                created_at = datetime.strptime(parsed["date"], "%Y-%m-%d")
            except ValueError:
                created_at = datetime.now()
        elif not created_at:
            created_at = datetime.now()

        await upsert_report({
            "filename": filepath.name,
            "filepath": str(filepath),
            "title": parsed["title"] or filepath.stem,
            "source_url": parsed.get("source"),
            "content_type": content_type,
            "created_at": created_at,
            "file_modified_at": datetime.fromtimestamp(stat.st_mtime),
            "summary": parsed.get("summary"),
            "word_count": len(content.split()),
            "content_text": parsed.get("text_content", ""),
        })

        logger.info(f"Indexed: {filepath.name}")
        return True

    except Exception as e:
        logger.error(f"Failed to index {filepath}: {e}")
        return False


async def run_initial_index():
    """
    Scan filesystem and sync with SQLite.
    Called on application startup.
    """
    logger.info("Starting initial index...")

    # Initialize database schema
    await init_db()

    indexed_count = 0
    error_count = 0

    # Index all report types
    for content_type, type_dir in CONTENT_TYPES.items():
        if not type_dir.exists():
            type_dir.mkdir(parents=True, exist_ok=True)
            continue

        for filepath in type_dir.glob("*.md"):
            if filepath.name.startswith("."):
                continue

            success = await index_report_file(filepath, content_type)
            if success:
                indexed_count += 1
            else:
                error_count += 1

    logger.info(f"Indexing complete: {indexed_count} reports, {error_count} errors")


def get_content_type_from_path(filepath: Path) -> Optional[str]:
    """Determine content type from file path."""
    path_str = str(filepath)

    if "youtube" in path_str:
        return "youtube"
    elif "articles" in path_str:
        return "article"
    elif "papers" in path_str:
        return "paper"
    elif "other" in path_str:
        return "other"

    return None


# Optional: File watcher for live sync
# This can be enabled later if needed

class FileWatcher:
    """Watch reports directory for changes (optional, for live sync)."""

    def __init__(self):
        self._observer = None

    def start(self):
        """Start watching for file changes."""
        try:
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler

            class ReportHandler(FileSystemEventHandler):
                def on_created(self, event):
                    if event.is_directory or not event.src_path.endswith('.md'):
                        return
                    filepath = Path(event.src_path)
                    content_type = get_content_type_from_path(filepath)
                    if content_type:
                        asyncio.create_task(index_report_file(filepath, content_type))

                def on_modified(self, event):
                    if event.is_directory or not event.src_path.endswith('.md'):
                        return
                    filepath = Path(event.src_path)
                    content_type = get_content_type_from_path(filepath)
                    if content_type:
                        asyncio.create_task(index_report_file(filepath, content_type))

            self._observer = Observer()
            handler = ReportHandler()
            self._observer.schedule(handler, str(REPORTS_DIR), recursive=True)
            self._observer.start()
            logger.info("File watcher started")

        except ImportError:
            logger.warning("watchdog not installed, file watcher disabled")

    def stop(self):
        """Stop watching."""
        if self._observer:
            self._observer.stop()
            self._observer.join()
