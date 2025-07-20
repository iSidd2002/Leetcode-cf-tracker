import { Router } from 'express';
import {
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  bulkCreateProblems
} from '../controllers/problemController';
import { validateProblem } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Problem CRUD routes
router.get('/', getProblems);
router.post('/', validateProblem, createProblem);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);

// Bulk operations
router.post('/bulk', bulkCreateProblems);

export default router;
