import { Router } from 'express';
import {
  getContests,
  createContest,
  updateContest,
  deleteContest
} from '../controllers/contestController';
import { validateContest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Contest CRUD routes
router.get('/', getContests);
router.post('/', validateContest, createContest);
router.put('/:id', updateContest);
router.delete('/:id', deleteContest);

export default router;
