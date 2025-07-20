import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Code, Target, GraduationCap } from 'lucide-react';

interface SheetLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  problemCount?: string;
  tags: string[];
}

const Sheets: React.FC = () => {
  const sheets: SheetLink[] = [
    {
      id: 'striver-a2z',
      title: 'Striver A2Z DSA Sheet',
      description: 'Complete A to Z Data Structures and Algorithms sheet by Striver. Covers all important topics from basics to advanced.',
      url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
      icon: <Target className="h-6 w-6" />,
      difficulty: 'Intermediate',
      problemCount: '450+ Problems',
      tags: ['Complete Course', 'Structured Learning', 'Video Solutions']
    },
    {
      id: 'neetcode-150',
      title: 'NeetCode 150',
      description: 'Curated list of 150 LeetCode problems covering all important patterns for coding interviews.',
      url: 'https://neetcode.io/practice',
      icon: <Code className="h-6 w-6" />,
      difficulty: 'Intermediate',
      problemCount: '150 Problems',
      tags: ['Interview Prep', 'Pattern Based', 'Video Explanations']
    },
    {
      id: 'algoexpert',
      title: 'AlgoExpert Problems',
      description: 'Comprehensive collection of algorithm and data structure problems with detailed explanations.',
      url: 'https://algo.theffox.workers.dev/',
      icon: <GraduationCap className="h-6 w-6" />,
      difficulty: 'Advanced',
      problemCount: '160+ Problems',
      tags: ['Premium Quality', 'Detailed Solutions', 'System Design']
    },
    {
      id: 'learnyard',
      title: 'Learnyard DSA Practice',
      description: 'Structured DSA practice platform with topic-wise problems and progress tracking.',
      url: 'https://learnyard.com/practice/dsa/',
      icon: <BookOpen className="h-6 w-6" />,
      difficulty: 'Beginner',
      problemCount: '300+ Problems',
      tags: ['Topic Wise', 'Progress Tracking', 'Beginner Friendly']
    },
    {
      id: 'cses',
      title: 'CSES Problem Set',
      description: 'Comprehensive competitive programming problem set covering all important algorithms and data structures.',
      url: 'https://cses.fi/problemset/',
      icon: <Target className="h-6 w-6" />,
      difficulty: 'Intermediate',
      problemCount: '300+ Problems',
      tags: ['Competitive Programming', 'Algorithm Practice', 'Educational']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenSheet = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DSA & CP Practice Sheets</h1>
          <p className="text-muted-foreground mt-2">
            Curated collection of the best Data Structures, Algorithms & Competitive Programming resources
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sheets.map((sheet) => (
          <Card key={sheet.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {sheet.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{sheet.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDifficultyColor(sheet.difficulty)}>
                        {sheet.difficulty}
                      </Badge>
                      {sheet.problemCount && (
                        <Badge variant="outline" className="text-xs">
                          {sheet.problemCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {sheet.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {sheet.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={() => handleOpenSheet(sheet.url)}
                className="w-full flex items-center gap-2"
                variant="default"
              >
                <ExternalLink className="h-4 w-4" />
                Open {sheet.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            How to Use These Sheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-2">For Beginners</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with Learnyard for topic-wise learning</li>
                <li>• Move to Striver A2Z for comprehensive coverage</li>
                <li>• Practice consistently and track your progress</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Interview Prep</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Focus on NeetCode 150 for pattern recognition</li>
                <li>• Use AlgoExpert for advanced problem solving</li>
                <li>• Add solved problems to your tracker for review</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Competitive Programming</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with CSES for comprehensive CP training</li>
                <li>• Practice contest problems regularly</li>
                <li>• Track your contest performance and ratings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sheets;
