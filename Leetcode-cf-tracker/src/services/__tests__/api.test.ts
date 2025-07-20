import { describe, it, expect, beforeEach, vi } from 'vitest';
import ApiService from '../api';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up authentication token for tests that need it
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'auth_token') return 'mock-jwt-token';
      return null;
    });
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const result = await ApiService.login('test@example.com', 'password123');

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', result.token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(result.user));
    });

    it('should fail login with invalid credentials', async () => {
      await expect(
        ApiService.login('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should register successfully', async () => {
      const result = await ApiService.register('new@example.com', 'newuser', 'password123');

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('new@example.com');
      expect(result.user.username).toBe('newuser');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', result.token);
    });

    it('should get user profile', async () => {
      mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');

      const profile = await ApiService.getProfile();

      expect(profile.email).toBe('test@example.com');
      expect(profile.username).toBe('testuser');
      expect(profile.settings).toBeDefined();
    });

    it('should logout correctly', () => {
      ApiService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should check authentication status', () => {
      mockLocalStorage.getItem.mockReturnValue('some-token');
      expect(ApiService.isAuthenticated()).toBe(true);

      mockLocalStorage.getItem.mockReturnValue(null);
      expect(ApiService.isAuthenticated()).toBe(false);
    });

    it('should get current user', () => {
      const mockUser = { id: '123', email: 'test@example.com', username: 'testuser' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const user = ApiService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });
  });

  describe('Problems API', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');
      // Ensure the API service recognizes the token
      ApiService.setToken('mock-jwt-token');
    });

    it('should get problems', async () => {
      const problems = await ApiService.getProblems();

      expect(Array.isArray(problems)).toBe(true);
      expect(problems.length).toBeGreaterThan(0);
      expect(problems[0]).toHaveProperty('title');
      expect(problems[0]).toHaveProperty('platform');
    });

    it('should filter problems by platform', async () => {
      const problems = await ApiService.getProblems({ platform: 'leetcode' });

      expect(problems.every(p => p.platform === 'leetcode')).toBe(true);
    });

    it('should create a problem', async () => {
      const problemData = {
        platform: 'leetcode' as const,
        title: 'Test Problem',
        problemId: 'test-problem',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/test-problem/',
        dateSolved: new Date().toISOString(),
        notes: 'Test notes',
        isReview: false,
        repetition: 0,
        interval: 0,
        nextReviewDate: null,
        topics: ['Array'],
        status: 'active' as const,
        companies: ['Google']
      };

      const result = await ApiService.createProblem(problemData);

      expect(result.title).toBe(problemData.title);
      expect(result.platform).toBe(problemData.platform);
      expect(result._id).toBeDefined();
    });

    it('should update a problem', async () => {
      const updates = {
        title: 'Updated Title',
        notes: 'Updated notes'
      };

      const result = await ApiService.updateProblem('problem-1', updates);

      expect(result.title).toBe(updates.title);
      expect(result.notes).toBe(updates.notes);
    });

    it('should delete a problem', async () => {
      await expect(ApiService.deleteProblem('problem-1')).resolves.not.toThrow();
    });

    it('should bulk create problems', async () => {
      const problems = [
        {
          platform: 'leetcode' as const,
          title: 'Problem 1',
          problemId: 'problem-1',
          difficulty: 'Easy',
          url: 'https://leetcode.com/problems/problem-1/',
          dateSolved: new Date().toISOString()
        },
        {
          platform: 'leetcode' as const,
          title: 'Problem 2',
          problemId: 'problem-2',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/problem-2/',
          dateSolved: new Date().toISOString()
        }
      ];

      const result = await ApiService.bulkCreateProblems(problems);

      expect(result.created).toBeGreaterThan(0);
      expect(typeof result.skipped).toBe('number');
    });
  });

  describe('Contests API', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');
      // Ensure the API service recognizes the token
      ApiService.setToken('mock-jwt-token');
    });

    it('should get contests', async () => {
      const contests = await ApiService.getContests();

      expect(Array.isArray(contests)).toBe(true);
      expect(contests.length).toBeGreaterThan(0);
      expect(contests[0]).toHaveProperty('name');
      expect(contests[0]).toHaveProperty('platform');
    });

    it('should create a contest', async () => {
      const contestData = {
        name: 'Test Contest',
        platform: 'leetcode' as const,
        startTime: new Date().toISOString(),
        duration: 90,
        url: 'https://leetcode.com/contest/test/',
        status: 'scheduled' as const
      };

      const result = await ApiService.createContest(contestData);

      expect(result.name).toBe(contestData.name);
      expect(result.platform).toBe(contestData.platform);
      expect(result._id).toBeDefined();
    });

    it('should update a contest', async () => {
      const updates = {
        status: 'completed' as const,
        rank: 42,
        problemsSolved: 3
      };

      const result = await ApiService.updateContest('contest-1', updates);

      expect(result.status).toBe(updates.status);
      expect(result.rank).toBe(updates.rank);
      expect(result.problemsSolved).toBe(updates.problemsSolved);
    });

    it('should delete a contest', async () => {
      await expect(ApiService.deleteContest('contest-1')).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Mock fetch to throw an error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(ApiService.getProblems()).rejects.toThrow('Network error');

      global.fetch = originalFetch;
    });

    it('should handle unauthorized requests', async () => {
      mockLocalStorage.getItem.mockReturnValue(null); // No token
      ApiService.setToken(null); // Clear the API service token

      await expect(ApiService.getProblems()).rejects.toThrow();
    });
  });
});
