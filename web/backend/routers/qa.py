"""Q&A Router - Ask questions about your knowledge base."""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

from services.qa_service import answer_question, get_followup_suggestions

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str
    model: str = "sonnet"
    max_reports: int = 5


class SourceInfo(BaseModel):
    id: int
    title: str
    content_type: str
    source_url: Optional[str]


class AnswerResponse(BaseModel):
    answer: str
    sources: list[SourceInfo]
    tokens_used: int
    cost: Optional[float] = None
    model: Optional[str] = None
    followup_suggestions: list[str] = []


@router.post("", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    """
    Ask a question and get an AI-powered answer with citations.

    The system searches your knowledge base for relevant content
    and uses Claude to generate a comprehensive answer.
    """
    # Get the answer
    result = await answer_question(
        question=request.question,
        model_key=request.model,
        max_reports=request.max_reports,
    )

    # Get follow-up suggestions
    followups = []
    if result.get("answer") and not result.get("error"):
        followups = await get_followup_suggestions(
            question=request.question,
            answer=result["answer"],
        )

    return AnswerResponse(
        answer=result["answer"],
        sources=[
            SourceInfo(
                id=s["id"],
                title=s["title"],
                content_type=s["content_type"],
                source_url=s.get("source_url"),
            )
            for s in result.get("sources", [])
        ],
        tokens_used=result.get("tokens_used", 0),
        cost=result.get("cost"),
        model=result.get("model"),
        followup_suggestions=followups,
    )


@router.get("/suggestions")
async def get_question_suggestions():
    """
    Get suggested questions based on recent content.

    Returns example questions the user could ask about their knowledge base.
    """
    return {
        "suggestions": [
            "What are the main themes across my recent content?",
            "Summarize what I've learned about AI this week",
            "What are the key takeaways from my YouTube videos?",
            "Compare the different perspectives in my articles",
            "What productivity tips have I collected?",
        ]
    }
