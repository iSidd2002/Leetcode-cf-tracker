import type { Contest } from '../types';

const KONTESTS_API_URL = 'https://kontests.net/api/v1/all';

const fetchKontests = async (): Promise<Contest[]> => {
  try {
    const response = await fetch(KONTESTS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    const contests: Contest[] = data
      .map((contest: any) => {
        let platform: 'leetcode' | 'codeforces' | 'atcoder' | 'other' = 'other';
        if (contest.site.toLowerCase().includes('leetcode')) platform = 'leetcode';
        else if (contest.site.toLowerCase().includes('codeforces')) platform = 'codeforces';
        else if (contest.site.toLowerCase().includes('atcoder')) platform = 'atcoder';

        return {
          id: `${platform}-${contest.name.replace(/\s/g, '-')}`,
          name: contest.name,
          platform,
          startTime: contest.start_time,
          duration: contest.duration,
          url: contest.url,
          status: 'scheduled' as const,
        };
      });

    return contests;
  } catch (error) {
    console.error('Error fetching from Kontests API:', error);
    return [];
  }
};

export const fetchContests = async (): Promise<Contest[]> => {
    const allContests = await fetchKontests();
    return allContests;
}; 