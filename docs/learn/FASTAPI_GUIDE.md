# FastAPI Guide

This guide explains FastAPI for developers who understand Python basics and REST concepts. We'll cover how to build APIs, handle requests, validate data, and connect to databases.

---

## Table of Contents

1. [What is FastAPI?](#what-is-fastapi)
2. [Setting Up FastAPI](#setting-up-fastapi)
3. [Your First Endpoint](#your-first-endpoint)
4. [Path Parameters](#path-parameters)
5. [Query Parameters](#query-parameters)
6. [Request Body with Pydantic](#request-body-with-pydantic)
7. [Response Models](#response-models)
8. [HTTP Methods](#http-methods)
9. [Status Codes](#status-codes)
10. [Routers for Organization](#routers-for-organization)
11. [Dependency Injection](#dependency-injection)
12. [Background Tasks](#background-tasks)
13. [Error Handling](#error-handling)
14. [CORS Configuration](#cors-configuration)
15. [Async/Await in FastAPI](#asyncawait-in-fastapi)
16. [Testing FastAPI](#testing-fastapi)
17. [This Project's Backend](#this-projects-backend)
18. [Practice Exercises](#practice-exercises)

---

## What is FastAPI?

**FastAPI** is a modern Python web framework for building APIs. It's:

- **Fast** - One of the fastest Python frameworks
- **Easy** - Intuitive to write and read
- **Automatic Docs** - Generates Swagger UI automatically
- **Type-Safe** - Uses Python type hints for validation

### Comparison with Other Frameworks

| Feature | Flask | Django | FastAPI |
|---------|-------|--------|---------|
| Speed | Medium | Medium | Very Fast |
| Type Hints | Optional | Optional | Required |
| Auto Validation | No | No | Yes |
| Auto Docs | No | No | Yes |
| Async Support | Limited | Limited | Native |
| Learning Curve | Easy | Steep | Easy |

### Why FastAPI for This Project?

```
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✓ Auto-validates incoming requests                             │
│  ✓ Auto-generates API documentation                             │
│  ✓ Native async for calling external APIs (Claude, etc.)        │
│  ✓ Clean router organization                                    │
│  ✓ Easy to test                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setting Up FastAPI

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install FastAPI and server
pip install fastapi uvicorn

# For this project, install all requirements
pip install -r requirements.txt
```

### Running the Server

```bash
# Development (with auto-reload)
uvicorn main:app --reload --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Accessing Documentation

Once running, open:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These are auto-generated from your code!

---

## Your First Endpoint

### Minimal Example

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
```

Run it:
```bash
uvicorn main:app --reload
```

Test it:
```bash
curl http://localhost:8000/
# {"message":"Hello, World!"}
```

### Understanding the Code

```python
from fastapi import FastAPI

# Create the FastAPI application instance
app = FastAPI()

# Define a route
@app.get("/")          # HTTP method: GET, path: /
def read_root():       # Handler function
    return {"message": "Hello, World!"}  # Automatically converted to JSON
```

### Multiple Endpoints

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"page": "home"}

@app.get("/about")
def about():
    return {"page": "about"}

@app.get("/api/reports")
def list_reports():
    return {"reports": [], "total": 0}
```

---

## Path Parameters

Path parameters are parts of the URL path:

```python
from fastapi import FastAPI

app = FastAPI()

# Basic path parameter
@app.get("/reports/{report_id}")
def get_report(report_id: int):  # Type hint provides validation
    return {"report_id": report_id}

# GET /reports/42 → {"report_id": 42}
# GET /reports/abc → Error: "value is not a valid integer"
```

### Multiple Path Parameters

```python
@app.get("/users/{user_id}/reports/{report_id}")
def get_user_report(user_id: int, report_id: int):
    return {
        "user_id": user_id,
        "report_id": report_id
    }

# GET /users/5/reports/42 → {"user_id": 5, "report_id": 42}
```

### String Path Parameters

```python
@app.get("/reports/{report_type}")
def get_by_type(report_type: str):
    return {"type": report_type}

# GET /reports/youtube → {"type": "youtube"}
```

### Enum Path Parameters

```python
from enum import Enum

class ReportType(str, Enum):
    youtube = "youtube"
    article = "article"
    paper = "paper"

@app.get("/reports/type/{report_type}")
def get_by_type(report_type: ReportType):
    return {"type": report_type.value}

# GET /reports/type/youtube → {"type": "youtube"}
# GET /reports/type/invalid → Error: "value is not a valid enumeration member"
```

---

## Query Parameters

Query parameters come after `?` in the URL:

```python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# Required query parameter
@app.get("/search")
def search(q: str):
    return {"query": q}

# GET /search?q=hello → {"query": "hello"}
# GET /search → Error: "field required"
```

### Optional Query Parameters

```python
@app.get("/reports")
def list_reports(
    page: int = 1,                    # Default value = optional
    limit: int = 10,
    type: Optional[str] = None        # Explicitly optional
):
    return {
        "page": page,
        "limit": limit,
        "type": type
    }

# GET /reports → {"page": 1, "limit": 10, "type": null}
# GET /reports?page=2&type=youtube → {"page": 2, "limit": 10, "type": "youtube"}
```

### Combining Path and Query Parameters

```python
@app.get("/users/{user_id}/reports")
def get_user_reports(
    user_id: int,                     # Path parameter
    page: int = 1,                    # Query parameter
    type: Optional[str] = None        # Query parameter
):
    return {
        "user_id": user_id,
        "page": page,
        "type": type
    }

# GET /users/5/reports?page=2&type=youtube
```

### Query Parameter Validation

```python
from fastapi import Query

@app.get("/reports")
def list_reports(
    page: int = Query(default=1, ge=1),           # >= 1
    limit: int = Query(default=10, le=100),       # <= 100
    q: str = Query(default=None, min_length=3)    # At least 3 chars
):
    return {"page": page, "limit": limit, "q": q}
```

---

## Request Body with Pydantic

Pydantic models define and validate request bodies:

### Basic Model

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Define the model
class ReportCreate(BaseModel):
    title: str
    content: str
    type: str = "other"  # Default value

# Use in endpoint
@app.post("/reports")
def create_report(report: ReportCreate):
    # report is now a validated ReportCreate object
    return {
        "message": "Created",
        "title": report.title,
        "type": report.type
    }
```

Request:
```bash
curl -X POST http://localhost:8000/reports \
  -H "Content-Type: application/json" \
  -d '{"title": "My Report", "content": "..."}'
```

### Validation

Pydantic validates automatically:

```python
from pydantic import BaseModel, Field
from typing import Optional

class AnalysisRequest(BaseModel):
    url: str = Field(..., min_length=10)  # Required, min 10 chars
    model: str = Field(default="sonnet", pattern="^(haiku|sonnet|opus)$")
    max_tokens: Optional[int] = Field(default=None, ge=100, le=4096)

# POST with invalid data:
# {"url": "abc"} → Error: "ensure this value has at least 10 characters"
# {"url": "https://...", "model": "invalid"} → Error: "string does not match regex"
```

### Nested Models

```python
class Author(BaseModel):
    name: str
    email: str

class Report(BaseModel):
    title: str
    content: str
    author: Author  # Nested model
    tags: list[str] = []  # List of strings

# Request body:
# {
#   "title": "My Report",
#   "content": "...",
#   "author": {"name": "Alice", "email": "alice@example.com"},
#   "tags": ["python", "fastapi"]
# }
```

### Model Methods

```python
class ReportCreate(BaseModel):
    title: str
    content: str

    class Config:
        # Example values for documentation
        json_schema_extra = {
            "example": {
                "title": "YouTube Analysis",
                "content": "Full analysis content..."
            }
        }
```

---

## Response Models

Control what gets returned:

```python
from pydantic import BaseModel
from typing import Optional

# Full model (internal use)
class ReportInDB(BaseModel):
    id: int
    title: str
    content: str
    internal_notes: str  # Don't expose this!
    created_at: str

# Response model (what client sees)
class ReportResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: str

@app.get("/reports/{report_id}", response_model=ReportResponse)
def get_report(report_id: int):
    # Even if we return ReportInDB, only ReportResponse fields are sent
    report = get_from_database(report_id)  # Returns ReportInDB
    return report  # internal_notes is automatically excluded
```

### List Response

```python
class ReportSummary(BaseModel):
    id: int
    title: str
    type: str

class ReportsListResponse(BaseModel):
    reports: list[ReportSummary]
    total: int
    page: int

@app.get("/reports", response_model=ReportsListResponse)
def list_reports(page: int = 1):
    reports = get_all_reports(page)
    return {
        "reports": reports,
        "total": count_reports(),
        "page": page
    }
```

---

## HTTP Methods

### GET - Read

```python
@app.get("/reports")
def list_reports():
    return {"reports": [...]}

@app.get("/reports/{id}")
def get_report(id: int):
    return {"id": id, "title": "..."}
```

### POST - Create

```python
@app.post("/reports")
def create_report(report: ReportCreate):
    # Create and return new report
    return {"id": 1, **report.dict()}
```

### PUT - Replace

```python
class ReportUpdate(BaseModel):
    title: str
    content: str
    type: str

@app.put("/reports/{id}")
def replace_report(id: int, report: ReportUpdate):
    # Replace entire report
    return {"id": id, **report.dict()}
```

### PATCH - Partial Update

```python
class ReportPatch(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

@app.patch("/reports/{id}")
def update_report(id: int, report: ReportPatch):
    # Only update provided fields
    existing = get_report(id)
    if report.title:
        existing.title = report.title
    return existing
```

### DELETE - Remove

```python
@app.delete("/reports/{id}")
def delete_report(id: int):
    # Delete the report
    return {"message": "Deleted"}
```

---

## Status Codes

### Setting Status Codes

```python
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/reports", status_code=status.HTTP_201_CREATED)
def create_report(report: ReportCreate):
    return {"id": 1}

@app.delete("/reports/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(id: int):
    # Delete...
    return None  # No content
```

### Common Status Codes

```python
from fastapi import status

status.HTTP_200_OK           # Default for GET
status.HTTP_201_CREATED      # Resource created (POST)
status.HTTP_204_NO_CONTENT   # Success, no body (DELETE)
status.HTTP_400_BAD_REQUEST  # Invalid request data
status.HTTP_404_NOT_FOUND    # Resource doesn't exist
status.HTTP_422_UNPROCESSABLE_ENTITY  # Validation failed
status.HTTP_500_INTERNAL_SERVER_ERROR # Server error
```

---

## Routers for Organization

Split your API into modules:

### Router File

```python
# routers/reports.py
from fastapi import APIRouter

router = APIRouter(
    prefix="/api/reports",   # All routes start with /api/reports
    tags=["reports"]         # Group in documentation
)

@router.get("/")
def list_reports():
    return {"reports": []}

@router.get("/{id}")
def get_report(id: int):
    return {"id": id}

@router.post("/")
def create_report(report: ReportCreate):
    return {"id": 1}

@router.delete("/{id}")
def delete_report(id: int):
    return {"deleted": True}
```

### Main File

```python
# main.py
from fastapi import FastAPI
from routers import reports, analysis, logs

app = FastAPI()

# Include routers
app.include_router(reports.router)
app.include_router(analysis.router)
app.include_router(logs.router)

@app.get("/")
def root():
    return {"message": "API is running"}
```

### Project Structure

```
backend/
├── main.py               ← App entry point
├── config.py             ← Configuration
├── routers/
│   ├── __init__.py
│   ├── reports.py        ← /api/reports routes
│   ├── analysis.py       ← /api/analysis routes
│   └── logs.py           ← /api/logs routes
├── services/
│   ├── analyzer.py       ← Business logic
│   └── content_fetcher.py
└── models/
    └── schemas.py        ← Pydantic models
```

---

## Dependency Injection

Reuse common logic across endpoints:

### Basic Dependency

```python
from fastapi import Depends

# Dependency function
def get_current_page(page: int = 1, limit: int = 10):
    return {"page": page, "limit": limit, "offset": (page - 1) * limit}

# Use in multiple endpoints
@app.get("/reports")
def list_reports(pagination: dict = Depends(get_current_page)):
    return {"pagination": pagination, "reports": [...]}

@app.get("/logs")
def list_logs(pagination: dict = Depends(get_current_page)):
    return {"pagination": pagination, "logs": [...]}
```

### Database Dependency

```python
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()  # Create database session
    try:
        yield db         # Provide to endpoint
    finally:
        db.close()       # Clean up after request

@app.get("/reports")
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    return reports
```

### Class-Based Dependencies

```python
class Paginator:
    def __init__(self, page: int = 1, limit: int = 10):
        self.page = page
        self.limit = limit
        self.offset = (page - 1) * limit

@app.get("/reports")
def list_reports(pagination: Paginator = Depends()):
    return {
        "page": pagination.page,
        "limit": pagination.limit
    }
```

---

## Background Tasks

Run tasks after returning response:

```python
from fastapi import BackgroundTasks

def write_log(message: str):
    # This runs after response is sent
    with open("log.txt", "a") as f:
        f.write(f"{message}\n")

@app.post("/reports")
def create_report(
    report: ReportCreate,
    background_tasks: BackgroundTasks
):
    # Create report...

    # Schedule log write (doesn't block response)
    background_tasks.add_task(write_log, f"Created: {report.title}")

    return {"id": 1}  # Returns immediately
```

### Long-Running Tasks Pattern

For truly long tasks (like AI analysis), use a job queue:

```python
import uuid
from typing import Dict

# In-memory job store (use Redis/database in production)
jobs: Dict[str, dict] = {}

@app.post("/analysis/youtube")
async def start_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    # Create job ID
    job_id = str(uuid.uuid4())

    # Initialize job status
    jobs[job_id] = {"status": "pending", "progress": 0}

    # Start background task
    background_tasks.add_task(run_analysis, job_id, request)

    # Return immediately
    return {"job_id": job_id, "status": "pending"}

@app.get("/analysis/jobs/{job_id}")
def get_job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

async def run_analysis(job_id: str, request: AnalysisRequest):
    jobs[job_id]["status"] = "running"
    jobs[job_id]["progress"] = 10

    # Do the actual work...
    result = await analyze_content(request.url)

    jobs[job_id]["status"] = "completed"
    jobs[job_id]["progress"] = 100
    jobs[job_id]["result"] = result
```

---

## Error Handling

### HTTPException

```python
from fastapi import HTTPException

@app.get("/reports/{id}")
def get_report(id: int):
    report = database.get(id)

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report
```

### Custom Exception Handlers

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class ReportNotFoundError(Exception):
    def __init__(self, report_id: int):
        self.report_id = report_id

@app.exception_handler(ReportNotFoundError)
async def report_not_found_handler(request: Request, exc: ReportNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Report not found",
            "report_id": exc.report_id
        }
    )

@app.get("/reports/{id}")
def get_report(id: int):
    report = database.get(id)
    if not report:
        raise ReportNotFoundError(id)
    return report
```

### Validation Errors

FastAPI automatically handles Pydantic validation errors:

```python
# Request: {"title": 123}  (should be string)
# Response (422):
{
    "detail": [
        {
            "loc": ["body", "title"],
            "msg": "str type expected",
            "type": "type_error.str"
        }
    ]
}
```

---

## CORS Configuration

Allow frontend to call backend from different origin:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],           # Allow all methods
    allow_headers=["*"],           # Allow all headers
)
```

### Why CORS?

```
Browser blocks this by default:

Frontend (localhost:3000) ──────▶ Backend (localhost:8000)
                          ✗ CORS Error

CORS middleware tells browser "it's okay":

Frontend (localhost:3000) ──────▶ Backend (localhost:8000)
                          ✓ Allowed by CORS
```

---

## Async/Await in FastAPI

FastAPI supports both sync and async:

### Sync Function (Runs in Thread Pool)

```python
@app.get("/sync")
def sync_endpoint():
    # Blocking I/O is okay here
    result = requests.get("https://api.example.com")
    return result.json()
```

### Async Function (Native Async)

```python
import httpx

@app.get("/async")
async def async_endpoint():
    async with httpx.AsyncClient() as client:
        result = await client.get("https://api.example.com")
    return result.json()
```

### When to Use Which?

| Situation | Use |
|-----------|-----|
| File I/O | `def` (sync) |
| Database (sync driver) | `def` (sync) |
| External API calls | `async def` |
| Multiple concurrent calls | `async def` |
| CPU-intensive | `def` (sync) or background task |

### Concurrent API Calls

```python
import asyncio
import httpx

@app.get("/dashboard")
async def dashboard():
    async with httpx.AsyncClient() as client:
        # Run all three requests concurrently
        reports_task = client.get("/api/reports")
        logs_task = client.get("/api/logs")
        stats_task = client.get("/api/stats")

        reports, logs, stats = await asyncio.gather(
            reports_task, logs_task, stats_task
        )

    return {
        "reports": reports.json(),
        "logs": logs.json(),
        "stats": stats.json()
    }
```

---

## Testing FastAPI

### Using TestClient

```python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}

def test_create_report():
    response = client.post(
        "/reports",
        json={"title": "Test", "content": "Content"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test"

def test_report_not_found():
    response = client.get("/reports/99999")
    assert response.status_code == 404

def test_validation_error():
    response = client.post(
        "/reports",
        json={"content": "Missing title"}  # title is required
    )
    assert response.status_code == 422
```

### Running Tests

```bash
# Install pytest
pip install pytest

# Run tests
pytest

# With coverage
pip install pytest-cov
pytest --cov=. --cov-report=html
```

### Testing Async Endpoints

```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/async")
        assert response.status_code == 200
```

---

## This Project's Backend

The Personal OS backend structure:

```
web/backend/
├── main.py                    ← FastAPI app, CORS, routers
├── config.py                  ← Settings, model config
├── database.py                ← Database setup
├── routers/
│   ├── analysis.py            ← /api/analysis/* routes
│   ├── reports.py             ← /api/reports/* routes
│   ├── logs.py                ← /api/logs/* routes
│   └── batch.py               ← /api/batch/* routes
└── services/
    ├── analyzer.py            ← Claude API interaction
    ├── content_fetcher.py     ← URL fetching
    ├── indexer.py             ← Report indexing
    └── parser.py              ← Content parsing
```

### Key Endpoints

```python
# Analysis endpoints
POST /api/analysis/youtube     ← Analyze YouTube video
POST /api/analysis/article     ← Analyze article
POST /api/analysis/arxiv       ← Analyze paper
GET  /api/analysis/jobs/{id}   ← Get job status

# Report endpoints
GET  /api/reports              ← List all reports
GET  /api/reports/{id}         ← Get single report
DELETE /api/reports/{id}       ← Delete report
GET  /api/reports/search       ← Search reports

# Log endpoints
GET  /api/logs/today           ← Get today's log

# Health
GET  /api/health               ← Server status
```

### Request Flow Example

```
Frontend                    Backend
   │                          │
   │ POST /api/analysis/youtube
   │ {"url": "youtube.com/..."}
   │────────────────────────▶│
   │                          │ 1. Validate request (Pydantic)
   │                          │ 2. Create job ID
   │                          │ 3. Start background task
   │◀────────────────────────│
   │ {"job_id": "abc", "status": "pending"}
   │                          │
   │ GET /api/analysis/jobs/abc
   │────────────────────────▶│ 4. Return current status
   │◀────────────────────────│
   │ {"status": "running", "progress": 50}
   │                          │
   │         ...polling...    │ 5. Background: fetch content
   │                          │ 6. Background: call Claude API
   │                          │ 7. Background: save report
   │                          │
   │ GET /api/analysis/jobs/abc
   │────────────────────────▶│
   │◀────────────────────────│
   │ {"status": "completed", "result_filepath": "..."}
```

---

## Practice Exercises

### Exercise 1: Create a Simple API

Build a todo list API with:
- `GET /todos` - List all todos
- `POST /todos` - Create a todo
- `GET /todos/{id}` - Get one todo
- `DELETE /todos/{id}` - Delete a todo

### Exercise 2: Add Validation

Extend Exercise 1 with:
- Todo title must be 3-100 characters
- Todo has optional due_date (ISO format)
- Todo has status enum: pending, in_progress, done

### Exercise 3: Add Search

Add to the todo API:
- `GET /todos?status=pending` - Filter by status
- `GET /todos?search=keyword` - Search by title
- Pagination with page and limit

### Exercise 4: Background Tasks

Create an endpoint that:
- Accepts a URL
- Returns immediately with a job ID
- Fetches the URL in background
- Stores result for later retrieval

### Exercise 5: Testing

Write tests for:
- Successful todo creation
- Validation error on short title
- 404 when todo not found
- Delete returns 204

---

## Summary

| Concept | What It Does |
|---------|-------------|
| `@app.get("/path")` | Define GET endpoint |
| `{param}` in path | Path parameter |
| Function parameters | Query parameters |
| `BaseModel` | Request/response validation |
| `response_model` | Filter response fields |
| `APIRouter` | Organize routes |
| `Depends()` | Dependency injection |
| `BackgroundTasks` | Run after response |
| `HTTPException` | Return error responses |
| `CORSMiddleware` | Allow cross-origin requests |
| `async def` | Native async support |

---

## What's Next?

Now that you understand FastAPI, move on to:

1. **[ANTHROPIC_CLAUDE_API.md](ANTHROPIC_CLAUDE_API.md)** - AI integration
2. **[OPENAI_WHISPER_API.md](OPENAI_WHISPER_API.md)** - Audio transcription

---

*FastAPI Guide - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
