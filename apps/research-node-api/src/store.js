/**
 * store.js - Data access layer with DB-first and memory fallback
 */

import db from './db.js';

// In-memory fallback storage
const memoryStore = {
  tasks: [],
  runs: [],
  events: [],
  agents: [],
  prs: [],
  artifacts: []
};

/**
 * Generic finder
 */
async function findAll(collection) {
  try {
    const result = await db.query(`SELECT * FROM ${collection}`);
    return result.rows;
  } catch (err) {
    if (err.message === 'DB_NOT_CONNECTED') {
      console.warn(`[Store] DB not connected, falling back to memory for ${collection}`);
      return memoryStore[collection] || [];
    }
    throw err;
  }
}

/**
 * Generic saver
 */
async function save(collection, data) {
  try {
    // DB logic would go here:
    // await db.query('INSERT INTO ...', [...])
    throw new Error('DB_NOT_CONNECTED'); // Simulate for now
  } catch (err) {
    if (err.message === 'DB_NOT_CONNECTED') {
      memoryStore[collection].push(data);
      return data;
    }
    throw err;
  }
}

// Specific API compatible methods
const store = {
  getTasks: () => findAll('tasks'),
  getRuns: () => findAll('runs'),
  getEvents: () => findAll('events'),
  getAgents: () => findAll('agents'),
  getPRs: () => findAll('prs'),
  getArtifacts: () => findAll('artifacts'),

  addTask: (task) => save('tasks', task),
  updateTask: async (id, updates) => {
    // Mock update in memory
    const tasks = await findAll('tasks');
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updated_at: new Date() };
      return tasks[index];
    }
    throw new Error('Task not found');
  },
  addArtifact: (artifact) => save('artifacts', artifact),
  addPR: (pr) => save('prs', pr),
  addEvent: (event) => save('events', event),

  // API Compatibility layer for existing dashboard
  getDashboardStats: async () => {
    const tasks = await findAll('tasks');
    const stageCounts = tasks.reduce((acc, t) => {
      acc[t.stage] = (acc[t.stage] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalTasks: tasks.length,
      stageCounts,
      statusCounts,
      status: 'operational'
    };
  }
};

export default store;
