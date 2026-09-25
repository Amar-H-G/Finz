/**
 * Financial & Accounting Constants for Finz Platform
 */

export const ACCOUNTING_CATEGORIES = {
  REVENUE: 'Revenue',
  COGS: 'Cost of Goods Sold',
  PAYROLL: 'Payroll',
  OPEX: 'Operating Expenses',
  NON_PNL: 'Non-P&L'
};

export const ALLOWED_CATEGORIES = Object.values(ACCOUNTING_CATEGORIES);

export const SUBCATEGORIES = {
  [ACCOUNTING_CATEGORIES.REVENUE]: [
    'POS Sales',
    'Delivery Platforms',
    'Private Events & Catering',
    'Other Revenue'
  ],
  [ACCOUNTING_CATEGORIES.COGS]: [
    'Produce',
    'Meat & Poultry',
    'Seafood',
    'Dairy & Specialty',
    'Beverage & Alcohol'
  ],
  [ACCOUNTING_CATEGORIES.PAYROLL]: [
    'Net Wages',
    'Payroll Taxes',
    'Contractor Pay'
  ],
  [ACCOUNTING_CATEGORIES.OPEX]: [
    'Rent & Occupancy',
    'Utilities',
    'SaaS & Software',
    'Supplies & Equipment',
    'Cleaning & Maintenance',
    'Insurance & Legal',
    'Marketing & Advertising'
  ],
  [ACCOUNTING_CATEGORIES.NON_PNL]: [
    'Owner Equity / Contributions',
    'Owner Draws',
    'Internal Transfers',
    'Loan Principal & Financing'
  ]
};

export const CLASSIFICATION_METHODS = {
  RULE: 'Rule-Based',
  AI: 'AI-Suggested',
  MANUAL: 'User-Corrected'
};

export const REVIEW_STATUSES = {
  NOT_REQUIRED: 'Not Required',
  PENDING: 'Pending Review',
  RESOLVED: 'Resolved'
};

export const REVIEW_REASONS = {
  POTENTIAL_DUPLICATE: 'Potential duplicate charge detected',
  AMBIGUOUS_DESCRIPTION: 'Ambiguous or unfamiliar transaction description',
  UNUSUAL_AMOUNT: 'Outlier transaction amount for category',
  CASH_ACTIVITY: 'Cash or ATM withdrawal requiring receipt',
  LOW_CONFIDENCE_AI: 'Low confidence AI classification'
};

export const MATERIALITY_CONFIG = {
  MIN_DOLLAR_CHANGE: 1000,   // $1,000 threshold
  MIN_PERCENT_CHANGE: 15,    // 15% threshold
  CRITICAL_DOLLAR_CHANGE: 5000 // Flag any shift > $5k regardless of %
};
