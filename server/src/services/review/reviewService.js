import { Transaction } from '../../models/Transaction.js';
import { ReviewHistory } from '../../models/ReviewHistory.js';
import { REVIEW_STATUSES, CLASSIFICATION_METHODS, ALLOWED_CATEGORIES, ACCOUNTING_CATEGORIES } from '../../config/constants.js';

/**
 * Get all transactions requiring review
 */
export async function getReviewQueue(status = REVIEW_STATUSES.PENDING) {
  const query = {};
  if (status && status !== 'All') {
    query.reviewStatus = status;
  } else {
    query.reviewStatus = { $ne: REVIEW_STATUSES.NOT_REQUIRED };
  }

  return await Transaction.find(query).sort({ date: -1 }).lean();
}

/**
 * Correct transaction classification and record audit trail
 */
export async function correctTransactionClassification(transactionId, {
  newCategory,
  newSubcategory,
  notes,
  actor = 'Finance Reviewer',
  resolveReview = true
}) {
  if (!ALLOWED_CATEGORIES.includes(newCategory)) {
    throw new Error(`Invalid category: "${newCategory}". Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
  }

  const txn = await Transaction.findOne({ transactionId });
  if (!txn) {
    throw new Error(`Transaction with ID "${transactionId}" not found.`);
  }

  const previousState = {
    category: txn.category,
    subcategory: txn.subcategory,
    reviewStatus: txn.reviewStatus
  };

  const newStatus = resolveReview ? REVIEW_STATUSES.RESOLVED : txn.reviewStatus;
  const isPnlIncluded = newCategory !== ACCOUNTING_CATEGORIES.NON_PNL;

  // Add to transaction audit trail
  txn.auditTrail.push({
    previousCategory: txn.category,
    newCategory,
    previousSubcategory: txn.subcategory,
    newSubcategory: newSubcategory || txn.subcategory,
    previousStatus: txn.reviewStatus,
    newStatus,
    changedBy: actor,
    reason: notes || 'User classification correction',
    timestamp: new Date()
  });

  txn.category = newCategory;
  if (newSubcategory) txn.subcategory = newSubcategory;
  txn.classificationMethod = CLASSIFICATION_METHODS.MANUAL;
  txn.isPnlIncluded = isPnlIncluded;
  txn.reviewStatus = newStatus;
  txn.confidence = 1.0;
  txn.rationale = `Manually verified and corrected by ${actor}: ${notes || 'No comment provided'}`;

  await txn.save();

  // Create separate ReviewHistory record
  const history = new ReviewHistory({
    transactionId,
    action: 'CATEGORY_CORRECTION',
    previousState,
    newState: {
      category: newCategory,
      subcategory: newSubcategory || previousState.subcategory,
      reviewStatus: newStatus
    },
    notes: notes || 'Classification corrected and approved',
    actor
  });
  await history.save();

  return txn;
}

/**
 * Resolve an item in the review queue without altering category
 */
export async function resolveReviewItem(transactionId, notes = 'Reviewed and approved', actor = 'Finance Reviewer') {
  const txn = await Transaction.findOne({ transactionId });
  if (!txn) {
    throw new Error(`Transaction with ID "${transactionId}" not found.`);
  }

  const previousState = {
    category: txn.category,
    subcategory: txn.subcategory,
    reviewStatus: txn.reviewStatus
  };

  txn.reviewStatus = REVIEW_STATUSES.RESOLVED;
  txn.auditTrail.push({
    previousCategory: txn.category,
    newCategory: txn.category,
    previousStatus: previousState.reviewStatus,
    newStatus: REVIEW_STATUSES.RESOLVED,
    changedBy: actor,
    reason: notes,
    timestamp: new Date()
  });

  await txn.save();

  const history = new ReviewHistory({
    transactionId,
    action: 'FLAG_RESOLVED',
    previousState,
    newState: {
      category: txn.category,
      subcategory: txn.subcategory,
      reviewStatus: REVIEW_STATUSES.RESOLVED
    },
    notes,
    actor
  });
  await history.save();

  return txn;
}
