import type { Contest } from '../types';

const CONTEST_HIVE_API_URL = 'https://contest-hive.vercel.app/api';

const platforms = [
  'atcoder', 
  'codechef', 
  'codeforces', 
  'hackerearth', 
  'hackerrank', 
  'leetcode', 
  'toph',
  'codeforces-gym'
];

interface ContestHiveContest {
  title: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  platform: string;
}

const fetchContestsFromHive = async (): Promise<Contest[]> => {
  const promises = platforms.map(platform => 
    fetch(`${CONTEST_HIVE_API_URL}/${platform}`).then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch ${platform}`);
      }
      return res.json();
    })
  );

  const results = await Promise.allSettled(promises);
  
  const allContests: Contest[] = [];

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.ok) {
      const contests: Contest[] = result.value.data.map((contest: ContestHiveContest) => {
        const now = new Date().getTime();
        const startTime = new Date(contest.startTime).getTime();
        const endTime = new Date(contest.endTime).getTime();

        let status: 'scheduled' | 'live' | 'completed' = 'scheduled';
        if (now > endTime) {
          status = 'completed';
        } else if (now >= startTime && now <= endTime) {
          status = 'live';
        }
        
        let platform: 'leetcode' | 'codeforces' | 'atcoder' | 'other' = 'other';
        const lowerCasePlatform = contest.platform.toLowerCase();
        if (lowerCasePlatform.includes('leetcode')) platform = 'leetcode';
        else if (lowerCasePlatform.includes('codeforces')) platform = 'codeforces';
        else if (lowerCasePlatform.includes('atcoder')) platform = 'atcoder';

        return {
          id: `${platform}-${contest.title.replace(/\s/g, '-')}`,
          name: contest.title,
          platform,
          startTime: contest.startTime,
          duration: Math.round(contest.duration / 60), // convert to minutes
          url: contest.url,
          status,
        };
      });
      allContests.push(...contests);
    } else if (result.status === 'rejected') {
      console.error('Error fetching from Contest Hive API:', result.reason);
    }
  });

  return allContests;
};

export const fetchContests = async (): Promise<Contest[]> => {
    const allContests = await fetchContestsFromHive();
    // sort by start time, upcoming first
    allContests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return allContests.filter(c => c.status !== 'completed');
}; 