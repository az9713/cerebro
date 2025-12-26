# GitHub Repository Analysis Skill

Automatically triggered when the user wants to analyze a GitHub repository or codebase.

## Trigger Phrases
- "analyze this repo"
- "review this GitHub repository"
- "what does this codebase do"
- "explain this project"
- "github.com/..."
- "look at this repository"
- "understand this codebase"

## Process

### 1. Identify the Repository
Determine the repository source:
- GitHub URL: `https://github.com/owner/repo`
- Short form: `owner/repo`
- Local path: `./path/to/repo`

### 2. Fetch Repository Content
For GitHub URLs:
- Use `gh repo view owner/repo` for metadata
- Clone or fetch key files via GitHub API
- Prioritize: README, package files, src/ structure

For local paths:
- Read directory structure
- Identify project type from config files

### 3. Load Analysis Prompt
Read `prompts/github.md` for the comprehensive analysis template.

### 4. Key Files to Examine
Prioritize reading these files:
- `README.md` - Project overview
- `package.json` / `requirements.txt` / `Cargo.toml` / `go.mod` - Dependencies
- `src/` or `lib/` - Main source code structure
- `.github/workflows/` - CI/CD configuration
- `docker-compose.yml` / `Dockerfile` - Container setup
- `tsconfig.json` / `pyproject.toml` - Build configuration
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - License information

### 5. Generate Analysis Report
Follow the 13-section structure:
1. Repository Overview
2. Technology Stack
3. Architecture Analysis
4. Key Features & Functionality
5. Code Quality Indicators
6. Getting Started Guide
7. Notable Code Patterns
8. Contribution Insights
9. Dependencies Analysis
10. Comparison & Alternatives
11. Learning Opportunities
12. Latent Signals
13. Summary & Recommendations

### 6. Save Report
Save to: `reports/github/YYYY-MM-DD_repo-name.md`

Format:
```markdown
# [Repository Name]

**Source**: [GitHub URL]
**Date**: YYYY-MM-DD
**Type**: GitHub Repository

---

[Analysis content following the 13-section structure]

---

## My Notes

```

### 7. Log Activity
Append to `logs/YYYY-MM-DD.md`:

```markdown
## Repositories Analyzed

- [Repo Name](../reports/github/filename.md) - HH:MM
```

## Output Directory
Ensure `reports/github/` exists before saving.

## Example Usage

User: "Can you analyze https://github.com/anthropics/claude-code"
Assistant: [Fetches repo, analyzes structure, generates comprehensive report]

User: "What's in this fastapi/fastapi repository?"
Assistant: [Analyzes FastAPI framework, documents architecture and patterns]
