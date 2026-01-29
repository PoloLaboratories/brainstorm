# AI Agent Guide


@docs/specs.md
@docs/contributing.md

## MCP Servers

| Server | Purpose |
|--------|---------|
| GitHub | Issues, PRs |
| Exa | Research |
| Memory | Cross-session context |
| Browser/Puppeteer | Web automation |

## Commit Rules

**Format**: `type(scope): description`

**Types**:
- `feat`: New features or capabilities
- `fix`: Bug fixes
- `refactor`: Code changes without functionality change
- `test`: Test additions/modifications
- `docs`: Documentation changes
- `chore`: Tooling, config, dependencies

**Style**:
- Imperative mood ("Add feature" not "Added feature")
- First line under 72 characters
- Focus on why, not just what

**Examples**:
- `feat(hello-world): add patient summary endpoint`
- `fix(repository): handle FHIR connection timeout`
- `refactor(controller): extract greeting validation logic`
- `test(service): add async streaming tests`

**Forbidden**:
- No Claude Code references, footers, or Co-Authored-By lines
- No secrets (.env, credentials.json)
