import express from 'express';
import multer from 'multer';
import os from 'os';
import {
  getTransactions,
  getTransactionById,
  getCategorySummary
} from '../controllers/transactionController.js';
import {
  getPnlReport,
  getPnlTransactions
} from '../controllers/pnlController.js';
import {
  getPeriodVariance
} from '../controllers/varianceController.js';
import {
  getReviewItems,
  correctClassification,
  resolveReview,
  getReviewAuditTrail
} from '../controllers/reviewController.js';
import {
  askAnalyst
} from '../controllers/analystController.js';
import {
  uploadTransactionsCSV,
  seedSampleDataset,
  getImportBatches
} from '../controllers/ingestionController.js';

const router = express.Router();

// Multer temporary storage configuration with 10MB limit and CSV filter
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed.'));
    }
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Finz AI-Native Financial Review Platform API'
  });
});

// Ingestion Routes
router.post('/ingest/upload', upload.single('file'), uploadTransactionsCSV);
router.post('/ingest/seed', seedSampleDataset);
router.get('/ingest/batches', getImportBatches);

// Transaction Routes
router.get('/transactions', getTransactions);
router.get('/transactions/categories/summary', getCategorySummary);
router.get('/transactions/:id', getTransactionById);

// P&L Financial Report Routes
router.get('/pnl', getPnlReport);
router.get('/pnl/transactions', getPnlTransactions);

// Variance Analysis Routes
router.get('/variance', getPeriodVariance);

// Review Queue & Audit Routes
router.get('/review', getReviewItems);
router.post('/review/:id/correct', correctClassification);
router.post('/review/:id/resolve', resolveReview);
router.get('/review/:transactionId/audit', getReviewAuditTrail);

// AI Financial Analyst
router.post('/analyst/ask', askAnalyst);

export default router;
