import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Database,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanyProblem {
  title: string;
  url: string;
  difficulty: string;
  source: string;
  tags: string[];
}

interface CompanyData {
  company: string;
  problems: CompanyProblem[];
  totalCount: number;
  sources: string[];
}

const CompanyQuestionsManager: React.FC = () => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Load available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const response = await fetch(`${apiUrl}/companies`);
        const result = await response.json();
        if (result.success) {
          setCompanies(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        toast.error('Failed to load companies');
      }
    };

    fetchCompanies();
  }, []);

  const fetchCompanyProblems = async (company: string, useCache: boolean = true) => {
    if (!company) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const cacheParam = useCache ? 'true' : 'false';
      const response = await fetch(`${apiUrl}/companies/${encodeURIComponent(company)}/problems?limit=500&useCache=${cacheParam}`);
      const result = await response.json();

      if (result.success) {
        setCompanyData(result.data);
        toast.success(`Loaded ${result.data.totalCount} problems for ${company}`);
      } else {
        toast.error(`Failed to load problems for ${company}`);
      }
    } catch (error) {
      console.error('Failed to fetch company problems:', error);
      toast.error('Failed to fetch company problems');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    fetchCompanyProblems(company);
  };

  const handleRefresh = () => {
    if (selectedCompany) {
      fetchCompanyProblems(selectedCompany, false); // Force fresh fetch
    }
  };

  const filteredProblems = companyData?.problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'all' || 
                             problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  }) || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const difficultyStats = companyData?.problems.reduce((acc, problem) => {
    const diff = problem.difficulty.toLowerCase();
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company Questions Manager</h2>
          <p className="text-muted-foreground">
            Explore and import LeetCode problems by company
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {companies.length} Companies Available
        </Badge>
      </div>

      <Tabs defaultValue="explore" className="space-y-4">
        <TabsList>
          <TabsTrigger value="explore">Explore Problems</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Company Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="company-select">Select Company</Label>
                  <Select onValueChange={handleCompanySelect} value={selectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a company..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleRefresh} 
                    disabled={!selectedCompany || loading}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {companyData && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Problems</Label>
                    <Input
                      id="search"
                      placeholder="Search by title or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select onValueChange={setDifficultyFilter} value={difficultyFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading problems for {selectedCompany}...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {companyData && !loading && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {companyData.company} Problems
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {filteredProblems.length} / {companyData.totalCount} problems
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {companyData.sources.join(', ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredProblems.map((problem, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <a 
                            href={problem.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {problem.title}
                          </a>
                          <Badge className={getDifficultyColor(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                        </div>
                        {problem.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {problem.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{problem.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {problem.source}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {companyData && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companyData.totalCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Easy</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{difficultyStats.easy || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Medium</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{difficultyStats.medium || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hard</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{difficultyStats.hard || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Data Sources Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Company problems are aggregated from multiple GitHub repositories and sources:
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">liquidslr</Badge>
                  <span className="text-sm">LeetCode Company-wise Problems 2022</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">hxu296</Badge>
                  <span className="text-sm">LeetCode Company-wise Problems 2022</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">MysteryVaibhav</Badge>
                  <span className="text-sm">LeetCode Company-wise Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">krishnadey30</Badge>
                  <span className="text-sm">LeetCode Questions CompanyWise</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">xizhengszhang</Badge>
                  <span className="text-sm">LeetCode Company Frequency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">wisdompeak</Badge>
                  <span className="text-sm">LeetCode Company Problems</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Data is cached for 1 hour to improve performance. Use the refresh button to get the latest data.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyQuestionsManager;
