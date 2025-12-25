# Developer Guide: Extending Personal OS

## Table of Contents

1. [Introduction](#1-introduction)
2. [Prerequisites for Developers](#2-prerequisites-for-developers)
3. [System Architecture](#3-system-architecture)
4. [Understanding Custom Slash Commands](#4-understanding-custom-slash-commands)
5. [The $ARGUMENTS Placeholder](#5-the-arguments-placeholder)
6. [Understanding Skills](#6-understanding-skills)
7. [Understanding Agents](#7-understanding-agents)
8. [Creating New Commands](#8-creating-new-commands)
9. [Creating New Skills](#9-creating-new-skills)
10. [Creating New Agents](#10-creating-new-agents)
11. [Creating New Prompts](#11-creating-new-prompts)
12. [Commands vs Skills vs Agents vs Prompts](#12-commands-vs-skills-vs-agents-vs-prompts)
13. [Modifying Existing Commands](#13-modifying-existing-commands)
14. [Modifying Existing Skills](#14-modifying-existing-skills)
15. [Working with File Operations](#15-working-with-file-operations)
16. [Working with External Tools](#16-working-with-external-tools)
17. [Working with Web Content](#17-working-with-web-content)
18. [Logging System](#18-logging-system)
19. [Testing Changes](#19-testing-changes)
20. [Common Modifications](#20-common-modifications)
21. [Troubleshooting Development Issues](#21-troubleshooting-development-issues)
22. [Best Practices](#22-best-practices)
23. [Example: Building a New Feature](#23-example-building-a-new-feature)
24. [Future Enhancement Ideas](#24-future-enhancement-ideas)

---

## 1. Introduction

### Purpose of This Guide

This guide explains how Personal OS works under the hood so you can:
- Extend the system with new features
- Modify existing behavior
- Fix bugs
- Customize for your needs

### Who This Is For

Anyone who wants to modify Personal OS, regardless of coding experience. This guide assumes:
- You can edit text files
- You understand basic file/folder concepts
- You're willing to experiment and learn

### No Coding Required!

Personal OS is built entirely on:
- **Markdown files** (.md) - Plain text with formatting
- **Claude Code** - AI that understands natural language

You don't need to write Python, JavaScript, or any programming language.

---

## 2. Prerequisites for Developers

### Required Knowledge

1. **Markdown Basics**
   - Headers: `# Header 1`, `## Header 2`
   - Lists: `- item` or `1. item`
   - Bold: `**bold**`
   - Code: `` `code` ``

2. **File System Understanding**
   - Navigating folders
   - Creating/editing files
   - Understanding file paths

3. **Claude Code Basics**
   - Running Claude Code
   - Using slash commands
   - Understanding context

### Recommended Tools

1. **Text Editor** (pick one):
   - Notepad (built into Windows)
   - Notepad++ (free, better features)
   - VS Code (free, powerful)

2. **Terminal**
   - Command Prompt (cmd)
   - PowerShell
   - Windows Terminal

### Setting Up Development Environment

1. Open the Personal OS folder
2. Open a terminal in this folder
3. Have your text editor ready
4. Start Claude Code: `claude`

### External Dependencies

The system uses one external dependency:

**yt-dlp** (for YouTube URL support)
- Install: `pip install yt-dlp`
- Used by: `/yt` command and `youtube-analysis` skill
- Purpose: Automatically fetch YouTube video transcripts from URLs

---

## 3. System Architecture

### Overview Diagram

Personal OS provides **two equivalent paths** to the same output:

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER INPUT                                │
│       Command: "/yt inbox/video.txt"                                │
│       OR Natural Language: "Analyze this YouTube transcript"        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│    SLASH COMMAND (explicit)  │  │    SKILL (automatic)             │
│    .claude/commands/yt.md    │  │    .claude/skills/youtube-       │
│                              │  │    analysis/SKILL.md             │
│  • User types /command       │  │  • Claude auto-detects context   │
│  • $ARGUMENTS replaced       │  │  • Matches trigger words         │
│  • Workflow instructions     │  │  • Same workflow instructions    │
└──────────────────────────────┘  └──────────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW EXECUTION                           │
│                                                                      │
│  1. Claude reads the content file                                   │
│  2. Claude reads the appropriate prompt file (prompts/*.md)         │
│  3. Claude applies analysis                                         │
│  4. Claude saves report and logs activity                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            OUTPUT                                    │
│                                                                      │
│  1. Report saved to reports/{category}/                             │
│  2. Entry added to logs/YYYY-MM-DD.md                               │
│  3. Summary shown to user                                           │
└─────────────────────────────────────────────────────────────────────┘
```

**Two paths, same destination!** Commands and Skills produce identical output.

### File Roles

| File/Folder | Role | Editable? |
|-------------|------|-----------|
| `.claude/commands/*.md` | Slash command definitions (explicit) | Yes (carefully) |
| `.claude/skills/*/SKILL.md` | Skill definitions (automatic) | Yes (carefully) |
| `.claude/agents/*.md` | Specialized agent definitions | Yes (carefully) |
| `CLAUDE.md` | Project instructions & context | Yes (carefully) |
| `prompts/*.md` | Analysis style instructions | Yes (freely) |
| `inbox/` | User input | Yes |
| `reports/` | Generated output | Read-only (auto-generated) |
| `logs/` | Activity tracking | Read-only (auto-generated) |
| `docs/` | Documentation | Yes |

### Data Flow - Slash Commands

1. **User** types command (e.g., `/yt inbox/video.txt`) →
2. **Claude Code** loads command from `.claude/commands/yt.md` →
3. **`$ARGUMENTS`** replaced with user input →
4. **Command instructions** executed by Claude →
5. **Prompt file** defines analysis style →
6. **Report** saved to `reports/` →
7. **Log entry** added to `logs/`

### Data Flow - Skills

1. **User** says natural language (e.g., "Analyze this YouTube transcript") →
2. **Claude Code** scans `.claude/skills/*/SKILL.md` descriptions →
3. **Matching skill** loaded (e.g., `youtube-analysis`) →
4. **Skill instructions** executed by Claude →
5. **Prompt file** defines analysis style →
6. **Report** saved to `reports/` →
7. **Log entry** added to `logs/`

---

## 4. Understanding Custom Slash Commands

### What Are Custom Slash Commands?

**Custom Slash Commands** are a native feature of Claude Code that enables project-specific commands. Each command is a markdown file in the `.claude/commands/` folder.

```
.claude/commands/
├── yt.md        → Creates /yt command
├── read.md      → Creates /read command
├── arxiv.md     → Creates /arxiv command
├── analyze.md   → Creates /analyze command
├── batch.md     → Creates /batch command
└── log.md       → Creates /log command
```

**Key Point:** The filename (minus `.md`) becomes the command name.

### Command File Structure

Every command file **must** start with YAML frontmatter, followed by the command content:

```markdown
---
description: Brief description shown when user types /help
---

# [Title - What This Command Does]

[Brief description with $ARGUMENTS placeholder]

## Steps

1. **Step one** - What to do first
2. **Step two** - What to do next
3. **Step three** - Continue...

## [Additional Sections as needed]

- Error handling
- Output format
- Special instructions
```

**IMPORTANT:** The YAML frontmatter (the `---` block at the top with `description:`) is **required**. Without it, Claude Code will not recognize the command and show "Unknown slash command" error.

### Example Command File: `/yt`

Here's the actual `.claude/commands/yt.md` (simplified view):

```markdown
---
description: Analyze a YouTube video transcript and generate a structured report
---

# Analyze YouTube Video

Analyze the YouTube video at: $ARGUMENTS

## Step 0: Detect Input Type

Check if `$ARGUMENTS` is a **YouTube URL** or a **file path**:

**YouTube URL patterns:**
- Contains `youtube.com/watch`
- Contains `youtu.be/`
- Contains `youtube.com/shorts/`

If URL → proceed to Step 1A (fetch with yt-dlp)
If file path → proceed to Step 1B (read file directly)

## Step 1A: Fetch Transcript with yt-dlp (URL Input)

Run yt-dlp to download the transcript:
```bash
yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --convert-subs srt -o "inbox/%(title)s" "<URL>"
```

## Step 1B: Read Transcript File (File Input)

Read the transcript file at the path provided.

## Steps (continued)

3. **Read the analysis prompt** from `prompts/yt.md`
4. **Extract the video title** from the transcript
5. **Generate analysis** following the prompt structure
6. **Save the report** to `reports/youtube/YYYY-MM-DD_sanitized-title.md`
7. **Update the activity log** at `logs/YYYY-MM-DD.md`
8. **Confirm to user** what was saved and where
```

**Key Feature:** The `/yt` command now supports both:
- YouTube URLs (auto-fetches transcript with yt-dlp)
- File paths (reads transcript directly)

### How Claude Code Loads Commands

1. User types `/yt inbox/video.txt`
2. Claude Code looks for `.claude/commands/yt.md`
3. Loads the command file content
4. Replaces `$ARGUMENTS` with `inbox/video.txt`
5. Passes the result to Claude as instructions

---

## 5. The $ARGUMENTS Placeholder

### What Is $ARGUMENTS?

`$ARGUMENTS` is a special placeholder in command files that gets replaced with whatever the user types after the command.

### Examples

| User Types | $ARGUMENTS Becomes |
|------------|-------------------|
| `/yt https://youtube.com/watch?v=abc` | `https://youtube.com/watch?v=abc` |
| `/yt inbox/video.txt` | `inbox/video.txt` |
| `/read https://example.com/article` | `https://example.com/article` |
| `/batch inbox/list.txt` | `inbox/list.txt` |
| `/log` | *(empty string)* |
| `/analyze inbox/notes.txt` | `inbox/notes.txt` |

### Using $ARGUMENTS in Commands

**Basic usage:**
```markdown
# My Command

Process the file at: $ARGUMENTS
```

**With context:**
```markdown
# Analyze Content

Analyze the content file located at: $ARGUMENTS

The user has provided this file for analysis.
```

**Multiple references:**
```markdown
# Process File

1. Read the file at $ARGUMENTS
2. If $ARGUMENTS doesn't exist, inform user
3. Save output based on $ARGUMENTS filename
```

### Commands Without Arguments

For commands like `/log` that don't need arguments, you can still include `$ARGUMENTS` but it will be empty:

```markdown
# Show Activity Log

Display the activity log for today.
$ARGUMENTS

(Note: This command doesn't require arguments)
```

---

## 6. Understanding Skills

### What Are Skills?

**Skills** are a Claude Code feature that enables Claude to **automatically detect** when a workflow is relevant based on natural language. Unlike commands (which require explicit `/command` syntax), skills are triggered when the user's message matches certain keywords or patterns.

```
.claude/skills/
├── youtube-analysis/        → Triggered by "YouTube", "video transcript"
│   └── SKILL.md
├── article-analysis/        → Triggered by "blog", "article", "Substack"
│   └── SKILL.md
├── arxiv-analysis/          → Triggered by "arXiv", "research paper"
│   └── SKILL.md
├── content-analysis/        → Triggered by "notes", "document"
│   └── SKILL.md
├── batch-processing/        → Triggered by "batch", "multiple items"
│   └── SKILL.md
└── activity-log/            → Triggered by "today", "activity log"
    └── SKILL.md
```

**Key Point:** Each skill is a **folder** containing a `SKILL.md` file.

### Skill File Structure

Every skill file **must** have YAML frontmatter with `name` and `description`:

```markdown
---
name: skill-name
description: Description including trigger words. Max 1024 characters.
---

# Skill Title

## When to Use

[Describe when Claude should activate this skill]

## Instructions

1. **Step one** - What to do first
2. **Step two** - What to do next
3. **Step three** - Continue...

## [Additional Sections as needed]

- Error handling
- Output format
- Related commands
```

### YAML Frontmatter Requirements

```yaml
---
name: skill-name       # Required. Lowercase, hyphens, max 64 chars
description: ...       # Required. Max 1024 chars. Include trigger words!
---
```

**The `description` field is critical!** Claude uses this to determine when to activate the skill. Include all relevant trigger words.

**Good description:**
```yaml
description: Analyze YouTube video transcripts to extract summaries, key takeaways,
and insights. Use when the user mentions YouTube, video transcript, video analysis,
or wants to analyze a .txt file containing a video transcript.
```

**Bad description:**
```yaml
description: Analyze videos.
```

### Example Skill File: `youtube-analysis`

Here's the actual `.claude/skills/youtube-analysis/SKILL.md`:

```markdown
---
name: youtube-analysis
description: Analyze YouTube video transcripts to extract summaries, key takeaways,
and insights. Use when the user mentions YouTube, video transcript, video analysis,
or wants to analyze a .txt file containing a video transcript.
---

# YouTube Video Transcript Analysis

Analyze YouTube video transcripts and create structured reports.

## When to Use

Activate this skill when the user:
- Mentions "YouTube", "video", "transcript"
- Wants to analyze a video transcript file
- Asks for video summary or key points

## Instructions

1. **Get the file path** from user or context
2. **Read the transcript file** at the path provided
3. If file not found:
   - Inform user: "File not found at [path]"
   - Stop here
4. **Read the analysis prompt** from `prompts/yt.md`
5. **Extract the video title** from the transcript
6. **Generate analysis** following the prompt structure
7. **Save the report** to `reports/youtube/YYYY-MM-DD_title.md`
8. **Update the activity log** at `logs/YYYY-MM-DD.md`
9. **Confirm to user** what was saved and where

## Related

- Slash command equivalent: `/yt`
- Prompt file: `prompts/yt.md`
- Output location: `reports/youtube/`
```

### How Claude Code Loads Skills

1. User says "Analyze this YouTube transcript at inbox/video.txt"
2. Claude Code scans all `.claude/skills/*/SKILL.md` files
3. Reads the `description` field from each skill's frontmatter
4. Matches user's message to the most relevant skill
5. Loads and follows the skill's instructions

### Skills vs Commands: Key Differences

| Aspect | Slash Commands | Skills |
|--------|----------------|--------|
| **Location** | `.claude/commands/` | `.claude/skills/*/` |
| **Structure** | Single `.md` file | Folder with `SKILL.md` |
| **Invocation** | User types `/command` | Claude auto-detects |
| **Arguments** | Uses `$ARGUMENTS` | Extracts from context |
| **Best for** | Quick, precise tasks | Conversational flow |
| **Restart needed** | Yes (after changes) | Yes (after changes) |

---

## 7. Understanding Agents

### What Are Agents?

**Agents** are specialized Claude Code components that handle complex, multi-step tasks autonomously. Unlike commands (explicit) or skills (automatic), agents are designed for tasks that require deep analysis, verification, or processing across multiple files.

```
.claude/agents/
└── markdown-format-verifier.md   → Verifies markdown formatting
```

**Key Point:** Each agent is a single `.md` file in the `.claude/agents/` folder.

### Agent File Structure

Every agent file has YAML frontmatter with required fields:

```markdown
---
name: agent-name
description: Description of what the agent does and when to use it.
model: sonnet
---

# Agent Title

[Agent instructions and workflow]
```

### Current Agents

| Agent | Purpose | Triggers |
|-------|---------|----------|
| `markdown-format-verifier` | Verify markdown formatting across codebase | "check markdown format", "validate .md files", "verify formatting" |

### Example Agent: markdown-format-verifier

The `markdown-format-verifier` agent:
- Scans all `.md` files in the project
- Checks for formatting issues (headers, lists, code blocks, links, tables)
- Generates a verification report with findings and recommendations

**Trigger phrases:**
- "Check if all markdown files are formatted correctly"
- "Verify the markdown formatting in the docs folder"
- "Validate my .md files"

### Agents vs Commands vs Skills

| Aspect | Commands | Skills | Agents |
|--------|----------|--------|--------|
| **Location** | `.claude/commands/` | `.claude/skills/*/` | `.claude/agents/` |
| **Structure** | Single `.md` file | Folder with `SKILL.md` | Single `.md` file |
| **Invocation** | User types `/command` | Claude auto-detects | Claude auto-detects |
| **Best for** | Quick, precise tasks | Content analysis | Complex verification/audit |
| **Runs as** | Main conversation | Main conversation | Background task |

---

## 8. Creating New Commands

### Example: Creating /podcast Command

Let's create a new command specifically for podcast transcripts.

**Step 1: Plan the Command**

What should `/podcast` do?
- Read a podcast transcript file
- Analyze using a podcast-specific prompt
- Save to `reports/podcasts/`
- Log the activity

**Step 2: Create the Command File**

Create `.claude/commands/podcast.md`:

```markdown
---
description: Analyze a podcast transcript and extract key insights
---

# Analyze Podcast Transcript

Analyze the podcast transcript at: $ARGUMENTS

## Steps

1. **Read the transcript file** at the path provided
2. If file not found:
   - Inform user: "File not found at [path]"
   - Suggest checking the path
   - Stop here
3. **Read the analysis prompt** from `prompts/podcast.md`
4. **Extract the episode title** from the transcript
5. **Generate analysis** following the prompt structure exactly
6. **Save the report** to `reports/podcasts/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title is the title in lowercase, spaces replaced with hyphens
7. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist
   - Add entry under "## Podcasts Listened" section
   - Format: `- [Title](../reports/podcasts/filename.md) - HH:MM`
8. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Episode Title]

**Source**: [File path]
**Date**: YYYY-MM-DD
**Type**: Podcast

---

[Analysis content following prompts/podcast.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If file is empty: Inform user and ask if they want to proceed
- If prompt file missing: Use prompts/default.md or basic structure
```

**Step 3: Create the Prompt File**

Create `prompts/podcast.md`:
```markdown
# Podcast Episode Analysis Prompt

Analyze this podcast transcript.

Provide:

## 1. Episode Overview
What's this episode about? Who are the hosts and guests?

## 2. Main Topics Discussed
List all major topics covered with brief descriptions.

## 3. Key Insights
What are the most valuable insights from this conversation?

## 4. Notable Quotes
Include 3-5 memorable quotes with speaker attribution.

## 5. Recommendations Mentioned
Any books, tools, people, or resources mentioned.

## 6. My Action Items
What should I do or explore based on this episode?

---
Format as a clean markdown report.
```

**Step 4: Create the Reports Folder**

Create folder: `reports/podcasts/`

**Step 5: Restart Claude Code and Test**

1. Save a podcast transcript to `inbox/test-podcast.txt`
2. **Restart Claude Code** (important - to load the new command)
   - Exit: `/exit` or close terminal
   - Start again: `claude`
3. Test: `/podcast inbox/test-podcast.txt`
4. Check `reports/podcasts/` for the output

### Command Creation Checklist

- [ ] Decide what the command should do
- [ ] Create command file in `.claude/commands/` with `$ARGUMENTS`
- [ ] Create prompt file in `prompts/` (for analysis style)
- [ ] Create output folder in `reports/` (if new category)
- [ ] Restart Claude Code to load the new command
- [ ] Test the command
- [ ] Update documentation

---

## 9. Creating New Skills

### Example: Creating `podcast-analysis` Skill

Let's create a skill that corresponds to the `/podcast` command.

**Step 1: Plan the Skill**

What should the `podcast-analysis` skill do?
- Trigger on "podcast", "episode", "audio transcript"
- Same workflow as `/podcast` command
- Same prompt and output location

**Step 2: Create the Skill Folder**

Create folder: `.claude/skills/podcast-analysis/`

**Step 3: Create the SKILL.md File**

Create `.claude/skills/podcast-analysis/SKILL.md`:

```markdown
---
name: podcast-analysis
description: Analyze podcast episode transcripts to extract insights, discussion
topics, and actionable takeaways. Use when the user mentions podcast, episode,
audio transcript, interview, or wants to analyze podcast content.
---

# Podcast Episode Analysis

Analyze podcast transcripts and create structured reports.

## When to Use

Activate this skill when the user:
- Mentions "podcast", "episode", "interview"
- Wants to analyze an audio transcript
- Asks about a podcast they listened to

## Instructions

1. **Get the file path** - Ask the user for the file path if not provided
2. **Read the transcript file** at the path provided
3. If file not found:
   - Inform user: "File not found at [path]"
   - Suggest checking the path
   - Stop here
4. **Read the analysis prompt** from `prompts/podcast.md`
5. **Extract the episode title** from the transcript
6. **Generate analysis** following the prompt structure exactly
7. **Save the report** to `reports/podcasts/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title is the title in lowercase, spaces replaced with hyphens
8. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist
   - Add entry under "## Podcasts Listened" section
   - Format: `- [Title](../reports/podcasts/filename.md) - HH:MM`
9. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Episode Title]

**Source**: [File path]
**Date**: YYYY-MM-DD
**Type**: Podcast

---

[Analysis content following prompts/podcast.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If file is empty: Inform user and ask if they want to proceed
- If prompt file missing: Use prompts/default.md or basic structure

## Related

- Slash command equivalent: `/podcast`
- Prompt file: `prompts/podcast.md`
- Output location: `reports/podcasts/`
```

**Step 4: Create Supporting Files (if needed)**

If you haven't already created the `/podcast` command:
- Create `prompts/podcast.md` (the analysis prompt)
- Create `reports/podcasts/` folder

**Step 5: Restart Claude Code and Test**

1. **Restart Claude Code** (required to load new skill)
   - Exit: `/exit`
   - Start: `claude`
2. Test with natural language: "Analyze this podcast transcript at inbox/test-podcast.txt"
3. Verify:
   - Report created in `reports/podcasts/`
   - Log entry added

### Skill Creation Checklist

- [ ] Decide what triggers the skill (keywords, patterns)
- [ ] Create skill folder in `.claude/skills/skill-name/`
- [ ] Create `SKILL.md` with YAML frontmatter:
  - `name` - lowercase, hyphens, max 64 chars
  - `description` - max 1024 chars, include trigger words!
- [ ] Write instructions (same workflow as corresponding command)
- [ ] Create prompt file in `prompts/` if new category
- [ ] Create output folder in `reports/` if needed
- [ ] Restart Claude Code to load the skill
- [ ] Test with natural language
- [ ] Update documentation

### Writing Good Skill Descriptions

The `description` field determines when Claude activates the skill. Follow these guidelines:

**Include trigger words:**
```yaml
description: Analyze YouTube video transcripts... Use when the user mentions
YouTube, video, transcript, video analysis, or wants to summarize a video.
```

**Be specific about file types:**
```yaml
description: ...or wants to analyze a .txt file containing a video transcript.
```

**Mention related concepts:**
```yaml
description: Analyze blog posts and web articles... Use when the user mentions
blog post, article, Substack, Medium, web page, newsletter, or provides a URL.
```

**Keep under 1024 characters but be comprehensive.**

---

## 10. Creating New Agents

### Example: Creating a Code Quality Agent

Let's create a new agent to verify code quality.

**Step 1: Plan the Agent**

What should the agent do?
- Scan code files for quality issues
- Check for common problems
- Generate a quality report

**Step 2: Create the Agent File**

Create `.claude/agents/code-quality-checker.md`:

```markdown
---
name: code-quality-checker
description: Check code quality across the codebase. Use when the user asks to verify code quality, check for issues, or audit code standards.
model: sonnet
---

# Code Quality Checker

You are a code quality specialist. Analyze the codebase for quality issues.

## Responsibilities

1. Scan code files for issues
2. Check for best practices
3. Generate a quality report

## Verification Checklist

- [ ] No unused imports
- [ ] Consistent naming conventions
- [ ] Functions not too long
- [ ] No hardcoded values

## Report Format

Provide findings in a structured report.
```

**Step 3: Restart Claude Code and Test**

1. **Restart Claude Code** (required to load new agent)
2. Test: "Check the code quality in this project"
3. Agent runs and generates report

### Agent Creation Checklist

- [ ] Decide what the agent should analyze
- [ ] Create agent file in `.claude/agents/`
- [ ] Add YAML frontmatter with `name`, `description`, `model`
- [ ] Write clear instructions and checklist
- [ ] Define report format
- [ ] Restart Claude Code to load the agent
- [ ] Test with trigger phrases
- [ ] Update documentation

---

## 11. Creating New Prompts

Prompts define **how** content is analyzed. They control what sections appear in reports, how detailed each section is, and what specific information to extract.

### Prompt Design Philosophy

The enhanced prompts are built on two core principles:

| Principle | What It Means | Why It Matters |
|-----------|---------------|----------------|
| **Maximum Breadth** | Extract ALL significant information | Don't miss valuable insights |
| **Maximum Depth** | Capture specifics (numbers, names, quotes) | Summaries alone aren't actionable |

Each prompt includes **12-14 sections** to ensure comprehensive information extraction.

### The Enhanced Prompt Structure

Every prompt should include these core section types:

```markdown
# [Content Type] Analysis Prompt

Analyze this [content type] thoroughly. Extract maximum value.

## 1. Overview/Metadata
- Context about the source (title, author, type)
- Core thesis or main message

## 2. Comprehensive Summary
3-4 paragraph thorough summary covering:
- Problem or context being addressed
- Main arguments or solutions
- Key evidence and examples
- Conclusions and implications

## 3. All Key Points
Extract EVERY significant point, not just top 5-7.
Be exhaustive and specific with names, numbers, details.

## 4. Facts, Statistics & Data
Extract all specific information:
- Numbers, percentages, dates
- Research findings cited
- Metrics and benchmarks

## 5. Frameworks, Models & Concepts
Capture mental models introduced:
- Named frameworks (e.g., "80/20 rule")
- New terminology defined
- Categorizations or taxonomies

## 6. Examples & Case Studies
Document specific examples:
- Real-world case studies
- Hypothetical scenarios
- Success/failure stories

## 7. Resources & References
List everything mentioned:
- Tools, software, products
- Books, papers, articles
- People and organizations

## 8. Notable Quotes
Include 5-10 memorable quotes.
Prioritize quotes that capture key insights.

## 9. Actionable Insights
What can you DO with this information?
- Immediate actions (today/this week)
- Short-term projects (this month)
- Long-term strategies

## 10. Questions & Gaps
- What questions does this raise?
- What wasn't addressed?
- Potential counterarguments?

## 11. Latent Signals
Surface insights that are implied but not explicitly stated.
Only include genuine inferences - do NOT fabricate signals.
- **Unstated assumptions**: What does the creator take for granted?
- **Implied predictions**: What future trends are suggested?
- **Hidden motivations**: Why is this being shared now?
- **Second-order effects**: What downstream consequences follow?
- **Market/industry signals**: What does this suggest about direction?
- **Contrarian indicators**: What's conspicuously NOT being said?

## 12. Connections
- Related topics to explore
- Prerequisite knowledge
- Follow-up content suggestions

---
Format the output as a clean markdown report.
```

### The Latent Signals Section

This is a key innovation in the enhanced prompts. It surfaces "below-the-surface" insights:

```markdown
## 11. Latent Signals
Surface insights that are implied but not explicitly stated.
Only include genuine inferences - do NOT fabricate signals.

- **Unstated assumptions**: What does the creator take for granted?
- **Implied predictions**: What future trends or outcomes are suggested?
- **Hidden motivations**: Why is this being created/shared now?
- **Second-order effects**: What downstream consequences follow?
- **Market/industry signals**: What does this suggest about where things are heading?
- **Contrarian indicators**: What's conspicuously NOT being said?
```

**Critical Instruction:** The prompt explicitly states "do NOT fabricate signals" to prevent hallucination. Only genuine inferences should be included.

### Content-Type Specific Sections

Add specialized sections based on content type:

**For Research Papers (`paper.md`):**
```markdown
## 5. Methodology Deep Dive
- **Data**: What data did they use? Size, source, characteristics
- **Methods**: What techniques did they apply?
- **Experiments**: What experiments did they run?
- **Baselines**: What did they compare against?
- **Evaluation Metrics**: How did they measure success?

## 6. Results & Findings
Extract ALL specific results:
- Performance numbers (accuracy, F1, etc.)
- Comparisons to baselines (X% improvement)
- Statistical significance
- Ablation study results

## 8. Technical Details
For readers wanting depth:
- Key equations or algorithms
- Architecture details
- Hyperparameters
- Computational requirements
```

**For Articles (`article.md`):**
```markdown
## 8. Author's Perspective & Bias
- Author's background and credentials
- Potential biases or conflicts
- Unstated assumptions
- What the author might be wrong about

## 11. Critical Analysis
- Strengths of the argument
- Weaknesses or gaps
- Counterarguments to consider
- What's missing from the analysis
```

### Writing Effective Section Instructions

**Be Specific About Quantity:**
```markdown
# ❌ Vague
## Notable Quotes
Include some quotes.

# ✅ Specific
## Notable Quotes
Include 5-10 memorable quotes with approximate timestamps if visible.
Prioritize quotes that:
- Capture key insights
- Are memorable/quotable
- Represent controversial or unique views
```

**Provide Structure:**
```markdown
# ❌ Unstructured
## Methodology
Explain the methodology.

# ✅ Structured
## Methodology Deep Dive
- **Data**: What data did they use? Size, source, characteristics
- **Methods**: What techniques did they apply?
- **Experiments**: What experiments did they run?
- **Baselines**: What did they compare against?
- **Evaluation Metrics**: How did they measure success?
```

**Request Exhaustive Extraction:**
```markdown
# ❌ Limited
## Key Points
List the 5-7 main points.

# ✅ Exhaustive
## Key Takeaways (All Important Points)
List ALL significant points, not just top 5-7. Be exhaustive:
- Main arguments and claims
- Supporting points and sub-arguments
- Conclusions and recommendations
For each, be specific - include numbers, names, specifics mentioned.
```

**Tier Actionable Insights:**
```markdown
# ❌ Generic
## Action Items
What should I do?

# ✅ Tiered
## Actionable Insights
What can you DO with this information?
- Immediate actions (today/this week)
- Short-term projects (this month)
- Long-term strategies
- Things to research further
```

### Prompt File Location

Prompts are stored in the `prompts/` folder:

| File | Content Type | Sections |
|------|--------------|----------|
| `prompts/yt.md` | YouTube videos | 12 |
| `prompts/article.md` | Blog posts, articles | 13 |
| `prompts/paper.md` | Research papers | 14 |
| `prompts/default.md` | Generic content | 12 |

### Creating a New Prompt

**Step 1: Decide the content type and what sections are needed**

Consider:
- What information is unique to this content type?
- What would be most valuable to extract?
- What sections from the standard template apply?

**Step 2: Create the prompt file**

Create `prompts/your-type.md`:

```markdown
# [Type] Analysis Prompt

Analyze this [content type] thoroughly. Extract maximum value.

## 1. Overview
[Customize for your content type]

## 2. Comprehensive Summary
[Standard 3-4 paragraph format]

## 3-10. [Core sections]
[Include standard sections with customizations]

## 11. Latent Signals
[Include the latent signals section]

## 12. Connections
[Standard connections section]

## 13+. [Type-specific sections]
[Add any additional sections unique to this content type]

---
Format the output as a clean markdown report.
```

**Step 3: Reference in commands and skills**

Update your command/skill to use the new prompt:
```markdown
3. **Read the analysis prompt** from `prompts/your-type.md`
```

**Step 4: Test thoroughly**

1. Run an analysis with sample content
2. Check that all sections are populated
3. Verify specifics are being captured
4. Adjust section instructions as needed

### Example: Creating a Podcast Prompt

```markdown
# Podcast Episode Analysis Prompt

Analyze this podcast transcript thoroughly. Extract maximum value.

## 1. Episode Overview
- **Show & Episode**: What podcast and episode is this?
- **Host(s)**: Who hosts this show?
- **Guest(s)**: Who was interviewed? What's their background?
- **Episode Type**: Interview, solo, panel, narrative?
- **Core Topic**: What is this episode primarily about?

## 2. Comprehensive Summary
3-4 paragraphs covering:
- The main topic and why it matters
- Key discussion points and arguments
- Notable stories or examples shared
- Conclusions and takeaways

## 3. All Discussion Points
List EVERY significant topic discussed:
- Main topics with sub-points
- Tangential discussions worth noting
- Questions asked and answers given
Be specific with names, numbers, examples.

## 4. Facts, Statistics & Data
Extract all specific information mentioned:
- Numbers, dates, statistics
- Research or studies cited
- Company metrics or data points

## 5. Frameworks & Mental Models
Capture conceptual tools discussed:
- Named frameworks or methodologies
- Mental models for decision-making
- Categorizations or typologies

## 6. Stories & Anecdotes
Document personal stories shared:
- Host's experiences
- Guest's journey and lessons
- Third-party examples mentioned

## 7. People, Companies & Resources
Everything mentioned:
- People (who they are, why relevant)
- Companies and organizations
- Books, articles, tools recommended

## 8. Notable Quotes
Include 5-10 memorable quotes with speaker attribution:
- Capture key insights
- Memorable one-liners
- Controversial or unique perspectives

## 9. Actionable Insights
What can you DO with this information?
- Immediate actions
- Ideas to explore
- Habits or practices to adopt

## 10. Questions Raised
- What follow-up questions would you ask?
- What wasn't covered that should be?
- What claims need verification?

## 11. Latent Signals
Surface insights that are implied but not explicitly stated.
Only include genuine inferences - do NOT fabricate signals.
- **Industry trends**: What does this suggest about the space?
- **Career signals**: What does this imply for career development?
- **Hidden agendas**: Is the guest promoting something subtly?
- **Relationship dynamics**: What can be inferred from how host/guest interact?

## 12. Connections
- Related episodes or podcasts
- Topics to research further
- Books or resources to follow up on

---
Format the output as a clean markdown report.
```

### Prompt Testing Workflow

1. **Create or modify** the prompt file
2. **Save the file** (changes take effect immediately - no restart needed)
3. **Run an analysis** using the prompt
4. **Review the output** for:
   - Are all sections populated?
   - Are specifics being captured (not just summaries)?
   - Is the latent signals section providing genuine insights?
   - Is the format clean and readable?
5. **Iterate** - adjust section instructions and test again

### Backup and Restore

Original prompts are backed up in `.ignore/prompts_original/`:
- `yt.md` (original before enhancement)
- `article.md`
- `paper.md`
- `default.md`

To restore a prompt to default, copy from `.ignore/prompts_original/` to `prompts/`.

---

## 12. Commands vs Skills vs Agents vs Prompts

Understanding the differences is crucial for customization:

### Comparison Table

| Aspect | Commands | Skills | Agents | Prompts |
|--------|----------|--------|--------|---------|
| **Location** | `.claude/commands/` | `.claude/skills/*/` | `.claude/agents/` | `prompts/` |
| **Purpose** | Define explicit workflows | Define automatic workflows | Complex verification tasks | Define analysis style |
| **Contains** | Workflow steps | Workflow steps | Specialized instructions | Analysis sections |
| **Invoked by** | User types `/command` | Claude auto-detects | Claude auto-detects | Commands & Skills |
| **Arguments** | Uses `$ARGUMENTS` | Extracts from context | Extracts from context | N/A |
| **Requires restart** | Yes | Yes | Yes | No |

### When to Create/Modify Commands

Create or modify a **command** when you want to:
- Add explicit `/command` syntax
- Use `$ARGUMENTS` placeholder
- Provide quick, scriptable workflows
- Change where reports are saved
- Change filename format
- Add/remove workflow steps

### When to Create/Modify Skills

Create or modify a **skill** when you want to:
- Enable natural language triggering
- Add conversational workflow access
- Support users who prefer not to memorize commands
- Change trigger words/patterns
- Update auto-detection logic

### When to Modify Prompts

Modify a **prompt** when you want to:
- Add new sections to reports
- Change section titles
- Adjust detail level
- Change analysis focus
- Customize formatting

### Example: Adding a Rating Section

**Want to add a "Rating" section to video reports?**

→ Modify `prompts/yt.md` (affects both `/yt` command AND `youtube-analysis` skill)

**Want to also save ratings to a separate file?**

→ Modify both `.claude/commands/yt.md` AND `.claude/skills/youtube-analysis/SKILL.md`

### Creating Paired Command + Skill

When adding a new feature, create **both** a command and a skill:

1. Command: `.claude/commands/podcast.md` → enables `/podcast`
2. Skill: `.claude/skills/podcast-analysis/SKILL.md` → enables "analyze this podcast"
3. Both use the same prompt: `prompts/podcast.md`
4. Both save to the same location: `reports/podcasts/`

This gives users both explicit and natural language access to the same workflow.

---

## 13. Modifying Existing Commands

### Changing Command Behavior

To modify how a command works, edit its command file in `.claude/commands/`.

**Example: Add Summary Display to /yt**

Open `.claude/commands/yt.md` and modify step 8:

Before:
```markdown
8. **Confirm to user** what was saved and where
```

After:
```markdown
8. **Display a 2-sentence summary** of the video content
9. **Confirm to user** what was saved and where
```

### Changing Output Location

Edit the command file's save step:

Before:
```markdown
6. **Save the report** to `reports/youtube/YYYY-MM-DD_sanitized-title.md`
```

After:
```markdown
6. **Save the report** to `reports/videos/YYYY-MM-DD_sanitized-title.md`
```

### Changing Filename Format

Before:
```markdown
6. **Save the report** to `reports/youtube/YYYY-MM-DD_sanitized-title.md`
```

After:
```markdown
6. **Save the report** to `reports/youtube/sanitized-title_YYYY-MM-DD.md`
```

### Adding User Confirmations

Create a command that asks before acting:

```markdown
# Delete Report

Delete the report file at: $ARGUMENTS

## Steps

1. Check if the file at $ARGUMENTS exists
2. If file doesn't exist, inform user and stop
3. **ASK USER FOR CONFIRMATION** before deleting
4. If confirmed, delete the file
5. If not confirmed, inform user "Deletion cancelled"
```

### Remember to Restart

After modifying any command file, **restart Claude Code** to load the changes:
1. Exit: `/exit` or close terminal
2. Start again: `claude`

---

## 14. Modifying Existing Skills

### Changing Skill Behavior

To modify how a skill works, edit its `SKILL.md` file in `.claude/skills/skill-name/`.

**Example: Add More Trigger Words to youtube-analysis**

Open `.claude/skills/youtube-analysis/SKILL.md` and modify the description:

Before:
```yaml
description: Analyze YouTube video transcripts to extract summaries, key takeaways,
and insights. Use when the user mentions YouTube, video transcript, video analysis,
or wants to analyze a .txt file containing a video transcript.
```

After:
```yaml
description: Analyze YouTube video transcripts to extract summaries, key takeaways,
and insights. Use when the user mentions YouTube, video transcript, video analysis,
tutorial, lecture, presentation, TED talk, educational video, or wants to analyze
a .txt file containing a video transcript.
```

### Changing Skill Workflow

Modify the Instructions section to change what the skill does:

Before:
```markdown
## Instructions

1. **Read the transcript file** at the path provided
...
8. **Confirm to user** what was saved and where
```

After:
```markdown
## Instructions

1. **Read the transcript file** at the path provided
...
8. **Display a 2-sentence summary** of the video content
9. **Confirm to user** what was saved and where
```

### Updating Trigger Patterns

The "When to Use" section helps Claude understand context:

```markdown
## When to Use

Activate this skill when the user:
- Mentions "YouTube", "video", "transcript"
- Wants to analyze a video transcript file
- Asks for video summary or key points
- Mentions "TED talk", "tutorial", "lecture"  # NEW!
- References educational content               # NEW!
```

### Remember to Restart

After modifying any skill file, **restart Claude Code** to load the changes:
1. Exit: `/exit` or close terminal
2. Start again: `claude`

### Keeping Commands and Skills in Sync

When you modify a workflow in a command, make the same change to its corresponding skill:

| Command | Skill |
|---------|-------|
| `.claude/commands/yt.md` | `.claude/skills/youtube-analysis/SKILL.md` |
| `.claude/commands/read.md` | `.claude/skills/article-analysis/SKILL.md` |
| `.claude/commands/arxiv.md` | `.claude/skills/arxiv-analysis/SKILL.md` |
| `.claude/commands/analyze.md` | `.claude/skills/content-analysis/SKILL.md` |
| `.claude/commands/batch.md` | `.claude/skills/batch-processing/SKILL.md` |
| `.claude/commands/log.md` | `.claude/skills/activity-log/SKILL.md` |

---

## 15. Working with File Operations

### Reading Files

Claude can read any text file. In CLAUDE.md:
```markdown
1. Read the file at [filepath]
```

Claude will read and understand the file contents.

### Writing Files

Claude can create and write files:
```markdown
4. Save report to reports/youtube/YYYY-MM-DD_title.md
```

Claude will:
- Create the file if it doesn't exist
- Overwrite if it does exist
- Create folders if needed

### File Naming

**Date-based naming:**
```markdown
YYYY-MM-DD_title.md
```
Example: `2024-12-22_how-to-learn-python.md`

**Sanitizing titles:**
Claude automatically:
- Removes special characters
- Replaces spaces with hyphens
- Converts to lowercase

### Working with Folders

**Creating folders:**
Claude creates folders automatically when saving files.

**Listing files:**
```markdown
1. List all files in reports/youtube/
```

**Checking if file exists:**
```markdown
1. Check if inbox/file.txt exists
```

---

## 16. Working with External Tools

### Integrating Command-Line Tools

Claude can execute command-line tools to extend functionality. The `/yt` command demonstrates this with yt-dlp.

**Pattern for external tool integration:**

```markdown
## Step: Run External Tool

1. Check if the tool is installed
2. Run the tool with appropriate arguments
3. Check for success/failure
4. Handle errors gracefully

**Example with yt-dlp:**
```bash
yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --convert-subs srt -o "inbox/%(title)s" "<URL>"
```

**Error Handling:**
- If tool not found: Tell user how to install it
- If tool fails: Explain the error and suggest alternatives
```

### yt-dlp Integration Details

The `/yt` command uses yt-dlp for YouTube URL support:

**yt-dlp flags explained:**
- `--write-auto-sub`: Download auto-generated captions
- `--write-sub`: Download manual captions
- `--sub-lang en`: Prioritize English subtitles
- `--skip-download`: Don't download the video itself
- `--convert-subs srt`: Convert to SRT format
- `-o "inbox/%(title)s"`: Save to inbox/ with video title

**Output file:** `inbox/<video-title>.en.srt`

**Error scenarios:**
| Error | Message to User |
|-------|-----------------|
| yt-dlp not installed | "yt-dlp not found. Install with: pip install yt-dlp" |
| No captions available | "No English captions found for this video" |
| Network error | "Failed to fetch transcript. Check URL and connection." |

### Adding New Tool Integrations

To integrate another command-line tool:

1. **Document the dependency** in CLAUDE.md and README.md
2. **Add installation check** in the command workflow
3. **Handle errors gracefully** with helpful messages
4. **Test thoroughly** with various scenarios

---

## 17. Working with Web Content

### Using WebFetch

Claude has a built-in `WebFetch` tool that:
- Fetches webpage content
- Converts HTML to readable text
- Handles most websites

In CLAUDE.md:
```markdown
### /read <url>
1. Fetch content from the URL using WebFetch
2. Read prompts/article.md
...
```

### WebFetch Limitations

**Works well with:**
- Static content sites
- Blog posts
- News articles
- Substack newsletters
- Public documentation

**May not work with:**
- Sites requiring login
- JavaScript-heavy sites
- Sites that block bots
- Paywalled content

### Fallback for Blocked Sites

Add fallback instructions to CLAUDE.md:
```markdown
### /read <url>
1. Try to fetch content from the URL using WebFetch
2. If fetch fails, inform user to manually copy content to inbox/
3. If fetch succeeds, continue with analysis
...
```

---

## 18. Logging System

### How Logging Works

Every command that processes content adds a log entry.

**Log file structure:**
```markdown
# Activity Log: YYYY-MM-DD

## Videos Watched
- [Title](../reports/youtube/file.md) - HH:MM

## Articles Read
- [Title](../reports/articles/file.md) - HH:MM

## Papers Reviewed
- [Title](../reports/papers/file.md) - HH:MM
```

### Adding New Log Categories

To log a new type of content:

1. **Update command in CLAUDE.md:**
```markdown
5. Log to logs/YYYY-MM-DD.md under "## Podcasts Listened"
```

2. **The log entry format:**
```markdown
## Podcasts Listened
- [Episode Title](../reports/podcasts/file.md) - HH:MM
```

### Customizing Log Format

Change the logging instruction in CLAUDE.md:

**Basic:**
```markdown
5. Log to logs/YYYY-MM-DD.md
```

**With specific format:**
```markdown
5. Log to logs/YYYY-MM-DD.md with format:
   "- [Title](../reports/youtube/filename.md) - TIME - DURATION"
```

### Viewing Logs Programmatically

The `/log` command reads today's log:
```markdown
### /log
Show today's consumption log:
1. Read logs/YYYY-MM-DD.md (today's date)
2. Display contents to user
```

---

## 19. Testing Changes

### Testing Workflow

1. **Make a change** to command file (`.claude/commands/`) or prompt file
2. **Save the file**
3. **Restart Claude Code** (REQUIRED for command changes, optional for prompts)
   - Type `/exit` or close terminal
   - Start again with `claude`
4. **Run the command** you modified
5. **Check the output**
6. **Verify files were created** in the right places
7. **Check the log** was updated

**Important:** Command changes ALWAYS require restarting Claude Code. Prompt changes take effect immediately.

### Creating Test Files

Create test content in `inbox/`:
```
inbox/test-video.txt
inbox/test-article.txt
inbox/test-batch.txt
```

Use these for testing instead of real content.

### Rollback Changes

If something breaks:
1. Undo your changes in the file
2. Or restore from a backup
3. Restart Claude Code

### Keeping Backups

Before making changes:
```
cp CLAUDE.md CLAUDE.md.backup
cp prompts/yt.md prompts/yt.md.backup
```

---

## 20. Common Modifications

### Adding Email Processing

**New prompt file: `prompts/email.md`**
```markdown
# Email Analysis Prompt

Analyze this email thread.

Provide:

## 1. Summary
What is this email chain about?

## 2. Key Points
Main topics discussed.

## 3. Action Items
What needs to be done and by whom?

## 4. Decisions Made
Any decisions reached in this thread.

## 5. Follow-up Needed
Open questions or pending items.
```

**Add to CLAUDE.md:**
```markdown
### /email <filepath>
Analyze an email thread:
1. Read the email file (e.g., inbox/email.txt)
2. Read prompts/email.md for analysis instructions
3. Generate analysis following the prompt
4. Save report to reports/other/YYYY-MM-DD_email-title.md
5. Log to logs/YYYY-MM-DD.md under "## Emails Analyzed"
```

### Adding Meeting Notes

**Prompt: `prompts/meeting.md`**
```markdown
# Meeting Notes Analysis

Analyze these meeting notes.

Provide:

## 1. Meeting Overview
Date, attendees, purpose.

## 2. Decisions Made
Key decisions reached.

## 3. Action Items
Who, what, when.

## 4. Open Issues
Unresolved topics.

## 5. Next Steps
What happens next.
```

### Adding Book Chapter Analysis

**Prompt: `prompts/book.md`**
```markdown
# Book Chapter Analysis

Analyze this book chapter.

Provide:

## 1. Chapter Summary
Main argument and key points.

## 2. Important Concepts
New terms or ideas introduced.

## 3. Key Quotes
3-5 memorable passages.

## 4. How This Connects
To previous chapters or other books.

## 5. Personal Reflections
Space for my own thoughts.
```

### Adding Twitter/X Thread Analysis

**Prompt: `prompts/thread.md`**
```markdown
# Twitter Thread Analysis

Analyze this thread.

Provide:

## 1. Thread Summary
What's the main point?

## 2. Key Arguments
Main claims made.

## 3. Evidence Provided
Data, links, or sources cited.

## 4. Notable Responses
If replies are included.

## 5. Why This Matters
Significance of this thread.
```

---

## 21. Troubleshooting Development Issues

### Command Not Working / Unknown Slash Command

**Symptoms:** "Unknown slash command" error or command is ignored

**Check:**
1. Command file exists in `.claude/commands/` folder
2. Filename is correct (e.g., `yt.md` for `/yt`)
3. File has `.md` extension
4. File has YAML frontmatter with `description:` field
5. `$ARGUMENTS` placeholder is present if arguments are needed
6. Claude Code was restarted after creating the command

### Skill Not Being Detected

**Symptoms:** Claude doesn't automatically use the skill when expected

**Check:**
1. Skill folder exists in `.claude/skills/skill-name/`
2. `SKILL.md` file exists inside the folder
3. YAML frontmatter has both `name` and `description` fields
4. `description` includes trigger words that match user's language
5. `name` is lowercase with hyphens only, max 64 chars
6. `description` is under 1024 characters
7. Claude Code was restarted after creating/modifying the skill

**Fix trigger issues:**
- Add more trigger words to the `description` field
- Include synonyms and related terms
- Test with different phrasings

### Prompt Not Being Used

**Symptoms:** Analysis doesn't follow prompt

**Check:**
1. Prompt file exists at correct path
2. Prompt file is referenced correctly in command
3. Prompt file has valid markdown

### Files Not Being Saved

**Symptoms:** No report file created

**Check:**
1. Target folder exists
2. File path is correct in CLAUDE.md
3. Filename format is valid

### Log Not Updated

**Symptoms:** Activity not appearing in log

**Check:**
1. Logging step is in the command
2. Log format is correct
3. Date format is correct (YYYY-MM-DD)

### Changes Not Taking Effect

**Symptoms:** Old behavior persists

**Try:**
1. Save all files
2. Exit Claude Code completely
3. Restart Claude Code
4. Test again

---

## 22. Best Practices

### Command File Best Practices

1. **Keep commands focused** - One clear purpose per command
2. **Use numbered steps** - Easier for Claude to follow
3. **Include `$ARGUMENTS`** - Even if just for reference
4. **Be explicit** - Don't assume Claude knows what you want
5. **Reference files by full path** - `prompts/yt.md` not just `yt.md`
6. **Include error handling** - "If X fails, do Y"
7. **Add report format** - Show expected output structure

### Prompt Best Practices

1. **Start with clear instruction** - "Analyze this video transcript"
2. **Number your sections** - Makes structure clear
3. **Provide detail** - "2-3 paragraphs" vs "write summary"
4. **End with formatting note** - "Format as clean markdown"

### File Organization

1. **Keep inbox clean** - Delete processed files
2. **Use subfolders** - Organize by topic or project
3. **Consistent naming** - Same format for similar files
4. **Regular backups** - Copy important reports periodically

### Testing

1. **Test one change at a time** - Easier to debug
2. **Keep test files** - Reuse for testing
3. **Check all outputs** - Report, log, console
4. **Document what works** - Note successful patterns

---

## 23. Example: Building a New Feature

Let's walk through adding a complete new feature: Newsletter digest.

### Goal

Create a `/newsletter` command that:
1. Takes a newsletter file
2. Analyzes it with a newsletter-specific prompt
3. Saves to `reports/newsletters/`
4. Logs under "Newsletters Read"

### Step 1: Create the Command File

Create `.claude/commands/newsletter.md`:

```markdown
---
description: Analyze a newsletter issue and extract key stories and insights
---

# Analyze Newsletter

Analyze the newsletter at: $ARGUMENTS

## Steps

1. **Read the newsletter file** at the path provided
2. If file not found:
   - Inform user: "File not found at [path]"
   - Suggest checking the path
   - Stop here
3. **Read the analysis prompt** from `prompts/newsletter.md`
4. **Extract the newsletter title** from the content
5. **Generate analysis** following the prompt structure exactly
6. **Save the report** to `reports/newsletters/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title is the title in lowercase, spaces replaced with hyphens
7. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist
   - Add entry under "## Newsletters Read" section
   - Format: `- [Title](../reports/newsletters/filename.md) - HH:MM`
8. **Confirm to user** what was saved and where

## Report Format

Include this header:
```markdown
# [Newsletter Title]

**Source**: [File path]
**Date**: YYYY-MM-DD
**Type**: Newsletter

---

[Analysis content following prompts/newsletter.md structure]

---

## My Notes

[Empty space for user notes]
```
```

### Step 2: Create the Prompt

Create `prompts/newsletter.md`:

```markdown
# Newsletter Analysis Prompt

Analyze this newsletter issue.

Provide:

## 1. Issue Summary
What's covered in this issue?

## 2. Main Stories
Top 3-5 stories or sections.

## 3. Links Worth Clicking
Most valuable links from the newsletter.

## 4. Key Insights
What's the takeaway?

## 5. Action Items
Anything I should do based on this?

---
Format as a clean markdown report.
```

### Step 3: Create the Folder

Create folder: `reports/newsletters/`

### Step 4: Restart Claude Code and Test

1. Save a newsletter to `inbox/test-newsletter.txt`
2. **Restart Claude Code** (required to load new command)
   - Exit: `/exit`
   - Start: `claude`
3. Run: `/newsletter inbox/test-newsletter.txt`
4. Check:
   - Report in `reports/newsletters/`
   - Log entry in `logs/YYYY-MM-DD.md`

### Step 5: Document

Add to USER_GUIDE.md:

```markdown
### /newsletter <filepath>

**Purpose:** Analyze a newsletter issue

**Usage:**
\`\`\`
/newsletter inbox/morning-brew.txt
\`\`\`
...
```

### Step 6: Update Batch Support (Optional)

If you want `/batch` to support the new command, update `.claude/commands/batch.md` to include `newsletter` in the supported commands list.

---

## 24. Future Enhancement Ideas

### Easy Enhancements

1. **New content types**
   - Podcast transcripts
   - Meeting notes
   - Book chapters
   - Course materials

2. **New prompt sections**
   - Difficulty rating
   - Time to read/watch
   - Prerequisites needed

3. **Better logging**
   - Weekly summaries
   - Monthly reports
   - Topic tracking

### Medium Complexity

1. **Tags and categories**
   - Add tags to reports
   - Search by tag
   - Filter logs by tag

2. **Templates**
   - Different templates for different needs
   - Quick template for short content
   - Deep template for detailed analysis

3. **Comparisons**
   - Compare two articles
   - Track changing opinions
   - Connect related content

### Advanced Enhancements

1. **Search functionality**
   - Search across all reports
   - Find content by keyword
   - Related content suggestions

2. **Integration ideas**
   - RSS feed processing
   - Email newsletter import
   - Readwise/Pocket integration

3. **Automation**
   - Scheduled batch processing
   - Automatic filing
   - Summary generation

---

## Appendix: Reference Files

### Current Command Files

See the actual command files in `.claude/commands/` folder:
- `yt.md` - YouTube transcript analysis
- `read.md` - Web article analysis
- `arxiv.md` - arXiv paper analysis
- `analyze.md` - Generic content analysis
- `batch.md` - Batch processing
- `log.md` - Activity log display

### Current Skill Files

See the skill folders in `.claude/skills/` directory:
- `youtube-analysis/SKILL.md` - Triggered by "YouTube", "video transcript"
- `article-analysis/SKILL.md` - Triggered by "blog", "article", "Substack"
- `arxiv-analysis/SKILL.md` - Triggered by "arXiv", "research paper"
- `content-analysis/SKILL.md` - Triggered by "notes", "document"
- `batch-processing/SKILL.md` - Triggered by "batch", "multiple items"
- `activity-log/SKILL.md` - Triggered by "today", "activity log"

### Current Agent Files

See the agent files in `.claude/agents/` directory:
- `markdown-format-verifier.md` - Triggered by "check markdown format", "validate .md files"

### Prompt Templates

See files in the `prompts/` folder for examples:
- `yt.md` - YouTube analysis style
- `article.md` - Article analysis style
- `paper.md` - Research paper analysis style
- `default.md` - Generic analysis style

### Complete File Structure

```
cerebro/
├── .claude/
│   ├── commands/              # SLASH COMMANDS (explicit)
│   │   ├── yt.md              # /yt command
│   │   ├── read.md            # /read command
│   │   ├── arxiv.md           # /arxiv command
│   │   ├── analyze.md         # /analyze command
│   │   ├── batch.md           # /batch command
│   │   └── log.md             # /log command
│   │
│   ├── skills/                # SKILLS (automatic, natural language)
│       ├── youtube-analysis/
│       │   └── SKILL.md
│       ├── article-analysis/
│       │   └── SKILL.md
│       ├── arxiv-analysis/
│       │   └── SKILL.md
│       ├── content-analysis/
│       │   └── SKILL.md
│       ├── batch-processing/
│       │   └── SKILL.md
│       └── activity-log/
│           └── SKILL.md
│   │
│   └── agents/                # AGENTS (specialized tasks)
│       └── markdown-format-verifier.md
├── CLAUDE.md                  # Project instructions
├── README.md                  # Project overview
├── inbox/                     # User input files
├── prompts/                   # Analysis style prompts
│   ├── yt.md
│   ├── article.md
│   ├── paper.md
│   └── default.md
├── reports/                   # Generated reports
│   ├── youtube/
│   ├── articles/
│   ├── papers/
│   └── other/
├── logs/                      # Activity logs
└── docs/                      # Documentation
    ├── QUICK_START.md
    ├── USER_GUIDE.md
    ├── DEVELOPER_GUIDE.md
    ├── transcript.txt
    └── gpt5_summary.txt
```

### Key Differences: Commands vs Skills vs Agents vs Prompts

| Commands | Skills | Agents | Prompts |
|----------|--------|--------|---------|
| `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` | `.claude/agents/*.md` | `prompts/*.md` |
| Single file | Folder with SKILL.md | Single file | Single file |
| Use `$ARGUMENTS` | Extract from context | Extract from context | No placeholders |
| **Require YAML frontmatter** | **Require YAML frontmatter** | **Require YAML frontmatter** | No frontmatter |
| Require restart | Require restart | Require restart | Immediate effect |
| User types `/command` | Claude auto-detects | Claude auto-detects | Used by all |

### Required Command Frontmatter

Every command file **must** start with:

```markdown
---
description: Brief description of what this command does
---
```

Without this frontmatter, Claude Code will show "Unknown slash command" error.

### Required Skill Frontmatter

Every skill file **must** start with:

```markdown
---
name: skill-name
description: Description with trigger words. Max 1024 characters.
---
```

**Important notes:**
- `name` - lowercase, hyphens only, max 64 characters
- `description` - max 1024 characters, include all trigger words!

Without proper frontmatter, the skill won't be detected.

### Command ↔ Skill Mapping

| Command | Skill | Trigger Words |
|---------|-------|---------------|
| `/yt` | `youtube-analysis` | YouTube, video, transcript |
| `/read` | `article-analysis` | blog, article, Substack, Medium |
| `/arxiv` | `arxiv-analysis` | arXiv, research paper, academic |
| `/analyze` | `content-analysis` | notes, document, meeting notes |
| `/batch` | `batch-processing` | batch, multiple, reading list |
| `/log` | `activity-log` | today, activity, what did I |

---

*Developer Guide - Last updated: 2025-12-23*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
