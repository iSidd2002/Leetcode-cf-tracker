import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Sheet, SheetProblem } from '@/lib/sheets-data';
import { allSheets as defaultSheets } from '@/lib/sheets-data';

export default function SheetView() {
  const [sheetsData, setSheetsData] = useState<Sheet[]>([]);

  useEffect(() => {
    const savedSheetsData = localStorage.getItem('sheetsData');
    if (savedSheetsData) {
      setSheetsData(JSON.parse(savedSheetsData));
    } else {
      setSheetsData(defaultSheets);
    }
  }, []);

  useEffect(() => {
    if (sheetsData.length > 0) {
        localStorage.setItem('sheetsData', JSON.stringify(sheetsData));
    }
  }, [sheetsData]);

  const handleProblemToggle = (sheetName: string, categoryName: string, problemName: string) => {
    const newSheetsData = sheetsData.map(sheet => {
      if (sheet.name === sheetName) {
        return {
          ...sheet,
          categories: sheet.categories.map(category => {
            if (category.name === categoryName) {
              return {
                ...category,
                problems: category.problems.map(problem => {
                  if (problem.name === problemName) {
                    return { ...problem, isCompleted: !problem.isCompleted };
                  }
                  return problem;
                }),
              };
            }
            return category;
          }),
        };
      }
      return sheet;
    });
    setSheetsData(newSheetsData);
  };

  const getDifficultyBadgeVariant = (difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard') => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'destructive';
      case 'Very Hard': return 'veryHard';
      default: return 'default';
    }
  };
  
  const calculateProgress = (problems: SheetProblem[]) => {
      if (problems.length === 0) return 0;
      const completed = problems.filter(p => p.isCompleted).length;
      return (completed / problems.length) * 100;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">DSA Sheets</h1>
      <Tabs defaultValue={defaultSheets[0].name}>
        <TabsList className="grid w-full grid-cols-3">
            {sheetsData.map(sheet => (
                <TabsTrigger key={sheet.name} value={sheet.name}>{sheet.name}</TabsTrigger>
            ))}
        </TabsList>
        {sheetsData.map(sheet => (
          <TabsContent key={sheet.name} value={sheet.name}>
            <div className="space-y-4">
              {sheet.categories.map(category => {
                const progress = calculateProgress(category.problems);
                return (
                  <Card key={category.name}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                            {category.problems.filter(p=>p.isCompleted).length} / {category.problems.length}
                        </span>
                      </CardTitle>
                      <Progress value={progress} className="w-full" />
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Problem</TableHead>
                            <TableHead className="text-right">Difficulty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.problems.map(problem => (
                            <TableRow key={problem.name}>
                              <TableCell>
                                <Checkbox
                                  checked={problem.isCompleted}
                                  onCheckedChange={() => handleProblemToggle(sheet.name, category.name, problem.name)}
                                />
                              </TableCell>
                              <TableCell>
                                <a href={problem.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {problem.name}
                                </a>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={getDifficultyBadgeVariant(problem.difficulty)}>
                                  {problem.difficulty}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 