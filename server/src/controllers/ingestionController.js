import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { parseAndIngestCSV } from '../services/ingestion/csvParser.js';
import { ImportBatch } from '../models/ImportBatch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadTransactionsCSV(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file was uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileSizeBytes = req.file.size;

    const summary = await parseAndIngestCSV(filePath, originalName, fileSizeBytes);

    // Clean up temporary upload file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: `Successfully processed ${summary.totalRowsProcessed} rows`,
      data: summary
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
}

/**
 * Seed endpoint to automatically load the verified NYC Restaurant Co. dataset
 */
export async function seedSampleDataset(req, res, next) {
  try {
    const defaultCsvPath = path.resolve(__dirname, '../../../data/nyc_restaurant_co_transactions.csv');
    if (!fs.existsSync(defaultCsvPath)) {
      return res.status(404).json({ success: false, error: 'NYC Restaurant Co. dataset CSV not found on server' });
    }

    const stats = fs.statSync(defaultCsvPath);
    const summary = await parseAndIngestCSV(defaultCsvPath, 'nyc_restaurant_co_transactions.csv', stats.size);

    res.json({
      success: true,
      message: 'Verified NYC Restaurant Co. dataset loaded successfully',
      data: summary
    });
  } catch (err) {
    next(err);
  }
}

export async function getImportBatches(req, res, next) {
  try {
    const batches = await ImportBatch.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json({
      success: true,
      data: batches
    });
  } catch (err) {
    next(err);
  }
}
