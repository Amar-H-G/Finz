import { Transaction } from '../../models/Transaction.js';
import { ACCOUNTING_CATEGORIES } from '../../config/constants.js';

/**
 * Minor unit arithmetic helper to prevent floating-point accumulation errors
 * Converts dollars to integer cents
 */
export function toCents(dollars) {
  if (typeof dollars !== 'number' || isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

export function toDollars(cents) {
  return Number((cents / 100).toFixed(2));
}

/**
 * Calculate Monthly P&L for a specific month (YYYY-MM) or all available months
 */
export async function calculateMonthlyPnl(targetMonth = null) {
  const query = { isPnlIncluded: true };
  if (targetMonth) {
    query.month = targetMonth;
  }

  // Fetch transactions ordered by date
  const transactions = await Transaction.find(query).lean();

  // Group by month
  const monthMap = new Map();

  for (const txn of transactions) {
    const m = txn.month;
    if (!monthMap.has(m)) {
      monthMap.set(m, {
        month: m,
        revenueCents: 0,
        cogsCents: 0,
        payrollCents: 0,
        opexCents: 0,
        subcategories: {
          revenue: {},
          cogs: {},
          payroll: {},
          opex: {}
        },
        transactionCounts: {
          revenue: 0,
          cogs: 0,
          payroll: 0,
          opex: 0,
          total: 0
        },
        transactionIds: []
      });
    }

    const data = monthMap.get(m);
    data.transactionCounts.total++;
    data.transactionIds.push(txn.transactionId);

    // In raw bank transactions:
    // Revenue is positive deposit. In P&L, report positive.
    // Expenses (COGS, Payroll, OpEx) are negative debits. In P&L, express as positive expense values for subtraction.
    const absCents = toCents(Math.abs(txn.amount));
    const subcat = txn.subcategory || 'General';

    switch (txn.category) {
      case ACCOUNTING_CATEGORIES.REVENUE:
        data.revenueCents += absCents;
        data.transactionCounts.revenue++;
        data.subcategories.revenue[subcat] = (data.subcategories.revenue[subcat] || 0) + absCents;
        break;

      case ACCOUNTING_CATEGORIES.COGS:
        data.cogsCents += absCents;
        data.transactionCounts.cogs++;
        data.subcategories.cogs[subcat] = (data.subcategories.cogs[subcat] || 0) + absCents;
        break;

      case ACCOUNTING_CATEGORIES.PAYROLL:
        data.payrollCents += absCents;
        data.transactionCounts.payroll++;
        data.subcategories.payroll[subcat] = (data.subcategories.payroll[subcat] || 0) + absCents;
        break;

      case ACCOUNTING_CATEGORIES.OPEX:
        data.opexCents += absCents;
        data.transactionCounts.opex++;
        data.subcategories.opex[subcat] = (data.subcategories.opex[subcat] || 0) + absCents;
        break;

      default:
        // Excluded from standard operating P&L
        break;
    }
  }

  // Format reports with integer-derived dollar amounts
  const sortedMonths = Array.from(monthMap.keys()).sort();
  const reports = sortedMonths.map((m) => {
    const d = monthMap.get(m);

    // Core financial formulas:
    // Gross Profit = Revenue - COGS
    // Operating Profit = Gross Profit - Payroll - Operating Expenses
    const grossProfitCents = d.revenueCents - d.cogsCents;
    const operatingProfitCents = grossProfitCents - d.payrollCents - d.opexCents;

    // Convert subcategories to dollars
    const formatSubcats = (subcatMap) => {
      const formatted = {};
      for (const [k, v] of Object.entries(subcatMap)) {
        formatted[k] = toDollars(v);
      }
      return formatted;
    };

    const revenue = toDollars(d.revenueCents);
    const cogs = toDollars(d.cogsCents);
    const grossProfit = toDollars(grossProfitCents);
    const payroll = toDollars(d.payrollCents);
    const opex = toDollars(d.opexCents);
    const operatingProfit = toDollars(operatingProfitCents);

    const grossMarginPct = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(2)) : 0;
    const operatingMarginPct = revenue > 0 ? Number(((operatingProfit / revenue) * 100).toFixed(2)) : 0;

    return {
      month: m,
      revenue,
      cogs,
      grossProfit,
      payroll,
      opex,
      operatingProfit,
      grossMarginPct,
      operatingMarginPct,
      subcategories: {
        revenue: formatSubcats(d.subcategories.revenue),
        cogs: formatSubcats(d.subcategories.cogs),
        payroll: formatSubcats(d.subcategories.payroll),
        opex: formatSubcats(d.subcategories.opex)
      },
      transactionCounts: d.transactionCounts,
      contributingTransactionIds: d.transactionIds
    };
  });

  return targetMonth ? (reports[0] || null) : reports;
}

/**
 * Trace a specific line item in a month to its underlying transactions
 */
export async function getPnlLineItemTransactions(month, category) {
  const query = { month, isPnlIncluded: true };
  if (category && category !== 'All') {
    query.category = category;
  }
  return await Transaction.find(query).sort({ date: 1 }).lean();
}
