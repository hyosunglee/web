# Implementation Roadmap (Based on Design PDF)

## Phase 1: MVP (Completed in this iteration)
- Core entities and state model (`Task`, `Run`, `Event`, `Agent`, `PR`, `KnowledgeArtifact`)
- Dashboard metrics and alerts
- Pipeline board visualization
- Task timeline view
- PR list view
- Basic simulation endpoint (`POST /api/simulate/tick`)

## Phase 2: Persistence + Real Integrations
- PostgreSQL schema migration from in-memory structures
- Real paper ingest adapters (arXiv / Semantic Scholar / OpenAlex)
- GitHub API integration for branch/commit/PR lifecycle
- Task queue + orchestrator worker loop

## Phase 3: Advanced Visualizations
- Agent Ecosystem map (graph view)
- Knowledge Flow graph (paper → task → run → PR)
- Branch/PR detail drilldown

## Phase 4: Production Readiness
- AuthN/AuthZ and approval flow
- Retry/backoff policy engine
- Monitoring/observability (logs, traces, cost, token usage)
- Unit/integration/e2e test suites and CI
