import {
  ACCOUNTING_CATEGORIES,
  CLASSIFICATION_METHODS,
  REVIEW_STATUSES,
  REVIEW_REASONS
} from '../../config/constants.js';

/**
 * Deterministic Categorization Rules Table
 * High-confidence pattern matching for known restaurant vendors & descriptions
 */
const RULES = [
  // ------------------- REVENUE -------------------
  {
    regex: /toast\s+pos/i,
    category: ACCOUNTING_CATEGORIES.REVENUE,
    subcategory: 'POS Sales',
    confidence: 0.99,
    rationale: 'Recognized Toast POS merchant settlement'
  },
  {
    regex: /square\s+inc/i,
    category: ACCOUNTING_CATEGORIES.REVENUE,
    subcategory: 'Private Events & Catering',
    confidence: 0.98,
    rationale: 'Square merchant invoice / catering settlement'
  },
  {
    regex: /uber\s*eats/i,
    category: ACCOUNTING_CATEGORIES.REVENUE,
    subcategory: 'Delivery Platforms',
    confidence: 0.99,
    rationale: 'Third-party delivery platform deposit (Uber Eats)'
  },
  {
    regex: /doordash/i,
    category: ACCOUNTING_CATEGORIES.REVENUE,
    subcategory: 'Delivery Platforms',
    confidence: 0.99,
    rationale: 'Third-party delivery platform settlement (DoorDash)'
  },

  // ------------------- COST OF GOODS SOLD -------------------
  {
    regex: /baldor\s+specialty/i,
    category: ACCOUNTING_CATEGORIES.COGS,
    subcategory: 'Produce',
    confidence: 0.98,
    rationale: 'Wholesale fresh produce supplier (Baldor Foods)'
  },
  {
    regex: /sysco/i,
    category: ACCOUNTING_CATEGORIES.COGS,
    subcategory: 'Meat & Poultry',
    confidence: 0.98,
    rationale: 'Primary broadline food distributor (Sysco)'
  },
  {
    regex: /sea\s+to\s+table/i,
    category: ACCOUNTING_CATEGORIES.COGS,
    subcategory: 'Seafood',
    confidence: 0.99,
    rationale: 'Sustainable wild fish supplier (Sea to Table)'
  },
  {
    regex: /manhattan\s+beer/i,
    category: ACCOUNTING_CATEGORIES.COGS,
    subcategory: 'Beverage & Alcohol',
    confidence: 0.99,
    rationale: 'Licensed beverage & beer distributor'
  },
  {
    regex: /dairyland|chefs\s+warehouse/i,
    category: ACCOUNTING_CATEGORIES.COGS,
    subcategory: 'Dairy & Specialty',
    confidence: 0.98,
    rationale: 'Specialty dairy, artisanal cheese & pantry supplier'
  },

  // ------------------- PAYROLL -------------------
  {
    regex: /gusto\s+payroll/i,
    category: ACCOUNTING_CATEGORIES.PAYROLL,
    subcategory: 'Net Wages',
    confidence: 0.99,
    rationale: 'Gusto direct deposit employee net pay run'
  },
  {
    regex: /gusto\s+tax/i,
    category: ACCOUNTING_CATEGORIES.PAYROLL,
    subcategory: 'Payroll Taxes',
    confidence: 0.99,
    rationale: 'Gusto automated employer payroll tax liability remittance'
  },
  {
    regex: /adp|paychex/i,
    category: ACCOUNTING_CATEGORIES.PAYROLL,
    subcategory: 'Net Wages',
    confidence: 0.95,
    rationale: 'Recognized payroll processing provider'
  },

  // ------------------- OPERATING EXPENSES -------------------
  {
    regex: /broadway\s+commercial|realty|rent/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Rent & Occupancy',
    confidence: 0.98,
    rationale: 'Commercial lease base rent payment'
  },
  {
    regex: /con\s+edison|national\s+grid|electric/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Utilities',
    confidence: 0.99,
    rationale: 'Commercial electric & gas utility provider'
  },
  {
    regex: /toast\s+pos\s+hardware|subscription/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'SaaS & Software',
    confidence: 0.98,
    rationale: 'Restaurant POS software SaaS subscription'
  },
  {
    regex: /resy|opentable|7shifts/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'SaaS & Software',
    confidence: 0.99,
    rationale: 'Table reservation / shift scheduling SaaS platform'
  },
  {
    regex: /restaurant\s+depot/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Supplies & Equipment',
    confidence: 0.90,
    rationale: 'Kitchen smallwares, disposables and cleaning supplies'
  },
  {
    regex: /empire\s+(linen|cleaners)/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Cleaning & Maintenance',
    confidence: 0.98,
    rationale: 'Linen laundering, bar aprons and floor mat service'
  },
  {
    regex: /hvac|plumbing|boiler\s+repair/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Cleaning & Maintenance',
    confidence: 0.95,
    rationale: 'Kitchen equipment repair & facility maintenance'
  },
  {
    regex: /waste\s+management/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Utilities',
    confidence: 0.99,
    rationale: 'Commercial grease trap & dumpster sanitation'
  },
  {
    regex: /state\s+farm|insurance/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Insurance & Legal',
    confidence: 0.98,
    rationale: 'Commercial general liability & property policy'
  },
  {
    regex: /meta\s+ads|google\s+ads/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Marketing & Advertising',
    confidence: 0.95,
    rationale: 'Digital guest acquisition and social marketing'
  },
  {
    regex: /dohmh|permit|license/i,
    category: ACCOUNTING_CATEGORIES.OPEX,
    subcategory: 'Insurance & Legal',
    confidence: 0.95,
    rationale: 'Municipal health inspection fee / beverage license'
  },

  // ------------------- NON-P&L (Balance Sheet / Financing) -------------------
  {
    regex: /loan\s+pmt.*principal|sba\s+loan/i,
    category: ACCOUNTING_CATEGORIES.NON_PNL,
    subcategory: 'Loan Principal & Financing',
    confidence: 0.99,
    rationale: 'Debt financing liability repayment (excluded from P&L)'
  },
  {
    regex: /transfer\s+to|transfer\s+from/i,
    category: ACCOUNTING_CATEGORIES.NON_PNL,
    subcategory: 'Internal Transfers',
    confidence: 0.98,
    rationale: 'Inter-account liquidity rebalancing (excluded from P&L)'
  },
  {
    regex: /member\s+equity|capital\s+contribution/i,
    category: ACCOUNTING_CATEGORIES.NON_PNL,
    subcategory: 'Owner Equity / Contributions',
    confidence: 0.99,
    rationale: 'Partner capital injection (equity transaction, excluded from P&L)'
  }
];

/**
 * Classify a transaction using deterministic patterns
 */
export function classifyWithRules(description, amount) {
  if (!description) return null;

  for (const rule of RULES) {
    if (rule.regex.test(description)) {
      const isPnl = rule.category !== ACCOUNTING_CATEGORIES.NON_PNL;
      return {
        category: rule.category,
        subcategory: rule.subcategory,
        classificationMethod: CLASSIFICATION_METHODS.RULE,
        confidence: rule.confidence,
        rationale: rule.rationale,
        isPnlIncluded: isPnl,
        reviewStatus: REVIEW_STATUSES.NOT_REQUIRED,
        reviewReason: ''
      };
    }
  }

  // Check for review-triggering patterns:
  // Cash withdrawals
  if (/atm\s+|cash\s+withdrawal/i.test(description)) {
    return {
      category: ACCOUNTING_CATEGORIES.OPEX,
      subcategory: 'Supplies & Equipment',
      classificationMethod: CLASSIFICATION_METHODS.RULE,
      confidence: 0.40,
      rationale: 'Cash ATM withdrawal requires physical receipt documentation',
      isPnlIncluded: true,
      reviewStatus: REVIEW_STATUSES.PENDING,
      reviewReason: REVIEW_REASONS.CASH_ACTIVITY
    };
  }

  // Venmo / P2P
  if (/venmo|zelle|cashapp/i.test(description)) {
    return {
      category: ACCOUNTING_CATEGORIES.OPEX,
      subcategory: 'Other OpEx',
      classificationMethod: CLASSIFICATION_METHODS.RULE,
      confidence: 0.45,
      rationale: 'Peer-to-peer disbursement requires business purpose substantiation',
      isPnlIncluded: true,
      reviewStatus: REVIEW_STATUSES.PENDING,
      reviewReason: REVIEW_REASONS.AMBIGUOUS_DESCRIPTION
    };
  }

  // Ambiguous retail
  if (/amazon/i.test(description)) {
    return {
      category: ACCOUNTING_CATEGORIES.OPEX,
      subcategory: 'Supplies & Equipment',
      classificationMethod: CLASSIFICATION_METHODS.RULE,
      confidence: 0.50,
      rationale: 'Unspecified Amazon marketplace charge — verify kitchen vs personal expense',
      isPnlIncluded: true,
      reviewStatus: REVIEW_STATUSES.PENDING,
      reviewReason: REVIEW_REASONS.AMBIGUOUS_DESCRIPTION
    };
  }

  return null;
}
