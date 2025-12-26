"""
Concept extraction service for Knowledge Graph.

Extracts key concepts, entities, and relationships from report content
using Claude AI to build a connected knowledge graph.
"""

import json
import logging
import re
from typing import Optional

from anthropic import Anthropic

from config import ANTHROPIC_API_KEY, MODELS

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """Analyze the following content and extract key concepts for a knowledge graph.

Return a JSON object with this structure:
{
  "concepts": [
    {
      "name": "Concept Name",
      "type": "person|organization|technology|concept|event|place|product|method",
      "description": "Brief one-sentence description"
    }
  ],
  "relationships": [
    {
      "source": "Concept A",
      "target": "Concept B",
      "type": "related_to|created_by|part_of|uses|influences|contrasts_with|example_of|leads_to"
    }
  ]
}

Guidelines:
- Extract 5-15 main concepts depending on content complexity
- Focus on the most important/central ideas
- Include people, organizations, technologies, and abstract concepts
- Create relationships that show how concepts connect
- Use consistent naming (e.g., "Machine Learning" not "ML" or "machine learning")
- Descriptions should be factual and brief

Content to analyze:
"""


def get_client() -> Anthropic:
    """Get Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


def clean_json_response(text: str) -> str:
    """Extract JSON from response that might have markdown code blocks."""
    # Try to find JSON in code blocks first
    json_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', text)
    if json_match:
        return json_match.group(1)

    # Try to find raw JSON object
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        return json_match.group(0)

    return text


async def extract_concepts(content: str, title: str = "") -> dict:
    """
    Extract concepts and relationships from content.

    Args:
        content: The text content to analyze
        title: Optional title for context

    Returns:
        Dict with 'concepts' and 'relationships' lists
    """
    try:
        client = get_client()

        # Use Haiku for cost-efficiency on extraction
        model_info = MODELS["haiku"]

        # Truncate content if too long (keep first 15000 chars)
        if len(content) > 15000:
            content = content[:15000] + "\n\n[Content truncated...]"

        prompt = EXTRACTION_PROMPT
        if title:
            prompt += f"\nTitle: {title}\n\n"
        prompt += content

        response = client.messages.create(
            model=model_info["id"],
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text
        json_str = clean_json_response(response_text)

        result = json.loads(json_str)

        # Validate structure
        if "concepts" not in result:
            result["concepts"] = []
        if "relationships" not in result:
            result["relationships"] = []

        # Ensure all concepts have required fields
        for concept in result["concepts"]:
            if "name" not in concept:
                continue
            if "type" not in concept:
                concept["type"] = "concept"
            if "description" not in concept:
                concept["description"] = ""

        # Filter out invalid concepts
        result["concepts"] = [
            c for c in result["concepts"]
            if c.get("name") and len(c["name"]) > 0
        ]

        logger.info(f"Extracted {len(result['concepts'])} concepts and {len(result['relationships'])} relationships")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse concept extraction response: {e}")
        return {"concepts": [], "relationships": []}
    except Exception as e:
        logger.exception(f"Concept extraction failed: {e}")
        return {"concepts": [], "relationships": []}


async def extract_and_store_concepts(
    report_id: int,
    content: str,
    title: str = ""
) -> dict:
    """
    Extract concepts from content and store them in the database.

    Args:
        report_id: The report ID to link concepts to
        content: The content to analyze
        title: Optional title for context

    Returns:
        Dict with extraction results and stats
    """
    from database import (
        upsert_concept,
        link_concept_to_report,
        create_concept_relationship,
    )

    # Extract concepts
    extraction = await extract_concepts(content, title)

    concepts_created = 0
    relationships_created = 0
    concept_id_map = {}  # Map concept names to IDs

    # Store concepts
    for concept in extraction["concepts"]:
        try:
            concept_id = await upsert_concept(
                name=concept["name"],
                concept_type=concept.get("type", "concept"),
                description=concept.get("description")
            )
            concept_id_map[concept["name"]] = concept_id

            # Link to report
            await link_concept_to_report(
                report_id=report_id,
                concept_id=concept_id,
                relevance=1.0,
                context=title
            )
            concepts_created += 1
        except Exception as e:
            logger.error(f"Failed to store concept '{concept.get('name')}': {e}")

    # Store relationships
    for rel in extraction["relationships"]:
        try:
            source_id = concept_id_map.get(rel["source"])
            target_id = concept_id_map.get(rel["target"])

            if source_id and target_id:
                await create_concept_relationship(
                    source_id=source_id,
                    target_id=target_id,
                    rel_type=rel.get("type", "related_to"),
                    strength=1.0
                )
                relationships_created += 1
        except Exception as e:
            logger.error(f"Failed to store relationship: {e}")

    return {
        "concepts_extracted": len(extraction["concepts"]),
        "concepts_stored": concepts_created,
        "relationships_stored": relationships_created
    }
