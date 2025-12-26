"""
Q&A Service - AI-powered question answering across all reports.

Searches relevant reports and uses Claude to generate answers with citations.
"""

import logging
from typing import Optional

from anthropic import Anthropic

from config import ANTHROPIC_API_KEY, MODELS
from database import search_reports, get_report_by_id

logger = logging.getLogger(__name__)

QA_SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on the user's personal knowledge base.

You will be given:
1. A user's question
2. Relevant excerpts from their analyzed content (reports)

Instructions:
- Answer the question using ONLY information from the provided sources
- If the sources don't contain enough information, say so clearly
- Always cite your sources using [Report Title] format
- Be concise but thorough
- If multiple sources discuss the topic, synthesize the information
- Use bullet points for lists
- Include specific quotes when relevant, using quotation marks

If the question cannot be answered from the sources, respond:
"I couldn't find enough information in your knowledge base to answer this question. You might want to analyze more content on this topic."
"""


def get_client() -> Anthropic:
    """Get Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


async def find_relevant_reports(question: str, limit: int = 5) -> list[dict]:
    """
    Find reports relevant to the question using keyword search.

    Args:
        question: The user's question
        limit: Maximum number of reports to return

    Returns:
        List of report dicts with content
    """
    # Search for relevant reports
    search_results = await search_reports(question, limit=limit)

    relevant_reports = []
    for result in search_results:
        # Get full report content
        report = await get_report_by_id(result["id"])
        if report and report.get("content"):
            relevant_reports.append({
                "id": report["id"],
                "title": report["title"],
                "content_type": report["content_type"],
                "content": report["content"],
                "source_url": report.get("source_url"),
            })

    return relevant_reports


def build_context(reports: list[dict], max_chars: int = 30000) -> str:
    """
    Build context string from reports, respecting token limits.

    Args:
        reports: List of report dicts
        max_chars: Maximum characters for context

    Returns:
        Formatted context string
    """
    context_parts = []
    total_chars = 0

    for report in reports:
        content = report["content"]

        # Truncate individual report if too long
        if len(content) > 8000:
            content = content[:8000] + "\n\n[Content truncated...]"

        section = f"""
--- SOURCE: {report['title']} ({report['content_type']}) ---

{content}

---
"""
        if total_chars + len(section) > max_chars:
            break

        context_parts.append(section)
        total_chars += len(section)

    return "\n".join(context_parts)


async def answer_question(
    question: str,
    model_key: str = "sonnet",
    max_reports: int = 5,
) -> dict:
    """
    Answer a question using the user's knowledge base.

    Args:
        question: The user's question
        model_key: Which model to use (haiku, sonnet, opus)
        max_reports: Maximum reports to include in context

    Returns:
        Dict with answer, sources, and usage info
    """
    try:
        # Find relevant reports
        reports = await find_relevant_reports(question, limit=max_reports)

        if not reports:
            return {
                "answer": "I couldn't find any relevant content in your knowledge base to answer this question. Try analyzing some content on this topic first.",
                "sources": [],
                "tokens_used": 0,
            }

        # Build context
        context = build_context(reports)

        # Prepare prompt
        user_prompt = f"""Based on the following sources from the user's knowledge base, please answer their question.

SOURCES:
{context}

USER QUESTION:
{question}

Please provide a comprehensive answer with citations to the sources."""

        # Call Claude
        client = get_client()
        model_info = MODELS.get(model_key, MODELS["sonnet"])

        response = client.messages.create(
            model=model_info["id"],
            max_tokens=2048,
            system=QA_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}]
        )

        answer = response.content[0].text
        tokens_used = response.usage.input_tokens + response.usage.output_tokens

        # Calculate cost
        input_cost = (response.usage.input_tokens / 1_000_000) * model_info["input_cost"]
        output_cost = (response.usage.output_tokens / 1_000_000) * model_info["output_cost"]
        total_cost = input_cost + output_cost

        # Build sources list
        sources = [
            {
                "id": r["id"],
                "title": r["title"],
                "content_type": r["content_type"],
                "source_url": r.get("source_url"),
            }
            for r in reports
        ]

        return {
            "answer": answer,
            "sources": sources,
            "tokens_used": tokens_used,
            "cost": round(total_cost, 4),
            "model": model_info["name"],
        }

    except Exception as e:
        logger.exception(f"Q&A failed: {e}")
        return {
            "answer": f"An error occurred while processing your question: {str(e)}",
            "sources": [],
            "tokens_used": 0,
            "error": str(e),
        }


async def get_followup_suggestions(question: str, answer: str) -> list[str]:
    """
    Generate follow-up question suggestions based on the Q&A.

    Args:
        question: Original question
        answer: The answer provided

    Returns:
        List of suggested follow-up questions
    """
    try:
        client = get_client()
        model_info = MODELS["haiku"]  # Use Haiku for cost efficiency

        prompt = f"""Based on this Q&A, suggest 3 brief follow-up questions the user might want to ask.

Question: {question}

Answer: {answer[:500]}...

Return ONLY a JSON array of 3 question strings, nothing else. Example:
["Question 1?", "Question 2?", "Question 3?"]"""

        response = client.messages.create(
            model=model_info["id"],
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}]
        )

        import json
        suggestions = json.loads(response.content[0].text)
        return suggestions[:3]

    except Exception as e:
        logger.error(f"Failed to generate follow-up suggestions: {e}")
        return []
