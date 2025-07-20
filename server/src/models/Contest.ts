import mongoose, { Schema, Document } from 'mongoose';
import { Contest as IContest } from '../types';

interface ContestDocument extends Omit<IContest, '_id' | 'userId'>, Document {
  userId: any;
}

const contestSchema = new Schema<ContestDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'atcoder', 'codechef', 'other'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  rank: {
    type: Number,
    min: 1
  },
  problemsSolved: {
    type: Number,
    min: 0,
    default: 0
  },
  totalProblems: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
contestSchema.index({ userId: 1, platform: 1 });
contestSchema.index({ userId: 1, status: 1 });
contestSchema.index({ userId: 1, startTime: 1 });

// Unique constraint for user + contest combination
contestSchema.index({ userId: 1, name: 1, platform: 1 }, { unique: true });

export const ContestModel = mongoose.model<ContestDocument>('Contest', contestSchema);
