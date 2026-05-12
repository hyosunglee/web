/**
 * server.js - API Server
 */

import express from 'express';
import store from './src/store.js';
import github from './src/github.js';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Dashboard
app.get('/api/dashboard', async (req, res) => {
  const stats = await store.getDashboardStats();
  res.json(stats);
});

// PRs
app.get('/api/prs', async (req, res) => {
  const prs = await store.getPRs();
  res.json(prs);
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  const tasks = await store.getTasks();
  res.json(tasks);
});

// Pipeline
app.get('/api/pipeline', async (req, res) => {
  const tasks = await store.getTasks();
  const runs = await store.getRuns();
  res.json({
    activePipeline: true,
    tasks,
    runs
  });
});

// Create PR Endpoint (Jules-3)
app.post('/api/prs', async (req, res) => {
  const { taskId, title, body, repo } = req.body;

  if (!taskId || !title) {
    return res.status(400).json({ error: 'taskId and title are required' });
  }

  try {
    const prResult = await github.client.createPR(
      repo || 'owner/repo',
      `task-${taskId}`,
      'main',
      title,
      body || ''
    );

    const prRecord = {
      id: `pr-${Date.now()}`,
      task_id: taskId,
      github_url: prResult.url,
      pr_number: prResult.number,
      status: 'open'
    };

    await store.addPR(prRecord);
    res.status(201).json(prRecord);
  } catch (err) {
    console.error('PR Creation error:', err);
    res.status(500).json({
      error: 'Failed to create PR',
      detail: err.message,
      code: err.code || 'GITHUB_ERROR'
    });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
