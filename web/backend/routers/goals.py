"""Goals Router - Learning goals and progress tracking."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from database import (
    create_goal,
    get_goals,
    get_goal_by_id,
    update_goal_status,
    delete_goal,
    link_report_to_goal,
)

router = APIRouter()


class CreateGoalRequest(BaseModel):
    title: str
    description: Optional[str] = None
    keywords: list[str] = []
    target_count: int = 10


class UpdateGoalRequest(BaseModel):
    status: str  # active, paused, completed


class GoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    keywords: list[str]
    target_count: int
    current_count: int
    status: str
    progress_percent: float
    created_at: str


@router.get("")
async def list_goals():
    """Get all learning goals with progress."""
    goals = await get_goals()
    return {
        "goals": [
            GoalResponse(
                id=g["id"],
                title=g["title"],
                description=g.get("description"),
                keywords=g.get("keywords", []),
                target_count=g["target_count"],
                current_count=g.get("current_count", 0),
                status=g["status"],
                progress_percent=min(100, (g.get("current_count", 0) / g["target_count"]) * 100),
                created_at=g["created_at"],
            )
            for g in goals
        ]
    }


@router.post("", response_model=GoalResponse)
async def create_learning_goal(request: CreateGoalRequest):
    """Create a new learning goal."""
    goal = await create_goal(
        title=request.title,
        description=request.description,
        keywords=request.keywords,
        target_count=request.target_count,
    )
    return GoalResponse(
        id=goal["id"],
        title=goal["title"],
        description=goal.get("description"),
        keywords=goal.get("keywords", []),
        target_count=goal["target_count"],
        current_count=0,
        status=goal["status"],
        progress_percent=0,
        created_at=goal["created_at"],
    )


@router.get("/{goal_id}")
async def get_goal(goal_id: int):
    """Get a specific goal with its linked reports."""
    goal = await get_goal_by_id(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.put("/{goal_id}")
async def update_goal(goal_id: int, request: UpdateGoalRequest):
    """Update goal status."""
    await update_goal_status(goal_id, request.status)
    return {"message": "Goal updated"}


@router.delete("/{goal_id}")
async def remove_goal(goal_id: int):
    """Delete a learning goal."""
    await delete_goal(goal_id)
    return {"message": "Goal deleted"}


@router.post("/{goal_id}/reports/{report_id}")
async def add_report_to_goal(goal_id: int, report_id: int):
    """Link a report to a learning goal."""
    await link_report_to_goal(goal_id, report_id)
    return {"message": "Report linked to goal"}
