import { useState, useEffect } from 'react';
import type { Problem } from './types';
import StorageService from './utils/storage';
import Dashboard from './components/Dashboard';
import ProblemForm from './components/ProblemForm';
import ProblemList from './components/ProblemList';
import Analytics from './components/Analytics';
import { Home, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, Archive as LearnedIcon, CalendarCheck, History, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme, ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getReviewIntervals, saveReviewIntervals } from './utils/settingsStorage';
import { Settings } from './components/Settings';
import type { ActiveDailyCodingChallengeQuestion } from './types';
import { toast } from 'sonner';
import type { Contest } from './types';
import ContestTracker from './components/ContestTracker';
import { Badge } from '@/components/ui/badge';


function App() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [potdProblems, setPotdProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [reviewIntervals, setReviewIntervals] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);
  const [activePlatform, setActivePlatform] = useState('leetcode');


  useEffect(() => {
    setProblems(StorageService.getProblems());
    setPotdProblems(StorageService.getPotdProblems());
    setContests(StorageService.getContests());
    setReviewIntervals(getReviewIntervals());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      StorageService.saveProblems(problems);
      StorageService.savePotdProblems(potdProblems);
      StorageService.saveContests(contests);
    }
  }, [problems, potdProblems, contests, isLoaded]);

  // Add useEffect for notifications
  useEffect(() => {
    const enableNotifications = localStorage.getItem('enableNotifications') === 'true';
    if (enableNotifications && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    if (enableNotifications) {
      const checkReminders = () => {
        // Check due reviews
        const dueReviews = [...problems, ...potdProblems].filter(p => p.nextReviewDate && new Date(p.nextReviewDate) <= new Date());
        if (dueReviews.length > 0) {
          new Notification(`You have ${dueReviews.length} problems due for review!`);
        }

        // Check upcoming contests (within 1 hour)
        const upcoming = contests.filter(c => {
          const start = new Date(c.startTime);
          const now = new Date();
          return c.status === 'scheduled' && start > now && (start.getTime() - now.getTime()) <= 3600000;
        });
        if (upcoming.length > 0) {
          new Notification(`Upcoming contest: ${upcoming[0].name} starts soon!`);
        }
      };

      checkReminders(); // Initial check
      const interval = setInterval(checkReminders, 3600000); // Every hour
      return () => clearInterval(interval);
    }
  }, [problems, potdProblems, contests]);

  const handleSettingsSave = (newIntervals: number[]) => {
    setReviewIntervals(newIntervals);
  };

  const handleAddContest = (contest: Omit<Contest, 'id'>) => {
    const newContest = { ...contest, id: crypto.randomUUID() };
    setContests(prev => [...prev, newContest]);
  };

  const handleUpdateContest = (id: string, updates: Partial<Contest>) => {
    setContests(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteContest = (id: string) => {
    setContests(prev => prev.filter(c => c.id !== id));
  };

  const handleOpenForm = (problem: Problem | null = null) => {
    setProblemToEdit(problem);
    setIsFormOpen(true);
  };

  const handleAddPotdProblem = (potd: ActiveDailyCodingChallengeQuestion) => {
    const isDuplicate = potdProblems.some(p => p.problemId === potd.question.titleSlug);
    if (isDuplicate) {
      toast.info('Problem of the day already exists in your POTD list.');
      return;
    }

    const newProblem: Problem = {
      id: crypto.randomUUID(),
      platform: 'leetcode',
      title: potd.question.title,
      problemId: potd.question.titleSlug,
      difficulty: potd.question.difficulty,
      url: `https://leetcode.com${potd.link}`,
      dateSolved: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: '',
      isReview: false,
      repetition: 0,
      interval: 0,
      nextReviewDate: null,
      topics: potd.question.topicTags.map(t => t.name),
      status: 'active',
    };
    setPotdProblems(prev => [...prev, newProblem]);
    toast.success('Problem of the day added to your POTD list!');
  };

  const handleAddProblem = (problem: Omit<Problem, "id" | "createdAt">) => {
    const newProblem: Problem = {
      ...problem,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setProblems([...problems, newProblem])
  };

  const handleUpdateProblem = (id: string, updates: Partial<Problem>) => {
    setProblems(
      problems.map((p) => {
        if (p.id === id) {
          const updatedProblem = { ...p, ...updates };
          if (updates.isReview !== undefined) {
            if (updates.isReview) {
              const nextReviewDate = new Date();
              nextReviewDate.setDate(nextReviewDate.getDate() + 2);
              updatedProblem.nextReviewDate = nextReviewDate.toISOString();
              updatedProblem.repetition = 0;
              updatedProblem.interval = 2;
            } else {
              updatedProblem.nextReviewDate = null;
              updatedProblem.repetition = 0;
              updatedProblem.interval = 0;
            }
          }
          return updatedProblem;
        }
        return p;
      })
    );
  };

  const handleUpdatePotdProblem = (id: string, updates: Partial<Problem>) => {
    setPotdProblems(
      potdProblems.map((p) => {
        if (p.id === id) {
          const updatedProblem = { ...p, ...updates };
          if (updates.isReview !== undefined) {
            if (updates.isReview) {
              const nextReviewDate = new Date();
              nextReviewDate.setDate(nextReviewDate.getDate() + 2);
              updatedProblem.nextReviewDate = nextReviewDate.toISOString();
              updatedProblem.repetition = 0;
              updatedProblem.interval = 2;
            } else {
              updatedProblem.nextReviewDate = null;
              updatedProblem.repetition = 0;
              updatedProblem.interval = 0;
            }
          }
          return updatedProblem;
        }
        return p;
      })
    );
  };

  const handleProblemReviewed = (id: string, currentInterval: number) => {
    const reviewIntervals = [2, 4, 7];
    const nextIntervalIndex = reviewIntervals.indexOf(currentInterval) + 1;

    if (nextIntervalIndex < reviewIntervals.length) {
      const nextInterval = reviewIntervals[nextIntervalIndex];
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
      handleUpdateProblem(id, {
        nextReviewDate: nextReviewDate.toISOString(),
        interval: nextInterval,
        repetition: nextIntervalIndex
      });
      toast.success(`Problem rescheduled for review in ${nextInterval} day(s).`);
    } else {
      handleUpdateProblem(id, {
        status: 'learned',
        isReview: false,
        nextReviewDate: null,
        repetition: 0,
        interval: 0
      });
      toast.success('Problem marked as learned!');
    }
  };

  const handlePotdProblemReviewed = (id: string, currentInterval: number) => {
    const reviewIntervals = [2, 4, 7];
    const nextIntervalIndex = reviewIntervals.indexOf(currentInterval) + 1;

    if (nextIntervalIndex < reviewIntervals.length) {
      const nextInterval = reviewIntervals[nextIntervalIndex];
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
      handleUpdatePotdProblem(id, {
        nextReviewDate: nextReviewDate.toISOString(),
        interval: nextInterval,
        repetition: nextIntervalIndex
      });
      toast.success(`POTD Problem rescheduled for review in ${nextInterval} day(s).`);
    } else {
      handleUpdatePotdProblem(id, {
        status: 'learned',
        isReview: false,
        nextReviewDate: null,
        repetition: 0,
        interval: 0
      });
      toast.success('POTD Problem marked as learned!');
    }
  };

  const handleDeleteProblem = (id: string) => {
    setProblems(problems.filter((p) => p.id !== id))
  };

  const handleDeletePotdProblem = (id: string) => {
    setPotdProblems(potdProblems.filter((p) => p.id !== id));
  };

  const activeProblems = problems.filter(p => p.status === 'active');
  const reviewProblems = activeProblems.filter(p => p.isReview && p.nextReviewDate);
  const learnedProblems = problems.filter(p => p.status === 'learned');

  const activePotdProblems = potdProblems.filter(p => p.status === 'active');
  const reviewPotdProblems = activePotdProblems.filter(p => p.isReview && p.nextReviewDate);

  const dueReviewCount = [...reviewProblems, ...reviewPotdProblems].filter(
    p => p.nextReviewDate && new Date(p.nextReviewDate) <= new Date()
  ).length;
  
  const renderProblemList = (problemsToRender: Problem[], isPotdList: boolean = false, isReviewList: boolean = false) => (
    <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full mt-4">
      <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-md h-10">
        <TabsTrigger value="leetcode" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">LeetCode</TabsTrigger>
        <TabsTrigger value="codeforces" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">Codeforces</TabsTrigger>
        <TabsTrigger value="atcoder" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">AtCoder</TabsTrigger>
      </TabsList>
      <TabsContent value="leetcode">
        <ProblemList
          problems={problemsToRender.filter(p => p.platform === 'leetcode')}
          onUpdateProblem={isPotdList ? handleUpdatePotdProblem : handleUpdateProblem}
          onDeleteProblem={isPotdList ? handleDeletePotdProblem : handleDeleteProblem}
          onProblemReviewed={isPotdList ? handlePotdProblemReviewed : handleProblemReviewed}
          onEditProblem={handleOpenForm}
          isReviewList={isReviewList}
        />
      </TabsContent>
      <TabsContent value="codeforces">
        <ProblemList
          problems={problemsToRender.filter(p => p.platform === 'codeforces')}
          onUpdateProblem={isPotdList ? handleUpdatePotdProblem : handleUpdateProblem}
          onDeleteProblem={isPotdList ? handleDeletePotdProblem : handleDeleteProblem}
          onProblemReviewed={isPotdList ? handlePotdProblemReviewed : handleProblemReviewed}
          onEditProblem={handleOpenForm}
          isReviewList={isReviewList}
        />
      </TabsContent>
      <TabsContent value="atcoder">
        <ProblemList
          problems={problemsToRender.filter(p => p.platform === 'atcoder')}
          onUpdateProblem={isPotdList ? handleUpdatePotdProblem : handleUpdateProblem}
          onDeleteProblem={isPotdList ? handleDeletePotdProblem : handleDeleteProblem}
          onProblemReviewed={isPotdList ? handlePotdProblemReviewed : handleProblemReviewed}
          onEditProblem={handleOpenForm}
          isReviewList={isReviewList}
        />
      </TabsContent>
    </Tabs>
  );


  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <header className="border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">LC</span>
                </div>
                <h1 className="text-xl font-semibold">
                  Problem Tracker
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                 <Settings onSettingsSave={handleSettingsSave}>
                    <Button variant="ghost" size="icon">
                        <SettingsIcon className="h-6 w-6" />
                    </Button>
                </Settings>
                <span className="text-sm text-muted-foreground">
                  {problems.length} problem{problems.length !== 1 ? 's' : ''} tracked
                </span>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <ProblemForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onAddProblem={handleAddProblem}
          onUpdateProblem={handleUpdateProblem}
          problemToEdit={problemToEdit}
        />

        <main className="container py-8">
          <Tabs defaultValue="dashboard" className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between pb-4">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                LEETCODE + CF TRACKER
              </h1>
              <TabsList>
                <TabsTrigger value="dashboard">
                  <Home className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="potd-history">
                  <History className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">POTD History</span>
                </TabsTrigger>
                <TabsTrigger value="contests">
                  <Trophy className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Contests</span>
                </TabsTrigger>
                <TabsTrigger value="problems">
                  <List className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Problems</span>
                </TabsTrigger>
                <TabsTrigger value="review">
                  <Star className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Review</span>
                  {dueReviewCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {dueReviewCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="learned">
                  <LearnedIcon className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Learned</span>
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard">
              <Dashboard
                problems={activeProblems}
                onUpdateProblem={handleUpdateProblem}
                onAddPotd={handleAddPotdProblem}
              />
            </TabsContent>
            <TabsContent value="potd-history">
              {renderProblemList(potdProblems, true)}
            </TabsContent>
            <TabsContent value="contests">
              <ContestTracker
                contests={contests}
                onAddContest={handleAddContest}
                onUpdateContest={handleUpdateContest}
                onDeleteContest={handleDeleteContest}
              />
            </TabsContent>
            <TabsContent value="problems">
              <div className="flex justify-end pb-4">
                <Button onClick={() => handleOpenForm()}>
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    <span>Add Problem</span>
                  </div>
                </Button>
              </div>
              {renderProblemList(activeProblems)}
            </TabsContent>
            <TabsContent value="review">
              {renderProblemList([...reviewProblems, ...reviewPotdProblems], false, true)}
            </TabsContent>
            <TabsContent value="learned">
                {renderProblemList(learnedProblems)}
            </TabsContent>
            <TabsContent value="analytics">
              <Analytics problems={problems} />
            </TabsContent>
          </Tabs>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
