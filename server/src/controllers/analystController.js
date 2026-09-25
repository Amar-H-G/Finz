import { askFinancialAnalyst } from '../services/analyst/analystService.js';

export async function askAnalyst(req, res, next) {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Field "question" must be a non-empty string'
      });
    }

    const response = await askFinancialAnalyst(question.trim());

    res.json({
      success: true,
      data: response
    });
  } catch (err) {
    next(err);
  }
}
