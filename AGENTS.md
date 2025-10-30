# Repository Instructions for Coding Agents

Welcome! Follow these rules whenever you work inside this repository.

## Primary Resources

* Read `docs/AI_AGENT_GUIDE.md` before starting any task. It describes the required project structure, implementation order, and testing expectations.
* Update `docs/content-checklist.md` whenever you add or modify educational content.

## Coding Standards

* Use TypeScript and React functional components exclusively.
* Keep files within the directories listed in the guide; ask a human before introducing new top-level folders.
* Prefer composable hooks and pure utility functions. Avoid side effects inside render logic.

## Commit & Review

* Every commit message should be imperative (e.g., `Add scenario stepper component`).
* Do not commit build outputs (`dist/`, `node_modules/`, or generated lockfiles`).

## Testing Requirements

Before opening a pull request, run the full quality gate:

```bash
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test
```

If pnpm is unavailable, use npm with equivalent scripts.

## Documentation

* Keep this file up to date with any new rules introduced in future tasks.
* When unsure about requirements, consult the guide and leave helpful notes for other agents in the `docs/` directory.
