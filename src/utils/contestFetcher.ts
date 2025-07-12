import type { Contest } from '../types';

const CODEFORCES_API_URL = '/api/cf';
const ATCODER_API_URL = '/api/atcoder';
const LEETCODE_API_URL = '/api/leetcode';

interface CodeforcesContest {
    id: number;
    name: string;
    startTimeSeconds: number;
    durationSeconds: number;
}

interface AtCoderContest {
    title: string;
    unixTime: number;
    duration: number;
    link: string;
}

interface LeetCodeContest {
    title: string;
    startTime: number;
    duration: number;
}

const fetchCodeforcesContests = async (): Promise<Contest[]> => {
    try {
        const response = await fetch(`${CODEFORCES_API_URL}/contest.list`);
        const data = await response.json();
        if (data.status === 'OK') {
            const upcoming = data.result.filter((c: CodeforcesContest) => c.startTimeSeconds * 1000 > Date.now());
            return upcoming.map((c: CodeforcesContest) => ({
                id: `cf-${c.id}`,
                name: c.name,
                platform: 'codeforces',
                startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
                duration: c.durationSeconds / 60, // minutes
                url: `https://codeforces.com/contests/${c.id}`,
                status: 'scheduled'
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching Codeforces contests:', error);
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

const fetchLeetCodeContests = async (): Promise<Contest[]> => {
    try {
        const response = await fetch(`${LEETCODE_API_URL}/contest-info`);
        const data = await response.json();
        // Assuming the API returns a list of contests
        return data.map((c: LeetCodeContest) => ({
            id: `lc-${c.title.replace(/\s/g, '-')}`,
            name: c.title,
            platform: 'leetcode',
            startTime: new Date(c.startTime * 1000).toISOString(),
            duration: c.duration / 60, // minutes
            url: `https://leetcode.com/contest/${c.title.toLowerCase().replace(/\s/g, '-')}`,
            status: 'scheduled'
        }));
    } catch (error) {
        console.error('Error fetching LeetCode contests:', error);
        return [];
    }
};

const 플랫폼들 = ["Codeforces", "LeetCode", "AtCoder", "CodeChef"];

export const fetchContests = async () => {
    const contestPromises = 플랫폼들.map(async (platform) => {
        try {
            let url = '';
            let contests = [];

            if (platform === "Codeforces") {
                url = '/api/cf/contest.list';
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                contests = data.result
                    .filter((contest: any) => contest.phase === 'BEFORE')
                    .map((contest: any) => ({
                        id: contest.id.toString(),
                        platform: "Codeforces",
                        name: contest.name,
                        startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
                        duration: contest.durationSeconds,
                        url: `https://codeforces.com/contest/${contest.id}`,
                    }));
            } else if (platform === "LeetCode") {
                url = '/api/leetcode';
                const query = `
                    query upcomingContests {
                      upcomingContests {
                        title
                        startTime
                        duration
                      }
                    }
                `;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
                }
                
                const data = await response.json();
                if (data.errors) {
                    console.error("GraphQL errors:", data.errors);
                    throw new Error("GraphQL query failed");
                }
                
                contests = data.data.upcomingContests.map((contest: any) => ({
                    id: contest.titleSlug,
                    platform: "LeetCode",
                    name: contest.title,
                    startTime: new Date(parseInt(contest.startTime, 10) * 1000).toISOString(),
                    duration: contest.duration,
                    url: `https://leetcode.com/contest/${contest.titleSlug}`,
                }));
            } else if (platform === "AtCoder") {
                url = 'https://contest-hive.vercel.app/api/atcoder';
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                contests = data.data.map((c: any) => ({
                    id: c.url.split('/').pop() || c.title,
                    platform: "AtCoder",
                    name: c.title,
                    startTime: new Date(Date.parse(c.startTime)).toISOString(),
                    duration: c.duration,
                    url: c.url,
                }));
            } else if (platform === "CodeChef") {
                url = 'https://contest-hive.vercel.app/api/codechef';
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                contests = data.data.map((c: any) => ({
                    id: c.url.split('/').pop() || c.title,
                    platform: "CodeChef",
                    name: c.title,
                    startTime: new Date(Date.parse(c.startTime)).toISOString(),
                    duration: c.duration,
                    url: c.url,
                }));
            }

            return contests;
        } catch (error) {
            console.error(`Error fetching ${platform} contests:`, error);
            return []; // Return empty array on error to avoid breaking Promise.all
        }
    });

    try {
        const allContests = await Promise.all(contestPromises);
        return allContests.flat();
    } catch (error) {
        console.error("Error fetching all contests:", error);
        throw error; // Rethrow or handle as needed
    }
}; 