import mongoose from 'mongoose';
import { ALLOWED_CATEGORIES, CLASSIFICATION_METHODS, REVIEW_STATUSES } from '../config/constants.js';

const auditEntrySchema = new mongoose.Schema({
  previousCategory: { type: String },
  newCategory: { type: String, required: true },
  previousSubcategory: { type: String },
  newSubcategory: { type: String },
  previousStatus: { type: String },
  newStatus: { type: String },
  changedBy: { type: String, default: 'User' },
  reason: { type: String, default: 'Manual user correction' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  month: {
    type: String, // 'YYYY-MM' format for rapid P&L grouping
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Credit', 'Debit'],
    required: true
  },
  account: {
    type: String,
    default: 'Default Account'
  },
  referenceNumber: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ALLOWED_CATEGORIES,
    index: true
  },
  subcategory: {
    type: String,
    default: 'General'
  },
  classificationMethod: {
    type: String,
    enum: Object.values(CLASSIFICATION_METHODS),
    default: CLASSIFICATION_METHODS.RULE
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0
  },
  rationale: {
    type: String,
    default: 'Matched deterministic rule'
  },
  isPnlIncluded: {
    type: Boolean,
    default: true,
    index: true
  },
  reviewStatus: {
    type: String,
    enum: Object.values(REVIEW_STATUSES),
    default: REVIEW_STATUSES.NOT_REQUIRED,
    index: true
  },
  reviewReason: {
    type: String,
    default: ''
  },
  importBatchId: {
    type: String,
    index: true
  },
  sourceRowNumber: {
    type: Number
  },
  auditTrail: [auditEntrySchema]
}, {
  timestamps: true
});

// Composite indexes for fast P&L aggregations
transactionSchema.index({ month: 1, isPnlIncluded: 1, category: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
