import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ACCOUNTING_CATEGORIES,
  ALLOWED_CATEGORIES,
  CLASSIFICATION_METHODS,
  REVIEW_STATUSES,
  REVIEW_REASONS
} from '../../config/constants.js';

let genAI = null;

function getAIClient() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Ask Google Gemini to suggest a classification for an ambiguous transaction
 */
export async function suggestClassificationWithAI(description, amount, type) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Graceful offline fallback when no API key is provided
    return {
      category: amount > 0 ? ACCOUNTING_CATEGORIES.REVENUE : ACCOUNTING_CATEGORIES.OPEX,
      subcategory: 'Uncategorized',
      classificationMethod: CLASSIFICATION_METHODS.AI,
      confidence: 0.50,
      rationale: 'AI suggestion simulated: API key not configured. Marked for review.',
      isPnlIncluded: true,
      reviewStatus: REVIEW_STATUSES.PENDING,
      reviewReason: REVIEW_REASONS.LOW_CONFIDENCE_AI
    };
  }

  try {
    const ai = getAIClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = ai.getGenerativeModel({ modelOptions: { model: modelName } });

    const prompt = `You are a certified CPA and restaurant financial analyst for NYC Restaurant Co.
Given the following raw bank transaction:
- Description: "${description}"
- Amount: $${Math.abs(amount).toFixed(2)} (${amount > 0 ? 'Inflow/Deposit' : 'Outflow/Expense'})
- Type: ${type}

Categorize this transaction strictly into one of the allowed categories:
- "${ACCOUNTING_CATEGORIES.REVENUE}"
- "${ACCOUNTING_CATEGORIES.COGS}"
- "${ACCOUNTING_CATEGORIES.PAYROLL}"
- "${ACCOUNTING_CATEGORIES.OPEX}"
- "${ACCOUNTING_CATEGORIES.NON_PNL}"

Respond ONLY with valid JSON in this exact structure:
{
  "category": "one of the allowed categories above",
  "subcategory": "specific description (e.g. Seafood, Utilities, POS Sales, etc.)",
  "confidence": 0.85,
  "rationale": "one concise sentence explaining why based on restaurant operations",
  "requiresReview": true or false,
  "reviewReason": "reason if requiresReview is true, else empty string"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Parse JSON safely from markdown backticks if present
    const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Validate category against whitelist
    if (!ALLOWED_CATEGORIES.includes(parsed.category)) {
      console.warn(`AI suggested invalid category "${parsed.category}". Defaulting to OpEx.`);
      parsed.category = ACCOUNTING_CATEGORIES.OPEX;
      parsed.requiresReview = true;
      parsed.reviewReason = 'Invalid category returned by AI';
    }

    const isPnl = parsed.category !== ACCOUNTING_CATEGORIES.NON_PNL;
    const confidence = typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.65;
    const needsReview = parsed.requiresReview || confidence < 0.75;

    return {
      category: parsed.category,
      subcategory: parsed.subcategory || 'General',
      classificationMethod: CLASSIFICATION_METHODS.AI,
      confidence: Number(confidence.toFixed(2)),
      rationale: parsed.rationale || 'AI-assisted classification',
      isPnlIncluded: isPnl,
      reviewStatus: needsReview ? REVIEW_STATUSES.PENDING : REVIEW_STATUSES.NOT_REQUIRED,
      reviewReason: needsReview ? (parsed.reviewReason || REVIEW_REASONS.LOW_CONFIDENCE_AI) : ''
    };
  } catch (err) {
    console.error(`AI categorization error for "${description}":`, err.message);
    // Safe failure mode per specification
    return {
      category: amount > 0 ? ACCOUNTING_CATEGORIES.REVENUE : ACCOUNTING_CATEGORIES.OPEX,
      subcategory: 'Uncategorized',
      classificationMethod: CLASSIFICATION_METHODS.AI,
      confidence: 0.40,
      rationale: `AI service unavailable (${err.message}). Defaulted and flagged for human review.`,
      isPnlIncluded: true,
      reviewStatus: REVIEW_STATUSES.PENDING,
      reviewReason: REVIEW_REASONS.LOW_CONFIDENCE_AI
    };
  }
}
