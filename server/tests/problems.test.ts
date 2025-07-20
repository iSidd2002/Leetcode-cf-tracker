import request from 'supertest';
import express from 'express';
import cors from 'cors';
import problemRoutes from '../src/routes/problems';
import { createTestUser, createTestProblem, clearDatabase } from './helpers/testHelpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/problems', problemRoutes);

describe('Problems Endpoints', () => {
  let user: any;
  let token: string;

  beforeEach(async () => {
    await clearDatabase();
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
  });

  describe('GET /problems', () => {
    it('should get user problems', async () => {
      await createTestProblem(user._id.toString());
      await createTestProblem(user._id.toString(), { title: 'Three Sum' });

      const response = await request(app)
        .get('/problems')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBeDefined();
    });

    it('should filter problems by platform', async () => {
      await createTestProblem(user._id.toString(), { platform: 'leetcode' });
      await createTestProblem(user._id.toString(), { platform: 'codeforces' });

      const response = await request(app)
        .get('/problems?platform=leetcode')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].platform).toBe('leetcode');
    });

    it('should filter problems by status', async () => {
      await createTestProblem(user._id.toString(), { status: 'active' });
      await createTestProblem(user._id.toString(), { status: 'learned' });

      const response = await request(app)
        .get('/problems?status=active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('active');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/problems')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /problems', () => {
    it('should create a new problem', async () => {
      const problemData = {
        platform: 'leetcode',
        title: 'Valid Parentheses',
        problemId: 'valid-parentheses',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/valid-parentheses/',
        dateSolved: new Date().toISOString(),
        notes: 'Stack problem',
        isReview: false,
        topics: ['Stack', 'String'],
        companies: ['Google'],
        status: 'active',
        repetition: 0,
        interval: 0,
        nextReviewDate: null
      };

      const response = await request(app)
        .post('/problems')
        .set('Authorization', `Bearer ${token}`)
        .send(problemData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(problemData.title);
      expect(response.body.data.userId).toBe(user._id.toString());
    });

    it('should fail with invalid platform', async () => {
      const problemData = {
        platform: 'invalid-platform',
        title: 'Test Problem',
        problemId: 'test',
        difficulty: 'Easy',
        url: 'https://example.com',
        dateSolved: new Date().toISOString()
      };

      const response = await request(app)
        .post('/problems')
        .set('Authorization', `Bearer ${token}`)
        .send(problemData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate URL for same user', async () => {
      const url = 'https://leetcode.com/problems/duplicate-test/';
      await createTestProblem(user._id.toString(), { url });

      const problemData = {
        platform: 'leetcode',
        title: 'Duplicate Test',
        problemId: 'duplicate-test',
        difficulty: 'Easy',
        url,
        dateSolved: new Date().toISOString()
      };

      const response = await request(app)
        .post('/problems')
        .set('Authorization', `Bearer ${token}`)
        .send(problemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Problem with this URL already exists');
    });
  });

  describe('PUT /problems/:id', () => {
    it('should update a problem', async () => {
      const problem = await createTestProblem(user._id.toString());

      const updates = {
        title: 'Updated Title',
        notes: 'Updated notes',
        isReview: true
      };

      const response = await request(app)
        .put(`/problems/${problem._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.notes).toBe(updates.notes);
      expect(response.body.data.isReview).toBe(true);
    });

    it('should fail to update non-existent problem', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/problems/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Problem not found');
    });

    it('should fail to update another user\'s problem', async () => {
      const { user: otherUser } = await createTestUser({ email: 'other@example.com', username: 'otheruser' });
      const problem = await createTestProblem((otherUser._id as any).toString());

      const response = await request(app)
        .put(`/problems/${problem._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hacked' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /problems/:id', () => {
    it('should delete a problem', async () => {
      const problem = await createTestProblem(user._id.toString());

      const response = await request(app)
        .delete(`/problems/${problem._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Problem deleted successfully');
    });

    it('should fail to delete non-existent problem', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/problems/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /problems/bulk', () => {
    it('should bulk create problems', async () => {
      const problems = [
        {
          platform: 'leetcode',
          title: 'Problem 1',
          problemId: 'problem-1',
          difficulty: 'Easy',
          url: 'https://leetcode.com/problems/problem-1/',
          dateSolved: new Date().toISOString()
        },
        {
          platform: 'leetcode',
          title: 'Problem 2',
          problemId: 'problem-2',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/problem-2/',
          dateSolved: new Date().toISOString()
        }
      ];

      const response = await request(app)
        .post('/problems/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ problems })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toBe(2);
      expect(response.body.data.skipped).toBe(0);
    });

    it('should skip duplicate URLs in bulk create', async () => {
      const url = 'https://leetcode.com/problems/existing/';
      await createTestProblem(user._id.toString(), { url });

      const problems = [
        {
          platform: 'leetcode',
          title: 'Existing Problem',
          problemId: 'existing',
          difficulty: 'Easy',
          url,
          dateSolved: new Date().toISOString()
        },
        {
          platform: 'leetcode',
          title: 'New Problem',
          problemId: 'new',
          difficulty: 'Easy',
          url: 'https://leetcode.com/problems/new/',
          dateSolved: new Date().toISOString()
        }
      ];

      const response = await request(app)
        .post('/problems/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ problems })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toBe(1);
      expect(response.body.data.skipped).toBe(1);
    });
  });
});
