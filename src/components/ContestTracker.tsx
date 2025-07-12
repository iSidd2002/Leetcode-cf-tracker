import { useState } from 'react';
import type { Contest } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchContests } from '../utils/contestFetcher';
import ContestList from './ContestList';
import ContestForm from './ContestForm';

interface ContestTrackerProps {
  contests: Contest[];
  onAddContest: (contest: Omit<Contest, 'id'>) => void;
  onUpdateContest: (id: string, updates: Partial<Contest>) => void;
  onDeleteContest: (id: string) => void;
}

export default function ContestTracker({ contests, onAddContest, onUpdateContest, onDeleteContest }: ContestTrackerProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contestToEdit, setContestToEdit] = useState<Contest | null>(null);

  const handleFetchContests = async () => {
    setIsFetching(true);
    try {
      const fetchedContests = await fetchContests();
      const newContests = fetchedContests.filter(
        (fc) => !contests.some((c) => c.name === fc.name && c.platform === fc.platform)
      );
      newContests.forEach(c => onAddContest(c as Omit<Contest, 'id'>));
    } catch (error) {
        console.error("Failed to fetch contests", error);
    } finally {
        setIsFetching(false);
    }
  };

  const handleOpenForm = (contest: Contest | null = null) => {
    setContestToEdit(contest);
    setIsFormOpen(true);
  };
  
  const handleEditContest = (id: string, updates: Partial<Contest>) => {
    onUpdateContest(id, updates);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Contest Tracker</CardTitle>
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            {contests.length} contests tracked
          </p>
          <div className="flex space-x-2">
            <Button onClick={handleFetchContests} disabled={isFetching}>
              {isFetching ? 'Fetching...' : 'Fetch Upcoming Contests'}
            </Button>
            <Button onClick={() => handleOpenForm()}>Add Contest</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ContestList
          contests={contests}
          onDeleteContest={onDeleteContest}
          onEditContest={handleOpenForm}
        />
        <ContestForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onAddContest={onAddContest}
          onUpdateContest={handleEditContest}
          contestToEdit={contestToEdit}
        />
      </CardContent>
    </Card>
  );
} 