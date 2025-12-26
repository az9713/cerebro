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
│   ├── routers/    # API endpoints (reports, analysis, logs, batch, tags, collections, rss, export, transcription)
│   └── services/   # Business logic (analyzer, content_fetcher, transcription, rss, digest, export, flashcards)
└── frontend/       # Next.js 14 (React) - Port 3000
    └── src/app/    # Dashboard, Analyze, Reports, Logs, Search
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

**Features:**
- Model selection (Haiku/Sonnet/Opus)
- Real-time analysis progress
- Full-text search across reports
- Activity log viewer
- Tags and collections
- Dark mode

Both CLI and Web UI produce identical reports to `reports/` and `logs/`.

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
