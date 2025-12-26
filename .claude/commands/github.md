# GitHub Repository Analysis

Analyze a GitHub repository to understand its architecture, technology stack, and value.

## Usage
```
/github <repository-url-or-path>
```

## Examples
```
/github https://github.com/anthropics/claude-code
/github owner/repo-name
/github ./local-repo-path
```

## Process

1. **Fetch repository information**:
   - If URL provided, clone or fetch via GitHub API
   - Read README.md first for context
   - Examine package.json, requirements.txt, Cargo.toml, or equivalent
   - Review directory structure

2. **Load the analysis prompt**:
   - Read `prompts/github.md` for the analysis template

3. **Analyze the repository**:
   - Follow the 13-section structure from the prompt
   - Examine key files: README, config files, entry points
   - Review architecture and code patterns
   - Assess quality indicators

4. **Generate the report**:
   - Create comprehensive markdown report
   - Include code snippets for notable patterns
   - Cite specific file paths

5. **Save the report**:
   - Save to `reports/github/YYYY-MM-DD_repo-name.md`
   - Use format: `# Repository Name Analysis`

6. **Log the activity**:
   - Append to `logs/YYYY-MM-DD.md` under "## Repositories Analyzed"
   - Format: `- [Repo Name](../reports/github/filename.md) - HH:MM`

## Arguments
- `$ARGUMENTS` - GitHub URL, owner/repo format, or local path

## Output Location
`reports/github/`

## Notes
- For private repos, ensure GitHub authentication is configured
- Large repos may require selective file analysis
- Focus on understanding architecture over reading every file
