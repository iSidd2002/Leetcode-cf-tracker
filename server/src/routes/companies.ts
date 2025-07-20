import { Router } from 'express';
import { getCompanyProblems, getAvailableCompanies } from '../controllers/companyController';

const router = Router();

// Get available companies
router.get('/', getAvailableCompanies);

// Get problems for a specific company
router.get('/:company/problems', getCompanyProblems);

export default router;
