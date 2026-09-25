import { Transaction } from '../models/Transaction.js';
import { ALLOWED_CATEGORIES } from '../config/constants.js';

export async function getTransactions(req, res, next) {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      category = '',
      month = '',
      reviewStatus = '',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { account: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (month && month !== 'All') {
      query.month = month;
    }

    if (reviewStatus && reviewStatus !== 'All') {
      query.reviewStatus = reviewStatus;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params;
    const txn = await Transaction.findOne({ transactionId: id }).lean();
    if (!txn) {
      return res.status(404).json({ success: false, error: `Transaction ${id} not found` });
    }
    res.json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
}

export async function getCategorySummary(req, res, next) {
  try {
    const categories = ALLOWED_CATEGORIES;
    const stats = await Transaction.aggregate([
      { $match: { isPnlIncluded: true } },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { categories, stats } });
  } catch (err) {
    next(err);
  }
}
