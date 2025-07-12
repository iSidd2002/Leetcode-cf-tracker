import type { Contest } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContestListProps {
  contests: Contest[];
  onEditContest: (contest: Contest) => void;
  onDeleteContest: (id: string) => void;
}

export default function ContestList({ contests, onEditContest, onDeleteContest }: ContestListProps) {
  const getPlatformBadgeVariant = (platform: 'leetcode' | 'codeforces' | 'atcoder' | 'other') => {
    switch (platform) {
      case 'leetcode':
        return 'warning';
      case 'codeforces':
        return 'destructive';
      case 'atcoder':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Duration (m)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contests.map((contest) => (
            <TableRow key={contest.id}>
              <TableCell className="font-medium">
                <a href={contest.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                    {contest.name}
                    <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </TableCell>
              <TableCell>
                <Badge variant={getPlatformBadgeVariant(contest.platform)}>
                  {contest.platform}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(contest.startTime).toLocaleString()}
              </TableCell>
              <TableCell>{contest.duration}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditContest(contest)}>
                      <Pencil className="mr-2 h-5 w-5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteContest(contest.id)}>
                      <Trash2 className="mr-2 h-5 w-5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 