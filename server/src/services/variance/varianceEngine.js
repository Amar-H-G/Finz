import { calculateMonthlyPnl, toDollars, toCents } from '../financial/pnlEngine.js';
import { Transaction } from '../../models/Transaction.js';
import { MATERIALITY_CONFIG, ACCOUNTING_CATEGORIES } from '../../config/constants.js';

/**
 * Compare two months and compute deterministic variances with driver breakdowns
 */
export async function computePeriodVariance(priorMonth, currentMonth, options = {}) {
  const minDollar = options.minDollarChange || MATERIALITY_CONFIG.MIN_DOLLAR_CHANGE;
  const minPct = options.minPercentChange || MATERIALITY_CONFIG.MIN_PERCENT_CHANGE;
  const criticalDollar = options.criticalDollarChange || MATERIALITY_CONFIG.CRITICAL_DOLLAR_CHANGE;

  const priorReport = await calculateMonthlyPnl(priorMonth);
  const currentReport = await calculateMonthlyPnl(currentMonth);

  if (!priorReport || !currentReport) {
    throw new Error(`Insufficient data for period comparison between ${priorMonth} and ${currentMonth}`);
  }

  const lineItems = [
    { key: 'revenue', label: 'Revenue', category: ACCOUNTING_CATEGORIES.REVENUE },
    { key: 'cogs', label: 'Cost of Goods Sold', category: ACCOUNTING_CATEGORIES.COGS },
    { key: 'grossProfit', label: 'Gross Profit', derived: true },
    { key: 'payroll', label: 'Payroll', category: ACCOUNTING_CATEGORIES.PAYROLL },
    { key: 'opex', label: 'Operating Expenses', category: ACCOUNTING_CATEGORIES.OPEX },
    { key: 'operatingProfit', label: 'Operating Profit', derived: true }
  ];

  const variances = [];

  for (const item of lineItems) {
    const priorAmt = priorReport[item.key] || 0;
    const currentAmt = currentReport[item.key] || 0;

    const diffDollars = toDollars(toCents(currentAmt) - toCents(priorAmt));
    const absDiff = Math.abs(diffDollars);

    let percentChange = null;
    if (priorAmt !== 0) {
      percentChange = Number(((diffDollars / Math.abs(priorAmt)) * 100).toFixed(2));
    }

    // Materiality determination rule
    const isMaterial = (absDiff >= minDollar && (percentChange === null || Math.abs(percentChange) >= minPct)) ||
                       (absDiff >= criticalDollar);

    // Retrieve underlying driver transactions if material and not a pure derived total
    let drivers = [];
    if (item.category) {
      drivers = await getCategoryDrivers(priorMonth, currentMonth, item.category);
    }

    variances.push({
      lineItem: item.label,
      key: item.key,
      category: item.category || 'Summary',
      priorPeriod: priorMonth,
      priorAmount: priorAmt,
      currentPeriod: currentMonth,
      currentAmount: currentAmt,
      absoluteChange: diffDollars,
      percentChange,
      isMaterial,
      materialityCriteria: `Dollar change >= $${minDollar.toLocaleString()} and % change >= ${minPct}%, or shift >= $${criticalDollar.toLocaleString()}`,
      drivers
    });
  }

  return {
    priorMonth,
    currentMonth,
    thresholds: { minDollar, minPct, criticalDollar },
    variances
  };
}

/**
 * Identify vendor-level and subcategory-level drivers behind a category variance
 */
async function getCategoryDrivers(priorMonth, currentMonth, category) {
  const [priorTxns, currentTxns] = await Promise.all([
    Transaction.find({ month: priorMonth, category, isPnlIncluded: true }).lean(),
    Transaction.find({ month: currentMonth, category, isPnlIncluded: true }).lean()
  ]);

  const priorVendorMap = new Map();
  for (const t of priorTxns) {
    const vendor = normalizeVendorName(t.description);
    priorVendorMap.set(vendor, (priorVendorMap.get(vendor) || 0) + toCents(Math.abs(t.amount)));
  }

  const currentVendorMap = new Map();
  for (const t of currentTxns) {
    const vendor = normalizeVendorName(t.description);
    currentVendorMap.set(vendor, (currentVendorMap.get(vendor) || 0) + toCents(Math.abs(t.amount)));
  }

  const allVendors = new Set([...priorVendorMap.keys(), ...currentVendorMap.keys()]);
  const vendorDrivers = [];

  for (const vendor of allVendors) {
    const pCents = priorVendorMap.get(vendor) || 0;
    const cCents = currentVendorMap.get(vendor) || 0;
    const diffCents = cCents - pCents;

    if (Math.abs(diffCents) > 10000) { // Shifts > $100
      vendorDrivers.push({
        vendor,
        priorAmount: toDollars(pCents),
        currentAmount: toDollars(cCents),
        changeAmount: toDollars(diffCents),
        percentChange: pCents > 0 ? Number(((diffCents / pCents) * 100).toFixed(1)) : null
      });
    }
  }

  // Sort by largest absolute impact
  return vendorDrivers.sort((a, b) => Math.abs(b.changeAmount) - Math.abs(a.changeAmount));
}

function normalizeVendorName(desc) {
  if (!desc) return 'Unknown';
  if (/toast/i.test(desc)) return 'Toast POS';
  if (/square/i.test(desc)) return 'Square Inc';
  if (/uber\s*eats/i.test(desc)) return 'Uber Eats';
  if (/doordash/i.test(desc)) return 'DoorDash';
  if (/sysco/i.test(desc)) return 'Sysco Metro NY';
  if (/baldor/i.test(desc)) return 'Baldor Specialty Foods';
  if (/sea\s+to\s+table/i.test(desc)) return 'Sea to Table Seafood';
  if (/manhattan\s+beer/i.test(desc)) return 'Manhattan Beer Distributors';
  if (/gusto/i.test(desc)) return 'Gusto Payroll';
  if (/broadway\s+commercial/i.test(desc)) return 'Broadway Realty Rent';
  if (/con\s+edison/i.test(desc)) return 'Con Edison Utilities';
  if (/resy/i.test(desc)) return 'Resy Software';
  if (/restaurant\s+depot/i.test(desc)) return 'Restaurant Depot';
  return desc.split(/\s+/).slice(0, 3).join(' ');
}
