import { classifyWithRules } from './rulesEngine.js';
import { suggestClassificationWithAI } from './aiCategorizer.js';
import { REVIEW_STATUSES, REVIEW_REASONS } from '../../config/constants.js';

/**
 * Categorize a single transaction through the hybrid pipeline:
 * Deterministic Rules -> AI Suggestion -> Human Review Flag
 */
export async function categorizeTransaction({ description, amount, type }) {
  // 1. Deterministic rules check first
  const ruleResult = classifyWithRules(description, amount);
  if (ruleResult) {
    return ruleResult;
  }

  // 2. If no rule matched, invoke AI categorization
  const aiResult = await suggestClassificationWithAI(description, amount, type);
  return aiResult;
}

/**
 * Post-process transactions to detect potential duplicate charges
 */
export function flagDuplicateTransactions(transactions) {
  const seenMap = new Map();

  for (const txn of transactions) {
    // Key by date, absolute amount, and vendor/description snippet
    const dateStr = typeof txn.date === 'string' ? txn.date.substring(0, 10) : new Date(txn.date).toISOString().substring(0, 10);
    const key = `${dateStr}_${Math.abs(txn.amount).toFixed(2)}_${txn.description.trim().toLowerCase()}`;

    if (seenMap.has(key)) {
      // Mark current and previous as duplicate review items
      txn.reviewStatus = REVIEW_STATUSES.PENDING;
      txn.reviewReason = REVIEW_REASONS.POTENTIAL_DUPLICATE;
      
      const prevTxn = seenMap.get(key);
      prevTxn.reviewStatus = REVIEW_STATUSES.PENDING;
      prevTxn.reviewReason = REVIEW_REASONS.POTENTIAL_DUPLICATE;
    } else {
      seenMap.set(key, txn);
    }
  }

  return transactions;
}
