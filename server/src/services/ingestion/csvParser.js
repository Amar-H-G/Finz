import fs from 'fs';
import csvParser from 'csv-parser';
import { Transaction } from '../../models/Transaction.js';
import { ImportBatch } from '../../models/ImportBatch.js';
import { categorizeTransaction, flagDuplicateTransactions } from '../categorization/categorizerService.js';

/**
 * Clean and parse numeric currency string into signed float
 */
export function normalizeAmount(rawAmount) {
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
    return NaN;
  }
  if (typeof rawAmount === 'number') {
    return rawAmount;
  }
  const cleaned = String(rawAmount)
    .trim()
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '');

  // Accounting negative notation: (123.45)
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.slice(1, -1));
  }
  return parseFloat(cleaned);
}

/**
 * Normalize date into a valid Date object and 'YYYY-MM' string
 */
export function normalizeDate(rawDate) {
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) {
    return null;
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return {
    date: parsed,
    month: `${year}-${month}`
  };
}

/**
 * Ingest and process CSV transaction records
 */
export async function parseAndIngestCSV(filePath, originalFilename, fileSizeBytes) {
  const batchId = `BATCH-${Date.now()}`;
  const importBatch = new ImportBatch({
    batchId,
    filename: originalFilename,
    fileSizeBytes: fileSizeBytes || fs.statSync(filePath).size,
    status: 'processing'
  });
  await importBatch.save();

  const parsedRows = [];
  const errors = [];
  let rowNumber = 1; // 1 is header

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        rowNumber++;
        // Identify fields with flexible matching (snake_case, CamelCase, Title Case)
        const txnId = row.transaction_id || row['Transaction ID'] || row.id || `TXN-${batchId}-${rowNumber}`;
        const rawDate = row.date || row.Date || row.transaction_date;
        const rawDesc = row.description || row.Description || row.memo;
        const rawAmt = row.amount || row.Amount || row.total;
        const rawType = row.type || row.Type || (parseFloat(rawAmt) >= 0 ? 'Credit' : 'Debit');
        const rawAccount = row.account || row.Account || 'Default Account';
        const rawRef = row.reference_number || row['Reference Number'] || row.ref || '';

        // Validation
        if (!rawDate) {
          errors.push({ rowNumber, error: 'Missing date field', rawRow: row });
          return;
        }
        const dateObj = normalizeDate(rawDate);
        if (!dateObj) {
          errors.push({ rowNumber, error: `Invalid date format: "${rawDate}"`, rawRow: row });
          return;
        }

        if (!rawDesc || String(rawDesc).trim() === '') {
          errors.push({ rowNumber, error: 'Missing transaction description', rawRow: row });
          return;
        }

        const amt = normalizeAmount(rawAmt);
        if (isNaN(amt)) {
          errors.push({ rowNumber, error: `Invalid numeric amount: "${rawAmt}"`, rawRow: row });
          return;
        }

        parsedRows.push({
          sourceRowNumber: rowNumber,
          transactionId: String(txnId).trim(),
          date: dateObj.date,
          month: dateObj.month,
          description: String(rawDesc).trim(),
          amount: amt,
          type: rawType.toLowerCase().includes('credit') || amt > 0 ? 'Credit' : 'Debit',
          account: String(rawAccount).trim(),
          referenceNumber: String(rawRef).trim(),
          importBatchId: batchId
        });
      })
      .on('end', async () => {
        try {
          const totalRowsProcessed = rowNumber - 1;
          const successfulInserts = [];
          let skippedDuplicatesCount = 0;

          // Process categorization
          const categorizedRows = [];
          for (const item of parsedRows) {
            // Check if transaction ID already exists in DB
            const existing = await Transaction.findOne({ transactionId: item.transactionId });
            if (existing) {
              skippedDuplicatesCount++;
              continue;
            }

            const catResult = await categorizeTransaction({
              description: item.description,
              amount: item.amount,
              type: item.type
            });

            categorizedRows.push({
              ...item,
              ...catResult
            });
          }

          // Flag duplicates within the batch
          const finalRows = flagDuplicateTransactions(categorizedRows);

          if (finalRows.length > 0) {
            await Transaction.insertMany(finalRows);
          }

          importBatch.totalRowsProcessed = totalRowsProcessed;
          importBatch.importedCount = finalRows.length;
          importBatch.skippedDuplicatesCount = skippedDuplicatesCount;
          importBatch.failedRowsCount = errors.length;
          importBatch.errors = errors;
          importBatch.status = 'completed';
          await importBatch.save();

          resolve({
            batchId,
            filename: originalFilename,
            totalRowsProcessed,
            importedCount: finalRows.length,
            skippedDuplicatesCount,
            failedRowsCount: errors.length,
            errors
          });
        } catch (dbErr) {
          importBatch.status = 'failed';
          await importBatch.save();
          reject(dbErr);
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
