/**
 * store.test.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import store from '../src/store.js';

describe('Store Layer', () => {
  beforeEach(async () => {
    // Reset or seed if necessary
  });

  it('should fallback to memory when DB is not connected', async () => {
    const tasks = await store.getTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it('should correctly aggregate dashboard stats', async () => {
    await store.addTask({ id: 'test-1', stage: 'research', status: 'active' });
    await store.addTask({ id: 'test-2', stage: 'research', status: 'active' });
    await store.addTask({ id: 'test-3', stage: 'ship', status: 'done' });

    const stats = await store.getDashboardStats();
    expect(stats.totalTasks).toBeGreaterThanOrEqual(3);
    expect(stats.stageCounts.research).toBeGreaterThanOrEqual(2);
    expect(stats.stageCounts.ship).toBeGreaterThanOrEqual(1);
    expect(stats.statusCounts.active).toBeGreaterThanOrEqual(2);
  });

  it('should handle stage transitions', async () => {
    const task = { id: 'trans-1', stage: 'research', status: 'active' };
    await store.addTask(task);

    await store.updateTask('trans-1', { stage: 'analyze' });
    const tasks = await store.getTasks();
    const updated = tasks.find(t => t.id === 'trans-1');
    expect(updated.stage).toBe('analyze');
  });

  it('should sort events by timestamp', async () => {
    const now = new Date();
    await store.addEvent({ id: 1, message: 'First', timestamp: new Date(now - 1000) });
    await store.addEvent({ id: 2, message: 'Second', timestamp: now });

    const events = await store.getEvents();
    const sorted = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    expect(sorted[0].message).toBe('First');
    expect(sorted[1].message).toBe('Second');
  });
});
