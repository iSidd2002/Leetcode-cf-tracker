import { Request, Response } from 'express';

interface LeetCodeGraphQLResponse {
  data: {
    activeDailyCodingChallengeQuestion: {
      date: string;
      userStatus: string | null;
      link: string;
      question: {
        acRate: number;
        difficulty: string;
        freqBar: number | null;
        frontendQuestionId: string;
        isFavor: boolean;
        paidOnly: boolean;
        status: string | null;
        title: string;
        titleSlug: string;
        hasVideoSolution: boolean;
        hasSolution: boolean;
        topicTags: Array<{
          name: string;
          id: string;
          slug: string;
        }>;
      };
    };
  };
}

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

// Helper function to make LeetCode API request with retry logic
const fetchWithRetry = async (query: string, maxRetries: number = 3): Promise<globalThis.Response> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`POTD API attempt ${attempt}/${maxRetries}`);

      const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://leetcode.com/',
          'Origin': 'https://leetcode.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (response.ok) {
        console.log(`POTD API success on attempt ${attempt}`);
        return response;
      }

      // Log the error but continue retrying for certain status codes
      const errorText = await response.text();
      console.warn(`POTD API attempt ${attempt} failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 200)
      });

      // Don't retry for client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`LeetCode API responded with status: ${response.status} - ${errorText}`);
      }

      lastError = new Error(`LeetCode API responded with status: ${response.status} - ${errorText}`);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.warn(`POTD API attempt ${attempt} error:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry for timeout or network errors on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('All retry attempts failed');
};

export const getDailyProblem = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.body;

  if (!query) {
    res.status(400).json({
      success: false,
      error: 'GraphQL query is required'
    });
    return;
  }

  // Create fallback data that's always available
  const fallbackProblem = {
    data: {
      activeDailyCodingChallengeQuestion: {
        date: new Date().toISOString().split('T')[0], // Today's date
        userStatus: "NotStart",
        link: "/problems/two-sum/",
        question: {
          acRate: 54.5,
          difficulty: "Easy",
          freqBar: null,
          frontendQuestionId: "1",
          isFavor: false,
          paidOnly: false,
          status: null,
          title: "Two Sum (Fallback Problem)",
          titleSlug: "two-sum",
          hasVideoSolution: true,
          hasSolution: true,
          topicTags: [
            {
              name: "Array",
              id: "VG9waWNUYWdOb2RlOjU=",
              slug: "array"
            },
            {
              name: "Hash Table",
              id: "VG9waWNUYWdOb2RlOjY=",
              slug: "hash-table"
            }
          ]
        }
      }
    }
  };

  try {
    // Try to get real data from LeetCode
    console.log('POTD API: Attempting to fetch from LeetCode...');
    const response = await fetchWithRetry(query);
    const data = await response.json() as unknown as LeetCodeGraphQLResponse;

    // Check if we got valid data
    if (data.data && data.data.activeDailyCodingChallengeQuestion) {
      console.log('POTD API: ✅ Successfully fetched real daily problem:', data.data.activeDailyCodingChallengeQuestion.question?.title);
      res.json(data);
      return;
    } else {
      console.warn('POTD API: ⚠️ No daily problem found in LeetCode response, using fallback');
    }

  } catch (error) {
    console.error('POTD API: ❌ LeetCode API failed, using fallback:', error);
  }

  // Always return fallback data with 200 status if real data fails
  console.log('POTD API: 🔄 Using fallback problem: Two Sum');
  res.json(fallbackProblem);
};

// Alternative endpoint for CodeForces POTD (if needed in the future)
export const getCodeForcesProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    // CodeForces doesn't have a daily problem concept like LeetCode
    // But we could implement a random problem selector or featured problem
    res.status(501).json({
      success: false,
      error: 'CodeForces daily problem not implemented yet'
    });
  } catch (error) {
    console.error('CodeForces POTD error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
