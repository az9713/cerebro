---
description: Find reports related to a specific topic or report
---

# Find Similar Reports

Find reports related to: $ARGUMENTS

## Usage

```
/similar <report-path>     # Find reports similar to a specific report
/similar <topic>           # Find reports about a topic
/similar "machine learning" # Search by keyword/phrase
```

## Steps

### Finding Similar to a Report

1. **Read the source report** from provided path
2. **Extract key signals**:
   - Title keywords
   - Key takeaways
   - Tags (if present)
   - Topic/category
3. **Scan all reports** in `reports/`
4. **Score similarity** based on:
   - Keyword overlap in titles
   - Shared tags
   - Similar key takeaways themes
   - Same content type (bonus)
5. **Rank and display** top 5-10 matches

### Finding by Topic

1. **Parse topic/keywords** from arguments
2. **Scan reports** for matches in:
   - Titles
   - Headers
   - Key takeaways
   - Full content (if needed)
3. **Rank by relevance**
4. **Display matches**

## Output Format

```markdown
## Reports Related to: "How to Build Better Habits"

### Top Matches

1. **The Science of Habit Formation** (89% similar)
   - Type: YouTube | Date: 2024-01-08
   - Shared themes: habits, behavior change, psychology
   - Path: reports/youtube/2024-01-08_science-of-habit-formation.md

2. **Atomic Habits Book Summary** (82% similar)
   - Type: Book | Date: 2024-01-05
   - Shared themes: habits, tiny changes, compound growth
   - Path: reports/books/2024-01-05_atomic-habits.md

3. **Morning Routine Optimization** (71% similar)
   - Type: Article | Date: 2024-01-12
   - Shared themes: routines, productivity, habits
   - Path: reports/articles/2024-01-12_morning-routine.md

---

Found 3 related reports. View any? Enter number or path.
```

## Similarity Scoring

**High weight (3x)**:
- Exact keyword match in title
- Shared tags

**Medium weight (2x)**:
- Keywords in key takeaways
- Same author/creator
- Same content type

**Low weight (1x)**:
- Keywords in body text
- Similar date range

## Examples

```bash
# Find related to a specific report
/similar reports/youtube/2024-01-10_habits-video.md

# Find by topic
/similar "productivity"
/similar machine learning

# Find related to today's most recent
/similar latest
```

## Use Cases

- **Deep dive**: After analyzing one piece, find related content
- **Research**: Gather all reports on a topic
- **Connections**: Discover unexpected links between content
- **Review**: Find all content from a creator/source

## Error Handling

- Report not found: "Report not found at [path]"
- No matches: "No similar reports found. Try broader keywords."
- Too many matches: Show top 10, offer to show more

## Future Enhancements

- Embedding-based similarity (semantic search)
- Cross-reference with external sources
- Suggest new content based on interests

## Related

- Search page: Web UI `/search`
- Reports: `reports/`
- Tags: Tag-based filtering
