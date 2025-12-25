"""Content analysis service using Anthropic API."""

import re
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, AsyncGenerator

from anthropic import Anthropic

from config import (
    ANTHROPIC_API_KEY,
    MODELS,
    DEFAULT_MODEL,
    PROMPTS_DIR,
    REPORTS_DIR,
    LOGS_DIR,
    CONTENT_TYPES,
)
from database import update_job_status, update_job_progress
from services.indexer import run_initial_index

logger = logging.getLogger(__name__)


def get_client() -> Anthropic:
    """Get Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set. Create web/backend/.env with your API key.")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


def load_prompt(content_type: str) -> str:
    """Load analysis prompt for content type."""
    prompt_map = {
        "youtube": "yt.md",
        "article": "article.md",
        "arxiv": "paper.md",
        "paper": "paper.md",
        "other": "default.md",
    }

    filename = prompt_map.get(content_type, "default.md")
    prompt_path = PROMPTS_DIR / filename

    if not prompt_path.exists():
        # Fall back to default
        prompt_path = PROMPTS_DIR / "default.md"
        if not prompt_path.exists():
            raise FileNotFoundError(f"No prompt file found for {content_type}")

    return prompt_path.read_text(encoding="utf-8")


def sanitize_filename(title: str, max_length: int = 50) -> str:
    """Convert title to safe filename."""
    # Lowercase
    name = title.lower()
    # Replace spaces with hyphens
    name = name.replace(" ", "-")
    # Remove special characters
    name = re.sub(r"[^a-z0-9\-]", "", name)
    # Remove multiple hyphens
    name = re.sub(r"-+", "-", name)
    # Trim hyphens from ends
    name = name.strip("-")
    # Truncate
    if len(name) > max_length:
        name = name[:max_length].rstrip("-")
    return name or "untitled"


def get_report_path(content_type: str, title: str) -> Path:
    """Generate report file path."""
    today = datetime.now().strftime("%Y-%m-%d")
    safe_title = sanitize_filename(title)
    filename = f"{today}_{safe_title}.md"

    # Get category directory
    category_dir = CONTENT_TYPES.get(content_type, CONTENT_TYPES["other"])
    category_dir.mkdir(parents=True, exist_ok=True)

    return category_dir / filename


def format_report(
    title: str,
    source: str,
    content_type: str,
    analysis: str
) -> str:
    """Format the complete report with header."""
    today = datetime.now().strftime("%Y-%m-%d")

    type_names = {
        "youtube": "YouTube Video",
        "article": "Article",
        "arxiv": "Research Paper",
        "paper": "Research Paper",
        "other": "Content",
    }
    type_name = type_names.get(content_type, "Content")

    return f"""# {title}

**Source**: {source}
**Date**: {today}
**Type**: {type_name}

---

{analysis}

---

## My Notes

"""


def update_activity_log(title: str, report_path: Path, content_type: str) -> None:
    """Add entry to today's activity log."""
    today = datetime.now().strftime("%Y-%m-%d")
    now = datetime.now().strftime("%H:%M")
    log_path = LOGS_DIR / f"{today}.md"

    # Ensure logs directory exists
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    # Section headers by content type
    section_map = {
        "youtube": "## Videos Watched",
        "article": "## Articles Read",
        "arxiv": "## Papers Reviewed",
        "paper": "## Papers Reviewed",
        "other": "## Other Content",
    }
    section = section_map.get(content_type, "## Other Content")

    # Create relative path from logs to reports
    rel_path = f"../reports/{report_path.parent.name}/{report_path.name}"
    entry = f"- [{title}]({rel_path}) - {now}\n"

    if log_path.exists():
        content = log_path.read_text(encoding="utf-8")

        if section in content:
            # Add under existing section
            content = content.replace(section, f"{section}\n{entry}", 1)
        else:
            # Add new section at end
            content = content.rstrip() + f"\n\n{section}\n{entry}"

        log_path.write_text(content, encoding="utf-8")
    else:
        # Create new log file
        log_content = f"# Activity Log - {today}\n\n{section}\n{entry}"
        log_path.write_text(log_content, encoding="utf-8")

    logger.info(f"Updated activity log: {log_path}")


async def analyze_content(
    content: str,
    title: str,
    source: str,
    content_type: str,
    model_key: str,
    job_id: str,
) -> AsyncGenerator[str, None]:
    """
    Analyze content using Anthropic API and save report.

    Yields progress messages for SSE streaming.
    """
    try:
        # Validate model
        if model_key not in MODELS:
            model_key = DEFAULT_MODEL
        model_info = MODELS[model_key]
        model_id = model_info["id"]

        yield f"Using model: {model_info['name']}"
        await update_job_progress(job_id, f"Using model: {model_info['name']}")

        # Load prompt
        yield f"Loading {content_type} analysis prompt..."
        await update_job_progress(job_id, "Loading prompt...")
        prompt = load_prompt(content_type)

        # Call Anthropic API
        yield "Analyzing content with Claude..."
        await update_job_progress(job_id, "Analyzing with Claude...")

        client = get_client()

        # Combine prompt and content
        full_prompt = f"{prompt}\n\n---\n\nContent to analyze:\n\n{content}"

        response = client.messages.create(
            model=model_id,
            max_tokens=8192,
            messages=[{"role": "user", "content": full_prompt}]
        )

        analysis = response.content[0].text
        yield "Analysis complete!"

        # Calculate approximate cost
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        input_cost = (input_tokens / 1_000_000) * model_info["input_cost"]
        output_cost = (output_tokens / 1_000_000) * model_info["output_cost"]
        total_cost = input_cost + output_cost

        yield f"Tokens: {input_tokens} in, {output_tokens} out (${total_cost:.4f})"
        await update_job_progress(job_id, f"Tokens: {input_tokens}+{output_tokens}")

        # Format and save report
        yield "Saving report..."
        await update_job_progress(job_id, "Saving report...")

        report = format_report(title, source, content_type, analysis)
        report_path = get_report_path(content_type, title)
        report_path.write_text(report, encoding="utf-8")

        yield f"Report saved: {report_path.name}"

        # Update activity log
        yield "Updating activity log..."
        update_activity_log(title, report_path, content_type)

        # Re-index database to include new report
        yield "Updating database index..."
        await run_initial_index()

        # Mark job as completed
        rel_path = str(report_path.relative_to(report_path.parent.parent.parent))
        await update_job_status(job_id, "completed", result_filepath=rel_path)

        yield f"[COMPLETED] Analysis saved to {report_path.name}"

    except ValueError as e:
        error_msg = str(e)
        await update_job_status(job_id, "failed", error_message=error_msg)
        yield f"[FAILED] {error_msg}"

    except Exception as e:
        error_msg = f"Analysis error: {str(e)}"
        logger.exception("Analysis failed")
        await update_job_status(job_id, "failed", error_message=error_msg)
        yield f"[FAILED] {error_msg}"


async def run_full_analysis(
    url: str,
    content_type: str,
    model_key: str,
    job_id: str,
) -> AsyncGenerator[str, None]:
    """
    Run complete analysis pipeline: fetch content, analyze, save.

    Yields progress messages for SSE streaming.
    """
    from services.content_fetcher import fetch_content

    try:
        await update_job_status(job_id, "running")

        # Fetch content
        yield f"Fetching {content_type} content..."
        await update_job_progress(job_id, f"Fetching {content_type}...")

        content, title, source = await fetch_content(url, content_type)
        yield f"Fetched: {title}"
        yield f"Content length: {len(content)} characters"

        # Run analysis
        async for message in analyze_content(
            content=content,
            title=title,
            source=source,
            content_type=content_type,
            model_key=model_key,
            job_id=job_id,
        ):
            yield message

    except Exception as e:
        error_msg = f"Error: {str(e)}"
        logger.exception("Full analysis failed")
        await update_job_status(job_id, "failed", error_message=error_msg)
        yield f"[FAILED] {error_msg}"
