# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal OS is a comprehensive content consumption automation system that processes and analyzes:
- YouTube video transcripts (via yt-dlp or file upload)
- Blog posts and web articles
- arXiv research papers
- Podcast episodes (with audio transcription)
- PDF documents
- GitHub repositories
- EPUB books
- Hacker News posts
- Twitter/X threads
- Email newsletters
- Generic text content

## Commands

### Content Analysis Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/yt <url-or-file>` | Analyze YouTube video | `/yt https://youtu.be/abc123` |
| `/read <url>` | Analyze web article | `/read https://example.com/post` |
| `/arxiv <url>` | Analyze research paper | `/arxiv https://arxiv.org/abs/2401.12345` |
| `/podcast <file-or-url>` | Analyze podcast episode | `/podcast inbox/episode.mp3` |
| `/pdf <file>` | Analyze PDF document | `/pdf inbox/document.pdf` |
| `/github <url>` | Analyze GitHub repository | `/github https://github.com/user/repo` |
| `/book <file>` | Analyze EPUB book | `/book inbox/book.epub` |
| `/hn <url>` | Analyze Hacker News post | `/hn https://news.ycombinator.com/item?id=123` |
| `/thread <url>` | Analyze Twitter thread | `/thread https://twitter.com/user/status/123` |
| `/email <file>` | Analyze newsletter | `/email inbox/newsletter.txt` |
| `/analyze <file>` | Analyze any content | `/analyze inbox/notes.txt` |
| `/batch <file>` | Process multiple items | `/batch inbox/reading-list.txt` |

### Organization Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/queue add <url>` | Add to processing queue | `/queue add https://youtu.be/abc` |
| `/queue list` | Show queued items | `/queue list` |
| `/queue process` | Process all queued items | `/queue process` |
| `/log` | Show today's activity | `/log` |
| `/random` | Surface random past report | `/random youtube` |
| `/similar <topic>` | Find related content | `/similar "machine learning"` |

### Automation Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/rss add <url>` | Subscribe to RSS feed | `/rss add https://blog.com/feed.xml` |
| `/rss list` | List subscribed feeds | `/rss list` |
| `/rss check` | Check for new content | `/rss check` |
| `/digest` | Generate weekly digest | `/digest` |
| `/export obsidian` | Export to Obsidian | `/export obsidian` |
| `/export notion` | Export to Notion | `/export notion` |
| `/flashcards <report>` | Generate Anki flashcards | `/flashcards all` |

### yt-dlp Command (for YouTube URLs)
```bash
yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --convert-subs srt -o "inbox/%(title)s" "<URL>"
```

## Architecture

```
├── .claude/
│   ├── commands/          # Slash commands (20 commands)
│   ├── skills/            # Auto-invoked skills (6 skills)
│   └── agents/            # Specialized agents
├── prompts/               # Analysis templates (12 templates)
│   ├── yt.md, article.md, paper.md, podcast.md
│   ├── pdf.md, github.md, book.md, hn.md
│   ├── thread.md, newsletter.md, digest.md
│   └── default.md
├── inbox/                 # Input files and downloaded content
├── reports/               # Generated reports (12 categories)
│   ├── youtube/, articles/, papers/, podcasts/
│   ├── pdfs/, github/, books/, hackernews/
│   ├── threads/, newsletters/, digests/
│   └── other/
├── logs/                  # Activity logs: YYYY-MM-DD.md
├── exports/               # Obsidian/Anki exports
├── data/                  # queue.json, rss_feeds.json
└── docs/                  # Documentation
```

### Three Automation Methods

**Commands** (`.claude/commands/*.md`): Explicit `/command` invocation using `$ARGUMENTS` placeholder

**Skills** (`.claude/skills/*/SKILL.md`): Automatic invocation via natural language - triggered when user mentions YouTube, arXiv, article, etc.

**Agents** (`.claude/agents/*.md`): Specialized background agents for complex tasks

Both commands and skills produce identical output using shared prompts from `prompts/`.

## Web Application

A full-stack web UI is available in `web/` for graphical content analysis:

```
web/
├── backend/        # FastAPI (Python) - Port 8000
│   ├── main.py     # Entry point
│   ├── config.py   # Settings, models
│   ├── database.py # SQLite async database
│   ├── routers/    # API endpoints (18 routers)
│   │   ├── reports.py, analysis.py, logs.py, batch.py
│   │   ├── tags.py, collections.py, rss.py, export.py
│   │   ├── transcription.py, knowledge_graph.py, qa.py
│   │   ├── comparison.py, tts.py, reviews.py
│   │   ├── credibility.py, goals.py, translate.py
│   │   └── recommendations.py
│   └── services/   # Business logic (12 services)
│       ├── analyzer.py, content_fetcher.py, indexer.py, parser.py
│       ├── transcription.py, rss.py, digest.py, export.py
│       ├── concept_extractor.py, qa_service.py, comparison_service.py
│       ├── tts_service.py, credibility_service.py
│       └── flashcards.py
├── frontend/       # Next.js 14 (React) - Port 3000
│   └── src/
│       ├── app/    # Pages (12 routes)
│       │   ├── page.tsx (Dashboard)
│       │   ├── analyze/, reports/, logs/, search/
│       │   ├── qa/, compare/, review/, goals/
│       │   ├── discover/, knowledge-graph/
│       │   └── reports/[id]/ (detail with tools)
│       ├── components/  # UI components (15 components)
│       │   ├── Sidebar.tsx, ReportViewer.tsx, ThemeProvider.tsx
│       │   ├── AudioPlayer.tsx, CredibilityPanel.tsx, TranslationPanel.tsx
│       │   ├── ReportCard.tsx, AnalysisForm.tsx, ActivityLog.tsx
│       │   ├── Toast.tsx, ConfirmDialog.tsx, DropdownMenu.tsx
│       │   ├── MoveCategoryDialog.tsx, ProgressIndicator.tsx
│       │   └── MarkdownRenderer.tsx, Skeleton.tsx
│       └── lib/api.ts  # API client functions
└── extension/      # Chrome Extension (Manifest V3)
    ├── manifest.json, popup.html, popup.js
    ├── background.js, options.html
    └── README.md
```

**Quick Start:**
```bash
# 1. Add API keys to web/backend/.env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # Optional, for audio transcription

# 2. Start backend
cd web/backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# 3. Start frontend
cd web/frontend && npm install && npm run dev

# 4. Open http://localhost:3000
```

**Core Features:**
- Model selection (Haiku/Sonnet/Opus)
- Real-time analysis progress
- Full-text search across reports
- Activity log viewer
- Tags and collections
- Dark mode

**AI-Powered Features:**
- **Knowledge Graph**: Visual concept map extracted from all reports
- **Q&A System**: Ask questions across your entire knowledge base
- **Content Comparison**: Side-by-side AI analysis of two reports
- **Source Credibility**: AI-powered trustworthiness analysis
- **Smart Recommendations**: Personalized content suggestions with trending topics

**Learning Features:**
- **Spaced Repetition**: SM-2 algorithm for long-term retention
- **Learning Goals**: Track progress toward learning objectives
- **Audio Reports (TTS)**: Listen to reports via text-to-speech
- **Multi-Language Translation**: Translate reports to 10+ languages

**File Management Features:**
- **Delete Reports**: Single and bulk delete with confirmation dialogs
- **Move to Category**: Change report's content type (moves file on disk)
- **Bulk Selection Mode**: Select multiple reports with checkboxes
- **Keyboard Shortcuts**: Delete, Ctrl+A (select all), Escape (exit selection)
- **Auto-Indexing**: FileWatcher monitors reports folder for real-time sync

**Browser Extension:**
- Chrome extension for one-click content saving
- Context menu integration
- Queue management for batch processing

Both CLI and Web UI produce identical reports to `reports/` and `logs/`.

## New Feature Details

### 1. Knowledge Graph Visualization
Automatically extracts concepts, entities, and relationships from reports to build a visual knowledge map.

**Backend:** `routers/knowledge_graph.py`, `services/concept_extractor.py`
**Frontend:** `/knowledge-graph` page with interactive canvas visualization
**API Endpoints:**
- `GET /api/knowledge-graph` - Get graph nodes and links
- `GET /api/knowledge-graph/concept/{id}` - Get concept details with linked reports
- `POST /api/knowledge-graph/extract/{report_id}` - Extract concepts from a report
- `POST /api/knowledge-graph/extract-all` - Batch extraction from all reports

### 2. AI-Powered Q&A System
Ask natural language questions across your entire knowledge base with source citations.

**Backend:** `routers/qa.py`, `services/qa_service.py`
**Frontend:** `/qa` page with chat interface
**API Endpoints:**
- `POST /api/qa` - Ask a question (returns answer with sources)
- `GET /api/qa/suggestions` - Get suggested questions based on content

### 3. Content Comparison Mode
Compare two reports side-by-side with AI-generated analysis of similarities and differences.

**Backend:** `routers/comparison.py`, `services/comparison_service.py`
**Frontend:** `/compare` page with dual-pane view
**API Endpoints:**
- `POST /api/comparison` - Compare two reports
- `GET /api/comparison/suggestions/{report_id}` - Get comparison suggestions

### 4. Browser Extension
Chrome extension (Manifest V3) for one-click content saving directly to Personal OS.

**Location:** `extension/` folder
**Features:**
- Popup UI for quick analysis
- Context menu integration
- Queue management
- Model selection

**Installation:** Load unpacked in `chrome://extensions/` with Developer Mode enabled

### 5. Audio Report Generation (TTS)
Convert reports to audio using OpenAI's text-to-speech API.

**Backend:** `routers/tts.py`, `services/tts_service.py`
**Frontend:** `AudioPlayer` component on report detail pages
**API Endpoints:**
- `GET /api/tts/voices` - List available voices
- `POST /api/tts/{report_id}` - Generate audio for a report
- `GET /api/tts/{report_id}` - Get existing audio versions
- `GET /api/tts/{report_id}/stream/{voice}` - Stream audio file

**Requires:** `OPENAI_API_KEY` in `.env`

### 6. Spaced Repetition Review System
SM-2 algorithm implementation for long-term knowledge retention.

**Backend:** `routers/reviews.py`
**Frontend:** `/review` page with flashcard-style interface
**API Endpoints:**
- `GET /api/reviews/due` - Get reports due for review
- `POST /api/reviews/add` - Add report to review queue
- `POST /api/reviews/{report_id}/review` - Submit review rating (0-5)
- `GET /api/reviews/stats` - Get review statistics

**Algorithm:** SM-2 with ease factors, intervals, and repetition tracking

### 7. Source Credibility Analysis
AI-powered analysis of source trustworthiness with detailed scoring.

**Backend:** `routers/credibility.py`, `services/credibility_service.py`
**Frontend:** `CredibilityPanel` component on report detail pages
**API Endpoints:**
- `GET /api/credibility/{report_id}` - Analyze report credibility

**Scores Include:**
- Overall credibility score (0-100)
- Source quality, evidence quality, bias level, fact-checkability
- Red flags and strengths
- Actionable recommendations

### 8. Learning Goals & Progress Tracking
Set and track learning objectives with keyword-based report linking.

**Backend:** `routers/goals.py`
**Frontend:** `/goals` page with CRUD and progress visualization
**API Endpoints:**
- `GET /api/goals` - List all goals with progress
- `POST /api/goals` - Create a new goal
- `GET /api/goals/{id}` - Get goal with linked reports
- `PUT /api/goals/{id}` - Update goal status
- `DELETE /api/goals/{id}` - Delete a goal
- `POST /api/goals/{id}/reports/{report_id}` - Link report to goal

### 9. Multi-Language Translation
Translate reports to 10+ languages using Claude AI.

**Backend:** `routers/translate.py`
**Frontend:** `TranslationPanel` component on report detail pages
**API Endpoints:**
- `GET /api/translate/languages` - List supported languages
- `POST /api/translate/{report_id}` - Translate report

**Supported Languages:** Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, Arabic

### 10. Smart Content Recommendations
Personalized content suggestions based on reading patterns and trending topics.

**Backend:** `routers/recommendations.py`
**Frontend:** `/discover` page with recommendations and trending topics
**API Endpoints:**
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/recommendations/similar/{report_id}` - Find similar reports
- `GET /api/recommendations/trending` - Get trending topics

### 11. File Management System
Complete report file management with delete, bulk operations, and category moves.

**Backend:** `routers/reports.py`, `database.py`
**Frontend:** `/reports` page with selection mode, `/reports/[id]` with action buttons
**New Components:**
- `Toast.tsx` - Toast notification system with success/error/info variants
- `ConfirmDialog.tsx` - Reusable confirmation modal with danger variant
- `DropdownMenu.tsx` - Kebab menu component with click-outside handling
- `MoveCategoryDialog.tsx` - Category selection modal with radio buttons

**API Endpoints:**
- `DELETE /api/reports/{id}` - Delete single report (file + DB record)
- `POST /api/reports/bulk-delete` - Delete multiple reports at once
- `PATCH /api/reports/{id}/category` - Move report to different category

**Keyboard Shortcuts (in selection mode):**
- `Delete` - Delete selected reports
- `Ctrl+A` / `Cmd+A` - Select all visible reports
- `Escape` - Exit selection mode

### 12. Auto-Indexing with FileWatcher
Real-time filesystem monitoring for automatic database synchronization.

**Backend:** `services/indexer.py`, `main.py`
**Technology:** `watchdog` library for cross-platform file monitoring

**Behavior:**
- Starts automatically when backend launches
- Monitors `reports/` folder recursively for `.md` file changes
- Auto-indexes new files within seconds of creation
- Auto-removes deleted files from database
- Debounces rapid changes to prevent duplicate indexing
- Logs all indexing activity for debugging

**No manual sync required** - the database stays in sync with the filesystem automatically

## Prompt System Philosophy

The analysis prompts are designed with two core principles:

1. **Maximum Breadth** - Extract ALL significant information, not just top 5-7 points
2. **Maximum Depth** - Capture specifics (numbers, names, quotes) not just summaries

Each prompt includes 12-14 comprehensive sections including a **Latent Signals** section for implied insights.

### Prompt Files

| File | Content Type | Sections |
|------|--------------|----------|
| `prompts/yt.md` | YouTube videos | 12 |
| `prompts/article.md` | Articles/blogs | 13 |
| `prompts/paper.md` | Research papers | 14 |
| `prompts/podcast.md` | Podcast episodes | 12 |
| `prompts/pdf.md` | PDF documents | 12 |
| `prompts/github.md` | GitHub repositories | 10 |
| `prompts/book.md` | EPUB books | 14 |
| `prompts/hn.md` | Hacker News posts | 10 |
| `prompts/thread.md` | Twitter threads | 10 |
| `prompts/newsletter.md` | Newsletters | 12 |
| `prompts/digest.md` | Weekly digests | 8 |
| `prompts/default.md` | Generic content | 12 |

### Latent Signals

Every prompt includes instructions to surface implied insights:
- Unstated assumptions
- Implied predictions
- Hidden motivations
- Second-order effects
- Market/industry signals
- Contrarian indicators

**Important:** Only include genuine inferences. Do NOT fabricate signals if none exist.

## Audio Transcription

For podcasts and YouTube videos without captions, audio transcription is available:

1. **OpenAI Whisper API** (recommended): Set `OPENAI_API_KEY` in `.env`
2. **Local Whisper**: Install `pip install openai-whisper`

The system automatically falls back to audio transcription when captions aren't available.

## Agents

| Agent | Purpose | Trigger |
|-------|---------|---------|
| `markdown-format-verifier` | Verify markdown formatting across codebase | "check markdown format", "validate .md files" |

## Standard Workflow

Every analysis follows these steps:

1. Read content (file or fetch URL)
2. Load appropriate prompt from `prompts/`
3. Analyze content per prompt structure
4. Save report to `reports/{category}/YYYY-MM-DD_sanitized-title.md`
5. Append entry to `logs/YYYY-MM-DD.md`
6. Confirm to user

## File Naming

**Reports:** `YYYY-MM-DD_sanitized-title.md`
- Lowercase, spaces→hyphens, no special chars, max 50 chars for title

**Logs:** `YYYY-MM-DD.md` with sections for Videos Watched, Articles Read, Papers Reviewed, etc.

## Report Header Format

```markdown
# [Title]

**Source**: [URL or file path]
**Date**: YYYY-MM-DD
**Type**: YouTube / Article / Paper / Podcast / PDF / GitHub / Book / HN / Thread / Newsletter / Other

---

[Analysis content]

---

## My Notes

```

## Log Entry Format

```markdown
- [Title](../reports/{category}/filename.md) - HH:MM
```

## Prerequisites

- **yt-dlp**: Required for YouTube URLs. Install: `pip install yt-dlp`
- **Whisper** (optional): For audio transcription. Set `OPENAI_API_KEY` or install `pip install openai-whisper`

## Error Handling

- **File not found**: Inform user, suggest checking path
- **WebFetch failure**: Suggest copying content manually to `inbox/` and using `/analyze`
- **Missing prompt**: Fall back to `prompts/default.md`
- **yt-dlp not installed**: Tell user to run `pip install yt-dlp`
- **No captions**: Attempt audio transcription if Whisper is configured, otherwise inform user
- **Audio transcription failed**: Inform user, suggest manual transcript copy
- **Rate limit**: Suggest using a smaller model (Haiku) or waiting

## Key Rules

1. Always read the appropriate prompt file before analyzing
2. Never modify files in `inbox/`
3. Create target folders if they don't exist
4. Always confirm completion with saved file location
5. Use the queue system for batch operations
6. Log all analyses to daily activity log

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/QUICK_START.md` | 10 hands-on tutorials |
| `docs/USER_GUIDE.md` | Complete user reference |
| `docs/DEVELOPER_GUIDE.md` | Developer documentation |
| `docs/API_REFERENCE.md` | REST API documentation |
| `docs/ARCHITECTURE.md` | System architecture |
| `docs/TROUBLESHOOTING.md` | Common issues & solutions |

---

*This project was built entirely with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5.*
