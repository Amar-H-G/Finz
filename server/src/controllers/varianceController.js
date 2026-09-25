import { computePeriodVariance } from '../services/variance/varianceEngine.js';

export async function getPeriodVariance(req, res, next) {
  try {
    const { priorMonth, currentMonth, minDollarChange, minPercentChange } = req.query;

    if (!priorMonth || !currentMonth) {
      return res.status(400).json({
        success: false,
        error: 'Both "priorMonth" and "currentMonth" are required query parameters (e.g. ?priorMonth=2025-01&currentMonth=2025-02)'
      });
    }

    const options = {};
    if (minDollarChange) options.minDollarChange = parseFloat(minDollarChange);
    if (minPercentChange) options.minPercentChange = parseFloat(minPercentChange);

    const varianceData = await computePeriodVariance(priorMonth, currentMonth, options);

    res.json({
      success: true,
      data: varianceData
    });
  } catch (err) {
    next(err);
  }
}
