## Monorepo Rules
This repository is a monorepo.
- `apps/` contains runnable applications.
- `packages/` contains reusable internal libraries.
- `docs/` contains architecture notes and Codex task plans.
- `tests/integration/` contains cross-app integration tests.

Before moving files or changing imports:
1. Summarize the current structure.
2. Propose the target structure.
3. Avoid deleting files unless explicitly approved.
4. Prefer small, reviewable diffs.
5. Do not modify core AGI logic during structural refactors.

Core AGI modules:
- `memory.py`
- `state_updater.py`
- `world_model.py`
- `reward_generator.py`
- `self_query.py`
- `agent.py`

These files must not be behaviorally changed during monorepo migration.
