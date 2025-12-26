# Personal OS - Your Intelligent Content Consumption System

Personal OS is a powerful **content consumption automation system** that helps you **consume, analyze, and remember** content from across the internet. Whether you're watching YouTube videos, reading articles, studying research papers, or listening to podcasts, Personal OS creates structured summaries and insights that you can reference forever.

## What Does Personal OS Do?

Imagine having a personal assistant that:
- **Watches YouTube videos** and extracts the key insights so you don't have to rewatch
- **Reads articles** and summarizes the main points
- **Analyzes research papers** and explains them in plain English
- **Transcribes podcasts** and pulls out actionable takeaways
- **Generates flashcards** for spaced repetition learning
- **Creates weekly digests** of everything you've consumed
- **Exports to Obsidian/Notion** for your personal knowledge base
- **Monitors RSS feeds** and auto-queues new content

That's Personal OS.

## Who Is This For?

- **Lifelong learners** who consume lots of content but forget what they learned
- **Researchers** who need to process many papers quickly
- **Content creators** who need to stay on top of trends
- **Students** studying from video lectures and online resources
- **Professionals** who want to learn efficiently

---

## Quick Start (5 Minutes)

### Prerequisites

You need these installed on your computer:

1. **Python 3.10 or higher** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18 or higher** - [Download Node.js](https://nodejs.org/)
3. **Claude Code CLI** - [Install Claude Code](https://claude.ai/code)
4. **yt-dlp** (for YouTube): `pip install yt-dlp`

### Step 1: Get an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to "API Keys" and create a new key
4. Copy the key (starts with `sk-ant-`)

### Step 2: Set Up the Project

```bash
# Navigate to the project folder
cd /path/to/personal-os

# Set up the backend
cd web/backend
pip install -r requirements.txt

# Create environment file with your API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Optionally add OpenAI key for audio transcription
echo "OPENAI_API_KEY=sk-your-openai-key" >> .env

# Return to project root
cd ../..
```

### Step 3: Start Using It!

**Option A: Use with Claude Code CLI (Recommended)**

```bash
# Open Claude Code in the project
claude

# Analyze a YouTube video
/yt https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Read an article
/read https://example.com/interesting-article

# See what you've analyzed today
/log
```

**Option B: Use the Web Interface**

```bash
# Terminal 1: Start the backend
cd web/backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start the frontend
cd web/frontend
npm install
npm run dev

# Open http://localhost:3000 in your browser
```

---

## All Features at a Glance

### Content Types Supported (10+)

| Type | Command | Example |
|------|---------|---------|
| YouTube Videos | `/yt` | `/yt https://youtube.com/watch?v=...` |
| Articles/Blogs | `/read` | `/read https://example.com/post` |
| Research Papers | `/arxiv` | `/arxiv https://arxiv.org/abs/2401.12345` |
| Podcasts | `/podcast` | `/podcast episode.mp3` or URL |
| PDFs | `/pdf` | `/pdf document.pdf` |
| Twitter Threads | `/thread` | `/thread https://twitter.com/user/status/...` |
| Hacker News | `/hn` | `/hn https://news.ycombinator.com/item?id=...` |
| GitHub Repos | `/github` | `/github https://github.com/user/repo` |
| Books (EPUB) | `/book` | `/book mybook.epub` |
| Newsletters | `/email` | `/email newsletter.txt` |
| Any Text | `/analyze` | `/analyze inbox/notes.txt` |

### Organization & Discovery Features

| Feature | Command | Description |
|---------|---------|-------------|
| Queue | `/queue` | Save content for later batch processing |
| Random | `/random` | Rediscover random past reports |
| Similar | `/similar` | Find related content in your library |
| Activity Log | `/log` | See what you consumed today |

### Automation & Export Features

| Feature | Command | Description |
|---------|---------|-------------|
| RSS Feeds | `/rss` | Subscribe to blogs and YouTube channels |
| Weekly Digest | `/digest` | Generate weekly/monthly summaries |
| Export | `/export` | Export to Obsidian or Notion |
| Flashcards | `/flashcards` | Generate Anki flashcards |
| Batch | `/batch` | Process multiple items at once |

---

## Documentation

| Document | Description | Who Should Read |
|----------|-------------|-----------------|
| **[Quick Start Guide](docs/QUICK_START.md)** | 10 hands-on tutorials with examples | Everyone (start here!) |
| **[User Guide](docs/USER_GUIDE.md)** | Complete feature reference | All users |
| **[Developer Guide](docs/DEVELOPER_GUIDE.md)** | How to extend the system | Developers |
| **[API Reference](docs/API_REFERENCE.md)** | REST API documentation | Developers |
| **[Architecture](docs/ARCHITECTURE.md)** | System design overview | Developers |
| **[Troubleshooting](docs/TROUBLESHOOTING.md)** | Common issues & solutions | Everyone |

### Learning Resources

New to full-stack development or the technologies used? The **[Learning Path](docs/learn/README.md)** provides comprehensive guides:

| Guide | Topics Covered | Time |
|-------|----------------|------|
| [Python for C++/Java Devs](docs/learn/PYTHON_FOR_CPP_JAVA_DEVS.md) | Python syntax, types, OOP | ~3 hours |
| [Modern JavaScript](docs/learn/MODERN_JAVASCRIPT.md) | ES6+, TypeScript basics | ~3 hours |
| [REST API Basics](docs/learn/REST_API_BASICS.md) | HTTP, endpoints, JSON | ~2 hours |
| [Async Programming](docs/learn/ASYNC_PROGRAMMING.md) | Promises, async/await | ~2 hours |
| [React Fundamentals](docs/learn/REACT_FUNDAMENTALS.md) | Components, hooks, state | ~3 hours |
| [Next.js Guide](docs/learn/NEXTJS_GUIDE.md) | App router, SSR | ~2 hours |
| [FastAPI Guide](docs/learn/FASTAPI_GUIDE.md) | Python API development | ~2 hours |
| [Anthropic Claude API](docs/learn/ANTHROPIC_CLAUDE_API.md) | AI integration | ~1 hour |
| [OpenAI Whisper API](docs/learn/OPENAI_WHISPER_API.md) | Audio transcription | ~1 hour |

**Total estimated time:** 18-24 hours to complete all guides

---

## Project Structure

```
personal-os/
├── .claude/               # Claude Code automation
│   ├── commands/          # Slash commands (/yt, /read, etc.)
│   ├── skills/            # Natural language triggers
│   └── agents/            # Specialized background tasks
├── prompts/               # Analysis templates (customizable)
├── inbox/                 # Drop files here for processing
├── reports/               # Generated reports (organized by type)
│   ├── youtube/
│   ├── articles/
│   ├── papers/
│   ├── podcasts/
│   ├── pdfs/
│   ├── github/
│   ├── books/
│   ├── newsletters/
│   ├── threads/
│   ├── hackernews/
│   ├── digests/
│   └── other/
├── logs/                  # Daily activity logs
├── exports/               # Obsidian/Notion/Anki exports
├── data/                  # RSS feeds and app data
├── docs/                  # Documentation
└── web/                   # Web application
    ├── backend/           # Python FastAPI server
    └── frontend/          # React/Next.js interface
```

---

## Three Ways to Use Personal OS

### 1. Slash Commands (Explicit)

Type a command directly for precise control:

```bash
/yt https://youtube.com/watch?v=abc123
/read https://example.com/article
/arxiv https://arxiv.org/abs/2401.12345
```

### 2. Skills (Natural Language)

Just describe what you want in plain English:

```
"Analyze this YouTube video: https://youtube.com/watch?v=abc"
"Summarize this blog post for me"
"What did I read this week?"
```

### 3. Web Interface

Use the graphical dashboard at http://localhost:3000 for:
- Visual content submission
- Browsing reports with search
- Viewing activity logs
- Dark mode support

---

## Example Output

When you run `/yt https://youtube.com/watch?v=example`, you get a structured report:

```markdown
# How to Build Better Habits

**Source**: https://youtube.com/watch?v=example
**Date**: 2024-01-15
**Type**: YouTube Video

---

## Executive Summary
A 2-3 sentence overview of the entire video...

## Key Takeaways
1. Start with habits that take less than 2 minutes
2. Stack new habits onto existing routines
3. Design your environment for success
...

## Actionable Items
- [ ] Identify one habit to start tomorrow
- [ ] Find an existing routine to attach it to
...

## Notable Quotes
> "You don't rise to the level of your goals, you fall to the level of your systems"

---

## My Notes
(Space for your personal notes)
```

---

## Web Application

### Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Quick access to recent reports and analysis |
| **Analyze** | Submit URLs or upload files |
| **Reports** | Browse, search, and view all reports |
| **Activity Log** | View consumption history |
| **Dark Mode** | Easy on the eyes |
| **Model Selection** | Choose Haiku/Sonnet/Opus |

### Quick Start

```bash
# Terminal 1: Backend
cd web/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd web/frontend
npm install
npm run dev

# Open http://localhost:3000
```

### Model Selection & Pricing

| Model | Speed | Quality | Cost per Analysis* |
|-------|-------|---------|-------------------|
| **Haiku** | Fastest | Good | ~$0.01 |
| **Sonnet** | Medium | Excellent | ~$0.05 |
| **Opus** | Slower | Best | ~$0.25 |

*Approximate cost for a typical 10-minute video transcript

---

## Understanding the Prompt System

### Why Enhanced Prompts?

The analysis prompts were designed with two goals:

1. **Maximum Breadth** - Extract ALL significant information, not just top 5-7 points
2. **Maximum Depth** - Capture specifics (numbers, names, quotes) not just summaries

Each prompt includes **12-14 comprehensive sections** that ensure no valuable information is lost.

### Latent Signals

Every prompt includes a **Latent Signals** section that surfaces implied insights:

- **Unstated assumptions** - What does the creator take for granted?
- **Implied predictions** - What future trends are suggested?
- **Hidden motivations** - Why is this being shared now?
- **Second-order effects** - What downstream consequences follow?

### Customizing Prompts

1. Open the appropriate file in `prompts/`
2. Add, remove, or modify sections
3. Save - changes take effect immediately

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "yt-dlp not found" | Run `pip install yt-dlp` |
| "No captions available" | Enable audio transcription with OPENAI_API_KEY |
| "WebFetch failed" | Save content to `inbox/` and use `/analyze` |
| Command not recognized | Restart Claude Code |
| Report not saved | Check that `reports/` folders exist |

See [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for complete solutions.

---

## Getting Help

- **Documentation**: See the `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- **Quick Help**: Run `/help` in Claude Code

---

## Credits

This project is inspired by using Claude Code as a "Personal Operating System" - treating AI as a full-time assistant for knowledge work.

### Built with Claude Code

This entire project - all code, documentation, commands, and skills - was created by [Claude Code](https://claude.ai/code) powered by **Claude Opus 4.5**.

---

## License

This is a personal productivity tool. Use and modify freely for your own purposes.
