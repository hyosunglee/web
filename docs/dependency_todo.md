# Dependency Conflict TODO

## Observed issues
- `apps/api/requirements.txt` contains duplicated entries: `fastapi`, `uvicorn`.
- API stack includes both Flask and FastAPI dependencies in one file.
- `apps/paper_assistant/requirements.txt` pins FastAPI/uvicorn/httpx versions that may diverge from `apps/api/requirements.txt`.
- `apps/active_agent/src/requirements.txt` is separate and may overlap with paper assistant (`arxiv`).
- Repo has TS test file (`apps/web/__tests__/smoke.test.ts`) without root `package.json`.

## Recommended Phase 2 actions
1. Keep app-local requirements, but split API runtime deps vs legacy deps.
2. Remove duplicates and pin versions intentionally.
3. Add JS workspace metadata (`package.json`) or move TS smoke test to docs/examples.
4. Add per-app setup docs and lock strategy.
