# Book/EPUB Analysis Skill

Automatically triggered when the user wants to analyze a book, ebook, or book chapter.

## Trigger Phrases
- "analyze this book"
- "summarize this chapter"
- "what are the key points from"
- "book notes for"
- "EPUB analysis"
- "read and summarize"
- "extract insights from this book"
- ".epub file"

## Process

### 1. Identify the Content Source
Determine the input type:
- EPUB file path: `inbox/book.epub`
- PDF file path: `inbox/book.pdf`
- Text file: `inbox/chapter.txt`
- Pasted text content
- Markdown file: `inbox/notes.md`

### 2. Extract Content
For EPUB files:
- Extract metadata (title, author, chapters)
- Convert chapters to text
- Identify table of contents structure

For PDF files:
- Extract text content
- Note any formatting limitations

For text/markdown:
- Read directly
- Identify any structure markers

### 3. Load Analysis Prompt
Read `prompts/book.md` for the comprehensive analysis template.

### 4. Analyze Content
Follow the 14-section structure:
1. Book/Chapter Overview
2. Executive Summary
3. Core Thesis & Arguments
4. Key Concepts & Frameworks
5. Memorable Examples & Stories
6. Data, Statistics & Research
7. Notable Quotes
8. Practical Applications
9. Critical Analysis
10. Connections & Context
11. Reader Relevance Assessment
12. Latent Signals
13. Personal Application Prompts
14. Summary & Verdict

### 5. Generate Report
Create comprehensive analysis with:
- Direct quotes with references
- Extracted frameworks and models
- Actionable takeaways
- Critical evaluation

### 6. Save Report
Save to: `reports/books/YYYY-MM-DD_book-title.md`

Format:
```markdown
# [Book Title]

**Author**: [Author Name]
**Date Analyzed**: YYYY-MM-DD
**Type**: Book / Chapter

---

[Analysis content following the 14-section structure]

---

## My Notes

```

### 7. Log Activity
Append to `logs/YYYY-MM-DD.md`:

```markdown
## Books Read

- [Book Title - Chapter X](../reports/books/filename.md) - HH:MM
```

## Output Directory
Ensure `reports/books/` exists before saving.

## Special Considerations

### For Fiction
- Focus on themes, symbolism, and literary devices
- Analyze character development
- Discuss narrative structure
- Evaluate prose style

### For Non-Fiction
- Extract all frameworks and mental models
- Document research and data cited
- Focus on practical applications
- Assess argument quality

### For Chapters
- Relate to overall book arc
- Note how it builds on previous chapters
- Identify foreshadowing of later content

## Example Usage

User: "Summarize chapter 5 of Thinking Fast and Slow"
Assistant: [Analyzes chapter on cognitive biases, extracts key concepts]

User: "What are the main takeaways from Atomic Habits?"
Assistant: [Provides comprehensive analysis with habit frameworks]
