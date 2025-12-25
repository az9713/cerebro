"""Activity logs router."""

from fastapi import APIRouter, HTTPException, Query
from datetime import date, datetime
from pathlib import Path
from typing import Optional

from config import LOGS_DIR
from models import ActivityLog, ActivityLogEntry
from services.parser import parse_activity_log

router = APIRouter()


def get_log_filepath(log_date: date) -> Path:
    """Get filepath for a specific date's log."""
    return LOGS_DIR / f"{log_date.isoformat()}.md"


@router.get("")
async def list_logs(limit: int = Query(30, ge=1, le=365)):
    """List all available activity log dates."""
    if not LOGS_DIR.exists():
        return []

    logs = []
    for filepath in sorted(LOGS_DIR.glob("*.md"), reverse=True)[:limit]:
        if filepath.name.startswith("."):
            continue

        # Parse date from filename
        try:
            log_date = filepath.stem  # YYYY-MM-DD
            logs.append({
                "date": log_date,
                "filepath": str(filepath),
            })
        except Exception:
            continue

    return logs


@router.get("/today", response_model=ActivityLog)
async def get_today_log():
    """Get today's activity log."""
    return await get_log_by_date(date.today().isoformat())


@router.get("/{log_date}", response_model=ActivityLog)
async def get_log_by_date(log_date: str):
    """Get activity log for a specific date (YYYY-MM-DD)."""
    try:
        parsed_date = datetime.strptime(log_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    filepath = get_log_filepath(parsed_date)

    if not filepath.exists():
        # Return empty log for the date
        return ActivityLog(
            date=log_date,
            videos=[],
            articles=[],
            papers=[],
            other=[],
        )

    content = filepath.read_text(encoding="utf-8")
    parsed = parse_activity_log(content)

    return ActivityLog(
        date=parsed["date"] or log_date,
        videos=[ActivityLogEntry(**v) for v in parsed["videos"]],
        articles=[ActivityLogEntry(**a) for a in parsed["articles"]],
        papers=[ActivityLogEntry(**p) for p in parsed["papers"]],
        other=[ActivityLogEntry(**o) for o in parsed["other"]],
    )
