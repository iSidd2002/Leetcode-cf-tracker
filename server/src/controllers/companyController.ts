import { Request, Response } from 'express';

interface CompanyProblem {
  title: string;
  url: string;
  difficulty: string;
  frequency?: number;
  tags?: string[];
  source: string;
}

interface CompanyProblemsResponse {
  company: string;
  problems: CompanyProblem[];
  totalCount: number;
  sources: string[];
}

// GitHub repository sources for company problems
const GITHUB_SOURCES = {
  'liquidslr': 'https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main',
  'hxu296': 'https://raw.githubusercontent.com/hxu296/leetcode-company-wise-problems-2022/main/companies',
  'MysteryVaibhav': 'https://raw.githubusercontent.com/MysteryVaibhav/leetcode_company_wise_problems/master',
  'krishnadey30': 'https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/companies',
  'xizhengszhang': 'https://raw.githubusercontent.com/xizhengszhang/Leetcode_company_frequency/master/companies',
  'wisdompeak': 'https://raw.githubusercontent.com/wisdompeak/LeetCode/master/companies'
};

// LeetCode GraphQL endpoint for company problems
const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

// Simple in-memory cache for company problems
interface CacheEntry {
  data: CompanyProblem[];
  timestamp: number;
  sources: string[];
}

const problemsCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const fetchFromGitHubSource = async (company: string, source: string, baseUrl: string): Promise<CompanyProblem[]> => {
  const problems: CompanyProblem[] = [];
  const companyName = company.replace(/ /g, '%20');
  
  const fileNamesToTry = [
    "5. All.csv",
    "all-time.csv",
    "All.csv",
    "all.csv",
    "4. More Than Six Months.csv",
    "1-2 years.csv",
    "3. Six Months.csv",
    "6-12 months.csv",
    "2. Three Months.csv",
    "0-6 months.csv",
    "1. Thirty Days.csv",
    "30-days.csv",
    "problems.csv",
    "questions.csv",
    `${company}.csv`,
    `${company.toLowerCase()}.csv`,
    `${company.replace(/\s+/g, '')}.csv`,
    `${company.replace(/\s+/g, '').toLowerCase()}.csv`,
    `${company.replace(/\s+/g, '_')}.csv`,
    `${company.replace(/\s+/g, '_').toLowerCase()}.csv`,
    `${company.replace(/\s+/g, '-')}.csv`,
    `${company.replace(/\s+/g, '-').toLowerCase()}.csv`
  ];

  for (const fileName of fileNamesToTry) {
    try {
      const encodedFileName = fileName.replace(/ /g, '%20');
      const url = `${baseUrl}/${companyName}/${encodedFileName}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        
        parsed.forEach(row => {
          problems.push({
            title: row.title,
            url: row.url,
            difficulty: row.difficulty,
            source: source,
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : []
          });
        });
        
        if (problems.length > 0) break; // Stop on first successful file
      }
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
    }
  }
  
  return problems;
};

const parseCSV = (csvText: string): Array<{title: string, url: string, difficulty: string, tags?: string}> => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const titleIndex = headers.findIndex(h => h.toLowerCase().includes('title') || h.toLowerCase().includes('name'));
  const linkIndex = headers.findIndex(h => h.toLowerCase().includes('link') || h.toLowerCase().includes('url'));
  const difficultyIndex = headers.findIndex(h => h.toLowerCase().includes('difficulty'));
  const tagsIndex = headers.findIndex(h => h.toLowerCase().includes('tag'));
  
  if (titleIndex === -1 || linkIndex === -1 || difficultyIndex === -1) {
    return [];
  }
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (values.length >= headers.length) {
      const title = values[titleIndex]?.trim().replace(/"/g, '');
      const url = values[linkIndex]?.trim().replace(/"/g, '');
      const difficulty = values[difficultyIndex]?.trim().replace(/"/g, '');
      const tags = tagsIndex !== -1 ? values[tagsIndex]?.trim().replace(/"/g, '') : undefined;
      
      if (title && url && difficulty) {
        data.push({ title, url, difficulty, tags });
      }
    }
  }
  return data;
};

const fetchFromLeetCodeAPI = async (company: string): Promise<CompanyProblem[]> => {
  try {
    // This would require a more sophisticated implementation
    // LeetCode's GraphQL API requires authentication and has rate limits
    // For now, return empty array
    console.log(`LeetCode API fetching for ${company} not implemented yet`);
    return [];
  } catch (error) {
    console.error('Error fetching from LeetCode API:', error);
    return [];
  }
};

export const getCompanyProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company } = req.params;
    const { source, limit = 100, useCache = 'true' } = req.query;

    if (!company) {
      res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
      return;
    }

    // Check cache first (unless explicitly disabled)
    const cacheKey = `${company}-${source || 'all'}`;
    if (useCache === 'true') {
      const cached = problemsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`📦 Cache hit for ${company} (${cached.data.length} problems)`);

        const limitedProblems = cached.data.slice(0, Number(limit));
        const response: CompanyProblemsResponse = {
          company,
          problems: limitedProblems,
          totalCount: cached.data.length,
          sources: cached.sources
        };

        res.json({
          success: true,
          data: response
        });
        return;
      }
    }

    console.log(`🔍 Fetching fresh data for ${company}...`);
    const allProblems: CompanyProblem[] = [];
    const sources: string[] = [];

    // Fetch from GitHub sources
    if (!source || source === 'github') {
      for (const [sourceName, baseUrl] of Object.entries(GITHUB_SOURCES)) {
        const problems = await fetchFromGitHubSource(company, sourceName, baseUrl);
        allProblems.push(...problems);
        if (problems.length > 0) {
          sources.push(sourceName);
        }
      }
    }

    // Fetch from LeetCode API (future implementation)
    if (!source || source === 'leetcode') {
      const leetcodeProblems = await fetchFromLeetCodeAPI(company);
      allProblems.push(...leetcodeProblems);
      if (leetcodeProblems.length > 0) {
        sources.push('leetcode');
      }
    }

    // Remove duplicates based on URL
    const uniqueProblems = allProblems.reduce((acc, problem) => {
      if (!acc.find(p => p.url === problem.url)) {
        acc.push(problem);
      }
      return acc;
    }, [] as CompanyProblem[]);

    // Sort by difficulty and title
    const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    uniqueProblems.sort((a, b) => {
      const diffA = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 4;
      const diffB = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 4;
      if (diffA !== diffB) return diffA - diffB;
      return a.title.localeCompare(b.title);
    });

    // Apply limit
    const limitedProblems = uniqueProblems.slice(0, Number(limit));

    // Cache the results for future requests
    if (useCache === 'true' && uniqueProblems.length > 0) {
      problemsCache.set(cacheKey, {
        data: uniqueProblems,
        timestamp: Date.now(),
        sources
      });
      console.log(`💾 Cached ${uniqueProblems.length} problems for ${company}`);
    }

    const response: CompanyProblemsResponse = {
      company,
      problems: limitedProblems,
      totalCount: uniqueProblems.length,
      sources
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Get company problems error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAvailableCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    // This is a curated list of companies known to have problem sets
    const companies = [
      // FAANG + Major Tech
      'Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Netflix', 'Adobe', 'Salesforce',

      // Ride Sharing & Travel
      'Uber', 'Lyft', 'Airbnb', 'DoorDash', 'Instacart', 'Expedia', 'Booking.com',

      // Social Media & Communication
      'Twitter', 'LinkedIn', 'Snap', 'Discord', 'Slack', 'Zoom', 'TikTok', 'ByteDance',

      // Fintech & Payments
      'Stripe', 'PayPal', 'Square', 'Coinbase', 'Robinhood', 'Affirm', 'SoFi', 'Brex',
      'Ramp', 'Plaid', 'Chime', 'Toast', 'Klarna', 'Revolut',

      // Enterprise Software
      'Oracle', 'IBM', 'SAP', 'ServiceNow', 'Workday', 'Atlassian', 'Salesforce',
      'Intuit', 'Okta', 'Datadog', 'Splunk', 'Snowflake', 'Databricks', 'Palantir',

      // Hardware & Semiconductors
      'Intel', 'Nvidia', 'AMD', 'Qualcomm', 'Broadcom', 'Texas Instruments', 'Micron',
      'Cisco', 'VMware', 'TSMC', 'ARM', 'Marvell',

      // Cloud & Storage
      'Dropbox', 'Box', 'Twilio', 'MongoDB', 'Redis', 'Elastic', 'Confluent',

      // Security
      'Palo Alto Networks', 'Fortinet', 'CrowdStrike', 'Zscaler', 'Okta', 'Auth0',

      // Financial Services
      'Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley', 'Bloomberg', 'Fidelity',
      'Capital One', 'American Express', 'Visa', 'Mastercard', 'BlackRock',

      // Trading & Hedge Funds
      'Two Sigma', 'Jane Street', 'Citadel', 'DE Shaw', 'Hudson River Trading',
      'Renaissance Technologies', 'Point72', 'Millennium', 'Jump Trading',

      // E-commerce & Retail
      'Shopify', 'eBay', 'Etsy', 'Wayfair', 'Chewy', 'Carvana', 'Zillow',

      // Automotive & Transportation
      'Tesla', 'Waymo', 'Cruise', 'Rivian', 'Lucid Motors', 'Ford', 'GM',

      // Aerospace & Defense
      'SpaceX', 'Blue Origin', 'Anduril', 'Lockheed Martin', 'Boeing', 'Raytheon',

      // Gaming & Entertainment
      'Roblox', 'Unity', 'Epic Games', 'Activision Blizzard', 'Electronic Arts',
      'Spotify', 'Twitch', 'YouTube',

      // AI & Machine Learning
      'OpenAI', 'Anthropic', 'Scale AI', 'Hugging Face', 'Cohere', 'Stability AI',

      // International Tech
      'Tencent', 'Alibaba', 'Baidu', 'Huawei', 'DiDi', 'Meituan', 'JD.com',
      'Xiaomi', 'Samsung', 'Sony', 'ASML', 'Shopee', 'Grab', 'Sea Limited',

      // Emerging Companies
      'Figma', 'Notion', 'Canva', 'Miro', 'Linear', 'Vercel', 'Supabase',
      'PlanetScale', 'Neon', 'Railway', 'Fly.io'
    ];

    res.json({
      success: true,
      data: companies.sort()
    });

  } catch (error) {
    console.error('Get available companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
