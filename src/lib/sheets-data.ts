export interface SheetProblem {
  name: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  isCompleted: boolean;
}

export interface SheetCategory {
  name: string;
  problems: SheetProblem[];
}

export interface Sheet {
  name: string;
  categories: SheetCategory[];
}

export const algoExpertSheet: Sheet = {
  name: 'AlgoExpert',
  categories: [
    {
      name: 'Arrays',
      problems: [
        { name: 'Two Number Sum', url: 'https://algo.theffox.workers.dev/question/two-number-sum', difficulty: 'Easy', isCompleted: false },
        { name: 'Three Number Sum', url: 'https://algo.theffox.workers.dev/question/three-number-sum', difficulty: 'Medium', isCompleted: false },
        { name: 'Four Number Sum', url: 'https://algo.theffox.workers.dev/question/four-number-sum', difficulty: 'Hard', isCompleted: false },
        { name: 'Smallest Difference', url: 'https://algo.theffox.workers.dev/question/smallest-difference', difficulty: 'Medium', isCompleted: false },
        { name: 'Subarray Sort', url: 'https://algo.theffox.workers.dev/question/subarray-sort', difficulty: 'Hard', isCompleted: false },
        { name: 'Largest Range', url: 'https://algo.theffox.workers.dev/question/largest-range', difficulty: 'Hard', isCompleted: false },
        { name: 'Min Rewards', url: 'https://algo.theffox.workers.dev/question/min-rewards', difficulty: 'Hard', isCompleted: false },
        { name: 'Zigzag Traverse', url: 'https://algo.theffox.workers.dev/question/zigzag-traverse', difficulty: 'Hard', isCompleted: false },
        { name: 'Apartment Hunting', url: 'https://algo.theffox.workers.dev/question/apartment-hunting', difficulty: 'Very Hard', isCompleted: false },
        { name: 'Calendar Matching', url: 'https://algo.theffox.workers.dev/question/calendar-matching', difficulty: 'Very Hard', isCompleted: false },
        { name: 'Move Element To End', url: 'https://algo.theffox.workers.dev/question/move-element-to-end', difficulty: 'Medium', isCompleted: false },
        { name: 'Monotonic Array', url: 'https://algo.theffox.workers.dev/question/monotonic-array', difficulty: 'Medium', isCompleted: false },
        { name: 'Spiral Traverse', url: 'https://algo.theffox.workers.dev/question/spiral-traverse', difficulty: 'Medium', isCompleted: false },
        { name: 'Longest Peak', url: 'https://algo.theffox.workers.dev/question/longest-peak', difficulty: 'Medium', isCompleted: false },
        { name: 'Validate Subsequence', url: 'https://algo.theffox.workers.dev/question/validate-subsequence', difficulty: 'Easy', isCompleted: false },
        { name: 'Array Of Products', url: 'https://algo.theffox.workers.dev/question/array-of-products', difficulty: 'Medium', isCompleted: false },
        { name: 'Waterfall Streams', url: 'https://algo.theffox.workers.dev/question/waterfall-streams', difficulty: 'Very Hard', isCompleted: false },
        { name: 'First Duplicate Value', url: 'https://algo.theffox.workers.dev/question/first-duplicate-value', difficulty: 'Medium', isCompleted: false },
        { name: 'Sorted Squared Array', url: 'https://algo.theffox.workers.dev/question/sorted-squared-array', difficulty: 'Easy', isCompleted: false },
        { name: 'Minimum Area Rectangle', url: 'https://algo.theffox.workers.dev/question/minimum-area-rectangle', difficulty: 'Very Hard', isCompleted: false },
        { name: 'Merge Overlapping Intervals', url: 'https://algo.theffox.workers.dev/question/merge-overlapping-intervals', difficulty: 'Medium', isCompleted: false },
        { name: 'Tournament Winner', url: 'https://algo.theffox.workers.dev/question/tournament-winner', difficulty: 'Easy', isCompleted: false },
        { name: 'Non-Constructible Change', url: 'https://algo.theffox.workers.dev/question/non-constructible-change', difficulty: 'Easy', isCompleted: false },
        { name: 'Best Seat', url: 'https://algo.theffox.workers.dev/question/best-seat', difficulty: 'Medium', isCompleted: false },
        { name: 'Longest Subarray With Sum', url: 'https://algo.theffox.workers.dev/question/longest-subarray-with-sum', difficulty: 'Hard', isCompleted: false },
        { name: 'Line Through Points', url: 'https://algo.theffox.workers.dev/question/line-through-points', difficulty: 'Very Hard', isCompleted: false },
        { name: 'Zero Sum Subarray', url: 'https://algo.theffox.workers.dev/question/zero-sum-subarray', difficulty: 'Medium', isCompleted: false },
        { name: 'Knight Connection', url: 'https://algo.theffox.workers.dev/question/knight-connection', difficulty: 'Hard', isCompleted: false },
        { name: 'Count Squares', url: 'https://algo.theffox.workers.dev/question/count-squares', difficulty: 'Hard', isCompleted: false },
        { name: 'Missing Numbers', url: 'https://algo.theffox.workers.dev/question/missingNumbers', difficulty: 'Medium', isCompleted: false },
        { name: 'Majority Element', url: 'https://algo.theffox.workers.dev/question/majority-element', difficulty: 'Medium', isCompleted: false },
        { name: 'Transpose Matrix', url: 'https://algo.theffox.workers.dev/question/transpose-matrix', difficulty: 'Easy', isCompleted: false },
        { name: 'Sweet And Savory', url: 'https://algo.theffox.workers.dev/question/sweet-and-savory', difficulty: 'Medium', isCompleted: false },
      ],
    },
    // ... other categories to be added here
  ],
};

export const striverSheet: Sheet = {
  name: 'Striver A-Z',
  categories: [],
};

export const neetcodeSheet: Sheet = {
  name: 'NeetCode 150',
  categories: [
    {
      name: 'Arrays & Hashing',
      problems: [
        { name: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/', difficulty: 'Easy', isCompleted: false },
        { name: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'Easy', isCompleted: false },
        { name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', isCompleted: false },
        { name: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/', difficulty: 'Medium', isCompleted: false },
        { name: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'Medium', isCompleted: false },
        { name: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self/', difficulty: 'Medium', isCompleted: false },
        { name: 'Valid Sudoku', url: 'https://leetcode.com/problems/valid-sudoku/', difficulty: 'Medium', isCompleted: false },
        { name: 'Encode and Decode Strings', url: 'https://leetcode.com/problems/encode-and-decode-strings/', difficulty: 'Medium', isCompleted: false },
        { name: 'Longest Consecutive Sequence', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', difficulty: 'Medium', isCompleted: false },
      ],
    },
  ],
};

export const allSheets: Sheet[] = [
  algoExpertSheet,
  striverSheet,
  neetcodeSheet,
]; 