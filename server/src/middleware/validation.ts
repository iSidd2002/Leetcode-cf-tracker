import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware to handle errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Problem validation rules
export const validateProblem = [
  body('platform')
    .isIn(['leetcode', 'codeforces', 'atcoder'])
    .withMessage('Platform must be leetcode, codeforces, or atcoder'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('problemId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Problem ID is required'),
  body('difficulty')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Difficulty is required'),
  body('url')
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('dateSolved')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Notes cannot exceed 10000 characters'),
  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array'),
  body('companies')
    .optional()
    .isArray()
    .withMessage('Companies must be an array'),
  handleValidationErrors
];

// Contest validation rules
export const validateContest = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Contest name must be 1-200 characters'),
  body('platform')
    .isIn(['leetcode', 'codeforces', 'atcoder', 'other'])
    .withMessage('Platform must be leetcode, codeforces, atcoder, or other'),
  body('startTime')
    .isISO8601()
    .withMessage('Please provide a valid start time'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (minutes)'),
  body('url')
    .isURL()
    .withMessage('Please provide a valid URL'),
  body('rank')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Rank must be a positive integer'),
  body('problemsSolved')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Problems solved must be a non-negative integer'),
  body('totalProblems')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total problems must be a non-negative integer'),
  handleValidationErrors
];
