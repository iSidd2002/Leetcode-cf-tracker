import { Request } from 'express';

// User Types
export interface User {
  _id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  reviewIntervals: number[];
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
}

// Problem Types (matching frontend)
export interface Problem {
  _id: string;
  userId: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder';
  title: string;
  problemId: string;
  difficulty: string;
  url: string;
  dateSolved: string;
  createdAt: string;
  notes: string;
  isReview: boolean;
  repetition: number;
  interval: number;
  nextReviewDate: string | null;
  topics: string[];
  status: 'active' | 'learned';
  companies: string[];
}

// Contest Types (matching frontend)
export interface Contest {
  _id: string;
  userId: string;
  name: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'codechef' | 'other';
  startTime: string;
  duration: number; // in minutes
  url: string;
  rank?: number;
  problemsSolved?: number;
  totalProblems?: number;
  status: 'scheduled' | 'live' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Sync Types
export interface SyncData {
  problems: Problem[];
  contests: Contest[];
  settings: UserSettings;
  lastSyncAt: string;
}

export interface SyncRequest {
  problems: Partial<Problem>[];
  contests: Partial<Contest>[];
  settings: Partial<UserSettings>;
  lastSyncAt: string;
}
