# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal OS is a content consumption automation system that processes and analyzes:
- YouTube video transcripts (via yt-dlp or file upload)
- Blog posts and web articles
- arXiv research papers
- Generic text content

## Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/yt <url-or-file>` | Analyze YouTube video | `/yt https://youtu.be/abc123` |
| `/read <url>` | Analyze web article | `/read https://example.com/post` |
| `/arxiv <url>` | Analyze research paper | `/arxiv https://arxiv.org/abs/2401.12345` |
| `/analyze <file>` | Analyze any content | `/analyze inbox/notes.txt` |
| `/batch <file>` | Process multiple items | `/batch inbox/reading-list.txt` |
| `/log` | Show today's activity | `/log` |

### yt-dlp Command (for YouTube URLs)
```bash
yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --convert-subs srt -o "inbox/%(title)s" "<URL>"
```

## Architecture

```
├── .claude/
│   ├── commands/          # Slash commands (/yt, /read, etc.)
│   ├── skills/            # Auto-invoked skills (natural language triggers)
│   └── agents/            # Specialized agents (markdown-format-verifier)
├── prompts/               # Analysis templates (yt.md, article.md, paper.md, default.md)
├── inbox/                 # Input files and downloaded transcripts
├── reports/               # Output: youtube/, articles/, papers/, other/
└── logs/                  # Activity logs: YYYY-MM-DD.md
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
│   ├── services/   # analyzer.py, content_fetcher.py
│   └── routers/    # API endpoints
└── frontend/       # Next.js 14 (React) - Port 3000
    └── src/app/    # Dashboard, Analyze, Reports, Logs
```

**Quick Start:**
```bash
# 1. Add API key to web/backend/.env
ANTHROPIC_API_KEY=sk-ant-...

# 2. Start backend
cd web/backend && uvicorn main:app --reload --port 8000

# 3. Start frontend
cd web/frontend && npm run dev

# 4. Open http://localhost:3000
```

**Features:**
- Model selection (Haiku/Sonnet/Opus)
- Real-time analysis progress
- Full-text search across reports
- Activity log viewer

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

**Logs:** `YYYY-MM-DD.md` with sections for Videos Watched, Articles Read, Papers Reviewed

## Report Header Format

```markdown
# [Title]

**Source**: [URL or file path]
**Date**: YYYY-MM-DD
**Type**: YouTube / Article / Paper / Other

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

## Error Handling

- **File not found**: Inform user, suggest checking path
- **WebFetch failure**: Suggest copying content manually to `inbox/` and using `/analyze`
- **Missing prompt**: Fall back to `prompts/default.md`
- **yt-dlp not installed**: Tell user to run `pip install yt-dlp`
- **No captions**: Inform user, suggest manual transcript copy

## Key Rules

1. Always read the appropriate prompt file before analyzing
2. Never modify files in `inbox/`
3. Create target folders if they don't exist
4. Always confirm completion with saved file location

---

*This project was built entirely with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5.*
