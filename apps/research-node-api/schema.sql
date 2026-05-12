-- schema.sql

-- KnowledgeArtifact Schema
CREATE TABLE IF NOT EXISTS knowledge_artifacts (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    tags TEXT[],
    confidence FLOAT,
    source TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Schema
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT,
    last_active TIMESTAMP WITH TIME ZONE
);

-- Task Schema
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    title TEXT NOT NULL,
    status TEXT,
    stage TEXT, -- e.g., 'research', 'analyze', 'ship'
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Run Schema
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    status TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Event Schema
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    run_id UUID REFERENCES runs(id),
    type TEXT,
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PR Schema
CREATE TABLE IF NOT EXISTS pull_requests (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    github_url TEXT,
    status TEXT,
    pr_number INTEGER
);
