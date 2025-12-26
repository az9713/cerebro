"""Recommendations Router - Smart content recommendations."""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

from database import get_reports, search_reports, get_report_by_id

router = APIRouter()


class RecommendedReport(BaseModel):
    id: int
    title: str
    content_type: str
    source_url: Optional[str]
    reason: str
    score: float


@router.get("")
async def get_recommendations(limit: int = Query(10, ge=1, le=50)):
    """
    Get personalized content recommendations.

    Based on reading history, preferences, and content gaps.
    """
    # Get recent reports to understand interests
    reports, _ = await get_reports(page=1, page_size=50)

    if not reports:
        return {"recommendations": [], "message": "Analyze some content first to get recommendations"}

    # Count content types
    type_counts = {}
    for r in reports:
        t = r["content_type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    # Find underrepresented types
    all_types = ["youtube", "article", "paper", "other"]
    recommendations = []

    # Recommend diversifying content types
    min_type = min(type_counts.keys(), key=lambda x: type_counts.get(x, 0)) if type_counts else "article"

    # Get some reports from less-consumed categories
    underrep_reports, _ = await get_reports(content_type=min_type, page=1, page_size=3)
    for r in underrep_reports:
        recommendations.append(RecommendedReport(
            id=r["id"],
            title=r["title"],
            content_type=r["content_type"],
            source_url=r.get("source_url"),
            reason=f"Explore more {min_type} content",
            score=0.8,
        ))

    # Recommend older reports for review
    old_reports, _ = await get_reports(page=3, page_size=5)  # Older reports
    for r in old_reports:
        if len(recommendations) >= limit:
            break
        recommendations.append(RecommendedReport(
            id=r["id"],
            title=r["title"],
            content_type=r["content_type"],
            source_url=r.get("source_url"),
            reason="Revisit older content",
            score=0.6,
        ))

    return {"recommendations": recommendations[:limit]}


@router.get("/similar/{report_id}")
async def get_similar_reports(report_id: int, limit: int = Query(5, ge=1, le=20)):
    """Get reports similar to a specific report."""
    report = await get_report_by_id(report_id)
    if not report:
        return {"similar": []}

    # Search using title words
    title_words = report["title"].split()[:5]
    search_query = " ".join(title_words)

    results = await search_reports(search_query, limit=limit + 1)

    similar = [
        RecommendedReport(
            id=r["id"],
            title=r["title"],
            content_type=r["content_type"],
            source_url=None,
            reason="Similar content",
            score=0.7,
        )
        for r in results
        if r["id"] != report_id
    ][:limit]

    return {"similar": similar}


@router.get("/trending")
async def get_trending_topics():
    """Get trending topics from recent analyses."""
    # Get recent reports
    reports, _ = await get_reports(page=1, page_size=20)

    # Extract keywords from titles (simplified)
    word_counts = {}
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it', 'as', 'be', 'this', 'that', 'from', 'how', 'what', 'why', 'when', 'where', 'who'}

    for r in reports:
        words = r["title"].lower().split()
        for word in words:
            word = ''.join(c for c in word if c.isalnum())
            if len(word) > 3 and word not in stop_words:
                word_counts[word] = word_counts.get(word, 0) + 1

    # Sort by frequency
    trending = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "trending": [{"topic": word, "count": count} for word, count in trending]
    }
