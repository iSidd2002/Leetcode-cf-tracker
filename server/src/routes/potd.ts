import { Router } from 'express';
import { getDailyProblem, getCodeForcesProblem } from '../controllers/potdController';

const router = Router();

// LeetCode Problem of the Day endpoint
// This acts as a proxy to LeetCode's GraphQL API
router.post('/', getDailyProblem);

// CodeForces problem endpoint (future implementation)
router.get('/codeforces', getCodeForcesProblem);

export default router;
