# SQLite with Async Python Guide

This guide teaches how to use SQLite databases with async Python using `aiosqlite`. Essential for building non-blocking database operations in FastAPI applications.

---

## Table of Contents

1. [Why SQLite?](#why-sqlite)
2. [Sync vs Async Database Access](#sync-vs-async-database-access)
3. [Installing aiosqlite](#installing-aiosqlite)
4. [Basic Operations](#basic-operations)
5. [Connection Management](#connection-management)
6. [CRUD Operations](#crud-operations)
7. [Full-Text Search (FTS5)](#full-text-search-fts5)
8. [Transactions](#transactions)
9. [Schema Migrations](#schema-migrations)
10. [Integration with FastAPI](#integration-with-fastapi)
11. [Common Patterns](#common-patterns)
12. [This Project's Implementation](#this-projects-implementation)
13. [Practice Exercises](#practice-exercises)

---

## Why SQLite?

SQLite is a file-based database that requires no separate server process.

### When to Use SQLite

```
┌─────────────────────────────────────────────────────────────────┐
│                  SQLite vs Other Databases                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SQLite ✓                           PostgreSQL/MySQL             │
│  ─────────                          ─────────────────            │
│  - Single-user apps                 - Multi-user apps           │
│  - Prototypes                       - High concurrency          │
│  - Embedded databases               - Distributed systems       │
│  - Local caching                    - Large datasets (>1TB)     │
│  - Mobile/desktop apps              - Complex queries           │
│  - Development/testing              - Production at scale       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### SQLite Advantages

| Advantage | Description |
|-----------|-------------|
| Zero configuration | No server to set up |
| Single file | Easy to backup, share, deploy |
| Fast reads | Excellent for read-heavy workloads |
| ACID compliant | Full transaction support |
| Cross-platform | Works everywhere Python runs |

### SQLite Limitations

| Limitation | Workaround |
|------------|------------|
| Single writer | Use WAL mode for better concurrency |
| No user management | Rely on file system permissions |
| Limited data types | SQLite is dynamically typed |
| No network access | Use file sharing or sync services |

---

## Sync vs Async Database Access

### The Problem with Sync

```python
# ❌ SYNC: Blocks the event loop
import sqlite3

def get_reports():
    conn = sqlite3.connect('database.db')  # Blocks!
    cursor = conn.execute('SELECT * FROM reports')  # Blocks!
    return cursor.fetchall()  # Blocks!

# In FastAPI, this blocks ALL other requests!
```

### The Async Solution

```python
# ✓ ASYNC: Non-blocking
import aiosqlite

async def get_reports():
    async with aiosqlite.connect('database.db') as db:  # Yields control
        async with db.execute('SELECT * FROM reports') as cursor:  # Yields
            return await cursor.fetchall()  # Yields

# Other requests can be processed while waiting for I/O
```

### Visual Comparison

```
Sync (sqlite3)                 Async (aiosqlite)
──────────────                 ─────────────────

Request 1: ████████████        Request 1: ██  ██  ██
           (blocked)                      │  │  │
                                          │  │  └── fetchall
Request 2: ░░░░░░░░████        Request 2:│██│██│██
           (waiting)                      │  │
                                          │  └── execute
Request 3: ░░░░░░░░░░░░        Request 3:██  ██  ██
           (waiting)                      │
                                          └── connect

Total time: ████████████████   Total time: ██████████
```

---

## Installing aiosqlite

```bash
# Install aiosqlite
pip install aiosqlite

# Already included in requirements.txt:
# aiosqlite>=0.19.0

# Verify installation
python -c "import aiosqlite; print(aiosqlite.__version__)"
```

---

## Basic Operations

### Connecting to Database

```python
import aiosqlite

# Simple connection (auto-closes)
async def example():
    async with aiosqlite.connect('mydb.db') as db:
        # Use db here
        pass
    # Connection auto-closed

# Manual connection management
async def manual():
    db = await aiosqlite.connect('mydb.db')
    try:
        # Use db here
        pass
    finally:
        await db.close()
```

### Executing Queries

```python
async with aiosqlite.connect('mydb.db') as db:
    # Simple query
    await db.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)')

    # Query with parameters (ALWAYS use parameters!)
    await db.execute('INSERT INTO users (name) VALUES (?)', ('Alice',))

    # Commit changes
    await db.commit()
```

### Fetching Results

```python
async with aiosqlite.connect('mydb.db') as db:
    # Fetch all rows
    async with db.execute('SELECT * FROM users') as cursor:
        rows = await cursor.fetchall()
        for row in rows:
            print(row)  # (1, 'Alice')

    # Fetch one row
    async with db.execute('SELECT * FROM users WHERE id = ?', (1,)) as cursor:
        row = await cursor.fetchone()
        print(row)  # (1, 'Alice')

    # Iterate with async for
    async with db.execute('SELECT * FROM users') as cursor:
        async for row in cursor:
            print(row)
```

---

## Connection Management

### Row Factory for Named Access

```python
import aiosqlite

async def get_user(user_id):
    async with aiosqlite.connect('mydb.db') as db:
        # Enable dict-like row access
        db.row_factory = aiosqlite.Row

        async with db.execute(
            'SELECT * FROM users WHERE id = ?', (user_id,)
        ) as cursor:
            row = await cursor.fetchone()

            if row:
                # Access by name instead of index
                print(row['id'])    # 1
                print(row['name'])  # 'Alice'
                return dict(row)    # {'id': 1, 'name': 'Alice'}

    return None
```

### Connection Pool Pattern

```python
from contextlib import asynccontextmanager
from typing import Optional

# Global connection (for simple apps)
_connection: Optional[aiosqlite.Connection] = None

async def get_db() -> aiosqlite.Connection:
    """Get or create database connection."""
    global _connection
    if _connection is None:
        _connection = await aiosqlite.connect('database.db')
        _connection.row_factory = aiosqlite.Row
    return _connection

async def close_db():
    """Close database connection."""
    global _connection
    if _connection:
        await _connection.close()
        _connection = None
```

### WAL Mode for Better Concurrency

```python
async def init_db():
    async with aiosqlite.connect('database.db') as db:
        # Enable Write-Ahead Logging for better concurrency
        await db.execute('PRAGMA journal_mode=WAL')

        # Allow reading while writing
        await db.execute('PRAGMA busy_timeout=5000')  # Wait 5s for locks

        # Create tables
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()
```

---

## CRUD Operations

### Create (INSERT)

```python
async def create_user(name: str, email: str) -> int:
    async with aiosqlite.connect('database.db') as db:
        cursor = await db.execute(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            (name, email)
        )
        await db.commit()
        return cursor.lastrowid  # Returns the new ID
```

### Read (SELECT)

```python
# Get one by ID
async def get_user(user_id: int) -> Optional[dict]:
    async with aiosqlite.connect('database.db') as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            'SELECT * FROM users WHERE id = ?', (user_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

# Get all with pagination
async def get_users(page: int = 1, limit: int = 10) -> list[dict]:
    offset = (page - 1) * limit
    async with aiosqlite.connect('database.db') as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
            (limit, offset)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

# Search
async def search_users(query: str) -> list[dict]:
    async with aiosqlite.connect('database.db') as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            'SELECT * FROM users WHERE name LIKE ?',
            (f'%{query}%',)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
```

### Update

```python
async def update_user(user_id: int, name: str = None, email: str = None) -> bool:
    updates = []
    params = []

    if name is not None:
        updates.append('name = ?')
        params.append(name)
    if email is not None:
        updates.append('email = ?')
        params.append(email)

    if not updates:
        return False

    params.append(user_id)

    async with aiosqlite.connect('database.db') as db:
        cursor = await db.execute(
            f'UPDATE users SET {", ".join(updates)} WHERE id = ?',
            params
        )
        await db.commit()
        return cursor.rowcount > 0
```

### Delete

```python
async def delete_user(user_id: int) -> bool:
    async with aiosqlite.connect('database.db') as db:
        cursor = await db.execute(
            'DELETE FROM users WHERE id = ?', (user_id,)
        )
        await db.commit()
        return cursor.rowcount > 0

async def delete_users(user_ids: list[int]) -> int:
    placeholders = ','.join('?' * len(user_ids))
    async with aiosqlite.connect('database.db') as db:
        cursor = await db.execute(
            f'DELETE FROM users WHERE id IN ({placeholders})',
            user_ids
        )
        await db.commit()
        return cursor.rowcount
```

---

## Full-Text Search (FTS5)

SQLite includes powerful full-text search capabilities.

### Creating FTS Table

```python
async def init_fts():
    async with aiosqlite.connect('database.db') as db:
        # Create main table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create FTS virtual table
        await db.execute('''
            CREATE VIRTUAL TABLE IF NOT EXISTS reports_fts USING fts5(
                title,
                content,
                content='reports',
                content_rowid='id'
            )
        ''')

        # Create triggers to keep FTS in sync
        await db.execute('''
            CREATE TRIGGER IF NOT EXISTS reports_ai AFTER INSERT ON reports BEGIN
                INSERT INTO reports_fts(rowid, title, content)
                VALUES (new.id, new.title, new.content);
            END
        ''')

        await db.execute('''
            CREATE TRIGGER IF NOT EXISTS reports_ad AFTER DELETE ON reports BEGIN
                INSERT INTO reports_fts(reports_fts, rowid, title, content)
                VALUES('delete', old.id, old.title, old.content);
            END
        ''')

        await db.execute('''
            CREATE TRIGGER IF NOT EXISTS reports_au AFTER UPDATE ON reports BEGIN
                INSERT INTO reports_fts(reports_fts, rowid, title, content)
                VALUES('delete', old.id, old.title, old.content);
                INSERT INTO reports_fts(rowid, title, content)
                VALUES (new.id, new.title, new.content);
            END
        ''')

        await db.commit()
```

### Full-Text Queries

```python
async def search_reports(query: str) -> list[dict]:
    async with aiosqlite.connect('database.db') as db:
        db.row_factory = aiosqlite.Row

        # Simple search
        async with db.execute('''
            SELECT r.*, snippet(reports_fts, 1, '<mark>', '</mark>', '...', 20) as snippet
            FROM reports r
            JOIN reports_fts ON r.id = reports_fts.rowid
            WHERE reports_fts MATCH ?
            ORDER BY rank
        ''', (query,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

# FTS5 query syntax examples:
# 'python'          - Contains "python"
# 'python OR java'  - Contains either
# 'python AND java' - Contains both
# '"exact phrase"'  - Exact phrase match
# 'python*'         - Prefix match
# 'python NEAR/3 tutorial'  - Within 3 words
```

---

## Transactions

### Automatic Transactions

```python
async with aiosqlite.connect('database.db') as db:
    # Each statement is auto-committed by default
    await db.execute('INSERT INTO users (name) VALUES (?)', ('Alice',))
    await db.commit()  # Explicitly commit
```

### Manual Transaction Control

```python
async def transfer_funds(from_id: int, to_id: int, amount: float):
    async with aiosqlite.connect('database.db') as db:
        try:
            # Start transaction
            await db.execute('BEGIN TRANSACTION')

            # Deduct from sender
            await db.execute(
                'UPDATE accounts SET balance = balance - ? WHERE id = ?',
                (amount, from_id)
            )

            # Add to receiver
            await db.execute(
                'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                (amount, to_id)
            )

            # Commit if all succeeded
            await db.commit()
            return True

        except Exception as e:
            # Rollback on any error
            await db.rollback()
            raise e
```

### Savepoints

```python
async def complex_operation():
    async with aiosqlite.connect('database.db') as db:
        await db.execute('BEGIN TRANSACTION')

        try:
            # First operation
            await db.execute('INSERT INTO logs (msg) VALUES (?)', ('Start',))

            # Savepoint before risky operation
            await db.execute('SAVEPOINT risky_op')

            try:
                # Risky operation
                await db.execute('INSERT INTO risky_table VALUES (?)', (data,))
            except Exception:
                # Rollback only to savepoint
                await db.execute('ROLLBACK TO risky_op')

            # Continue with other operations
            await db.execute('INSERT INTO logs (msg) VALUES (?)', ('End',))

            await db.commit()

        except Exception:
            await db.rollback()
```

---

## Schema Migrations

### Simple Migration Pattern

```python
MIGRATIONS = [
    # Version 1: Initial schema
    '''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS schema_version (version INTEGER);
    INSERT INTO schema_version (version) VALUES (1);
    ''',

    # Version 2: Add email column
    '''
    ALTER TABLE users ADD COLUMN email TEXT;
    UPDATE schema_version SET version = 2;
    ''',

    # Version 3: Add created_at
    '''
    ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
    UPDATE schema_version SET version = 3;
    ''',
]

async def run_migrations():
    async with aiosqlite.connect('database.db') as db:
        # Get current version
        try:
            async with db.execute('SELECT version FROM schema_version') as cursor:
                row = await cursor.fetchone()
                current_version = row[0] if row else 0
        except:
            current_version = 0

        # Run pending migrations
        for i, migration in enumerate(MIGRATIONS):
            version = i + 1
            if version > current_version:
                print(f'Running migration {version}...')
                await db.executescript(migration)
                await db.commit()

        print(f'Database is at version {len(MIGRATIONS)}')
```

---

## Integration with FastAPI

### Database Setup

```python
# database.py
import aiosqlite
from contextlib import asynccontextmanager

DATABASE_PATH = 'database.db'

async def init_db():
    """Initialize database schema."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()

@asynccontextmanager
async def get_db():
    """Database connection context manager."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()
```

### FastAPI Integration

```python
# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import init_db, get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown (nothing to do)

app = FastAPI(lifespan=lifespan)

@app.get('/reports')
async def list_reports():
    async with get_db() as db:
        async with db.execute('SELECT * FROM reports') as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

@app.get('/reports/{report_id}')
async def get_report(report_id: int):
    async with get_db() as db:
        async with db.execute(
            'SELECT * FROM reports WHERE id = ?', (report_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if row:
                return dict(row)
            return {'error': 'Not found'}, 404

@app.post('/reports')
async def create_report(title: str, content: str):
    async with get_db() as db:
        cursor = await db.execute(
            'INSERT INTO reports (title, content) VALUES (?, ?)',
            (title, content)
        )
        await db.commit()
        return {'id': cursor.lastrowid}

@app.delete('/reports/{report_id}')
async def delete_report(report_id: int):
    async with get_db() as db:
        cursor = await db.execute(
            'DELETE FROM reports WHERE id = ?', (report_id,)
        )
        await db.commit()
        return {'deleted': cursor.rowcount > 0}
```

---

## Common Patterns

### Upsert (Insert or Update)

```python
async def upsert_report(data: dict):
    async with aiosqlite.connect('database.db') as db:
        await db.execute('''
            INSERT INTO reports (filename, title, content)
            VALUES (:filename, :title, :content)
            ON CONFLICT(filename) DO UPDATE SET
                title = excluded.title,
                content = excluded.content,
                updated_at = CURRENT_TIMESTAMP
        ''', data)
        await db.commit()
```

### Bulk Insert

```python
async def bulk_insert_reports(reports: list[dict]):
    async with aiosqlite.connect('database.db') as db:
        await db.executemany(
            'INSERT INTO reports (title, content) VALUES (?, ?)',
            [(r['title'], r['content']) for r in reports]
        )
        await db.commit()
```

### Count with Filters

```python
async def count_reports(content_type: str = None) -> int:
    async with aiosqlite.connect('database.db') as db:
        if content_type:
            async with db.execute(
                'SELECT COUNT(*) FROM reports WHERE content_type = ?',
                (content_type,)
            ) as cursor:
                row = await cursor.fetchone()
        else:
            async with db.execute('SELECT COUNT(*) FROM reports') as cursor:
                row = await cursor.fetchone()

        return row[0]
```

---

## This Project's Implementation

Personal OS uses aiosqlite for all database operations.

### Location: `web/backend/database.py`

### Schema

```python
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

-- Triggers to keep FTS in sync (shown earlier)
"""
```

### Key Functions

```python
async def init_db():
    """Initialize database with schema."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.executescript(SCHEMA)
        await db.commit()

async def upsert_report(data: dict):
    """Insert or update a report."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute('''
            INSERT INTO reports (filename, filepath, title, ...)
            VALUES (:filename, :filepath, :title, ...)
            ON CONFLICT(filename) DO UPDATE SET
                title = excluded.title,
                ...
        ''', data)
        await db.commit()

async def search_reports(query: str) -> list[dict]:
    """Full-text search across reports."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute('''
            SELECT r.*, snippet(reports_fts, 1, '<mark>', '</mark>', '...', 20) as snippet
            FROM reports r
            JOIN reports_fts ON r.id = reports_fts.rowid
            WHERE reports_fts MATCH ?
            ORDER BY rank
            LIMIT 50
        ''', (query,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def delete_report(report_id: int) -> bool:
    """Delete a report by ID."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            'DELETE FROM reports WHERE id = ?', (report_id,)
        )
        await db.commit()
        return cursor.rowcount > 0
```

---

## Practice Exercises

### Exercise 1: Tag System

Create a tagging system for reports:

```python
# Schema
# - tags(id, name, color)
# - report_tags(report_id, tag_id)

# Functions to implement:
async def create_tag(name: str, color: str) -> int: ...
async def add_tag_to_report(report_id: int, tag_id: int): ...
async def get_reports_by_tag(tag_id: int) -> list[dict]: ...
async def get_tags_for_report(report_id: int) -> list[dict]: ...
```

### Exercise 2: Activity Log

Track user activity:

```python
# Log each action with timestamp
async def log_activity(action: str, report_id: int = None): ...

# Get activity for a date range
async def get_activity(start: date, end: date) -> list[dict]: ...

# Get activity summary
async def get_activity_summary() -> dict: ...
```

### Exercise 3: Full-Text Search

Implement advanced search:

```python
# Search with filters
async def advanced_search(
    query: str,
    content_type: str = None,
    start_date: date = None,
    end_date: date = None,
    limit: int = 10
) -> list[dict]: ...
```

---

## Summary

| Concept | Key Points |
|---------|------------|
| aiosqlite | Async wrapper for sqlite3 |
| Connection | Use `async with aiosqlite.connect()` |
| Queries | Use `db.execute(sql, params)` |
| Fetching | `fetchone()`, `fetchall()`, `async for` |
| Transactions | `db.commit()`, `db.rollback()` |
| FTS5 | Full-text search with virtual tables |

### Best Practices

1. Always use parameterized queries (never string formatting)
2. Use `row_factory = aiosqlite.Row` for named access
3. Enable WAL mode for better concurrency
4. Keep connections short-lived (context manager pattern)
5. Use triggers to keep FTS tables in sync

---

*Learning Guide - SQLite with Async Python*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
