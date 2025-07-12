import { type ReactNode, useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Problem } from '../types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { leetcodeTopics, codeforcesTopics } from '@/lib/topics';
import { MultiSelect, type Option } from '@/components/ui/multi-select';
import { MarkdownEditor } from './ui/MarkdownEditor';

interface ProblemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProblem: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
  problemToEdit: Problem | null;
}

type FormData = Omit<Problem, 'id' | 'createdAt' | 'problemId'>;

const INITIAL_FORM_STATE: FormData = {
  platform: 'leetcode',
  title: '',
  difficulty: '',
  url: '',
  dateSolved: new Date().toISOString().split('T')[0],
  notes: '',
  isReview: false,
  topics: [],
  status: 'active',
  repetition: 0,
  interval: 0,
  nextReviewDate: null,
};


const ProblemForm = ({ open, onOpenChange, onAddProblem, onUpdateProblem, problemToEdit }: ProblemFormProps) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);

  useEffect(() => {
    if (problemToEdit) {
      setFormData({
        ...problemToEdit,
        dateSolved: problemToEdit.dateSolved.split('T')[0],
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [problemToEdit, open]);

  const topicOptions = useMemo<Option[]>(() => {
    const topics = formData.platform === 'leetcode' ? leetcodeTopics : codeforcesTopics;
    return topics.map(topic => ({ label: topic, value: topic }));
  }, [formData.platform]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    if (name === 'platform') {
        setFormData(prev => ({ ...prev, platform: value as 'leetcode' | 'codeforces' | 'atcoder', difficulty: '', topics: [] }));
    } else if (name === 'topics') {
        setFormData(prev => ({ ...prev, topics: value as string[] }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value as string }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.difficulty.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    const problemData = {
      ...formData,
      problemId: formData.title.trim().toLowerCase().replace(/\s+/g, '-'),
    };

    if (problemToEdit) {
      onUpdateProblem(problemToEdit.id, problemData);
      toast.success('Problem updated successfully!');
    } else {
      onAddProblem(problemData);
      toast.success('Problem added successfully!');
    }
    
    onOpenChange(false);
  };

  const isEditing = !!problemToEdit && !!problemToEdit.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Problem' : 'Add New Problem'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your solved problem.' : 'Track a new problem you\'ve solved.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Form fields remain the same */}
          <div className="space-y-2">
            <Label>Platform *</Label>
            <RadioGroup
              value={formData.platform}
              name="platform"
              onValueChange={(value: string) => handleSelectChange('platform', value)}
              className="grid grid-cols-2 gap-3"
            >
              <Label className="flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="leetcode" className="sr-only" />
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center text-xs font-bold">LC</div>
                  <span className="font-medium">LeetCode</span>
                </div>
              </Label>
              <Label className="flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="codeforces" className="sr-only" />
                <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs font-bold">CF</div>
                  <span className="font-medium">Codeforces</span>
                </div>
              </Label>
              <Label className="flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="atcoder" className="sr-only" />
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center text-xs font-bold">AC</div>
                  <span className="font-medium">AtCoder</span>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Problem Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Two Sum"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">{formData.platform === 'leetcode' ? 'Difficulty' : 'Rating'} *</Label>
            {formData.platform === 'leetcode' ? (
              <Select name="difficulty" onValueChange={(value: string) => handleSelectChange('difficulty', value)} value={formData.difficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                placeholder="800"
                min={800}
                max={3500}
                step={100}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://leetcode.com/problems/two-sum/"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateSolved">Date Solved *</Label>
            <Input
                type="date"
                id="dateSolved"
                name="dateSolved"
                value={formData.dateSolved}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <MarkdownEditor
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topics">Topics</Label>
            <MultiSelect
                options={topicOptions}
                onValueChange={(value) => handleSelectChange('topics', value)}
                value={formData.topics}
                placeholder="Select topics"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
                id="isReview"
                name="isReview"
                checked={formData.isReview}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({...prev, isReview: checked}))}
            />
            <Label htmlFor="isReview" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Mark for review later
            </Label>
          </div>
          <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">{isEditing ? 'Update Problem' : 'Add Problem'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProblemForm;
