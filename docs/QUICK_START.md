# Quick Start Guide: 10 Hands-On Tutorials

Welcome to Personal OS! This guide walks you through **10 practical tutorials** that showcase the core features. Each tutorial gives you a quick win and builds your confidence.

**Time to complete all tutorials:** ~30 minutes

**What you'll learn:**
- How to analyze different content types (YouTube, articles, papers, podcasts)
- How to organize and rediscover your analyses
- How to automate your content consumption workflow
- How to export your knowledge to other tools

> **New to the technologies used?** If you're coming from C++/Java and need to learn Python, JavaScript, React, or the APIs used in this project, check out our **[Learning Path](learn/README.md)** first. It provides comprehensive guides that take you from traditional programming to full-stack web development.

---

## Before You Begin: One-Time Setup

### Prerequisites Checklist

Make sure you have installed:

- [ ] **Python 3.10+** - [Download Python](https://python.org/downloads)
- [ ] **Node.js 18+** - [Download Node.js](https://nodejs.org)
- [ ] **Claude Code CLI** - [Install Claude Code](https://claude.ai/code)
- [ ] **yt-dlp** - Run `pip install yt-dlp` in terminal
- [ ] **Anthropic API key** - Get from [console.anthropic.com](https://console.anthropic.com)

### Setup Steps

Open your terminal (Command Prompt on Windows, Terminal on Mac):

```bash
# Step 1: Navigate to the project folder
cd /path/to/personal-os

# Step 2: Install Python dependencies
cd web/backend
pip install -r requirements.txt

# Step 3: Create your environment file with API key
echo "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE" > .env

# Step 4 (Optional): Add OpenAI key for audio transcription
echo "OPENAI_API_KEY=sk-YOUR_OPENAI_KEY" >> .env

# Step 5: Return to project root
cd ../..

# Step 6: Start Claude Code
claude
```

You should see the Claude Code prompt. **You're ready!**

---

## Tutorial 1: Analyze Your First YouTube Video

**Goal:** Learn the basic `/yt` command
**Time:** 3 minutes

### What You'll Do

Analyze a YouTube video and get a structured report with key takeaways, quotes, and actionable insights.

### Step-by-Step

1. **Find a YouTube video** you're interested in, or use this example:
   ```
   https://www.youtube.com/watch?v=UF8uR6Z6KLc
   ```

2. **Run the analysis command** in Claude Code:
   ```
   /yt https://www.youtube.com/watch?v=UF8uR6Z6KLc
   ```

3. **Wait for the analysis** (30-60 seconds)

   Claude will:
   - Download the video's captions using yt-dlp
   - Analyze the transcript with AI
   - Generate a structured report
   - Save it to `reports/youtube/`

4. **View your report**

   Open the file at `reports/youtube/2024-XX-XX_video-title.md`

### What You Get

Your report includes:
- Executive summary
- All key takeaways (not just top 5)
- Notable quotes with timestamps
- Actionable items
- Latent signals (implied insights)

### Try It Yourself

Analyze a video from your favorite educational channel!

---

## Tutorial 2: Analyze a Blog Article

**Goal:** Learn to analyze web articles with `/read`
**Time:** 2 minutes

### Step-by-Step

1. **Find an interesting article**, or use this example:
   ```
   https://paulgraham.com/startupideas.html
   ```

2. **Run the analysis:**
   ```
   /read https://paulgraham.com/startupideas.html
   ```

3. **Check the result** in `reports/articles/`

### What's Different from YouTube?

Article analysis focuses on:
- Author's perspective and potential biases
- Evidence and citations used
- Critical analysis of arguments

### Try It Yourself

Analyze a Substack newsletter or Medium article!

---

## Tutorial 3: Understand a Research Paper

**Goal:** Make academic papers accessible with `/arxiv`
**Time:** 3 minutes

### Step-by-Step

1. **Find an arXiv paper**, or use this example:
   ```
   https://arxiv.org/abs/2301.04655
   ```

2. **Analyze it:**
   ```
   /arxiv https://arxiv.org/abs/2301.04655
   ```

3. **Read the plain English summary**

### What You Get

- Plain English explanation (no jargon)
- Key contributions explained simply
- Methodology breakdown
- Practical implications

### Why This Matters

Research papers are often intimidating. Personal OS breaks them down into digestible sections, explaining everything in everyday language.

---

## Tutorial 4: Check Your Activity Log

**Goal:** See everything you've analyzed with `/log`
**Time:** 1 minute

### Step-by-Step

1. **View today's log:**
   ```
   /log
   ```

2. **See your consumption history:**
   ```markdown
   # Activity Log - 2024-01-15

   ## Videos Watched
   - [TED Talk Title](../reports/youtube/...) - 10:30

   ## Articles Read
   - [Paul Graham Essay](../reports/articles/...) - 11:15
   ```

### Why This Matters

- Track your learning over time
- Never lose what you've consumed
- Build a personal knowledge database

---

## Tutorial 5: Process Multiple Items at Once

**Goal:** Learn batch processing with `/batch`
**Time:** 5 minutes

### Step-by-Step

1. **Create a batch file** called `inbox/my-reading-list.txt`:
   ```
   # My reading list for today
   https://www.youtube.com/watch?v=UF8uR6Z6KLc
   https://paulgraham.com/startupideas.html
   https://arxiv.org/abs/2301.04655
   ```

2. **Process the batch:**
   ```
   /batch inbox/my-reading-list.txt
   ```

3. **Watch Claude process each item** one by one

### Pro Tips

- Lines starting with `#` are comments
- Mix different content types in one file
- Great for processing a week's worth of saved links

---

## Tutorial 6: Build a Queue for Later

**Goal:** Save content for later processing with `/queue`
**Time:** 3 minutes

### Step-by-Step

1. **Add items to your queue throughout the day:**
   ```
   /queue https://www.youtube.com/watch?v=example1
   /queue https://example.com/interesting-article
   ```

2. **Check what's queued:**
   ```
   /queue list
   ```

3. **Process everything when ready:**
   ```
   /queue process
   ```

### When to Use Queue vs Batch

| Feature | Queue | Batch |
|---------|-------|-------|
| Add items over time | Yes | No |
| Process immediately | Optional | Yes |
| Persistent storage | Yes | No |

---

## Tutorial 7: Rediscover Past Content

**Goal:** Use `/random` and `/similar` for discovery
**Time:** 2 minutes

### Step-by-Step

1. **Surface a random past report:**
   ```
   /random
   ```

2. **Filter by type:**
   ```
   /random youtube
   /random article
   ```

3. **Find related content:**
   ```
   /similar "productivity"
   ```

### Why This Matters

- **Spaced repetition**: Randomly revisit past learning
- **Connections**: Discover links between different content
- **No lost knowledge**: Everything stays accessible

---

## Tutorial 8: Generate a Weekly Digest

**Goal:** Create a summary of your week with `/digest`
**Time:** 2 minutes

### Step-by-Step

1. **Generate this week's digest:**
   ```
   /digest
   ```

2. **View the result** in `reports/digests/`

   Your digest includes:
   - Total content consumed
   - Breakdown by type
   - Key insights from each piece
   - Reflection prompts

3. **Try other periods:**
   ```
   /digest lastweek
   /digest month
   ```

### Weekly Review Ritual

Use `/digest` every Sunday to review what you learned!

---

## Tutorial 9: Export to Obsidian

**Goal:** Move your knowledge to Obsidian with `/export`
**Time:** 3 minutes

### Step-by-Step

1. **Export all reports:**
   ```
   /export obsidian
   ```

2. **Find the export** in `exports/obsidian/`

   You get:
   - All reports with YAML frontmatter
   - Wikilinks for internal connections
   - An index note linking everything

3. **Import to Obsidian:**
   - Open Obsidian
   - Select "Open folder as vault"
   - Choose `exports/obsidian/`

### Alternative: Export to Notion

```
/export notion
```

This creates a JSON file for Notion's API.

---

## Tutorial 10: Generate Flashcards for Anki

**Goal:** Create spaced repetition cards with `/flashcards`
**Time:** 3 minutes

### Step-by-Step

1. **Generate flashcards from all reports:**
   ```
   /flashcards all
   ```

2. **Or from a specific report:**
   ```
   /flashcards reports/youtube/2024-01-15_habits.md
   ```

3. **Import to Anki:**
   - Open Anki → File → Import
   - Select the `.txt` file from `exports/`
   - Set field separator to "Tab"
   - Click Import

### What Gets Converted

- Key takeaways → Q&A pairs
- Definitions → "What is X?" cards
- Notable quotes → Completion exercises

---

## Bonus: Subscribe to RSS Feeds

**Goal:** Automate content discovery with `/rss`
**Time:** 3 minutes

### Step-by-Step

1. **Subscribe to a YouTube channel:**
   ```
   /rss add https://www.youtube.com/feeds/videos.xml?channel_id=UCxyz youtube
   ```

2. **Subscribe to a blog:**
   ```
   /rss add https://example.com/feed.xml
   ```

3. **Check for new content:**
   ```
   /rss check
   ```
   New items are automatically added to your queue!

4. **Process new content:**
   ```
   /queue process
   ```

---

## All Commands Reference

| Command | What It Does |
|---------|-------------|
| `/yt <url>` | Analyze YouTube video |
| `/read <url>` | Analyze article |
| `/arxiv <url>` | Analyze research paper |
| `/podcast <file/url>` | Analyze podcast episode |
| `/pdf <file>` | Analyze PDF document |
| `/github <url>` | Analyze GitHub repository |
| `/book <file>` | Analyze book/EPUB |
| `/hn <url>` | Analyze Hacker News post |
| `/thread <url>` | Analyze Twitter thread |
| `/email <file>` | Analyze newsletter |
| `/analyze <file>` | Analyze any text file |
| `/batch <file>` | Process multiple items |
| `/queue add <url>` | Add to queue |
| `/queue list` | View queue |
| `/queue process` | Process queue |
| `/log` | View today's activity |
| `/random` | Random past report |
| `/similar <topic>` | Find related content |
| `/digest` | Weekly summary |
| `/export obsidian` | Export to Obsidian |
| `/export notion` | Export to Notion |
| `/flashcards all` | Generate Anki cards |
| `/rss add <url>` | Subscribe to feed |
| `/rss check` | Check for new content |

---

## Next Steps

Congratulations! You've completed all 10 tutorials. Here's what to do next:

### Immediate Actions

1. **Analyze 5 pieces of content** you've been meaning to get to
2. **Set up RSS feeds** for your top 3 content sources
3. **Generate your first weekly digest** after a week of use

### Explore Further

- **[User Guide](USER_GUIDE.md)** - Complete reference for all features
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Learn to extend the system
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues & solutions

### Build Your Workflow

A suggested daily workflow:

1. **Morning**: Check `/rss check` for new content
2. **Throughout day**: `/queue add` interesting content
3. **Evening**: `/queue process` to analyze everything
4. **Weekly**: `/digest` to review and `/flashcards` for retention

---

**You're now a Personal OS power user!**

The more you use it, the more valuable your personal knowledge base becomes.

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
