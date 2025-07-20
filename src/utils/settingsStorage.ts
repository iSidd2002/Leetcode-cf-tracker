const REVIEW_INTERVALS_KEY = 'leetcode-cf-tracker-review-intervals';

export const saveReviewIntervals = (intervals: number[]) => {
  try {
    localStorage.setItem(REVIEW_INTERVALS_KEY, JSON.stringify(intervals));
  } catch (error) {
    console.error('Error saving review intervals:', error);
  }
};

export const getReviewIntervals = (): number[] => {
  try {
    const data = localStorage.getItem(REVIEW_INTERVALS_KEY);
    if (data) {
      const intervals = JSON.parse(data);
      if (Array.isArray(intervals) && intervals.every(i => typeof i === 'number')) {
        return intervals;
      }
    }
  } catch (error) {
    console.error('Error loading review intervals:', error);
  }
  // Return default intervals if nothing is stored or if there's an error
  return [2, 5, 7];
}; 