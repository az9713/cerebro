"""Comparison Router - Compare two reports side-by-side."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.comparison_service import compare_reports, get_comparison_suggestions

router = APIRouter()


class ComparisonRequest(BaseModel):
    report_id_a: int
    report_id_b: int
    model: str = "sonnet"


class ReportInfo(BaseModel):
    id: int
    title: str
    content_type: str
    source_url: Optional[str]


class ComparisonResponse(BaseModel):
    comparison: str
    report_a: ReportInfo
    report_b: ReportInfo
    tokens_used: int
    cost: Optional[float]
    model: Optional[str]


class SuggestionItem(BaseModel):
    id: int
    title: str
    content_type: str


@router.post("", response_model=ComparisonResponse)
async def create_comparison(request: ComparisonRequest):
    """
    Compare two reports and generate an analysis.

    Returns similarities, differences, and unique insights from each.
    """
    if request.report_id_a == request.report_id_b:
        raise HTTPException(
            status_code=400,
            detail="Cannot compare a report with itself"
        )

    result = await compare_reports(
        report_id_a=request.report_id_a,
        report_id_b=request.report_id_b,
        model_key=request.model,
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return ComparisonResponse(
        comparison=result["comparison"],
        report_a=ReportInfo(**result["report_a"]),
        report_b=ReportInfo(**result["report_b"]),
        tokens_used=result["tokens_used"],
        cost=result.get("cost"),
        model=result.get("model"),
    )


@router.get("/suggestions/{report_id}")
async def get_suggestions(report_id: int, limit: int = 5):
    """
    Get suggestions for reports to compare with a given report.

    Returns reports that might be related or interesting to compare.
    """
    suggestions = await get_comparison_suggestions(report_id, limit=limit)
    return {"suggestions": [SuggestionItem(**s) for s in suggestions]}
