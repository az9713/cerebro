# API Reference

This document provides complete documentation for the Personal OS REST API. The API is built with FastAPI and runs on port 8000 by default.

**Base URL:** `http://localhost:8000`

**Interactive Documentation:** After starting the backend, visit `http://localhost:8000/docs` for Swagger UI.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Reports](#reports)
   - [Analysis](#analysis)
   - [Logs](#logs)
   - [Batch Processing](#batch-processing)
   - [Tags](#tags)
   - [Collections](#collections)
   - [RSS Feeds](#rss-feeds)
   - [Export](#export)
   - [Transcription](#transcription)
   - [Knowledge Graph](#knowledge-graph)
   - [Q&A](#qa)
   - [Comparison](#comparison)
   - [Text-to-Speech](#text-to-speech)
   - [Spaced Repetition](#spaced-repetition)
   - [Credibility Analysis](#credibility-analysis)
   - [Learning Goals](#learning-goals)
   - [Translation](#translation)
   - [Recommendations](#recommendations)
   - [System](#system)
6. [WebSocket Events](#websocket-events)
7. [Examples](#examples)

---

## Quick Start

### Starting the API Server

```bash
# Navigate to backend folder
cd web/backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Create .env file with API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Start the server
uvicorn main:app --reload --port 8000
```

### Testing the API

```bash
# Check if server is running
curl http://localhost:8000/api/health

# List all reports
curl http://localhost:8000/api/reports

# Submit a YouTube video for analysis
curl -X POST http://localhost:8000/api/analysis/youtube \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=abc123", "model": "sonnet"}'
```

---

## Authentication

The API uses API key authentication for the Anthropic Claude API calls. The key is stored server-side in the `.env` file.

**No client-side authentication is required** for the local API. All requests from localhost are allowed.

For production deployments, consider adding:
- API key header authentication
- OAuth2 / JWT tokens
- Rate limiting

---

## Response Format

All API responses follow a consistent JSON format:

### Success Response

```json
{
  "data": { ... },
  "status": "success"
}
```

### List Response (with Pagination)

```json
{
  "reports": [ ... ],
  "total": 150,
  "page": 1,
  "page_size": 20
}
```

### Error Response

```json
{
  "detail": "Error message describing what went wrong",
  "status_code": 400
}
```

---

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid request body |
| 500 | Server Error - Something went wrong |

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ANTHROPIC_API_KEY not configured` | Missing API key | Create `.env` file with key |
| `Report not found` | Invalid report ID | Check ID exists via list endpoint |
| `yt-dlp not found` | Missing dependency | Run `pip install yt-dlp` |
| `Content fetch failed` | URL unreachable | Check URL is accessible |

---

## Endpoints

### Reports

#### List Reports

Retrieve a paginated list of all reports.

```http
GET /api/reports
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `page_size` | integer | 20 | Items per page (max 100) |
| `type` | string | null | Filter by content type |
| `search` | string | null | Full-text search query |

**Example Request:**

```bash
curl "http://localhost:8000/api/reports?page=1&type=youtube&search=habits"
```

**Example Response:**

```json
{
  "reports": [
    {
      "id": 42,
      "filename": "2024-01-15_building-habits.md",
      "filepath": "reports/youtube/2024-01-15_building-habits.md",
      "title": "Building Better Habits",
      "source_url": "https://youtube.com/watch?v=abc123",
      "content_type": "youtube",
      "created_at": "2024-01-15T10:30:00Z",
      "summary": "A comprehensive guide to building lasting habits...",
      "word_count": 2500
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

---

#### Get Single Report

Retrieve a specific report by ID.

```http
GET /api/reports/{report_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `report_id` | integer | The report ID |

**Example Request:**

```bash
curl http://localhost:8000/api/reports/42
```

**Example Response:**

```json
{
  "id": 42,
  "filename": "2024-01-15_building-habits.md",
  "filepath": "reports/youtube/2024-01-15_building-habits.md",
  "title": "Building Better Habits",
  "source_url": "https://youtube.com/watch?v=abc123",
  "content_type": "youtube",
  "created_at": "2024-01-15T10:30:00Z",
  "summary": "A comprehensive guide...",
  "word_count": 2500,
  "content": "# Building Better Habits\n\n**Source**: https://youtube.com/watch?v=abc123\n..."
}
```

---

#### Search Reports

Full-text search across all reports.

```http
GET /api/reports/search
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `type` | string | No | Filter by content type |
| `limit` | integer | No | Max results (default 20) |

**Example Request:**

```bash
curl "http://localhost:8000/api/reports/search?q=machine+learning&type=paper"
```

---

#### Delete Report

Delete a report by ID.

```http
DELETE /api/reports/{report_id}
```

**Example Request:**

```bash
curl -X DELETE http://localhost:8000/api/reports/42
```

---

### Analysis

#### Analyze YouTube Video

Submit a YouTube video for analysis.

```http
POST /api/analysis/youtube
```

**Request Body:**

```json
{
  "url": "https://youtube.com/watch?v=abc123",
  "model": "sonnet"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | YouTube video URL |
| `model` | string | No | Model to use: `haiku`, `sonnet`, `opus` (default: `sonnet`) |

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/analysis/youtube \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=abc123"}'
```

**Example Response:**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Analysis job created"
}
```

---

#### Analyze Article

Submit a web article for analysis.

```http
POST /api/analysis/article
```

**Request Body:**

```json
{
  "url": "https://example.com/blog-post",
  "model": "sonnet"
}
```

---

#### Analyze arXiv Paper

Submit an arXiv paper for analysis.

```http
POST /api/analysis/arxiv
```

**Request Body:**

```json
{
  "url": "https://arxiv.org/abs/2401.12345",
  "model": "sonnet"
}
```

---

#### Analyze Podcast

Submit a podcast episode for analysis.

```http
POST /api/analysis/podcast
```

**Request Body:**

```json
{
  "url": "https://example.com/podcast.mp3",
  "model": "sonnet",
  "transcribe": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Podcast audio URL or file path |
| `model` | string | No | AI model to use |
| `transcribe` | boolean | No | Whether to transcribe audio (default: true) |

---

#### Analyze PDF

Submit a PDF document for analysis.

```http
POST /api/analysis/pdf
```

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | PDF file upload |
| `model` | string | No | AI model to use |

**Example Request:**

```bash
curl -X POST http://localhost:8000/api/analysis/pdf \
  -F "file=@document.pdf" \
  -F "model=sonnet"
```

---

#### Get Job Status

Check the status of an analysis job.

```http
GET /api/analysis/jobs/{job_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `job_id` | string | UUID of the analysis job |

**Example Response (Pending):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "progress_message": "Analyzing content..."
}
```

**Example Response (Completed):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result_filepath": "reports/youtube/2024-01-15_video-title.md"
}
```

**Example Response (Failed):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "error_message": "Could not fetch video transcript"
}
```

---

### Logs

#### Get Today's Log

Retrieve today's activity log.

```http
GET /api/logs/today
```

**Example Response:**

```json
{
  "date": "2024-01-15",
  "content": "# Activity Log - 2024-01-15\n\n## Videos Watched\n- [Building Habits](../reports/youtube/...) - 10:30\n..."
}
```

---

#### Get Log by Date

Retrieve activity log for a specific date.

```http
GET /api/logs/{date}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | Date in YYYY-MM-DD format |

**Example Request:**

```bash
curl http://localhost:8000/api/logs/2024-01-10
```

---

### Batch Processing

#### Submit Batch Job

Process multiple URLs at once.

```http
POST /api/batch
```

**Request Body:**

```json
{
  "urls": [
    "https://youtube.com/watch?v=abc123",
    "https://example.com/article",
    "https://arxiv.org/abs/2401.12345"
  ],
  "model": "sonnet"
}
```

**Example Response:**

```json
{
  "batch_id": "batch-550e8400",
  "jobs": [
    {"job_id": "job-1", "url": "https://youtube.com/watch?v=abc123", "status": "pending"},
    {"job_id": "job-2", "url": "https://example.com/article", "status": "pending"},
    {"job_id": "job-3", "url": "https://arxiv.org/abs/2401.12345", "status": "pending"}
  ]
}
```

---

#### Get Batch Status

Check status of all jobs in a batch.

```http
GET /api/batch/{batch_id}
```

---

### Tags

#### List Tags

Get all available tags.

```http
GET /api/tags
```

**Example Response:**

```json
{
  "tags": [
    {"id": 1, "name": "productivity", "color": "#3B82F6"},
    {"id": 2, "name": "ai", "color": "#10B981"},
    {"id": 3, "name": "learning", "color": "#F59E0B"}
  ]
}
```

---

#### Create Tag

Create a new tag.

```http
POST /api/tags
```

**Request Body:**

```json
{
  "name": "technology",
  "color": "#8B5CF6"
}
```

---

#### Add Tag to Report

Associate a tag with a report.

```http
POST /api/tags/{tag_id}/reports/{report_id}
```

---

#### Remove Tag from Report

Remove a tag from a report.

```http
DELETE /api/tags/{tag_id}/reports/{report_id}
```

---

#### Get Reports by Tag

Get all reports with a specific tag.

```http
GET /api/tags/{tag_id}/reports
```

---

### Collections

#### List Collections

Get all collections.

```http
GET /api/collections
```

**Example Response:**

```json
{
  "collections": [
    {"id": 1, "name": "AI Research", "description": "Papers and videos about AI", "report_count": 15},
    {"id": 2, "name": "Productivity", "description": "Self-improvement content", "report_count": 8}
  ]
}
```

---

#### Create Collection

Create a new collection.

```http
POST /api/collections
```

**Request Body:**

```json
{
  "name": "Machine Learning",
  "description": "ML papers and tutorials"
}
```

---

#### Add Report to Collection

```http
POST /api/collections/{collection_id}/reports/{report_id}
```

---

#### Remove Report from Collection

```http
DELETE /api/collections/{collection_id}/reports/{report_id}
```

---

#### Get Collection Reports

Get all reports in a collection.

```http
GET /api/collections/{collection_id}/reports
```

---

### RSS Feeds

#### List Subscribed Feeds

Get all RSS feed subscriptions.

```http
GET /api/rss
```

**Example Response:**

```json
{
  "feeds": [
    {
      "id": 1,
      "url": "https://blog.example.com/feed.xml",
      "title": "Example Blog",
      "content_type": "article",
      "last_checked": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### Subscribe to Feed

Add a new RSS feed subscription.

```http
POST /api/rss
```

**Request Body:**

```json
{
  "url": "https://blog.example.com/feed.xml",
  "content_type": "article"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | RSS feed URL |
| `content_type` | string | No | Type for new items: `youtube`, `article`, etc. |

---

#### Unsubscribe from Feed

```http
DELETE /api/rss/{feed_id}
```

---

#### Check for New Items

Check all feeds for new content.

```http
POST /api/rss/check
```

**Example Response:**

```json
{
  "new_items": 5,
  "items": [
    {"title": "New Blog Post", "url": "https://...", "feed": "Example Blog"}
  ]
}
```

---

### Export

#### Export to Obsidian

Export all reports in Obsidian-compatible format.

```http
POST /api/export/obsidian
```

**Request Body:**

```json
{
  "include_tags": true,
  "include_backlinks": true
}
```

**Example Response:**

```json
{
  "export_path": "exports/obsidian/2024-01-15",
  "file_count": 42,
  "total_size": "2.5 MB"
}
```

---

#### Export to Notion

Export reports as Notion-compatible JSON.

```http
POST /api/export/notion
```

**Request Body:**

```json
{
  "report_ids": [1, 2, 3]
}
```

---

#### Generate Flashcards

Generate Anki flashcards from reports.

```http
POST /api/export/flashcards
```

**Request Body:**

```json
{
  "report_ids": [1, 2, 3],
  "format": "anki"
}
```

**Example Response:**

```json
{
  "export_path": "exports/anki/flashcards-2024-01-15.txt",
  "card_count": 87
}
```

---

### Transcription

#### Transcribe Audio

Transcribe an audio file using Whisper.

```http
POST /api/transcription
```

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | Audio file (MP3, M4A, WAV) |
| `language` | string | No | Language code (default: auto-detect) |

**Example Response:**

```json
{
  "text": "Full transcription text...",
  "language": "en",
  "duration": 3600
}
```

---

#### Transcribe from URL

Transcribe audio from a URL.

```http
POST /api/transcription/url
```

**Request Body:**

```json
{
  "url": "https://example.com/podcast.mp3"
}
```

---

### Knowledge Graph

#### Get Knowledge Graph

Retrieve the knowledge graph with concepts and relationships.

```http
GET /api/knowledge-graph
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Maximum number of concepts to return |

**Example Response:**

```json
{
  "nodes": [
    {"id": 1, "name": "Machine Learning", "type": "topic", "description": "AI approach using data patterns", "mention_count": 15},
    {"id": 2, "name": "Neural Networks", "type": "concept", "description": "Computing systems inspired by brain", "mention_count": 12}
  ],
  "links": [
    {"source": 1, "target": 2, "type": "contains", "strength": 0.8}
  ]
}
```

---

#### Get Concept Details

Get detailed information about a specific concept.

```http
GET /api/knowledge-graph/concept/{concept_id}
```

**Example Response:**

```json
{
  "id": 1,
  "name": "Machine Learning",
  "concept_type": "topic",
  "description": "AI approach using data patterns",
  "mention_count": 15,
  "reports": [
    {"id": 42, "title": "Introduction to ML", "content_type": "youtube"},
    {"id": 43, "title": "Deep Learning Basics", "content_type": "paper"}
  ]
}
```

---

#### Extract Concepts from Report

Extract concepts from a specific report.

```http
POST /api/knowledge-graph/extract/{report_id}
```

**Example Response:**

```json
{
  "concepts_extracted": 8,
  "concepts_stored": 6,
  "relationships_stored": 12
}
```

---

#### Batch Extract Concepts

Extract concepts from multiple reports.

```http
POST /api/knowledge-graph/extract-all
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Maximum reports to process |

---

### Q&A

#### Ask Question

Ask a question across your knowledge base.

```http
POST /api/qa
```

**Request Body:**

```json
{
  "question": "What are the best practices for habit formation?",
  "model": "sonnet",
  "max_reports": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | The question to ask |
| `model` | string | No | AI model: `haiku`, `sonnet`, `opus` |
| `max_reports` | integer | No | Maximum reports to search (default: 5) |

**Example Response:**

```json
{
  "answer": "Based on your knowledge base, the best practices for habit formation include...",
  "sources": [
    {"id": 42, "title": "Building Better Habits", "content_type": "youtube", "source_url": "https://..."},
    {"id": 43, "title": "Atomic Habits Summary", "content_type": "article", "source_url": "https://..."}
  ],
  "tokens_used": 2500,
  "cost": 0.0075,
  "model": "claude-sonnet-4-20250514",
  "followup_suggestions": [
    "How long does it take to form a habit?",
    "What are common habit formation mistakes?"
  ]
}
```

---

#### Get Question Suggestions

Get suggested questions based on your content.

```http
GET /api/qa/suggestions
```

**Example Response:**

```json
{
  "suggestions": [
    "What are the key differences between supervised and unsupervised learning?",
    "How do transformers work in NLP?",
    "What productivity techniques are mentioned in your videos?"
  ]
}
```

---

### Comparison

#### Compare Two Reports

Compare two reports with AI-generated analysis.

```http
POST /api/comparison
```

**Request Body:**

```json
{
  "report_id_a": 42,
  "report_id_b": 43,
  "model": "sonnet"
}
```

**Example Response:**

```json
{
  "comparison": "## Similarities\n\n- Both discuss habit formation...\n\n## Differences\n\n- Report A focuses on...",
  "report_a": {"id": 42, "title": "Building Habits", "content_type": "youtube", "source_url": "https://..."},
  "report_b": {"id": 43, "title": "Atomic Habits", "content_type": "article", "source_url": "https://..."},
  "tokens_used": 3000,
  "cost": 0.009,
  "model": "claude-sonnet-4-20250514"
}
```

---

#### Get Comparison Suggestions

Get suggested reports to compare with a given report.

```http
GET /api/comparison/suggestions/{report_id}
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 5 | Maximum suggestions to return |

**Example Response:**

```json
{
  "suggestions": [
    {"id": 43, "title": "Related Topic", "content_type": "article"},
    {"id": 44, "title": "Similar Video", "content_type": "youtube"}
  ]
}
```

---

### Text-to-Speech

#### List Available Voices

Get available TTS voices.

```http
GET /api/tts/voices
```

**Example Response:**

```json
{
  "voices": [
    {"id": "alloy", "description": "Neutral and balanced"},
    {"id": "echo", "description": "Warm and conversational"},
    {"id": "fable", "description": "British accent"},
    {"id": "onyx", "description": "Deep and authoritative"},
    {"id": "nova", "description": "Friendly and upbeat"},
    {"id": "shimmer", "description": "Soft and gentle"}
  ],
  "default": "nova"
}
```

---

#### Generate Audio

Generate audio for a report.

```http
POST /api/tts/{report_id}
```

**Request Body:**

```json
{
  "voice": "nova",
  "force_regenerate": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `voice` | string | No | Voice ID (default: `nova`) |
| `force_regenerate` | boolean | No | Force regeneration even if cached |

**Example Response:**

```json
{
  "audio_path": "audio/42_nova.mp3",
  "voice": "nova",
  "duration_estimate": 420,
  "cached": false
}
```

---

#### Get Report Audio

Get existing audio versions for a report.

```http
GET /api/tts/{report_id}
```

**Example Response:**

```json
{
  "report_id": 42,
  "audio_versions": [
    {"voice": "nova", "description": "Friendly and upbeat", "path": "audio/42_nova.mp3"},
    {"voice": "onyx", "description": "Deep and authoritative", "path": "audio/42_onyx.mp3"}
  ]
}
```

---

#### Stream Audio

Stream audio file for playback.

```http
GET /api/tts/{report_id}/stream/{voice}
```

Returns audio file with `Content-Type: audio/mpeg`.

---

### Spaced Repetition

#### Get Due Reviews

Get reports due for review.

```http
GET /api/reviews/due
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Maximum items to return |

**Example Response:**

```json
{
  "items": [
    {
      "id": 1,
      "report_id": 42,
      "title": "Building Habits",
      "content_type": "youtube",
      "source_url": "https://...",
      "repetitions": 3,
      "ease_factor": 2.5,
      "interval": 7,
      "next_review": "2024-01-15",
      "summary": "A guide to building lasting habits..."
    }
  ],
  "count": 5
}
```

---

#### Add to Review Queue

Add a report to the spaced repetition queue.

```http
POST /api/reviews/add
```

**Request Body:**

```json
{
  "report_id": 42
}
```

**Example Response:**

```json
{
  "message": "Report added to review queue"
}
```

---

#### Submit Review

Submit a review rating for a report.

```http
POST /api/reviews/{report_id}/review
```

**Request Body:**

```json
{
  "quality": 4
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quality` | integer | Yes | Rating 0-5 (0=blackout, 5=perfect recall) |

**Quality Scale:**
- 0: Complete blackout, no memory
- 1: Incorrect, but recognized when shown
- 2: Incorrect, but seemed familiar
- 3: Correct with difficulty
- 4: Correct with some hesitation
- 5: Perfect recall

**Example Response:**

```json
{
  "report_id": 42,
  "next_review": "2024-01-22",
  "interval": 7,
  "ease_factor": 2.6,
  "repetitions": 4
}
```

---

#### Get Review Statistics

Get spaced repetition statistics.

```http
GET /api/reviews/stats
```

**Example Response:**

```json
{
  "total_reviews": 150,
  "due_today": 5,
  "reviewed_today": 3,
  "average_ease": 2.45,
  "streak": 7
}
```

---

### Credibility Analysis

#### Analyze Report Credibility

Analyze the credibility of a report's source.

```http
GET /api/credibility/{report_id}
```

**Example Response:**

```json
{
  "overall_score": 78,
  "domain_score": 85,
  "ai_score": 72,
  "source_quality": {"score": 80, "notes": "Established author with relevant expertise"},
  "evidence_quality": {"score": 75, "notes": "Claims supported by citations"},
  "bias_level": {"score": 70, "notes": "Some promotional language detected"},
  "fact_checkability": {"score": 85, "notes": "Most claims are verifiable"},
  "red_flags": [
    "Some claims lack citations",
    "Promotional language in conclusion"
  ],
  "strengths": [
    "Author credentials verified",
    "Multiple expert sources cited",
    "Data from reputable studies"
  ],
  "recommendation": "Generally reliable source. Verify promotional claims independently."
}
```

---

### Learning Goals

#### List Goals

Get all learning goals with progress.

```http
GET /api/goals
```

**Example Response:**

```json
{
  "goals": [
    {
      "id": 1,
      "title": "Learn Machine Learning",
      "description": "Complete ML fundamentals",
      "keywords": ["machine learning", "AI", "neural networks"],
      "target_count": 20,
      "current_count": 12,
      "status": "active",
      "progress_percent": 60,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Create Goal

Create a new learning goal.

```http
POST /api/goals
```

**Request Body:**

```json
{
  "title": "Master Python",
  "description": "Learn advanced Python concepts",
  "keywords": ["python", "programming", "async"],
  "target_count": 15
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Goal title |
| `description` | string | No | Goal description |
| `keywords` | array | No | Keywords for auto-linking reports |
| `target_count` | integer | No | Target number of reports (default: 10) |

---

#### Get Goal Details

Get a specific goal with linked reports.

```http
GET /api/goals/{goal_id}
```

---

#### Update Goal Status

Update goal status.

```http
PUT /api/goals/{goal_id}
```

**Request Body:**

```json
{
  "status": "completed"
}
```

| Status | Description |
|--------|-------------|
| `active` | Currently working on |
| `paused` | Temporarily paused |
| `completed` | Goal achieved |

---

#### Delete Goal

Delete a learning goal.

```http
DELETE /api/goals/{goal_id}
```

---

#### Link Report to Goal

Link a report to a learning goal.

```http
POST /api/goals/{goal_id}/reports/{report_id}
```

---

### Translation

#### Get Supported Languages

List supported translation languages.

```http
GET /api/translate/languages
```

**Example Response:**

```json
{
  "languages": [
    {"code": "es", "name": "Spanish"},
    {"code": "fr", "name": "French"},
    {"code": "de", "name": "German"},
    {"code": "it", "name": "Italian"},
    {"code": "pt", "name": "Portuguese"},
    {"code": "ja", "name": "Japanese"},
    {"code": "ko", "name": "Korean"},
    {"code": "zh", "name": "Chinese (Simplified)"},
    {"code": "ru", "name": "Russian"},
    {"code": "ar", "name": "Arabic"}
  ]
}
```

---

#### Translate Report

Translate a report to another language.

```http
POST /api/translate/{report_id}
```

**Request Body:**

```json
{
  "target_language": "es",
  "sections": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_language` | string | Yes | Language code (e.g., `es`, `fr`, `de`) |
| `sections` | array | No | Specific sections to translate (empty = all) |

**Example Response:**

```json
{
  "report_id": 42,
  "original_title": "Building Better Habits",
  "translated_title": "Construyendo Mejores Hábitos",
  "translated_content": "# Construyendo Mejores Hábitos\n\n**Fuente**: https://...\n...",
  "target_language": "es",
  "language_name": "Spanish"
}
```

---

### Recommendations

#### Get Recommendations

Get personalized content recommendations.

```http
GET /api/recommendations
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Maximum recommendations |

**Example Response:**

```json
{
  "recommendations": [
    {
      "id": 42,
      "title": "Advanced Python Techniques",
      "content_type": "youtube",
      "source_url": "https://...",
      "reason": "Explore more youtube content",
      "score": 0.85
    },
    {
      "id": 43,
      "title": "ML Fundamentals Review",
      "content_type": "paper",
      "source_url": "https://...",
      "reason": "Revisit older content",
      "score": 0.72
    }
  ],
  "message": null
}
```

---

#### Get Similar Reports

Find reports similar to a given report.

```http
GET /api/recommendations/similar/{report_id}
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 5 | Maximum results |

**Example Response:**

```json
{
  "similar": [
    {"id": 43, "title": "Related Topic", "content_type": "article", "source_url": null, "reason": "Similar content", "score": 0.78}
  ]
}
```

---

#### Get Trending Topics

Get trending topics from recent content.

```http
GET /api/recommendations/trending
```

**Example Response:**

```json
{
  "trending": [
    {"topic": "machine", "count": 12},
    {"topic": "learning", "count": 10},
    {"topic": "python", "count": 8},
    {"topic": "productivity", "count": 6}
  ]
}
```

---

### System

#### Health Check

Check if the API is running.

```http
GET /api/health
```

**Example Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

#### Sync Database

Re-sync the database with the filesystem.

```http
POST /api/sync
```

**Example Response:**

```json
{
  "synced": true,
  "reports_added": 3,
  "reports_removed": 0
}
```

---

#### Get Models

List available AI models and their costs.

```http
GET /api/models
```

**Example Response:**

```json
{
  "models": [
    {
      "key": "haiku",
      "id": "claude-3-5-haiku-latest",
      "name": "Claude 3.5 Haiku",
      "input_cost": 0.80,
      "output_cost": 4.00
    },
    {
      "key": "sonnet",
      "id": "claude-sonnet-4-20250514",
      "name": "Claude Sonnet 4",
      "input_cost": 3.00,
      "output_cost": 15.00
    },
    {
      "key": "opus",
      "id": "claude-opus-4-20250514",
      "name": "Claude Opus 4",
      "input_cost": 15.00,
      "output_cost": 75.00
    }
  ],
  "default": "sonnet"
}
```

---

## WebSocket Events

The API supports WebSocket connections for real-time job status updates.

### Connect

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/jobs/{job_id}');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Status:', data.status);
  console.log('Progress:', data.progress_message);
};
```

### Event Types

| Event | Description |
|-------|-------------|
| `status_update` | Job status changed |
| `progress` | Progress message updated |
| `completed` | Job finished successfully |
| `failed` | Job failed with error |

---

## Examples

### Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Submit YouTube video
response = requests.post(f"{BASE_URL}/api/analysis/youtube", json={
    "url": "https://youtube.com/watch?v=abc123",
    "model": "sonnet"
})
job_id = response.json()["job_id"]

# Poll for completion
import time
while True:
    status = requests.get(f"{BASE_URL}/api/analysis/jobs/{job_id}").json()
    if status["status"] in ["completed", "failed"]:
        break
    time.sleep(2)

print(f"Report saved to: {status.get('result_filepath')}")
```

### JavaScript

```javascript
const BASE_URL = 'http://localhost:8000';

// Submit article for analysis
async function analyzeArticle(url) {
  const response = await fetch(`${BASE_URL}/api/analysis/article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, model: 'sonnet' })
  });
  return response.json();
}

// Get all reports
async function getReports(page = 1, type = null) {
  const params = new URLSearchParams({ page: String(page) });
  if (type) params.set('type', type);

  const response = await fetch(`${BASE_URL}/api/reports?${params}`);
  return response.json();
}
```

### cURL

```bash
# Analyze a YouTube video
curl -X POST http://localhost:8000/api/analysis/youtube \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=abc123"}'

# Search reports
curl "http://localhost:8000/api/reports/search?q=machine+learning"

# Subscribe to RSS feed
curl -X POST http://localhost:8000/api/rss \
  -H "Content-Type: application/json" \
  -d '{"url": "https://blog.example.com/feed.xml", "content_type": "article"}'

# Export to Obsidian
curl -X POST http://localhost:8000/api/export/obsidian \
  -H "Content-Type: application/json" \
  -d '{"include_tags": true}'
```

---

## Rate Limits

The API does not enforce rate limits by default. However, the Anthropic API has its own rate limits:

| Tier | Requests/min | Tokens/min |
|------|-------------|------------|
| Free | 50 | 40,000 |
| Build | 1,000 | 80,000 |
| Scale | 4,000 | 400,000 |

Consider implementing local caching to reduce API calls.

---

## Changelog

### Version 1.1.0 (2025-12-26)

**New Features:**
- Knowledge Graph API - Concept extraction and visualization
- Q&A System API - Natural language questions across knowledge base
- Comparison API - Side-by-side report analysis
- Text-to-Speech API - Audio generation with OpenAI TTS
- Spaced Repetition API - SM-2 algorithm for review scheduling
- Credibility Analysis API - Source trustworthiness scoring
- Learning Goals API - Progress tracking and goal management
- Translation API - Multi-language report translation
- Recommendations API - Personalized content suggestions

### Version 1.0.0 (2025-12-25)

- Initial API release
- Core endpoints for reports, analysis, logs
- Batch processing support
- Tags and collections
- RSS feed management
- Export to Obsidian/Notion
- Anki flashcard generation
- Audio transcription with Whisper

---

*API Reference - Last updated: 2025-12-26*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
