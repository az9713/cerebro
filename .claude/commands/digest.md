---
description: Generate a weekly or monthly digest of analyzed content
---

# Generate Content Digest

Generate a digest: $ARGUMENTS

## Usage

```
/digest              # This week's digest
/digest week         # This week's digest
/digest lastweek     # Last week's digest
/digest month        # This month's digest
/digest lastmonth    # Last month's digest
/digest 2024-01-15   # Week containing that date
```

## Steps

1. **Parse time range** from arguments:
   - No args / "week" → Current week (Monday-Sunday)
   - "lastweek" → Previous week
   - "month" → Current month
   - "lastmonth" → Previous month
   - Date → Week containing that date

2. **Scan reports directory** for the time range:
   - Parse date from filename (YYYY-MM-DD_title.md)
   - Include all matching reports

3. **For each report**, extract:
   - Title
   - Type (from directory)
   - Key takeaways (first 3 points)
   - Source URL if available

4. **Calculate statistics**:
   - Total reports
   - Count by type
   - Days active
   - Current streak

5. **Generate digest markdown**:
   ```markdown
   # Weekly Digest: Jan 15 - Jan 21, 2024

   **Period**: January 15 - January 21, 2024
   **Generated**: 2024-01-21 15:30
   **Type**: Weekly Digest

   ---

   ## Summary

   This week you consumed **12 pieces of content** across **5 days**.

   ### By Type
   - 🎬 **YouTube**: 5
   - 📰 **Articles**: 4
   - 📄 **Papers**: 2
   - 🎙️ **Podcasts**: 1

   🔥 **3-day streak!** Keep it up!

   ---

   ## Content Analyzed

   ### Videos

   #### [Video Title](reports/youtube/2024-01-20_video-title.md)
   *2024-01-20*

   **Key Points:**
   - First key takeaway
   - Second key takeaway
   - Third key takeaway

   [... more content ...]

   ---

   ## Reflection Prompts

   1. What was the most surprising insight this week?
   2. Which content do you want to revisit or act on?
   3. Are there patterns in what you're consuming?

   ---

   ## My Notes

   ```

6. **Save the digest** to `reports/digests/YYYY-MM-DD_weekly-digest.md`

7. **Update activity log** with digest entry

8. **Confirm to user** with stats summary

## Output Location

- Weekly: `reports/digests/YYYY-MM-DD_weekly-digest.md` (date = Monday)
- Monthly: `reports/digests/YYYY-MM_monthly-digest.md`

## Examples

```bash
# Generate this week's digest
/digest

# Last week's review
/digest lastweek

# Monthly summary
/digest month

# Specific week
/digest 2024-01-15
```

## Error Handling

- No reports in range: "No content found for [date range]. Try a different period."
- Reports directory empty: "No reports found. Start analyzing content first."

## Use Cases

- **Weekly review**: Reflect on what you learned
- **Monthly recap**: See consumption patterns
- **Spaced repetition**: Revisit key insights
- **Progress tracking**: Monitor learning streaks

## Related

- Reports: `reports/`
- Digests: `reports/digests/`
- Activity logs: `logs/`
