import { Router } from 'express';
import authRoutes from './auth';
import problemRoutes from './problems';
import contestRoutes from './contests';
import potdRoutes from './potd';
import companyRoutes from './companies';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LeetCode CF Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/contests', contestRoutes);
router.use('/potd', potdRoutes);
router.use('/companies', companyRoutes);

export default router;
