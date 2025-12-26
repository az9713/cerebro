---
description: Generate Anki flashcards from reports
---

# Generate Anki Flashcards

Generate flashcards: $ARGUMENTS

## Usage

```
/flashcards <report>         # From single report
/flashcards all              # From all reports
/flashcards youtube          # From all YouTube reports
/flashcards --output file    # Specify output file
```

## What Gets Extracted

The flashcard generator extracts Q&A pairs from:

1. **Key Takeaways** → "What is a key insight about [topic]?"
2. **Definitions** → "What is [term]?" (from **bold**: definition patterns)
3. **Notable Quotes** → "Complete this quote or explain its significance"
4. **Action Items** → "What action should you take regarding [topic]?"

## Steps

### Single Report

1. Parse report path from arguments
2. Read report content
3. Extract:
   - Key takeaways as Q&A pairs
   - Definitions and concepts
   - Notable quotes
   - Action items
4. Format as Anki-compatible CSV
5. Save to `exports/anki-[report-name].txt`
6. Report: "Generated 8 flashcards from [report]"

### Batch Export

1. Determine scope (all, or by category)
2. Process each matching report
3. Combine all flashcards
4. Save to `exports/anki-flashcards-YYYYMMDD.txt`
5. Report stats

## Output Format

### CSV (Tab-separated, for Anki import)

```
Front	Back	Tags
What is a key insight about habits?	Start with tiny habits that take 2 minutes	youtube takeaway
What is habit stacking?	Building new habits onto existing routines	youtube definition
```

### JSON (for programmatic use)

```json
{
  "deck_name": "Personal OS",
  "created": "2024-01-15T10:30:00",
  "cards": [
    {
      "front": "What is a key insight about habits?",
      "back": "Start with tiny habits that take 2 minutes",
      "tags": ["youtube", "takeaway"],
      "source": "reports/youtube/2024-01-15_habits.md"
    }
  ]
}
```

## Examples

```bash
# Generate from a specific report
/flashcards reports/youtube/2024-01-15_habits.md

# Generate from all YouTube videos
/flashcards youtube

# Generate from all reports
/flashcards all

# Custom output file
/flashcards all --output ~/Documents/my-cards.txt
```

## Importing to Anki

1. Open Anki
2. Go to File → Import
3. Select the generated `.txt` file
4. Set:
   - Type: "Basic"
   - Field separator: Tab
   - Field 1: Front
   - Field 2: Back
   - Field 3: Tags
5. Click Import

## Deck Structure

Cards are organized by content type:
- `Personal OS::YouTube` - Video insights
- `Personal OS::Articles` - Article takeaways
- `Personal OS::Papers` - Research findings
- `Personal OS::Podcasts` - Podcast notes

## Card Types

| Type | Front Template | Example |
|------|----------------|---------|
| Takeaway | "What is a key insight about [topic]?" | Core learnings |
| Definition | "What is [term]?" | Concepts & terms |
| Quote | "Complete/explain this quote:" | Memorable quotes |

## Tips for Better Cards

1. **Review generated cards** - Edit for clarity
2. **Add context** - Cards include source reference
3. **Use tags** - Filter by content type in Anki
4. **Regular review** - Import weekly for spaced repetition

## Error Handling

- Report not found: "Cannot find report at [path]"
- No content: "No flashcard-worthy content found in [report]"
- No reports: "No reports found in [category]"

## Related

- Reports: `reports/`
- Exports: `exports/`
- Flashcard service: `web/backend/services/flashcards.py`
