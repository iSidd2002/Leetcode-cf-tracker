import mongoose, { Schema, Document } from 'mongoose';
import { Problem as IProblem } from '../types';

interface ProblemDocument extends Omit<IProblem, '_id' | 'userId'>, Document {
  userId: any;
}

const problemSchema = new Schema<ProblemDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'atcoder'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  problemId: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  dateSolved: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  notes: {
    type: String,
    default: '',
    maxlength: 10000
  },
  isReview: {
    type: Boolean,
    default: false
  },
  repetition: {
    type: Number,
    default: 0,
    min: 0
  },
  interval: {
    type: Number,
    default: 0,
    min: 0
  },
  nextReviewDate: {
    type: String,
    default: null
  },
  topics: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'learned'],
    default: 'active'
  },
  companies: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
problemSchema.index({ userId: 1, platform: 1 });
problemSchema.index({ userId: 1, status: 1 });
problemSchema.index({ userId: 1, isReview: 1 });
problemSchema.index({ userId: 1, dateSolved: 1 });
problemSchema.index({ userId: 1, companies: 1 });
problemSchema.index({ userId: 1, topics: 1 });

// Unique constraint for user + problem combination
problemSchema.index({ userId: 1, url: 1 }, { unique: true });

export const ProblemModel = mongoose.model<ProblemDocument>('Problem', problemSchema);
