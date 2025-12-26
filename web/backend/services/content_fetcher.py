"""Content fetching service for YouTube, articles, and arXiv papers."""

import asyncio
import subprocess
import re
import logging
import os
from pathlib import Path
from typing import Optional, Tuple
import httpx

from config import INBOX_DIR, PROJECT_ROOT

logger = logging.getLogger(__name__)

# Check if audio transcription fallback is enabled
ENABLE_AUDIO_FALLBACK = os.getenv("ENABLE_AUDIO_FALLBACK", "true").lower() == "true"


def _run_ytdlp_sync(url: str) -> Tuple[int, str, str]:
    """Run yt-dlp synchronously (for use with asyncio.to_thread on Windows)."""
    result = subprocess.run(
        [
            "yt-dlp",
            "--write-auto-sub",
            "--write-sub",
            "--sub-lang", "en",
            "--skip-download",
            "--convert-subs", "srt",
            "-o", str(INBOX_DIR / "%(title)s"),
            url,
        ],
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
    )
    return result.returncode, result.stdout, result.stderr


async def fetch_youtube_transcript(url: str) -> Tuple[str, str, str]:
    """
    Fetch YouTube transcript using yt-dlp.

    Returns:
        Tuple of (transcript_text, video_title, source_url)

    Raises:
        Exception on failure with descriptive message
    """
    logger.info(f"Fetching YouTube transcript: {url}")

    # Ensure inbox directory exists
    INBOX_DIR.mkdir(parents=True, exist_ok=True)

    # Run yt-dlp in thread pool (Windows doesn't support asyncio subprocesses well)
    returncode, stdout, stderr = await asyncio.to_thread(_run_ytdlp_sync, url)

    if returncode != 0:
        if "yt-dlp" in stderr.lower() or "not found" in stderr.lower():
            raise Exception("yt-dlp not installed. Install with: pip install yt-dlp")
        elif "no subtitles" in stderr.lower() or "no caption" in stderr.lower():
            # Try audio transcription fallback
            if ENABLE_AUDIO_FALLBACK:
                logger.info("No captions available, attempting audio transcription fallback...")
                return await fetch_youtube_via_audio(url)
            raise Exception("No English captions available for this video")
        else:
            raise Exception(f"Failed to fetch transcript: {stderr[:200]}")

    # Find the downloaded SRT file
    srt_files = list(INBOX_DIR.glob("*.en.srt"))
    if not srt_files:
        # Try without language suffix
        srt_files = list(INBOX_DIR.glob("*.srt"))

    if not srt_files:
        raise Exception("No transcript file found after download")

    # Get the most recently modified file
    srt_file = max(srt_files, key=lambda f: f.stat().st_mtime)

    # Extract title from filename
    title = srt_file.stem
    if title.endswith(".en"):
        title = title[:-3]

    # Read and parse SRT content
    transcript_text = parse_srt_file(srt_file)

    logger.info(f"Fetched transcript: {title} ({len(transcript_text)} chars)")

    return transcript_text, title, url


def parse_srt_file(srt_path: Path) -> str:
    """Parse SRT file and extract plain text."""
    content = srt_path.read_text(encoding="utf-8", errors="replace")

    # Remove SRT formatting:
    # 1. Remove sequence numbers (lines with just digits)
    # 2. Remove timestamps (00:00:00,000 --> 00:00:00,000)
    # 3. Keep text lines

    lines = []
    for line in content.split("\n"):
        line = line.strip()
        # Skip empty lines
        if not line:
            continue
        # Skip sequence numbers
        if line.isdigit():
            continue
        # Skip timestamps
        if re.match(r"\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}", line):
            continue
        # Remove HTML-like tags
        line = re.sub(r"<[^>]+>", "", line)
        lines.append(line)

    return " ".join(lines)


async def fetch_article(url: str) -> Tuple[str, str, str]:
    """
    Fetch article content from a URL.

    Returns:
        Tuple of (article_text, title, source_url)
    """
    logger.info(f"Fetching article: {url}")

    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        response = await client.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        response.raise_for_status()
        html = response.text

    # Extract title from HTML
    title = extract_title(html)

    # Extract main content (simple extraction)
    content = extract_article_content(html)

    if not content or len(content) < 100:
        raise Exception("Could not extract article content. The page may require JavaScript.")

    logger.info(f"Fetched article: {title} ({len(content)} chars)")

    return content, title, url


def extract_title(html: str) -> str:
    """Extract title from HTML."""
    # Try <title> tag
    match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    if match:
        title = match.group(1).strip()
        # Clean up common suffixes
        for suffix in [" | ", " - ", " :: ", " // "]:
            if suffix in title:
                title = title.split(suffix)[0]
        return title

    # Try <h1> tag
    match = re.search(r"<h1[^>]*>([^<]+)</h1>", html, re.IGNORECASE)
    if match:
        return match.group(1).strip()

    return "Untitled Article"


def extract_article_content(html: str) -> str:
    """Extract main article content from HTML (simple heuristic)."""
    # Remove script and style tags
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<nav[^>]*>.*?</nav>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<header[^>]*>.*?</header>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<footer[^>]*>.*?</footer>", "", html, flags=re.DOTALL | re.IGNORECASE)

    # Try to find article or main content
    article_match = re.search(r"<article[^>]*>(.*?)</article>", html, flags=re.DOTALL | re.IGNORECASE)
    if article_match:
        html = article_match.group(1)
    else:
        main_match = re.search(r"<main[^>]*>(.*?)</main>", html, flags=re.DOTALL | re.IGNORECASE)
        if main_match:
            html = main_match.group(1)

    # Remove all HTML tags
    text = re.sub(r"<[^>]+>", " ", html)

    # Clean up whitespace
    text = re.sub(r"\s+", " ", text)
    text = text.strip()

    # Decode HTML entities
    text = text.replace("&nbsp;", " ")
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    text = text.replace("&quot;", '"')
    text = text.replace("&#39;", "'")

    return text


async def fetch_arxiv(url: str) -> Tuple[str, str, str]:
    """
    Fetch arXiv paper abstract and metadata.

    Returns:
        Tuple of (abstract_text, title, source_url)
    """
    logger.info(f"Fetching arXiv paper: {url}")

    # Extract arXiv ID from URL
    arxiv_id = extract_arxiv_id(url)
    if not arxiv_id:
        raise Exception(f"Could not extract arXiv ID from URL: {url}")

    # Use arXiv API
    api_url = f"http://export.arxiv.org/api/query?id_list={arxiv_id}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(api_url)
        response.raise_for_status()
        xml = response.text

    # Parse XML response
    title = extract_xml_field(xml, "title")
    abstract = extract_xml_field(xml, "summary")
    authors = extract_xml_authors(xml)

    if not title or not abstract:
        raise Exception("Could not parse arXiv metadata")

    # Format content for analysis
    content = f"""Title: {title}

Authors: {authors}

Abstract:
{abstract}

arXiv ID: {arxiv_id}
URL: {url}
"""

    logger.info(f"Fetched arXiv: {title[:50]}... ({len(content)} chars)")

    return content, title, url


def extract_arxiv_id(url: str) -> Optional[str]:
    """Extract arXiv ID from URL."""
    # Patterns: arxiv.org/abs/2401.12345, arxiv.org/pdf/2401.12345
    match = re.search(r"arxiv\.org/(?:abs|pdf)/(\d+\.\d+)", url)
    if match:
        return match.group(1)

    # Pattern: arxiv:2401.12345
    match = re.search(r"arxiv[:\s]+(\d+\.\d+)", url, re.IGNORECASE)
    if match:
        return match.group(1)

    return None


def extract_xml_field(xml: str, field: str) -> str:
    """Extract a field from arXiv XML."""
    match = re.search(f"<{field}[^>]*>([^<]+)</{field}>", xml, re.DOTALL)
    if match:
        text = match.group(1).strip()
        # Clean up whitespace
        text = re.sub(r"\s+", " ", text)
        return text
    return ""


def extract_xml_authors(xml: str) -> str:
    """Extract authors from arXiv XML."""
    authors = []
    for match in re.finditer(r"<author>.*?<name>([^<]+)</name>.*?</author>", xml, re.DOTALL):
        authors.append(match.group(1).strip())
    return ", ".join(authors) if authors else "Unknown"


async def fetch_youtube_via_audio(url: str) -> Tuple[str, str, str]:
    """
    Fetch YouTube transcript by downloading audio and transcribing with Whisper.

    This is a fallback for videos without captions.

    Returns:
        Tuple of (transcript_text, video_title, source_url)
    """
    # Import here to avoid circular dependency
    from services.transcription import transcribe_url, TranscriptionError

    try:
        transcript, title = await transcribe_url(
            url=url,
            use_api=True,  # Prefer API for speed
            keep_audio=False,
        )

        logger.info(f"Audio transcription complete: {title} ({len(transcript)} chars)")
        return transcript, title, url

    except TranscriptionError as e:
        raise Exception(f"Audio transcription failed: {str(e)}")


async def fetch_podcast_audio(url: str) -> Tuple[str, str, str]:
    """
    Fetch podcast content by downloading audio and transcribing.

    Args:
        url: URL to podcast episode (direct audio URL or podcast platform URL)

    Returns:
        Tuple of (transcript_text, episode_title, source_url)
    """
    from services.transcription import transcribe_url, TranscriptionError

    logger.info(f"Fetching podcast audio: {url}")

    try:
        transcript, title = await transcribe_url(
            url=url,
            use_api=True,
            keep_audio=False,
        )

        logger.info(f"Podcast transcription complete: {title} ({len(transcript)} chars)")
        return transcript, title, url

    except TranscriptionError as e:
        raise Exception(f"Podcast transcription failed: {str(e)}")


async def fetch_content(url: str, content_type: str) -> Tuple[str, str, str]:
    """
    Fetch content based on type.

    Args:
        url: The URL or file path
        content_type: One of 'youtube', 'article', 'arxiv', 'podcast'

    Returns:
        Tuple of (content_text, title, source_url)
    """
    if content_type == "youtube":
        return await fetch_youtube_transcript(url)
    elif content_type == "article":
        return await fetch_article(url)
    elif content_type == "arxiv":
        return await fetch_arxiv(url)
    elif content_type == "podcast":
        return await fetch_podcast_audio(url)
    else:
        raise ValueError(f"Unknown content type: {content_type}")
