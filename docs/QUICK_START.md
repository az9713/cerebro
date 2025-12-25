# Quick Start Guide: 14 Use Cases to Get You Started

This guide walks you through 14 practical examples, from simplest to more advanced. Each example teaches you something new about the system.

**Time to complete all examples:** ~30 minutes

---

## Two Ways to Interact: Commands & Skills

Personal OS gives you **two ways** to trigger the same workflows:

### Option 1: Slash Commands (Explicit)
Type a command directly - great for quick, precise actions.

```
.claude/commands/
├── yt.md        → /yt command
├── read.md      → /read command
├── arxiv.md     → /arxiv command
├── analyze.md   → /analyze command
├── batch.md     → /batch command
└── log.md       → /log command
```

When you type `/yt inbox/video.txt`, Claude Code:
1. Loads the command file at `.claude/commands/yt.md`
2. Replaces `$ARGUMENTS` with `inbox/video.txt`
3. Follows the instructions in that command file

### Option 2: Skills (Natural Language)
Just describe what you want - Claude automatically uses the right skill.

```
.claude/skills/
├── youtube-analysis/    → "Analyze this video transcript"
├── article-analysis/    → "Summarize this blog post"
├── arxiv-analysis/      → "Explain this research paper"
├── content-analysis/    → "Analyze these notes"
├── batch-processing/    → "Process my reading list"
└── activity-log/        → "What did I watch today?"
```

When you say "Analyze this YouTube transcript at inbox/video.txt", Claude:
1. Detects that `youtube-analysis` skill matches your request
2. Loads `.claude/skills/youtube-analysis/SKILL.md`
3. Follows the instructions automatically

**Both produce identical results - use whichever feels natural!**

---

## Before You Begin: Setup Checklist

### Step 0: Install yt-dlp (Recommended)

For the easiest YouTube workflow, install yt-dlp:

```
pip install yt-dlp
```

This lets you analyze YouTube videos directly from URLs - no manual transcript copying needed!

### Step 1: Open Terminal in the Right Folder

1. Open **File Explorer** (press `Windows + E`)
2. Navigate to the `personal_os` folder (wherever you installed it)
3. Click in the address bar at the top
4. Type `cmd` and press Enter
   - A black terminal window opens

### Step 2: Start Claude Code

In the terminal, type:
```
claude
```

Wait for Claude to start. You'll see a prompt ready for your commands.

**You're ready! Let's begin.**

---

## Use Case 1: Analyze the Sample Video (Easiest)

**What you'll learn:** How to analyze a YouTube transcript that's already saved

**Time:** 2 minutes

### Steps:

1. In Claude Code, type either:
   ```
   /yt docs/transcript.txt
   ```
   OR simply say:
   ```
   Analyze the YouTube transcript at docs/transcript.txt
   ```

2. Press Enter and wait

3. Claude will:
   - Read the transcript
   - Analyze it following the YouTube prompt
   - Save a report to `reports/youtube/`
   - Log the activity

4. Check your report:
   - Open File Explorer
   - Go to `reports/youtube/`
   - Open the `.md` file that was just created

**Congratulations!** You've completed your first analysis.

---

## Use Case 2: Analyze a YouTube Video by URL (Easiest!)

**What you'll learn:** How to analyze any YouTube video directly from its URL

**Time:** 2 minutes

**Prerequisites:** yt-dlp installed (`pip install yt-dlp`)

### Steps:

1. Find any YouTube video you want to analyze

2. Copy its URL from the browser address bar

3. In Claude Code, type:
   ```
   /yt https://youtube.com/watch?v=YOUR_VIDEO_ID
   ```
   Or use natural language:
   ```
   Analyze this YouTube video: https://youtube.com/watch?v=YOUR_VIDEO_ID
   ```

4. Claude will:
   - Fetch the transcript automatically using yt-dlp
   - Save the transcript to `inbox/` for future reference
   - Analyze it following the YouTube prompt
   - Save a report to `reports/youtube/`
   - Log the activity

5. Check your report in `reports/youtube/`

**This is the recommended workflow** - no manual copying needed!

---

## Use Case 3: Check Your Activity Log

**What you'll learn:** How to see what you've analyzed today

**Time:** 1 minute

### Steps:

1. In Claude Code, type:
   ```
   /log
   ```

2. Claude shows you today's activity log, including:
   - Videos watched (with links to reports)
   - Articles read
   - Papers reviewed

**Tip:** The log file is saved at `logs/YYYY-MM-DD.md` (today's date)

---

## Use Case 4: Analyze YouTube Video Manually (Alternative)

**What you'll learn:** How to manually copy a transcript when yt-dlp isn't available

**Time:** 5 minutes

**When to use:** When yt-dlp isn't installed, or when a video has no auto-captions

### Steps:

1. **Find a YouTube video** you want to analyze

2. **Get the transcript:**
   - On YouTube, click "...more" below the video
   - Click "Show transcript"
   - Click the three dots (⋮) → "Toggle timestamps" (optional)
   - Select all text (Ctrl+A) and copy (Ctrl+C)

3. **Save the transcript:**
   - Open Notepad (Windows + R, type `notepad`, Enter)
   - Paste (Ctrl+V)
   - Save as: `inbox/my-video.txt`
     - File → Save As
     - Navigate to `inbox` folder
     - Filename: `my-video.txt`
     - Save

4. **Analyze:**
   ```
   /yt inbox/my-video.txt
   ```

5. **View report** in `reports/youtube/`

**Tip:** Use Case 2 (URL method) is faster if you have yt-dlp installed!

---

## Use Case 5: Analyze a Blog Post by URL

**What you'll learn:** How to analyze web content directly from a URL

**Time:** 2 minutes

### Steps:

1. Find any blog post or article URL

2. In Claude Code, type:
   ```
   /read https://example.com/your-article-url
   ```
   (Replace with your actual URL)

3. Claude will:
   - Fetch the webpage content
   - Analyze using the article prompt
   - Save to `reports/articles/`
   - Log the activity

**Note:** Some websites may block automated access. If this happens, use the manual method (Use Case 3 style).

---

## Use Case 6: Analyze a Substack Newsletter

**What you'll learn:** Substack posts work great with `/read`

**Time:** 2 minutes

### Steps:

1. Find a Substack post you want to analyze
   - Example: `https://example.substack.com/p/article-title`

2. Analyze it:
   ```
   /read https://example.substack.com/p/article-title
   ```

3. Check `reports/articles/` for your analysis

---

## Use Case 7: Analyze an arXiv Research Paper

**What you'll learn:** How to process academic papers

**Time:** 3 minutes

### Steps:

1. Find an arXiv paper
   - Go to https://arxiv.org
   - Search for a topic
   - Copy the paper URL (e.g., `https://arxiv.org/abs/2401.12345`)

2. Analyze it:
   ```
   /arxiv https://arxiv.org/abs/2401.12345
   ```

3. Claude will:
   - Fetch the paper abstract and content
   - Explain it in accessible terms
   - Save to `reports/papers/`

**Tip:** arXiv analyses use a special prompt that explains complex research in plain English.

---

## Use Case 8: Analyze Generic Content

**What you'll learn:** How to analyze any text file

**Time:** 3 minutes

### Steps:

1. Save any content to a file:
   - Meeting notes
   - Email thread
   - Book excerpt
   - Anything!

2. Save it:
   - Open Notepad
   - Paste your content
   - Save as: `inbox/my-content.txt`

3. Analyze:
   ```
   /analyze inbox/my-content.txt
   ```

4. Claude will ask you for:
   - A title for the report
   - Category (video/article/paper/other)

5. Report saved to appropriate folder

---

## Use Case 9: Batch Process Multiple Items

**What you'll learn:** How to analyze many items at once

**Time:** 5 minutes

### Steps:

1. **Create a batch file:**
   - Open Notepad
   - Add one item per line (URLs or file paths):
     ```
     # My reading list for today
     # YouTube URLs work directly (requires yt-dlp)
     https://youtube.com/watch?v=abc123
     https://youtu.be/def456

     # Or use file paths for saved transcripts
     yt inbox/video1.txt

     # Articles and papers
     read https://example.com/article1
     arxiv https://arxiv.org/abs/2401.12345
     ```
   - Save as: `inbox/batch-list.txt`

2. **No prep needed for URLs!**
   - YouTube URLs are fetched automatically
   - Only file paths need the files to exist first

3. **Run batch processing:**
   ```
   /batch inbox/batch-list.txt
   ```

4. Claude processes each item sequentially:
   - Analyzes video1 → saves report
   - Analyzes video2 → saves report
   - Fetches article1 → saves report
   - Fetches article2 → saves report

5. At the end, Claude shows a summary of all items processed

---

## Use Case 10: Customize Your Analysis Style

**What you'll learn:** How the enhanced prompts work and how to customize them

**Time:** 5 minutes

### Understanding the Enhanced Prompts

The analysis prompts are designed for **maximum information extraction**:

| Prompt | Sections | Key Features |
|--------|----------|--------------|
| `yt.md` | 12 sections | Quotes, frameworks, latent signals |
| `article.md` | 13 sections | Author bias analysis, critical analysis |
| `paper.md` | 14 sections | Methodology deep dive, technical details |
| `default.md` | 12 sections | General-purpose extraction |

Each prompt includes a **Latent Signals** section that surfaces implied insights (unstated assumptions, second-order effects, hidden motivations).

### Steps to Customize:

1. **Open the YouTube prompt:**
   - Navigate to `prompts/yt.md`
   - Open with Notepad or any text editor

2. **Current structure (12 sections):**
   ```markdown
   # YouTube Video Analysis Prompt

   ## 1. Overview
   ## 2. Comprehensive Summary
   ## 3. Key Takeaways (All Important Points)
   ## 4. Facts, Statistics & Data
   ## 5. Frameworks, Models & Concepts
   ## 6. Tools, Resources & References
   ## 7. Examples & Case Studies
   ## 8. Notable Quotes
   ## 9. Actionable Insights
   ## 10. Questions & Gaps
   ## 11. Latent Signals
   ## 12. Connections
   ```

3. **Add a new section at the end:**
   ```markdown
   ## 13. One-Sentence Takeaway
   What's the single most important thing to remember from this video?

   ## 14. My Rating
   Rate 1-5 stars based on:
   - Quality of information
   - Practical usefulness
   - Clarity of presentation
   Explain your rating.
   ```

4. **Save the file** (changes take effect immediately - no restart needed)

5. **Test it:**
   ```
   /yt docs/transcript.txt
   ```

6. **Check the new report** - it now includes your new sections!

### Key Customization Tips

- Keep numbered sections for consistency
- Be specific: "5-10 quotes" not "some quotes"
- The Latent Signals section is designed to surface implied insights - keep it!
- Backups exist in `.ignore/prompts_original/` if you need to restore

---

## Use Case 11: Review Your Week's Learning

**What you'll learn:** How to use logs to track your learning

**Time:** 3 minutes

### Steps:

1. **View today's log:**
   ```
   /log
   ```

2. **View a specific day's log:**
   - Navigate to `logs/` folder
   - Open any `YYYY-MM-DD.md` file

3. **Create a weekly summary (advanced):**
   - Create a file listing all log files:
     ```
     # Weekly review
     analyze logs/2024-12-16.md
     analyze logs/2024-12-17.md
     analyze logs/2024-12-18.md
     analyze logs/2024-12-19.md
     analyze logs/2024-12-20.md
     ```
   - Ask Claude: "Summarize my learning this week based on these logs"

---

## Bonus Use Cases

### Use Case 12: Compare Two Videos

1. Analyze both videos separately:
   ```
   /yt inbox/video1.txt
   /yt inbox/video2.txt
   ```

2. Ask Claude:
   ```
   Compare the reports in reports/youtube/[video1] and reports/youtube/[video2].
   What are the common themes? Where do they differ?
   ```

### Use Case 13: Create a Reading List Report

1. After batch processing, ask:
   ```
   Read all reports in reports/articles/ from today and create a summary of what I learned.
   ```

### Use Case 14: Find Connections Across Papers

1. After analyzing multiple arXiv papers:
   ```
   Read my recent paper analyses in reports/papers/ and identify common research themes.
   ```

---

## What's Next?

You've mastered the basics! Now explore:

1. **[USER_GUIDE.md](USER_GUIDE.md)** - Complete manual with all features
2. **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - If you want to extend the system or create new commands/skills
3. **Customize prompts** in `prompts/` - Change how content is analyzed
4. **Create new commands** in `.claude/commands/` - Add your own slash commands
5. **Create new skills** in `.claude/skills/` - Add natural language triggers
6. **Build habits** - Use `/log` or ask "what did I learn today?" daily

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Unknown slash command" | Check that `.claude/commands/` folder exists with command files. Restart Claude Code. |
| "Command not recognized" | Make sure you're in the right folder with `CLAUDE.md` and `.claude/commands/` |
| "File not found" | Check the file path - use forward slashes `/` not backslashes `\` |
| "WebFetch failed" | Save the content manually to `inbox/` instead |
| "Report not appearing" | Check the `reports/` subfolders |
| "Claude seems stuck" | Press Ctrl+C to cancel, then try again |
| "yt-dlp not found" | Install with `pip install yt-dlp`. Make sure Python is in your PATH. |
| "No captions available" | Video may not have subtitles. Try copying transcript manually (Use Case 4). |

---

## Congratulations!

You've completed all 14 use cases. You now know how to:

- Analyze YouTube videos directly from URLs (with yt-dlp)
- Analyze YouTube transcripts from files
- Process blog posts and articles
- Understand research papers
- Batch process multiple items (URLs and files)
- Customize your analysis style
- Track your learning with logs

**Keep learning, keep growing!**

---

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
