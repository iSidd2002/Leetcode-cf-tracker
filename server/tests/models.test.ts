import { UserModel } from '../src/models/User';
import { ProblemModel } from '../src/models/Problem';
import { ContestModel } from '../src/models/Contest';
import { clearDatabase } from './helpers/testHelpers';

describe('Database Models', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('User Model', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const user = new UserModel(userData);
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.settings).toBeDefined();
      expect(user.settings.reviewIntervals).toEqual([2, 4, 7]);
    });

    it('should fail with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123'
      };

      const user = new UserModel(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser1',
        password: 'password123'
      };

      const user1 = new UserModel(userData);
      await user1.save();

      const user2 = new UserModel({
        ...userData,
        username: 'testuser2'
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      const password = 'plaintext123';
      const user = new UserModel({
        email: 'test@example.com',
        username: 'testuser',
        password
      });

      await user.save();
      expect(user.password).not.toBe(password);
      expect(user.password.length).toBeGreaterThan(password.length);
    });

    it('should compare passwords correctly', async () => {
      const password = 'testpassword123';
      const user = new UserModel({
        email: 'test@example.com',
        username: 'testuser',
        password
      });

      await user.save();

      const isValid = await user.comparePassword(password);
      const isInvalid = await user.comparePassword('wrongpassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Problem Model', () => {
    let userId: string;

    beforeEach(async () => {
      const user = new UserModel({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });
      await user.save();
      userId = (user._id as any).toString();
    });

    it('should create a problem with valid data', async () => {
      const problemData = {
        userId,
        platform: 'leetcode' as const,
        title: 'Two Sum',
        problemId: 'two-sum',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/two-sum/',
        dateSolved: new Date().toISOString(),
        notes: 'Hash table solution',
        topics: ['Array', 'Hash Table'],
        companies: ['Google', 'Amazon']
      };

      const problem = new ProblemModel(problemData);
      await problem.save();

      expect(problem._id).toBeDefined();
      expect(problem.userId.toString()).toBe(userId);
      expect(problem.platform).toBe(problemData.platform);
      expect(problem.title).toBe(problemData.title);
      expect(problem.status).toBe('active'); // Default value
      expect(problem.isReview).toBe(false); // Default value
    });

    it('should fail with invalid platform', async () => {
      const problemData = {
        userId,
        platform: 'invalid' as any,
        title: 'Test Problem',
        problemId: 'test',
        difficulty: 'Easy',
        url: 'https://example.com',
        dateSolved: new Date().toISOString()
      };

      const problem = new ProblemModel(problemData);
      await expect(problem.save()).rejects.toThrow();
    });

    it('should enforce unique URL per user', async () => {
      const url = 'https://leetcode.com/problems/unique-test/';
      
      const problem1 = new ProblemModel({
        userId,
        platform: 'leetcode',
        title: 'Problem 1',
        problemId: 'problem-1',
        difficulty: 'Easy',
        url,
        dateSolved: new Date().toISOString()
      });
      await problem1.save();

      const problem2 = new ProblemModel({
        userId,
        platform: 'leetcode',
        title: 'Problem 2',
        problemId: 'problem-2',
        difficulty: 'Medium',
        url,
        dateSolved: new Date().toISOString()
      });

      await expect(problem2.save()).rejects.toThrow();
    });
  });

  describe('Contest Model', () => {
    let userId: string;

    beforeEach(async () => {
      const user = new UserModel({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });
      await user.save();
      userId = (user._id as any).toString();
    });

    it('should create a contest with valid data', async () => {
      const contestData = {
        userId,
        name: 'Weekly Contest 123',
        platform: 'leetcode' as const,
        startTime: new Date().toISOString(),
        duration: 90,
        url: 'https://leetcode.com/contest/weekly-contest-123/'
      };

      const contest = new ContestModel(contestData);
      await contest.save();

      expect(contest._id).toBeDefined();
      expect(contest.userId.toString()).toBe(userId);
      expect(contest.name).toBe(contestData.name);
      expect(contest.platform).toBe(contestData.platform);
      expect(contest.status).toBe('scheduled'); // Default value
      expect(contest.problemsSolved).toBe(0); // Default value
    });

    it('should fail with invalid platform', async () => {
      const contestData = {
        userId,
        name: 'Test Contest',
        platform: 'invalid' as any,
        startTime: new Date().toISOString(),
        duration: 90,
        url: 'https://example.com'
      };

      const contest = new ContestModel(contestData);
      await expect(contest.save()).rejects.toThrow();
    });

    it('should fail with invalid duration', async () => {
      const contestData = {
        userId,
        name: 'Test Contest',
        platform: 'leetcode' as const,
        startTime: new Date().toISOString(),
        duration: 0,
        url: 'https://leetcode.com/contest/test'
      };

      const contest = new ContestModel(contestData);
      await expect(contest.save()).rejects.toThrow();
    });

    it('should enforce unique name and platform per user', async () => {
      const name = 'Duplicate Contest';
      const platform = 'leetcode' as const;

      const contest1 = new ContestModel({
        userId,
        name,
        platform,
        startTime: new Date().toISOString(),
        duration: 90,
        url: 'https://leetcode.com/contest/1'
      });
      await contest1.save();

      const contest2 = new ContestModel({
        userId,
        name,
        platform,
        startTime: new Date().toISOString(),
        duration: 120,
        url: 'https://leetcode.com/contest/2'
      });

      await expect(contest2.save()).rejects.toThrow();
    });
  });
});
