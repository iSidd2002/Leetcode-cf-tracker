import type { Contest } from '../types';

const CODEFORCES_API_URL = 'https://codeforces.com/api/contest.list';

interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds: number;
  relativeTimeSeconds: number;
}

const fetchCodeforcesContests = async (): Promise<Contest[]> => {
  try {
    const response = await fetch(CODEFORCES_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`API error: ${data.comment}`);
    }

    const contests: Contest[] = data.result
      .filter((contest: CodeforcesContest) => contest.phase === 'BEFORE')
      .map((contest: CodeforcesContest) => ({
        id: contest.id.toString(),
        name: contest.name,
        platform: 'codeforces' as const,
        startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
        duration: contest.durationSeconds,
        url: `https://codeforces.com/contest/${contest.id}`,
        status: 'scheduled' as const,
        type: contest.type.toLowerCase() as any,
      }));

    return contests;
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
    return [];
  }
};



export const fetchContests = async (): Promise<Contest[]> => {
    const codeforcesContests = await fetchCodeforcesContests();
    return [...codeforcesContests];
}; 