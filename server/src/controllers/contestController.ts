import { Response } from 'express';
import { ContestModel } from '../models/Contest';
import { AuthRequest, Contest, ApiResponse } from '../types';

export const getContests = async (req: AuthRequest, res: Response<ApiResponse<Contest[]>>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { platform, status, limit, offset } = req.query;

    // Build filter
    const filter: any = { userId };
    
    if (platform) filter.platform = platform;
    if (status) filter.status = status;

    // Execute query with pagination
    const contests = await ContestModel.find(filter)
      .sort({ startTime: -1 })
      .limit(Number(limit) || 100)
      .skip(Number(offset) || 0)
      .lean();

    res.json({
      success: true,
      data: contests.map(c => ({ ...c, _id: c._id.toString(), userId: c.userId.toString() }))
    });
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createContest = async (req: AuthRequest, res: Response<ApiResponse<Contest>>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const contestData = { ...req.body, userId };

    const contest = new ContestModel(contestData);
    await contest.save();

    res.status(201).json({
      success: true,
      data: { ...contest.toObject(), _id: (contest._id as any).toString(), userId: contest.userId.toString() },
      message: 'Contest created successfully'
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Contest with this name and platform already exists'
      });
      return;
    }
    
    console.error('Create contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateContest = async (req: AuthRequest, res: Response<ApiResponse<Contest>>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const contest = await ContestModel.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!contest) {
      res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { ...contest.toObject(), _id: (contest._id as any).toString(), userId: contest.userId.toString() },
      message: 'Contest updated successfully'
    });
  } catch (error) {
    console.error('Update contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteContest = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const contest = await ContestModel.findOneAndDelete({ _id: id, userId });

    if (!contest) {
      res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Contest deleted successfully'
    });
  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
