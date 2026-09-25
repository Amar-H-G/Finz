import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateMonthlyPnl } from '../financial/pnlEngine.js';
import { computePeriodVariance } from '../variance/varianceEngine.js';
import { Transaction } from '../../models/Transaction.js';
import { REVIEW_STATUSES } from '../../config/constants.js';

let genAI = null;

function getAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Identify intent and extract financial facts deterministically from database
 */
async function retrieveVerifiedFacts(question) {
  const q = question.toLowerCase();

  // 1. Identify Target Months
  const monthNames = {
    jan: '2025-01', january: '2025-01', '01': '2025-01',
    feb: '2025-02', february: '2025-02', '02': '2025-02',
    mar: '2025-03', march: '2025-03', '03': '2025-03'
  };

  const detectedMonths = [];
  for (const [name, ym] of Object.entries(monthNames)) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(q) && !detectedMonths.includes(ym)) {
      detectedMonths.push(ym);
    }
  }

  // Fetch all monthly P&L summaries
  const allMonthlyReports = await calculateMonthlyPnl();
  const availableMonths = allMonthlyReports.map(r => r.month);

  // Check for Variance / Comparison query
  const isComparison = /compare|change|variance|increase|decrease|drove|why|between/i.test(q);
  
  if (isComparison && (detectedMonths.length >= 2 || (detectedMonths.length === 1 && availableMonths.length >= 2))) {
    let mPrior = detectedMonths[0];
    let mCurr = detectedMonths[1];

    if (!mCurr && availableMonths.length >= 2) {
      // If user said "why did March change", compare with prior available month
      const idx = availableMonths.indexOf(mPrior);
      if (idx > 0) {
        mCurr = mPrior;
        mPrior = availableMonths[idx - 1];
      } else {
        mCurr = availableMonths[1];
        mPrior = availableMonths[0];
      }
    }

    if (mPrior && mCurr) {
      const varianceResult = await computePeriodVariance(mPrior, mCurr);
      
      // Collect evidence transactions for material variances
      const materialVariances = varianceResult.variances.filter(v => v.isMaterial);
      const topVariance = materialVariances[0] || varianceResult.variances[0];
      
      const evidenceTxns = await Transaction.find({
        month: { $in: [mPrior, mCurr] },
        category: topVariance?.category || 'Revenue',
        isPnlIncluded: true
      }).limit(8).lean();

      return {
        type: 'PERIOD_VARIANCE',
        priorMonth: mPrior,
        currentMonth: mCurr,
        verifiedData: varianceResult,
        evidence: {
          period: `${mPrior} to ${mCurr}`,
          category: topVariance?.category || 'P&L Summary',
          verifiedAmount: topVariance ? `$${Math.abs(topVariance.absoluteChange).toLocaleString()} change` : 'N/A',
          transactions: evidenceTxns.map(t => ({
            id: t.transactionId,
            date: t.date.toISOString().substring(0, 10),
            description: t.description,
            amount: t.amount,
            category: t.category
          }))
        }
      };
    }
  }

  // Check for Attention / Review queue queries
  if (/attention|review|flag|uncertain|duplicate|anomaly/i.test(q)) {
    const pendingTxns = await Transaction.find({ reviewStatus: REVIEW_STATUSES.PENDING }).lean();
    return {
      type: 'REVIEW_ATTENTION',
      verifiedData: {
        pendingReviewCount: pendingTxns.length,
        items: pendingTxns.slice(0, 10)
      },
      evidence: {
        period: 'Current Review Queue',
        category: 'Human Review Needed',
        verifiedAmount: `${pendingTxns.length} transactions flagged`,
        transactions: pendingTxns.slice(0, 6).map(t => ({
          id: t.transactionId,
          date: t.date.toISOString().substring(0, 10),
          description: t.description,
          amount: t.amount,
          category: t.category,
          reason: t.reviewReason
        }))
      }
    };
  }

  // Monthly single metric query (e.g. "What was revenue in March?", "How much spent on payroll?")
  const targetMonth = detectedMonths[0] || availableMonths[availableMonths.length - 1] || '2025-03';
  const monthReport = allMonthlyReports.find(r => r.month === targetMonth) || allMonthlyReports[0];

  let relevantCategory = 'Revenue';
  if (/cogs|cost\s+of\s+goods|food\s+cost/i.test(q)) relevantCategory = 'Cost of Goods Sold';
  else if (/payroll|wages|salary|salaries/i.test(q)) relevantCategory = 'Payroll';
  else if (/opex|operating\s+expense|rent|utilities/i.test(q)) relevantCategory = 'Operating Expenses';
  else if (/profit|gross\s+profit|operating\s+profit/i.test(q)) relevantCategory = 'Profitability';

  const evidenceTxns = await Transaction.find({
    month: targetMonth,
    category: relevantCategory === 'Profitability' ? 'Revenue' : relevantCategory,
    isPnlIncluded: true
  }).limit(8).lean();

  let verifiedAmount = 0;
  if (monthReport) {
    if (relevantCategory === 'Revenue') verifiedAmount = monthReport.revenue;
    else if (relevantCategory === 'Cost of Goods Sold') verifiedAmount = monthReport.cogs;
    else if (relevantCategory === 'Payroll') verifiedAmount = monthReport.payroll;
    else if (relevantCategory === 'Operating Expenses') verifiedAmount = monthReport.opex;
    else if (relevantCategory === 'Profitability') verifiedAmount = monthReport.operatingProfit;
  }

  return {
    type: 'MONTHLY_SUMMARY',
    targetMonth,
    relevantCategory,
    verifiedData: {
      monthReport,
      allMonthlyReports
    },
    evidence: {
      period: targetMonth,
      category: relevantCategory,
      verifiedAmount: `$${Number(verifiedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      transactions: evidenceTxns.map(t => ({
        id: t.transactionId,
        date: t.date.toISOString().substring(0, 10),
        description: t.description,
        amount: t.amount,
        category: t.category
      }))
    }
  };
}

/**
 * Query the AI Financial Analyst with deterministic grounding
 */
export async function askFinancialAnalyst(question) {
  if (!question || typeof question !== 'string' || question.trim() === '') {
    throw new Error('Question must be a non-empty string.');
  }

  // 1. Deterministically retrieve verified data & transactions
  const retrieval = await retrieveVerifiedFacts(question);
  const { verifiedData, evidence } = retrieval;

  // 2. Synthesize with Gemini SDK or deterministic fallback
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = getAI();
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = ai.getGenerativeModel({ modelOptions: { model: modelName } });

      const prompt = `You are the lead AI Financial Analyst for NYC Restaurant Co.
You must answer the user's question using ONLY the verified financial facts provided below.
CRITICAL RULES:
1. Do NOT invent, extrapolate, or hallucinate any numbers or percentages.
2. Quote the verified amounts exactly as given.
3. Reference the specific underlying transactions or vendors provided in the evidence.
4. If the data does not contain the answer, explicitly state that it cannot be determined from the available records.

VERIFIED FACTS:
${JSON.stringify(verifiedData, null, 2)}

SUPPORTING TRANSACTION EVIDENCE:
${JSON.stringify(evidence, null, 2)}

USER QUESTION:
"${question}"

Provide a clear, professional, executive-level financial answer with bullet points highlighting key drivers.`;

      const result = await model.generateContent(prompt);
      const answerText = result.response.text();

      return {
        question,
        answer: answerText,
        verifiedData: {
          period: evidence.period,
          category: evidence.category,
          verifiedAmount: evidence.verifiedAmount
        },
        evidence: evidence.transactions,
        source: 'Gemini AI Grounded Analysis',
        model: modelName
      };
    } catch (err) {
      console.warn(`Gemini API query failed (${err.message}). Using deterministic analysis response.`);
    }
  }

  // Deterministic Fallback Response (Works 100% offline with zero hallucinations)
  let fallbackAnswer = '';

  if (retrieval.type === 'PERIOD_VARIANCE') {
    const vars = verifiedData.variances;
    const materialItems = vars.filter(v => v.isMaterial);
    fallbackAnswer = `Between ${verifiedData.priorMonth} and ${verifiedData.currentMonth}, we identified **${materialItems.length} material variances**:\n\n` +
      materialItems.map(v => {
        const dir = v.absoluteChange >= 0 ? 'increased' : 'decreased';
        const pct = v.percentChange !== null ? ` (${Math.abs(v.percentChange)}%)` : '';
        const driverSummary = v.drivers.length > 0 
          ? ` Top contributing vendor: **${v.drivers[0].vendor}** (${v.drivers[0].changeAmount >= 0 ? '+$' : '-$'}${Math.abs(v.drivers[0].changeAmount).toLocaleString()}).`
          : '';
        return `• **${v.lineItem}**: ${dir} by **$${Math.abs(v.absoluteChange).toLocaleString()}**${pct} from $${v.priorAmount.toLocaleString()} to $${v.currentAmount.toLocaleString()}.${driverSummary}`;
      }).join('\n\n') +
      `\n\nAll figures are computed deterministically from underlying general ledger bank entries.`;
  } else if (retrieval.type === 'REVIEW_ATTENTION') {
    fallbackAnswer = `There are currently **${verifiedData.pendingReviewCount} transactions requiring human review**.\n\n` +
      `Key items needing attention include:\n` +
      verifiedData.items.slice(0, 4).map(i => `• **${i.transactionId}** (${i.description}): $${Math.abs(i.amount).toFixed(2)} — *${i.reviewReason || 'Uncertain categorization'}*`).join('\n') +
      `\n\nYou can review, categorize, and approve these directly in the Review Queue.`;
  } else {
    const rep = verifiedData.monthReport;
    if (rep) {
      fallbackAnswer = `In **${retrieval.targetMonth}**, NYC Restaurant Co. reported:\n\n` +
        `• **Revenue**: $${rep.revenue.toLocaleString()} (Toast POS settlements & catering)\n` +
        `• **Cost of Goods Sold (COGS)**: $${rep.cogs.toLocaleString()} (Gross Margin: ${rep.grossMarginPct}%)\n` +
        `• **Gross Profit**: $${rep.grossProfit.toLocaleString()}\n` +
        `• **Payroll**: $${rep.payroll.toLocaleString()}\n` +
        `• **Operating Expenses**: $${rep.opex.toLocaleString()}\n` +
        `• **Operating Profit**: $${rep.operatingProfit.toLocaleString()} (Operating Margin: ${rep.operatingMarginPct}%)\n\n` +
        `Click any supporting transaction below to inspect the original bank ledger source.`;
    } else {
      fallbackAnswer = `Financial data is currently being processed. Please upload your transaction CSV file to view reports.`;
    }
  }

  return {
    question,
    answer: fallbackAnswer,
    verifiedData: {
      period: evidence.period,
      category: evidence.category,
      verifiedAmount: evidence.verifiedAmount
    },
    evidence: evidence.transactions,
    source: 'Deterministic Financial Engine (Grounded Verification)',
    model: 'Finz Deterministic Rule Engine'
  };
}
