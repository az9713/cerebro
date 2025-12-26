# Ten New Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 10 significant features to Personal OS: Knowledge Graph, Q&A System, Content Comparison, Browser Extension, Audio Reports, Spaced Repetition, Source Credibility, Learning Goals, Multi-Language, and Smart Recommendations.

**Architecture:** Each feature adds backend services/routers + frontend pages/components + database schema extensions. Features are designed to be independent and can be implemented in any order. All features integrate with the existing report system.

**Tech Stack:** FastAPI (Python), SQLite/aiosqlite, Anthropic Claude API, Next.js 14, React 18, TypeScript, Tailwind CSS

---

## Table of Contents

1. [Feature 1: Knowledge Graph Visualization](#feature-1-knowledge-graph-visualization)
2. [Feature 2: AI-Powered Q&A System](#feature-2-ai-powered-qa-system)
3. [Feature 3: Content Comparison Mode](#feature-3-content-comparison-mode)
4. [Feature 4: Browser Extension](#feature-4-browser-extension)
5. [Feature 5: Audio Report Generation](#feature-5-audio-report-generation)
6. [Feature 6: Spaced Repetition Review System](#feature-6-spaced-repetition-review-system)
7. [Feature 7: Source Credibility Analysis](#feature-7-source-credibility-analysis)
8. [Feature 8: Learning Goals & Progress Tracking](#feature-8-learning-goals--progress-tracking)
9. [Feature 9: Multi-Language Translation & Analysis](#feature-9-multi-language-translation--analysis)
10. [Feature 10: Smart Content Recommendations](#feature-10-smart-content-recommendations)

---

# Feature 1: Knowledge Graph Visualization

**Goal:** Build an interactive visual map of concepts, people, and ideas extracted from reports, showing how topics connect across your knowledge base.

**Dependencies:** None (uses existing reports table)

---

## Task 1.1: Database Schema for Concepts and Relationships

**Files:**
- Modify: `web/backend/database.py`

**Step 1: Add concept tables to schema**

Add the following to the `SCHEMA` string in `database.py` after the collections tables:

```python
-- Concepts extracted from reports
CREATE TABLE IF NOT EXISTS concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    concept_type TEXT NOT NULL,  -- 'person', 'topic', 'technology', 'company', 'idea'
    description TEXT,
    mention_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Report-Concept junction (which concepts appear in which reports)
CREATE TABLE IF NOT EXISTS report_concepts (
    report_id INTEGER NOT NULL,
    concept_id INTEGER NOT NULL,
    relevance_score REAL DEFAULT 1.0,  -- 0.0-1.0
    context_snippet TEXT,  -- excerpt where concept appears
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (report_id, concept_id),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

-- Concept relationships (edges in the graph)
CREATE TABLE IF NOT EXISTS concept_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_concept_id INTEGER NOT NULL,
    target_concept_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL,  -- 'related_to', 'part_of', 'created_by', 'used_by'
    strength REAL DEFAULT 1.0,  -- co-occurrence count or relevance
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
    FOREIGN KEY (target_concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
    UNIQUE(source_concept_id, target_concept_id, relationship_type)
);

-- Indexes for graph queries
CREATE INDEX IF NOT EXISTS idx_concepts_type ON concepts(concept_type);
CREATE INDEX IF NOT EXISTS idx_concepts_name ON concepts(name);
CREATE INDEX IF NOT EXISTS idx_report_concepts_report ON report_concepts(report_id);
CREATE INDEX IF NOT EXISTS idx_report_concepts_concept ON report_concepts(concept_id);
CREATE INDEX IF NOT EXISTS idx_relationships_source ON concept_relationships(source_concept_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON concept_relationships(target_concept_id);
```

**Step 2: Add database operations for concepts**

Add these functions to `database.py`:

```python
# Concept operations
async def upsert_concept(name: str, concept_type: str, description: str = None) -> int:
    """Insert or update a concept, return its ID."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, mention_count FROM concepts WHERE name = ?",
            (name.lower(),)
        )
        existing = await cursor.fetchone()

        if existing:
            await db.execute(
                """UPDATE concepts SET mention_count = mention_count + 1,
                   updated_at = CURRENT_TIMESTAMP WHERE id = ?""",
                (existing["id"],)
            )
            await db.commit()
            return existing["id"]
        else:
            cursor = await db.execute(
                """INSERT INTO concepts (name, concept_type, description)
                   VALUES (?, ?, ?) RETURNING id""",
                (name.lower(), concept_type, description)
            )
            row = await cursor.fetchone()
            await db.commit()
            return row["id"]


async def link_concept_to_report(report_id: int, concept_id: int, relevance: float = 1.0, context: str = None):
    """Link a concept to a report."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT OR REPLACE INTO report_concepts
               (report_id, concept_id, relevance_score, context_snippet)
               VALUES (?, ?, ?, ?)""",
            (report_id, concept_id, relevance, context)
        )
        await db.commit()


async def create_concept_relationship(source_id: int, target_id: int, rel_type: str, strength: float = 1.0):
    """Create or strengthen a relationship between concepts."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute(
            """SELECT id, strength FROM concept_relationships
               WHERE source_concept_id = ? AND target_concept_id = ? AND relationship_type = ?""",
            (source_id, target_id, rel_type)
        )
        existing = await cursor.fetchone()

        if existing:
            await db.execute(
                "UPDATE concept_relationships SET strength = strength + ? WHERE id = ?",
                (strength, existing[0])
            )
        else:
            await db.execute(
                """INSERT INTO concept_relationships
                   (source_concept_id, target_concept_id, relationship_type, strength)
                   VALUES (?, ?, ?, ?)""",
                (source_id, target_id, rel_type, strength)
            )
        await db.commit()


async def get_knowledge_graph(limit: int = 100) -> dict:
    """Get nodes and edges for the knowledge graph."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Get top concepts by mention count
        cursor = await db.execute(
            """SELECT id, name, concept_type, description, mention_count
               FROM concepts ORDER BY mention_count DESC LIMIT ?""",
            (limit,)
        )
        nodes = [dict(row) for row in await cursor.fetchall()]
        node_ids = {n["id"] for n in nodes}

        # Get relationships between these concepts
        if node_ids:
            placeholders = ",".join("?" * len(node_ids))
            cursor = await db.execute(
                f"""SELECT source_concept_id, target_concept_id, relationship_type, strength
                   FROM concept_relationships
                   WHERE source_concept_id IN ({placeholders})
                   AND target_concept_id IN ({placeholders})""",
                list(node_ids) + list(node_ids)
            )
            edges = [dict(row) for row in await cursor.fetchall()]
        else:
            edges = []

        return {"nodes": nodes, "edges": edges}


async def get_concept_details(concept_id: int) -> dict:
    """Get a concept with its related reports."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        cursor = await db.execute(
            "SELECT * FROM concepts WHERE id = ?", (concept_id,)
        )
        concept = dict(await cursor.fetchone())

        cursor = await db.execute(
            """SELECT r.id, r.title, r.content_type, r.created_at, rc.relevance_score
               FROM reports r
               JOIN report_concepts rc ON r.id = rc.report_id
               WHERE rc.concept_id = ?
               ORDER BY rc.relevance_score DESC""",
            (concept_id,)
        )
        concept["reports"] = [dict(row) for row in await cursor.fetchall()]

        return concept
```

**Step 3: Run test to verify schema**

Run: `cd web/backend && python -c "import asyncio; from database import init_db; asyncio.run(init_db())"`
Expected: No errors, tables created

**Step 4: Commit**

```bash
git add web/backend/database.py
git commit -m "feat(knowledge-graph): add concept tables and operations"
```

---

## Task 1.2: Concept Extraction Service

**Files:**
- Create: `web/backend/services/concept_extractor.py`

**Step 1: Create the concept extraction service**

```python
"""Extract concepts from report content using Claude."""

import json
import logging
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODELS

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """Analyze the following content and extract key concepts.

For each concept, provide:
1. name: The concept name (normalized, lowercase)
2. type: One of: person, topic, technology, company, idea, book, event
3. description: Brief 1-sentence description
4. relevance: Score 0.0-1.0 indicating importance to the content

Also identify relationships between concepts:
1. source: Source concept name
2. target: Target concept name
3. type: One of: related_to, part_of, created_by, used_by, contrasts_with

Return JSON in this exact format:
{
  "concepts": [
    {"name": "machine learning", "type": "topic", "description": "...", "relevance": 0.9},
    ...
  ],
  "relationships": [
    {"source": "deep learning", "target": "machine learning", "type": "part_of"},
    ...
  ]
}

Content to analyze:
"""


def get_client() -> Anthropic:
    """Get Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


async def extract_concepts(content: str, model_key: str = "haiku") -> dict:
    """
    Extract concepts and relationships from content.
    Uses Haiku by default for cost efficiency.
    """
    try:
        client = get_client()
        model_id = MODELS.get(model_key, MODELS["haiku"])["id"]

        # Truncate content if too long (leave room for prompt)
        max_content = 50000
        if len(content) > max_content:
            content = content[:max_content] + "\n\n[Content truncated...]"

        response = client.messages.create(
            model=model_id,
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": EXTRACTION_PROMPT + content
            }]
        )

        # Parse JSON response
        response_text = response.content[0].text

        # Find JSON in response (handle markdown code blocks)
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end]
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end]

        result = json.loads(response_text.strip())

        return {
            "concepts": result.get("concepts", []),
            "relationships": result.get("relationships", [])
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse concept extraction response: {e}")
        return {"concepts": [], "relationships": []}
    except Exception as e:
        logger.exception("Concept extraction failed")
        return {"concepts": [], "relationships": []}


async def process_report_concepts(report_id: int, content: str):
    """Extract concepts from a report and save to database."""
    from database import upsert_concept, link_concept_to_report, create_concept_relationship

    result = await extract_concepts(content)

    # Map concept names to IDs
    concept_ids = {}

    # Process concepts
    for concept in result["concepts"]:
        concept_id = await upsert_concept(
            name=concept["name"],
            concept_type=concept["type"],
            description=concept.get("description")
        )
        concept_ids[concept["name"].lower()] = concept_id

        await link_concept_to_report(
            report_id=report_id,
            concept_id=concept_id,
            relevance=concept.get("relevance", 1.0)
        )

    # Process relationships
    for rel in result["relationships"]:
        source_name = rel["source"].lower()
        target_name = rel["target"].lower()

        if source_name in concept_ids and target_name in concept_ids:
            await create_concept_relationship(
                source_id=concept_ids[source_name],
                target_id=concept_ids[target_name],
                rel_type=rel["type"]
            )

    return len(result["concepts"])
```

**Step 2: Commit**

```bash
git add web/backend/services/concept_extractor.py
git commit -m "feat(knowledge-graph): add concept extraction service"
```

---

## Task 1.3: Knowledge Graph API Router

**Files:**
- Create: `web/backend/routers/knowledge_graph.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Knowledge graph API endpoints."""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from database import (
    get_knowledge_graph,
    get_concept_details,
    get_report_by_id,
)
from services.concept_extractor import process_report_concepts

router = APIRouter(prefix="/knowledge-graph", tags=["knowledge-graph"])


class GraphResponse(BaseModel):
    nodes: list[dict]
    edges: list[dict]


class ConceptResponse(BaseModel):
    id: int
    name: str
    concept_type: str
    description: Optional[str]
    mention_count: int
    reports: list[dict]


@router.get("", response_model=GraphResponse)
async def get_graph(limit: int = 100):
    """Get the knowledge graph data for visualization."""
    return await get_knowledge_graph(limit=limit)


@router.get("/concepts/{concept_id}", response_model=ConceptResponse)
async def get_concept(concept_id: int):
    """Get details about a specific concept."""
    concept = await get_concept_details(concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return concept


@router.post("/extract/{report_id}")
async def extract_report_concepts(report_id: int, background_tasks: BackgroundTasks):
    """Trigger concept extraction for a specific report."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    content = report.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Report has no content")

    background_tasks.add_task(process_report_concepts, report_id, content)
    return {"status": "extraction_started", "report_id": report_id}


@router.post("/extract-all")
async def extract_all_concepts(background_tasks: BackgroundTasks):
    """Trigger concept extraction for all reports (background job)."""
    from database import get_reports

    reports, total = await get_reports(page_size=1000)

    for report in reports:
        report_full = await get_report_by_id(report["id"])
        if report_full and report_full.get("content"):
            background_tasks.add_task(
                process_report_concepts,
                report["id"],
                report_full["content"]
            )

    return {"status": "extraction_started", "report_count": len(reports)}
```

**Step 2: Register router in main.py**

Add to `web/backend/main.py` imports:

```python
from routers.knowledge_graph import router as knowledge_graph_router
```

Add to router includes section:

```python
app.include_router(knowledge_graph_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/knowledge_graph.py web/backend/main.py
git commit -m "feat(knowledge-graph): add API endpoints"
```

---

## Task 1.4: Frontend Knowledge Graph Page

**Files:**
- Create: `web/frontend/src/app/knowledge-graph/page.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/components/Sidebar.tsx`
- Modify: `web/frontend/package.json`

**Step 1: Install visualization library**

Run: `cd web/frontend && npm install react-force-graph-2d`

**Step 2: Add API functions**

Add to `web/frontend/src/lib/api.ts`:

```typescript
// ============ KNOWLEDGE GRAPH API ============

export interface GraphNode {
  id: number;
  name: string;
  concept_type: string;
  description: string | null;
  mention_count: number;
}

export interface GraphEdge {
  source_concept_id: number;
  target_concept_id: number;
  relationship_type: string;
  strength: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ConceptDetail extends GraphNode {
  reports: {
    id: number;
    title: string;
    content_type: string;
    created_at: string;
    relevance_score: number;
  }[];
}

export async function fetchKnowledgeGraph(limit = 100): Promise<KnowledgeGraph> {
  const res = await fetch(`${API_BASE}/knowledge-graph?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch knowledge graph');
  return res.json();
}

export async function fetchConcept(id: number): Promise<ConceptDetail> {
  const res = await fetch(`${API_BASE}/knowledge-graph/concepts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch concept');
  return res.json();
}

export async function triggerConceptExtraction(reportId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/knowledge-graph/extract/${reportId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to trigger extraction');
}

export async function triggerAllConceptExtraction(): Promise<{ report_count: number }> {
  const res = await fetch(`${API_BASE}/knowledge-graph/extract-all`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to trigger extraction');
  return res.json();
}
```

**Step 3: Create the knowledge graph page**

Create `web/frontend/src/app/knowledge-graph/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { fetchKnowledgeGraph, fetchConcept, triggerAllConceptExtraction } from '@/lib/api';
import type { KnowledgeGraph, GraphNode, ConceptDetail } from '@/lib/api';

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// Color map for concept types
const typeColors: Record<string, string> = {
  person: '#ef4444',
  topic: '#3b82f6',
  technology: '#10b981',
  company: '#f59e0b',
  idea: '#8b5cf6',
  book: '#ec4899',
  event: '#06b6d4',
};

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] } | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<ConceptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const graphRef = useRef<any>();

  const loadGraph = useCallback(async () => {
    try {
      const data = await fetchKnowledgeGraph(150);

      // Transform data for react-force-graph
      const nodes = data.nodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.concept_type,
        description: n.description,
        val: Math.max(n.mention_count, 3), // Node size
        color: typeColors[n.concept_type] || '#6b7280',
      }));

      const links = data.edges.map(e => ({
        source: e.source_concept_id,
        target: e.target_concept_id,
        type: e.relationship_type,
        value: e.strength,
      }));

      setGraphData({ nodes, links });
    } catch (err) {
      console.error('Failed to load graph:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const handleNodeClick = async (node: any) => {
    try {
      const detail = await fetchConcept(node.id);
      setSelectedConcept(detail);
    } catch (err) {
      console.error('Failed to load concept:', err);
    }
  };

  const handleExtractAll = async () => {
    setExtracting(true);
    try {
      const result = await triggerAllConceptExtraction();
      alert(`Started extraction for ${result.report_count} reports. Refresh in a few minutes.`);
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading knowledge graph...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Graph visualization */}
      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
        {graphData && graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node: any) => `${node.name} (${node.type})`}
            nodeColor={(node: any) => node.color}
            nodeVal={(node: any) => node.val}
            linkColor={() => 'rgba(255,255,255,0.2)'}
            linkWidth={(link: any) => Math.min(link.value, 3)}
            onNodeClick={handleNodeClick}
            backgroundColor="#111827"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="mb-4">No concepts extracted yet.</p>
            <button
              onClick={handleExtractAll}
              disabled={extracting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {extracting ? 'Extracting...' : 'Extract Concepts from All Reports'}
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-gray-800 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Concept Types</div>
          <div className="space-y-1">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-300 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 space-x-2">
          <button
            onClick={() => graphRef.current?.zoomToFit(400)}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
          >
            Fit View
          </button>
          <button
            onClick={handleExtractAll}
            disabled={extracting}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {extracting ? 'Extracting...' : 'Refresh Concepts'}
          </button>
        </div>
      </div>

      {/* Concept detail sidebar */}
      {selectedConcept && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold capitalize">{selectedConcept.name}</h2>
            <button
              onClick={() => setSelectedConcept(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>

          <div className="mb-4">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: typeColors[selectedConcept.concept_type] + '20', color: typeColors[selectedConcept.concept_type] }}
            >
              {selectedConcept.concept_type}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {selectedConcept.mention_count} mentions
            </span>
          </div>

          {selectedConcept.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedConcept.description}
            </p>
          )}

          <h3 className="text-sm font-medium mb-2">Related Reports</h3>
          <div className="space-y-2">
            {selectedConcept.reports.map(report => (
              <a
                key={report.id}
                href={`/reports/${report.id}`}
                className="block p-2 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div className="text-sm font-medium truncate">{report.title}</div>
                <div className="text-xs text-gray-500">{report.content_type}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Add to sidebar navigation**

In `web/frontend/src/components/Sidebar.tsx`, add to the navigation items:

```tsx
{ href: '/knowledge-graph', label: 'Knowledge Graph', icon: '🕸️' },
```

**Step 5: Commit**

```bash
git add web/frontend/src/app/knowledge-graph/page.tsx web/frontend/src/lib/api.ts web/frontend/src/components/Sidebar.tsx web/frontend/package.json
git commit -m "feat(knowledge-graph): add interactive visualization page"
```

---

# Feature 2: AI-Powered Q&A System

**Goal:** Ask questions about your entire knowledge base and get synthesized answers with citations back to original reports.

**Dependencies:** None (uses existing reports and FTS)

---

## Task 2.1: Q&A Service

**Files:**
- Create: `web/backend/services/qa.py`

**Step 1: Create the Q&A service**

```python
"""Q&A service for asking questions about the knowledge base."""

import logging
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODELS
from database import search_reports, get_report_by_id

logger = logging.getLogger(__name__)

QA_SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on a personal knowledge base.

You will be given relevant excerpts from reports the user has saved. Use these to answer their question.

Guidelines:
1. Only use information from the provided context
2. Cite your sources using [Report Title] format
3. If the context doesn't contain enough information, say so
4. Be concise but thorough
5. If multiple sources agree, synthesize them
6. If sources disagree, note the different perspectives

Format your response with:
- A direct answer to the question
- Supporting details with citations
- A "Sources" section listing the reports used"""


def get_client() -> Anthropic:
    """Get Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


async def gather_context(query: str, max_reports: int = 5) -> list[dict]:
    """Search for relevant reports to answer the question."""
    # Search using FTS
    search_results = await search_reports(query, limit=max_reports)

    # Fetch full content for top results
    context_reports = []
    for result in search_results:
        report = await get_report_by_id(result["id"])
        if report and report.get("content"):
            context_reports.append({
                "id": report["id"],
                "title": report["title"],
                "content_type": report["content_type"],
                "content": report["content"][:10000],  # Limit content length
                "source_url": report.get("source_url"),
            })

    return context_reports


def format_context(reports: list[dict]) -> str:
    """Format reports into context string for the LLM."""
    if not reports:
        return "No relevant reports found in your knowledge base."

    context_parts = []
    for i, report in enumerate(reports, 1):
        context_parts.append(f"""
--- Report {i}: {report['title']} ---
Type: {report['content_type']}
Source: {report.get('source_url', 'N/A')}

{report['content']}
""")

    return "\n".join(context_parts)


async def answer_question(question: str, model_key: str = "sonnet") -> dict:
    """
    Answer a question using the knowledge base.

    Returns:
        dict with 'answer', 'sources', 'tokens_used'
    """
    try:
        # Gather relevant context
        context_reports = await gather_context(question)

        if not context_reports:
            return {
                "answer": "I couldn't find any relevant information in your knowledge base to answer this question. Try analyzing some content related to this topic first.",
                "sources": [],
                "tokens_used": 0,
            }

        # Format context
        context = format_context(context_reports)

        # Build prompt
        user_message = f"""Based on the following reports from my knowledge base, please answer this question:

Question: {question}

Knowledge Base Context:
{context}"""

        # Call Claude
        client = get_client()
        model_id = MODELS.get(model_key, MODELS["sonnet"])["id"]

        response = client.messages.create(
            model=model_id,
            max_tokens=2048,
            system=QA_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}]
        )

        answer = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens

        # Format sources
        sources = [
            {
                "id": r["id"],
                "title": r["title"],
                "type": r["content_type"],
                "url": r.get("source_url"),
            }
            for r in context_reports
        ]

        return {
            "answer": answer,
            "sources": sources,
            "tokens_used": tokens,
        }

    except Exception as e:
        logger.exception("Q&A failed")
        return {
            "answer": f"Error: {str(e)}",
            "sources": [],
            "tokens_used": 0,
        }
```

**Step 2: Commit**

```bash
git add web/backend/services/qa.py
git commit -m "feat(qa): add Q&A service with context retrieval"
```

---

## Task 2.2: Q&A API Router

**Files:**
- Create: `web/backend/routers/qa.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Q&A API endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.qa import answer_question

router = APIRouter(prefix="/qa", tags=["qa"])


class QuestionRequest(BaseModel):
    question: str
    model: str = "sonnet"


class SourceInfo(BaseModel):
    id: int
    title: str
    type: str
    url: Optional[str]


class AnswerResponse(BaseModel):
    answer: str
    sources: list[SourceInfo]
    tokens_used: int


@router.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    """Ask a question about your knowledge base."""
    result = await answer_question(
        question=request.question,
        model_key=request.model
    )
    return result
```

**Step 2: Register router in main.py**

Add to `web/backend/main.py`:

```python
from routers.qa import router as qa_router
app.include_router(qa_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/qa.py web/backend/main.py
git commit -m "feat(qa): add Q&A API endpoint"
```

---

## Task 2.3: Q&A Frontend Page

**Files:**
- Create: `web/frontend/src/app/ask/page.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/components/Sidebar.tsx`

**Step 1: Add API function**

Add to `web/frontend/src/lib/api.ts`:

```typescript
// ============ Q&A API ============

export interface QASource {
  id: number;
  title: string;
  type: string;
  url: string | null;
}

export interface QAResponse {
  answer: string;
  sources: QASource[];
  tokens_used: number;
}

export async function askQuestion(question: string, model: ModelKey = 'sonnet'): Promise<QAResponse> {
  const res = await fetch(`${API_BASE}/qa/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, model }),
  });
  if (!res.ok) throw new Error('Q&A request failed');
  return res.json();
}
```

**Step 2: Create the Q&A page**

Create `web/frontend/src/app/ask/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { askQuestion } from '@/lib/api';
import type { QAResponse, ModelKey } from '@/lib/api';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: QAResponse['sources'];
  tokens?: number;
}

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelKey>('sonnet');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const response = await askQuestion(question, model);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        tokens: response.tokens_used,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching your knowledge base.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What have I learned about productivity?",
    "Summarize the key ideas from my recent videos",
    "What books or papers have I analyzed?",
    "What are the most mentioned technologies?",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Ask Your Knowledge Base</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Ask questions and get answers synthesized from all your analyzed content.
      </p>

      {/* Chat messages */}
      <div className="space-y-4 mb-6 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Try asking a question like:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-100 dark:bg-blue-900/30 ml-12'
                  : 'bg-gray-100 dark:bg-gray-800 mr-12'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              {msg.role === 'assistant' ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                <p>{msg.content}</p>
              )}

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 mb-2">Sources:</div>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source) => (
                      <a
                        key={source.id}
                        href={`/reports/${source.id}`}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded border hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {msg.tokens && (
                <div className="text-xs text-gray-400 mt-2">
                  {msg.tokens.toLocaleString()} tokens used
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mr-12">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4">
        <div className="flex gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as ModelKey)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="haiku">Haiku (Fast)</option>
            <option value="sonnet">Sonnet (Balanced)</option>
            <option value="opus">Opus (Best)</option>
          </select>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your knowledge base..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Step 3: Add to sidebar**

In `web/frontend/src/components/Sidebar.tsx`:

```tsx
{ href: '/ask', label: 'Ask', icon: '💬' },
```

**Step 4: Commit**

```bash
git add web/frontend/src/app/ask/page.tsx web/frontend/src/lib/api.ts web/frontend/src/components/Sidebar.tsx
git commit -m "feat(qa): add Q&A chat interface"
```

---

# Feature 3: Content Comparison Mode

**Goal:** Compare 2-3 pieces of content on the same topic, highlighting agreements, contradictions, and unique perspectives.

**Dependencies:** None

---

## Task 3.1: Comparison Service

**Files:**
- Create: `web/backend/services/comparison.py`

**Step 1: Create the comparison service**

```python
"""Content comparison service."""

import logging
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODELS
from database import get_report_by_id

logger = logging.getLogger(__name__)

COMPARISON_PROMPT = """You are analyzing multiple pieces of content on a similar topic to create a comprehensive comparison.

For each source, I'll provide the title and content. Your task is to:

1. **Identify Common Themes**: Points where sources agree
2. **Highlight Contradictions**: Where sources disagree or have different perspectives
3. **Note Unique Insights**: Ideas that appear in only one source
4. **Synthesize a Balanced View**: Your overall assessment combining all perspectives
5. **Quality Assessment**: Which source seems most reliable/comprehensive and why

Format your response as:

## Common Ground
- [Point] (Sources: A, B)
- ...

## Differing Perspectives
| Topic | Source A | Source B | Source C |
|-------|----------|----------|----------|
| ... | ... | ... | ... |

## Unique Insights
### From [Source A Title]
- ...

### From [Source B Title]
- ...

## Synthesis
[Your balanced assessment]

## Source Quality Notes
[Brief assessment of each source's reliability/depth]
"""


def get_client() -> Anthropic:
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


async def compare_reports(report_ids: list[int], model_key: str = "sonnet") -> dict:
    """
    Compare multiple reports and generate analysis.

    Args:
        report_ids: List of 2-5 report IDs to compare
        model_key: Which model to use

    Returns:
        dict with 'comparison', 'reports', 'tokens_used'
    """
    if len(report_ids) < 2:
        raise ValueError("Need at least 2 reports to compare")
    if len(report_ids) > 5:
        raise ValueError("Maximum 5 reports for comparison")

    try:
        # Fetch all reports
        reports = []
        for rid in report_ids:
            report = await get_report_by_id(rid)
            if not report:
                raise ValueError(f"Report {rid} not found")
            reports.append(report)

        # Build comparison prompt
        sources_text = []
        for i, report in enumerate(reports):
            label = chr(65 + i)  # A, B, C, ...
            content = report.get("content", "")[:15000]  # Limit per source
            sources_text.append(f"""
=== Source {label}: {report['title']} ===
Type: {report['content_type']}
URL: {report.get('source_url', 'N/A')}

{content}
""")

        user_message = f"""{COMPARISON_PROMPT}

Here are the sources to compare:

{"".join(sources_text)}

Please provide a detailed comparison of these sources."""

        # Call Claude
        client = get_client()
        model_id = MODELS.get(model_key, MODELS["sonnet"])["id"]

        response = client.messages.create(
            model=model_id,
            max_tokens=4096,
            messages=[{"role": "user", "content": user_message}]
        )

        comparison = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens

        return {
            "comparison": comparison,
            "reports": [
                {"id": r["id"], "title": r["title"], "type": r["content_type"]}
                for r in reports
            ],
            "tokens_used": tokens,
        }

    except Exception as e:
        logger.exception("Comparison failed")
        raise
```

**Step 2: Commit**

```bash
git add web/backend/services/comparison.py
git commit -m "feat(compare): add content comparison service"
```

---

## Task 3.2: Comparison API Router

**Files:**
- Create: `web/backend/routers/comparison.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Content comparison API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.comparison import compare_reports

router = APIRouter(prefix="/compare", tags=["compare"])


class CompareRequest(BaseModel):
    report_ids: list[int]
    model: str = "sonnet"


class CompareResponse(BaseModel):
    comparison: str
    reports: list[dict]
    tokens_used: int


@router.post("", response_model=CompareResponse)
async def compare_content(request: CompareRequest):
    """Compare 2-5 reports and get analysis of similarities and differences."""
    try:
        result = await compare_reports(
            report_ids=request.report_ids,
            model_key=request.model
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

**Step 2: Register in main.py**

```python
from routers.comparison import router as comparison_router
app.include_router(comparison_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/comparison.py web/backend/main.py
git commit -m "feat(compare): add comparison API endpoint"
```

---

## Task 3.3: Comparison Frontend Page

**Files:**
- Create: `web/frontend/src/app/compare/page.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/components/Sidebar.tsx`

**Step 1: Add API function**

```typescript
// ============ COMPARISON API ============

export interface CompareResponse {
  comparison: string;
  reports: { id: number; title: string; type: string }[];
  tokens_used: number;
}

export async function compareReports(reportIds: number[], model: ModelKey = 'sonnet'): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_ids: reportIds, model }),
  });
  if (!res.ok) throw new Error('Comparison failed');
  return res.json();
}
```

**Step 2: Create the comparison page**

Create `web/frontend/src/app/compare/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchReports, compareReports } from '@/lib/api';
import type { Report, CompareResponse, ModelKey } from '@/lib/api';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

export default function ComparePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelKey>('sonnet');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports(undefined, 1, 100).then(data => setReports(data.items));
  }, []);

  const toggleReport = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 5) {
        return prev; // Max 5
      }
      return [...prev, id];
    });
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;

    setLoading(true);
    setComparison(null);

    try {
      const result = await compareReports(selectedIds, model);
      setComparison(result);
    } catch (err) {
      console.error('Comparison failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Compare Content</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select 2-5 reports to compare their perspectives, find agreements and contradictions.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="text-sm text-gray-500 mb-2">
            Selected: {selectedIds.length}/5
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredReports.map(report => (
              <label
                key={report.id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedIds.includes(report.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(report.id)}
                  onChange={() => toggleReport(report.id)}
                  disabled={!selectedIds.includes(report.id) && selectedIds.length >= 5}
                  className="rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{report.title}</div>
                  <div className="text-xs text-gray-500">{report.content_type}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelKey)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="haiku">Haiku</option>
              <option value="sonnet">Sonnet</option>
              <option value="opus">Opus</option>
            </select>
            <button
              onClick={handleCompare}
              disabled={selectedIds.length < 2 || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Comparing...' : `Compare ${selectedIds.length} Reports`}
            </button>
          </div>
        </div>

        {/* Comparison result */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
          {comparison ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Comparison Results</h2>
                <span className="text-xs text-gray-500">
                  {comparison.tokens_used.toLocaleString()} tokens
                </span>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownRenderer content={comparison.comparison} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select reports and click Compare to see the analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Add to sidebar**

```tsx
{ href: '/compare', label: 'Compare', icon: '⚖️' },
```

**Step 4: Commit**

```bash
git add web/frontend/src/app/compare/page.tsx web/frontend/src/lib/api.ts web/frontend/src/components/Sidebar.tsx
git commit -m "feat(compare): add comparison interface"
```

---

# Feature 4: Browser Extension

**Goal:** Chrome extension for one-click saving of URLs to Personal OS for analysis.

**Dependencies:** Backend must be running

---

## Task 4.1: Create Extension Structure

**Files:**
- Create: `extension/manifest.json`
- Create: `extension/popup.html`
- Create: `extension/popup.js`
- Create: `extension/background.js`
- Create: `extension/icons/` (placeholder)

**Step 1: Create manifest.json**

Create `extension/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Personal OS - Save to Knowledge Base",
  "version": "1.0.0",
  "description": "One-click save URLs to your Personal OS knowledge base",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "http://localhost:8000/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "background": {
    "service_worker": "background.js"
  }
}
```

**Step 2: Create popup.html**

Create `extension/popup.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      width: 320px;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
    }
    h1 {
      font-size: 16px;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .url {
      font-size: 12px;
      color: #666;
      word-break: break-all;
      margin-bottom: 12px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .type-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
    .type-youtube { background: #fee2e2; color: #dc2626; }
    .type-arxiv { background: #e0e7ff; color: #4f46e5; }
    .type-article { background: #dbeafe; color: #2563eb; }

    select, button {
      width: 100%;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 14px;
      margin-bottom: 8px;
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover {
      background: #1d4ed8;
    }
    button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    .status {
      text-align: center;
      padding: 8px;
      border-radius: 4px;
      font-size: 13px;
    }
    .status.success { background: #d1fae5; color: #065f46; }
    .status.error { background: #fee2e2; color: #dc2626; }
    .status.loading { background: #e0e7ff; color: #4f46e5; }
    .settings {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }
    .settings label {
      font-size: 12px;
      color: #666;
      display: block;
      margin-bottom: 4px;
    }
    .settings input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <h1>
    📚 Personal OS
  </h1>

  <div class="url" id="currentUrl">Loading...</div>

  <div id="typeContainer" style="margin-bottom: 12px;">
    <span class="type-badge" id="typeBadge">Detecting...</span>
  </div>

  <select id="modelSelect">
    <option value="haiku">Haiku (Fast, ~$0.01)</option>
    <option value="sonnet" selected>Sonnet (Balanced, ~$0.05)</option>
    <option value="opus">Opus (Best, ~$0.25)</option>
  </select>

  <button id="analyzeBtn" disabled>Analyze This Page</button>

  <div id="status" class="status" style="display: none;"></div>

  <div class="settings">
    <label>Backend URL</label>
    <input type="text" id="backendUrl" value="http://localhost:8000" />
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

**Step 3: Create popup.js**

Create `extension/popup.js`:

```javascript
// Detect content type from URL
function detectType(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('arxiv.org')) {
    return 'arxiv';
  }
  return 'article';
}

// Get badge class
function getBadgeClass(type) {
  return `type-badge type-${type}`;
}

// Format type name
function formatType(type) {
  const names = {
    youtube: 'YouTube Video',
    arxiv: 'arXiv Paper',
    article: 'Web Article'
  };
  return names[type] || 'Article';
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const urlEl = document.getElementById('currentUrl');
  const typeEl = document.getElementById('typeBadge');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const statusEl = document.getElementById('status');
  const modelSelect = document.getElementById('modelSelect');
  const backendUrlInput = document.getElementById('backendUrl');

  // Load saved settings
  const stored = await chrome.storage.local.get(['backendUrl', 'model']);
  if (stored.backendUrl) {
    backendUrlInput.value = stored.backendUrl;
  }
  if (stored.model) {
    modelSelect.value = stored.model;
  }

  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  urlEl.textContent = url.length > 60 ? url.substring(0, 60) + '...' : url;

  const type = detectType(url);
  typeEl.className = getBadgeClass(type);
  typeEl.textContent = formatType(type);

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = `Analyze ${formatType(type)}`;

  // Save settings on change
  modelSelect.addEventListener('change', () => {
    chrome.storage.local.set({ model: modelSelect.value });
  });

  backendUrlInput.addEventListener('change', () => {
    chrome.storage.local.set({ backendUrl: backendUrlInput.value });
  });

  // Handle analyze button
  analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    statusEl.style.display = 'block';
    statusEl.className = 'status loading';
    statusEl.textContent = 'Sending to Personal OS...';

    try {
      const backendUrl = backendUrlInput.value.replace(/\/$/, '');
      const model = modelSelect.value;

      const response = await fetch(`${backendUrl}/api/analysis/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, model })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      statusEl.className = 'status success';
      statusEl.textContent = `✓ Analysis started! Job ID: ${data.job_id.slice(0, 8)}...`;

      // Open the web UI
      chrome.tabs.create({ url: `${backendUrl.replace(':8000', ':3000')}/analyze` });

    } catch (err) {
      statusEl.className = 'status error';
      statusEl.textContent = `Error: ${err.message}. Is the backend running?`;
      analyzeBtn.disabled = false;
    }
  });
});
```

**Step 4: Create background.js (minimal service worker)**

Create `extension/background.js`:

```javascript
// Background service worker
// Handles any background tasks if needed

chrome.runtime.onInstalled.addListener(() => {
  console.log('Personal OS extension installed');
});
```

**Step 5: Create placeholder icons**

Create `extension/icons/` directory and add a note:

```
extension/icons/README.md:

# Extension Icons

Place the following icon files here:
- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

Use a simple book or brain icon in these sizes.
```

**Step 6: Commit**

```bash
git add extension/
git commit -m "feat(extension): add Chrome extension for one-click saving"
```

---

## Task 4.2: Add CORS Support for Extension

**Files:**
- Modify: `web/backend/main.py`

**Step 1: Update CORS middleware**

Ensure the CORS middleware in `main.py` allows the extension origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "chrome-extension://*",  # Allow Chrome extensions
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Step 2: Commit**

```bash
git add web/backend/main.py
git commit -m "feat(extension): add CORS support for Chrome extension"
```

---

# Feature 5: Audio Report Generation (TTS)

**Goal:** Convert any report to audio using text-to-speech for passive listening.

**Dependencies:** OpenAI API key (for TTS) or local TTS engine

---

## Task 5.1: TTS Service

**Files:**
- Create: `web/backend/services/tts.py`
- Modify: `web/backend/config.py`

**Step 1: Update config with OpenAI settings**

Add to `web/backend/config.py`:

```python
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AUDIO_DIR = BASE_DIR / "audio"
AUDIO_DIR.mkdir(exist_ok=True)
```

**Step 2: Create TTS service**

Create `web/backend/services/tts.py`:

```python
"""Text-to-Speech service for generating audio from reports."""

import hashlib
import logging
from pathlib import Path
from openai import OpenAI

from config import OPENAI_API_KEY, AUDIO_DIR

logger = logging.getLogger(__name__)


def get_openai_client() -> OpenAI:
    """Get OpenAI client."""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not set. Add it to web/backend/.env")
    return OpenAI(api_key=OPENAI_API_KEY)


def extract_spoken_text(markdown_content: str) -> str:
    """
    Extract readable text from markdown, removing formatting.
    Optimized for TTS.
    """
    import re

    text = markdown_content

    # Remove code blocks
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]+`', '', text)

    # Remove links but keep text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)

    # Remove images
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)

    # Remove headers markers but keep text
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)

    # Remove bold/italic markers
    text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text)
    text = re.sub(r'_{1,2}([^_]+)_{1,2}', r'\1', text)

    # Remove bullet points
    text = re.sub(r'^[\-\*]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)

    # Remove horizontal rules
    text = re.sub(r'^[\-\*_]{3,}$', '', text, flags=re.MULTILINE)

    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()

    return text


async def generate_audio(
    content: str,
    report_id: int,
    voice: str = "alloy"
) -> Path:
    """
    Generate audio from text content.

    Args:
        content: The text content to convert
        report_id: Report ID for file naming
        voice: OpenAI TTS voice (alloy, echo, fable, onyx, nova, shimmer)

    Returns:
        Path to the generated audio file
    """
    # Create cache key from content hash
    content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
    audio_filename = f"report_{report_id}_{voice}_{content_hash}.mp3"
    audio_path = AUDIO_DIR / audio_filename

    # Return cached file if exists
    if audio_path.exists():
        logger.info(f"Using cached audio: {audio_path}")
        return audio_path

    try:
        client = get_openai_client()

        # Extract spoken text
        spoken_text = extract_spoken_text(content)

        # OpenAI TTS has a 4096 character limit per request
        # For longer content, we need to chunk
        max_chars = 4000

        if len(spoken_text) <= max_chars:
            # Single request
            response = client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=spoken_text
            )
            response.stream_to_file(str(audio_path))
        else:
            # Multiple chunks - combine audio files
            chunks = []
            for i in range(0, len(spoken_text), max_chars):
                chunk = spoken_text[i:i + max_chars]
                # Try to break at sentence boundary
                if i + max_chars < len(spoken_text):
                    last_period = chunk.rfind('.')
                    if last_period > max_chars * 0.7:
                        chunk = spoken_text[i:i + last_period + 1]
                chunks.append(chunk)

            # Generate audio for each chunk
            chunk_paths = []
            for idx, chunk in enumerate(chunks):
                chunk_path = AUDIO_DIR / f"temp_{report_id}_{idx}.mp3"
                response = client.audio.speech.create(
                    model="tts-1",
                    voice=voice,
                    input=chunk
                )
                response.stream_to_file(str(chunk_path))
                chunk_paths.append(chunk_path)

            # Combine chunks (simple concatenation for MP3)
            with open(audio_path, 'wb') as outfile:
                for chunk_path in chunk_paths:
                    with open(chunk_path, 'rb') as infile:
                        outfile.write(infile.read())
                    chunk_path.unlink()  # Delete temp file

        logger.info(f"Generated audio: {audio_path}")
        return audio_path

    except Exception as e:
        logger.exception("TTS generation failed")
        raise


def get_audio_path(report_id: int) -> Path | None:
    """Get existing audio file for a report if it exists."""
    for audio_file in AUDIO_DIR.glob(f"report_{report_id}_*.mp3"):
        return audio_file
    return None
```

**Step 3: Commit**

```bash
git add web/backend/services/tts.py web/backend/config.py
git commit -m "feat(audio): add TTS service for report audio generation"
```

---

## Task 5.2: Audio API Router

**Files:**
- Create: `web/backend/routers/audio.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Audio generation API endpoints."""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Literal

from database import get_report_by_id
from services.tts import generate_audio, get_audio_path

router = APIRouter(prefix="/audio", tags=["audio"])


class AudioRequest(BaseModel):
    voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "alloy"


class AudioStatus(BaseModel):
    report_id: int
    has_audio: bool
    audio_url: str | None


@router.get("/{report_id}/status", response_model=AudioStatus)
async def get_audio_status(report_id: int):
    """Check if audio exists for a report."""
    audio_path = get_audio_path(report_id)
    return {
        "report_id": report_id,
        "has_audio": audio_path is not None,
        "audio_url": f"/api/audio/{report_id}/file" if audio_path else None
    }


@router.post("/{report_id}/generate")
async def generate_report_audio(
    report_id: int,
    request: AudioRequest,
    background_tasks: BackgroundTasks
):
    """Generate audio for a report."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    content = report.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Report has no content")

    # Check if already exists
    existing = get_audio_path(report_id)
    if existing:
        return {
            "status": "exists",
            "audio_url": f"/api/audio/{report_id}/file"
        }

    # Generate in background
    background_tasks.add_task(generate_audio, content, report_id, request.voice)

    return {
        "status": "generating",
        "message": "Audio generation started. Check status endpoint."
    }


@router.get("/{report_id}/file")
async def get_audio_file(report_id: int):
    """Stream the audio file for a report."""
    audio_path = get_audio_path(report_id)
    if not audio_path:
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename=audio_path.name
    )
```

**Step 2: Register in main.py**

```python
from routers.audio import router as audio_router
app.include_router(audio_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/audio.py web/backend/main.py
git commit -m "feat(audio): add audio API endpoints"
```

---

## Task 5.3: Audio Player Frontend Component

**Files:**
- Create: `web/frontend/src/components/AudioPlayer.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/app/reports/[id]/page.tsx`

**Step 1: Add API functions**

```typescript
// ============ AUDIO API ============

export interface AudioStatus {
  report_id: number;
  has_audio: boolean;
  audio_url: string | null;
}

export async function getAudioStatus(reportId: number): Promise<AudioStatus> {
  const res = await fetch(`${API_BASE}/audio/${reportId}/status`);
  if (!res.ok) throw new Error('Failed to get audio status');
  return res.json();
}

export async function generateAudio(
  reportId: number,
  voice: string = 'alloy'
): Promise<{ status: string; audio_url?: string }> {
  const res = await fetch(`${API_BASE}/audio/${reportId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice }),
  });
  if (!res.ok) throw new Error('Failed to generate audio');
  return res.json();
}
```

**Step 2: Create AudioPlayer component**

Create `web/frontend/src/components/AudioPlayer.tsx`:

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getAudioStatus, generateAudio } from '@/lib/api';

interface AudioPlayerProps {
  reportId: number;
}

const voices = [
  { id: 'alloy', name: 'Alloy (Neutral)' },
  { id: 'echo', name: 'Echo (Male)' },
  { id: 'fable', name: 'Fable (British)' },
  { id: 'onyx', name: 'Onyx (Deep)' },
  { id: 'nova', name: 'Nova (Female)' },
  { id: 'shimmer', name: 'Shimmer (Soft)' },
];

export function AudioPlayer({ reportId }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [voice, setVoice] = useState('alloy');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setLoading(true);
    getAudioStatus(reportId)
      .then(status => {
        if (status.has_audio && status.audio_url) {
          setAudioUrl(status.audio_url);
        }
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateAudio(reportId, voice);
      if (result.audio_url) {
        setAudioUrl(result.audio_url);
      } else {
        // Poll for completion
        const poll = setInterval(async () => {
          const status = await getAudioStatus(reportId);
          if (status.has_audio && status.audio_url) {
            setAudioUrl(status.audio_url);
            clearInterval(poll);
            setGenerating(false);
          }
        }, 2000);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(poll);
          setGenerating(false);
        }, 120000);
      }
    } catch (err) {
      console.error('Failed to generate audio:', err);
      setGenerating(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading audio...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🔊</span>
        <span className="font-medium">Listen to Report</span>
      </div>

      {audioUrl ? (
        <div className="space-y-2">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="w-full"
            controls
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate an audio version of this report to listen on the go.
          </p>
          <div className="flex gap-2">
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              disabled={generating}
            >
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Audio'}
            </button>
          </div>
          {generating && (
            <p className="text-xs text-gray-500">
              This may take a minute for longer reports...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add to report detail page**

In `web/frontend/src/app/reports/[id]/page.tsx`, import and add the AudioPlayer:

```tsx
import { AudioPlayer } from '@/components/AudioPlayer';

// In the JSX, add after the report header:
<AudioPlayer reportId={report.id} />
```

**Step 4: Commit**

```bash
git add web/frontend/src/components/AudioPlayer.tsx web/frontend/src/lib/api.ts web/frontend/src/app/reports/[id]/page.tsx
git commit -m "feat(audio): add audio player component to report page"
```

---

# Feature 6: Spaced Repetition Review System

**Goal:** Built-in review scheduler that surfaces old reports at optimal intervals for retention.

**Dependencies:** None

---

## Task 6.1: Database Schema for Review System

**Files:**
- Modify: `web/backend/database.py`

**Step 1: Add review tables to schema**

```python
-- Spaced repetition reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL UNIQUE,
    ease_factor REAL DEFAULT 2.5,  -- SM-2 algorithm factor
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review_date DATE NOT NULL,
    last_review_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Review history
CREATE TABLE IF NOT EXISTS review_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    quality INTEGER NOT NULL,  -- 0-5 rating
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    interval_days INTEGER,
    ease_factor REAL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_next ON reviews(next_review_date);
CREATE INDEX IF NOT EXISTS idx_reviews_report ON reviews(report_id);
```

**Step 2: Add review database operations**

```python
from datetime import date, timedelta

# Spaced Repetition operations
async def get_due_reviews(limit: int = 10) -> list[dict]:
    """Get reports due for review today or earlier."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        today = date.today().isoformat()
        cursor = await db.execute(
            """SELECT r.id, r.title, r.content_type, r.summary,
                      rv.ease_factor, rv.interval_days, rv.repetitions, rv.next_review_date
               FROM reviews rv
               JOIN reports r ON rv.report_id = r.id
               WHERE rv.next_review_date <= ?
               ORDER BY rv.next_review_date ASC
               LIMIT ?""",
            (today, limit)
        )
        return [dict(row) for row in await cursor.fetchall()]


async def add_to_review_queue(report_id: int):
    """Add a report to the review queue."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        await db.execute(
            """INSERT OR IGNORE INTO reviews (report_id, next_review_date)
               VALUES (?, ?)""",
            (report_id, tomorrow)
        )
        await db.commit()


async def record_review(report_id: int, quality: int) -> dict:
    """
    Record a review using SM-2 algorithm.

    Quality: 0-5
    - 0: Complete blackout
    - 1: Incorrect, remembered upon seeing answer
    - 2: Incorrect, but correct answer seemed easy
    - 3: Correct with serious difficulty
    - 4: Correct with some hesitation
    - 5: Perfect response
    """
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Get current review state
        cursor = await db.execute(
            "SELECT * FROM reviews WHERE report_id = ?",
            (report_id,)
        )
        review = await cursor.fetchone()

        if not review:
            # First review
            ease_factor = 2.5
            interval = 1
            repetitions = 0
        else:
            ease_factor = review["ease_factor"]
            interval = review["interval_days"]
            repetitions = review["repetitions"]

        # SM-2 algorithm
        if quality < 3:
            # Failed - reset
            repetitions = 0
            interval = 1
        else:
            # Success
            if repetitions == 0:
                interval = 1
            elif repetitions == 1:
                interval = 6
            else:
                interval = round(interval * ease_factor)
            repetitions += 1

        # Update ease factor
        ease_factor = max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

        # Calculate next review date
        next_date = (date.today() + timedelta(days=interval)).isoformat()
        today = date.today().isoformat()

        # Update or insert review
        await db.execute(
            """INSERT INTO reviews (report_id, ease_factor, interval_days, repetitions, next_review_date, last_review_date)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(report_id) DO UPDATE SET
                   ease_factor = excluded.ease_factor,
                   interval_days = excluded.interval_days,
                   repetitions = excluded.repetitions,
                   next_review_date = excluded.next_review_date,
                   last_review_date = excluded.last_review_date""",
            (report_id, ease_factor, interval, repetitions, next_date, today)
        )

        # Record in history
        await db.execute(
            """INSERT INTO review_history (report_id, quality, interval_days, ease_factor)
               VALUES (?, ?, ?, ?)""",
            (report_id, quality, interval, ease_factor)
        )

        await db.commit()

        return {
            "report_id": report_id,
            "next_review_date": next_date,
            "interval_days": interval,
            "ease_factor": ease_factor,
            "repetitions": repetitions
        }


async def get_review_stats() -> dict:
    """Get review statistics."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        today = date.today().isoformat()

        # Count due today
        cursor = await db.execute(
            "SELECT COUNT(*) as count FROM reviews WHERE next_review_date <= ?",
            (today,)
        )
        due_count = (await cursor.fetchone())["count"]

        # Count total in queue
        cursor = await db.execute("SELECT COUNT(*) as count FROM reviews")
        total_count = (await cursor.fetchone())["count"]

        # Reviews completed today
        cursor = await db.execute(
            "SELECT COUNT(*) as count FROM review_history WHERE date(reviewed_at) = ?",
            (today,)
        )
        reviewed_today = (await cursor.fetchone())["count"]

        # Current streak
        cursor = await db.execute(
            """SELECT COUNT(DISTINCT date(reviewed_at)) as streak
               FROM review_history
               WHERE date(reviewed_at) >= date('now', '-30 days')"""
        )
        streak = (await cursor.fetchone())["streak"]

        return {
            "due_count": due_count,
            "total_in_queue": total_count,
            "reviewed_today": reviewed_today,
            "streak_days": streak
        }
```

**Step 3: Commit**

```bash
git add web/backend/database.py
git commit -m "feat(review): add spaced repetition database schema"
```

---

## Task 6.2: Review API Router

**Files:**
- Create: `web/backend/routers/review.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Spaced repetition review API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from database import (
    get_due_reviews,
    add_to_review_queue,
    record_review,
    get_review_stats,
    get_report_by_id,
)

router = APIRouter(prefix="/review", tags=["review"])


class ReviewRequest(BaseModel):
    quality: Literal[0, 1, 2, 3, 4, 5]


class ReviewResponse(BaseModel):
    report_id: int
    next_review_date: str
    interval_days: int
    ease_factor: float
    repetitions: int


class ReviewStats(BaseModel):
    due_count: int
    total_in_queue: int
    reviewed_today: int
    streak_days: int


@router.get("/due")
async def get_due(limit: int = 10):
    """Get reports due for review."""
    reviews = await get_due_reviews(limit)
    return {"items": reviews, "count": len(reviews)}


@router.get("/stats", response_model=ReviewStats)
async def get_stats():
    """Get review statistics."""
    return await get_review_stats()


@router.post("/queue/{report_id}")
async def add_to_queue(report_id: int):
    """Add a report to the review queue."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    await add_to_review_queue(report_id)
    return {"status": "added", "report_id": report_id}


@router.post("/{report_id}", response_model=ReviewResponse)
async def submit_review(report_id: int, request: ReviewRequest):
    """Submit a review for a report."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    result = await record_review(report_id, request.quality)
    return result
```

**Step 2: Register in main.py**

```python
from routers.review import router as review_router
app.include_router(review_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/review.py web/backend/main.py
git commit -m "feat(review): add spaced repetition API endpoints"
```

---

## Task 6.3: Review Frontend Page

**Files:**
- Create: `web/frontend/src/app/review/page.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/components/Sidebar.tsx`

**Step 1: Add API functions**

```typescript
// ============ REVIEW API ============

export interface ReviewItem {
  id: number;
  title: string;
  content_type: string;
  summary: string | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
}

export interface ReviewStats {
  due_count: number;
  total_in_queue: number;
  reviewed_today: number;
  streak_days: number;
}

export interface ReviewResult {
  report_id: number;
  next_review_date: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
}

export async function fetchDueReviews(limit = 10): Promise<{ items: ReviewItem[]; count: number }> {
  const res = await fetch(`${API_BASE}/review/due?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch due reviews');
  return res.json();
}

export async function fetchReviewStats(): Promise<ReviewStats> {
  const res = await fetch(`${API_BASE}/review/stats`);
  if (!res.ok) throw new Error('Failed to fetch review stats');
  return res.json();
}

export async function addToReviewQueue(reportId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/review/queue/${reportId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to add to review queue');
}

export async function submitReview(reportId: number, quality: number): Promise<ReviewResult> {
  const res = await fetch(`${API_BASE}/review/${reportId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quality }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}
```

**Step 2: Create review page**

Create `web/frontend/src/app/review/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchDueReviews, fetchReviewStats, submitReview, fetchReport } from '@/lib/api';
import type { ReviewItem, ReviewStats, Report } from '@/lib/api';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const qualityButtons = [
  { value: 0, label: 'Blackout', color: 'bg-red-600', desc: "Can't remember anything" },
  { value: 1, label: 'Wrong', color: 'bg-red-500', desc: 'Incorrect, recognized answer' },
  { value: 2, label: 'Hard', color: 'bg-orange-500', desc: 'Incorrect, answer seemed easy' },
  { value: 3, label: 'Difficult', color: 'bg-yellow-500', desc: 'Correct with difficulty' },
  { value: 4, label: 'Good', color: 'bg-green-500', desc: 'Correct with hesitation' },
  { value: 5, label: 'Easy', color: 'bg-green-600', desc: 'Perfect recall' },
];

export default function ReviewPage() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, dueData] = await Promise.all([
        fetchReviewStats(),
        fetchDueReviews(20)
      ]);
      setStats(statsData);
      setDueItems(dueData.items);
      setCurrentIndex(0);
      setShowAnswer(false);

      if (dueData.items.length > 0) {
        const report = await fetchReport(dueData.items[0].id);
        setCurrentReport(report);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuality = async (quality: number) => {
    if (!currentReport) return;

    await submitReview(currentReport.id, quality);

    // Move to next
    const nextIndex = currentIndex + 1;
    if (nextIndex < dueItems.length) {
      setCurrentIndex(nextIndex);
      setShowAnswer(false);
      const report = await fetchReport(dueItems[nextIndex].id);
      setCurrentReport(report);
    } else {
      // No more reviews
      loadData();
    }

    // Refresh stats
    const newStats = await fetchReviewStats();
    setStats(newStats);
  };

  const currentItem = dueItems[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Spaced Repetition Review</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review your knowledge to strengthen retention
          </p>
        </div>
        {stats && (
          <div className="flex gap-4 text-center">
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.due_count}</div>
              <div className="text-xs text-gray-500">Due Today</div>
            </div>
            <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.reviewed_today}</div>
              <div className="text-xs text-gray-500">Reviewed</div>
            </div>
            <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.streak_days}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : dueItems.length === 0 ? (
        <div className="text-center py-12 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No reviews due. Come back tomorrow or add more reports to your review queue.
          </p>
          <Link
            href="/reports"
            className="text-blue-600 hover:underline"
          >
            Browse Reports →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentIndex / dueItems.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {dueItems.length}
            </span>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
            {/* Question side */}
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-2">{currentItem?.content_type}</div>
              <h2 className="text-xl font-semibold mb-4">{currentItem?.title}</h2>

              {!showAnswer ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Try to recall the key points from this content...</p>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Show Summary
                  </button>
                </div>
              ) : (
                <div>
                  <div className="border-t dark:border-gray-700 pt-4 mb-6">
                    {currentReport?.content ? (
                      <div className="prose dark:prose-invert max-w-none max-h-96 overflow-y-auto">
                        <MarkdownRenderer content={currentReport.summary || currentReport.content.slice(0, 2000)} />
                      </div>
                    ) : (
                      <p>{currentItem?.summary || 'No summary available'}</p>
                    )}
                  </div>

                  {/* Quality buttons */}
                  <div className="border-t dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 mb-3">How well did you remember this?</p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {qualityButtons.map(btn => (
                        <button
                          key={btn.value}
                          onClick={() => handleQuality(btn.value)}
                          className={`${btn.color} text-white p-3 rounded-lg hover:opacity-90 transition`}
                          title={btn.desc}
                        >
                          <div className="font-medium">{btn.label}</div>
                          <div className="text-xs opacity-75">{btn.value}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/reports/${currentItem?.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View Full Report →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add to sidebar**

```tsx
{ href: '/review', label: 'Review', icon: '🧠' },
```

**Step 4: Commit**

```bash
git add web/frontend/src/app/review/page.tsx web/frontend/src/lib/api.ts web/frontend/src/components/Sidebar.tsx
git commit -m "feat(review): add spaced repetition review interface"
```

---

# Feature 7: Source Credibility Analysis

**Goal:** Evaluate sources for potential bias, citation quality, and claim verification.

**Dependencies:** None

---

## Task 7.1: Credibility Analysis Service

**Files:**
- Create: `web/backend/services/credibility.py`

**Step 1: Create the service**

```python
"""Source credibility analysis service."""

import json
import logging
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODELS

logger = logging.getLogger(__name__)

CREDIBILITY_PROMPT = """Analyze the credibility and reliability of this content.

Evaluate the following aspects and provide scores (0-100) for each:

1. **Source Authority** (0-100)
   - Is the author/source an expert or authoritative voice?
   - Are credentials clearly stated?
   - What is the publication's reputation?

2. **Evidence Quality** (0-100)
   - Are claims supported by data, citations, or references?
   - Is the methodology clear (for research)?
   - Are sources primary or secondary?

3. **Bias Assessment** (0-100, where 100 = completely neutral)
   - Is there ideological, political, or commercial bias?
   - Are multiple perspectives presented?
   - Is the tone emotional or factual?

4. **Accuracy Indicators** (0-100)
   - Are there any verifiable facts that can be checked?
   - Is the information consistent with known facts?
   - Are there obvious errors or outdated information?

5. **Transparency** (0-100)
   - Is the author/organization clearly identified?
   - Are conflicts of interest disclosed?
   - Is the date and context provided?

Also provide:
- **Overall Credibility Score** (weighted average)
- **Key Concerns**: List any specific issues found
- **Strengths**: What makes this source credible
- **Recommendation**: How to treat this information

Return JSON in this format:
{
  "scores": {
    "authority": 75,
    "evidence": 80,
    "bias": 60,
    "accuracy": 85,
    "transparency": 70
  },
  "overall_score": 74,
  "key_concerns": ["No citations provided", "Author credentials unclear"],
  "strengths": ["Factual tone", "Consistent with known information"],
  "recommendation": "Treat with moderate confidence, verify key claims",
  "detailed_analysis": "Full paragraph explanation..."
}

Content to analyze:
"""


def get_client() -> Anthropic:
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


async def analyze_credibility(content: str, title: str, source_url: str = None, model_key: str = "sonnet") -> dict:
    """
    Analyze the credibility of content.

    Returns credibility scores and analysis.
    """
    try:
        client = get_client()
        model_id = MODELS.get(model_key, MODELS["sonnet"])["id"]

        # Include source URL if available for domain analysis
        context = f"Title: {title}\n"
        if source_url:
            context += f"Source URL: {source_url}\n"
        context += f"\nContent:\n{content[:30000]}"  # Limit content length

        response = client.messages.create(
            model=model_id,
            max_tokens=2048,
            messages=[{
                "role": "user",
                "content": CREDIBILITY_PROMPT + context
            }]
        )

        response_text = response.content[0].text

        # Extract JSON from response
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end]
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end]

        result = json.loads(response_text.strip())

        return {
            "scores": result.get("scores", {}),
            "overall_score": result.get("overall_score", 0),
            "key_concerns": result.get("key_concerns", []),
            "strengths": result.get("strengths", []),
            "recommendation": result.get("recommendation", ""),
            "detailed_analysis": result.get("detailed_analysis", ""),
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse credibility response: {e}")
        return {"error": "Failed to analyze credibility"}
    except Exception as e:
        logger.exception("Credibility analysis failed")
        return {"error": str(e)}
```

**Step 2: Commit**

```bash
git add web/backend/services/credibility.py
git commit -m "feat(credibility): add source credibility analysis service"
```

---

## Task 7.2: Credibility API Router

**Files:**
- Create: `web/backend/routers/credibility.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Source credibility API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_report_by_id
from services.credibility import analyze_credibility

router = APIRouter(prefix="/credibility", tags=["credibility"])


class CredibilityScores(BaseModel):
    authority: int
    evidence: int
    bias: int
    accuracy: int
    transparency: int


class CredibilityResponse(BaseModel):
    scores: CredibilityScores
    overall_score: int
    key_concerns: list[str]
    strengths: list[str]
    recommendation: str
    detailed_analysis: str
    tokens_used: int


@router.post("/{report_id}", response_model=CredibilityResponse)
async def analyze_report_credibility(report_id: int, model: str = "sonnet"):
    """Analyze the credibility of a report's source."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    content = report.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Report has no content")

    result = await analyze_credibility(
        content=content,
        title=report["title"],
        source_url=report.get("source_url"),
        model_key=model
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result
```

**Step 2: Register in main.py**

```python
from routers.credibility import router as credibility_router
app.include_router(credibility_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/credibility.py web/backend/main.py
git commit -m "feat(credibility): add credibility API endpoint"
```

---

## Task 7.3: Credibility UI Component

**Files:**
- Create: `web/frontend/src/components/CredibilityAnalysis.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/app/reports/[id]/page.tsx`

**Step 1: Add API function**

```typescript
// ============ CREDIBILITY API ============

export interface CredibilityScores {
  authority: number;
  evidence: number;
  bias: number;
  accuracy: number;
  transparency: number;
}

export interface CredibilityResponse {
  scores: CredibilityScores;
  overall_score: number;
  key_concerns: string[];
  strengths: string[];
  recommendation: string;
  detailed_analysis: string;
  tokens_used: number;
}

export async function analyzeCredibility(reportId: number, model: ModelKey = 'sonnet'): Promise<CredibilityResponse> {
  const res = await fetch(`${API_BASE}/credibility/${reportId}?model=${model}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Credibility analysis failed');
  return res.json();
}
```

**Step 2: Create component**

Create `web/frontend/src/components/CredibilityAnalysis.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { analyzeCredibility } from '@/lib/api';
import type { CredibilityResponse, ModelKey } from '@/lib/api';

interface Props {
  reportId: number;
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function CredibilityAnalysis({ reportId }: Props) {
  const [result, setResult] = useState<CredibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await analyzeCredibility(reportId);
      setResult(data);
      setExpanded(true);
    } catch (err) {
      console.error('Credibility analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <span className="font-medium">Source Credibility</span>
        </div>
        {result && (
          <div className={`text-2xl font-bold ${getScoreColor(result.overall_score)}`}>
            {result.overall_score}/100
          </div>
        )}
      </div>

      {!result ? (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Analyze this source for bias, evidence quality, and reliability.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Credibility'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score bars */}
          <div className="space-y-3">
            <ScoreBar label="Authority" score={result.scores.authority} color={getBarColor(result.scores.authority)} />
            <ScoreBar label="Evidence" score={result.scores.evidence} color={getBarColor(result.scores.evidence)} />
            <ScoreBar label="Neutrality" score={result.scores.bias} color={getBarColor(result.scores.bias)} />
            <ScoreBar label="Accuracy" score={result.scores.accuracy} color={getBarColor(result.scores.accuracy)} />
            <ScoreBar label="Transparency" score={result.scores.transparency} color={getBarColor(result.scores.transparency)} />
          </div>

          {/* Recommendation */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Recommendation
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {result.recommendation}
            </p>
          </div>

          {/* Expandable details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>

          {expanded && (
            <div className="space-y-3 text-sm">
              {result.key_concerns.length > 0 && (
                <div>
                  <div className="font-medium text-red-600 mb-1">Concerns</div>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {result.key_concerns.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {result.strengths.length > 0 && (
                <div>
                  <div className="font-medium text-green-600 mb-1">Strengths</div>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              <div className="text-gray-600 dark:text-gray-400">
                {result.detailed_analysis}
              </div>

              <div className="text-xs text-gray-500">
                {result.tokens_used.toLocaleString()} tokens used
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add to report page**

Import and add in `web/frontend/src/app/reports/[id]/page.tsx`:

```tsx
import { CredibilityAnalysis } from '@/components/CredibilityAnalysis';

// Add in the sidebar or below AudioPlayer:
<CredibilityAnalysis reportId={report.id} />
```

**Step 4: Commit**

```bash
git add web/frontend/src/components/CredibilityAnalysis.tsx web/frontend/src/lib/api.ts web/frontend/src/app/reports/[id]/page.tsx
git commit -m "feat(credibility): add credibility analysis UI"
```

---

# Feature 8: Learning Goals & Progress Tracking

**Goal:** Set learning goals and track progress across related content.

**Dependencies:** None

---

## Task 8.1: Goals Database Schema

**Files:**
- Modify: `web/backend/database.py`

**Step 1: Add goals tables**

```python
-- Learning goals
CREATE TABLE IF NOT EXISTS learning_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    target_count INTEGER DEFAULT 10,  -- target number of reports
    status TEXT DEFAULT 'active',  -- active, completed, paused
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- Goal keywords for matching reports
CREATE TABLE IF NOT EXISTS goal_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL,
    keyword TEXT NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES learning_goals(id) ON DELETE CASCADE
);

-- Reports linked to goals
CREATE TABLE IF NOT EXISTS goal_reports (
    goal_id INTEGER NOT NULL,
    report_id INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (goal_id, report_id),
    FOREIGN KEY (goal_id) REFERENCES learning_goals(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goal_keywords ON goal_keywords(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_reports ON goal_reports(goal_id);
```

**Step 2: Add goal database operations**

```python
# Learning Goals operations
async def create_goal(title: str, description: str = None, keywords: list[str] = None, target_count: int = 10) -> dict:
    """Create a new learning goal."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "INSERT INTO learning_goals (title, description, target_count) VALUES (?, ?, ?) RETURNING *",
            (title, description, target_count)
        )
        goal = dict(await cursor.fetchone())

        # Add keywords
        if keywords:
            for kw in keywords:
                await db.execute(
                    "INSERT INTO goal_keywords (goal_id, keyword) VALUES (?, ?)",
                    (goal["id"], kw.lower())
                )

        await db.commit()
        goal["keywords"] = keywords or []
        goal["report_count"] = 0
        return goal


async def get_goals() -> list[dict]:
    """Get all learning goals with progress."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        cursor = await db.execute(
            """SELECT g.*, COUNT(gr.report_id) as report_count
               FROM learning_goals g
               LEFT JOIN goal_reports gr ON g.id = gr.goal_id
               GROUP BY g.id
               ORDER BY g.created_at DESC"""
        )
        goals = [dict(row) for row in await cursor.fetchall()]

        # Get keywords for each goal
        for goal in goals:
            cursor = await db.execute(
                "SELECT keyword FROM goal_keywords WHERE goal_id = ?",
                (goal["id"],)
            )
            goal["keywords"] = [row["keyword"] for row in await cursor.fetchall()]

        return goals


async def get_goal_by_id(goal_id: int) -> dict | None:
    """Get a goal with its reports."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        cursor = await db.execute(
            "SELECT * FROM learning_goals WHERE id = ?", (goal_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return None

        goal = dict(row)

        # Get keywords
        cursor = await db.execute(
            "SELECT keyword FROM goal_keywords WHERE goal_id = ?",
            (goal_id,)
        )
        goal["keywords"] = [row["keyword"] for row in await cursor.fetchall()]

        # Get linked reports
        cursor = await db.execute(
            """SELECT r.id, r.title, r.content_type, r.created_at, r.summary
               FROM reports r
               JOIN goal_reports gr ON r.id = gr.report_id
               WHERE gr.goal_id = ?
               ORDER BY gr.added_at DESC""",
            (goal_id,)
        )
        goal["reports"] = [dict(row) for row in await cursor.fetchall()]
        goal["report_count"] = len(goal["reports"])

        return goal


async def link_report_to_goal(goal_id: int, report_id: int):
    """Link a report to a goal."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO goal_reports (goal_id, report_id) VALUES (?, ?)",
            (goal_id, report_id)
        )
        await db.commit()


async def auto_link_report_to_goals(report_id: int, content: str):
    """Automatically link a report to goals based on keyword matching."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        content_lower = content.lower()

        # Get all active goals with keywords
        cursor = await db.execute(
            """SELECT DISTINCT g.id, gk.keyword
               FROM learning_goals g
               JOIN goal_keywords gk ON g.id = gk.goal_id
               WHERE g.status = 'active'"""
        )

        matched_goals = set()
        for row in await cursor.fetchall():
            if row["keyword"] in content_lower:
                matched_goals.add(row["id"])

        # Link to matched goals
        for goal_id in matched_goals:
            await db.execute(
                "INSERT OR IGNORE INTO goal_reports (goal_id, report_id) VALUES (?, ?)",
                (goal_id, report_id)
            )

        await db.commit()
        return list(matched_goals)


async def update_goal_status(goal_id: int, status: str):
    """Update goal status."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        completed_at = datetime.now().isoformat() if status == "completed" else None
        await db.execute(
            "UPDATE learning_goals SET status = ?, completed_at = ? WHERE id = ?",
            (status, completed_at, goal_id)
        )
        await db.commit()


async def delete_goal(goal_id: int):
    """Delete a learning goal."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("DELETE FROM learning_goals WHERE id = ?", (goal_id,))
        await db.commit()
```

**Step 3: Commit**

```bash
git add web/backend/database.py
git commit -m "feat(goals): add learning goals database schema"
```

---

## Task 8.2: Goals API Router

**Files:**
- Create: `web/backend/routers/goals.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Learning goals API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
from database import (
    create_goal,
    get_goals,
    get_goal_by_id,
    link_report_to_goal,
    update_goal_status,
    delete_goal,
)

router = APIRouter(prefix="/goals", tags=["goals"])


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    keywords: list[str] = []
    target_count: int = 10


class GoalUpdate(BaseModel):
    status: Literal["active", "completed", "paused"]


class Goal(BaseModel):
    id: int
    title: str
    description: Optional[str]
    target_count: int
    status: str
    keywords: list[str]
    report_count: int


@router.get("")
async def list_goals():
    """Get all learning goals."""
    goals = await get_goals()
    return {"items": goals}


@router.post("", response_model=Goal)
async def create_new_goal(request: GoalCreate):
    """Create a new learning goal."""
    goal = await create_goal(
        title=request.title,
        description=request.description,
        keywords=request.keywords,
        target_count=request.target_count
    )
    return goal


@router.get("/{goal_id}")
async def get_goal(goal_id: int):
    """Get a goal with its linked reports."""
    goal = await get_goal_by_id(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.put("/{goal_id}")
async def update_goal(goal_id: int, request: GoalUpdate):
    """Update goal status."""
    goal = await get_goal_by_id(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await update_goal_status(goal_id, request.status)
    return {"status": "updated"}


@router.delete("/{goal_id}")
async def remove_goal(goal_id: int):
    """Delete a learning goal."""
    await delete_goal(goal_id)
    return {"status": "deleted"}


@router.post("/{goal_id}/reports/{report_id}")
async def add_report_to_goal(goal_id: int, report_id: int):
    """Manually link a report to a goal."""
    await link_report_to_goal(goal_id, report_id)
    return {"status": "linked"}
```

**Step 2: Register in main.py**

```python
from routers.goals import router as goals_router
app.include_router(goals_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/goals.py web/backend/main.py
git commit -m "feat(goals): add learning goals API"
```

---

## Task 8.3: Goals Frontend Page

**Files:**
- Create: `web/frontend/src/app/goals/page.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/components/Sidebar.tsx`

**Step 1: Add API functions**

```typescript
// ============ GOALS API ============

export interface LearningGoal {
  id: number;
  title: string;
  description: string | null;
  target_count: number;
  status: 'active' | 'completed' | 'paused';
  keywords: string[];
  report_count: number;
  reports?: Report[];
}

export async function fetchGoals(): Promise<{ items: LearningGoal[] }> {
  const res = await fetch(`${API_BASE}/goals`);
  if (!res.ok) throw new Error('Failed to fetch goals');
  return res.json();
}

export async function fetchGoal(id: number): Promise<LearningGoal> {
  const res = await fetch(`${API_BASE}/goals/${id}`);
  if (!res.ok) throw new Error('Failed to fetch goal');
  return res.json();
}

export async function createGoal(data: {
  title: string;
  description?: string;
  keywords: string[];
  target_count: number;
}): Promise<LearningGoal> {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
}

export async function updateGoalStatus(id: number, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update goal');
}

export async function deleteGoal(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/goals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete goal');
}

export async function linkReportToGoal(goalId: number, reportId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/goals/${goalId}/reports/${reportId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to link report');
}
```

**Step 2: Create goals page**

Create `web/frontend/src/app/goals/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchGoals, createGoal, updateGoalStatus, deleteGoal } from '@/lib/api';
import type { LearningGoal } from '@/lib/api';

function ProgressRing({ progress, size = 60 }: { progress: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="text-gray-200 dark:text-gray-700"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-blue-600"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', keywords: '', target_count: 10 });
  const [loading, setLoading] = useState(true);

  const loadGoals = async () => {
    try {
      const data = await fetchGoals();
      setGoals(data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal({
      title: newGoal.title,
      description: newGoal.description || undefined,
      keywords: newGoal.keywords.split(',').map(k => k.trim()).filter(Boolean),
      target_count: newGoal.target_count,
    });
    setShowCreate(false);
    setNewGoal({ title: '', description: '', keywords: '', target_count: 10 });
    loadGoals();
  };

  const handleStatusChange = async (goal: LearningGoal, status: string) => {
    await updateGoalStatus(goal.id, status);
    loadGoals();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this goal?')) {
      await deleteGoal(id);
      loadGoals();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Learning Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your learning progress across topics
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Goal
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h3 className="font-semibold mb-4">Create Learning Goal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Learn Machine Learning"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="What do you want to learn?"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
              <input
                type="text"
                value={newGoal.keywords}
                onChange={(e) => setNewGoal({ ...newGoal, keywords: e.target.value })}
                placeholder="machine learning, neural networks, deep learning"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Reports matching these keywords will be auto-linked</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Reports</label>
              <input
                type="number"
                value={newGoal.target_count}
                onChange={(e) => setNewGoal({ ...newGoal, target_count: parseInt(e.target.value) || 10 })}
                min={1}
                className="w-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Goal
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No learning goals yet. Create one to start tracking your progress!
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = Math.min(100, (goal.report_count / goal.target_count) * 100);
            return (
              <div
                key={goal.id}
                className={`p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 ${
                  goal.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <ProgressRing progress={progress} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{Math.round(progress)}%</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/goals/${goal.id}`} className="text-lg font-semibold hover:text-blue-600">
                        {goal.title}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        goal.status === 'active' ? 'bg-green-100 text-green-700' :
                        goal.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {goal.status}
                      </span>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{goal.report_count} / {goal.target_count} reports</span>
                      {goal.keywords.length > 0 && (
                        <span>Keywords: {goal.keywords.join(', ')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {goal.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(goal, 'completed')}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Complete
                      </button>
                    )}
                    {goal.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(goal, 'paused')}
                        className="text-yellow-600 hover:text-yellow-700 text-sm"
                      >
                        Pause
                      </button>
                    )}
                    {goal.status === 'paused' && (
                      <button
                        onClick={() => handleStatusChange(goal, 'active')}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add to sidebar**

```tsx
{ href: '/goals', label: 'Goals', icon: '🎯' },
```

**Step 4: Commit**

```bash
git add web/frontend/src/app/goals/page.tsx web/frontend/src/lib/api.ts web/frontend/src/components/Sidebar.tsx
git commit -m "feat(goals): add learning goals interface"
```

---

# Feature 9: Multi-Language Translation & Analysis

**Goal:** Analyze content in any language with automatic translation.

**Dependencies:** None (uses Claude for translation)

---

## Task 9.1: Translation Service

**Files:**
- Create: `web/backend/services/translation.py`

**Step 1: Create the service**

```python
"""Translation service for multi-language support."""

import logging
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODELS

logger = logging.getLogger(__name__)


def get_client() -> Anthropic:
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


async def detect_language(content: str, model_key: str = "haiku") -> dict:
    """
    Detect the language of content.

    Returns:
        dict with 'language', 'confidence', 'language_code'
    """
    try:
        client = get_client()
        model_id = MODELS.get(model_key, MODELS["haiku"])["id"]

        # Use first 1000 chars for detection
        sample = content[:1000]

        response = client.messages.create(
            model=model_id,
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": f"""Detect the language of this text. Reply with ONLY a JSON object:
{{"language": "English", "language_code": "en", "confidence": 0.95}}

Text: {sample}"""
            }]
        )

        import json
        result = json.loads(response.content[0].text.strip())
        return result

    except Exception as e:
        logger.exception("Language detection failed")
        return {"language": "Unknown", "language_code": "unknown", "confidence": 0}


async def translate_content(
    content: str,
    source_language: str = None,
    target_language: str = "English",
    model_key: str = "sonnet"
) -> dict:
    """
    Translate content to target language.

    Returns:
        dict with 'translated_content', 'source_language', 'target_language', 'tokens_used'
    """
    try:
        client = get_client()
        model_id = MODELS.get(model_key, MODELS["sonnet"])["id"]

        # Detect source language if not provided
        if not source_language:
            detection = await detect_language(content)
            source_language = detection.get("language", "Unknown")

        # If already in target language, return as-is
        if source_language.lower() == target_language.lower():
            return {
                "translated_content": content,
                "source_language": source_language,
                "target_language": target_language,
                "tokens_used": 0,
                "was_translated": False
            }

        # Translate
        prompt = f"""Translate the following text from {source_language} to {target_language}.
Preserve the original formatting, structure, and meaning as much as possible.
If there are technical terms, provide both the translation and original term in parentheses.

Text to translate:
{content}"""

        response = client.messages.create(
            model=model_id,
            max_tokens=16000,
            messages=[{"role": "user", "content": prompt}]
        )

        translated = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens

        return {
            "translated_content": translated,
            "source_language": source_language,
            "target_language": target_language,
            "tokens_used": tokens,
            "was_translated": True
        }

    except Exception as e:
        logger.exception("Translation failed")
        return {"error": str(e)}
```

**Step 2: Commit**

```bash
git add web/backend/services/translation.py
git commit -m "feat(translate): add translation service"
```

---

## Task 9.2: Translation API Router

**Files:**
- Create: `web/backend/routers/translate.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Translation API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_report_by_id
from services.translation import detect_language, translate_content

router = APIRouter(prefix="/translate", tags=["translate"])


class DetectRequest(BaseModel):
    content: str


class DetectResponse(BaseModel):
    language: str
    language_code: str
    confidence: float


class TranslateRequest(BaseModel):
    content: str
    source_language: Optional[str] = None
    target_language: str = "English"
    model: str = "sonnet"


class TranslateResponse(BaseModel):
    translated_content: str
    source_language: str
    target_language: str
    tokens_used: int
    was_translated: bool


@router.post("/detect", response_model=DetectResponse)
async def detect(request: DetectRequest):
    """Detect the language of content."""
    result = await detect_language(request.content)
    return result


@router.post("", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    """Translate content to target language."""
    result = await translate_content(
        content=request.content,
        source_language=request.source_language,
        target_language=request.target_language,
        model_key=request.model
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result


@router.post("/report/{report_id}")
async def translate_report(
    report_id: int,
    target_language: str = "English",
    model: str = "sonnet"
):
    """Translate a report's content."""
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    content = report.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Report has no content")

    result = await translate_content(
        content=content,
        target_language=target_language,
        model_key=model
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result
```

**Step 2: Register in main.py**

```python
from routers.translate import router as translate_router
app.include_router(translate_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/translate.py web/backend/main.py
git commit -m "feat(translate): add translation API endpoints"
```

---

## Task 9.3: Translation UI Integration

**Files:**
- Create: `web/frontend/src/components/TranslatePanel.tsx`
- Modify: `web/frontend/src/lib/api.ts`

**Step 1: Add API functions**

```typescript
// ============ TRANSLATION API ============

export interface DetectLanguageResponse {
  language: string;
  language_code: string;
  confidence: number;
}

export interface TranslateResponse {
  translated_content: string;
  source_language: string;
  target_language: string;
  tokens_used: number;
  was_translated: boolean;
}

export async function detectLanguage(content: string): Promise<DetectLanguageResponse> {
  const res = await fetch(`${API_BASE}/translate/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Language detection failed');
  return res.json();
}

export async function translateContent(
  content: string,
  targetLanguage: string = 'English',
  sourceLanguage?: string,
  model: ModelKey = 'sonnet'
): Promise<TranslateResponse> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      target_language: targetLanguage,
      source_language: sourceLanguage,
      model,
    }),
  });
  if (!res.ok) throw new Error('Translation failed');
  return res.json();
}

export async function translateReport(
  reportId: number,
  targetLanguage: string = 'English',
  model: ModelKey = 'sonnet'
): Promise<TranslateResponse> {
  const res = await fetch(
    `${API_BASE}/translate/report/${reportId}?target_language=${targetLanguage}&model=${model}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Translation failed');
  return res.json();
}
```

**Step 2: Create component**

Create `web/frontend/src/components/TranslatePanel.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { translateReport } from '@/lib/api';
import type { TranslateResponse, ModelKey } from '@/lib/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  reportId: number;
  detectedLanguage?: string;
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi'
];

export function TranslatePanel({ reportId, detectedLanguage }: Props) {
  const [targetLang, setTargetLang] = useState('English');
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const data = await translateReport(reportId, targetLang);
      setResult(data);
      setShowTranslation(true);
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🌐</span>
        <span className="font-medium">Translate</span>
        {detectedLanguage && (
          <span className="text-xs text-gray-500">
            (Detected: {detectedLanguage})
          </span>
        )}
      </div>

      {!showTranslation ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Translate this report to another language.
          </p>
          <div className="flex gap-2">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              disabled={loading}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>
      ) : result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {result.source_language} → {result.target_language}
              {result.tokens_used > 0 && ` (${result.tokens_used.toLocaleString()} tokens)`}
            </span>
            <button
              onClick={() => setShowTranslation(false)}
              className="text-sm text-blue-600 hover:underline"
            >
              Hide
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto prose dark:prose-invert text-sm">
            <MarkdownRenderer content={result.translated_content} />
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add web/frontend/src/components/TranslatePanel.tsx web/frontend/src/lib/api.ts
git commit -m "feat(translate): add translation UI component"
```

---

# Feature 10: Smart Content Recommendations

**Goal:** Suggest related content from the web based on analyzed content and interests.

**Dependencies:** None

---

## Task 10.1: Recommendations Service

**Files:**
- Create: `web/backend/services/recommendations.py`

**Step 1: Create the service**

```python
"""Smart content recommendations service."""

import json
import logging
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODELS
from database import get_reports, search_reports

logger = logging.getLogger(__name__)

RECOMMENDATIONS_PROMPT = """Based on the user's reading history and interests, suggest relevant content they might want to explore next.

User's Recent Content:
{recent_content}

Generate 5-10 specific recommendations. For each, provide:
1. A search query they could use to find this content
2. Why it's relevant to their interests
3. What type of content it is (video, article, paper, etc.)

Return JSON array:
[
  {{
    "title": "Suggested topic or specific content title",
    "query": "search query to find this",
    "reason": "Why this is relevant",
    "type": "video|article|paper|book|podcast",
    "difficulty": "beginner|intermediate|advanced"
  }}
]

Focus on:
- Content that builds on what they've learned
- Related topics they haven't explored yet
- Different perspectives on topics they've studied
- Foundational content if they're exploring advanced topics
"""


def get_client() -> Anthropic:
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


async def get_user_interests() -> str:
    """Build a summary of user interests from recent reports."""
    reports, _ = await get_reports(page_size=20)

    if not reports:
        return "No reading history yet."

    summaries = []
    for r in reports[:10]:  # Top 10 recent
        summaries.append(f"- {r['title']} ({r['content_type']}): {r.get('summary', 'No summary')[:200]}")

    return "\n".join(summaries)


async def generate_recommendations(model_key: str = "sonnet") -> list[dict]:
    """
    Generate content recommendations based on user's reading history.

    Returns list of recommendation dicts.
    """
    try:
        client = get_client()
        model_id = MODELS.get(model_key, MODELS["sonnet"])["id"]

        # Get user interests
        interests = await get_user_interests()

        if interests == "No reading history yet.":
            # Return generic starter recommendations
            return [
                {
                    "title": "Start with YouTube educational content",
                    "query": "best educational YouTube channels 2024",
                    "reason": "Great way to start building your knowledge base",
                    "type": "video",
                    "difficulty": "beginner"
                },
                {
                    "title": "Explore popular science articles",
                    "query": "popular science articles for beginners",
                    "reason": "Accessible entry point to scientific topics",
                    "type": "article",
                    "difficulty": "beginner"
                }
            ]

        prompt = RECOMMENDATIONS_PROMPT.format(recent_content=interests)

        response = client.messages.create(
            model=model_id,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text

        # Extract JSON
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end]
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end]

        recommendations = json.loads(response_text.strip())

        return recommendations

    except Exception as e:
        logger.exception("Recommendations generation failed")
        return []


async def get_similar_in_library(report_id: int, limit: int = 5) -> list[dict]:
    """Find similar reports in the user's library."""
    from database import get_report_by_id

    report = await get_report_by_id(report_id)
    if not report:
        return []

    # Use title words as search query
    title = report["title"]
    words = title.split()[:5]  # First 5 words
    query = " OR ".join(words)

    results = await search_reports(query, limit=limit + 1)

    # Filter out the source report
    return [r for r in results if r["id"] != report_id][:limit]
```

**Step 2: Commit**

```bash
git add web/backend/services/recommendations.py
git commit -m "feat(recommendations): add smart recommendations service"
```

---

## Task 10.2: Recommendations API Router

**Files:**
- Create: `web/backend/routers/recommendations.py`
- Modify: `web/backend/main.py`

**Step 1: Create the router**

```python
"""Content recommendations API endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.recommendations import generate_recommendations, get_similar_in_library

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class Recommendation(BaseModel):
    title: str
    query: str
    reason: str
    type: str
    difficulty: str


class SimilarReport(BaseModel):
    id: int
    title: str
    content_type: str


@router.get("", response_model=list[Recommendation])
async def get_recommendations(model: str = "sonnet"):
    """Get personalized content recommendations."""
    recommendations = await generate_recommendations(model_key=model)
    return recommendations


@router.get("/similar/{report_id}", response_model=list[SimilarReport])
async def get_similar(report_id: int, limit: int = 5):
    """Get similar reports from your library."""
    similar = await get_similar_in_library(report_id, limit)
    return similar
```

**Step 2: Register in main.py**

```python
from routers.recommendations import router as recommendations_router
app.include_router(recommendations_router)
```

**Step 3: Commit**

```bash
git add web/backend/routers/recommendations.py web/backend/main.py
git commit -m "feat(recommendations): add recommendations API"
```

---

## Task 10.3: Recommendations Frontend

**Files:**
- Create: `web/frontend/src/app/discover/page.tsx`
- Modify: `web/frontend/src/lib/api.ts`
- Modify: `web/frontend/src/components/Sidebar.tsx`

**Step 1: Add API functions**

```typescript
// ============ RECOMMENDATIONS API ============

export interface Recommendation {
  title: string;
  query: string;
  reason: string;
  type: string;
  difficulty: string;
}

export interface SimilarReport {
  id: number;
  title: string;
  content_type: string;
}

export async function fetchRecommendations(model: ModelKey = 'sonnet'): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations?model=${model}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchSimilarReports(reportId: number, limit = 5): Promise<SimilarReport[]> {
  const res = await fetch(`${API_BASE}/recommendations/similar/${reportId}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch similar reports');
  return res.json();
}
```

**Step 2: Create discover page**

Create `web/frontend/src/app/discover/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchRecommendations } from '@/lib/api';
import type { Recommendation, ModelKey } from '@/lib/api';

const typeIcons: Record<string, string> = {
  video: '📹',
  article: '📄',
  paper: '📚',
  book: '📖',
  podcast: '🎧',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function DiscoverPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = async () => {
    try {
      const data = await fetchRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecommendations();
  };

  const handleSearch = (query: string) => {
    // Open search in new tab
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized recommendations based on your reading history
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
          <p className="text-gray-500">Generating recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 mb-4">
            Start analyzing content to get personalized recommendations!
          </p>
          <a
            href="/analyze"
            className="text-blue-600 hover:underline"
          >
            Analyze your first piece of content →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{typeIcons[rec.type] || '📌'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[rec.difficulty] || 'bg-gray-100'}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rec.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSearch(rec.query)}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    >
                      Search: "{rec.query}"
                    </button>
                    <span className="text-xs text-gray-400 capitalize">{rec.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium mb-2">💡 Tips for Discovery</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Analyze more diverse content to get better recommendations</li>
          <li>• Click on search queries to find content on Google</li>
          <li>• Refresh to get new recommendations based on your latest activity</li>
          <li>• Mix different content types for a well-rounded knowledge base</li>
        </ul>
      </div>
    </div>
  );
}
```

**Step 3: Add to sidebar**

```tsx
{ href: '/discover', label: 'Discover', icon: '✨' },
```

**Step 4: Commit**

```bash
git add web/frontend/src/app/discover/page.tsx web/frontend/src/lib/api.ts web/frontend/src/components/Sidebar.tsx
git commit -m "feat(recommendations): add discovery page"
```

---

# Final Summary

## Files Created/Modified

### New Backend Files (16)
- `web/backend/services/concept_extractor.py`
- `web/backend/services/qa.py`
- `web/backend/services/comparison.py`
- `web/backend/services/tts.py`
- `web/backend/services/credibility.py`
- `web/backend/services/translation.py`
- `web/backend/services/recommendations.py`
- `web/backend/routers/knowledge_graph.py`
- `web/backend/routers/qa.py`
- `web/backend/routers/comparison.py`
- `web/backend/routers/audio.py`
- `web/backend/routers/review.py`
- `web/backend/routers/credibility.py`
- `web/backend/routers/goals.py`
- `web/backend/routers/translate.py`
- `web/backend/routers/recommendations.py`

### Modified Backend Files (3)
- `web/backend/database.py` (schema + operations)
- `web/backend/main.py` (router registrations)
- `web/backend/config.py` (OPENAI_API_KEY, AUDIO_DIR)

### New Frontend Files (9)
- `web/frontend/src/app/knowledge-graph/page.tsx`
- `web/frontend/src/app/ask/page.tsx`
- `web/frontend/src/app/compare/page.tsx`
- `web/frontend/src/app/review/page.tsx`
- `web/frontend/src/app/goals/page.tsx`
- `web/frontend/src/app/discover/page.tsx`
- `web/frontend/src/components/AudioPlayer.tsx`
- `web/frontend/src/components/CredibilityAnalysis.tsx`
- `web/frontend/src/components/TranslatePanel.tsx`

### Modified Frontend Files (3)
- `web/frontend/src/lib/api.ts` (all new API functions)
- `web/frontend/src/components/Sidebar.tsx` (navigation links)
- `web/frontend/src/app/reports/[id]/page.tsx` (AudioPlayer, CredibilityAnalysis, TranslatePanel)

### New Extension Files (4)
- `extension/manifest.json`
- `extension/popup.html`
- `extension/popup.js`
- `extension/background.js`

### Dependencies to Add

**Backend (`web/backend/requirements.txt`):**
```
openai>=1.0.0  # For TTS
```

**Frontend (`web/frontend/package.json`):**
```json
{
  "react-force-graph-2d": "^1.25.0"
}
```

---

## Execution Options

**Plan complete and saved to `docs/plans/2025-12-26-ten-new-features.md`.**

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session in worktree with executing-plans skill, batch execution with checkpoints

Which approach would you like to use?
