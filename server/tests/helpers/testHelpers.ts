import { UserModel } from '../../src/models/User';
import { ProblemModel } from '../../src/models/Problem';
import { ContestModel } from '../../src/models/Contest';
import { generateToken } from '../../src/middleware/auth';
import type { User, Problem, Contest } from '../../src/types';

export const createTestUser = async (userData?: Partial<User>) => {
  const defaultUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    settings: {
      reviewIntervals: [2, 4, 7],
      enableNotifications: false,
      theme: 'system' as const,
      timezone: 'UTC'
    }
  };

  const user = new UserModel({ ...defaultUser, ...userData });
  await user.save();

  const token = generateToken({
    id: (user._id as any).toString(),
    email: user.email,
    username: user.username
  });

  return { user, token };
};

export const createTestProblem = async (userId: string, problemData?: Partial<Problem>) => {
  const randomId = Math.random().toString(36).substr(2, 9);
  const defaultProblem = {
    userId,
    platform: 'leetcode' as const,
    title: `Two Sum ${randomId}`,
    problemId: `two-sum-${randomId}`,
    difficulty: 'Easy',
    url: `https://leetcode.com/problems/two-sum-${randomId}/`,
    dateSolved: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    notes: 'Test problem',
    isReview: false,
    repetition: 0,
    interval: 0,
    nextReviewDate: null,
    topics: ['Array', 'Hash Table'],
    status: 'active' as const,
    companies: ['Google', 'Amazon']
  };

  const problem = new ProblemModel({ ...defaultProblem, ...problemData });
  await problem.save();
  return problem;
};

export const createTestContest = async (userId: string, contestData?: Partial<Contest>) => {
  const randomId = Math.random().toString(36).substr(2, 9);
  const defaultContest = {
    userId,
    name: `Weekly Contest ${randomId}`,
    platform: 'leetcode' as const,
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    duration: 90, // 90 minutes
    url: `https://leetcode.com/contest/weekly-contest-${randomId}/`,
    status: 'scheduled' as const,
    problemsSolved: 0
  };

  const contest = new ContestModel({ ...defaultContest, ...contestData });
  await contest.save();
  return contest;
};

export const clearDatabase = async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    ProblemModel.deleteMany({}),
    ContestModel.deleteMany({})
  ]);
};
