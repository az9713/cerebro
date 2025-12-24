# Complete User Guide

## Table of Contents

1. [Introduction](#1-introduction)
2. [Prerequisites & Installation](#2-prerequisites--installation)
3. [Understanding the System](#3-understanding-the-system)
4. [Daily Workflow](#4-daily-workflow)
5. [Two Ways to Interact: Commands & Skills](#5-two-ways-to-interact-commands--skills)
6. [Command Reference](#6-command-reference)
7. [Skills Reference](#7-skills-reference)
8. [Working with YouTube Transcripts](#8-working-with-youtube-transcripts)
9. [Working with Web Articles](#9-working-with-web-articles)
10. [Working with Research Papers](#10-working-with-research-papers)
11. [Batch Processing](#11-batch-processing)
12. [Activity Logs](#12-activity-logs)
13. [Customizing Analysis Prompts](#13-customizing-analysis-prompts)
14. [File Management](#14-file-management)
15. [Troubleshooting](#15-troubleshooting)
16. [Tips & Best Practices](#16-tips--best-practices)
17. [Frequently Asked Questions](#17-frequently-asked-questions)

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
claude_code_personal_os_me/
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
2. Navigate to `claude_code_personal_os_me`
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

## 5. Two Ways to Interact: Commands & Skills

Personal OS gives you **two equivalent ways** to trigger the same workflows. Choose whichever feels more natural!

### Option 1: Slash Commands (Explicit)

Type a command directly - great for quick, precise actions when you know exactly what you want.

```
/yt inbox/video.txt
/read https://example.com/article
/arxiv https://arxiv.org/abs/2401.12345
/analyze inbox/notes.txt
/batch inbox/reading-list.txt
/log
```

**Best for:**
- Quick, repetitive tasks
- When you know the exact command
- Scripting and automation

### Option 2: Skills (Natural Language)

Just describe what you want - Claude automatically uses the right skill.

```
"Analyze this YouTube transcript at inbox/video.txt"
"Can you summarize this blog post for me?"
"Explain this arXiv paper in simple terms"
"What did I read today?"
"Process all items in my reading list"
```

**Best for:**
- Conversational interactions
- When you're not sure of the exact command
- Natural workflow integration

### Commands ↔ Skills Mapping

| Task | Command | Natural Language Triggers |
|------|---------|--------------------------|
| YouTube analysis | `/yt` | "video", "transcript", "YouTube" |
| Article analysis | `/read` | "blog", "article", "newsletter", "Substack" |
| Paper analysis | `/arxiv` | "paper", "research", "arXiv", "academic" |
| Generic analysis | `/analyze` | "notes", "document", "content" |
| Batch processing | `/batch` | "batch", "multiple", "list of items" |
| Activity log | `/log` | "today", "activity", "what did I" |

---

## 6. Command Reference

### /yt <url-or-filepath>

**Purpose:** Analyze a YouTube video (from URL or transcript file)

**Usage:**
```
# From YouTube URL (recommended - requires yt-dlp)
/yt https://youtube.com/watch?v=abc123
/yt https://youtu.be/abc123

# From transcript file
/yt inbox/video.txt
/yt docs/transcript.txt
/yt inbox/my-learning/course-video-1.txt
```

**What Happens (URL input):**
1. Detects YouTube URL
2. Runs yt-dlp to fetch transcript
3. Saves transcript to `inbox/<video-title>.en.srt`
4. Applies `prompts/yt.md` analysis
5. Saves report to `reports/youtube/YYYY-MM-DD_title.md`
6. Logs to `logs/YYYY-MM-DD.md`

**What Happens (file input):**
1. Reads the transcript file
2. Applies `prompts/yt.md` analysis
3. Saves to `reports/youtube/YYYY-MM-DD_title.md`
4. Logs to `logs/YYYY-MM-DD.md`

**Prerequisites:**
- For URL input: yt-dlp must be installed (`pip install yt-dlp`)

**Output Includes:**
- Summary (2-3 paragraphs)
- Key Takeaways (5-7 points)
- Notable Quotes
- Action Items
- Related Topics

---

### /read <url>

**Purpose:** Analyze a web article or blog post

**Usage:**
```
/read https://example.com/blog/article-title
/read https://medium.com/@author/article
/read https://newsletter.substack.com/p/post-title
```

**What Happens:**
1. Fetches webpage content
2. Applies `prompts/article.md` analysis
3. Saves to `reports/articles/YYYY-MM-DD_title.md`
4. Logs activity

**Output Includes:**
- Summary
- Key Points
- Evidence & Data cited
- Author's Perspective
- Takeaways
- Critiques (if any)

**Note:** Some websites block automated access. If `/read` fails, manually copy the content to a file and use `/analyze`.

---

### /arxiv <url>

**Purpose:** Analyze a research paper from arXiv

**Usage:**
```
/arxiv https://arxiv.org/abs/2401.12345
/arxiv https://arxiv.org/abs/cs.AI/2401.12345
```

**What Happens:**
1. Fetches paper abstract and content
2. Applies `prompts/paper.md` analysis
3. Explains in accessible terms
4. Saves to `reports/papers/YYYY-MM-DD_title.md`
5. Logs activity

**Output Includes:**
- Plain English Summary
- Key Findings
- Methodology (simplified)
- Limitations
- Practical Implications
- Related Work

---

### /analyze <filepath>

**Purpose:** Analyze any content file

**Usage:**
```
/analyze inbox/meeting-notes.txt
/analyze inbox/email-thread.txt
/analyze inbox/book-chapter.txt
```

**What Happens:**
1. Reads the file
2. Asks you for title and category
3. Applies `prompts/default.md` (or category-specific prompt)
4. Saves to appropriate reports folder
5. Logs activity

**When to Use:**
- Content that doesn't fit other categories
- Meeting notes
- Email threads
- Book excerpts
- Anything else!

---

### /batch <filepath>

**Purpose:** Process multiple items from a list

**Usage:**
```
/batch inbox/reading-list.txt
/batch inbox/today.txt
/batch inbox/research-papers.txt
```

**Batch File Formats:**

Format 1 - Explicit commands:
```
# Lines starting with # are comments (ignored)
# Format: COMMAND ARGUMENT

yt inbox/video1.txt
yt https://youtube.com/watch?v=abc123
read https://example.com/article1
read https://example.com/article2
arxiv https://arxiv.org/abs/2401.12345
```

Format 2 - URL-only (auto-detected):
```
# Just paste URLs - type is auto-detected!
https://youtube.com/watch?v=abc123
https://youtu.be/def456
https://example.com/article
https://arxiv.org/abs/2401.12345
```

**Auto-detection rules:**
- Contains `youtube.com` or `youtu.be` → YouTube video (uses yt-dlp)
- Contains `arxiv.org` → arXiv paper
- Other URLs → Article

**What Happens:**
1. Reads the batch file
2. Processes each line sequentially
3. For YouTube URLs: fetches transcript with yt-dlp first
4. Creates individual reports for each item
5. Logs all activity
6. Shows summary when complete

**Prerequisites:**
- For YouTube URLs: yt-dlp must be installed (`pip install yt-dlp`)

---

### /log

**Purpose:** Show today's activity log

**Usage:**
```
/log
```

**What It Shows:**
- Videos watched (with links to reports)
- Articles read
- Papers reviewed
- Timestamps for each entry

**Log File Location:** `logs/YYYY-MM-DD.md`

---

## 7. Skills Reference

Skills are the natural language equivalents of slash commands. Claude automatically detects when a skill is relevant based on what you say.

### youtube-analysis

**Triggers when you mention:** YouTube, video transcript, video analysis, watching a video, YouTube URL

**Example phrases:**
- "Analyze this YouTube video: https://youtube.com/watch?v=abc123"
- "Analyze this YouTube transcript at inbox/video.txt"
- "Can you summarize this video for me?"
- "I watched a video and saved the transcript..."

**Equivalent command:** `/yt`

**What it does:** Same workflow as `/yt`:
- For URLs: fetches transcript with yt-dlp, saves to `inbox/`, then analyzes
- For files: reads transcript directly
- Applies YouTube prompt, saves to `reports/youtube/`, logs activity

---

### article-analysis

**Triggers when you mention:** blog post, article, Substack, Medium, newsletter, web page

**Example phrases:**
- "Summarize this blog post: https://..."
- "Can you analyze this article for me?"
- "Read this Substack newsletter"

**Equivalent command:** `/read`

**What it does:** Same workflow as `/read` - fetches URL content, applies article prompt, saves to `reports/articles/`, logs activity.

---

### arxiv-analysis

**Triggers when you mention:** arXiv, research paper, academic paper, scientific paper, preprint

**Example phrases:**
- "Explain this arXiv paper to me"
- "Can you summarize this research paper?"
- "I found an interesting paper at https://arxiv.org/..."

**Equivalent command:** `/arxiv`

**What it does:** Same workflow as `/arxiv` - fetches paper, applies paper prompt, explains in accessible terms, saves to `reports/papers/`, logs activity.

---

### content-analysis

**Triggers when you mention:** notes, meeting notes, document, book excerpt, generic text, email thread

**Example phrases:**
- "Analyze these meeting notes"
- "Can you summarize this document?"
- "I have some notes I'd like you to review"

**Equivalent command:** `/analyze`

**What it does:** Same workflow as `/analyze` - reads file, asks for title/category, applies appropriate prompt, saves to `reports/`, logs activity.

---

### batch-processing

**Triggers when you mention:** batch, multiple items, reading list, process all, several videos/articles

**Example phrases:**
- "Process my reading list at inbox/list.txt"
- "Analyze all the videos in my batch file"
- "I have multiple articles to analyze"

**Equivalent command:** `/batch`

**What it does:** Same workflow as `/batch`:
- Reads batch file
- Auto-detects content type from URLs
- For YouTube URLs: fetches transcript with yt-dlp first
- Processes each item sequentially
- Saves all reports, shows summary

---

### activity-log

**Triggers when you mention:** today, activity log, what did I, daily log, consumption history

**Example phrases:**
- "What did I watch today?"
- "Show me my activity log"
- "What have I analyzed today?"

**Equivalent command:** `/log`

**What it does:** Same workflow as `/log` - reads today's log file, displays contents.

---

## 8. Working with YouTube Transcripts

### Method 1: Direct from URL (Recommended)

The easiest way to analyze YouTube videos - just use the URL!

**Prerequisites:** Install yt-dlp once: `pip install yt-dlp`

**Step 1: Copy the video URL**
- From browser address bar, or
- Right-click video → "Copy video URL"

**Step 2: Analyze**
```
/yt https://youtube.com/watch?v=YOUR_VIDEO_ID
```

Or with natural language:
```
Analyze this YouTube video: https://youtube.com/watch?v=YOUR_VIDEO_ID
```

**What happens:**
1. yt-dlp fetches the transcript automatically
2. Transcript saved to `inbox/<video-title>.en.srt`
3. Analysis generated and saved to `reports/youtube/`
4. Activity logged

**That's it!** No manual copying required.

### Method 2: Copy from YouTube (Alternative)

Use this method if:
- yt-dlp isn't installed
- The video has no auto-captions
- You want to edit the transcript before analysis

**Step 1: Open the video on YouTube**

**Step 2: Access the transcript**
1. Below the video, click "...more" to expand description
2. Click "Show transcript"
3. A transcript panel appears on the right

**Step 3: Copy the transcript**
1. Click the three dots (⋮) in the transcript panel
2. Click "Toggle timestamps" (optional - removes timestamps)
3. Click inside the transcript
4. Press Ctrl+A (select all)
5. Press Ctrl+C (copy)

**Step 4: Save to file**
1. Open Notepad (Windows+R, type `notepad`, Enter)
2. Press Ctrl+V (paste)
3. Save: File → Save As
4. Navigate to `inbox/` folder
5. Filename: `descriptive-name.txt`
6. Click Save

**Step 5: Analyze**
```
/yt inbox/descriptive-name.txt
```

### Method 3: Use a Transcript Downloader

Several browser extensions can download transcripts:
- YouTube Transcript Downloader
- Glasp
- Others available in Chrome Web Store

### Organizing Video Files

Create subfolders in `inbox/` for organization:
```
inbox/
├── courses/
│   ├── python-course-01.txt
│   ├── python-course-02.txt
├── podcasts/
│   ├── podcast-episode-45.txt
├── tutorials/
│   ├── photoshop-basics.txt
```

Analyze with full path:
```
/yt inbox/courses/python-course-01.txt
```

---

## 9. Working with Web Articles

### Direct URL Method

For most websites:
```
/read https://example.com/article-title
```

### Works Well With:
- Substack newsletters
- Medium articles
- Most blog posts
- News articles (some may block)

### If Direct Access Fails

**Manual Method:**
1. Open the article in your browser
2. Select all text (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Notepad
5. Save to `inbox/article-name.txt`
6. Use `/analyze inbox/article-name.txt`

### Tips for Better Results

- Remove ads and sidebars if copying manually
- Include the article title at the top
- Keep author name if relevant

---

## 10. Working with Research Papers

### Finding Papers on arXiv

1. Go to https://arxiv.org
2. Use the search box
3. Find a paper you want to analyze
4. Copy the URL (e.g., `https://arxiv.org/abs/2401.12345`)

### Analyzing a Paper

```
/arxiv https://arxiv.org/abs/2401.12345
```

### Understanding the Output

The paper analysis is specifically designed to make academic research accessible:

- **Plain English Summary** - No jargon, just what they did and why
- **Key Findings** - The main results, simplified
- **Methodology** - How they did it (simplified)
- **Limitations** - What the study can't tell us
- **Practical Implications** - Real-world applications
- **Related Work** - What to read next

### For Papers Not on arXiv

1. Download the PDF
2. Copy the text content
3. Save to `inbox/paper-name.txt`
4. Use `/analyze inbox/paper-name.txt` (select "paper" as category)

---

## 11. Batch Processing

### Creating a Batch File

1. Open Notepad
2. Add items, one per line:

**Option 1: URL-only (easiest - auto-detects type):**
```
# My weekly reading list - just paste URLs!

# YouTube videos (auto-fetched with yt-dlp)
https://youtube.com/watch?v=abc123
https://youtu.be/def456

# Articles
https://example.com/article1
https://blog.example.com/post

# Papers
https://arxiv.org/abs/2401.11111
https://arxiv.org/abs/2401.22222
```

**Option 2: Explicit commands (more control):**
```
# My weekly reading list
# Videos to watch
yt https://youtube.com/watch?v=abc123
yt inbox/video1.txt

# Articles to read
read https://example.com/article1
read https://blog.example.com/post

# Papers to review
arxiv https://arxiv.org/abs/2401.11111
arxiv https://arxiv.org/abs/2401.22222
```

3. Save as `inbox/weekly-list.txt`

### Running a Batch

```
/batch inbox/weekly-list.txt
```

### Batch Processing Tips

1. **Use URLs when possible** - No need to pre-download transcripts anymore!
2. **Use comments** - Lines starting with `#` are ignored, use them to organize
3. **Check URLs** - Verify URLs work before adding to batch
4. **Start small** - Test with 2-3 items before running large batches
5. **Review after** - Check reports to ensure quality
6. **Install yt-dlp** - Required for YouTube URL batch processing

### Example Batch Workflows

**Morning News Routine:**
```
# Daily news digest
read https://news-site.com/article1
read https://news-site.com/article2
read https://tech-news.com/daily
```

**Course Processing:**
```
# Python Course - Week 1
yt inbox/courses/python-w1-lesson1.txt
yt inbox/courses/python-w1-lesson2.txt
yt inbox/courses/python-w1-lesson3.txt
```

**Research Session:**
```
# AI Safety Papers - January 2024
arxiv https://arxiv.org/abs/2401.11111
arxiv https://arxiv.org/abs/2401.22222
arxiv https://arxiv.org/abs/2401.33333
```

---

## 12. Activity Logs

### What Gets Logged

Every analysis automatically logs:
- Timestamp (HH:MM)
- Content type (Video/Article/Paper)
- Title
- Link to the report file

### Log File Format

```markdown
# Activity Log: 2024-12-22

## Videos Watched
- [Video Title](../reports/youtube/2024-12-22_video-title.md) - 14:32
- [Another Video](../reports/youtube/2024-12-22_another-video.md) - 16:45

## Articles Read
- [Article Title](../reports/articles/2024-12-22_article-title.md) - 10:15

## Papers Reviewed
- [Paper Title](../reports/papers/2024-12-22_paper-title.md) - 11:30
```

### Viewing Logs

**Today's log:**
```
/log
```

**Past logs:**
- Navigate to `logs/` folder
- Open any `YYYY-MM-DD.md` file

### Using Logs for Review

1. **Weekly Review:** Open each day's log, review what you learned
2. **Find Old Reports:** Logs contain links to reports
3. **Track Progress:** See how much you're consuming over time

---

## 13. Customizing Analysis Prompts

### Why Customize?

The default prompts work well, but you might want:
- Different sections in your reports
- More or less detail
- Specific questions answered
- Different formatting

### How to Customize

1. Navigate to `prompts/` folder
2. Open the prompt file you want to change
3. Edit using any text editor
4. Save the file
5. Future analyses use your customized prompt

### Prompt Files

| File | Used For |
|------|----------|
| `prompts/yt.md` | YouTube video transcripts |
| `prompts/article.md` | Blog posts and articles |
| `prompts/paper.md` | Research papers |
| `prompts/default.md` | Generic content |

### Example: Adding a Section

**Original (yt.md):**
```markdown
## 1. Summary
...
## 2. Key Takeaways
...
```

**After Adding Section:**
```markdown
## 1. Summary
...
## 2. Key Takeaways
...
## 6. How Does This Apply To My Work?
Consider how this content relates to my daily work and projects.
```

### Example: Making Reports Shorter

**Original:**
```markdown
## 1. Summary (2-3 paragraphs)
What is this video about? ...
```

**Shorter Version:**
```markdown
## 1. Summary (1 paragraph max)
Brief overview only.
```

### Example: Adding Ratings

```markdown
## 7. My Rating
Rate this content 1-5 stars and explain why.

## 8. Would I Recommend?
Who would benefit from this content?
```

### Prompt Best Practices

1. **Be specific** - Tell Claude exactly what you want
2. **Use examples** - Show the format you expect
3. **Test changes** - Run a test analysis after changing
4. **Keep backups** - Copy original prompts before editing

---

## 14. File Management

### Naming Conventions

**Reports are auto-named:**
```
YYYY-MM-DD_sanitized-title.md
```
Example: `2024-12-22_how-to-use-claude-code.md`

**Recommended input naming:**
```
descriptive-name-with-hyphens.txt
```
Examples:
- `python-tutorial-basics.txt`
- `ai-safety-paper-2024.txt`
- `weekly-newsletter-issue-45.txt`

### Organizing Input Files

Create subfolders in `inbox/`:
```
inbox/
├── videos/
├── articles/
├── papers/
├── courses/
│   ├── course-name/
├── books/
└── misc/
```

### Cleaning Up

**Delete old input files:**
- After analysis, you can delete files from `inbox/`
- Reports are saved separately

**Archive old reports:**
- Create `reports/archive/` folder
- Move old reports there periodically

**Backup strategy:**
- Copy entire `reports/` folder periodically
- Copy `logs/` folder for activity history

---

## 15. Troubleshooting

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

## 16. Tips & Best Practices

### Efficiency Tips

1. **Create batch files in advance** - Add items throughout the day, process later
2. **Use consistent naming** - Makes files easier to find
3. **Review logs weekly** - Track your learning patterns
4. **Customize prompts once** - Get reports you actually want to read

### Quality Tips

1. **Keep transcripts clean** - Remove ads, sponsors, irrelevant content
2. **Add context** - Include video title and URL at top of transcripts
3. **Choose good sources** - Quality in = quality out

### Organization Tips

1. **Use subfolders** - Organize by topic, course, or project
2. **Date your batches** - `inbox/2024-12-22-reading.txt`
3. **Archive regularly** - Don't let reports folder get huge

### Learning Tips

1. **Add personal notes** - Reports have a "My Notes" section
2. **Connect ideas** - Reference other reports in your notes
3. **Review reports** - Don't just generate them, read them!

---

## 17. Frequently Asked Questions

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
A: Not directly. Copy text from PDF to a .txt file first.

**Q: Can I analyze images?**
A: No, this system is for text content only.

### Customization Questions

**Q: How do I change the report format?**
A: Edit the appropriate file in `prompts/` folder.

**Q: Can I add new commands?**
A: Yes! Create a new `.md` file in `.claude/commands/` folder. For example, create `podcast.md` to add a `/podcast` command. See DEVELOPER_GUIDE.md for full instructions.

**Q: Can I add new skills?**
A: Yes! Create a new folder in `.claude/skills/` with a `SKILL.md` file inside. The SKILL.md needs YAML frontmatter with `name` and `description`. See DEVELOPER_GUIDE.md for full instructions.

**Q: What's the difference between commands, skills, and prompts?**
A:
- **Commands** (`.claude/commands/`) define explicit slash command workflows (user types `/command`)
- **Skills** (`.claude/skills/`) define automatic workflows (Claude detects from natural language)
- **Prompts** (`prompts/`) define how content is analyzed (used by both commands and skills)

**Q: When should I use a command vs just talking naturally?**
A: Use commands when you want quick, precise actions. Use natural language when you prefer conversational interaction. Both produce identical results.

**Q: Can I use different prompts for different types of videos?**
A: Currently one prompt per category. You could create custom categories by creating new commands and skills (advanced - see DEVELOPER_GUIDE.md).

---

## Getting Help

1. **Check this guide** - Most answers are here
2. **Review QUICK_START.md** - Step-by-step examples
3. **Check DEVELOPER_GUIDE.md** - For advanced customization
4. **Claude itself** - Ask Claude for help with commands!

---

*Last updated: 2025-12-23*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
