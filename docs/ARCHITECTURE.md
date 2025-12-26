# System Architecture

This document provides a comprehensive overview of Personal OS's architecture, explaining how all components work together to create a seamless content consumption system.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Deep Dive](#component-deep-dive)
4. [Data Flow](#data-flow)
5. [File System Design](#file-system-design)
6. [Claude Code Integration](#claude-code-integration)
7. [Web Application Architecture](#web-application-architecture)
8. [Database Design](#database-design)
9. [External Services](#external-services)
10. [AI-Powered Features Architecture](#ai-powered-features-architecture)
11. [Design Decisions](#design-decisions)
12. [Scalability Considerations](#scalability-considerations)

---

## System Overview

Personal OS is a **content consumption automation system** that combines:

1. **Claude Code CLI** - Natural language interface for content analysis
2. **FastAPI Backend** - REST API for programmatic access
3. **Next.js Frontend** - Web-based graphical interface
4. **Anthropic Claude** - AI-powered content analysis
5. **File System** - Source of truth for all reports and logs

### Core Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                    FILE SYSTEM = TRUTH                       │
│                                                              │
│  All reports, logs, and exports are plain Markdown files.   │
│  The database is just an index for fast querying.           │
│  You can always access your data without the application.   │
└─────────────────────────────────────────────────────────────┘
```

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACES                            │
├─────────────────────────┬─────────────────────────┬────────────────────┤
│     Claude Code CLI     │      Web Frontend       │     REST API       │
│   (Natural Language)    │   (Next.js + React)     │    (FastAPI)       │
│                         │                         │                    │
│  • /yt, /read, /arxiv   │  • Dashboard            │  • Programmatic    │
│  • Natural language     │  • Visual analysis      │  • Integration     │
│  • Skills & commands    │  • Search & browse      │  • Automation      │
└───────────┬─────────────┴───────────┬─────────────┴──────────┬─────────┘
            │                         │                        │
            ▼                         ▼                        │
┌─────────────────────────────────────────────────────────────────────────┐
│                          PROCESSING LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  Content    │  │   Analysis   │  │   Report    │  │    Log       │  │
│  │  Fetcher    │──│   Engine     │──│  Generator  │──│   Writer     │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └──────────────┘  │
│        │                 │                                              │
│        ▼                 ▼                                              │
│  ┌─────────────┐  ┌──────────────┐                                     │
│  │ Transcriber │  │   Prompt     │                                     │
│  │  (Whisper)  │  │   Loader     │                                     │
│  └─────────────┘  └──────────────┘                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            │                         │
            ▼                         ▼
┌───────────────────────────┐  ┌─────────────────────────────────────────┐
│    EXTERNAL SERVICES      │  │            STORAGE LAYER                │
├───────────────────────────┤  ├─────────────────────────────────────────┤
│                           │  │                                         │
│  ┌─────────────────────┐  │  │  ┌─────────────┐   ┌──────────────────┐│
│  │   Anthropic API     │  │  │  │ File System │   │  SQLite Database ││
│  │   (Claude Models)   │  │  │  │  (Primary)  │   │    (Index)       ││
│  └─────────────────────┘  │  │  └─────────────┘   └──────────────────┘│
│                           │  │                                         │
│  ┌─────────────────────┐  │  │  reports/           │                   │
│  │   OpenAI Whisper    │  │  │  ├── youtube/       │  reports table   │
│  │  (Transcription)    │  │  │  ├── articles/      │  analysis_jobs   │
│  └─────────────────────┘  │  │  ├── papers/        │  tags table      │
│                           │  │  └── ...            │  collections     │
│  ┌─────────────────────┐  │  │                     │                   │
│  │     yt-dlp          │  │  │  logs/              │                   │
│  │  (YouTube/Audio)    │  │  │  └── YYYY-MM-DD.md  │                   │
│  └─────────────────────┘  │  │                                         │
│                           │  │  data/                                  │
│  ┌─────────────────────┐  │  │  ├── queue.json                        │
│  │   HTTP Client       │  │  │  └── rss_feeds.json                    │
│  │  (Web Fetching)     │  │  │                                         │
│  └─────────────────────┘  │  └─────────────────────────────────────────┘
└───────────────────────────┘
```

---

## Component Deep Dive

### 1. User Interfaces

#### Claude Code CLI

The primary interface for power users. Provides:

- **Slash Commands** (`.claude/commands/`): Explicit invocation like `/yt`, `/read`
- **Skills** (`.claude/skills/`): Automatic detection from natural language
- **Agents** (`.claude/agents/`): Background specialized tasks

```
User: "Analyze this YouTube video https://..."

     ↓ Claude Code detects 'YouTube' keyword
     ↓ Triggers youtube-analysis skill
     ↓ Executes same workflow as /yt command

Result: Structured report saved to reports/youtube/
```

#### Web Frontend (Next.js 14)

React-based SPA with:

- **App Router**: File-based routing (`app/page.tsx`)
- **Server Components**: Where applicable for performance
- **Client Components**: For interactive features
- **Tailwind CSS**: Utility-first styling

#### REST API (FastAPI)

Python-based API providing:

- **OpenAPI/Swagger**: Auto-generated documentation
- **Async Support**: Non-blocking I/O operations
- **Background Tasks**: Long-running analysis jobs
- **SSE/WebSocket**: Real-time status updates

### 2. Processing Layer

#### Content Fetcher

Responsible for acquiring content from various sources:

```python
# web/backend/services/content_fetcher.py

async def fetch_youtube_transcript(url: str) -> tuple[str, str, str]:
    """
    Uses yt-dlp to download auto-generated or manual captions.
    Falls back to audio transcription if no captions available.

    Returns: (transcript_text, video_title, source_url)
    """

async def fetch_article_content(url: str) -> tuple[str, str, str]:
    """
    Uses httpx to fetch HTML, then extracts main article text.
    Handles paywalls gracefully with error messages.

    Returns: (article_text, title, source_url)
    """

async def fetch_arxiv_content(url: str) -> tuple[str, str, str]:
    """
    Fetches paper abstract and metadata from arXiv API.
    Optionally downloads and extracts PDF content.

    Returns: (paper_content, title, source_url)
    """
```

#### Analysis Engine

The core AI integration:

```python
# web/backend/services/analyzer.py

async def analyze_content(
    content: str,
    title: str,
    source: str,
    content_type: str,
    model_key: str,
    job_id: str
) -> str:
    """
    1. Load appropriate prompt from prompts/{content_type}.md
    2. Construct messages with content and prompt
    3. Call Anthropic API with selected model
    4. Format response as Markdown report
    5. Save to appropriate reports/ subdirectory
    6. Update activity log
    7. Trigger database re-index

    Returns: Path to saved report file
    """
```

#### Prompt Loader

Dynamic prompt selection based on content type:

```python
def load_prompt(content_type: str) -> str:
    """
    Priority order:
    1. prompts/{content_type}.md
    2. prompts/default.md

    Prompts contain analysis instructions with 12-14 sections
    including Latent Signals for implied insights.
    """
```

### 3. Transcription Service

Audio-to-text conversion using Whisper:

```python
# web/backend/services/transcription.py

class TranscriptionService:
    """
    Supports two modes:
    1. OpenAI Whisper API (cloud, requires OPENAI_API_KEY)
    2. Local Whisper model (offline, requires whisper package)

    Used for:
    - Podcast episodes
    - YouTube videos without captions
    - Audio recordings
    """

    async def transcribe(self, audio_path: str) -> str:
        if self.use_openai:
            return await self._transcribe_openai(audio_path)
        else:
            return await self._transcribe_local(audio_path)
```

---

## Data Flow

### Analysis Request Flow

```
┌──────────┐    ┌─────────────────┐    ┌──────────────┐
│  User    │───▶│  Interface      │───▶│  Content     │
│  Input   │    │  (CLI/Web/API)  │    │  Fetcher     │
└──────────┘    └─────────────────┘    └──────┬───────┘
                                              │
                                              ▼
┌──────────┐    ┌─────────────────┐    ┌──────────────┐
│  Report  │◀───│  Report         │◀───│  Analysis    │
│  File    │    │  Generator      │    │  Engine      │
└────┬─────┘    └─────────────────┘    └──────┬───────┘
     │                                        │
     │                                        ▼
     │          ┌─────────────────┐    ┌──────────────┐
     │          │  Log            │◀───│  Anthropic   │
     │          │  Writer         │    │  API         │
     │          └────────┬────────┘    └──────────────┘
     │                   │
     ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                   FILE SYSTEM                        │
├─────────────────────────────────────────────────────┤
│  reports/youtube/2024-01-15_video-title.md          │
│  logs/2024-01-15.md                                 │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼ (Indexer)
                    ┌──────────────┐
                    │   SQLite     │
                    │   Database   │
                    └──────────────┘
```

### Detailed Steps

1. **User submits URL** via CLI command, skill trigger, or web form
2. **Content Fetcher** acquires content (transcript, article text, etc.)
3. **Prompt Loader** selects appropriate analysis template
4. **Analysis Engine** sends content + prompt to Anthropic API
5. **Report Generator** formats AI response as Markdown
6. **Log Writer** appends entry to daily activity log
7. **File System** stores report and log files
8. **Indexer** syncs files to SQLite for fast search

---

## File System Design

### Directory Structure

```
personal-os/
│
├── reports/                    # Generated analysis reports
│   ├── youtube/                # YouTube video analyses
│   │   └── YYYY-MM-DD_title.md
│   ├── articles/               # Web article analyses
│   ├── papers/                 # arXiv paper analyses
│   ├── podcasts/               # Podcast episode analyses
│   ├── pdfs/                   # PDF document analyses
│   ├── github/                 # GitHub repo analyses
│   ├── books/                  # EPUB book analyses
│   ├── hackernews/             # Hacker News analyses
│   ├── threads/                # Twitter thread analyses
│   ├── newsletters/            # Email newsletter analyses
│   ├── digests/                # Weekly digest summaries
│   └── other/                  # Fallback for misc content
│
├── logs/                       # Daily activity logs
│   └── YYYY-MM-DD.md           # One file per day
│
├── inbox/                      # User drop zone for files
│
├── prompts/                    # Analysis templates
│   ├── yt.md                   # YouTube-specific prompt
│   ├── article.md              # Article-specific prompt
│   └── ...                     # One per content type
│
├── exports/                    # Exported content
│   ├── obsidian/               # Obsidian vault format
│   └── anki/                   # Anki flashcard decks
│
└── data/                       # Application data
    ├── queue.json              # Pending content queue
    └── rss_feeds.json          # RSS subscriptions
```

### File Naming Convention

**Reports:** `YYYY-MM-DD_sanitized-title.md`

```
Sanitization rules:
1. Lowercase everything
2. Replace spaces with hyphens
3. Remove special characters except hyphens
4. Truncate title to 50 characters
5. Prepend date for chronological sorting

Example:
"How to Build GREAT Habits!" → "2024-01-15_how-to-build-great-habits.md"
```

**Logs:** `YYYY-MM-DD.md`

```
Simple date-based naming allows:
1. Easy sorting
2. One file per day
3. Human-readable without tooling
```

### Report File Format

Every report follows a consistent structure:

```markdown
# [Title]

**Source**: [URL or file path]
**Date**: YYYY-MM-DD
**Type**: YouTube / Article / Paper / etc.

---

## Executive Summary
[2-3 sentence overview]

## Key Takeaways
[Bullet list of main points]

## Notable Quotes
[Direct quotes with timestamps/citations]

## Actionable Items
[Concrete next steps]

## Latent Signals
[Implied insights, assumptions, predictions]

---

## My Notes
[Space for user annotations]
```

---

## Claude Code Integration

### Commands vs Skills vs Agents

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CLAUDE CODE AUTOMATION                          │
├────────────────────┬────────────────────┬───────────────────────────┤
│      COMMANDS      │       SKILLS       │         AGENTS            │
├────────────────────┼────────────────────┼───────────────────────────┤
│ .claude/commands/  │ .claude/skills/    │ .claude/agents/           │
│ *.md files         │ */SKILL.md         │ *.md files                │
│                    │                    │                           │
│ Explicit trigger   │ Auto-triggered     │ Specialized tasks         │
│ /yt, /read, etc.   │ Natural language   │ Background work           │
│                    │                    │                           │
│ Uses $ARGUMENTS    │ Extracts context   │ Complex multi-step        │
│ placeholder        │ from message       │ operations                │
├────────────────────┴────────────────────┴───────────────────────────┤
│                                                                      │
│  Both Commands and Skills use the same prompts from prompts/         │
│  and produce identical output to reports/ and logs/                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Command File Structure

```markdown
---
description: Brief description shown in /help
---

# Command instructions here

Use $ARGUMENTS to access user input.

Example: /yt $ARGUMENTS
         ↓
         $ARGUMENTS = "https://youtube.com/watch?v=abc"
```

### Skill File Structure

```markdown
---
name: skill-name-lowercase
description: Description with trigger words. Max 1024 chars.
---

# Skill instructions here

Claude auto-invokes when user message matches trigger words.
Extract URL or content from user's natural language.
```

---

## Web Application Architecture

### Backend (FastAPI)

```
web/backend/
├── main.py                 # Application entry point
│   └── Creates FastAPI app
│   └── Mounts routers
│   └── Configures CORS
│   └── Starts background indexer
│
├── config.py               # Configuration
│   └── API keys
│   └── Model definitions
│   └── Path constants
│
├── database.py             # SQLite setup
│   └── Table definitions
│   └── Connection pool
│   └── Query helpers
│
├── routers/                # API endpoints (18 routers)
│   ├── reports.py          # CRUD for reports
│   ├── analysis.py         # Submit analysis jobs
│   ├── logs.py             # Activity log access
│   ├── batch.py            # Multi-item processing
│   ├── tags.py             # Tag management
│   ├── collections.py      # Collection management
│   ├── rss.py              # Feed subscriptions
│   ├── export.py           # Export functions
│   ├── transcription.py    # Audio transcription
│   ├── knowledge_graph.py  # Knowledge graph API (NEW)
│   ├── qa.py               # Q&A system API (NEW)
│   ├── comparison.py       # Content comparison API (NEW)
│   ├── tts.py              # Text-to-speech API (NEW)
│   ├── spaced_repetition.py # Spaced repetition API (NEW)
│   ├── credibility.py      # Credibility analysis API (NEW)
│   ├── goals.py            # Learning goals API (NEW)
│   ├── translate.py        # Translation API (NEW)
│   └── recommendations.py  # Recommendations API (NEW)
│
└── services/               # Business logic (12 services)
    ├── analyzer.py         # Core analysis
    ├── content_fetcher.py  # Content acquisition
    ├── indexer.py          # DB sync
    ├── parser.py           # Markdown parsing
    ├── transcription.py    # Whisper integration
    ├── rss.py              # Feed monitoring
    ├── digest.py           # Summary generation
    ├── export.py           # Export logic
    ├── flashcards.py       # Card generation
    ├── knowledge_graph.py  # Concept extraction (NEW)
    ├── spaced_repetition.py # SM-2 algorithm (NEW)
    └── similarity.py       # Content similarity (NEW)
```

### Frontend (Next.js 14)

```
web/frontend/src/
├── app/                    # App Router pages
│   ├── layout.tsx          # Root layout (sidebar)
│   ├── page.tsx            # Dashboard
│   ├── analyze/
│   │   └── page.tsx        # Analysis form
│   ├── reports/
│   │   ├── page.tsx        # Report list
│   │   └── [id]/
│   │       └── page.tsx    # Report detail with tools
│   ├── logs/
│   │   └── page.tsx        # Activity log
│   ├── search/
│   │   └── page.tsx        # Full-text search
│   ├── knowledge-graph/
│   │   └── page.tsx        # Knowledge graph visualization (NEW)
│   ├── qa/
│   │   └── page.tsx        # Q&A interface (NEW)
│   ├── compare/
│   │   └── page.tsx        # Content comparison (NEW)
│   ├── review/
│   │   └── page.tsx        # Spaced repetition review (NEW)
│   ├── goals/
│   │   └── page.tsx        # Learning goals (NEW)
│   └── discover/
│       └── page.tsx        # Recommendations & discovery (NEW)
│
├── components/             # Reusable components
│   ├── Layout.tsx          # Main layout
│   ├── Sidebar.tsx         # Navigation (11 nav items)
│   ├── ThemeProvider.tsx   # Dark mode context (NEW)
│   ├── AnalysisForm.tsx    # URL submission
│   ├── ReportCard.tsx      # Report list item
│   ├── ReportViewer.tsx    # Markdown renderer
│   ├── ProgressIndicator.tsx
│   ├── AudioPlayer.tsx     # TTS audio player (NEW)
│   ├── CredibilityPanel.tsx # Credibility analysis (NEW)
│   ├── TranslationPanel.tsx # Translation controls (NEW)
│   └── KnowledgeGraph.tsx  # D3.js graph visualization (NEW)
│
└── lib/
    └── api.ts              # Backend API client (all endpoints)
```

### API Client Pattern

```typescript
// frontend/src/lib/api.ts

const API_BASE = 'http://localhost:8000';

export const api = {
  // Reports
  async getReports(page = 1, type?: string) {
    const params = new URLSearchParams({ page: String(page) });
    if (type) params.set('type', type);
    const res = await fetch(`${API_BASE}/api/reports?${params}`);
    return res.json();
  },

  // Analysis
  async analyzeYoutube(url: string, model: string) {
    const res = await fetch(`${API_BASE}/api/analysis/youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, model }),
    });
    return res.json();
  },

  // Job status polling
  async pollJobStatus(jobId: string, onUpdate: (status) => void) {
    const poll = async () => {
      const status = await this.getJobStatus(jobId);
      onUpdate(status);
      if (status.status === 'pending' || status.status === 'running') {
        setTimeout(poll, 2000);
      }
    };
    poll();
  }
};
```

---

## Database Design

### Schema

```sql
-- Primary reports table (indexes filesystem)
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    filepath TEXT NOT NULL,
    title TEXT,
    source_url TEXT,
    content_type TEXT,  -- 'youtube', 'article', 'paper', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,       -- First paragraph for preview
    word_count INTEGER,
    content_text TEXT   -- Full text for FTS
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE reports_fts USING fts5(
    title,
    content_text,
    content='reports',
    content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER reports_ai AFTER INSERT ON reports BEGIN
    INSERT INTO reports_fts(rowid, title, content_text)
    VALUES (new.id, new.title, new.content_text);
END;

-- Analysis job tracking
CREATE TABLE analysis_jobs (
    id TEXT PRIMARY KEY,              -- UUID
    job_type TEXT NOT NULL,           -- 'youtube', 'article', etc.
    input_value TEXT NOT NULL,        -- URL or file path
    status TEXT DEFAULT 'pending',    -- 'pending', 'running', 'completed', 'failed'
    progress_message TEXT,
    result_filepath TEXT,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- Tags
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6B7280'
);

-- Report-Tag relationship
CREATE TABLE report_tags (
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, tag_id)
);

-- Collections
CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Collection-Report relationship
CREATE TABLE collection_reports (
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, report_id)
);

-- RSS feed subscriptions
CREATE TABLE rss_feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    content_type TEXT DEFAULT 'article',
    last_checked DATETIME,
    last_item_date DATETIME
);

-- Learning goals (NEW)
CREATE TABLE learning_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    target_count INTEGER DEFAULT 10,
    keywords TEXT,              -- Comma-separated keywords
    deadline DATETIME,
    current_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Spaced repetition schedule (NEW)
CREATE TABLE spaced_repetition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    ease_factor REAL DEFAULT 2.5,      -- SM-2 ease factor
    interval INTEGER DEFAULT 1,         -- Days until next review
    repetitions INTEGER DEFAULT 0,      -- Number of successful reviews
    next_review DATETIME,
    last_review DATETIME,
    UNIQUE(report_id)
);

-- Q&A history (NEW)
CREATE TABLE qa_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    citations TEXT,             -- JSON array of report IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge graph concepts (NEW)
CREATE TABLE concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    frequency INTEGER DEFAULT 1,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Concept-Report relationship (NEW)
CREATE TABLE concept_reports (
    concept_id INTEGER REFERENCES concepts(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    PRIMARY KEY (concept_id, report_id)
);

-- TTS audio files (NEW)
CREATE TABLE tts_audio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    voice TEXT DEFAULT 'alloy',
    audio_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, voice)
);
```

### Indexer Design

The indexer maintains database-filesystem consistency:

```python
# web/backend/services/indexer.py

async def run_initial_index():
    """
    Called at startup:
    1. Scan all files in reports/
    2. Compare against database entries
    3. Add new files to database
    4. Remove orphaned database entries
    5. Update FTS index
    """

async def index_single_report(filepath: str):
    """
    Called after new report is saved:
    1. Parse markdown file
    2. Extract metadata (title, source, type)
    3. Insert/update database record
    4. Update FTS index
    """
```

---

## External Services

### Anthropic Claude API

Primary AI service for content analysis:

```python
# Integration in analyzer.py

import anthropic

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

response = client.messages.create(
    model=MODELS[model_key]["id"],
    max_tokens=8192,
    messages=[
        {"role": "user", "content": f"{prompt}\n\nContent:\n{content}"}
    ]
)
```

**Models available:**
| Key | Model ID | Use Case |
|-----|----------|----------|
| haiku | claude-3-5-haiku-latest | Fast, economical |
| sonnet | claude-sonnet-4-20250514 | Balanced default |
| opus | claude-opus-4-20250514 | Highest quality |

### OpenAI Whisper API

Audio transcription service:

```python
# Integration in transcription.py

import openai

client = openai.OpenAI(api_key=OPENAI_API_KEY)

with open(audio_path, "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        response_format="text"
    )
```

### yt-dlp

YouTube content acquisition:

```bash
# Download captions
yt-dlp --write-auto-sub --write-sub \
       --sub-lang en \
       --skip-download \
       --convert-subs srt \
       -o "inbox/%(title)s" \
       "<URL>"

# Download audio (for transcription)
yt-dlp -x --audio-format mp3 \
       -o "inbox/%(title)s.%(ext)s" \
       "<URL>"
```

---

## AI-Powered Features Architecture

Personal OS includes 10 advanced AI-powered features that enhance learning and content consumption.

### Feature Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         AI-POWERED FEATURES                                   │
├─────────────────────────────────────────────────────────────────────────────┬┤
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Knowledge Graph    │  │  Q&A System         │  │  Comparison Mode    │  │
│  │  (Concept mapping)  │  │  (Cross-report Q&A) │  │  (Side-by-side)     │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Audio Reports      │  │  Spaced Repetition  │  │  Credibility        │  │
│  │  (TTS via OpenAI)   │  │  (SM-2 algorithm)   │  │  (Source analysis)  │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Learning Goals     │  │  Translation        │  │  Recommendations    │  │
│  │  (Progress track)   │  │  (Multi-language)   │  │  (Smart discovery)  │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                              │
│  ┌─────────────────────┐                                                     │
│  │  Browser Extension  │                                                     │
│  │  (Chrome analysis)  │                                                     │
│  └─────────────────────┘                                                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1. Knowledge Graph

Extracts concepts from reports and visualizes relationships.

**Data Flow:**
```
Reports → Concept Extractor → concepts table → Graph API → D3.js Visualization
```

**Key Components:**
- `services/knowledge_graph.py` - Concept extraction logic
- `routers/knowledge_graph.py` - REST API endpoints
- `KnowledgeGraph.tsx` - D3.js interactive visualization

### 2. Q&A System

Ask questions across your entire knowledge base.

**Data Flow:**
```
Question → Search Reports → Extract Context → Claude AI → Answer + Citations
```

**Key Components:**
- `routers/qa.py` - Question submission and history
- Uses existing report search + Claude for synthesis

### 3. Content Comparison

AI-powered side-by-side analysis of two reports.

**Data Flow:**
```
Report A + Report B → Claude AI → Comparison Analysis (similarities, differences, insights)
```

### 4. Text-to-Speech

Generate audio versions of reports using OpenAI TTS.

**Data Flow:**
```
Report → OpenAI TTS API → Audio file (.mp3) → tts_audio table → Streaming playback
```

**Prerequisites:** `OPENAI_API_KEY` environment variable

### 5. Spaced Repetition

SM-2 algorithm for optimal review scheduling.

**Data Flow:**
```
Review Rating (1-5) → SM-2 Algorithm → Update ease_factor, interval → Schedule next review
```

**SM-2 Implementation:**
```python
# Simplified SM-2 formula
if rating >= 3:  # Successful recall
    if repetitions == 0:
        interval = 1
    elif repetitions == 1:
        interval = 6
    else:
        interval = round(interval * ease_factor)
    ease_factor = max(1.3, ease_factor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)))
    repetitions += 1
else:  # Failed recall
    repetitions = 0
    interval = 1
```

### 6. Source Credibility

AI-powered trustworthiness analysis.

**Analysis Dimensions:**
- Evidence quality (citations, data, methodology)
- Source reliability (author expertise, publication reputation)
- Bias detection (language patterns, selective reporting)
- Fact-checkable claims identification

### 7. Learning Goals

Track progress toward learning objectives.

**Matching Logic:**
```python
# Keywords match against report titles and content
matching_reports = [r for r in reports
                   if any(kw.lower() in r.content.lower()
                         for kw in goal.keywords)]
goal.current_count = len(matching_reports)
```

### 8. Multi-Language Translation

Translate reports using Claude AI.

**Supported Languages:** Spanish, French, German, Chinese, Japanese, Korean, Russian, Arabic, Portuguese, Italian, Dutch, Hindi

### 9. Smart Recommendations

Personalized content suggestions.

**Recommendation Algorithm:**
1. Analyze user's reading history
2. Extract frequently occurring keywords/concepts
3. Score unread reports by keyword overlap
4. Return top matches with relevance scores

### 10. Browser Extension

Chrome extension for in-browser analysis.

**Architecture:**
```
extension/
├── manifest.json      # Extension config (Manifest V3)
├── popup.html/js      # Extension popup UI
├── content.js         # Page content extraction
└── background.js      # API communication with backend
```

---

## Design Decisions

### Why File System as Source of Truth?

1. **Portability**: Move/backup your data without database migration
2. **Readability**: Open any report in any text editor
3. **Version Control**: Git-track your knowledge base
4. **Tool Agnostic**: Works with Obsidian, VS Code, or any tool
5. **Simplicity**: No database corruption risks

### Why SQLite for Indexing?

1. **Zero Configuration**: No server to run
2. **Fast Full-Text Search**: FTS5 extension
3. **Portable**: Single file, easy backup
4. **Good Enough**: For personal use (10k-100k reports)

### Why Anthropic Claude?

1. **Quality**: Best-in-class analysis and summarization
2. **Context Window**: 200k tokens handles long content
3. **Reliability**: Stable API with good rate limits
4. **Model Options**: Haiku for speed, Opus for quality

### Why FastAPI?

1. **Async Native**: Non-blocking I/O for API calls
2. **Type Safety**: Pydantic validation
3. **Auto-Docs**: OpenAPI/Swagger out of the box
4. **Python**: Same language as Claude SDK

### Why Next.js 14?

1. **App Router**: Modern React patterns
2. **Server Components**: Performance benefits
3. **File-Based Routing**: Simple navigation
4. **Tailwind Integration**: Rapid UI development

---

## Scalability Considerations

### Current Limits

The current architecture handles:

- **Reports**: 10,000+ without performance issues
- **Concurrent Analysis**: 5-10 simultaneous jobs
- **Search Speed**: <100ms for full-text queries
- **Storage**: Limited by disk space

### Scaling Paths

If you need to scale beyond personal use:

#### Database

```
SQLite → PostgreSQL
- Better concurrent writes
- More robust FTS
- Network access
```

#### Analysis Queue

```
Background Tasks → Celery + Redis
- Distributed processing
- Better job management
- Retry logic
```

#### File Storage

```
Local Files → S3 + CDN
- Unlimited storage
- Geographic distribution
- Backup built-in
```

#### API

```
Single Process → Multiple Workers + Load Balancer
- Horizontal scaling
- High availability
- Better resource utilization
```

---

## Security Considerations

### API Keys

- Store in `.env` file (not committed)
- Never expose in frontend code
- Consider key rotation

### File Access

- Validate file paths to prevent directory traversal
- Sanitize user input before file operations
- Restrict file types for uploads

### Web Security

- CORS configured for localhost only
- Consider adding authentication for production
- Validate all user inputs

---

*Architecture Document - Last updated: 2025-12-26*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
