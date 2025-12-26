"""Export router - Obsidian, Notion, and Anki exports."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from pathlib import Path
import tempfile

from config import PROJECT_ROOT, REPORTS_DIR
from services.export import export_to_obsidian, export_for_notion
from services.flashcards import generate_flashcards_batch, generate_flashcards_for_report
from services.digest import generate_weekly_digest, generate_monthly_digest

router = APIRouter()


class ExportRequest(BaseModel):
    format: str  # "obsidian", "notion", "anki"
    reports: Optional[List[str]] = None  # Specific report paths, or None for all
    output_path: Optional[str] = None


class DigestRequest(BaseModel):
    period: str = "week"  # "week", "lastweek", "month", "lastmonth"
    custom_title: Optional[str] = None


class ExportResponse(BaseModel):
    status: str
    exported: int
    failed: int
    output_path: Optional[str]
    message: str


class DigestResponse(BaseModel):
    status: str
    path: str
    title: str
    reports_included: int


@router.post("/obsidian", response_model=ExportResponse)
async def export_obsidian(request: ExportRequest):
    """Export reports to Obsidian vault format."""
    try:
        output_dir = Path(request.output_path) if request.output_path else PROJECT_ROOT / "exports" / "obsidian"

        reports = None
        if request.reports:
            reports = [REPORTS_DIR / r for r in request.reports if (REPORTS_DIR / r).exists()]

        stats = export_to_obsidian(output_dir, reports)

        return ExportResponse(
            status="success",
            exported=stats["exported"],
            failed=stats["failed"],
            output_path=stats["output_dir"],
            message=f"Exported {stats['exported']} reports to Obsidian format",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/notion", response_model=ExportResponse)
async def export_notion(request: ExportRequest):
    """Export reports to Notion-compatible JSON."""
    try:
        output_file = Path(request.output_path) if request.output_path else PROJECT_ROOT / "exports" / "notion-export.json"

        reports = None
        if request.reports:
            reports = [REPORTS_DIR / r for r in request.reports if (REPORTS_DIR / r).exists()]

        stats = export_for_notion(output_file, reports)

        return ExportResponse(
            status="success",
            exported=stats["exported"],
            failed=stats["failed"],
            output_path=stats["output_file"],
            message=f"Exported {stats['exported']} reports to Notion JSON",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anki", response_model=ExportResponse)
async def export_anki(request: ExportRequest):
    """Generate Anki flashcards from reports."""
    try:
        output_file = Path(request.output_path) if request.output_path else None

        reports = None
        if request.reports:
            reports = [REPORTS_DIR / r for r in request.reports if (REPORTS_DIR / r).exists()]

        stats = await generate_flashcards_batch(reports, output_file)

        return ExportResponse(
            status="success",
            exported=stats["cards"],
            failed=stats["failed"],
            output_path=stats.get("output_file"),
            message=f"Generated {stats['cards']} flashcards from {stats['processed']} reports",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/anki/{report_path:path}")
async def get_flashcards_for_report(report_path: str, format: str = "csv"):
    """Generate flashcards for a specific report."""
    try:
        full_path = REPORTS_DIR / report_path
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="Report not found")

        result = await generate_flashcards_for_report(full_path, format)

        if result["cards_generated"] == 0:
            return JSONResponse(content={"message": result["message"], "cards": 0})

        if format == "csv":
            return PlainTextResponse(content=result["output"], media_type="text/plain")
        else:
            return JSONResponse(content=result["output"])

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/digest", response_model=DigestResponse)
async def create_digest(request: DigestRequest):
    """Generate a weekly or monthly digest."""
    try:
        if request.period in ["week", "lastweek"]:
            weeks_ago = 0 if request.period == "week" else 1
            digest_path = await generate_weekly_digest(weeks_ago, request.custom_title)
        elif request.period in ["month", "lastmonth"]:
            months_ago = 0 if request.period == "month" else 1
            digest_path = await generate_monthly_digest(months_ago, request.custom_title)
        else:
            raise HTTPException(status_code=400, detail="Invalid period. Use: week, lastweek, month, lastmonth")

        # Count reports in digest
        content = digest_path.read_text()
        report_count = content.count("](reports/") + content.count("](../reports/")

        return DigestResponse(
            status="success",
            path=str(digest_path.relative_to(PROJECT_ROOT)),
            title=digest_path.stem.replace("_", " ").replace("-", " ").title(),
            reports_included=report_count,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/digest/latest")
async def get_latest_digest():
    """Get the most recent digest."""
    digests_dir = REPORTS_DIR / "digests"
    if not digests_dir.exists():
        raise HTTPException(status_code=404, detail="No digests found")

    digests = list(digests_dir.glob("*.md"))
    if not digests:
        raise HTTPException(status_code=404, detail="No digests found")

    latest = max(digests, key=lambda p: p.stat().st_mtime)
    content = latest.read_text(encoding="utf-8")

    return {
        "path": str(latest.relative_to(PROJECT_ROOT)),
        "filename": latest.name,
        "content": content,
    }
