import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Transaction } from '../src/models/Transaction.js';
import { calculateMonthlyPnl, toCents, toDollars } from '../src/services/financial/pnlEngine.js';
import { classifyWithRules } from '../src/services/categorization/rulesEngine.js';
import { computePeriodVariance } from '../src/services/variance/varianceEngine.js';
import { correctTransactionClassification, resolveReviewItem } from '../src/services/review/reviewService.js';
import { parseAndIngestCSV } from '../src/services/ingestion/csvParser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('1. Categorization Rules Engine', () => {
  test('Classifies Toast POS settlements as Revenue', () => {
    const res = classifyWithRules('TOAST POS BATCH SETTLEMENT DEP', 12400);
    assert.equal(res.category, 'Revenue');
    assert.equal(res.subcategory, 'POS Sales');
    assert.equal(res.isPnlIncluded, true);
  });

  test('Classifies Baldor Produce as COGS', () => {
    const res = classifyWithRules('BALDOR SPECIALTY FOODS PRODUCE NY', -3200);
    assert.equal(res.category, 'Cost of Goods Sold');
    assert.equal(res.subcategory, 'Produce');
    assert.equal(res.isPnlIncluded, true);
  });

  test('Classifies Gusto payroll as Payroll', () => {
    const res = classifyWithRules('GUSTO PAYROLL PE0115 NET PAY', -9850);
    assert.equal(res.category, 'Payroll');
    assert.equal(res.subcategory, 'Net Wages');
    assert.equal(res.isPnlIncluded, true);
  });

  test('Classifies Commercial Rent and ConEd as OpEx', () => {
    const rent = classifyWithRules('BROADWAY COMMERCIAL REALTY JAN RENT', -8500);
    assert.equal(rent.category, 'Operating Expenses');
    assert.equal(rent.subcategory, 'Rent & Occupancy');

    const conEd = classifyWithRules('CON EDISON OF NY ELEC & GAS', -1680);
    assert.equal(conEd.category, 'Operating Expenses');
    assert.equal(conEd.subcategory, 'Utilities');
  });

  test('Excludes Internal Transfers & Loan Principal from P&L', () => {
    const xfer = classifyWithRules('ONLINE TRANSFER TO SAVINGS *1102', -5000);
    assert.equal(xfer.category, 'Non-P&L');
    assert.equal(xfer.isPnlIncluded, false);

    const loan = classifyWithRules('CHASE BUS LOAN PMT 9931 PRINCIPAL', -1200);
    assert.equal(loan.category, 'Non-P&L');
    assert.equal(loan.isPnlIncluded, false);
  });

  test('Flags cash withdrawals and ambiguous transactions for review', () => {
    const atm = classifyWithRules('ATM CASH WITHDRAWAL CHASE 14TH ST NY', -500);
    assert.equal(atm.reviewStatus, 'Pending Review');

    const venmo = classifyWithRules('VENMO PAYMENT - J. SMITH DINNER SETTLE', -420);
    assert.equal(venmo.reviewStatus, 'Pending Review');
  });
});

describe('2. Ingestion & Duplicate Handling', () => {
  test('Ingests realistic NYC Restaurant CSV dataset and flags duplicates', async () => {
    const csvPath = path.resolve(__dirname, '../../data/nyc_restaurant_co_transactions.csv');
    const result = await parseAndIngestCSV(csvPath, 'nyc_restaurant_co_transactions.csv');

    assert.equal(result.totalRowsProcessed, 102);
    assert.ok(result.importedCount > 90);
    assert.equal(result.failedRowsCount, 0);

    // Verify duplicate flag on the intentional Sysco duplicate
    const dupes = await Transaction.find({ reviewReason: 'Potential duplicate charge detected' });
    assert.ok(dupes.length >= 2, 'Should flag duplicate charges for review');
  });
});

describe('3. Deterministic Financial P&L Engine', () => {
  test('Prevents floating point errors with minor-unit arithmetic', () => {
    assert.equal(toCents(19.99), 1999);
    assert.equal(toDollars(1999), 19.99);
    // Standard JS 0.1 + 0.2 = 0.30000000000000004
    const sumCents = toCents(0.1) + toCents(0.2);
    assert.equal(toDollars(sumCents), 0.30);
  });

  test('Calculates monthly P&L accurately with Gross Profit & Operating Profit formulas', async () => {
    const pnlList = await calculateMonthlyPnl();
    assert.ok(pnlList.length >= 3, 'Should have reports for Jan, Feb, Mar 2025');

    const jan = pnlList.find(p => p.month === '2025-01');
    assert.ok(jan, 'January 2025 report should exist');
    assert.ok(jan.revenue > 80000, 'Revenue should be around $80k+');
    assert.ok(jan.cogs > 20000, 'COGS should be around $20k+');

    // Test exact formula: Gross Profit = Revenue - COGS
    const expectedGP = Number((jan.revenue - jan.cogs).toFixed(2));
    assert.equal(jan.grossProfit, expectedGP);

    // Test exact formula: Operating Profit = Gross Profit - Payroll - OpEx
    const expectedOP = Number((jan.grossProfit - jan.payroll - jan.opex).toFixed(2));
    assert.equal(jan.operatingProfit, expectedOP);
  });
});

describe('4. Variance Engine', () => {
  test('Identifies material variances between Feb and Mar 2025', async () => {
    const variance = await computePeriodVariance('2025-02', '2025-03');
    assert.equal(variance.priorMonth, '2025-02');
    assert.equal(variance.currentMonth, '2025-03');

    const revVar = variance.variances.find(v => v.key === 'revenue');
    assert.ok(revVar, 'Revenue variance should be computed');
    assert.equal(revVar.isMaterial, true, 'Revenue increase should be material');
    assert.ok(revVar.absoluteChange > 0, 'Revenue increased in March');
    assert.ok(revVar.drivers.length > 0, 'Should include vendor-level drivers');
  });
});

describe('5. Review Queue & Audit Trail', () => {
  test('Allows user to correct a category, updates audit trail, and persists change', async () => {
    // Find an item needing review
    const pendingTxn = await Transaction.findOne({ reviewStatus: 'Pending Review' });
    assert.ok(pendingTxn, 'Should have a pending review transaction');

    const updated = await correctTransactionClassification(pendingTxn.transactionId, {
      newCategory: 'Cost of Goods Sold',
      newSubcategory: 'Produce',
      notes: 'Verified receipt: Baldor emergency local delivery',
      actor: 'Chief Financial Officer'
    });

    assert.equal(updated.category, 'Cost of Goods Sold');
    assert.equal(updated.reviewStatus, 'Resolved');
    assert.equal(updated.auditTrail.length, 1);
    assert.equal(updated.auditTrail[0].changedBy, 'Chief Financial Officer');

    // Confirm persisted in database
    const inDb = await Transaction.findOne({ transactionId: pendingTxn.transactionId });
    assert.equal(inDb.category, 'Cost of Goods Sold');
    assert.equal(inDb.reviewStatus, 'Resolved');
  });
});
