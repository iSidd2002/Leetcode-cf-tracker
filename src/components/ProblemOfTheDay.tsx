import { useEffect, useState } from "react";
import type {
  ActiveDailyCodingChallengeQuestion,
  LeetCodeDailyProblemResponse,
} from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ExternalLink } from "lucide-react";

// Use environment variable or fallback to localhost backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const LEETCODE_API_ENDPOINT = `${API_BASE_URL}/potd`;
const DAILY_PROBLEM_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      userStatus
      link
      question {
        acRate
        difficulty
        freqBar
        frontendQuestionId: questionFrontendId
        isFavor
        paidOnly: isPaidOnly
        status
        title
        titleSlug
        hasVideoSolution
        hasSolution
        topicTags {
          name
          id
          slug
        }
      }
    }
  }
`;

interface ProblemOfTheDayProps {
  onAddPotd: (potd: ActiveDailyCodingChallengeQuestion) => void;
}

const ProblemOfTheDay = ({ onAddPotd }: ProblemOfTheDayProps) => {
  const [problem, setProblem] =
    useState<ActiveDailyCodingChallengeQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyProblem = async () => {
      try {
        const response = await fetch(LEETCODE_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: DAILY_PROBLEM_QUERY }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch daily problem: ${response.status}`);
        }

        const result: LeetCodeDailyProblemResponse = await response.json();
        if (result.data.activeDailyCodingChallengeQuestion) {
          setProblem(result.data.activeDailyCodingChallengeQuestion);
        } else {
          throw new Error("No daily problem found");
        }
      } catch (err) {
        console.error('Failed to fetch Problem of the Day:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDailyProblem();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Problem of the Day...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Error fallback UI
  if (error && !problem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LeetCode's Problem of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-muted-foreground mb-4">
                Unable to load today's problem. Please try again later.
              </p>
              <p className="text-sm text-red-600 mb-4">
                Error: {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild>
                  <a
                    href="https://leetcode.com/problemset/all/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Today's Problem
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://leetcode.com/problemset/all/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Browse All Problems
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!problem) {
    return null;
  }

  const {
    question: { title, difficulty, topicTags },
    link,
  } = problem;

  const getDifficultyClass = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return "bg-green-500 hover:bg-green-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "hard":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const handleAddToList = () => {
    if (problem) {
      onAddPotd(problem);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LeetCode's Problem of the Day</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <a
              href={`https://leetcode.com${link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold hover:underline"
            >
              {title}
            </a>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getDifficultyClass(difficulty)}>
                {difficulty}
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {topicTags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={handleAddToList}>Quick Add to POTD List</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemOfTheDay; 