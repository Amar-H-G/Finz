import mongoose from 'mongoose';

const reviewHistorySchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['CATEGORY_CORRECTION', 'STATUS_CHANGE', 'FLAG_RESOLVED'],
    required: true
  },
  previousState: {
    category: String,
    subcategory: String,
    reviewStatus: String
  },
  newState: {
    category: String,
    subcategory: String,
    reviewStatus: String
  },
  notes: {
    type: String,
    default: ''
  },
  actor: {
    type: String,
    default: 'Finance Reviewer'
  }
}, {
  timestamps: true
});

export const ReviewHistory = mongoose.model('ReviewHistory', reviewHistorySchema);
