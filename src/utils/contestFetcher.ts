import type { Contest } from '../types';

// Contest-Hive API for multi-platform contest tracking
const CONTEST_HIVE_API_URL = 'https://contest-hive.vercel.app/api';

// Fallback APIs
const CODEFORCES_API_URL = 'https://codeforces.com/api/contest.list';
const ATCODER_API_URL = 'https://atcoder.jp/contests/';
const CODECHEF_API_URL = 'https://www.codechef.com/api/list/contests/all';

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

interface AtCoderContest {
  id: string;
  start_epoch_second: number;
  duration_second: number;
  title: string;
  rate_change: string;
}

interface CodeChefContest {
  contest_code: string;
  contest_name: string;
  contest_start_date: string;
  contest_end_date: string;
  contest_start_date_iso: string;
  contest_end_date_iso: string;
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



const fetchAtCoderContests = async (): Promise<Contest[]> => {
  try {
    const response = await fetch(ATCODER_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: AtCoderContest[] = await response.json();

    const now = Date.now() / 1000;
    const contests: Contest[] = data
      .filter((contest: AtCoderContest) => contest.start_epoch_second > now)
      .slice(0, 20) // Limit to next 20 contests
      .map((contest: AtCoderContest) => ({
        id: contest.id,
        name: contest.title,
        platform: 'atcoder' as const,
        startTime: new Date(contest.start_epoch_second * 1000).toISOString(),
        duration: contest.duration_second / 60, // Convert to minutes
        url: `https://atcoder.jp/contests/${contest.id}`,
        status: 'scheduled' as const,
        type: contest.rate_change === '-' ? 'unrated' : 'rated',
      }));

    return contests;
  } catch (error) {
    console.error('Error fetching AtCoder contests:', error);
    return [];
  }
};

const fetchCodeChefContests = async (): Promise<Contest[]> => {
  try {
    const response = await fetch(CODECHEF_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.present_contests && !data.future_contests) {
      return [];
    }

    const contests: Contest[] = [];

    // Add future contests
    if (data.future_contests) {
      data.future_contests.forEach((contest: CodeChefContest) => {
        contests.push({
          id: contest.contest_code,
          name: contest.contest_name,
          platform: 'other' as const, // CodeChef maps to 'other' platform
          startTime: contest.contest_start_date_iso,
          duration: Math.round((new Date(contest.contest_end_date_iso).getTime() - new Date(contest.contest_start_date_iso).getTime()) / (1000 * 60)), // Convert to minutes
          url: `https://www.codechef.com/${contest.contest_code}`,
          status: 'scheduled' as const,
          type: 'contest',
        });
      });
    }

    return contests.slice(0, 20); // Limit to next 20 contests
  } catch (error) {
    console.error('Error fetching CodeChef contests:', error);
    return [];
  }
};

const fetchLeetCodeContests = async (): Promise<Contest[]> => {
  try {
    // LeetCode doesn't have a public API for contests, but we can try to scrape or use a proxy
    // For now, return empty array - this would need a more sophisticated implementation
    console.log('LeetCode contest fetching not implemented yet');
    return [];
  } catch (error) {
    console.error('Error fetching LeetCode contests:', error);
    return [];
  }
};

// Contest-Hive API interface
interface ContestHiveContest {
  title: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number;
  platform: string;
}

interface ContestHiveResponse {
  ok: boolean;
  data: {
    atcoder: ContestHiveContest[];
    codechef: ContestHiveContest[];
    codeforces: ContestHiveContest[];
    hackerearth: ContestHiveContest[];
    hackerrank: ContestHiveContest[];
    leetcode: ContestHiveContest[];
    toph: ContestHiveContest[];
    'codeforces-gym': ContestHiveContest[];
  };
  lastUpdated: string;
}

const fetchFromContestHive = async (): Promise<Contest[]> => {
  try {
    console.log('Fetching contests from Contest-Hive API...');
    const response = await fetch(`${CONTEST_HIVE_API_URL}/all`);

    if (!response.ok) {
      throw new Error(`Contest-Hive API error: ${response.status}`);
    }

    const result: ContestHiveResponse = await response.json();

    if (!result.ok || !result.data) {
      throw new Error('Contest-Hive API returned no data');
    }

    const contests: Contest[] = [];
    const platforms: string[] = [];

    // Process all platforms
    Object.entries(result.data).forEach(([platformKey, platformContests]) => {
      if (platformContests && platformContests.length > 0) {
        platforms.push(platformKey);

        platformContests.forEach((contest, index) => {
          const mappedPlatform = mapPlatform(contest.platform);
          contests.push({
            id: `${platformKey}-${index}`,
            name: contest.title,
            platform: mappedPlatform,
            startTime: contest.startTime,
            duration: contest.duration / 60, // Convert seconds to minutes
            url: contest.url,
            status: 'scheduled' as const
          });
        });
      }
    });

    // Sort by start time
    contests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    console.log(`✅ Contest-Hive: Fetched ${contests.length} contests from platforms: ${platforms.join(', ')}`);
    return contests;

  } catch (error) {
    console.error('❌ Contest-Hive API failed:', error);
    throw error;
  }
};

// Map Contest-Hive platform names to our platform types
const mapPlatform = (platform: string): 'leetcode' | 'codeforces' | 'atcoder' | 'codechef' | 'other' => {
  const platformLower = platform.toLowerCase();
  switch (platformLower) {
    case 'leetcode':
      return 'leetcode';
    case 'codeforces':
      return 'codeforces';
    case 'atcoder':
      return 'atcoder';
    case 'codechef':
      return 'codechef';
    case 'hackerearth':
    case 'hackerrank':
    case 'toph':
    case 'codeforces-gym':
    default:
      return 'other';
  }
};

export const fetchContests = async (): Promise<Contest[]> => {
  try {
    // Primary: Use Contest-Hive API for multi-platform contest data
    return await fetchFromContestHive();

  } catch (error) {
    console.error('Contest-Hive API failed, falling back to CodeForces only:', error);

    // Fallback: Use CodeForces API directly
    try {
      const codeforcesContests = await fetchCodeforcesContests();
      console.log('🔄 Fallback: Using CodeForces contests only');
      return codeforcesContests;
    } catch (fallbackError) {
      console.error('❌ All contest APIs failed:', fallbackError);
      return [];
    }
  }
};