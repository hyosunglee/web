/**
 * api.test.js
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('API Endpoints', () => {
  it('GET /healthz returns 200', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/prs creates a PR in mock mode', async () => {
    const res = await request(app)
      .post('/api/prs')
      .send({
        taskId: 't-test',
        title: 'Test PR',
        repo: 'test/repo'
      });

    expect(res.status).toBe(201);
    expect(res.body.github_url).toContain('github.com');
    expect(res.body.status).toBe('open');
  });

  it('returns 400 if taskId is missing', async () => {
    const res = await request(app).post('/api/prs').send({ title: 'No ID' });
    expect(res.status).toBe(400);
  });
});
