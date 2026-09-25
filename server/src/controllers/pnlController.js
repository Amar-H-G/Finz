import { calculateMonthlyPnl, getPnlLineItemTransactions } from '../services/financial/pnlEngine.js';

export async function getPnlReport(req, res, next) {
  try {
    const { month } = req.query;
    const reports = await calculateMonthlyPnl(month || null);
    res.json({
      success: true,
      data: reports
    });
  } catch (err) {
    next(err);
  }
}

export async function getPnlTransactions(req, res, next) {
  try {
    const { month, category } = req.query;
    if (!month) {
      return res.status(400).json({ success: false, error: 'Query parameter "month" is required (e.g. 2025-01)' });
    }
    const txns = await getPnlLineItemTransactions(month, category);
    res.json({
      success: true,
      data: txns
    });
  } catch (err) {
    next(err);
  }
}
