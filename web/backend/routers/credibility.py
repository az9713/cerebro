"""Credibility Router - Analyze source credibility."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from database import get_report_by_id
from services.credibility_service import analyze_credibility

router = APIRouter()


class ScoreDetail(BaseModel):
    score: int
    notes: str


class CredibilityResponse(BaseModel):
    overall_score: int
    domain_score: int
    ai_score: int
    source_quality: Optional[ScoreDetail] = None
    evidence_quality: Optional[ScoreDetail] = None
    bias_level: Optional[ScoreDetail] = None
    fact_checkability: Optional[ScoreDetail] = None
    red_flags: list[str] = []
    strengths: list[str] = []
    recommendation: str = ""


@router.get("/{report_id}", response_model=CredibilityResponse)
async def analyze_report_credibility(report_id: int):
    """
    Analyze the credibility of a report's source.

    Returns scores for various credibility factors and recommendations.
    """
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    content = report.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Report has no content")

    result = await analyze_credibility(
        content=content,
        title=report["title"],
        source_url=report.get("source_url", ""),
        content_type=report["content_type"],
    )

    if "error" in result and not result.get("overall_score"):
        raise HTTPException(status_code=500, detail=result["error"])

    return CredibilityResponse(
        overall_score=result["overall_score"],
        domain_score=result.get("domain_score", 50),
        ai_score=result.get("ai_score", 50),
        source_quality=ScoreDetail(**result["source_quality"]) if result.get("source_quality") else None,
        evidence_quality=ScoreDetail(**result["evidence_quality"]) if result.get("evidence_quality") else None,
        bias_level=ScoreDetail(**result["bias_level"]) if result.get("bias_level") else None,
        fact_checkability=ScoreDetail(**result["fact_checkability"]) if result.get("fact_checkability") else None,
        red_flags=result.get("red_flags", []),
        strengths=result.get("strengths", []),
        recommendation=result.get("recommendation", ""),
    )
