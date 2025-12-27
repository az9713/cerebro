"""Cerebro Web Backend - FastAPI Application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, API_PREFIX
from routers import reports, logs, analysis, batch, tags, collections, transcription, rss, export, knowledge_graph, qa, comparison, tts, reviews, credibility, goals, translate, recommendations
from services.indexer import run_initial_index, FileWatcher

# File watcher for auto-indexing new reports
file_watcher = FileWatcher()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    # Startup: index filesystem and start file watcher
    logger.info("Starting Cerebro backend...")
    await run_initial_index()
    file_watcher.start()
    logger.info("Cerebro backend ready (file watcher active)")

    yield

    # Shutdown
    file_watcher.stop()
    logger.info("Shutting down Cerebro backend...")


app = FastAPI(
    title="Cerebro API",
    description="Personal OS for content consumption - Web API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(reports.router, prefix=f"{API_PREFIX}/reports", tags=["Reports"])
app.include_router(logs.router, prefix=f"{API_PREFIX}/logs", tags=["Activity Logs"])
app.include_router(analysis.router, prefix=f"{API_PREFIX}/analysis", tags=["Analysis"])
app.include_router(batch.router, prefix=f"{API_PREFIX}/batch", tags=["Batch Processing"])
app.include_router(tags.router, prefix=f"{API_PREFIX}/tags", tags=["Tags"])
app.include_router(collections.router, prefix=f"{API_PREFIX}/collections", tags=["Collections"])
app.include_router(transcription.router, prefix=f"{API_PREFIX}/transcription", tags=["Transcription"])
app.include_router(rss.router, prefix=f"{API_PREFIX}/rss", tags=["RSS Feeds"])
app.include_router(export.router, prefix=f"{API_PREFIX}/export", tags=["Export"])
app.include_router(knowledge_graph.router, prefix=f"{API_PREFIX}/knowledge-graph", tags=["Knowledge Graph"])
app.include_router(qa.router, prefix=f"{API_PREFIX}/qa", tags=["Q&A"])
app.include_router(comparison.router, prefix=f"{API_PREFIX}/comparison", tags=["Comparison"])
app.include_router(tts.router, prefix=f"{API_PREFIX}/tts", tags=["Text-to-Speech"])
app.include_router(reviews.router, prefix=f"{API_PREFIX}/reviews", tags=["Spaced Repetition"])
app.include_router(credibility.router, prefix=f"{API_PREFIX}/credibility", tags=["Credibility"])
app.include_router(goals.router, prefix=f"{API_PREFIX}/goals", tags=["Learning Goals"])
app.include_router(translate.router, prefix=f"{API_PREFIX}/translate", tags=["Translation"])
app.include_router(recommendations.router, prefix=f"{API_PREFIX}/recommendations", tags=["Recommendations"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "name": "Cerebro API",
        "status": "running",
        "docs": "/docs",
    }


@app.post(f"{API_PREFIX}/sync")
async def trigger_sync():
    """Manually trigger filesystem re-index."""
    await run_initial_index()
    return {"status": "Sync completed"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
