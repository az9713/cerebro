---
description: Surface a random past report to rediscover previous analyses
---

# Random Report Discovery

Surface a random report from your archive: $ARGUMENTS

## Usage

```
/random              # Any random report
/random youtube      # Random YouTube report
/random article      # Random article report
/random paper        # Random arXiv paper
/random podcast      # Random podcast report
/random week         # Random from past week
/random month        # Random from past month
```

## Steps

1. **Parse filter** from arguments:
   - Content type: `youtube`, `article`, `paper`, `podcast`, `github`, `book`, `newsletter`
   - Time range: `week`, `month`, `year`
   - No filter = all reports

2. **Scan reports directory**:
   - Glob pattern based on filter:
     - All: `reports/**/*.md`
     - YouTube: `reports/youtube/*.md`
     - Articles: `reports/articles/*.md`
     - Papers: `reports/papers/*.md`
     - Podcasts: `reports/podcasts/*.md`
   - Apply time filter if specified

3. **Select random report**:
   - If no reports found: Inform user
   - Randomly select one file

4. **Display summary**:
   ```markdown
   ## Random Discovery

   **Title**: [Report Title]
   **Type**: YouTube Video
   **Date**: 2024-01-15
   **File**: reports/youtube/2024-01-15_video-title.md

   ### Quick Summary
   [First 2-3 sentences or key takeaways section]

   ---
   Open full report? [Y/n]
   ```

5. **On request**: Read and display full report

## Filtering Examples

```bash
# Rediscover any old analysis
/random

# Find a random video analysis
/random youtube

# Something from this past week
/random week

# Combine filters (future enhancement)
/random youtube month
```

## Output Format

```markdown
## Random Discovery

**Title**: How to Build Better Habits
**Type**: YouTube Video
**Date**: 2024-01-10
**Source**: https://youtube.com/watch?v=abc123

### Key Takeaways (Preview)
1. Start with tiny habits that take 2 minutes
2. Stack new habits onto existing routines
3. Environment design matters more than motivation

---

*View full report: reports/youtube/2024-01-10_how-to-build-better-habits.md*
```

## Error Handling

- No reports found: "No reports found. Start analyzing content with /yt, /read, or /arxiv"
- No reports match filter: "No [type] reports found"
- Corrupted report: Skip, try another

## Use Cases

- **Morning ritual**: Rediscover past insights
- **Spaced repetition**: Reinforce learning
- **Inspiration**: Find forgotten gems
- **Review**: Refresh memory on topics

## Related

- Reports directory: `reports/`
- All commands: `/yt`, `/read`, `/arxiv`, `/analyze`
