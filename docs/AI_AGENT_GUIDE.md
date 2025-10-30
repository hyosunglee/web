# AI Coding Agent Implementation Guide

This guide is written for autonomous coding agents such as Codex and Jules. It explains the overall goal of the project, the file layout that must be created, the order in which to implement modules, and how to validate the work locally.

## Project Overview

Create a Vite-powered React single-page application that explains the relationship between **DAO**, **DTO**, and **Entity** patterns. The application should provide:

1. An interactive concept map showing how the three layers communicate.
2. A glossary that lists core terminology and concise definitions.
3. Scenario-driven walkthroughs that demonstrate how data moves from persistence to the UI.
4. Downloadable reference material sourced from `explain_dao_dto.txt`.

The UI should be written in TypeScript and styled with modern, accessible CSS. All copy must be localized in Korean first, with English tooltips for clarification.

## Directory Structure to Create

The final repository should contain the following directories and files. Paths marked with `(generated)` are produced by build tooling and must be ignored in version control.

```
.
├─ AGENTS.md
├─ README.md
├─ explain_dao_dto.txt
├─ docs/
│  ├─ AI_AGENT_GUIDE.md
│  └─ content-checklist.md
├─ src/
│  ├─ assets/
│  │  └─ (generated)
│  ├─ components/
│  │  ├─ ConceptGraph.tsx
│  │  ├─ GlossaryCard.tsx
│  │  └─ ScenarioStepper.tsx
│  ├─ data/
│  │  ├─ glossary.ts
│  │  └─ scenarios.ts
│  ├─ hooks/
│  │  └─ useContentSearch.ts
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  └─ DownloadPage.tsx
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ theme.css
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ public/
│  ├─ favicon.svg
│  └─ dao-dto-reference.pdf
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ vitest.config.ts
└─ pnpm-lock.yaml or package-lock.json (generated)
```

## Recommended Implementation Order

1. **Initialize Vite.** Run `npm create vite@latest` (or `pnpm dlx`) with the `react-ts` template, rename the generated folder contents into the repository root, and remove unused starter assets.
2. **Configure package scripts.** Add the commands described in [Testing](#testing) and ensure ESLint/Vitest dependencies are installed. Prefer `pnpm` when available.
3. **Add shared styles.** Build out `src/styles/globals.css` and `src/styles/theme.css` to define CSS variables, typography, and light/dark tokens.
4. **Create data modules.** Populate `src/data/glossary.ts` and `src/data/scenarios.ts` with structured objects. Parse `explain_dao_dto.txt` to craft bullet-point summaries that the UI can render.
5. **Implement components.** Follow this order: `GlossaryCard`, `ScenarioStepper`, and `ConceptGraph`. Each component must receive data via props and remain presentation-focused.
6. **Compose pages.** `HomePage` should stitch the three components together. `DownloadPage` must surface the reference PDF and include copy for offline readers.
7. **Wire up routing.** Use `react-router-dom` with two routes (`/` and `/download`) defined in `App.tsx`.
8. **Accessibility sweep.** Verify color contrast, focus order, and provide `aria-label`s where appropriate.
9. **Testing and linting.** Before committing, ensure the commands below pass.

## Data Files

* `explain_dao_dto.txt` is the canonical content source. Convert it to UTF-8 text if necessary. Use it to populate glossary definitions and scenario narratives.
* `public/dao-dto-reference.pdf` should be exported from the final markdown copy so that users can download a printable guide.
* Any additional datasets must live under `src/data/` and be version controlled as TypeScript modules.

## Vite Configuration Checklist

* Enable path aliases for `@components`, `@data`, and `@hooks` via the `resolve.alias` section in `vite.config.ts`.
* Integrate SVGR for importing SVG icons as React components.
* Configure the dev server to run on port `5175` to avoid clashes with default ports used in the CI runners.
* Ensure the `base` path reads from `process.env.VITE_PUBLIC_BASE` to support GitHub Pages deployments.

## Testing

Agents must run the following commands from the repository root:

* `pnpm install` – install dependencies using pnpm (npm is acceptable when pnpm is unavailable).
* `pnpm run lint` – run ESLint with the recommended React and accessibility rulesets.
* `pnpm run test` – execute unit tests through Vitest with JSDOM.
* `pnpm run typecheck` – confirm TypeScript types.

Tests must pass locally before pushing changes.

## Agent Notes

* Always update `docs/content-checklist.md` when glossary entries or scenarios change.
* Keep commits focused: one feature or bug fix per commit whenever possible.
* Prefer pure functions and memoized selectors inside React hooks to minimize re-renders.
* Document non-obvious logic with short comments; elaborate explanations belong in the documentation files.
