# Research Node API

Research automation API built with Node.js.

## Components
- **Persistence Layer**: `src/store.js`, `src/db.js` (PostgreSQL with Memory Fallback)
- **Ingest Layer**: `src/collector.js`, `src/parser.js` (arXiv/OpenAlex Support)
- **GitHub Layer**: `src/github.js` (PR Automation)

## Setup
```bash
npm install
```

## Running
```bash
# Seed data
node src/seed.js

# Start server
node server.js
```

## Testing
```bash
# Run all tests
npm test
```

## API Specification

### GET /api/dashboard
Returns task aggregations.

### POST /api/prs
Creates a new GitHub PR and tracks it.
- Request Body: `{"taskId": "...", "title": "...", "repo": "..."}`

## Migration Notes
- Database schemas are defined in `schema.sql`.
- Current implementation uses `memoryStore` as a fallback when PostgreSQL is not configured.
- To connect to a real database, set `DB_HOST`, `DB_USER`, etc., in environment variables and uncomment the connection pool in `src/db.js`.
