# Anthropic Claude API Guide

This guide explains the Anthropic API for developers who haven't worked with AI/LLM APIs before. We'll cover how to send messages to Claude and handle responses.

---

## Table of Contents

1. [What is the Anthropic API?](#what-is-the-anthropic-api)
2. [Getting Started](#getting-started)
3. [Your First API Call](#your-first-api-call)
4. [Understanding the Request](#understanding-the-request)
5. [Understanding the Response](#understanding-the-response)
6. [Using the Python SDK](#using-the-python-sdk)
7. [Messages API Structure](#messages-api-structure)
8. [System Prompts](#system-prompts)
9. [Controlling Output](#controlling-output)
10. [Streaming Responses](#streaming-responses)
11. [Handling Errors](#handling-errors)
12. [Token Counting and Limits](#token-counting-and-limits)
13. [Model Selection](#model-selection)
14. [Best Practices](#best-practices)
15. [This Project's Usage](#this-projects-usage)
16. [Practice Exercises](#practice-exercises)

---

## What is the Anthropic API?

The Anthropic API lets you programmatically interact with Claude, an AI assistant. You send text, Claude responds with generated text.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   "Summarize this article: [content...]"                        │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Anthropic API                              │
│                    api.anthropic.com                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Claude processes your request and generates a response        │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   "Here's a summary of the article: [summary...]"              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Term | Meaning |
|------|---------|
| **API Key** | Secret key to authenticate your requests |
| **Message** | A piece of text (from you or Claude) |
| **Prompt** | Your input message(s) to Claude |
| **Completion** | Claude's generated response |
| **Token** | Unit of text (roughly 4 characters) |
| **Model** | Which version of Claude to use |

---

## Getting Started

### 1. Get an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Go to API Keys
4. Create a new key
5. Copy the key (starts with `sk-ant-...`)

### 2. Store the Key Safely

```bash
# Add to .env file (NEVER commit this!)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Add `.env` to `.gitignore`:
```
.env
.env.local
```

### 3. Install the SDK

```bash
pip install anthropic
```

---

## Your First API Call

### Using cURL

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

### Using Python

```python
import anthropic
import os

# Create client (reads ANTHROPIC_API_KEY from environment)
client = anthropic.Anthropic()

# Send a message
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

# Print the response
print(message.content[0].text)
```

---

## Understanding the Request

### Request Structure

```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",    # Which Claude model
    max_tokens=1024,                      # Maximum response length
    messages=[                            # Conversation history
        {"role": "user", "content": "Hello!"}
    ]
)
```

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model ID (e.g., "claude-sonnet-4-20250514") |
| `max_tokens` | integer | Maximum tokens in response |
| `messages` | array | List of message objects |

### Message Object

```python
{
    "role": "user",      # "user" or "assistant"
    "content": "Hello!"  # The message text
}
```

- **user**: Your messages to Claude
- **assistant**: Claude's previous responses (for multi-turn)

---

## Understanding the Response

### Response Structure

```python
Message(
    id='msg_01XFDUDYJgAACzvnptvVoYEL',
    type='message',
    role='assistant',
    content=[
        TextBlock(text='Hello! How can I help you today?', type='text')
    ],
    model='claude-sonnet-4-20250514',
    stop_reason='end_turn',
    stop_sequence=None,
    usage=Usage(input_tokens=10, output_tokens=12)
)
```

### Key Fields

| Field | Description |
|-------|-------------|
| `content` | Array of content blocks (usually one TextBlock) |
| `content[0].text` | The actual response text |
| `stop_reason` | Why generation stopped ("end_turn", "max_tokens") |
| `usage.input_tokens` | Tokens in your input |
| `usage.output_tokens` | Tokens in Claude's response |

### Extracting the Text

```python
response = client.messages.create(...)

# Get the text content
response_text = response.content[0].text
print(response_text)

# Check token usage
print(f"Input: {response.usage.input_tokens} tokens")
print(f"Output: {response.usage.output_tokens} tokens")
```

---

## Using the Python SDK

### Installation

```bash
pip install anthropic
```

### Client Initialization

```python
import anthropic

# Option 1: From environment variable (recommended)
# Reads ANTHROPIC_API_KEY automatically
client = anthropic.Anthropic()

# Option 2: Explicit key (not recommended for production)
client = anthropic.Anthropic(api_key="sk-ant-...")

# Option 3: From config file
import os
from dotenv import load_dotenv

load_dotenv()  # Loads .env file
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
```

### Async Client

```python
import anthropic
import asyncio

async def main():
    client = anthropic.AsyncAnthropic()

    message = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello!"}]
    )

    print(message.content[0].text)

asyncio.run(main())
```

---

## Messages API Structure

### Single Turn (Simple Question)

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What is Python?"}
    ]
)
```

### Multi-Turn (Conversation)

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What is Python?"},
        {"role": "assistant", "content": "Python is a high-level programming language..."},
        {"role": "user", "content": "What are its main uses?"}
    ]
)
```

### Building a Conversation

```python
conversation = []

# First turn
conversation.append({"role": "user", "content": "What is Python?"})
response1 = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=conversation
)
conversation.append({"role": "assistant", "content": response1.content[0].text})

# Second turn
conversation.append({"role": "user", "content": "What are its main uses?"})
response2 = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=conversation
)
```

---

## System Prompts

System prompts set Claude's behavior and context:

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a helpful assistant that analyzes video transcripts. \
            Always provide structured summaries with key takeaways.",
    messages=[
        {"role": "user", "content": "Analyze this transcript: [content...]"}
    ]
)
```

### Use Cases for System Prompts

```python
# Expert persona
system = "You are an expert data scientist with 20 years of experience."

# Output format
system = "Always respond in JSON format with keys: summary, key_points, action_items"

# Constraints
system = "Keep all responses under 100 words. Be concise and direct."

# Context
system = """You are analyzing content for a personal knowledge base.
Extract: main ideas, supporting details, quotes, and actionable insights.
Format: Use markdown with headers and bullet points."""
```

### This Project's System Prompt Pattern

```python
# Load prompt template from file
with open("prompts/yt.md", "r") as f:
    prompt_template = f.read()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    system=prompt_template,
    messages=[
        {"role": "user", "content": f"Analyze this transcript:\n\n{transcript}"}
    ]
)
```

---

## Controlling Output

### max_tokens

Limits response length:

```python
# Short response
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=100,  # ~75 words
    messages=[{"role": "user", "content": "Explain quantum computing"}]
)

# Long response
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,  # ~3000 words
    messages=[{"role": "user", "content": "Write a detailed analysis..."}]
)
```

### temperature

Controls randomness (0.0 to 1.0):

```python
# Deterministic (same input → same output)
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.0,  # Most deterministic
    messages=[{"role": "user", "content": "..."}]
)

# Creative
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=1.0,  # More creative/random
    messages=[{"role": "user", "content": "..."}]
)
```

| Temperature | Use Case |
|-------------|----------|
| 0.0 | Code generation, factual answers |
| 0.3-0.5 | Analysis, summaries |
| 0.7-1.0 | Creative writing, brainstorming |

### stop_sequences

Stop generation at specific strings:

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    stop_sequences=["END", "---"],  # Stop when these appear
    messages=[{"role": "user", "content": "..."}]
)
```

---

## Streaming Responses

Get response in real-time as it's generated:

### Basic Streaming

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Tell me a story"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Async Streaming

```python
import anthropic
import asyncio

async def stream_response():
    client = anthropic.AsyncAnthropic()

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Tell me a story"}]
    ) as stream:
        async for text in stream.text_stream:
            print(text, end="", flush=True)

asyncio.run(stream_response())
```

### Getting Full Message After Stream

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="")

    # Get the complete message object
    final_message = stream.get_final_message()
    print(f"\n\nTokens used: {final_message.usage.output_tokens}")
```

---

## Handling Errors

### Common Errors

```python
import anthropic

try:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except anthropic.AuthenticationError:
    print("Invalid API key")
except anthropic.RateLimitError:
    print("Too many requests, slow down")
except anthropic.APIConnectionError:
    print("Network error, check connection")
except anthropic.BadRequestError as e:
    print(f"Invalid request: {e}")
except anthropic.APIError as e:
    print(f"API error: {e}")
```

### Error Types

| Error | Cause | Solution |
|-------|-------|----------|
| `AuthenticationError` | Invalid/missing API key | Check ANTHROPIC_API_KEY |
| `RateLimitError` | Too many requests | Add delays, use exponential backoff |
| `BadRequestError` | Invalid parameters | Check request format |
| `APIConnectionError` | Network issue | Check internet connection |
| `InternalServerError` | Anthropic issue | Retry after delay |

### Retry Logic

```python
import time
import anthropic

def call_with_retry(client, max_retries=3, **kwargs):
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 1, 2, 4 seconds
                print(f"Rate limited, waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
        except anthropic.APIConnectionError:
            if attempt < max_retries - 1:
                time.sleep(1)
            else:
                raise

response = call_with_retry(
    client,
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
)
```

---

## Token Counting and Limits

### What are Tokens?

Tokens are pieces of text, roughly 4 characters or 0.75 words:

```
"Hello, how are you?" ≈ 6 tokens
"The quick brown fox" ≈ 4 tokens
```

### Model Limits

| Model | Max Output Tokens | Context Window |
|-------|-------------------|----------------|
| claude-3-haiku-20240307 | 4,096 | 200,000 |
| claude-sonnet-4-20250514 | 8,192 | 200,000 |
| claude-opus-4-20250514 | 8,192 | 200,000 |

### Counting Tokens

```python
# After a response, check usage
response = client.messages.create(...)
print(f"Input tokens: {response.usage.input_tokens}")
print(f"Output tokens: {response.usage.output_tokens}")
print(f"Total: {response.usage.input_tokens + response.usage.output_tokens}")

# Estimate before calling (rough)
# ~4 characters per token
text = "Your long text here..."
estimated_tokens = len(text) // 4
```

### Handling Long Content

```python
def chunk_text(text, max_tokens=50000):
    """Split text into chunks that fit in context window."""
    # Rough estimate: 4 chars per token
    max_chars = max_tokens * 4
    chunks = []

    while text:
        chunk = text[:max_chars]
        # Try to break at paragraph
        if len(text) > max_chars:
            last_para = chunk.rfind('\n\n')
            if last_para > max_chars // 2:
                chunk = text[:last_para]

        chunks.append(chunk)
        text = text[len(chunk):]

    return chunks

# Process each chunk
for i, chunk in enumerate(chunks):
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": f"Summarize part {i+1}:\n\n{chunk}"}]
    )
```

---

## Model Selection

### Available Models

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| claude-3-haiku | Fastest | Lowest | Simple tasks, high volume |
| claude-sonnet-4 | Balanced | Medium | Most tasks (recommended) |
| claude-opus-4 | Slowest | Highest | Complex analysis, research |

### Choosing a Model

```python
# Simple task → Haiku
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=256,
    messages=[{"role": "user", "content": "Summarize in one sentence: ..."}]
)

# Normal task → Sonnet
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2048,
    messages=[{"role": "user", "content": "Analyze this article: ..."}]
)

# Complex task → Opus
response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=4096,
    messages=[{"role": "user", "content": "Provide deep analysis with insights: ..."}]
)
```

### Model Selection in This Project

```python
# config.py
MODEL_CONFIGS = {
    "haiku": {
        "model_id": "claude-3-haiku-20240307",
        "max_tokens": 4096,
        "description": "Fast, economical"
    },
    "sonnet": {
        "model_id": "claude-sonnet-4-20250514",
        "max_tokens": 8192,
        "description": "Balanced"
    },
    "opus": {
        "model_id": "claude-opus-4-20250514",
        "max_tokens": 8192,
        "description": "Most capable"
    }
}

def get_model_config(model_name: str):
    return MODEL_CONFIGS.get(model_name, MODEL_CONFIGS["sonnet"])
```

---

## Best Practices

### 1. Structure Your Prompts

```python
# Bad
messages=[{"role": "user", "content": "summarize this " + content}]

# Good
messages=[{
    "role": "user",
    "content": f"""Please analyze the following content and provide:
1. A brief summary (2-3 sentences)
2. Key points (bullet list)
3. Action items if any

Content:
{content}"""
}]
```

### 2. Use System Prompts for Consistent Behavior

```python
# Set expectations in system prompt
system = """You are a content analyst. For every piece of content:
- Extract the main thesis
- List supporting arguments
- Note any biases or assumptions
- Suggest related topics to explore

Always use markdown formatting."""
```

### 3. Handle Long Content Gracefully

```python
MAX_CONTENT_LENGTH = 100000  # characters

def prepare_content(content):
    if len(content) > MAX_CONTENT_LENGTH:
        # Truncate with notice
        truncated = content[:MAX_CONTENT_LENGTH]
        return truncated + "\n\n[Content truncated due to length]"
    return content
```

### 4. Log Usage for Monitoring

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze(content):
    response = client.messages.create(...)

    logger.info(
        f"API call: model={response.model}, "
        f"input_tokens={response.usage.input_tokens}, "
        f"output_tokens={response.usage.output_tokens}"
    )

    return response.content[0].text
```

### 5. Cache Results When Appropriate

```python
import hashlib
import json
from pathlib import Path

CACHE_DIR = Path("cache")
CACHE_DIR.mkdir(exist_ok=True)

def get_cached_or_call(prompt, **kwargs):
    # Create cache key from prompt
    cache_key = hashlib.md5(prompt.encode()).hexdigest()
    cache_file = CACHE_DIR / f"{cache_key}.json"

    if cache_file.exists():
        with open(cache_file) as f:
            return json.load(f)

    # Not cached, make API call
    response = client.messages.create(
        messages=[{"role": "user", "content": prompt}],
        **kwargs
    )
    result = response.content[0].text

    # Cache the result
    with open(cache_file, "w") as f:
        json.dump(result, f)

    return result
```

---

## This Project's Usage

### Analysis Flow

```python
# services/analyzer.py (simplified)
import anthropic
from pathlib import Path

async def analyze_content(content: str, content_type: str, model: str = "sonnet"):
    """Analyze content using Claude."""

    # Load the appropriate prompt template
    prompt_file = Path("prompts") / f"{content_type}.md"
    if not prompt_file.exists():
        prompt_file = Path("prompts/default.md")

    with open(prompt_file) as f:
        system_prompt = f.read()

    # Get model configuration
    model_config = get_model_config(model)

    # Create Anthropic client
    client = anthropic.Anthropic()

    # Call the API
    response = client.messages.create(
        model=model_config["model_id"],
        max_tokens=model_config["max_tokens"],
        system=system_prompt,
        messages=[
            {"role": "user", "content": f"Analyze this content:\n\n{content}"}
        ]
    )

    return response.content[0].text
```

### Job Processing

```python
async def process_analysis_job(job_id: str, url: str, content_type: str, model: str):
    """Background job to process analysis."""
    try:
        # Update status
        jobs[job_id]["status"] = "fetching"

        # Fetch content
        content = await fetch_content(url)
        jobs[job_id]["status"] = "analyzing"

        # Analyze with Claude
        result = await analyze_content(content, content_type, model)
        jobs[job_id]["status"] = "saving"

        # Save report
        filepath = save_report(result, url, content_type)

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result_filepath"] = filepath

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
```

---

## Practice Exercises

### Exercise 1: Basic API Call

Write a script that:
1. Takes user input from command line
2. Sends it to Claude
3. Prints the response

### Exercise 2: Conversation Bot

Create a simple chat loop that:
1. Maintains conversation history
2. Allows multi-turn conversation
3. Exits on "quit"

### Exercise 3: Content Summarizer

Build a function that:
1. Takes a URL or text file
2. Sends content to Claude with a summarization prompt
3. Returns a structured summary (JSON)

### Exercise 4: Streaming Response

Modify Exercise 1 to:
1. Use streaming
2. Print response as it arrives
3. Show final token count

### Exercise 5: Error Handling

Create a robust API caller that:
1. Retries on rate limit
2. Handles network errors
3. Logs all API calls and errors

---

## Summary

| Concept | What It Does |
|---------|-------------|
| `anthropic.Anthropic()` | Creates API client |
| `client.messages.create()` | Sends message to Claude |
| `model` | Which Claude version to use |
| `max_tokens` | Maximum response length |
| `system` | Sets Claude's behavior |
| `messages` | Conversation history |
| `temperature` | Controls randomness |
| `stream()` | Real-time response |
| `response.content[0].text` | Get response text |
| `response.usage` | Token counts |

---

## Quick Reference

### Minimal API Call

```python
import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.content[0].text)
```

### With System Prompt

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a helpful assistant.",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Streaming

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="")
```

---

## What's Next?

Now that you understand the Anthropic API, you can:

1. Build your own AI-powered applications
2. Customize prompts for different use cases
3. Explore the [OPENAI_WHISPER_API.md](OPENAI_WHISPER_API.md) for audio transcription

---

*Anthropic Claude API Guide - Created 2025-12-25*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
