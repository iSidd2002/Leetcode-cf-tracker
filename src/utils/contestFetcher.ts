import type { Contest } from '../types';

const CODEFORCES_API_URL = 'https://codeforces.com/api/contest.list';

interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
}

const fetchCodeforcesContests = async (): Promise<Contest[]> => {
    try {
        const response = await fetch(`${CODEFORCES_API_URL}`);
        const data = await response.json();
        if (data.status === 'OK') {
            return data.result
                .filter((c: CodeforcesContest) => c.phase === 'BEFORE' && c.startTimeSeconds)
                .map((c: CodeforcesContest) => ({
                    id: c.id.toString(),
                    title: c.name,
                    platform: 'codeforces' as const,
                    startTime: new Date((c.startTimeSeconds || 0) * 1000).toISOString(),
                    duration: c.durationSeconds / 60, // Convert to minutes
                    url: `https://codeforces.com/contest/${c.id}`,
                    isRegistered: false,
                }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching CodeForces contests:', error);
        return [];
    }
};

export async function fetchAtCoderContests(): Promise<Contest[]> {
  try {
    const response = await fetch('https://contest-hive.vercel.app/api/atcoder');
    if (!response.ok) {
      throw new Error('Failed to fetch AtCoder contests');
    }
    const { data } = await response.json();
    return data.map((contest: any) => ({
      id: contest.url.split('/').pop() || contest.title, // Extract ID from URL
      name: contest.title,
      startTime: Date.parse(contest.startTime) / 1000, // Convert ISO to Unix timestamp (seconds)
      duration: contest.duration, // Already in seconds
      url: contest.url,
    }));
  } catch (error) {
    console.error('Error fetching AtCoder contests:', error);
    return [];
  }
}

export const fetchContests = async (): Promise<Contest[]> => {
    const codeforcesContests = await fetchCodeforcesContests();
    return [...codeforcesContests];
}; 