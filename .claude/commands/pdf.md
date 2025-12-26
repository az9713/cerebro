---
description: Analyze a PDF document from a file path
---

# Analyze PDF Document

Analyze the PDF document at: $ARGUMENTS

## Steps

1. **Locate the PDF file** at the provided path
   - If file doesn't exist, inform user and stop
   - If file is not a PDF, inform user and suggest correct format
2. **Read the PDF content** using the Read tool
   - The Read tool can handle PDF files and extract text content
   - If reading fails, inform user about any issues
3. **Read the analysis prompt** from `prompts/pdf.md`
4. **Extract document metadata** if available:
   - Title (from content or filename)
   - Author if mentioned
   - Date if mentioned
5. **Generate analysis** following the prompt structure exactly
6. **Create output directory** `reports/pdfs/` if it doesn't exist
7. **Save the report** to `reports/pdfs/YYYY-MM-DD_sanitized-title.md` where:
   - YYYY-MM-DD is today's date
   - sanitized-title is derived from the document title or filename
   - Lowercase, spaces replaced with hyphens, special chars removed, max 50 chars
8. **Update the activity log** at `logs/YYYY-MM-DD.md`:
   - Create file if it doesn't exist with standard sections
   - Add entry under "## PDFs Reviewed" section (create if needed)
   - Format: `- [Title](../reports/pdfs/filename.md) - HH:MM`
9. **Confirm to user** what was saved and where

## Report Format

Include this header in the report:
```markdown
# [Document Title]

**Source**: [file path]
**Date**: YYYY-MM-DD
**Type**: PDF Document

---

[Analysis content following prompts/pdf.md structure]

---

## My Notes

[Empty space for user notes]
```

## Error Handling

- If file path doesn't exist: Tell user to check the path
- If file is not readable: Suggest checking file permissions
- If PDF has no extractable text (scanned/image): Inform user this PDF appears to be scanned and suggest OCR
- If prompts/pdf.md missing: Use a basic document summary structure
