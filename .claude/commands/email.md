# Email/Newsletter Analysis

Analyze forwarded emails or newsletter content to extract key insights and action items.

## Usage
```
/email <file-path-or-pasted-content>
```

## Examples
```
/email inbox/morning-brew-dec25.txt
/email "paste the newsletter content here"
/email inbox/forwarded-email.eml
```

## Supported Inputs
- `.txt` - Plain text email content
- `.eml` - Email file format
- `.html` - HTML email content
- Direct paste of email body
- Forwarded email text

## Process

1. **Read the content**:
   - For files: Read the email/newsletter content
   - For pasted text: Parse directly
   - Extract sender, subject, date if available
   - Clean up formatting artifacts

2. **Load the analysis prompt**:
   - Read `prompts/newsletter.md` for the analysis template

3. **Analyze the content**:
   - Follow the 13-section structure from the prompt
   - Extract curated links and resources
   - Identify action items and recommendations
   - Filter promotional content

4. **Generate the report**:
   - Create comprehensive markdown report
   - Preserve all links and resources
   - Highlight actionable items

5. **Save the report**:
   - Save to `reports/newsletters/YYYY-MM-DD_newsletter-name.md`
   - Use format: `# Newsletter Name - Date`

6. **Log the activity**:
   - Append to `logs/YYYY-MM-DD.md` under "## Newsletters Read"
   - Format: `- [Newsletter Name](../reports/newsletters/filename.md) - HH:MM`

## Arguments
- `$ARGUMENTS` - File path or pasted email/newsletter content

## Output Location
`reports/newsletters/`

## Notes
- Works best with text-based newsletters
- Strips HTML formatting when necessary
- Preserves all links for later reference
- Filters out promotional noise
- Identifies sponsored content transparently
