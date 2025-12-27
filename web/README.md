# Personal OS Web Application

Full-stack web interface for the Personal OS content consumption system.

## Prerequisites

- Python 3.10+
- Node.js 18+
- Anthropic API key

## Quick Start

### 1. Configure API Key

Create `web/backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 2. Install Dependencies

```bash
# Backend
cd web/backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 3. Start the Application

**Option A: Start separately (recommended for development)**

```bash
# Terminal 1: Backend
cd web/backend
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd web/frontend
npm run dev
```

**Option B: Unified start script**

```bash
python web/scripts/start.py
```

Or on Windows:
```cmd
web\scripts\start.bat
```

### 4. Open the Web UI

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Architecture

```
web/
├── backend/                 # FastAPI Python backend
│   ├── main.py              # Entry point, CORS, lifespan, FileWatcher
│   ├── config.py            # Paths, models, API keys
│   ├── database.py          # SQLite + FTS5 schema & operations
│   ├── models.py            # Pydantic request/response models
│   ├── routers/
│   │   ├── reports.py       # CRUD + search + delete + move
│   │   ├── analysis.py      # POST /api/analysis/youtube|article|arxiv
│   │   └── logs.py          # GET /api/logs/today
│   └── services/
│       ├── analyzer.py      # Anthropic API integration
│       ├── content_fetcher.py # yt-dlp, httpx article fetch
│       ├── indexer.py       # Filesystem sync + FileWatcher
│       └── parser.py        # Markdown parsing utilities
│
├── frontend/                # Next.js 14 React frontend
│   └── src/
│       ├── app/             # App Router pages
│       │   ├── page.tsx     # Dashboard
│       │   ├── analyze/     # Analysis form
│       │   ├── reports/     # Report list with selection mode
│       │   ├── reports/[id] # Detail page with delete/move
│       │   └── logs/        # Activity log
│       ├── components/      # Reusable React components
│       │   ├── ReportCard.tsx      # Card with action menu
│       │   ├── Toast.tsx           # Notification system
│       │   ├── ConfirmDialog.tsx   # Confirmation modal
│       │   ├── DropdownMenu.tsx    # Kebab menu
│       │   └── MoveCategoryDialog.tsx # Category picker
│       └── lib/
│           └── api.ts       # API client with delete/move
│
└── scripts/
    ├── start.py             # Unified startup script
    └── start.bat            # Windows launcher
```

## Features

### Core Features
| Feature | Description |
|---------|-------------|
| **Dashboard** | Recent reports + quick analysis form |
| **Analyze** | Submit YouTube URLs, articles, or arXiv papers |
| **Model Selection** | Choose Haiku (fast), Sonnet (balanced), or Opus (best) |
| **Reports** | Browse all reports with full-text search |
| **Report Viewer** | Rendered markdown with syntax highlighting |
| **Activity Log** | Today's consumption history |
| **Real-time Progress** | SSE-based live updates during analysis |
| **Dark Mode** | Toggle between light and dark themes |

### File Management
| Feature | Description |
|---------|-------------|
| **Delete Reports** | Single report delete with confirmation dialog |
| **Bulk Delete** | Select multiple reports and delete at once |
| **Move Category** | Change report's content type (moves file on disk) |
| **Selection Mode** | Checkbox selection with floating action bar |
| **Keyboard Shortcuts** | Delete, Ctrl+A (select all), Escape (exit) |

### Auto-Indexing
| Feature | Description |
|---------|-------------|
| **FileWatcher** | Real-time filesystem monitoring with `watchdog` |
| **Auto-Sync** | New files indexed automatically within seconds |
| **Auto-Remove** | Deleted files removed from database automatically |
| **No Manual Sync** | Database stays in sync with filesystem |

## How It Works

1. **User submits URL** via the Analyze page
2. **Backend fetches content**:
   - YouTube: Uses yt-dlp to download transcript
   - Article: Uses httpx to fetch and extract text
   - arXiv: Fetches abstract and paper content
3. **Backend calls Anthropic API** directly with the appropriate prompt from `prompts/`
4. **Report is saved** to `reports/{category}/YYYY-MM-DD_title.md`
5. **Activity log is updated** in `logs/YYYY-MM-DD.md`
6. **Database is re-indexed** to include the new report
7. **Frontend displays** the new report immediately

## Model Selection

| Model | ID | Speed | Cost (Input/Output per 1M) |
|-------|-----|-------|---------------------------|
| **Haiku** | claude-3-5-haiku-latest | ⚡ Fastest | $0.80 / $4.00 |
| **Sonnet** | claude-sonnet-4-20250514 | Medium | $3.00 / $15.00 |
| **Opus** | claude-opus-4-20250514 | Slower | $15.00 / $75.00 |

Typical analysis costs ~$0.01 (Haiku) to ~$0.25 (Opus) depending on content length.

## API Endpoints

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports (paginated) |
| GET | `/api/reports/{id}` | Get report with full content |
| GET | `/api/reports/search?q=term` | Full-text search |
| GET | `/api/reports/recent?limit=5` | Recent reports |
| DELETE | `/api/reports/{id}` | Delete report (file + DB record) |
| POST | `/api/reports/bulk-delete` | Delete multiple reports |
| PATCH | `/api/reports/{id}/category` | Move report to category |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/youtube` | Analyze YouTube URL |
| POST | `/api/analysis/article` | Analyze article URL |
| POST | `/api/analysis/arxiv` | Analyze arXiv paper |
| GET | `/api/analysis/models` | Available models |
| GET | `/api/analysis/jobs/{id}` | Job status |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs/today` | Today's activity log |
| POST | `/api/sync` | Trigger database re-index |

### Analysis Request Body

```json
{
  "url": "https://youtube.com/watch?v=...",
  "model": "sonnet"
}
```

### Analysis Response

```json
{
  "job_id": "uuid-string",
  "status": "pending"
}
```

Poll `/api/analysis/jobs/{job_id}` for status updates.

### Bulk Delete Request Body

```json
{
  "report_ids": [1, 2, 3]
}
```

### Bulk Delete Response

```json
{
  "deleted": [1, 2, 3],
  "errors": []
}
```

### Move Category Request Body

```json
{
  "new_category": "article"
}
```

Valid categories: `youtube`, `article`, `paper`, `other`

## Database Schema

```sql
-- Reports table (indexes filesystem markdown files)
CREATE TABLE reports (
    id INTEGER PRIMARY KEY,
    filename TEXT UNIQUE,
    filepath TEXT,
    title TEXT,
    source_url TEXT,
    content_type TEXT,  -- 'youtube', 'article', 'paper', 'other'
    created_at DATETIME,
    summary TEXT,
    word_count INTEGER,
    content_text TEXT   -- For FTS search
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE reports_fts USING fts5(title, content_text);

-- Analysis job tracking
CREATE TABLE analysis_jobs (
    id TEXT PRIMARY KEY,
    job_type TEXT,
    input_value TEXT,
    status TEXT,        -- 'pending', 'running', 'completed', 'failed'
    progress_message TEXT,
    result_filepath TEXT,
    error_message TEXT
);
```

The **filesystem is the source of truth** - the database is just an index for fast querying.

## Development

### Backend Hot Reload

```bash
cd web/backend
uvicorn main:app --reload --port 8000
```

Changes to Python files auto-reload the server.

### Frontend Hot Reload

```bash
cd web/frontend
npm run dev
```

Changes to TypeScript/React files auto-refresh the browser.

### Adding a New Content Type

1. Create fetcher in `services/content_fetcher.py`
2. Add prompt file to `prompts/`
3. Add route in `routers/analysis.py`
4. Add form option in `frontend/src/components/AnalysisForm.tsx`

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

Create `web/backend/.env` with your API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### "yt-dlp not found"

Install yt-dlp for YouTube analysis:
```bash
pip install yt-dlp
```

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

### Port already in use

Kill existing processes or use different ports:
```bash
# Backend on different port
uvicorn main:app --reload --port 8001

# Frontend on different port
npm run dev -- --port 3001
```

### Analysis succeeds but report not in UI

Trigger a manual sync or wait for auto-refresh:
```bash
curl -X POST http://localhost:8000/api/sync
```

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, aiosqlite, httpx, anthropic SDK, watchdog
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: SQLite with FTS5 full-text search
- **AI**: Anthropic Claude API (Haiku/Sonnet/Opus)
- **Content Fetching**: yt-dlp (YouTube), httpx (articles)
- **File Monitoring**: watchdog (cross-platform filesystem events)
