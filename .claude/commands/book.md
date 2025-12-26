# Book/EPUB Analysis

Analyze a book or book chapter to extract key insights, arguments, and actionable takeaways.

## Usage
```
/book <file-path-or-content>
```

## Examples
```
/book inbox/atomic-habits-chapter3.txt
/book inbox/deep-work.epub
/book "paste the chapter text here"
```

## Supported Formats
- `.epub` - EPUB ebooks (requires epub extraction)
- `.txt` - Plain text book content
- `.pdf` - PDF books (requires PDF extraction)
- `.md` - Markdown formatted content
- Direct text paste for individual chapters

## Process

1. **Read the content**:
   - For EPUB: Extract text from specified chapters or full book
   - For PDF: Extract text content
   - For text files: Read directly
   - Identify book metadata (title, author) if available

2. **Load the analysis prompt**:
   - Read `prompts/book.md` for the analysis template

3. **Analyze the content**:
   - Follow the 14-section structure from the prompt
   - Extract all key concepts and frameworks
   - Identify memorable examples and quotes
   - Document practical applications

4. **Generate the report**:
   - Create comprehensive markdown report
   - Include direct quotes with references
   - Provide critical analysis

5. **Save the report**:
   - Save to `reports/books/YYYY-MM-DD_book-title.md`
   - Use format: `# Book Title - Analysis`
   - For chapters: `# Book Title - Chapter X Analysis`

6. **Log the activity**:
   - Append to `logs/YYYY-MM-DD.md` under "## Books Read"
   - Format: `- [Book Title](../reports/books/filename.md) - HH:MM`

## Arguments
- `$ARGUMENTS` - File path to book/chapter or pasted text content

## Output Location
`reports/books/`

## Notes
- For long books, consider analyzing chapter by chapter
- Include page/location references when available
- Focus on extracting actionable insights
- For fiction, emphasize themes and literary analysis
