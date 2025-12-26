"""
Content Comparison Service - Compare two reports side-by-side.

Uses AI to identify similarities, differences, and unique insights.
"""

import logging
from typing import Optional

from anthropic import Anthropic

from config import ANTHROPIC_API_KEY, MODELS
from database import get_report_by_id

logger = logging.getLogger(__name__)

COMPARISON_PROMPT = """You are an expert at comparative analysis. Compare the following two pieces of content and provide a comprehensive analysis.

## Content A: {title_a}
{content_a}

---

## Content B: {title_b}
{content_b}

---

Please provide a structured comparison with the following sections:

## Overview
A brief 2-3 sentence summary of what each piece covers and how they relate.

## Key Similarities
- List the main points where both pieces agree or cover similar ground
- Include specific examples from both sources

## Key Differences
- List the main points where the pieces differ in perspective, approach, or conclusions
- Note any contradictions or opposing viewpoints

## Unique Insights from A
- Points or insights only found in Content A
- What does A bring to the table that B doesn't?

## Unique Insights from B
- Points or insights only found in Content B
- What does B bring to the table that A doesn't?

## Synthesis
- What can we learn by considering both pieces together?
- How do they complement each other?
- What gaps remain even when considering both?

## Verdict
A brief conclusion about which piece might be more valuable for different purposes, or how they should be used together.

Keep the analysis focused and actionable. Use bullet points for clarity."""


def get_client() -> Anthropic:
    """Get Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


def truncate_content(content: str, max_chars: int = 12000) -> str:
    """Truncate content to fit within limits."""
    if len(content) > max_chars:
        return content[:max_chars] + "\n\n[Content truncated...]"
    return content


async def compare_reports(
    report_id_a: int,
    report_id_b: int,
    model_key: str = "sonnet",
) -> dict:
    """
    Compare two reports and generate analysis.

    Args:
        report_id_a: First report ID
        report_id_b: Second report ID
        model_key: Which model to use

    Returns:
        Dict with comparison results
    """
    try:
        # Fetch both reports
        report_a = await get_report_by_id(report_id_a)
        report_b = await get_report_by_id(report_id_b)

        if not report_a:
            return {"error": f"Report {report_id_a} not found"}
        if not report_b:
            return {"error": f"Report {report_id_b} not found"}

        content_a = report_a.get("content", "")
        content_b = report_b.get("content", "")

        if not content_a or not content_b:
            return {"error": "One or both reports have no content"}

        # Truncate if needed
        content_a = truncate_content(content_a)
        content_b = truncate_content(content_b)

        # Build prompt
        prompt = COMPARISON_PROMPT.format(
            title_a=report_a["title"],
            content_a=content_a,
            title_b=report_b["title"],
            content_b=content_b,
        )

        # Call Claude
        client = get_client()
        model_info = MODELS.get(model_key, MODELS["sonnet"])

        response = client.messages.create(
            model=model_info["id"],
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        comparison = response.content[0].text
        tokens_used = response.usage.input_tokens + response.usage.output_tokens

        # Calculate cost
        input_cost = (response.usage.input_tokens / 1_000_000) * model_info["input_cost"]
        output_cost = (response.usage.output_tokens / 1_000_000) * model_info["output_cost"]
        total_cost = input_cost + output_cost

        return {
            "comparison": comparison,
            "report_a": {
                "id": report_a["id"],
                "title": report_a["title"],
                "content_type": report_a["content_type"],
                "source_url": report_a.get("source_url"),
            },
            "report_b": {
                "id": report_b["id"],
                "title": report_b["title"],
                "content_type": report_b["content_type"],
                "source_url": report_b.get("source_url"),
            },
            "tokens_used": tokens_used,
            "cost": round(total_cost, 4),
            "model": model_info["name"],
        }

    except Exception as e:
        logger.exception(f"Comparison failed: {e}")
        return {"error": str(e)}


async def get_comparison_suggestions(report_id: int, limit: int = 5) -> list[dict]:
    """
    Suggest reports that might be good to compare with a given report.

    Args:
        report_id: The report to find comparisons for
        limit: Maximum suggestions

    Returns:
        List of report suggestions
    """
    from database import get_reports, search_reports

    try:
        # Get the source report
        report = await get_report_by_id(report_id)
        if not report:
            return []

        # Search for related reports using title keywords
        title_words = report["title"].split()[:5]
        search_query = " ".join(title_words)

        results = await search_reports(search_query, limit=limit + 1)

        # Filter out the source report
        suggestions = [
            {
                "id": r["id"],
                "title": r["title"],
                "content_type": r["content_type"],
            }
            for r in results
            if r["id"] != report_id
        ][:limit]

        return suggestions

    except Exception as e:
        logger.error(f"Failed to get comparison suggestions: {e}")
        return []
