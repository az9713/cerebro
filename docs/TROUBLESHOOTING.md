# Troubleshooting Guide

This guide helps you solve common problems with Personal OS. Issues are organized by category with step-by-step solutions.

---

## Table of Contents

1. [Quick Fixes](#quick-fixes)
2. [Installation Issues](#installation-issues)
3. [Claude Code CLI Issues](#claude-code-cli-issues)
4. [YouTube Analysis Issues](#youtube-analysis-issues)
5. [Web Application Issues](#web-application-issues)
6. [API Key Issues](#api-key-issues)
7. [Audio Transcription Issues](#audio-transcription-issues)
8. [File and Report Issues](#file-and-report-issues)
9. [Database Issues](#database-issues)
10. [Performance Issues](#performance-issues)
11. [Export Issues](#export-issues)
12. [Getting Help](#getting-help)

---

## Quick Fixes

Before diving into specific issues, try these common fixes:

### Restart Claude Code

```bash
# Exit Claude Code
# Press Ctrl+C or type /exit

# Start fresh
claude
```

### Clear Cache and Restart

```bash
# Delete any cached data
rm -rf data/*.json

# Restart
claude
```

### Check Dependencies

```bash
# Verify Python
python --version  # Should be 3.10+

# Verify Node.js
node --version    # Should be 18+

# Verify yt-dlp
yt-dlp --version  # Should show version

# Verify Claude Code
claude --version
```

---

## Installation Issues

### "Python not found" or Wrong Version

**Symptoms:**
- `python: command not found`
- `python3: command not found`
- Version shows as 3.9 or lower

**Solution:**

**Windows:**
1. Download Python 3.10+ from [python.org](https://python.org/downloads)
2. During installation, check "Add Python to PATH"
3. Restart your terminal
4. Verify: `python --version`

**Mac:**
```bash
# Install via Homebrew
brew install python@3.11

# Add to PATH (add to ~/.zshrc)
export PATH="/opt/homebrew/opt/python@3.11/bin:$PATH"

# Restart terminal
source ~/.zshrc
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Use python3 instead of python
python3 --version
```

---

### "Node.js not found" or Wrong Version

**Symptoms:**
- `node: command not found`
- `npm: command not found`
- Version shows as 16 or lower

**Solution:**

**Windows:**
1. Download Node.js 18+ from [nodejs.org](https://nodejs.org)
2. Install with default options
3. Restart your terminal
4. Verify: `node --version`

**Mac:**
```bash
# Install via Homebrew
brew install node@20

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install 20
nvm use 20
```

**Linux:**
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### "pip install" Fails

**Symptoms:**
- `pip: command not found`
- Permission denied errors
- Package installation fails

**Solution:**

```bash
# Use pip3 instead of pip
pip3 install -r requirements.txt

# If permission issues, use --user
pip3 install --user -r requirements.txt

# Or create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

---

### "npm install" Fails

**Symptoms:**
- `EACCES: permission denied`
- `npm ERR! code ENOENT`
- Package lock conflicts

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If permission issues (Linux/Mac)
sudo chown -R $USER ~/.npm
npm install
```

---

## Claude Code CLI Issues

### "Unknown slash command"

**Symptoms:**
- `/yt` returns "Unknown slash command"
- Commands don't work after adding new ones

**Causes & Solutions:**

1. **Missing YAML frontmatter**

   Every command file must start with:
   ```markdown
   ---
   description: Brief description of command
   ---
   ```

2. **Need to restart Claude Code**

   After adding/editing commands, restart:
   ```bash
   # Exit (Ctrl+C or /exit)
   # Start again
   claude
   ```

3. **File in wrong location**

   Commands must be in `.claude/commands/`:
   ```
   .claude/commands/yt.md     ✓ Correct
   .claude/yt.md              ✗ Wrong
   commands/yt.md             ✗ Wrong
   ```

---

### Skill Not Triggering

**Symptoms:**
- Saying "analyze this YouTube video" doesn't trigger the skill
- Natural language doesn't invoke the expected skill

**Causes & Solutions:**

1. **Check trigger words in description**

   The skill description must contain trigger words:
   ```markdown
   ---
   name: youtube-analysis
   description: Analyze YouTube videos. Use when user mentions YouTube, video, transcript.
   ---
   ```

2. **Description too long**

   Max 1024 characters for description. Trim if needed.

3. **Restart required**

   After editing skills, restart Claude Code.

---

### $ARGUMENTS Not Working

**Symptoms:**
- `/yt https://youtube.com/watch?v=abc` doesn't pass the URL
- Command receives empty input

**Solution:**

Ensure your command file uses `$ARGUMENTS` placeholder:

```markdown
---
description: Analyze YouTube video
---

Analyze the YouTube video at: $ARGUMENTS

Follow these steps...
```

**Correct usage:**
- User types: `/yt https://youtube.com/watch?v=abc`
- `$ARGUMENTS` becomes: `https://youtube.com/watch?v=abc`

---

## YouTube Analysis Issues

### "yt-dlp not found"

**Symptoms:**
- Error message about yt-dlp not installed
- YouTube analysis fails immediately

**Solution:**

```bash
# Install yt-dlp
pip install yt-dlp

# Verify installation
yt-dlp --version

# If still not found, check PATH
which yt-dlp  # Mac/Linux
where yt-dlp  # Windows
```

---

### "No captions available"

**Symptoms:**
- Video exists but no transcript found
- Error about missing subtitles

**Causes:**
- Video has no auto-generated captions
- Captions are in a different language
- Video is too new (captions not generated yet)

**Solutions:**

1. **Try a different language:**
   ```bash
   yt-dlp --write-auto-sub --sub-lang en,es,de --list-subs "<URL>"
   ```

2. **Use audio transcription:**

   Add OpenAI API key for Whisper transcription:
   ```bash
   # Add to web/backend/.env
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Manual transcript:**
   - Copy transcript manually from YouTube
   - Paste into `inbox/video-name.txt`
   - Run `/analyze inbox/video-name.txt`

---

### "Video unavailable" or "Private video"

**Symptoms:**
- yt-dlp can't access the video
- Error about video being private/deleted

**Solutions:**

1. **Check if video is accessible in browser**
2. **For age-restricted videos**, try with cookies:
   ```bash
   yt-dlp --cookies-from-browser chrome "<URL>"
   ```
3. **For private videos**, you need access. No workaround.

---

### Slow YouTube Downloads

**Symptoms:**
- Transcript download takes very long
- Process seems stuck

**Solutions:**

1. **Check network connection**
2. **Try direct download first:**
   ```bash
   yt-dlp --write-auto-sub --skip-download -o test "<URL>"
   ```
3. **If still slow, update yt-dlp:**
   ```bash
   pip install -U yt-dlp
   ```

---

## Web Application Issues

### Backend Won't Start

**Symptoms:**
- `uvicorn main:app --reload` fails
- Import errors
- Port already in use

**Solutions:**

1. **Missing dependencies:**
   ```bash
   cd web/backend
   pip install -r requirements.txt
   ```

2. **Port 8000 in use:**
   ```bash
   # Find and kill the process
   lsof -i :8000        # Mac/Linux
   netstat -ano | findstr :8000  # Windows

   # Or use a different port
   uvicorn main:app --reload --port 8001
   ```

3. **Import errors:**
   - Check you're in the right directory: `web/backend`
   - Check Python version: `python --version`

---

### Frontend Won't Start

**Symptoms:**
- `npm run dev` fails
- Module not found errors
- Port 3000 in use

**Solutions:**

1. **Missing dependencies:**
   ```bash
   cd web/frontend
   rm -rf node_modules
   npm install
   ```

2. **Port 3000 in use:**
   ```bash
   # Use different port
   npm run dev -- -p 3001
   ```

3. **Build errors:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

---

### "CORS error" in Browser

**Symptoms:**
- API calls fail with CORS error
- "Access-Control-Allow-Origin" error

**Solutions:**

1. **Check CORS config in backend:**
   ```python
   # web/backend/main.py should have:
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Restart backend after changes**

3. **Check you're using correct ports:**
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

---

### Reports Not Showing in Web UI

**Symptoms:**
- Created reports via CLI but don't appear in web
- Search returns nothing

**Solutions:**

1. **Trigger re-index:**
   ```bash
   # Via API
   curl -X POST http://localhost:8000/api/sync
   ```

2. **Restart backend:**
   ```bash
   # Backend re-indexes on startup
   # Stop and restart uvicorn
   ```

3. **Check reports exist:**
   ```bash
   ls -la reports/youtube/
   ls -la reports/articles/
   ```

---

## API Key Issues

### "ANTHROPIC_API_KEY not configured"

**Symptoms:**
- Analysis fails with API key error
- Backend starts but analysis doesn't work

**Solution:**

1. **Create .env file:**
   ```bash
   cd web/backend
   echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env
   ```

2. **Check .env file exists and is correct:**
   ```bash
   cat .env
   # Should show: ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Restart backend after adding key**

---

### "Invalid API key" or "Authentication failed"

**Symptoms:**
- API key is set but calls fail
- 401 Unauthorized errors

**Solutions:**

1. **Verify key format:**
   - Anthropic keys start with: `sk-ant-api03-...`
   - Check for extra spaces or newlines

2. **Check key is active:**
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Verify key is not expired/revoked

3. **Test key directly:**
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_KEY" \
     -H "content-type: application/json" \
     -H "anthropic-version: 2023-06-01" \
     -d '{"model":"claude-3-haiku-20240307","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
   ```

---

### Rate Limit Errors

**Symptoms:**
- "Rate limit exceeded" error
- 429 Too Many Requests

**Solutions:**

1. **Wait and retry** - Rate limits reset after a minute
2. **Use a smaller model** - Haiku has higher limits than Opus
3. **Upgrade API tier** - Higher tiers have better limits
4. **Add delay between requests** in batch processing

---

## Audio Transcription Issues

### "OPENAI_API_KEY not configured"

**Symptoms:**
- Audio transcription fails
- Whisper integration not working

**Solution:**

```bash
cd web/backend
echo "OPENAI_API_KEY=sk-your-openai-key" >> .env
```

---

### Transcription Takes Too Long

**Symptoms:**
- Long audio files timeout
- Process seems stuck

**Solutions:**

1. **Use shorter audio:**
   - Split long podcasts into chapters
   - Max recommended: 30 minutes per file

2. **Use local Whisper (faster for long files):**
   ```bash
   pip install openai-whisper
   # System will auto-detect and use local model
   ```

3. **Check file size:**
   - Max 25MB for OpenAI API
   - Compress if needed: `ffmpeg -i input.mp3 -b:a 64k output.mp3`

---

### "Unsupported audio format"

**Symptoms:**
- Audio file not recognized
- Format error

**Solutions:**

1. **Supported formats:** MP3, M4A, WAV, FLAC, OGG, WEBM

2. **Convert to supported format:**
   ```bash
   ffmpeg -i input.aac -acodec mp3 output.mp3
   ```

3. **Check file isn't corrupted:**
   ```bash
   ffprobe audio-file.mp3
   ```

---

## File and Report Issues

### Report Not Saved

**Symptoms:**
- Analysis completes but no file appears
- File saved to wrong location

**Solutions:**

1. **Check report directories exist:**
   ```bash
   mkdir -p reports/youtube reports/articles reports/papers reports/other
   ```

2. **Check for error messages** in Claude Code output

3. **Check permissions:**
   ```bash
   ls -la reports/
   # Should be writable by current user
   ```

---

### "File not found" Error

**Symptoms:**
- `/analyze inbox/file.txt` fails
- Can't find uploaded file

**Solutions:**

1. **Use correct path:**
   ```bash
   # Relative to project root
   /analyze inbox/file.txt

   # Or absolute path
   /analyze /full/path/to/file.txt
   ```

2. **Check file exists:**
   ```bash
   ls -la inbox/
   cat inbox/file.txt  # Verify content
   ```

---

### Duplicate Reports

**Symptoms:**
- Same content analyzed multiple times
- Multiple reports for same URL

**Solutions:**

1. **Check before analyzing:**
   ```bash
   ls reports/youtube/ | grep "video-title"
   ```

2. **Delete duplicates:**
   ```bash
   rm reports/youtube/2024-01-15_duplicate-name.md
   ```

3. **Re-index database:**
   ```bash
   curl -X POST http://localhost:8000/api/sync
   ```

---

## Database Issues

### "Database is locked"

**Symptoms:**
- SQLite database locked error
- Multiple processes conflict

**Solutions:**

1. **Stop all processes accessing database:**
   ```bash
   # Find and kill uvicorn processes
   pkill -f uvicorn
   ```

2. **Wait a moment and retry**

3. **Delete and rebuild database:**
   ```bash
   rm web/backend/data.db
   # Restart backend - will recreate
   ```

---

### Search Not Working

**Symptoms:**
- Search returns no results
- Full-text search broken

**Solutions:**

1. **Trigger re-index:**
   ```bash
   curl -X POST http://localhost:8000/api/sync
   ```

2. **Rebuild FTS index:**
   ```python
   # In Python console
   import sqlite3
   conn = sqlite3.connect('web/backend/data.db')
   conn.execute("INSERT INTO reports_fts(reports_fts) VALUES('rebuild')")
   conn.commit()
   ```

---

## Performance Issues

### Analysis is Slow

**Symptoms:**
- Analysis takes minutes
- Long wait times

**Solutions:**

1. **Use faster model:**
   - Haiku is fastest
   - Sonnet is balanced
   - Opus is slowest but highest quality

2. **Check network:**
   ```bash
   ping api.anthropic.com
   ```

3. **Content too long:**
   - Long videos/articles take longer
   - Consider splitting very long content

---

### Web UI is Slow

**Symptoms:**
- Pages take long to load
- Scrolling is laggy

**Solutions:**

1. **Build production version:**
   ```bash
   cd web/frontend
   npm run build
   npm start  # Instead of npm run dev
   ```

2. **Check database size:**
   ```bash
   ls -lh web/backend/data.db
   # If >100MB, consider cleanup
   ```

3. **Clear browser cache**

---

## Export Issues

### Obsidian Export Fails

**Symptoms:**
- `/export obsidian` doesn't work
- Files not created properly

**Solutions:**

1. **Check exports directory exists:**
   ```bash
   mkdir -p exports/obsidian
   ```

2. **Check for special characters in titles:**
   - Obsidian doesn't like certain characters
   - Clean up file names if needed

---

### Flashcards Not Importing to Anki

**Symptoms:**
- Anki can't import the file
- Cards not formatted correctly

**Solutions:**

1. **Check file format:**
   - File should be tab-separated
   - Each line: `Front<TAB>Back`

2. **Import settings in Anki:**
   - Field separator: Tab
   - Import into: Default deck or new
   - Allow HTML: Yes

---

## Getting Help

### Still Stuck?

1. **Check all logs:**
   ```bash
   # Backend logs
   # (visible in terminal running uvicorn)

   # Frontend logs
   # (visible in terminal running npm run dev)
   ```

2. **Search existing issues:**
   - [Claude Code Issues](https://github.com/anthropics/claude-code/issues)

3. **Gather information before asking:**
   - Operating system
   - Python version: `python --version`
   - Node version: `node --version`
   - Exact error message
   - Steps to reproduce

### Reporting Bugs

When reporting issues, include:

```markdown
## Environment
- OS: Windows 11 / macOS 14 / Ubuntu 22.04
- Python: 3.11.4
- Node: 20.10.0
- Claude Code: 1.0.0

## Description
What you expected vs what happened

## Steps to Reproduce
1. Run `/yt https://...`
2. Wait for analysis
3. Error appears

## Error Message
```
Paste exact error here
```

## Logs
```
Any relevant log output
```
```

---

## Quick Reference Card

| Problem | Quick Fix |
|---------|-----------|
| Command not found | Restart Claude Code |
| API key error | Check `.env` file |
| yt-dlp not found | `pip install yt-dlp` |
| No captions | Add OPENAI_API_KEY for Whisper |
| CORS error | Check backend is running on 8000 |
| Report missing | `curl -X POST localhost:8000/api/sync` |
| Database locked | Stop all backend processes |
| Slow analysis | Use Haiku model |
| Import fails | Check file format |

---

*Troubleshooting Guide - Last updated: 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
