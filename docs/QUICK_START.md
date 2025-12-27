# Quick Start Guide: Complete Feature Tutorial

Welcome to Personal OS! This comprehensive guide walks you through **all features** with practical examples. Whether you prefer the CLI or Web UI, this guide has you covered.

**What you'll learn:**
- CLI commands for content analysis
- Web Application with all AI-powered features
- File management (delete, move, bulk operations)
- Learning tools (spaced repetition, goals, audio, translation)
- Knowledge exploration (graph, Q&A, comparison)
- Browser extension for quick capture

---

## Table of Contents

1. [Setup & Prerequisites](#setup--prerequisites)
2. [Part 1: CLI Commands](#part-1-cli-commands)
3. [Part 2: Web Application](#part-2-web-application)
4. [Part 3: AI-Powered Features](#part-3-ai-powered-features)
5. [Part 4: Learning Features](#part-4-learning-features)
6. [Part 5: File Management](#part-5-file-management)
7. [Part 6: Browser Extension](#part-6-browser-extension)
8. [Command Reference](#command-reference)

---

## Setup & Prerequisites

### Prerequisites Checklist

- [ ] **Python 3.10+** - [Download Python](https://python.org/downloads)
- [ ] **Node.js 18+** - [Download Node.js](https://nodejs.org)
- [ ] **Claude Code CLI** - [Install Claude Code](https://claude.ai/code)
- [ ] **yt-dlp** - Run `pip install yt-dlp` in terminal
- [ ] **Anthropic API key** - Get from [console.anthropic.com](https://console.anthropic.com)
- [ ] **OpenAI API key** (optional) - For audio transcription and TTS

### Installation Steps

```bash
# Step 1: Clone or navigate to the project
cd /path/to/personal-os

# Step 2: Install backend dependencies
cd web/backend
pip install -r requirements.txt

# Step 3: Create environment file with API keys
cat > .env << EOF
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY  # Optional: for TTS and transcription
EOF

# Step 4: Install frontend dependencies
cd ../frontend
npm install

# Step 5: Return to project root
cd ../..
```

### Starting the Application

**Option A: Start Web Application (recommended)**

```bash
# Terminal 1: Start backend (port 8000)
cd web/backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend (port 3000)
cd web/frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

**Option B: Use CLI only**

```bash
# Start Claude Code in the project directory
claude
```

---

## Part 1: CLI Commands

### Tutorial 1.1: Analyze a YouTube Video

**Command:** `/yt <url>`

```bash
# In Claude Code, type:
/yt https://www.youtube.com/watch?v=UF8uR6Z6KLc
```

**What happens:**
1. yt-dlp downloads the video's captions
2. Claude analyzes the transcript
3. Report saved to `reports/youtube/YYYY-MM-DD_video-title.md`
4. Entry added to `logs/YYYY-MM-DD.md`

**Output location:** `reports/youtube/`

---

### Tutorial 1.2: Analyze a Web Article

**Command:** `/read <url>`

```bash
/read https://paulgraham.com/startupideas.html
```

**What happens:**
1. Fetches and extracts article content
2. Analyzes author's arguments, evidence, and biases
3. Report saved to `reports/articles/`

**Try these examples:**
```bash
/read https://simonwillison.net/2025/Dec/26/slop-acts-of-kindness/
/read https://www.newyorker.com/magazine/2024/01/01/example
```

---

### Tutorial 1.3: Analyze a Research Paper

**Command:** `/arxiv <url>`

```bash
/arxiv https://arxiv.org/abs/2301.04655
```

**What you get:**
- Plain English explanation (no jargon)
- Key contributions explained simply
- Methodology breakdown
- Practical implications

---

### Tutorial 1.4: Analyze Other Content Types

| Content Type | Command | Example |
|--------------|---------|---------|
| Podcast | `/podcast <file>` | `/podcast inbox/episode.mp3` |
| PDF | `/pdf <file>` | `/pdf inbox/document.pdf` |
| GitHub Repo | `/github <url>` | `/github https://github.com/user/repo` |
| Book (EPUB) | `/book <file>` | `/book inbox/book.epub` |
| Hacker News | `/hn <url>` | `/hn https://news.ycombinator.com/item?id=123` |
| Twitter Thread | `/thread <url>` | `/thread https://twitter.com/user/status/123` |
| Newsletter | `/email <file>` | `/email inbox/newsletter.txt` |
| Any Text | `/analyze <file>` | `/analyze inbox/notes.txt` |

---

### Tutorial 1.5: Batch Processing

**Create a batch file** `inbox/reading-list.txt`:
```
# My reading list
https://www.youtube.com/watch?v=UF8uR6Z6KLc
https://paulgraham.com/startupideas.html
https://arxiv.org/abs/2301.04655
```

**Process all at once:**
```bash
/batch inbox/reading-list.txt
```

---

### Tutorial 1.6: Queue Management

**Add items throughout the day:**
```bash
/queue add https://www.youtube.com/watch?v=example1
/queue add https://example.com/article
```

**Check your queue:**
```bash
/queue list
```

**Process when ready:**
```bash
/queue process
```

---

### Tutorial 1.7: View Activity Log

```bash
/log
```

Shows today's consumption history organized by content type.

---

### Tutorial 1.8: Rediscover Content

**Random report:**
```bash
/random
/random youtube  # Filter by type
```

**Find related content:**
```bash
/similar "machine learning"
```

---

### Tutorial 1.9: Generate Weekly Digest

```bash
/digest
/digest lastweek
/digest month
```

---

### Tutorial 1.10: Export & Flashcards

**Export to Obsidian:**
```bash
/export obsidian
```
Output: `exports/obsidian/` - Open as Obsidian vault

**Export to Notion:**
```bash
/export notion
```

**Generate Anki flashcards:**
```bash
/flashcards all
/flashcards reports/youtube/2024-01-15_video.md
```

---

### Tutorial 1.11: RSS Feeds

**Subscribe to feeds:**
```bash
/rss add https://www.youtube.com/feeds/videos.xml?channel_id=UCxyz youtube
/rss add https://blog.example.com/feed.xml
```

**Check for new content:**
```bash
/rss check
```

**List subscriptions:**
```bash
/rss list
```

---

## Part 2: Web Application

The web application provides a graphical interface with additional AI-powered features.

### Tutorial 2.1: Starting the Web App

**Terminal 1 - Backend:**
```bash
cd web/backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd web/frontend
npm run dev
```

**Open:** http://localhost:3000

---

### Tutorial 2.2: Dashboard Overview

**Click path:** Open http://localhost:3000

The dashboard shows:
- **Recent Reports**: Your 5 most recent analyses
- **Quick Stats**: Total reports, content by type
- **Quick Analysis**: Form to analyze content directly

**Try it:**
1. Look at the "Recent Reports" section
2. Click any report card to view it
3. Note the content type badges (YouTube, Article, Paper, Other)

---

### Tutorial 2.3: Analyzing Content via Web

**Click path:** Sidebar → **Analyze**

1. **Select content type**: YouTube, Article, or arXiv
2. **Paste URL**: Enter the content URL
3. **Choose model**:
   - **Haiku**: Fastest, cheapest (~$0.01)
   - **Sonnet**: Balanced (default)
   - **Opus**: Best quality, slowest (~$0.25)
4. **Click "Analyze"**
5. **Watch progress**: Real-time status updates
6. **View report**: Automatically redirects when complete

**Example:**
1. Click "Analyze" in sidebar
2. Select "YouTube"
3. Paste: `https://www.youtube.com/watch?v=UF8uR6Z6KLc`
4. Select "Sonnet" model
5. Click "Analyze"

---

### Tutorial 2.4: Browsing Reports

**Click path:** Sidebar → **Reports**

**Features:**
- **Filter by type**: Click "All", "YouTube", "Articles", "Papers", "Other" tabs
- **Pagination**: Navigate through pages of reports
- **Report count**: Shows total reports matching filter

**Try it:**
1. Click "Reports" in sidebar
2. Click "YouTube" to filter to only videos
3. Click "All" to see everything again
4. Click a report card to view details

---

### Tutorial 2.5: Viewing a Report

**Click path:** Reports → Click any report card

**Report detail page shows:**
- **Back link**: "← Back to Reports"
- **Action buttons**: Move, Delete (top right)
- **Tools bar**: Audio Player, Credibility Analysis, Translation
- **Full report content**: Rendered markdown with all sections

---

### Tutorial 2.6: Searching Reports

**Click path:** Sidebar → **Search**

1. **Type search query**: e.g., "machine learning"
2. **Press Enter** or click Search
3. **View results**: Reports matching your query

**Example searches:**
- `productivity` - Find reports mentioning productivity
- `"exact phrase"` - Search for exact phrase
- `author:paul graham` - Search in author fields

---

### Tutorial 2.7: Activity Log

**Click path:** Sidebar → **Logs**

Shows today's activity organized by:
- Videos Watched
- Articles Read
- Papers Reviewed
- Other Content

Each entry links to the full report.

---

### Tutorial 2.8: Dark Mode

**Click path:** Bottom of sidebar → **Theme toggle button** (sun/moon icon)

1. Click the sun/moon icon in the bottom-left of the sidebar
2. Theme switches between light and dark mode
3. Preference is saved in your browser

---

## Part 3: AI-Powered Features

### Tutorial 3.1: Knowledge Graph

**Click path:** Sidebar → **Knowledge Graph**

Visualizes concepts and relationships extracted from all your reports.

**Features:**
- **Interactive canvas**: Drag nodes, zoom in/out
- **Concept nodes**: Key topics from your reports
- **Relationship lines**: Connections between concepts
- **Click a node**: See linked reports

**Try it:**
1. Click "Knowledge Graph" in sidebar
2. Wait for the graph to load
3. Drag nodes to rearrange
4. Click a concept to see related reports
5. Use mouse wheel to zoom

**Build the graph:**
- Click "Extract All" to process all reports
- Or the graph builds automatically as you add reports

---

### Tutorial 3.2: Q&A System

**Click path:** Sidebar → **Q&A**

Ask natural language questions across your entire knowledge base.

**Example questions:**
- "What are the main productivity techniques I've learned?"
- "Summarize what I know about machine learning"
- "What did Paul Graham say about startup ideas?"

**Try it:**
1. Click "Q&A" in sidebar
2. Type: "What are the key insights from my YouTube videos?"
3. Press Enter
4. Read the answer with source citations
5. Click source links to view original reports

**Suggested questions:**
- The system suggests relevant questions based on your content
- Click any suggestion to ask it

---

### Tutorial 3.3: Content Comparison

**Click path:** Sidebar → **Compare**

Compare two reports side-by-side with AI analysis.

**Try it:**
1. Click "Compare" in sidebar
2. Select first report from dropdown
3. Select second report from dropdown
4. Click "Compare"
5. View:
   - Side-by-side summaries
   - Key similarities
   - Key differences
   - Unique insights from each

**Use cases:**
- Compare two articles on the same topic
- See how different authors approach a subject
- Find contradictions or agreements

---

### Tutorial 3.4: Source Credibility Analysis

**Click path:** Reports → View any report → **Credibility panel**

AI-powered trustworthiness analysis of any report.

**Try it:**
1. Open any report
2. Find the "Credibility" panel in the tools bar
3. Click "Analyze" (or it may load automatically)
4. View:
   - **Overall score**: 0-100 credibility rating
   - **Source quality**: Author/publication reputation
   - **Evidence quality**: How well claims are supported
   - **Bias level**: Detected bias indicators
   - **Red flags**: Warning signs
   - **Strengths**: Positive credibility factors

---

### Tutorial 3.5: Smart Recommendations

**Click path:** Sidebar → **Discover**

Personalized content suggestions based on your reading patterns.

**Features:**
- **Recommended for you**: Based on your history
- **Trending topics**: Popular themes in your content
- **Similar to recent**: Content like what you just read

**Try it:**
1. Click "Discover" in sidebar
2. Browse recommended reports
3. Click "Trending" to see popular topics
4. Click any recommendation to view the report

---

## Part 4: Learning Features

### Tutorial 4.1: Spaced Repetition Review

**Click path:** Sidebar → **Review**

SM-2 algorithm for long-term knowledge retention.

**How it works:**
1. Add reports to your review queue
2. System schedules reviews based on SM-2 algorithm
3. Rate your recall (0-5) after each review
4. Easier items shown less frequently

**Try it:**
1. Click "Review" in sidebar
2. See reports due for review
3. Click "Start Review"
4. Read the report summary
5. Rate your recall:
   - **0**: Complete blackout
   - **1**: Incorrect, but recognized
   - **2**: Incorrect, but easy to recall
   - **3**: Correct with difficulty
   - **4**: Correct with hesitation
   - **5**: Perfect recall
6. Continue to next card

**Add reports to review:**
- From any report detail page, click "Add to Review"
- Or from the Review page, click "Add Reports"

**View statistics:**
- Total cards in review
- Cards due today
- Average ease factor
- Review streak

---

### Tutorial 4.2: Learning Goals

**Click path:** Sidebar → **Goals**

Set and track learning objectives with progress visualization.

**Try it:**
1. Click "Goals" in sidebar
2. Click "Create Goal"
3. Fill in:
   - **Title**: e.g., "Master Machine Learning Basics"
   - **Description**: What you want to learn
   - **Keywords**: e.g., "machine learning, neural networks, AI"
   - **Target**: Number of reports to complete
4. Click "Save"

**Track progress:**
- Goals automatically link to reports matching your keywords
- Progress bar shows completion percentage
- Click a goal to see linked reports

**Manage goals:**
- **Edit**: Update title, keywords, or target
- **Complete**: Mark as finished
- **Delete**: Remove the goal

---

### Tutorial 4.3: Audio Reports (Text-to-Speech)

**Click path:** Reports → View any report → **Audio Player panel**

Convert reports to audio for listening on the go.

**Requirements:** OpenAI API key in `.env` (for TTS)

**Try it:**
1. Open any report
2. Find the "Audio" panel in the tools bar
3. Select a voice:
   - **Alloy**: Neutral
   - **Echo**: Male
   - **Fable**: British
   - **Onyx**: Deep male
   - **Nova**: Female
   - **Shimmer**: Soft female
4. Click "Generate Audio"
5. Wait for generation (30-60 seconds)
6. Use player controls: Play, Pause, Seek
7. Download MP3 for offline listening

**Previously generated:**
- Audio versions are cached
- Switch between voices without regenerating

---

### Tutorial 4.4: Multi-Language Translation

**Click path:** Reports → View any report → **Translation panel**

Translate reports to 10+ languages using Claude AI.

**Supported languages:**
- Spanish, French, German, Italian, Portuguese
- Japanese, Korean, Chinese
- Russian, Arabic

**Try it:**
1. Open any report
2. Find the "Translation" panel in the tools bar
3. Select target language from dropdown
4. Click "Translate"
5. Wait for translation (30-60 seconds)
6. View translated content
7. Toggle between original and translated

**Cached translations:**
- Once translated, the version is saved
- Switch languages without re-translating

---

## Part 5: File Management

### Tutorial 5.1: Delete a Single Report

**Method A: From Report Card**
1. Go to Reports page
2. Hover over any report card
3. Click the **⋮** (three dots) menu
4. Click "Delete"
5. Confirm in the dialog

**Method B: From Report Detail Page**
1. Open any report
2. Click the red "Delete" button (top right)
3. Confirm in the dialog

**What happens:**
- Report file deleted from `reports/` folder
- Database record removed
- Toast notification confirms deletion

---

### Tutorial 5.2: Bulk Delete Multiple Reports

**Click path:** Reports → **Select** button

1. Go to Reports page
2. Click "Select" button (top right)
3. Checkboxes appear on all cards
4. Click cards to select (or use checkboxes)
5. **Keyboard shortcuts:**
   - `Ctrl+A` / `Cmd+A`: Select all visible
   - `Escape`: Exit selection mode
   - `Delete`: Delete selected
6. Click "Delete" in the floating action bar
7. Confirm bulk deletion

**Floating action bar shows:**
- Number of selected reports
- Delete button
- Cancel button

---

### Tutorial 5.3: Move Report to Different Category

**Click path:** Report card menu → "Move to..."

1. Hover over any report card
2. Click the **⋮** menu
3. Click "Move to..."
4. Select new category:
   - YouTube
   - Article
   - Paper
   - Other
5. Click "Move"

**What happens:**
- File physically moved to new category folder
- Database updated with new category
- Report appears under new filter

**Also available from:**
- Report detail page → "Move" button

---

### Tutorial 5.4: Auto-Indexing (FileWatcher)

The system automatically monitors your `reports/` folder.

**Create a report manually:**
```bash
# Create a new markdown file
echo "# Test Report" > reports/other/2024-01-15_test.md
```

**What happens:**
- FileWatcher detects the new file (within seconds)
- File automatically indexed in database
- Appears in web UI without refresh

**Delete a file manually:**
```bash
rm reports/other/2024-01-15_test.md
```

**What happens:**
- FileWatcher detects deletion
- Database record automatically removed
- Disappears from web UI

**No manual sync required!**

---

## Part 6: Browser Extension

### Tutorial 6.1: Installing the Extension

**Click path:** `web/extension/` folder

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the `web/extension/` folder
6. Extension icon appears in toolbar

---

### Tutorial 6.2: Using the Extension

**Quick Analysis:**
1. Navigate to any YouTube video or article
2. Click the extension icon in toolbar
3. Select model (Haiku/Sonnet/Opus)
4. Click "Analyze"
5. Report saved to your Personal OS

**Context Menu:**
1. Right-click on any page
2. Select "Analyze with Personal OS"
3. Content added to queue or analyzed immediately

**Options:**
1. Right-click extension icon → "Options"
2. Configure:
   - Backend URL (default: http://localhost:8000)
   - Default model
   - Auto-analyze behavior

---

## Command Reference

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/yt <url>` | Analyze YouTube video | `/yt https://youtube.com/watch?v=abc` |
| `/read <url>` | Analyze web article | `/read https://example.com/post` |
| `/arxiv <url>` | Analyze arXiv paper | `/arxiv https://arxiv.org/abs/2301.04655` |
| `/podcast <file>` | Analyze podcast | `/podcast inbox/episode.mp3` |
| `/pdf <file>` | Analyze PDF | `/pdf inbox/doc.pdf` |
| `/github <url>` | Analyze GitHub repo | `/github https://github.com/user/repo` |
| `/book <file>` | Analyze EPUB book | `/book inbox/book.epub` |
| `/hn <url>` | Analyze HN post | `/hn https://news.ycombinator.com/item?id=123` |
| `/thread <url>` | Analyze Twitter thread | `/thread https://twitter.com/user/status/123` |
| `/email <file>` | Analyze newsletter | `/email inbox/newsletter.txt` |
| `/analyze <file>` | Analyze any text | `/analyze inbox/notes.txt` |
| `/batch <file>` | Process batch file | `/batch inbox/list.txt` |
| `/queue add <url>` | Add to queue | `/queue add https://example.com` |
| `/queue list` | View queue | `/queue list` |
| `/queue process` | Process queue | `/queue process` |
| `/log` | View activity log | `/log` |
| `/random [type]` | Random report | `/random youtube` |
| `/similar <topic>` | Find related | `/similar "AI"` |
| `/digest [period]` | Weekly digest | `/digest lastweek` |
| `/export obsidian` | Export to Obsidian | `/export obsidian` |
| `/export notion` | Export to Notion | `/export notion` |
| `/flashcards <scope>` | Generate flashcards | `/flashcards all` |
| `/rss add <url>` | Subscribe to feed | `/rss add https://blog.com/feed.xml` |
| `/rss list` | List feeds | `/rss list` |
| `/rss check` | Check for new | `/rss check` |

### Web UI Click Paths

| Feature | Click Path |
|---------|------------|
| Analyze content | Sidebar → Analyze → Fill form → Submit |
| Browse reports | Sidebar → Reports → Click filters/cards |
| Search reports | Sidebar → Search → Type query → Enter |
| View report | Reports → Click any card |
| Delete report | Report card → ⋮ menu → Delete → Confirm |
| Bulk delete | Reports → Select → Check items → Delete |
| Move category | Report card → ⋮ menu → Move to... → Select → Move |
| Knowledge Graph | Sidebar → Knowledge Graph → Explore nodes |
| Ask questions | Sidebar → Q&A → Type question → Enter |
| Compare reports | Sidebar → Compare → Select 2 reports → Compare |
| Credibility check | Open report → Credibility panel → Analyze |
| Recommendations | Sidebar → Discover → Browse suggestions |
| Spaced repetition | Sidebar → Review → Start Review → Rate |
| Learning goals | Sidebar → Goals → Create Goal → Track |
| Audio report | Open report → Audio panel → Select voice → Generate |
| Translation | Open report → Translation panel → Select language → Translate |
| Dark mode | Sidebar bottom → Click sun/moon icon |

### Keyboard Shortcuts (Reports Page)

| Shortcut | Action |
|----------|--------|
| `Delete` | Delete selected reports (in selection mode) |
| `Ctrl+A` / `Cmd+A` | Select all visible reports |
| `Escape` | Exit selection mode |

---

## Suggested Workflows

### Daily Workflow
1. **Morning**: Check `/rss check` or Discover page for new content
2. **Throughout day**: Queue interesting content via extension or `/queue add`
3. **Evening**: Process queue, review reports due in Review

### Weekly Workflow
1. **Generate digest**: `/digest` or view activity logs
2. **Review goals**: Check progress on learning goals
3. **Explore graph**: Find new connections in Knowledge Graph
4. **Generate flashcards**: Create Anki cards from key reports

### Research Workflow
1. **Batch process**: Create list of papers/articles → `/batch`
2. **Compare**: Use Compare feature for related content
3. **Q&A**: Ask synthesizing questions across sources
4. **Export**: Send to Obsidian for further organization

---

## Troubleshooting

### Backend won't start
```bash
cd web/backend
pip install -r requirements.txt
```

### Frontend won't start
```bash
cd web/frontend
npm install
```

### "ANTHROPIC_API_KEY not set"
Create `web/backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Audio/TTS not working
Add OpenAI key to `.env`:
```
OPENAI_API_KEY=sk-your-openai-key
```

### Report not appearing in UI
- Reports auto-index within seconds via FileWatcher
- Check browser console for errors
- Try refreshing the page

---

## Next Steps

1. **Analyze 5 pieces of content** you've been meaning to get to
2. **Set up 3 learning goals** for topics you want to master
3. **Try the Q&A system** to synthesize knowledge
4. **Generate your first audio report** for commute listening
5. **Install the browser extension** for quick capture

---

**You're now a Personal OS power user!**

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
