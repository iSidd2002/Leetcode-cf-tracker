import { Response } from 'express';
import { ProblemModel } from '../models/Problem';
import { AuthRequest, Problem, ApiResponse } from '../types';

export const getProblems = async (req: AuthRequest, res: Response<ApiResponse<Problem[]>>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { platform, status, isReview, company, topic, limit, offset } = req.query;

    // Build filter
    const filter: any = { userId };
    
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    if (isReview !== undefined) filter.isReview = isReview === 'true';
    if (company) filter.companies = { $in: [company] };
    if (topic) filter.topics = { $in: [topic] };

    // Execute query with pagination
    const problems = await ProblemModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 100)
      .skip(Number(offset) || 0)
      .lean();

    res.json({
      success: true,
      data: problems.map(p => ({ ...p, _id: p._id.toString(), userId: p.userId.toString() }))
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createProblem = async (req: AuthRequest, res: Response<ApiResponse<Problem>>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const problemData = { ...req.body, userId };

    const problem = new ProblemModel(problemData);
    await problem.save();

    res.status(201).json({
      success: true,
      data: { ...problem.toObject(), _id: (problem._id as any).toString(), userId: problem.userId.toString() },
      message: 'Problem created successfully'
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Problem with this URL already exists'
      });
      return;
    }
    
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateProblem = async (req: AuthRequest, res: Response<ApiResponse<Problem>>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const problem = await ProblemModel.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { ...problem.toObject(), _id: (problem._id as any).toString(), userId: problem.userId.toString() },
      message: 'Problem updated successfully'
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteProblem = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const problem = await ProblemModel.findOneAndDelete({ _id: id, userId });

    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const bulkCreateProblems = async (req: AuthRequest, res: Response<ApiResponse<{ created: number; skipped: number }>>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { problems } = req.body;

    if (!Array.isArray(problems)) {
      res.status(400).json({
        success: false,
        error: 'Problems must be an array'
      });
      return;
    }

    let created = 0;
    let skipped = 0;

    for (const problemData of problems) {
      try {
        const problem = new ProblemModel({ ...problemData, userId });
        await problem.save();
        created++;
      } catch (error) {
        if ((error as any).code === 11000) {
          skipped++; // Duplicate URL
        } else {
          throw error;
        }
      }
    }

    res.json({
      success: true,
      data: { created, skipped },
      message: `Bulk import completed: ${created} created, ${skipped} skipped`
    });
  } catch (error) {
    console.error('Bulk create problems error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
