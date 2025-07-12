import type { Problem, Contest } from '../types';

const PROBLEMS_KEY = 'leetcode-cf-tracker-problems';
const POTD_PROBLEMS_KEY = 'potd-problems';
const CONTESTS_KEY = 'contests';

class StorageService {
  static getProblems(): Problem[] {
    try {
      const problems = localStorage.getItem(PROBLEMS_KEY);
      return problems ? JSON.parse(problems) : [];
    } catch (error) {
      console.error('Error parsing problems from storage:', error);
      return [];
    }
  }

  static saveProblems(problems: Problem[]): void {
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  }

  static getPotdProblems(): Problem[] {
    try {
      const problems = localStorage.getItem(POTD_PROBLEMS_KEY);
      return problems ? JSON.parse(problems) : [];
    } catch (error) {
      console.error('Error parsing POTD problems from storage:', error);
      return [];
    }
  }

  static savePotdProblems(problems: Problem[]): void {
    localStorage.setItem(POTD_PROBLEMS_KEY, JSON.stringify(problems));
  }

  static getContests(): Contest[] {
    try {
      const contests = localStorage.getItem(CONTESTS_KEY);
      return contests ? JSON.parse(contests) : [];
    } catch (error) {
      console.error('Error parsing contests from storage:', error);
      return [];
    }
  }

  static saveContests(contests: Contest[]): void {
    localStorage.setItem(CONTESTS_KEY, JSON.stringify(contests));
  }

  static addProblem(problemData: Omit<Problem, 'id' | 'createdAt'>): Problem {
    const problems = this.getProblems();
    
    const newProblem: Problem = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...problemData,
    };

    problems.push(newProblem);
    this.saveProblems(problems);
    
    return newProblem;
  }

  static updateProblem(id: string, updates: Partial<Problem>): Problem | null {
    const problems = this.getProblems();
    const index = problems.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.error('Problem not found:', id);
      return null;
    }

    problems[index] = { ...problems[index], ...updates };
    this.saveProblems(problems);
    
    return problems[index];
  }

  static deleteProblem(id: string): boolean {
    const problems = this.getProblems();
    const filteredProblems = problems.filter(p => p.id !== id);
    
    if (filteredProblems.length === problems.length) {
      console.error('Problem not found for deletion:', id);
      return false;
    }

    this.saveProblems(filteredProblems);
    return true;
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default StorageService;
