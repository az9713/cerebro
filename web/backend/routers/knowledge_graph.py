"""Knowledge Graph router - visualize and explore concept connections."""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import logging

from database import (
    get_knowledge_graph,
    get_concept_details,
    upsert_concept,
    get_report_by_id,
)
from services.concept_extractor import extract_and_store_concepts

logger = logging.getLogger(__name__)

router = APIRouter()


class ConceptCreate(BaseModel):
    name: str
    concept_type: str = "concept"
    description: Optional[str] = None


class ExtractConceptsRequest(BaseModel):
    report_id: int


class GraphResponse(BaseModel):
    nodes: list
    links: list


class ConceptResponse(BaseModel):
    id: int
    name: str
    concept_type: str
    description: Optional[str]
    mention_count: int
    reports: list


class ExtractionResult(BaseModel):
    concepts_extracted: int
    concepts_stored: int
    relationships_stored: int


@router.get("", response_model=GraphResponse)
async def get_graph(
    limit: int = Query(100, ge=10, le=500, description="Max nodes to return"),
):
    """
    Get the full knowledge graph for visualization.

    Returns nodes (concepts) and links (relationships) in a format
    suitable for force-directed graph libraries.
    """
    graph = await get_knowledge_graph(limit=limit)
    return GraphResponse(nodes=graph["nodes"], links=graph.get("edges", []))


@router.get("/concept/{concept_id}", response_model=ConceptResponse)
async def get_concept(concept_id: int):
    """Get detailed information about a specific concept."""
    concept = await get_concept_details(concept_id)

    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    return ConceptResponse(
        id=concept["id"],
        name=concept["name"],
        concept_type=concept["concept_type"],
        description=concept["description"],
        mention_count=concept["mention_count"],
        reports=concept["reports"],
    )


@router.post("/concept", response_model=dict)
async def create_concept(concept: ConceptCreate):
    """Manually create a new concept."""
    concept_id = await upsert_concept(
        name=concept.name,
        concept_type=concept.concept_type,
        description=concept.description,
    )
    return {"id": concept_id, "name": concept.name}


@router.post("/extract/{report_id}", response_model=ExtractionResult)
async def extract_concepts_from_report(report_id: int):
    """
    Extract concepts from a report and add to knowledge graph.

    This analyzes the report content using AI to identify
    key concepts and their relationships.
    """
    # Get the report
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    content = report.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Report has no content")

    # Extract and store concepts
    result = await extract_and_store_concepts(
        report_id=report_id,
        content=content,
        title=report.get("title", ""),
    )

    return ExtractionResult(
        concepts_extracted=result["concepts_extracted"],
        concepts_stored=result["concepts_stored"],
        relationships_stored=result["relationships_stored"],
    )


@router.post("/extract-all")
async def extract_concepts_from_all_reports(
    background_tasks: BackgroundTasks,
    limit: int = Query(50, ge=1, le=200, description="Max reports to process"),
):
    """
    Extract concepts from all reports that haven't been processed yet.

    Runs in background to avoid timeout.
    """
    from database import get_reports

    async def process_reports():
        reports, _ = await get_reports(page=1, page_size=limit)
        processed = 0

        for report in reports:
            try:
                content = report.get("content", "")
                if content:
                    await extract_and_store_concepts(
                        report_id=report["id"],
                        content=content,
                        title=report.get("title", ""),
                    )
                    processed += 1
            except Exception as e:
                logger.error(f"Failed to extract concepts from report {report['id']}: {e}")

        logger.info(f"Processed {processed} reports for concept extraction")

    background_tasks.add_task(process_reports)
    return {"message": f"Started extracting concepts from up to {limit} reports"}
