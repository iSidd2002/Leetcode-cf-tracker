import { useState, useMemo } from 'react';
import type { Problem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, ArrowLeft } from 'lucide-react';
import ProblemList from './ProblemList';

interface CompanyViewProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem: (id: string) => void;
  onEditProblem: (problem: Problem) => void;
  onProblemReviewed: (id: string, currentInterval: number) => void;
}

const CompanyView = ({ problems, onUpdateProblem, onDeleteProblem, onEditProblem, onProblemReviewed }: CompanyViewProps) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const companiesWithProblems = useMemo(() => {
    const companyMap = new Map<string, number>();
    problems.forEach(problem => {
      problem.companies?.forEach(company => {
        companyMap.set(company, (companyMap.get(company) || 0) + 1);
      });
    });
    return Array.from(companyMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [problems]);

  if (selectedCompany) {
    const companyProblems = problems.filter(p => p.companies?.includes(selectedCompany));
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedCompany(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Companies
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedCompany}
        </h1>
        <ProblemList 
          problems={companyProblems}
          onUpdateProblem={onUpdateProblem}
          onDeleteProblem={onDeleteProblem}
          onEditProblem={onEditProblem}
          onProblemReviewed={onProblemReviewed}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Companies</h1>
      {companiesWithProblems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {companiesWithProblems.map(({ name, count }) => (
            <Card key={name} className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1" onClick={() => setSelectedCompany(name)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">{name}</CardTitle>
                <Folder className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {count === 1 ? 'problem' : 'problems'} tagged
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No company problems imported yet.</p>
          <p className="text-sm text-muted-foreground">Use the Import feature on the Dashboard to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyView; 