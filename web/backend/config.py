"""Configuration for the Cerebro web backend."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv(Path(__file__).parent / ".env")

# Project root (parent of web/)
PROJECT_ROOT = Path(__file__).parent.parent.parent

# Anthropic API
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Available models with display names and pricing info
MODELS = {
    "haiku": {
        "id": "claude-3-5-haiku-latest",
        "name": "Haiku 3.5",
        "description": "Fast & affordable",
        "input_cost": 0.80,  # per 1M tokens
        "output_cost": 4.00,
    },
    "sonnet": {
        "id": "claude-sonnet-4-20250514",
        "name": "Sonnet 4",
        "description": "Balanced (recommended)",
        "input_cost": 3.00,
        "output_cost": 15.00,
    },
    "opus": {
        "id": "claude-opus-4-20250514",
        "name": "Opus 4",
        "description": "Most capable",
        "input_cost": 15.00,
        "output_cost": 75.00,
    },
}

DEFAULT_MODEL = "sonnet"

# Content directories
REPORTS_DIR = PROJECT_ROOT / "reports"
LOGS_DIR = PROJECT_ROOT / "logs"
INBOX_DIR = PROJECT_ROOT / "inbox"
PROMPTS_DIR = PROJECT_ROOT / "prompts"

# Database
DATABASE_PATH = Path(__file__).parent / "cerebro.db"

# Content type subdirectories
CONTENT_TYPES = {
    "youtube": REPORTS_DIR / "youtube",
    "article": REPORTS_DIR / "articles",
    "paper": REPORTS_DIR / "papers",
    "other": REPORTS_DIR / "other",
}

# API settings
API_PREFIX = "/api"
CORS_ORIGINS = ["http://localhost:3000"]
