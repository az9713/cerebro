"""Pydantic models for the API."""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel


class ReportBase(BaseModel):
    """Base report model."""
    title: str
    source_url: Optional[str] = None
    content_type: Literal["youtube", "article", "paper", "other"]
    created_at: datetime
    summary: Optional[str] = None


class Report(ReportBase):
    """Full report model with ID and content."""
    id: int
    filename: str
    filepath: str
    word_count: Optional[int] = None
    content: Optional[str] = None  # Full markdown content (only in detail view)

    class Config:
        from_attributes = True


class ReportList(BaseModel):
    """Paginated list of reports."""
    items: list[Report]
    total: int
    page: int
    page_size: int


class ActivityLogEntry(BaseModel):
    """Single entry in activity log."""
    title: str
    report_path: str
    time: str


class ActivityLog(BaseModel):
    """Daily activity log."""
    date: str
    videos: list[ActivityLogEntry] = []
    articles: list[ActivityLogEntry] = []
    papers: list[ActivityLogEntry] = []
    other: list[ActivityLogEntry] = []


class AnalysisRequest(BaseModel):
    """Request to analyze content."""
    url: str
    model: Literal["haiku", "sonnet", "opus"] = "sonnet"


class AnalysisJob(BaseModel):
    """Analysis job status."""
    id: str
    job_type: str
    input_value: str
    status: Literal["pending", "running", "completed", "failed"]
    progress_message: Optional[str] = None
    result_filepath: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class SearchResult(BaseModel):
    """Search result item."""
    id: int
    title: str
    filename: str
    content_type: str
    created_at: datetime
    snippet: str  # Matched text snippet


# Tag models
class TagCreate(BaseModel):
    """Create a new tag."""
    name: str
    color: str = "#6b7280"


class TagUpdate(BaseModel):
    """Update a tag."""
    name: Optional[str] = None
    color: Optional[str] = None


class Tag(BaseModel):
    """Tag model."""
    id: int
    name: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True


class TagList(BaseModel):
    """List of tags."""
    items: list[Tag]


# Collection models
class CollectionCreate(BaseModel):
    """Create a new collection."""
    name: str
    description: Optional[str] = None
    color: str = "#3b82f6"


class CollectionUpdate(BaseModel):
    """Update a collection."""
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class Collection(BaseModel):
    """Collection model."""
    id: int
    name: str
    description: Optional[str] = None
    color: str
    report_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CollectionList(BaseModel):
    """List of collections."""
    items: list[Collection]


# Favorite toggle response
class FavoriteResponse(BaseModel):
    """Response from toggling favorite."""
    report_id: int
    is_favorite: bool
