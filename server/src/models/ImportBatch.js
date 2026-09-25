import mongoose from 'mongoose';

const importBatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  fileSizeBytes: {
    type: Number,
    required: true
  },
  totalRowsProcessed: {
    type: Number,
    default: 0
  },
  importedCount: {
    type: Number,
    default: 0
  },
  skippedDuplicatesCount: {
    type: Number,
    default: 0
  },
  failedRowsCount: {
    type: Number,
    default: 0
  },
  errors: [{
    rowNumber: Number,
    error: String,
    rawRow: mongoose.Schema.Types.Mixed
  }],
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  }
}, {
  timestamps: true
});

export const ImportBatch = mongoose.model('ImportBatch', importBatchSchema);
