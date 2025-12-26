"""SQLite database connection and operations."""

import aiosqlite
from datetime import datetime
from typing import Optional
from pathlib import Path
from config import DATABASE_PATH

# SQL Schema
SCHEMA = """
-- Reports table - indexes filesystem reports for fast querying
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    filepath TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    source_url TEXT,
    content_type TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_modified_at DATETIME NOT NULL,
    summary TEXT,
    word_count INTEGER,
    content_text TEXT,
    is_favorite INTEGER DEFAULT 0
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS reports_fts USING fts5(
    title,
    content_text,
    content='reports',
    content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS reports_ai AFTER INSERT ON reports BEGIN
    INSERT INTO reports_fts(rowid, title, content_text)
    VALUES (new.id, new.title, new.content_text);
END;

CREATE TRIGGER IF NOT EXISTS reports_ad AFTER DELETE ON reports BEGIN
    INSERT INTO reports_fts(reports_fts, rowid, title, content_text)
    VALUES('delete', old.id, old.title, old.content_text);
END;

CREATE TRIGGER IF NOT EXISTS reports_au AFTER UPDATE ON reports BEGIN
    INSERT INTO reports_fts(reports_fts, rowid, title, content_text)
    VALUES('delete', old.id, old.title, old.content_text);
    INSERT INTO reports_fts(rowid, title, content_text)
    VALUES (new.id, new.title, new.content_text);
END;

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_date DATE UNIQUE NOT NULL,
    filepath TEXT NOT NULL,
    videos_count INTEGER DEFAULT 0,
    articles_count INTEGER DEFAULT 0,
    papers_count INTEGER DEFAULT 0,
    indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_modified_at DATETIME NOT NULL
);

-- Analysis jobs tracking
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id TEXT PRIMARY KEY,
    job_type TEXT NOT NULL,
    input_value TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    progress_message TEXT,
    result_filepath TEXT,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6b7280',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Report-Tag junction table
CREATE TABLE IF NOT EXISTS report_tags (
    report_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (report_id, tag_id),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Collection-Report junction table
CREATE TABLE IF NOT EXISTS collection_reports (
    collection_id INTEGER NOT NULL,
    report_id INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, report_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(content_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_report_tags_report ON report_tags(report_id);
CREATE INDEX IF NOT EXISTS idx_report_tags_tag ON report_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_collection_reports_collection ON collection_reports(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_reports_report ON collection_reports(report_id);
"""


async def get_db() -> aiosqlite.Connection:
    """Get database connection."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db():
    """Initialize database with schema."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.executescript(SCHEMA)
        await db.commit()


# Report operations
async def upsert_report(data: dict):
    """Insert or update a report in the database."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Check if report exists
        cursor = await db.execute(
            "SELECT id, file_modified_at FROM reports WHERE filename = ?",
            (data["filename"],)
        )
        existing = await cursor.fetchone()

        if existing:
            # Update if file was modified
            if existing["file_modified_at"] != data["file_modified_at"].isoformat():
                await db.execute("""
                    UPDATE reports SET
                        filepath = ?, title = ?, source_url = ?, content_type = ?,
                        created_at = ?, file_modified_at = ?, summary = ?,
                        word_count = ?, content_text = ?, indexed_at = CURRENT_TIMESTAMP
                    WHERE filename = ?
                """, (
                    data["filepath"], data["title"], data.get("source_url"),
                    data["content_type"], data["created_at"].isoformat(),
                    data["file_modified_at"].isoformat(), data.get("summary"),
                    data.get("word_count"), data.get("content_text"), data["filename"]
                ))
        else:
            # Insert new report
            await db.execute("""
                INSERT INTO reports (
                    filename, filepath, title, source_url, content_type,
                    created_at, file_modified_at, summary, word_count, content_text
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["filename"], data["filepath"], data["title"],
                data.get("source_url"), data["content_type"],
                data["created_at"].isoformat(), data["file_modified_at"].isoformat(),
                data.get("summary"), data.get("word_count"), data.get("content_text")
            ))

        await db.commit()


async def get_reports(
    content_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> tuple[list[dict], int]:
    """Get paginated list of reports."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Build query
        where_clause = "WHERE 1=1"
        params = []

        if content_type:
            where_clause += " AND content_type = ?"
            params.append(content_type)

        # Get total count
        cursor = await db.execute(
            f"SELECT COUNT(*) as count FROM reports {where_clause}",
            params
        )
        total = (await cursor.fetchone())["count"]

        # Get paginated results
        offset = (page - 1) * page_size
        cursor = await db.execute(
            f"""SELECT id, filename, filepath, title, source_url, content_type,
                       created_at, summary, word_count
                FROM reports {where_clause}
                ORDER BY created_at DESC, file_modified_at DESC  -- newest first
                LIMIT ? OFFSET ?""",
            params + [page_size, offset]
        )

        rows = await cursor.fetchall()
        return [dict(row) for row in rows], total


async def get_report_by_id(report_id: int) -> Optional[dict]:
    """Get a single report by ID with full content."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        cursor = await db.execute(
            """SELECT id, filename, filepath, title, source_url, content_type,
                      created_at, summary, word_count
               FROM reports WHERE id = ?""",
            (report_id,)
        )
        row = await cursor.fetchone()

        if row:
            result = dict(row)
            # Read full content from file
            filepath = Path(result["filepath"])
            if filepath.exists():
                result["content"] = filepath.read_text(encoding="utf-8")
            return result
        return None


async def search_reports(query: str, limit: int = 20) -> list[dict]:
    """Full-text search across reports."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        cursor = await db.execute(
            """SELECT r.id, r.title, r.filename, r.content_type, r.created_at,
                      snippet(reports_fts, 1, '<mark>', '</mark>', '...', 32) as snippet
               FROM reports_fts
               JOIN reports r ON reports_fts.rowid = r.id
               WHERE reports_fts MATCH ?
               ORDER BY rank
               LIMIT ?""",
            (query, limit)
        )

        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def delete_report(filepath: str):
    """Delete a report from the database."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("DELETE FROM reports WHERE filepath = ?", (filepath,))
        await db.commit()


# Job operations
async def create_job(job_id: str, job_type: str, input_value: str):
    """Create a new analysis job."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO analysis_jobs (id, job_type, input_value, status)
               VALUES (?, ?, ?, 'pending')""",
            (job_id, job_type, input_value)
        )
        await db.commit()


async def update_job_status(
    job_id: str,
    status: str,
    result_filepath: Optional[str] = None,
    error_message: Optional[str] = None
):
    """Update job status."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        now = datetime.now().isoformat()

        if status == "running":
            await db.execute(
                "UPDATE analysis_jobs SET status = ?, started_at = ? WHERE id = ?",
                (status, now, job_id)
            )
        elif status in ("completed", "failed"):
            await db.execute(
                """UPDATE analysis_jobs SET
                   status = ?, completed_at = ?, result_filepath = ?, error_message = ?
                   WHERE id = ?""",
                (status, now, result_filepath, error_message, job_id)
            )
        else:
            await db.execute(
                "UPDATE analysis_jobs SET status = ? WHERE id = ?",
                (status, job_id)
            )

        await db.commit()


async def update_job_progress(job_id: str, message: str):
    """Update job progress message."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "UPDATE analysis_jobs SET progress_message = ? WHERE id = ?",
            (message, job_id)
        )
        await db.commit()


async def get_job(job_id: str) -> Optional[dict]:
    """Get job by ID."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        cursor = await db.execute(
            "SELECT * FROM analysis_jobs WHERE id = ?",
            (job_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


# Tag operations
async def get_all_tags() -> list[dict]:
    """Get all tags."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM tags ORDER BY name")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def create_tag(name: str, color: str = "#6b7280") -> dict:
    """Create a new tag."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "INSERT INTO tags (name, color) VALUES (?, ?) RETURNING *",
            (name, color)
        )
        row = await cursor.fetchone()
        await db.commit()
        return dict(row)


async def update_tag(tag_id: int, name: str = None, color: str = None) -> Optional[dict]:
    """Update a tag."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        updates = []
        params = []
        if name:
            updates.append("name = ?")
            params.append(name)
        if color:
            updates.append("color = ?")
            params.append(color)
        if not updates:
            return None
        params.append(tag_id)
        cursor = await db.execute(
            f"UPDATE tags SET {', '.join(updates)} WHERE id = ? RETURNING *",
            params
        )
        row = await cursor.fetchone()
        await db.commit()
        return dict(row) if row else None


async def delete_tag(tag_id: int):
    """Delete a tag."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
        await db.commit()


async def add_tag_to_report(report_id: int, tag_id: int):
    """Add a tag to a report."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO report_tags (report_id, tag_id) VALUES (?, ?)",
            (report_id, tag_id)
        )
        await db.commit()


async def remove_tag_from_report(report_id: int, tag_id: int):
    """Remove a tag from a report."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "DELETE FROM report_tags WHERE report_id = ? AND tag_id = ?",
            (report_id, tag_id)
        )
        await db.commit()


async def get_report_tags(report_id: int) -> list[dict]:
    """Get all tags for a report."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT t.* FROM tags t
               JOIN report_tags rt ON t.id = rt.tag_id
               WHERE rt.report_id = ?
               ORDER BY t.name""",
            (report_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_reports_by_tag(tag_id: int) -> list[dict]:
    """Get all reports with a specific tag."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT r.id, r.filename, r.filepath, r.title, r.source_url,
                      r.content_type, r.created_at, r.summary, r.word_count, r.is_favorite
               FROM reports r
               JOIN report_tags rt ON r.id = rt.report_id
               WHERE rt.tag_id = ?
               ORDER BY r.created_at DESC""",
            (tag_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


# Favorite operations
async def toggle_favorite(report_id: int) -> bool:
    """Toggle favorite status for a report. Returns new status."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT is_favorite FROM reports WHERE id = ?",
            (report_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return False
        new_status = 0 if row["is_favorite"] else 1
        await db.execute(
            "UPDATE reports SET is_favorite = ? WHERE id = ?",
            (new_status, report_id)
        )
        await db.commit()
        return bool(new_status)


async def get_favorite_reports() -> list[dict]:
    """Get all favorite reports."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT id, filename, filepath, title, source_url, content_type,
                      created_at, summary, word_count, is_favorite
               FROM reports WHERE is_favorite = 1
               ORDER BY created_at DESC"""
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


# Collection operations
async def get_all_collections() -> list[dict]:
    """Get all collections with report counts."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT c.*, COUNT(cr.report_id) as report_count
               FROM collections c
               LEFT JOIN collection_reports cr ON c.id = cr.collection_id
               GROUP BY c.id
               ORDER BY c.updated_at DESC"""
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def create_collection(name: str, description: str = None, color: str = "#3b82f6") -> dict:
    """Create a new collection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "INSERT INTO collections (name, description, color) VALUES (?, ?, ?) RETURNING *",
            (name, description, color)
        )
        row = await cursor.fetchone()
        await db.commit()
        return dict(row)


async def update_collection(collection_id: int, name: str = None, description: str = None, color: str = None) -> Optional[dict]:
    """Update a collection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        updates = ["updated_at = CURRENT_TIMESTAMP"]
        params = []
        if name:
            updates.append("name = ?")
            params.append(name)
        if description is not None:
            updates.append("description = ?")
            params.append(description)
        if color:
            updates.append("color = ?")
            params.append(color)
        params.append(collection_id)
        cursor = await db.execute(
            f"UPDATE collections SET {', '.join(updates)} WHERE id = ? RETURNING *",
            params
        )
        row = await cursor.fetchone()
        await db.commit()
        return dict(row) if row else None


async def delete_collection(collection_id: int):
    """Delete a collection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("DELETE FROM collections WHERE id = ?", (collection_id,))
        await db.commit()


async def add_report_to_collection(collection_id: int, report_id: int):
    """Add a report to a collection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Get next sort order
        cursor = await db.execute(
            "SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM collection_reports WHERE collection_id = ?",
            (collection_id,)
        )
        row = await cursor.fetchone()
        sort_order = row[0] if row else 0

        await db.execute(
            "INSERT OR IGNORE INTO collection_reports (collection_id, report_id, sort_order) VALUES (?, ?, ?)",
            (collection_id, report_id, sort_order)
        )
        await db.execute(
            "UPDATE collections SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (collection_id,)
        )
        await db.commit()


async def remove_report_from_collection(collection_id: int, report_id: int):
    """Remove a report from a collection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "DELETE FROM collection_reports WHERE collection_id = ? AND report_id = ?",
            (collection_id, report_id)
        )
        await db.execute(
            "UPDATE collections SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (collection_id,)
        )
        await db.commit()


async def get_collection_reports(collection_id: int) -> list[dict]:
    """Get all reports in a collection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT r.id, r.filename, r.filepath, r.title, r.source_url,
                      r.content_type, r.created_at, r.summary, r.word_count, r.is_favorite,
                      cr.sort_order
               FROM reports r
               JOIN collection_reports cr ON r.id = cr.report_id
               WHERE cr.collection_id = ?
               ORDER BY cr.sort_order, r.created_at DESC""",
            (collection_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_report_collections(report_id: int) -> list[dict]:
    """Get all collections containing a report."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT c.* FROM collections c
               JOIN collection_reports cr ON c.id = cr.collection_id
               WHERE cr.report_id = ?
               ORDER BY c.name""",
            (report_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_collection_by_id(collection_id: int) -> Optional[dict]:
    """Get a collection by ID."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT c.*, COUNT(cr.report_id) as report_count
               FROM collections c
               LEFT JOIN collection_reports cr ON c.id = cr.collection_id
               WHERE c.id = ?
               GROUP BY c.id""",
            (collection_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None
