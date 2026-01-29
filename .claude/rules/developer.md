# Developer Principles

Priority order for this project:

## 1. Documentation-First
Read docs before coding. Update docs after changing behavior. Schema defines truth.

## 2. Developer Experience (DX)
Clear error messages (what, why, how to fix). Structured logging. Fast tests. Follow existing patterns.

## 3. AI Experience (AX)
Clear module boundaries. Self-documenting names. Pattern consistency. Comments explain "why".

## 4. Engineering Quality
Design for 10x scale. Extract common patterns to `tenets/`. Testable modules. Strict types.

## 5. Production Readiness
CI/CD from day one. Compliant logging (no PII). Observability. Easy setup.

## 6. Contribute Back
Generic utilities → shared packages. Spot patterns. Track refactor candidates.

## 7. File Organization

| Type | Location |
|------|----------|
| Plans | `docs/plans/` |
| Architecture | `docs/` |
| AI context | `.claude/project/` |
| Temp notes | Memory MCP |

Never create markdown in project root. Delete plans after implementation verified.
