import {
  getReviewQueue,
  correctTransactionClassification,
  resolveReviewItem
} from '../services/review/reviewService.js';
import { ReviewHistory } from '../models/ReviewHistory.js';

export async function getReviewItems(req, res, next) {
  try {
    const { status } = req.query;
    const items = await getReviewQueue(status);
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (err) {
    next(err);
  }
}

export async function correctClassification(req, res, next) {
  try {
    const { id } = req.params;
    const { newCategory, newSubcategory, notes, actor } = req.body;

    if (!newCategory) {
      return res.status(400).json({ success: false, error: 'Field "newCategory" is required' });
    }

    const updated = await correctTransactionClassification(id, {
      newCategory,
      newSubcategory,
      notes,
      actor: actor || 'Finance Reviewer',
      resolveReview: true
    });

    res.json({
      success: true,
      message: `Transaction ${id} re-classified to ${newCategory} and resolved`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function resolveReview(req, res, next) {
  try {
    const { id } = req.params;
    const { notes, actor } = req.body;

    const updated = await resolveReviewItem(id, notes, actor);

    res.json({
      success: true,
      message: `Review item ${id} marked as resolved`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function getReviewAuditTrail(req, res, next) {
  try {
    const { transactionId } = req.params;
    const history = await ReviewHistory.find({ transactionId }).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
}
