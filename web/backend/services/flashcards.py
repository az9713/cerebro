"""Anki flashcard generation service."""

import logging
import re
import csv
import io
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from config import PROJECT_ROOT, REPORTS_DIR

logger = logging.getLogger(__name__)


@dataclass
class Flashcard:
    """A single flashcard."""
    front: str  # Question
    back: str   # Answer
    tags: List[str]
    source: str
    deck: str = "Personal OS"


def extract_key_takeaways(content: str) -> List[Dict[str, str]]:
    """Extract key takeaways as Q&A pairs."""
    cards = []

    # Find key takeaways section
    takeaways_match = re.search(
        r'(?:##?\s*(?:Key Takeaways?|Main Points?|Summary Points?))\s*\n(.*?)(?=\n##|\Z)',
        content,
        re.IGNORECASE | re.DOTALL
    )

    if takeaways_match:
        section = takeaways_match.group(1)

        # Parse numbered or bulleted items
        items = re.findall(r'(?:^|\n)\s*(?:\d+\.|\-|\*)\s*(.+?)(?=\n\s*(?:\d+\.|\-|\*)|\n\n|\Z)', section, re.DOTALL)

        for item in items:
            item = item.strip()
            if len(item) > 20:  # Skip very short items
                # Create a question from the takeaway
                cards.append({
                    "front": f"What is a key insight about this topic?",
                    "back": item,
                    "type": "takeaway"
                })

    return cards


def extract_definitions(content: str) -> List[Dict[str, str]]:
    """Extract definitions and concepts as flashcards."""
    cards = []

    # Look for definition patterns
    # Pattern: **Term**: Definition
    definitions = re.findall(r'\*\*([^*]+)\*\*:\s*([^*\n]+)', content)

    for term, definition in definitions:
        term = term.strip()
        definition = definition.strip()

        # Skip metadata fields
        if term.lower() in ['source', 'date', 'type', 'author', 'tags', 'host', 'guest', 'podcast']:
            continue

        if len(definition) > 20 and len(term) < 100:
            cards.append({
                "front": f"What is {term}?",
                "back": definition,
                "type": "definition"
            })

    return cards


def extract_quotes(content: str) -> List[Dict[str, str]]:
    """Extract notable quotes as flashcards."""
    cards = []

    # Find quotes section
    quotes_match = re.search(
        r'(?:##?\s*(?:Notable Quotes?|Key Quotes?|Memorable Quotes?))\s*\n(.*?)(?=\n##|\Z)',
        content,
        re.IGNORECASE | re.DOTALL
    )

    if quotes_match:
        section = quotes_match.group(1)

        # Find quoted text
        quotes = re.findall(r'[">]\s*([^"<]+)[">]', section)

        for quote in quotes:
            quote = quote.strip()
            if len(quote) > 30:
                cards.append({
                    "front": "Complete this quote or explain its significance:",
                    "back": quote,
                    "type": "quote"
                })

    return cards


def extract_qa_from_report(report_path: Path) -> List[Flashcard]:
    """
    Extract flashcards from a report.

    Looks for:
    - Key takeaways
    - Definitions
    - Notable quotes
    - Action items
    """
    content = report_path.read_text(encoding="utf-8", errors="replace")

    # Get metadata
    title = "Untitled"
    for line in content.split('\n'):
        if line.startswith('# '):
            title = line[2:].strip()
            break

    report_type = report_path.parent.name
    source = str(report_path.relative_to(PROJECT_ROOT))

    # Extract cards
    all_cards = []
    all_cards.extend(extract_key_takeaways(content))
    all_cards.extend(extract_definitions(content))
    all_cards.extend(extract_quotes(content))

    # Convert to Flashcard objects
    flashcards = []
    for card in all_cards:
        # Add context to front
        front = f"{card['front']}\n\n(From: {title})"

        flashcards.append(Flashcard(
            front=front,
            back=card["back"],
            tags=[report_type, card["type"]],
            source=source,
            deck=f"Personal OS::{report_type.title()}"
        ))

    return flashcards


def generate_anki_csv(flashcards: List[Flashcard]) -> str:
    """
    Generate CSV content for Anki import.

    Format: front, back, tags
    """
    output = io.StringIO()
    writer = csv.writer(output, delimiter='\t')

    # Anki CSV format: front, back, tags
    for card in flashcards:
        tags = ' '.join(card.tags)
        writer.writerow([card.front, card.back, tags])

    return output.getvalue()


def generate_anki_deck(flashcards: List[Flashcard], deck_name: str = "Personal OS") -> Dict[str, Any]:
    """
    Generate Anki deck structure.

    Returns dict that can be converted to .apkg format.
    """
    return {
        "deck_name": deck_name,
        "deck_id": hash(deck_name) % (10 ** 9),
        "created": datetime.now().isoformat(),
        "cards": [
            {
                "id": hash(f"{card.front}{card.back}") % (10 ** 9),
                "front": card.front,
                "back": card.back,
                "tags": card.tags,
                "source": card.source,
            }
            for card in flashcards
        ],
        "total_cards": len(flashcards),
    }


async def generate_flashcards_for_report(
    report_path: Path,
    output_format: str = "csv"
) -> Dict[str, Any]:
    """
    Generate flashcards for a single report.

    Args:
        report_path: Path to the report file
        output_format: "csv" or "json"

    Returns:
        Dict with flashcards and output content
    """
    if not report_path.exists():
        raise FileNotFoundError(f"Report not found: {report_path}")

    flashcards = extract_qa_from_report(report_path)

    if not flashcards:
        return {
            "cards_generated": 0,
            "message": "No flashcards could be generated from this report.",
            "output": None,
        }

    if output_format == "csv":
        output = generate_anki_csv(flashcards)
    else:
        deck = generate_anki_deck(flashcards)
        output = deck

    return {
        "cards_generated": len(flashcards),
        "output": output,
        "format": output_format,
    }


async def generate_flashcards_batch(
    reports: Optional[List[Path]] = None,
    output_file: Optional[Path] = None,
    output_format: str = "csv"
) -> Dict[str, Any]:
    """
    Generate flashcards for multiple reports.

    Args:
        reports: List of report paths (None = all reports)
        output_file: Where to save the output
        output_format: "csv" or "json"

    Returns:
        Dict with statistics and output path
    """
    if reports is None:
        reports = []
        for category_dir in REPORTS_DIR.iterdir():
            if category_dir.is_dir():
                reports.extend(category_dir.glob("*.md"))

    all_flashcards = []
    stats = {"processed": 0, "cards": 0, "failed": 0}

    for report_path in reports:
        try:
            cards = extract_qa_from_report(report_path)
            all_flashcards.extend(cards)
            stats["processed"] += 1
            stats["cards"] += len(cards)
        except Exception as e:
            logger.error(f"Failed to process {report_path}: {e}")
            stats["failed"] += 1

    if not all_flashcards:
        return {
            **stats,
            "message": "No flashcards generated.",
            "output_file": None,
        }

    # Generate output
    if output_format == "csv":
        output_content = generate_anki_csv(all_flashcards)
        suffix = ".txt"  # Anki prefers .txt for tab-separated
    else:
        import json
        deck = generate_anki_deck(all_flashcards)
        output_content = json.dumps(deck, indent=2, ensure_ascii=False)
        suffix = ".json"

    # Save output
    if output_file is None:
        output_dir = PROJECT_ROOT / "exports"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"anki-flashcards-{datetime.now().strftime('%Y%m%d')}{suffix}"

    output_file = Path(output_file)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(output_content, encoding="utf-8")

    stats["output_file"] = str(output_file)
    logger.info(f"Generated {stats['cards']} flashcards from {stats['processed']} reports")

    return stats
