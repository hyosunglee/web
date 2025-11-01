# DAO, DTO, Entity Pattern Guide

## Overview
This is a Vite-powered React single-page application that explains the relationship between **DAO**, **DTO**, and **Entity** patterns in layered architecture. The application provides interactive educational content in Korean with English tooltips for clarification.

## Project Structure
- **Framework**: Vite + React + TypeScript
- **Routing**: React Router DOM
- **Testing**: Vitest + Testing Library
- **Styling**: CSS with CSS variables (dark mode support)

## Key Features
1. **Interactive Concept Map**: Visual diagram showing how the three layers communicate
2. **Glossary**: Searchable dictionary of core terminology with definitions
3. **Scenario Walkthroughs**: Step-by-step demonstrations of data flow from persistence to UI
4. **Downloadable Reference**: PDF materials sourced from educational content

## Architecture
```
src/
├── components/     # React components (GlossaryCard, ScenarioStepper, ConceptGraph)
├── data/          # Static data modules (glossary, scenarios)
├── hooks/         # Custom React hooks (useContentSearch)
├── pages/         # Page components (HomePage, DownloadPage)
├── styles/        # Global styles and theme
└── test/          # Test setup and utilities
```

## Development
- **Dev Server**: `pnpm run dev` (runs on port 5000)
- **Build**: `pnpm run build`
- **Test**: `pnpm run test`
- **Lint**: `pnpm run lint`
- **Type Check**: `pnpm run typecheck`

## Configuration
- Path aliases configured for `@components`, `@data`, `@hooks`, `@pages`, `@styles`
- Vite server configured for Replit environment (0.0.0.0:5000)
- HMR configured for WebSocket proxy compatibility
- TypeScript strict mode enabled

## Content
All educational content is localized in Korean with English tooltips. The content covers:
- DAO (Data Access Object) pattern
- DTO (Data Transfer Object) pattern
- Entity pattern and persistence
- Layer separation and data flow
- Real-world scenarios and code examples

## Recent Changes
- 2025-11-01: Initial project setup and implementation
- All components, pages, and routing configured
- Development environment ready for Replit
- Workflow configured for automatic dev server startup

## Deployment
This project is configured for deployment on Replit with autoscale mode.
