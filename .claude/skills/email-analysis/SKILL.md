# Email/Newsletter Analysis Skill

Automatically triggered when the user wants to analyze an email newsletter or forwarded email content.

## Trigger Phrases
- "analyze this newsletter"
- "summarize this email"
- "what's in this newsletter"
- "extract insights from this email"
- "newsletter analysis"
- "forwarded email"
- "morning brew" or other newsletter names
- "substack email"

## Process

### 1. Identify the Content Source
Determine the input type:
- Text file: `inbox/newsletter.txt`
- Email file: `inbox/email.eml`
- HTML content: `inbox/newsletter.html`
- Pasted text content
- Forwarded email text

### 2. Parse Email Content
Extract key metadata:
- Sender/Newsletter name
- Subject line
- Date sent
- Clean body text

For HTML emails:
- Strip formatting
- Preserve links
- Extract plain text

### 3. Load Analysis Prompt
Read `prompts/newsletter.md` for the comprehensive analysis template.

### 4. Analyze Content
Follow the 13-section structure:
1. Newsletter Overview
2. Executive Summary
3. Key Insights & Ideas
4. Curated Links & Resources
5. Data & Statistics
6. Notable Quotes
7. Recommendations & Picks
8. Action Items
9. Author's Perspective
10. Relevance Assessment
11. Latent Signals
12. Follow-up Items
13. Summary

### 5. Generate Report
Create analysis focusing on:
- Key insights and takeaways
- All links and resources extracted
- Actionable items highlighted
- Promotional content filtered
- Honest relevance assessment

### 6. Save Report
Save to: `reports/newsletters/YYYY-MM-DD_newsletter-name.md`

Format:
```markdown
# [Newsletter Name] - [Date/Issue]

**From**: [Sender]
**Date Received**: YYYY-MM-DD
**Type**: Newsletter / Email

---

[Analysis content following the 13-section structure]

---

## My Notes

```

### 7. Log Activity
Append to `logs/YYYY-MM-DD.md`:

```markdown
## Newsletters Read

- [Newsletter Name](../reports/newsletters/filename.md) - HH:MM
```

## Output Directory
Ensure `reports/newsletters/` exists before saving.

## Special Handling

### For Curated Newsletters (Morning Brew, TLDR, etc.)
- Extract and categorize all links
- Note which stories are most prominent
- Identify sponsored content

### For Essay Newsletters (Substack, personal blogs)
- Focus on the author's arguments
- Extract key insights and frameworks
- Note the author's perspective

### For Industry Newsletters
- Capture market trends and data
- Extract predictions and forecasts
- Note company/product mentions

### For Personal/Update Emails
- Summarize key updates
- Extract action items
- Note deadlines or time-sensitive content

## Example Usage

User: "Summarize this Morning Brew newsletter"
Assistant: [Extracts top stories, key insights, and notable links]

User: "What's important in this Substack email?"
Assistant: [Analyzes essay content, extracts main arguments and takeaways]

User: "Analyze the forwarded email from my colleague"
Assistant: [Summarizes content, extracts action items and key points]
