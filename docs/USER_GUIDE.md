# Complete User Guide

## Table of Contents

1. [Introduction](#1-introduction)
2. [Prerequisites & Installation](#2-prerequisites--installation)
3. [Understanding the System](#3-understanding-the-system)
4. [Daily Workflow](#4-daily-workflow)
5. [Command Reference](#5-command-reference)
6. [Content Types](#6-content-types)
7. [Organization Features](#7-organization-features)
8. [Automation Features](#8-automation-features)
9. [Web Application](#9-web-application)
10. [Customizing Prompts](#10-customizing-prompts)
11. [Troubleshooting](#11-troubleshooting)
12. [FAQ](#12-faq)

---

## 1. Introduction

### What Is Personal OS?

Personal OS is a content consumption automation system built on Claude Code. It transforms the manual process of:

1. Finding content (videos, articles, papers)
2. Copying it to an AI chatbot
3. Getting analysis
4. Saving the results

Into an automated workflow where you simply:

1. Provide a file path or URL
2. Get a professionally formatted report saved automatically

### Who Is This For?

- **Knowledge workers** who consume lots of content
- **Researchers** who need to process many papers
- **Lifelong learners** who watch educational videos
- **Anyone** who wants to remember and organize what they learn

### What You Can Do

Personal OS gives you **two ways** to trigger the same workflows:

| Task | Command (Explicit) | Or Say (Natural Language) | Result |
|------|---------|--------|--------|
| Analyze a YouTube video | `/yt inbox/video.txt` | "Analyze this YouTube transcript" | Detailed summary with key takeaways |
| Read a blog post | `/read https://...` | "Summarize this blog post" | Analysis with main arguments |
| Understand a research paper | `/arxiv https://...` | "Explain this arXiv paper" | Plain English explanation |
| Process many items at once | `/batch inbox/list.txt` | "Process my reading list" | Multiple reports generated |
| Track your learning | `/log` | "What did I watch today?" | See what you've consumed |

**Both methods produce identical results** - use whichever feels more natural!

---

## 2. Prerequisites & Installation

### What You Need

1. **A Windows Computer**
   - Windows 10 or Windows 11
   - Any modern PC or laptop

2. **Claude Code Installed**
   - Download from: https://claude.ai/download
   - Follow installation instructions on that page

3. **An Anthropic Account**
   - Free or paid subscription
   - Claude Code will prompt you to sign in

4. **yt-dlp (Recommended for YouTube)**
   - Enables analyzing YouTube videos directly from URLs
   - Install with: `pip install yt-dlp`
   - Optional but highly recommended

### Verifying Claude Code Is Working

1. Open any terminal (Command Prompt or PowerShell)
2. Type: `claude --version`
3. You should see version information

If you see an error, Claude Code isn't installed correctly. Visit the download page for help.

### First-Time Setup

The Personal OS folder is already set up for you. No additional installation needed!

Just navigate to the folder and start using it.

---

## 3. Understanding the System

### The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR INPUT                                │
│  (YouTube transcript, blog URL, arXiv URL, any text file)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   SLASH COMMAND          │  │   SKILL                  │
│   (Explicit)             │  │   (Natural Language)     │
│   Type: /yt, /read       │  │   Say: "Analyze this..." │
│   .claude/commands/      │  │   .claude/skills/        │
└──────────────────────────┘  └──────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYSIS PROMPT                             │
│  (prompts/yt.md, prompts/article.md, etc.)                      │
│  Defines HOW to analyze (the analysis style)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR OUTPUT                               │
│  Report saved to reports/ folder                                │
│  Activity logged to logs/ folder                                │
└─────────────────────────────────────────────────────────────────┘
```

**Two Paths, Same Destination:** Whether you use a slash command or natural language, you get the same high-quality report.

### Folder Structure Deep Dive

```
cerebro/
│
├── .claude/                  # CLAUDE CODE AUTOMATION
│   ├── commands/             # SLASH COMMANDS (explicit: /yt, /read, etc.)
│   │   ├── yt.md             # /yt command - YouTube analysis
│   │   ├── read.md           # /read command - Web articles
│   │   ├── arxiv.md          # /arxiv command - Research papers
│   │   ├── analyze.md        # /analyze command - Generic content
│   │   ├── batch.md          # /batch command - Multiple items
│   │   └── log.md            # /log command - Activity log
│   │                         # EDIT THESE to change command behavior!
│   │
│   └── skills/               # SKILLS (automatic, natural language)
│       ├── youtube-analysis/     # "Analyze this video transcript"
│       │   └── SKILL.md
│       ├── article-analysis/     # "Summarize this blog post"
│       │   └── SKILL.md
│       ├── arxiv-analysis/       # "Explain this research paper"
│       │   └── SKILL.md
│       ├── content-analysis/     # "Analyze these notes"
│       │   └── SKILL.md
│       ├── batch-processing/     # "Process my reading list"
│       │   └── SKILL.md
│       └── activity-log/         # "What did I watch today?"
│           └── SKILL.md
│                                 # Claude auto-detects which skill to use!
│   │
├── CLAUDE.md                 # PROJECT INSTRUCTIONS
│   │                         # General guidance for Claude
│   │                         # Referenced by commands for context
│   │
├── inbox/                    # YOUR INPUT FOLDER
│   │                         # Put any content you want analyzed here.
│   │                         # - YouTube transcripts (.txt)
│   │                         # - Copied article text (.txt)
│   │                         # - Batch lists (.txt)
│   │                         # - Any other content
│   │
├── prompts/                  # ANALYSIS STYLE (how content is analyzed)
│   ├── yt.md                 # How to analyze YouTube videos
│   ├── article.md            # How to analyze articles/blogs
│   ├── paper.md              # How to analyze research papers
│   └── default.md            # How to analyze generic content
│   │                         #
│   │                         # EDIT THESE to customize your reports!
│   │
├── reports/                  # YOUR OUTPUT FOLDER
│   ├── youtube/              # Video analyses go here
│   ├── articles/             # Article analyses go here
│   ├── papers/               # Paper analyses go here
│   └── other/                # Everything else goes here
│   │                         #
│   │                         # Reports are named: YYYY-MM-DD_title.md
│   │
├── logs/                     # YOUR ACTIVITY TRACKER
│   └── YYYY-MM-DD.md         # One file per day
│                             # Lists everything you analyzed that day
│
└── docs/                     # DOCUMENTATION
    ├── QUICK_START.md        # 14 example use cases
    ├── USER_GUIDE.md         # This file
    └── DEVELOPER_GUIDE.md    # For extending the system
```

### Commands vs Skills vs Prompts (Important!)

**Commands** (`.claude/commands/`) define **explicit** workflows:
- User-invoked with `/command`
- The workflow steps
- What files to read
- Where to save output
- How to log activity

**Skills** (`.claude/skills/`) define **automatic** workflows:
- Model-invoked based on natural language
- Claude auto-detects when relevant
- Same workflows as commands
- Same output locations

**Prompts** (`prompts/`) define **how** content is analyzed:
- What sections to include in reports
- How detailed each section should be
- The format and style of analysis
- Used by both commands AND skills

**Example:** Both of these produce the same result:
- Type `/yt inbox/video.txt` → Uses `/yt` command
- Say "Analyze this YouTube transcript at inbox/video.txt" → Uses `youtube-analysis` skill

Both paths:
1. Read the content file
2. Apply `prompts/yt.md` analysis
3. Save to `reports/youtube/`
4. Log activity

### How Commands Work

When you type a command like `/yt inbox/video.txt`:

1. **Claude Code loads the command file** - Reads `.claude/commands/yt.md`
2. **`$ARGUMENTS` gets replaced** - With `inbox/video.txt`
3. **Claude follows the command instructions:**
   - Reads the content file
   - Reads the prompt file (`prompts/yt.md`)
   - Applies the analysis
   - Saves report to `reports/youtube/`
   - Logs activity to `logs/YYYY-MM-DD.md`

### How Skills Work

When you say "Analyze this YouTube transcript at inbox/video.txt":

1. **Claude reads skill descriptions** - Checks `.claude/skills/*/SKILL.md` files
2. **Matches your request to a skill** - Finds `youtube-analysis` matches
3. **Claude follows the skill instructions:**
   - Same workflow as the corresponding command
   - Same prompt file, same output location
   - Identical result to using `/yt`

---

## 4. Daily Workflow

### Recommended Daily Routine

**Morning (5 minutes):**
1. Open Claude Code in the Personal OS folder
2. Check yesterday's log: `/log`
3. Review any reports you want to revisit

**Throughout the Day:**
1. Save interesting content to `inbox/`
2. Analyze when you have time
3. Or create a batch list for later

**End of Day (10 minutes):**
1. Process your batch list: `/batch inbox/today.txt`
2. Review today's log: `/log`
3. Optional: Read through new reports

### Starting a Session

**Step 1: Open Terminal**

Option A - File Explorer:
1. Open File Explorer
2. Navigate to `cerebro`
3. Click address bar, type `cmd`, press Enter

Option B - Start Menu:
1. Press Windows key
2. Type `cmd`, press Enter
3. Type: `cd path\to\personal_os` (replace with your actual folder path)

**Step 2: Start Claude Code**
```
claude
```

**Step 3: You're Ready!**

You'll see Claude's prompt. Start using commands.

### Ending a Session

Just type:
```
/exit
```

Or close the terminal window.

---

## 5. Command Reference

Personal OS provides **20+ commands** for different content types and tasks. You can also use natural language - Claude will automatically invoke the right skill.

### Content Analysis Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/yt <url-or-file>` | Analyze YouTube video | `/yt https://youtu.be/abc123` |
| `/read <url>` | Analyze web article | `/read https://example.com/post` |
| `/arxiv <url>` | Analyze research paper | `/arxiv https://arxiv.org/abs/2401.12345` |
| `/podcast <file-or-url>` | Analyze podcast episode | `/podcast inbox/episode.mp3` |
| `/pdf <file>` | Analyze PDF document | `/pdf inbox/document.pdf` |
| `/github <url>` | Analyze GitHub repository | `/github https://github.com/user/repo` |
| `/book <file>` | Analyze book/EPUB | `/book inbox/mybook.epub` |
| `/hn <url>` | Analyze Hacker News post | `/hn https://news.ycombinator.com/item?id=123` |
| `/thread <url>` | Analyze Twitter thread | `/thread https://twitter.com/user/status/123` |
| `/email <file>` | Analyze newsletter | `/email inbox/newsletter.txt` |
| `/analyze <file>` | Analyze any content | `/analyze inbox/notes.txt` |

### Organization Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/batch <file>` | Process multiple items | `/batch inbox/reading-list.txt` |
| `/queue add <url>` | Add to processing queue | `/queue add https://youtu.be/abc` |
| `/queue list` | View pending queue | `/queue list` |
| `/queue process` | Process all queued items | `/queue process` |
| `/log` | View today's activity | `/log` |
| `/random` | Surface random past report | `/random youtube` |
| `/similar <topic>` | Find related content | `/similar "machine learning"` |

### Automation Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/rss add <url>` | Subscribe to RSS feed | `/rss add https://blog.com/feed.xml` |
| `/rss check` | Check for new content | `/rss check` |
| `/rss list` | List subscriptions | `/rss list` |
| `/digest` | Generate weekly digest | `/digest` |
| `/export obsidian` | Export to Obsidian | `/export obsidian` |
| `/export notion` | Export to Notion | `/export notion` |
| `/flashcards <report>` | Generate Anki flashcards | `/flashcards all` |

---

## 6. Content Types

This section details each content type Personal OS can analyze.

### YouTube Videos (`/yt`)

**Purpose:** Analyze YouTube videos to extract key insights, takeaways, and actionable items.

**Usage:**
```bash
# From URL (recommended - auto-fetches transcript)
/yt https://youtube.com/watch?v=abc123
/yt https://youtu.be/abc123

# From transcript file
/yt inbox/video.txt
```

**How It Works:**
1. If URL provided: yt-dlp fetches the transcript automatically
2. Reads transcript content
3. Applies `prompts/yt.md` analysis template
4. Saves report to `reports/youtube/YYYY-MM-DD_title.md`
5. Logs to daily activity log

**Output Includes:**
- Executive summary
- All key takeaways (exhaustive, not just top 5)
- Notable quotes with timestamps
- Actionable items
- Latent signals (implied insights)

**Prerequisites:** yt-dlp (`pip install yt-dlp`) for URL analysis

---

### Web Articles (`/read`)

**Purpose:** Analyze blog posts, newsletters, and web articles.

**Usage:**
```bash
/read https://example.com/blog/article-title
/read https://newsletter.substack.com/p/post
```

**Output Includes:**
- Summary and main arguments
- Key points and evidence
- Author's perspective and potential biases
- Critical analysis
- Related topics to explore

**Note:** Some sites block automated access. If `/read` fails, copy content to `inbox/` and use `/analyze`.

---

### Research Papers (`/arxiv`)

**Purpose:** Make academic papers accessible with plain English explanations.

**Usage:**
```bash
/arxiv https://arxiv.org/abs/2401.12345
```

**Output Includes:**
- Plain English summary (no jargon)
- Key findings simplified
- Methodology breakdown
- Practical implications
- Limitations acknowledged
- Related work suggestions

---

### Podcasts (`/podcast`)

**Purpose:** Analyze podcast episodes from audio files or URLs.

**Usage:**
```bash
# From audio file (requires transcription)
/podcast inbox/episode.mp3

# From transcript file
/podcast inbox/podcast-transcript.txt

# From URL with audio
/podcast https://example.com/podcast.mp3
```

**How It Works:**
1. If audio file: Transcribes using Whisper (requires OpenAI API or local Whisper)
2. Analyzes transcript
3. Saves to `reports/podcasts/`

**Prerequisites:** OPENAI_API_KEY in `.env` for audio transcription, or local Whisper installation.

---

### PDF Documents (`/pdf`)

**Purpose:** Analyze PDF documents including reports, ebooks, and papers.

**Usage:**
```bash
/pdf inbox/document.pdf
/pdf inbox/research-report.pdf
```

**How It Works:**
1. Extracts text from PDF using PyMuPDF
2. Analyzes content with appropriate prompt
3. Saves to `reports/pdfs/`

---

### GitHub Repositories (`/github`)

**Purpose:** Analyze GitHub repositories to understand structure, purpose, and key components.

**Usage:**
```bash
/github https://github.com/user/repo
```

**Output Includes:**
- Repository overview
- Key files and structure
- Technologies used
- Setup instructions
- Notable patterns

---

### Books (`/book`)

**Purpose:** Analyze books and EPUB files.

**Usage:**
```bash
/book inbox/mybook.epub
```

**How It Works:**
1. Extracts text from EPUB
2. Analyzes content (may analyze chapter by chapter for long books)
3. Saves to `reports/books/`

---

### Hacker News (`/hn`)

**Purpose:** Analyze Hacker News posts including article and top comments.

**Usage:**
```bash
/hn https://news.ycombinator.com/item?id=12345
```

**Output Includes:**
- Article analysis
- Top comment synthesis
- Community sentiment
- Key discussions and debates

---

### Twitter Threads (`/thread`)

**Purpose:** Analyze Twitter/X threads.

**Usage:**
```bash
/thread https://twitter.com/user/status/12345
```

**Output Includes:**
- Thread summary
- Key points
- Linked resources

---

### Email Newsletters (`/email`)

**Purpose:** Analyze email newsletters.

**Usage:**
```bash
/email inbox/newsletter.txt
```

Save email content to a text file first, then analyze.

---

### Generic Content (`/analyze`)

**Purpose:** Analyze any text content that doesn't fit other categories.

**Usage:**
```bash
/analyze inbox/meeting-notes.txt
/analyze inbox/book-chapter.txt
```

**When to Use:**
- Meeting notes
- Book excerpts
- Email threads
- Any other text content

---

## 7. Organization Features

Personal OS provides powerful tools to organize, rediscover, and manage your content.

### Queue System (`/queue`)

Build a backlog of content to process later - perfect for saving interesting links throughout the day.

**Adding to Queue:**
```bash
/queue add https://youtube.com/watch?v=abc123
/queue add https://example.com/article
```

**Viewing Queue:**
```bash
/queue list
```

**Processing Queue:**
```bash
/queue process    # Process all items
```

**Workflow Example:**
1. Throughout the day, `/queue add` interesting links
2. In the evening, `/queue process` to analyze everything
3. Review your reports

---

### Batch Processing (`/batch`)

Process multiple items at once from a list file.

**Creating a Batch File (`inbox/reading-list.txt`):**
```
# My weekly reading list - just paste URLs!
https://youtube.com/watch?v=abc123
https://example.com/article
https://arxiv.org/abs/2401.12345
```

**Running the Batch:**
```bash
/batch inbox/reading-list.txt
```

**Auto-Detection:** URLs are automatically detected:
- `youtube.com` or `youtu.be` → YouTube
- `arxiv.org` → Research paper
- Other URLs → Article

---

### Random Discovery (`/random`)

Resurface random past reports for spaced repetition learning.

```bash
/random              # Any random report
/random youtube      # Random YouTube report
/random articles     # Random article report
/random papers       # Random paper report
```

**Why Use Random:**
- Spaced repetition - revisit old learning
- Rediscover forgotten insights
- Make unexpected connections

---

### Similar Content (`/similar`)

Find reports related to a topic or another report.

```bash
/similar "machine learning"
/similar "productivity habits"
```

**Use Cases:**
- Find all reports about a topic
- Build reading lists on themes
- Connect ideas across content types

---

### Activity Log (`/log`)

Track everything you've analyzed today.

```bash
/log
```

**Log Contents:**
- Videos watched with links
- Articles read with links
- Papers reviewed with links
- Timestamps for each entry

**Log Location:** `logs/YYYY-MM-DD.md`

---

## 8. Automation Features

Automate your content consumption workflow with RSS feeds, digests, and exports.

### RSS Feed Monitoring (`/rss`)

Subscribe to blogs and YouTube channels for automatic content discovery.

**Subscribe to a Feed:**
```bash
/rss add https://example.com/feed.xml
/rss add https://www.youtube.com/feeds/videos.xml?channel_id=UCxyz
```

**List Subscriptions:**
```bash
/rss list
```

**Check for New Content:**
```bash
/rss check
```
New items are automatically added to your queue!

**Process New Content:**
```bash
/queue process
```

**Workflow:**
1. Subscribe to your favorite content sources
2. Daily: `/rss check` to find new content
3. `/queue process` to analyze it all

---

### Weekly Digest (`/digest`)

Generate a summary of everything you've consumed.

```bash
/digest              # This week's digest
/digest lastweek     # Last week's digest
/digest month        # This month's digest
```

**Digest Includes:**
- Total content consumed
- Breakdown by type
- Key insights from each piece
- Themes and patterns
- Reflection prompts

**Saved To:** `reports/digests/YYYY-MM-DD_weekly-digest.md`

---

### Export to Obsidian (`/export obsidian`)

Move your knowledge to Obsidian for a linked knowledge base.

```bash
/export obsidian
```

**What You Get:**
- All reports with YAML frontmatter
- Wikilinks for internal connections
- Index note linking everything
- Tags preserved

**Location:** `exports/obsidian/`

**Import to Obsidian:**
1. Open Obsidian
2. Select "Open folder as vault"
3. Choose `exports/obsidian/`

---

### Export to Notion (`/export notion`)

Export for Notion's API.

```bash
/export notion
```

**Location:** `exports/notion/`

Creates JSON files compatible with Notion's API.

---

### Flashcard Generation (`/flashcards`)

Generate Anki flashcards from your reports for spaced repetition.

```bash
/flashcards all                              # All reports
/flashcards reports/youtube/2024-01-15_habits.md  # Specific report
```

**What Gets Converted:**
- Key takeaways → Q&A pairs
- Definitions → "What is X?" cards
- Notable quotes → Completion exercises

**Location:** `exports/anki/`

**Import to Anki:**
1. Open Anki → File → Import
2. Select the `.txt` file from `exports/anki/`
3. Set field separator to "Tab"
4. Click Import

---

## 9. Web Application (GUI)

In addition to the CLI, Personal OS includes a full-stack web application for users who prefer a graphical interface.

### Why Use the Web UI?

| Feature | CLI | Web UI |
|---------|-----|--------|
| Quick URL submission | `/yt https://...` | Paste URL, click Analyze |
| Model selection | Not available | Choose Haiku/Sonnet/Opus |
| Browse reports | Navigate folders | Visual list with search |
| View report content | Open in editor | Rendered markdown in browser |
| Real-time progress | Terminal output | Live progress indicators |
| Activity log | `/log` | Visual timeline |

Use the **CLI** for automation, scripting, and when you're already in the terminal.
Use the **Web UI** for a visual experience, model selection, and easier browsing.

### Prerequisites

- Python 3.10+
- Node.js 18+
- Anthropic API key

### Setup (One-Time)

**Step 1: Configure API Key**

Create the file `web/backend/.env` with your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your API key from: https://console.anthropic.com/

**Step 2: Install Backend Dependencies**

```bash
cd web/backend
pip install -r requirements.txt
```

**Step 3: Install Frontend Dependencies**

```bash
cd web/frontend
npm install
```

### Starting the Web UI

**Option A: Start Each Service Separately (Recommended)**

```bash
# Terminal 1: Start Backend
cd web/backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start Frontend
cd web/frontend
npm run dev
```

**Option B: Use the Unified Start Script**

```bash
python web/scripts/start.py
```

Or on Windows:
```cmd
web\scripts\start.bat
```

### Accessing the Web UI

Once started, open your browser to:

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs (interactive API documentation)

### Using the Dashboard

The dashboard (`http://localhost:3000`) shows:

1. **Recent Reports** - Your latest 5 analyses
2. **Quick Analysis Form** - Submit a URL directly
3. **Today's Activity** - What you've analyzed today

### Analyzing Content via Web UI

**Step 1: Navigate to Analyze Page**

Click "Analyze" in the sidebar or go to `http://localhost:3000/analyze`.

**Step 2: Select Content Type**

Choose from:
- **YouTube Video** - For YouTube URLs
- **Web Article** - For blog posts and articles
- **arXiv Paper** - For research papers

**Step 3: Enter the URL**

Paste the full URL (e.g., `https://youtube.com/watch?v=abc123`).

**Step 4: Select Model**

Choose your preferred AI model:

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| **Haiku** | ⚡ Fastest | Good | ~$0.01 |
| **Sonnet** (default) | Medium | Excellent | ~$0.05 |
| **Opus** | Slower | Best | ~$0.25 |

*Costs are approximate for a typical 10-minute video*

**Step 5: Click Analyze**

The UI will show real-time progress:
1. Fetching content...
2. Analyzing with Claude...
3. Saving report...
4. Complete!

**Step 6: View Your Report**

Once complete, click the link to view your report, or find it in the Reports section.

### Browsing Reports

Navigate to `http://localhost:3000/reports` to see all your reports.

**Features:**
- **List View** - All reports sorted by date (newest first)
- **Filter by Type** - Show only videos, articles, or papers
- **Full-Text Search** - Search across all report content
- **Click to View** - Rendered markdown with syntax highlighting

### Searching Reports

Use the search bar at the top of the Reports page.

- Searches both titles and content
- Results highlighted with matching snippets
- Click any result to view the full report

### Viewing Activity Log

Navigate to `http://localhost:3000/logs` to see today's activity.

Shows the same information as `/log` command:
- Videos Watched
- Articles Read
- Papers Reviewed
- Timestamps and links to reports

### Model Selection Guide

| Use Case | Recommended Model |
|----------|-------------------|
| Quick summaries of short content | Haiku |
| Standard analysis (default) | Sonnet |
| Complex research papers | Opus |
| Budget-conscious usage | Haiku |
| Maximum quality | Opus |

### Web UI Troubleshooting

**"ANTHROPIC_API_KEY not set"**

Create `web/backend/.env` with your API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**"yt-dlp not found" for YouTube URLs**

Install yt-dlp:
```bash
pip install yt-dlp
```

**Backend won't start**

Install Python dependencies:
```bash
cd web/backend
pip install -r requirements.txt
```

**Frontend won't start**

Install Node.js dependencies:
```bash
cd web/frontend
npm install
```

**Port already in use**

Either stop the existing process or use different ports:
```bash
# Backend on different port
uvicorn main:app --reload --port 8001

# Frontend on different port
npm run dev -- --port 3001
```

**Report not showing after analysis**

Wait a moment for the database to sync, or refresh the Reports page.

### CLI vs Web UI Comparison

Both produce **identical reports** saved to the same `reports/` folder.

| Aspect | CLI | Web UI |
|--------|-----|--------|
| Interface | Terminal commands | Visual browser UI |
| Model selection | Uses default | Choose per-request |
| Learning curve | Learn commands | Intuitive GUI |
| Automation | Easy to script | Manual |
| Progress feedback | Text in terminal | Visual progress bar |
| Report viewing | External editor | Built-in viewer |
| Search | Manual file search | Full-text search |

### Recommended Workflow

1. **Daily analysis**: Use the Web UI for its convenience and model selection
2. **Batch processing**: Use CLI `/batch` for processing multiple items
3. **Automation**: Use CLI commands for scripts and scheduled tasks
4. **Browsing/searching**: Use the Web UI's Reports section

---

## 10. Customizing Prompts

### Understanding the Prompt System

The analysis prompts define **how** content is analyzed - what sections appear in reports, how detailed each section is, and what specific information to extract. The prompts are designed with two core principles:

1. **Maximum Breadth** - Extract ALL significant information, not just top highlights
2. **Maximum Depth** - Capture specifics (numbers, names, examples) not just summaries

### Prompt Files

| File | Used For | Sections |
|------|----------|----------|
| `prompts/yt.md` | YouTube video transcripts | 12 sections |
| `prompts/article.md` | Blog posts and articles | 13 sections |
| `prompts/paper.md` | Research papers | 14 sections |
| `prompts/default.md` | Generic content | 12 sections |

### The Enhanced Prompt Structure

Each prompt includes specialized sections designed to capture maximum value:

#### Core Sections (All Prompts)

| Section Type | Purpose | Example Content |
|--------------|---------|-----------------|
| **Overview/Metadata** | Context about the source | Title, author, type, core thesis |
| **Comprehensive Summary** | Thorough 3-4 paragraph summary | Problem, arguments, evidence, conclusions |
| **All Key Points** | Exhaustive list of insights | Every significant argument (not just 5-7) |
| **Facts & Data** | Specific information | Numbers, percentages, dates, metrics |
| **Frameworks & Concepts** | Mental models | Named frameworks, terminology, taxonomies |
| **Examples** | Concrete illustrations | Case studies, anecdotes, scenarios |
| **Resources & References** | Things mentioned | Tools, books, people, websites |
| **Notable Quotes** | Memorable passages | 5-10 quotes (not just 2-3) |
| **Actionable Insights** | What to do | Immediate, short-term, long-term actions |
| **Questions & Gaps** | What's missing | Unanswered questions, counterarguments |
| **Latent Signals** | Implied insights | Second-order effects, hidden motivations |
| **Connections** | Related content | Topics to explore, follow-up suggestions |

#### Content-Specific Sections

**Research Papers (`paper.md`)** add:
- Methodology Deep Dive (data, experiments, baselines)
- Results & Findings (performance numbers)
- Technical Details (equations, architecture)
- Future Directions (open problems)

**Articles (`article.md`)** add:
- Author's Perspective & Bias
- Critical Analysis (strengths, weaknesses)

### The Latent Signals Section

Every prompt includes a **Latent Signals** section for surfacing insights that are implied but not explicitly stated:

```markdown
## 11. Latent Signals
Surface insights that are implied but not explicitly stated.
Only include genuine inferences - do NOT fabricate signals.

- **Unstated assumptions**: What does the creator take for granted?
- **Implied predictions**: What future trends are suggested?
- **Hidden motivations**: Why is this being shared now?
- **Second-order effects**: What downstream consequences follow?
- **Market/industry signals**: What does this suggest about where things are heading?
- **Contrarian indicators**: What's conspicuously NOT being said?
```

**Important:** The system explicitly instructs NOT to fabricate signals if none exist. Latent signals are only included when genuine inferences can be made from the content.

### Why These Sections Matter

| Problem (Old Approach) | Solution (Enhanced Prompts) |
|------------------------|----------------------------|
| Only 5-7 key takeaways captured | Extract ALL significant points exhaustively |
| Generic summaries without specifics | Dedicated Facts & Data section with numbers |
| Missing frameworks and concepts | Explicit Frameworks section for mental models |
| Tools and resources lost | Resources & References section captures all mentions |
| Only 2-3 quotes | 5-10 notable quotes with context |
| No critical analysis | Critiques, gaps, and counterarguments sections |
| Only surface-level insights | Latent Signals for deeper inferred insights |
| No clear next steps | Tiered actionable insights (immediate/short/long-term) |

### How to Customize

1. Navigate to `prompts/` folder
2. Open the prompt file you want to change
3. Edit using any text editor
4. Save the file
5. **Changes take effect immediately** (no restart needed)

### Example: Adding a Section

The current prompts have 12-14 sections. To add a new one:

```markdown
## 13. ELI5 (Explain Like I'm 5)
Explain the main idea in the simplest possible terms,
as if explaining to someone with no background knowledge.

## 14. My Rating
Rate this content 1-5 stars based on:
- Quality of information
- Practical usefulness
- Clarity of presentation
Explain your rating.
```

### Example: Modifying an Existing Section

**Original:**
```markdown
## 8. Notable Quotes
Include 5-10 memorable quotes with approximate timestamps if visible.
```

**Modified for more quotes:**
```markdown
## 8. Notable Quotes
Include 10-15 memorable quotes with approximate timestamps if visible.
Prioritize quotes that:
- Capture key insights
- Are memorable/quotable
- Represent controversial or unique views
- Could be shared on social media
```

### Example: Making Reports Shorter

If you want shorter reports, modify the instructions:

**Original:**
```markdown
## 3. Key Takeaways (All Important Points)
List ALL significant points, not just top 5-7. Be exhaustive.
```

**Shorter Version:**
```markdown
## 3. Key Takeaways (Top 5 Only)
List the 5 most important points. Be concise.
```

### Example: Adding Domain-Specific Analysis

For technical content, you might add:

```markdown
## 13. Technical Depth Assessment
- What prerequisite knowledge is needed?
- What technical concepts should I research further?
- Are there implementation details I should note?

## 14. Code Examples & Implementations
Extract any code snippets, pseudocode, or implementation
details mentioned. Include language and context.
```

### Example: Adding Personal Relevance

```markdown
## 13. Relevance to My Work
Consider how this content applies to:
- Current projects
- Professional development
- Team discussions
- Future initiatives

## 14. Discussion Points
What would be worth discussing with colleagues about this content?
```

### Prompt Customization Best Practices

1. **Be Specific**
   - ❌ "List some quotes"
   - ✅ "List 5-10 memorable quotes with timestamps"

2. **Provide Structure**
   - ❌ "Analyze the methodology"
   - ✅ "Analyze methodology including: Data sources, Methods used, Experiments run, Baselines compared, Metrics measured"

3. **Include Examples**
   - Show the format you expect in the prompt instructions

4. **Test Changes**
   - Run a test analysis after modifying
   - Check that output matches expectations

5. **Keep Originals**
   - Backup files exist in `.ignore/prompts_original/`
   - Compare if you need to restore defaults

6. **Number Your Sections**
   - Makes reports consistent and scannable
   - Easier for Claude to follow structure

### Restoring Default Prompts

If you want to restore the original enhanced prompts:

1. Navigate to `.ignore/prompts_original/`
2. Copy the desired file (e.g., `yt.md`)
3. Paste into `prompts/` folder, replacing the modified version

Or manually restore from the section descriptions in this guide.

---

## 11. Troubleshooting

### Problem: Command Not Recognized / Unknown Slash Command

**Symptoms:** Claude says "Unknown slash command" or doesn't understand `/yt`, `/read`, etc.

**Solutions:**
1. Make sure you're in the correct folder
   ```
   cd path\to\personal_os
   ```
2. Verify `.claude/commands/` folder exists with all command files:
   - yt.md, read.md, arxiv.md, analyze.md, batch.md, log.md
3. Verify CLAUDE.md exists in the folder
4. Restart Claude Code to reload commands

### Problem: File Not Found

**Symptoms:** "Cannot find file" or similar error

**Solutions:**
1. Check spelling of filename
2. Use forward slashes `/` not backslashes `\`
3. Verify file exists in the specified location
4. Use full path if needed

### Problem: WebFetch Failed

**Symptoms:** `/read` command doesn't work for a URL

**Solutions:**
1. Some sites block automated access - this is normal
2. Copy content manually to `inbox/` instead
3. Try a different URL for the same content

### Problem: Report Not Saved

**Symptoms:** Analysis completes but no file appears

**Solutions:**
1. Check `reports/` subfolders - might be in different category
2. Verify the folders exist
3. Check Claude's output for error messages

### Problem: Analysis Quality is Poor

**Symptoms:** Reports missing sections or low quality

**Solutions:**
1. Ensure input file has enough content
2. Check that prompt files aren't corrupted
3. Try analyzing again - sometimes varies

### Problem: Claude Seems Stuck

**Symptoms:** No response for a long time

**Solutions:**
1. Press Ctrl+C to cancel
2. Try the command again
3. For large files, wait longer (can take minutes)

### Problem: yt-dlp Not Found

**Symptoms:** "yt-dlp not found" or URL not working

**Solutions:**
1. Install yt-dlp: `pip install yt-dlp`
2. Make sure Python is in your PATH
3. Try updating: `pip install --upgrade yt-dlp`
4. Restart your terminal after installation

### Problem: No Captions Available

**Symptoms:** yt-dlp says "No subtitles found" or similar

**Solutions:**
1. The video may not have captions enabled
2. Try a different video
3. Use the manual transcript copy method (Method 2 in Section 8)

---

## 12. FAQ

### General Questions

**Q: Do I need an internet connection?**
A: Yes, Claude Code requires internet to communicate with Claude.

**Q: Is my content private?**
A: Content is processed through Anthropic's Claude. Review their privacy policy for details.

**Q: How much does this cost?**
A: Uses your existing Claude Code subscription (included with Claude Pro, or pay-as-you-go).

### Technical Questions

**Q: Can I use this on Mac/Linux?**
A: Yes, but file paths will be different. Use `/home/username/...` style paths.

**Q: Can I sync reports across devices?**
A: Put the folder in a synced location (OneDrive, Dropbox, etc.)

**Q: How big can files be?**
A: Claude has context limits. Very long transcripts may need to be split.

### Usage Questions

**Q: Can I analyze videos directly from URL?**
A: Yes! With yt-dlp installed (`pip install yt-dlp`), you can analyze directly from URL:
```
/yt https://youtube.com/watch?v=abc123
```
The transcript is automatically fetched and saved to `inbox/`.

**Q: What if yt-dlp fails to get a transcript?**
A: Some videos don't have captions. Copy the transcript manually from YouTube and save to a file.

**Q: What if a website blocks /read?**
A: Copy the content manually to a file and use `/analyze`.

**Q: Can I analyze PDFs?**
A: Yes! Use `/pdf inbox/document.pdf` to analyze PDF files.

**Q: Can I analyze podcasts?**
A: Yes! Use `/podcast inbox/episode.mp3`. Requires OpenAI API key or local Whisper for transcription.

**Q: Can I analyze images?**
A: No, this system is for text content only.

### Organization Questions

**Q: How do I save content for later?**
A: Use `/queue add <url>` to add to your queue, then `/queue process` when ready.

**Q: How do I find old reports on a topic?**
A: Use `/similar "topic"` to find related reports.

**Q: How do I rediscover past content?**
A: Use `/random` to surface a random past report for spaced repetition.

### Automation Questions

**Q: Can I subscribe to blogs and YouTube channels?**
A: Yes! Use `/rss add <feed-url>` to subscribe, then `/rss check` daily for new content.

**Q: How do I get a weekly summary?**
A: Use `/digest` to generate a summary of everything you've consumed that week.

**Q: Can I export to Obsidian?**
A: Yes! Use `/export obsidian` to create an Obsidian-compatible vault.

**Q: Can I create Anki flashcards?**
A: Yes! Use `/flashcards all` to generate flashcards from all your reports.

### Customization Questions

**Q: How do I change the report format?**
A: Edit the appropriate file in `prompts/` folder.

**Q: Can I add new commands?**
A: Yes! Create a new `.md` file in `.claude/commands/` folder. See DEVELOPER_GUIDE.md for instructions.

**Q: What's the difference between commands, skills, and prompts?**
A:
- **Commands** (`.claude/commands/`) define explicit slash command workflows
- **Skills** (`.claude/skills/`) define automatic natural language workflows
- **Prompts** (`prompts/`) define how content is analyzed

### Learning & Development Questions

**Q: I want to contribute or modify the code. Where do I start?**
A: Check the [Learning Path](learn/README.md) for comprehensive guides on the technologies used:
- Python, JavaScript/TypeScript for the languages
- React, Next.js for the frontend
- FastAPI for the backend
- Anthropic Claude API and OpenAI Whisper API for AI integration

**Q: I have C++/Java experience but not web development. Can I still contribute?**
A: Absolutely! The [Learning Path](learn/README.md) was designed specifically for developers with traditional programming backgrounds. It covers all technologies used in this project with comparison tables for familiar concepts.

---

## Getting Help

1. **Check this guide** - Most answers are here
2. **Review [QUICK_START.md](QUICK_START.md)** - 10 hands-on tutorials
3. **Check [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - For extending the system
4. **Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
5. **Check [Learning Path](learn/README.md)** - For learning the technologies used

---

*Last updated: 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
