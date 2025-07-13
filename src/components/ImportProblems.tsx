import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { companies } from '@/lib/companies';
import type { Problem } from '@/types';
import { toast } from 'sonner';

interface ImportProblemsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (problems: Partial<Problem>[]) => void;
}

// A robust CSV parser that correctly handles quoted fields containing commas.
const parseCSV = (csv: string): Record<string, string>[] => {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data = [];

  // Find the indices of the headers we care about
  const titleIndex = headers.indexOf('title');
  const linkIndex = headers.indexOf('link');
  const difficultyIndex = headers.indexOf('difficulty');

  if (titleIndex === -1 || linkIndex === -1 || difficultyIndex === -1) {
    toast.error("CSV file is missing required columns: title, link, difficulty.");
    return [];
  }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (values.length >= headers.length) {
      const title = values[titleIndex]?.trim().replace(/"/g, '');
      const url = values[linkIndex]?.trim().replace(/"/g, '');
      const difficulty = values[difficultyIndex]?.trim().replace(/"/g, '');
      
      if (title && url && difficulty) {
        data.push({ title, url, difficulty });
      }
    }
  }
  return data;
};

const ImportProblems = ({ open, onOpenChange, onImport }: ImportProblemsProps) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company.");
      return;
    }

    setIsImporting(true);
    const companyName = selectedCompany.replace(/ /g, '%20');
    
    // A more comprehensive list of filenames to try, covering all known formats.
    const fileNamesToTry = [
      "5. All.csv",
      "all-time.csv",
      "4. More Than Six Months.csv",
      "1-2 years.csv",
      "3. Six Months.csv",
      "6-12 months.csv",
      "2. Three Months.csv",
      "0-6 months.csv",
      "1. Thirty Days.csv",
    ];
    
    let allProblems: Partial<Problem>[] = [];
    let problemsFound = false;

    for (const fileName of fileNamesToTry) {
      const encodedFileName = fileName.replace(/ /g, '%20');
      const url = `https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/${companyName}/${encodedFileName}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const csvText = await response.text();
          const parsedData = parseCSV(csvText);
          
          if (parsedData.length > 0) {
            problemsFound = true;
            const importedProblems: Partial<Problem>[] = parsedData.map(row => ({
              title: row.title,
              url: row.url,
              difficulty: row.difficulty,
              companies: [selectedCompany],
            }));
            allProblems.push(...importedProblems);
          }
        } else if (response.status !== 404) {
          throw new Error(`Failed to fetch problems. Status: ${response.status}`);
        }
      } catch (error: any) {
        toast.error(error.message || 'An unknown error occurred during import.');
        setIsImporting(false);
        return;
      }
    }
    
    if (problemsFound) {
      onImport(allProblems);
      onOpenChange(false);
    } else {
      toast.error(`Could not find any problem list for ${selectedCompany}.`);
    }

    setIsImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Company Problems</DialogTitle>
          <DialogDescription>
            Import LeetCode problems tagged by a specific company. This will import the "all-time" list for the selected company.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
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
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedCompany || isImporting}>
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProblems; 