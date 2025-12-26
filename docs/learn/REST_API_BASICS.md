# REST API Basics

This guide explains REST APIs for developers who haven't worked with web applications before. We'll cover what REST is, how HTTP works, and how the frontend and backend communicate.

---

## Table of Contents

1. [What is an API?](#what-is-an-api)
2. [What is REST?](#what-is-rest)
3. [HTTP Fundamentals](#http-fundamentals)
4. [HTTP Methods](#http-methods)
5. [URLs and Endpoints](#urls-and-endpoints)
6. [Request and Response](#request-and-response)
7. [JSON Data Format](#json-data-format)
8. [Status Codes](#status-codes)
9. [Headers](#headers)
10. [Query Parameters](#query-parameters)
11. [Request Body](#request-body)
12. [Authentication](#authentication)
13. [Testing APIs](#testing-apis)
14. [Common Patterns](#common-patterns)
15. [Practice Exercises](#practice-exercises)

---

## What is an API?

**API** stands for **Application Programming Interface**. It's a way for programs to talk to each other.

### Analogy: Restaurant

Think of a restaurant:
- You (the **client**) want food
- The kitchen (the **server**) makes food
- The waiter (the **API**) takes your order and brings your food

You don't need to know how to cook. You just tell the waiter what you want.

### In Programming

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   Frontend  │  ──────▶ │     API     │  ──────▶ │   Backend   │
│  (Browser)  │  request │             │  process │  (Server)   │
│             │  ◀────── │             │  ◀────── │             │
│             │  response│             │  result  │             │
└─────────────┘          └─────────────┘          └─────────────┘
```

The frontend says: "Give me all reports"
The backend processes and returns: "[report1, report2, report3]"

---

## What is REST?

**REST** stands for **REpresentational State Transfer**. It's a set of rules for building APIs.

### REST Principles

1. **Client-Server**: Frontend and backend are separate
2. **Stateless**: Each request is independent (no memory between requests)
3. **Uniform Interface**: Consistent URLs and methods
4. **Resource-Based**: Everything is a "resource" (user, report, order)

### RESTful URL Examples

```
GET  /api/users          ← Get all users
GET  /api/users/123      ← Get user with ID 123
POST /api/users          ← Create a new user
PUT  /api/users/123      ← Update user 123
DELETE /api/users/123    ← Delete user 123
```

---

## HTTP Fundamentals

HTTP (**HyperText Transfer Protocol**) is the language browsers and servers use to communicate.

### How HTTP Works

```
┌────────────────────────────────────────────────────────────────┐
│                        HTTP Request                            │
├────────────────────────────────────────────────────────────────┤
│  GET /api/reports HTTP/1.1                                     │
│  Host: localhost:8000                                          │
│  Accept: application/json                                      │
│  Authorization: Bearer token123                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        HTTP Response                           │
├────────────────────────────────────────────────────────────────┤
│  HTTP/1.1 200 OK                                               │
│  Content-Type: application/json                                │
│                                                                │
│  {"reports": [...], "total": 42}                               │
└────────────────────────────────────────────────────────────────┘
```

---

## HTTP Methods

HTTP methods tell the server what action to perform:

| Method | Purpose | Example | Has Body |
|--------|---------|---------|----------|
| `GET` | Read/fetch data | Get all reports | No |
| `POST` | Create new data | Submit new analysis | Yes |
| `PUT` | Update (replace) | Update entire report | Yes |
| `PATCH` | Update (partial) | Update report title | Yes |
| `DELETE` | Remove data | Delete a report | Usually no |

### CRUD Mapping

| CRUD Operation | HTTP Method |
|----------------|-------------|
| **C**reate | POST |
| **R**ead | GET |
| **U**pdate | PUT / PATCH |
| **D**elete | DELETE |

### In This Project

```
GET    /api/reports          ← Read all reports
GET    /api/reports/42       ← Read one report
POST   /api/analysis/youtube ← Create new analysis
DELETE /api/reports/42       ← Delete a report
```

---

## URLs and Endpoints

### URL Structure

```
https://api.example.com:8000/api/reports?page=1&type=youtube#section
└──┬──┘ └──────┬──────┘└─┬─┘└────┬────┘└─────────┬─────────┘└──┬───┘
 scheme      host      port    path          query          fragment
```

### Endpoints in This Project

An **endpoint** is a specific URL the API responds to:

```
Base URL: http://localhost:8000

Endpoints:
├── /api/reports           ← Report operations
│   ├── GET  /             ← List all
│   ├── GET  /{id}         ← Get one
│   ├── DELETE /{id}       ← Delete one
│   └── GET  /search       ← Search
│
├── /api/analysis          ← Analysis operations
│   ├── POST /youtube      ← Analyze YouTube
│   ├── POST /article      ← Analyze article
│   ├── POST /arxiv        ← Analyze paper
│   └── GET  /jobs/{id}    ← Check job status
│
├── /api/logs              ← Activity logs
│   └── GET  /today        ← Get today's log
│
└── /api/health            ← Health check
    └── GET  /             ← Is server running?
```

---

## Request and Response

### Anatomy of a Request

```
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/analysis/youtube HTTP/1.1                             │ ← Request line
├─────────────────────────────────────────────────────────────────┤
│ Host: localhost:8000                                            │
│ Content-Type: application/json                                  │ ← Headers
│ Accept: application/json                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ {                                                               │
│   "url": "https://youtube.com/watch?v=abc123",                  │ ← Body
│   "model": "sonnet"                                             │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Anatomy of a Response

```
┌─────────────────────────────────────────────────────────────────┐
│ HTTP/1.1 201 Created                                            │ ← Status line
├─────────────────────────────────────────────────────────────────┤
│ Content-Type: application/json                                  │
│ Content-Length: 89                                              │ ← Headers
│ Date: Mon, 25 Dec 2024 10:30:00 GMT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ {                                                               │
│   "job_id": "550e8400-e29b-41d4-a716-446655440000",             │ ← Body
│   "status": "pending"                                           │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## JSON Data Format

**JSON** (JavaScript Object Notation) is the standard format for API data.

### JSON Syntax

```json
{
    "name": "Alice",
    "age": 30,
    "isActive": true,
    "email": null,
    "hobbies": ["reading", "gaming"],
    "address": {
        "city": "NYC",
        "zip": "10001"
    }
}
```

### JSON Rules

1. Keys must be strings in double quotes
2. Values can be: string, number, boolean, null, array, object
3. No trailing commas
4. No comments

### JSON vs JavaScript Objects

```javascript
// JavaScript object (relaxed)
const obj = {
    name: 'Alice',  // Single quotes OK
    age: 30,        // No quotes on key OK
};

// JSON (strict)
{
    "name": "Alice",
    "age": 30
}
```

### Working with JSON in JavaScript

```javascript
// Object to JSON string
const obj = { name: "Alice", age: 30 };
const jsonString = JSON.stringify(obj);
// '{"name":"Alice","age":30}'

// JSON string to object
const parsed = JSON.parse(jsonString);
// { name: "Alice", age: 30 }
```

### Working with JSON in Python

```python
import json

# Dict to JSON string
data = {"name": "Alice", "age": 30}
json_string = json.dumps(data)
# '{"name": "Alice", "age": 30}'

# JSON string to dict
parsed = json.loads(json_string)
# {'name': 'Alice', 'age': 30}
```

---

## Status Codes

HTTP status codes tell you what happened:

### Success (2xx)

| Code | Name | Meaning |
|------|------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | New resource created |
| 204 | No Content | Success, no response body |

### Client Errors (4xx)

| Code | Name | Meaning |
|------|------|---------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Not allowed to access |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |

### Server Errors (5xx)

| Code | Name | Meaning |
|------|------|---------|
| 500 | Internal Server Error | Server crashed |
| 502 | Bad Gateway | Server got bad response |
| 503 | Service Unavailable | Server overloaded |

### Memory Aid

- **2xx**: It worked!
- **4xx**: You (client) messed up
- **5xx**: Server messed up

---

## Headers

Headers are metadata about the request/response.

### Common Request Headers

```
Host: localhost:8000              ← Server address
Content-Type: application/json    ← Format of request body
Accept: application/json          ← Desired response format
Authorization: Bearer token123    ← Authentication
User-Agent: Mozilla/5.0...        ← Client identifier
```

### Common Response Headers

```
Content-Type: application/json    ← Format of response body
Content-Length: 1234              ← Size in bytes
Cache-Control: max-age=3600       ← Caching instructions
Set-Cookie: session=abc123        ← Set browser cookie
```

### Setting Headers in JavaScript

```javascript
const response = await fetch('/api/reports', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mytoken123'
    },
    body: JSON.stringify({ title: 'New Report' })
});
```

---

## Query Parameters

Query parameters filter or modify GET requests.

### URL with Query Parameters

```
/api/reports?page=2&type=youtube&search=habits
            └───────────┬───────────────────┘
                  Query string

Parameters:
├── page = 2
├── type = youtube
└── search = habits
```

### Building URLs in JavaScript

```javascript
// Manual
const url = `/api/reports?page=${page}&type=${type}`;

// Using URLSearchParams (safer)
const params = new URLSearchParams({
    page: 2,
    type: 'youtube',
    search: 'habits'
});
const url = `/api/reports?${params}`;
// '/api/reports?page=2&type=youtube&search=habits'
```

### Handling in FastAPI (Backend)

```python
@router.get("/reports")
async def get_reports(
    page: int = 1,
    type: str = None,
    search: str = None
):
    # page, type, search are extracted from query parameters
    ...
```

---

## Request Body

POST, PUT, and PATCH requests send data in the body.

### Sending JSON Body

```javascript
const response = await fetch('/api/analysis/youtube', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://youtube.com/watch?v=abc123',
        model: 'sonnet'
    })
});
```

### Receiving in FastAPI

```python
from pydantic import BaseModel

class AnalysisRequest(BaseModel):
    url: str
    model: str = "sonnet"

@router.post("/youtube")
async def analyze_youtube(request: AnalysisRequest):
    # request.url and request.model are available
    ...
```

---

## Authentication

APIs often require authentication.

### Common Methods

#### 1. API Key (Header)

```
Authorization: Bearer sk-ant-api03-...
```

```javascript
fetch('/api/reports', {
    headers: {
        'Authorization': 'Bearer sk-ant-api03-...'
    }
});
```

#### 2. API Key (Query Parameter)

```
/api/reports?api_key=sk-ant-api03-...
```

#### 3. Basic Auth

```
Authorization: Basic base64(username:password)
```

#### 4. OAuth / JWT

More complex; involves login flow and tokens.

### In This Project

The Anthropic API key is stored on the server:

```python
# .env file
ANTHROPIC_API_KEY=sk-ant-api03-...

# Python code
import os
api_key = os.getenv("ANTHROPIC_API_KEY")
```

The frontend doesn't need to send the key - the backend handles it.

---

## Testing APIs

### Using cURL (Command Line)

```bash
# GET request
curl http://localhost:8000/api/reports

# GET with query params
curl "http://localhost:8000/api/reports?page=1&type=youtube"

# POST with JSON body
curl -X POST http://localhost:8000/api/analysis/youtube \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=abc"}'

# DELETE
curl -X DELETE http://localhost:8000/api/reports/42
```

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Click a request to see details

### Using Swagger UI

FastAPI generates interactive docs:

1. Start the backend
2. Open http://localhost:8000/docs
3. Try out endpoints directly!

---

## Common Patterns

### Pattern 1: List with Pagination

**Request:**
```
GET /api/reports?page=2&page_size=20
```

**Response:**
```json
{
    "reports": [...],
    "total": 150,
    "page": 2,
    "page_size": 20
}
```

### Pattern 2: Create and Return ID

**Request:**
```
POST /api/analysis/youtube
{"url": "https://..."}
```

**Response (201 Created):**
```json
{
    "job_id": "abc-123",
    "status": "pending"
}
```

### Pattern 3: Get Single Item

**Request:**
```
GET /api/reports/42
```

**Response:**
```json
{
    "id": 42,
    "title": "Report Title",
    "content": "..."
}
```

### Pattern 4: Error Response

**Request:**
```
GET /api/reports/99999
```

**Response (404 Not Found):**
```json
{
    "detail": "Report not found"
}
```

### Pattern 5: Polling for Status

```javascript
async function waitForCompletion(jobId) {
    while (true) {
        const response = await fetch(`/api/analysis/jobs/${jobId}`);
        const data = await response.json();

        if (data.status === 'completed') {
            return data.result_filepath;
        }

        if (data.status === 'failed') {
            throw new Error(data.error_message);
        }

        // Wait 2 seconds before checking again
        await new Promise(r => setTimeout(r, 2000));
    }
}
```

---

## Practice Exercises

### Exercise 1: Decode the Request

What does this request do?

```
PUT /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name": "Bob", "age": 31}
```

### Exercise 2: Write the cURL

Write a cURL command to:
1. POST to `/api/reports`
2. With JSON body: `{"title": "My Report"}`
3. With header `Authorization: Bearer mytoken`

### Exercise 3: Design an API

Design REST endpoints for a todo list app with:
- List all todos
- Create a todo
- Mark a todo as complete
- Delete a todo

### Exercise 4: Parse the Response

Given this response, what's the total number of reports, and what page are we on?

```json
{
    "data": [
        {"id": 1, "title": "Report A"},
        {"id": 2, "title": "Report B"}
    ],
    "meta": {
        "total": 50,
        "page": 3,
        "per_page": 2
    }
}
```

---

## Summary

| Concept | What It Is |
|---------|-----------|
| API | Interface for programs to talk |
| REST | Rules for designing APIs |
| HTTP | Protocol for requests/responses |
| Endpoint | Specific URL that does something |
| GET/POST/PUT/DELETE | What action to take |
| JSON | Data format for request/response |
| Status Code | Success (2xx), client error (4xx), server error (5xx) |
| Headers | Metadata about the request/response |
| Query Params | Filters in the URL (?key=value) |
| Body | Data sent with POST/PUT |

---

## What's Next?

Now that you understand REST APIs, move on to:

1. **[ASYNC_PROGRAMMING.md](ASYNC_PROGRAMMING.md)** - Handle API calls properly
2. **[FASTAPI_GUIDE.md](FASTAPI_GUIDE.md)** - Build APIs with Python

---

*REST API Basics - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
