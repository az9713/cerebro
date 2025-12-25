# Personal OS - Content Consumption Automation System

## What Is This?

Personal OS is a **content consumption automation system** that helps you efficiently process and analyze:
- YouTube video transcripts
- Blog posts and articles
- arXiv research papers
- Any text-based content

Instead of manually copying content to ChatGPT, copying responses back, and saving files - this system automates the entire workflow with simple commands.

---

## The Problem This Solves

**Before (Manual Workflow):**
1. Find interesting YouTube video
2. Copy transcript from YouTube
3. Paste into ChatGPT/Gemini
4. Wait for analysis
5. Copy the response
6. Create a new file
7. Paste and save
8. Repeat for every video/article...

**After (With Personal OS):**
1. Save transcript to `inbox/video.txt`
2. Type `/yt inbox/video.txt` OR just say "Analyze this YouTube transcript"
3. Done! Report saved and logged automatically.

---

## Quick Start (5 Minutes)

### Prerequisites
- **Claude Code** installed and working ([Download here](https://claude.ai/download))
- **Windows** computer (this guide is for Windows)
- **yt-dlp** (optional, for YouTube URL support): `pip install yt-dlp`

### Your First Analysis

1. **Open Terminal** in this folder
   - Open File Explorer
   - Navigate to `cerebro`
   - Right-click in empty space → "Open in Terminal"

2. **Start Claude Code**
   ```
   claude
   ```

3. **Analyze the sample transcript** (or use a YouTube URL!)
   ```
   /yt docs/transcript.txt
   ```
   Or with yt-dlp installed, analyze directly from URL:
   ```
   /yt https://youtube.com/watch?v=YOUR_VIDEO_ID
   ```

4. **View your report**
   - Check `reports/youtube/` folder
   - A new `.md` file contains your analysis!

5. **Check today's log**
   ```
   /log
   ```

---

## Folder Structure Explained

```
cerebro/
│
├── .claude/               # CLAUDE CODE AUTOMATION
│   ├── commands/          # Slash Commands (explicit: /yt, /read, etc.)
│   │   ├── yt.md          # /yt command
│   │   ├── read.md        # /read command
│   │   ├── arxiv.md       # /arxiv command
│   │   ├── analyze.md     # /analyze command
│   │   ├── batch.md       # /batch command
│   │   └── log.md         # /log command
│   │
│   ├── skills/            # Skills (automatic, natural language)
│   │   ├── youtube-analysis/
│   │   ├── article-analysis/
│   │   ├── arxiv-analysis/
│   │   ├── content-analysis/
│   │   ├── batch-processing/
│   │   └── activity-log/
│   │
│   └── agents/            # Agents (specialized background tasks)
│       └── markdown-format-verifier.md
│
├── CLAUDE.md              # Project instructions for Claude
├── README.md              # You are here!
│
├── inbox/                 # PUT YOUR CONTENT HERE
│   └── (drop .txt files)  # Transcripts, articles, any text
│
├── prompts/               # HOW ANALYSIS IS DONE (customizable)
│   ├── yt.md              # YouTube video analysis style
│   ├── article.md         # Blog/article analysis style
│   ├── paper.md           # Research paper analysis style
│   └── default.md         # Generic analysis style
│
├── reports/               # WHERE REPORTS GO (auto-generated)
│   ├── youtube/           # Video analyses
│   ├── articles/          # Blog/article analyses
│   ├── papers/            # Research paper analyses
│   └── other/             # Everything else
│
├── logs/                  # ACTIVITY TRACKING (auto-generated)
│   └── YYYY-MM-DD.md      # Daily log files
│
└── docs/                  # DOCUMENTATION & REFERENCE
    ├── QUICK_START.md     # 13 example use cases
    ├── USER_GUIDE.md      # Complete user manual
    ├── DEVELOPER_GUIDE.md # For future developers
    ├── transcript.txt     # Sample transcript (Teresa Torres video)
    └── gpt5_summary.txt   # Sample summary
```

---

## Three Ways to Use: Commands, Skills & Agents

### Option 1: Slash Commands (Explicit)

Type a command directly:

| Command | What It Does | Example |
|---------|--------------|---------|
| `/yt <url-or-file>` | Analyze YouTube video (URL or transcript) | `/yt https://youtube.com/watch?v=abc` |
| `/read <url>` | Analyze web article | `/read https://example.com/article` |
| `/arxiv <url>` | Analyze research paper | `/arxiv https://arxiv.org/abs/2401.12345` |
| `/analyze <file>` | Analyze any content | `/analyze inbox/notes.txt` |
| `/batch <file>` | Process multiple items (URLs or files) | `/batch inbox/reading-list.txt` |
| `/log` | Show today's activity | `/log` |

### Option 2: Skills (Natural Language)

Just describe what you want - Claude automatically uses the right skill:

| Say This... | Claude Uses |
|-------------|-------------|
| "Analyze this YouTube video: https://youtube.com/watch?v=abc" | `youtube-analysis` skill |
| "Analyze this YouTube transcript at inbox/video.txt" | `youtube-analysis` skill |
| "Can you summarize this blog post?" | `article-analysis` skill |
| "Explain this arXiv paper to me" | `arxiv-analysis` skill |
| "What did I read today?" | `activity-log` skill |
| "Process all items in my reading list" | `batch-processing` skill |

### Option 3: Agents (Specialized Tasks)

Agents handle complex, multi-file tasks autonomously:

| Say This... | What Happens |
|-------------|--------------|
| "Check if all markdown files are formatted correctly" | `markdown-format-verifier` scans all .md files |
| "Verify the markdown formatting in the docs folder" | Agent checks docs/ for formatting issues |
| "Validate my .md files" | Agent generates a verification report |

**Commands and Skills** are for content analysis. **Agents** are for codebase tasks like verification and auditing.

---

## Documentation Index

| Document | Who It's For | What's Inside |
|----------|--------------|---------------|
| [QUICK_START.md](docs/QUICK_START.md) | New users | 14 example use cases with step-by-step instructions |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | All users | Complete manual for daily use |
| [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Future developers | How to extend and modify the system |

---

## Customization

### Change How Analysis Works

Edit files in `prompts/` folder:
- `prompts/yt.md` - Change what's included in video analyses
- `prompts/article.md` - Change article analysis format
- `prompts/paper.md` - Change research paper analysis
- `prompts/default.md` - Change generic analysis

See [Understanding the Prompt System](#understanding-the-prompt-system) below for full documentation.

### Example: Add "ELI5 Summary" to Video Analysis

1. Open `prompts/yt.md`
2. Add a new section:
   ```markdown
   ## 13. ELI5 (Explain Like I'm 5)
   Explain the main idea in the simplest possible terms.
   ```
3. Save the file
4. Future video analyses will include this section!

---

## Understanding the Prompt System

### Why Enhanced Prompts?

The analysis prompts were designed with two goals:

1. **Maximum Breadth** - Extract ALL significant information, not just top 5-7 points
2. **Maximum Depth** - Capture specifics (numbers, names, quotes) not just summaries

Each prompt includes **12-14 comprehensive sections** that ensure no valuable information is lost.

### The Prompt Philosophy

| Problem | Solution |
|---------|----------|
| Limited takeaways (5-7 only) | Extract ALL significant points exhaustively |
| Shallow analysis | Capture specific facts, numbers, names, examples |
| Missing frameworks | Dedicated section for mental models & concepts |
| Missing tools/references | Dedicated section for resources mentioned |
| No critical analysis | Sections for critiques, gaps, counterarguments |
| Surface-level insights only | **Latent Signals** section for inferred insights |

### Latent Signals: Reading Between the Lines

Every prompt includes a **Latent Signals** section that surfaces insights that are implied but not explicitly stated:

- **Unstated assumptions** - What does the creator take for granted?
- **Implied predictions** - What future trends are suggested?
- **Hidden motivations** - Why is this being shared now?
- **Second-order effects** - What downstream consequences follow?
- **Market/industry signals** - What does this suggest about where things are heading?
- **Contrarian indicators** - What's conspicuously NOT being said?

**Important:** Latent signals are only included when genuine inferences can be made. The system will NOT fabricate signals if none exist.

### Prompt Structure by Content Type

#### YouTube Videos (`prompts/yt.md`) - 12 Sections

| Section | Purpose |
|---------|---------|
| 1. Overview | Title, creator, content type, target audience, core thesis |
| 2. Comprehensive Summary | 3-4 paragraph thorough summary |
| 3. Key Takeaways | ALL significant points (not just 5-7) |
| 4. Facts, Statistics & Data | Every specific number, metric, benchmark |
| 5. Frameworks, Models & Concepts | Mental models, terminology, taxonomies |
| 6. Tools, Resources & References | Software, books, people mentioned |
| 7. Examples & Case Studies | Real-world examples, success/failure stories |
| 8. Notable Quotes | 5-10 memorable quotes with timestamps |
| 9. Actionable Insights | Immediate, short-term, long-term actions |
| 10. Questions & Gaps | What wasn't addressed, counterarguments |
| 11. Latent Signals | Implied insights, second-order effects |
| 12. Connections | Related topics, follow-up suggestions |

#### Articles (`prompts/article.md`) - 13 Sections

| Section | Purpose |
|---------|---------|
| 1. Metadata | Title, author, publication, article type, core thesis |
| 2. Comprehensive Summary | 3-4 paragraph thorough summary |
| 3. All Key Points | Every significant argument and claim |
| 4. Facts, Statistics & Data | All numbers, research citations, metrics |
| 5. Frameworks & Mental Models | Conceptual tools introduced |
| 6. Examples & Evidence | Case studies, anecdotes, scenarios |
| 7. People, Companies & References | Individuals, organizations, citations |
| 8. Author's Perspective & Bias | Background, potential biases, assumptions |
| 9. Notable Quotes | 5-10 memorable passages |
| 10. Actionable Takeaways | What to do with this information |
| 11. Critical Analysis | Strengths, weaknesses, counterarguments |
| 12. Latent Signals | Implied insights, hidden motivations |
| 13. Connections | Related reading, contrasting viewpoints |

#### Research Papers (`prompts/paper.md`) - 14 Sections

| Section | Purpose |
|---------|---------|
| 1. Paper Overview | Title, authors, publication, paper type |
| 2. Plain English Summary | Accessible 3-4 paragraph explanation |
| 3. Research Question & Motivation | Why this research matters |
| 4. Key Contributions | All novel methods, findings, applications |
| 5. Methodology Deep Dive | Data, methods, experiments, baselines, metrics |
| 6. Results & Findings | All performance numbers, comparisons |
| 7. Limitations & Caveats | Stated and unstated limitations |
| 8. Technical Details | Equations, architecture, hyperparameters |
| 9. Related Work Context | Prior work, competing approaches |
| 10. Practical Implications | Real-world applications, industry relevance |
| 11. Future Directions | Open problems, research gaps |
| 12. Critical Assessment | Strengths, concerns, reproducibility |
| 13. Latent Signals | Field dynamics, timing significance |
| 14. References to Follow | Key papers for deeper understanding |

#### Generic Content (`prompts/default.md`) - 12 Sections

| Section | Purpose |
|---------|---------|
| 1. Overview | Content type, source, core topic, main message |
| 2. Comprehensive Summary | 3-4 paragraph summary |
| 3. All Key Points | Every significant idea |
| 4. Facts & Specifics | Numbers, dates, names, examples |
| 5. Concepts & Frameworks | Terms, models, categorizations |
| 6. Examples & Illustrations | Case studies, analogies, applications |
| 7. Resources & References | Tools, citations, people mentioned |
| 8. Notable Passages | 5-10 memorable quotes |
| 9. Actionable Insights | What to do with this information |
| 10. Questions Raised | Unanswered questions, gaps |
| 11. Latent Signals | Implied insights, hidden purposes |
| 12. Connections | Related topics, complementary content |

### Customizing Prompts

Prompts are fully customizable. To modify:

1. Open the appropriate file in `prompts/`
2. Add, remove, or modify sections
3. Save - changes take effect immediately (no restart needed)

**Tips for customization:**
- Keep numbered sections for clarity
- Be specific about what you want (e.g., "5-10 quotes" not "some quotes")
- Include formatting instructions at the end
- Test with sample content after changes

---

## How It Works (Technical)

This system uses three Claude Code features:

### Slash Commands (`.claude/commands/`)
- **User-invoked**: You explicitly type `/command`
- **Each `.md` file = one command** (e.g., `yt.md` → `/yt`)
- **`$ARGUMENTS`** placeholder gets replaced with your input

Example: `/yt inbox/video.txt`
1. Claude Code loads `.claude/commands/yt.md`
2. Replaces `$ARGUMENTS` with `inbox/video.txt`
3. Claude follows the instructions

### Skills (`.claude/skills/`)
- **Model-invoked**: Claude automatically detects when relevant
- **Each folder = one skill** with `SKILL.md` inside
- **Triggers based on context** from your natural language

Example: "Analyze this YouTube transcript at inbox/video.txt"
1. Claude reads skill descriptions and finds `youtube-analysis` matches
2. Claude loads `.claude/skills/youtube-analysis/SKILL.md`
3. Claude follows the instructions

### Agents (`.claude/agents/`)
- **Model-invoked**: Claude automatically detects when relevant
- **Each `.md` file = one agent** (e.g., `markdown-format-verifier.md`)
- **Handles complex tasks** across multiple files

Example: "Check if all markdown files are formatted correctly"
1. Claude detects markdown verification request
2. Claude loads `.claude/agents/markdown-format-verifier.md`
3. Agent scans all `.md` files and generates a report

### Commands vs Skills vs Agents Summary

| Aspect | Slash Commands | Skills | Agents |
|--------|----------------|--------|--------|
| Location | `.claude/commands/` | `.claude/skills/` | `.claude/agents/` |
| Structure | Single `.md` file | Folder with `SKILL.md` | Single `.md` file |
| Invocation | Explicit (`/yt`) | Automatic (natural language) | Automatic (natural language) |
| Best for | Quick, precise tasks | Conversational requests | Complex verification/audit |

---

## Troubleshooting

### "Claude doesn't recognize the command"
- Make sure you're in the correct folder
- Check that `.claude/commands/` folder exists with command files
- Restart Claude Code to reload commands

### "Report not saved"
- Check that `reports/` folders exist
- Claude will create them if missing

### "WebFetch failed"
- Some websites block automated access
- Try saving the content manually to `inbox/` instead

### "yt-dlp not found" or YouTube URL not working
- Install yt-dlp: `pip install yt-dlp`
- Make sure Python is in your PATH
- Try updating: `pip install --upgrade yt-dlp`

### "No captions available" for YouTube video
- The video may not have subtitles/captions enabled
- Try a different video or manually copy the transcript

---

## Credits & Inspiration

This system is inspired by [Teresa Torres](https://producttalk.org)'s approach to using Claude Code as a "Personal Operating System" - treating AI as a full-time employee that helps with knowledge work.

### Built with Claude Code

This entire project - all code, documentation, commands, skills, and agents - was created by [Claude Code](https://claude.ai/code) powered by **Claude Opus 4.5**. From the initial architecture to the final documentation, every file in this repository was generated through collaborative AI-assisted development.

---

## License

This is a personal productivity tool. Use and modify freely for your own purposes.
