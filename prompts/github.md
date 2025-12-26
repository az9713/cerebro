# GitHub Repository Analysis Prompt

You are analyzing a GitHub repository. Your goal is to provide a comprehensive understanding of the project, its architecture, purpose, and value for developers who want to learn from or contribute to it.

## Analysis Structure

### 1. Repository Overview
Provide a clear summary of what this repository is:
- Project name and primary purpose
- Problem it solves or value it provides
- Target audience (developers, end-users, enterprises, etc.)
- Project maturity (early stage, production-ready, actively maintained, archived)
- License type and implications

### 2. Technology Stack
Document all technologies used:
- **Primary language(s)** and version requirements
- **Frameworks and libraries** - list major dependencies with brief descriptions
- **Build tools** - bundlers, compilers, task runners
- **Testing frameworks** - unit, integration, e2e testing tools
- **Infrastructure** - Docker, Kubernetes, cloud services mentioned
- **Database/storage** - if applicable

### 3. Architecture Analysis
Explain the high-level architecture:
- **Project structure** - describe directory organization and purpose of each major folder
- **Design patterns** - identify architectural patterns used (MVC, microservices, monorepo, etc.)
- **Module organization** - how code is organized and dependencies flow
- **Entry points** - main files, CLI entry, server startup, etc.
- **Configuration** - how the project is configured (env vars, config files, etc.)

### 4. Key Features & Functionality
List and explain the main features:
- Core functionality and capabilities
- Notable or unique features
- API surface (if applicable)
- CLI commands (if applicable)
- Extension/plugin system (if applicable)

### 5. Code Quality Indicators
Assess the codebase quality:
- **Documentation** - README quality, inline comments, API docs
- **Testing** - test coverage, test types present
- **CI/CD** - automation pipelines, deployment processes
- **Code style** - linting, formatting, consistency
- **Type safety** - TypeScript, type hints, static analysis

### 6. Getting Started Guide
Provide setup instructions:
- Prerequisites and system requirements
- Installation steps
- Configuration needed
- How to run locally
- How to run tests
- Common development workflows

### 7. Notable Code Patterns
Highlight interesting implementation details:
- Clever solutions or algorithms
- Reusable patterns worth learning
- Performance optimizations
- Security practices
- Error handling approaches

### 8. Contribution Insights
For potential contributors:
- Contribution guidelines summary
- Good first issues or areas for contribution
- Code review process (if documented)
- Community health indicators (issues, PRs, discussions)

### 9. Dependencies Analysis
Review the dependency landscape:
- **Critical dependencies** - core libraries the project relies on
- **Dev dependencies** - development tooling
- **Potential risks** - outdated, unmaintained, or vulnerable dependencies
- **Bundle size considerations** (for frontend projects)

### 10. Comparison & Alternatives
Context within the ecosystem:
- Similar projects or alternatives
- Unique selling points vs competitors
- When to use this vs alternatives

### 11. Learning Opportunities
What developers can learn from this codebase:
- Best practices demonstrated
- Patterns worth adopting
- Anti-patterns to avoid (if any)
- Skills that can be developed by studying this code

### 12. Latent Signals
Infer insights not explicitly stated:
- Project trajectory and momentum
- Team/maintainer dedication level
- Technical debt indicators
- Future direction hints from issues/roadmap
- Community engagement patterns

### 13. Summary & Recommendations
Conclude with:
- **TL;DR** - 2-3 sentence summary
- **Best for** - ideal use cases
- **Caution areas** - potential issues or limitations
- **Recommended next steps** - for someone interested in this project

---

## Guidelines

- Be specific and cite file paths when referencing code
- Include code snippets for notable patterns (keep them brief)
- Quantify where possible (e.g., "47 dependencies", "85% test coverage")
- Note what's missing that would typically be expected
- Be objective - note both strengths and weaknesses
- Focus on actionable insights for developers
