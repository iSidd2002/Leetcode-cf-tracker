export interface Problem {
  id: string;
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
}

export interface PlatformStats {
  leetcode: number;
  codeforces: number;
}

export interface DifficultyStats {
  leetcode: {
    easy: number;
    medium: number;
    hard: number;
  };
  codeforces: Record<string, number>;
}

export interface OverallStats {
  totalProblems: number;
  thisWeek: number;
  thisMonth: number;
  streakDays: number;
  byPlatform: PlatformStats;
  byDifficulty: DifficultyStats;
  recentActivity: Problem[];
}

export interface ChartDataPoint {
  date: string;
  problems: number;
  cumulative: number;
}

export interface LeetCodeTopicTag {
  name: string;
  id: string;
  slug: string;
}

export interface LeetCodeQuestion {
  acRate: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  freqBar: number | null;
  frontendQuestionId: string;
  isFavor: boolean;
  paidOnly: boolean;
  status: string | null;
  title: string;
  titleSlug: string;
  hasVideoSolution: boolean;
  hasSolution: boolean;
  topicTags: LeetCodeTopicTag[];
}

export interface ActiveDailyCodingChallengeQuestion {
  date: string;
  userStatus: string;
  link: string;
  question: LeetCodeQuestion;
}

export interface LeetCodeDailyProblemResponse {
  data: {
    activeDailyCodingChallengeQuestion: ActiveDailyCodingChallengeQuestion;
  };
}

export interface Contest {
  id: string;
  name: string;
  platform: 'leetcode' | 'codeforces' | 'atcoder' | 'other';
  startTime: string;
  duration: number; // in minutes
  url: string;
  rank?: number;
  problemsSolved?: number;
  totalProblems?: number;
  status: 'scheduled' | 'live' | 'completed';
}
