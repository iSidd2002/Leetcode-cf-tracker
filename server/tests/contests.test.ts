import request from 'supertest';
import express from 'express';
import cors from 'cors';
import contestRoutes from '../src/routes/contests';
import { createTestUser, createTestContest, clearDatabase } from './helpers/testHelpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/contests', contestRoutes);

describe('Contests Endpoints', () => {
  let user: any;
  let token: string;

  beforeEach(async () => {
    await clearDatabase();
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
  });

  describe('GET /contests', () => {
    it('should get user contests', async () => {
      await createTestContest(user._id.toString());
      await createTestContest(user._id.toString(), { name: 'Biweekly Contest 456' });

      const response = await request(app)
        .get('/contests')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBeDefined();
    });

    it('should filter contests by platform', async () => {
      await createTestContest(user._id.toString(), { platform: 'leetcode' });
      await createTestContest(user._id.toString(), { platform: 'codeforces' });

      const response = await request(app)
        .get('/contests?platform=leetcode')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].platform).toBe('leetcode');
    });

    it('should filter contests by status', async () => {
      await createTestContest(user._id.toString(), { status: 'scheduled' });
      await createTestContest(user._id.toString(), { status: 'completed' });

      const response = await request(app)
        .get('/contests?status=scheduled')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('scheduled');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/contests')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /contests', () => {
    it('should create a new contest', async () => {
      const contestData = {
        name: 'Test Contest 789',
        platform: 'codeforces',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 120,
        url: 'https://codeforces.com/contest/789',
        status: 'scheduled'
      };

      const response = await request(app)
        .post('/contests')
        .set('Authorization', `Bearer ${token}`)
        .send(contestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(contestData.name);
      expect(response.body.data.platform).toBe(contestData.platform);
      expect(response.body.data.userId).toBe(user._id.toString());
    });

    it('should fail with invalid platform', async () => {
      const contestData = {
        name: 'Test Contest',
        platform: 'invalid-platform',
        startTime: new Date().toISOString(),
        duration: 90,
        url: 'https://example.com'
      };

      const response = await request(app)
        .post('/contests')
        .set('Authorization', `Bearer ${token}`)
        .send(contestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid duration', async () => {
      const contestData = {
        name: 'Test Contest',
        platform: 'leetcode',
        startTime: new Date().toISOString(),
        duration: -10,
        url: 'https://leetcode.com/contest/test'
      };

      const response = await request(app)
        .post('/contests')
        .set('Authorization', `Bearer ${token}`)
        .send(contestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate contest name and platform for same user', async () => {
      const name = 'Duplicate Contest';
      const platform = 'leetcode';
      await createTestContest(user._id.toString(), { name, platform });

      const contestData = {
        name,
        platform,
        startTime: new Date().toISOString(),
        duration: 90,
        url: 'https://leetcode.com/contest/duplicate'
      };

      const response = await request(app)
        .post('/contests')
        .set('Authorization', `Bearer ${token}`)
        .send(contestData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Contest with this name and platform already exists');
    });
  });

  describe('PUT /contests/:id', () => {
    it('should update a contest', async () => {
      const contest = await createTestContest(user._id.toString());

      const updates = {
        name: 'Updated Contest Name',
        status: 'completed',
        rank: 42,
        problemsSolved: 3,
        totalProblems: 4
      };

      const response = await request(app)
        .put(`/contests/${contest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.rank).toBe(updates.rank);
      expect(response.body.data.problemsSolved).toBe(updates.problemsSolved);
    });

    it('should fail to update non-existent contest', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/contests/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Contest not found');
    });

    it('should fail to update another user\'s contest', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other@example.com', username: 'otheruser' });
      const contest = await createTestContest((otherUser._id as any).toString());

      const response = await request(app)
        .put(`/contests/${contest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /contests/:id', () => {
    it('should delete a contest', async () => {
      const contest = await createTestContest(user._id.toString());

      const response = await request(app)
        .delete(`/contests/${contest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contest deleted successfully');
    });

    it('should fail to delete non-existent contest', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/contests/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail to delete another user\'s contest', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other@example.com', username: 'otheruser' });
      const contest = await createTestContest((otherUser._id as any).toString());

      const response = await request(app)
        .delete(`/contests/${contest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
