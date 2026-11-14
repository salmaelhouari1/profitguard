import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../server/src/index';
import { serverDb } from '../../../server/src/db/store';

describe('Server Endpoints & Authentication Suite', () => {
  beforeEach(() => {
    serverDb.clear();
  });

  it('rejects unauthorized access to protected endpoints', async () => {
    const res = await request(app).get('/api/workspaces');
    expect(res.status).toBe(401);
  });

  it('signs up a new user with real empty workspace and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Jane Merchant',
        email: 'jane@brand.com',
        password: 'securepassword123',
        organizationName: 'Silk & Stone Co.',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('jane@brand.com');
    expect(res.body.organization.name).toBe('Silk & Stone Co.');
    expect(res.body.workspace.isDemo).toBe(false); // DEFAULT IS REAL!
    expect(res.body.token).toBeDefined();

    // Check financial summary for empty workspace returns genuine zeros
    const token = res.body.token;
    const summaryRes = await request(app)
      .get('/api/financials/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.grossRevenue).toBe(0);
    expect(summaryRes.body.totalOrders).toBe(0);
  });

  it('allows opt-in creation of isolated sample workspace', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Jane Merchant',
        email: 'jane@brand.com',
        password: 'securepassword123',
        organizationName: 'Silk & Stone Co.',
      });

    const token = signupRes.body.token;

    const sampleRes = await request(app)
      .post('/api/workspaces/sample')
      .set('Authorization', `Bearer ${token}`);

    expect(sampleRes.status).toBe(201);
    expect(sampleRes.body.isDemo).toBe(true);
    expect(sampleRes.body.name).toBe('Demo Sample Store (Read-Only)');

    // Now query sample workspace summary
    const summaryRes = await request(app)
      .get(`/api/financials/summary?workspaceId=${sampleRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.grossRevenue).toBeGreaterThan(0);
    expect(summaryRes.body.totalOrders).toBeGreaterThan(0);
  });
});
