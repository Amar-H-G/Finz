import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transactions = [];
let idCounter = 1;

function addTxn(date, description, amount, type, account, ref = '') {
  const id = `TXN-2025-${String(idCounter++).padStart(4, '0')}`;
  transactions.push({
    transaction_id: id,
    date,
    description,
    amount: Number(amount).toFixed(2),
    type,
    account,
    reference_number: ref || `REF-${Math.floor(100000 + Math.random() * 900000)}`
  });
}

// ------------------- JANUARY 2025 -------------------
// Revenue (~$82,000)
addTxn('2025-01-03', 'TOAST POS BATCH SETTLEMENT', 12450.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-07', 'UBER EATS DIRECT DEP RESTAURANT', 3820.50, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-10', 'TOAST POS BATCH SETTLEMENT', 14120.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-14', 'DOORDASH RESTAURANT SETTLE', 4150.25, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-17', 'TOAST POS BATCH SETTLEMENT', 13890.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-21', 'SQUARE INC EVENT DEPOSIT DUPONT', 5500.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-24', 'TOAST POS BATCH SETTLEMENT', 15200.75, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-28', 'DOORDASH RESTAURANT SETTLE', 4380.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-01-31', 'TOAST POS BATCH SETTLEMENT', 8950.00, 'Credit', 'Operating Checking *4920');

// COGS (~$26,500)
addTxn('2025-01-04', 'BALDOR SPECIALTY FOODS PRODUCE NY', -3200.50, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-06', 'SYSCO METRO NY MEAT & POULTRY', -4850.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-11', 'SEA TO TABLE FRESH FISH BROOKLYN', -2100.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-13', 'MANHATTAN BEER DISTRIBUTORS BEV', -3400.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-18', 'BALDOR SPECIALTY FOODS PRODUCE NY', -2950.25, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-20', 'SYSCO METRO NY MEAT & POULTRY', -4620.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-25', 'DAIRYLAND CHEFS WAREHOUSE DAIRY', -1850.50, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-27', 'SEA TO TABLE FRESH FISH BROOKLYN', -1980.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-30', 'MANHATTAN BEER DISTRIBUTORS BEV', -1650.00, 'Debit', 'Operating Checking *4920');

// Payroll (~$24,000)
addTxn('2025-01-15', 'GUSTO PAYROLL PE0115 NET PAY', -9850.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-15', 'GUSTO TAX SERVICES TAXES PE0115', -2150.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-31', 'GUSTO PAYROLL PE0131 NET PAY', -9780.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-31', 'GUSTO TAX SERVICES TAXES PE0131', -2220.00, 'Debit', 'Operating Checking *4920');

// Operating Expenses (~$14,500)
addTxn('2025-01-01', 'BROADWAY COMMERCIAL REALTY JAN RENT', -8500.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-05', 'CON EDISON OF NY ELEC & GAS', -1680.40, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-08', 'TOAST POS HARDWARE/SOFTWARE SUBSCRIPTION', -499.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-12', 'RESTAURANT DEPOT KITCHEN SUPPLIES', -980.35, 'Debit', 'Credit Card *8812');
addTxn('2025-01-16', 'EMPIRE LINEN COMMERCIAL CLEANING', -740.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-19', 'RESY RESERVATION SOFTWARE', -399.00, 'Debit', 'Credit Card *8812');
addTxn('2025-01-22', 'WASTE MANAGEMENT COMMERCIAL DUMPSTER', -650.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-26', 'STATE FARM BUSINESS CASUALTY INS', -850.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-29', 'META ADS RESTAURANT PROMOTION', -350.00, 'Debit', 'Credit Card *8812');

// Non-P&L / Financing / Transfers
addTxn('2025-01-02', 'CHASE BUS LOAN PMT 9931 PRINCIPAL', -1200.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-01-15', 'ONLINE TRANSFER TO SAVINGS *1102', -5000.00, 'Debit', 'Operating Checking *4920');

// ------------------- FEBRUARY 2025 -------------------
// Revenue (~$78,500 - shorter month / winter storm)
addTxn('2025-02-04', 'TOAST POS BATCH SETTLEMENT', 11800.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-07', 'UBER EATS DIRECT DEP RESTAURANT', 4200.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-11', 'TOAST POS BATCH SETTLEMENT', 13450.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-14', 'DOORDASH RESTAURANT SETTLE', 4600.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-15', 'TOAST POS VALENTINE DAY SURGE SETTLE', 18950.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-18', 'TOAST POS BATCH SETTLEMENT', 9800.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-21', 'UBER EATS DIRECT DEP RESTAURANT', 3450.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-25', 'TOAST POS BATCH SETTLEMENT', 11100.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-02-28', 'DOORDASH RESTAURANT SETTLE', 3200.00, 'Credit', 'Operating Checking *4920');

// COGS (~$31,200 - Valentine's prime meats & seafood surge)
addTxn('2025-02-02', 'BALDOR SPECIALTY FOODS PRODUCE NY', -3100.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-06', 'SYSCO METRO NY MEAT & POULTRY', -5400.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-10', 'SEA TO TABLE FRESH FISH BROOKLYN', -3850.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-12', 'DAIRYLAND CHEFS WAREHOUSE TRUFFLES & CHEESE', -2650.00, 'Debit', 'Credit Card *8812');
addTxn('2025-02-13', 'MANHATTAN BEER DISTRIBUTORS WINE SELECTION', -4200.00, 'Debit', 'Operating Checking *4920');
// Duplicate anomaly to test review queue detection
addTxn('2025-02-14', 'SYSCO METRO NY MEAT & POULTRY', -1850.00, 'Debit', 'Operating Checking *4920', 'REF-DUP001');
addTxn('2025-02-14', 'SYSCO METRO NY MEAT & POULTRY', -1850.00, 'Debit', 'Operating Checking *4920', 'REF-DUP002');
addTxn('2025-02-19', 'BALDOR SPECIALTY FOODS PRODUCE NY', -3250.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-23', 'SEA TO TABLE FRESH FISH BROOKLYN', -2900.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-27', 'MANHATTAN BEER DISTRIBUTORS BEV', -2150.00, 'Debit', 'Operating Checking *4920');

// Payroll (~$24,100)
addTxn('2025-02-14', 'GUSTO PAYROLL PE0214 NET PAY', -9900.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-14', 'GUSTO TAX SERVICES TAXES PE0214', -2180.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-28', 'GUSTO PAYROLL PE0228 NET PAY', -9820.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-28', 'GUSTO TAX SERVICES TAXES PE0228', -2200.00, 'Debit', 'Operating Checking *4920');

// Operating Expenses (~$16,200 - heating surge & repairs)
addTxn('2025-02-01', 'BROADWAY COMMERCIAL REALTY FEB RENT', -8500.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-05', 'CON EDISON OF NY ELEC & GAS SUB-ZERO SPIKE', -2850.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-08', 'TOAST POS HARDWARE/SOFTWARE SUBSCRIPTION', -499.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-11', 'EMPIRE HVAC RESTAURANT BOILER REPAIR EMERGENCY', -1450.00, 'Debit', 'Credit Card *8812');
addTxn('2025-02-15', 'EMPIRE LINEN COMMERCIAL CLEANING', -780.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-18', 'RESY RESERVATION SOFTWARE', -399.00, 'Debit', 'Credit Card *8812');
addTxn('2025-02-21', 'RESTAURANT DEPOT CHEMICALS & SANITIZER', -640.00, 'Debit', 'Credit Card *8812');
addTxn('2025-02-25', 'WASTE MANAGEMENT COMMERCIAL DUMPSTER', -650.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-26', 'STATE FARM BUSINESS CASUALTY INS', -850.00, 'Debit', 'Operating Checking *4920');

// Uncertain / Flagged items for AI & Human Review
addTxn('2025-02-16', 'VENMO PAYMENT - J. SMITH DINNER SETTLE', -420.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-02-22', 'AMAZON.COM*MKTPLACE SEATTLE WA', -530.00, 'Debit', 'Credit Card *8812');
addTxn('2025-02-24', 'ATM CASH WITHDRAWAL CHASE 14TH ST NY', -500.00, 'Debit', 'Operating Checking *4920');

// Non-P&L
addTxn('2025-02-03', 'CHASE BUS LOAN PMT 9931 PRINCIPAL', -1200.00, 'Debit', 'Operating Checking *4920');

// ------------------- MARCH 2025 -------------------
// Revenue (~$104,200 - Spring opening, NYC Restaurant Week, St. Patrick's)
addTxn('2025-03-04', 'TOAST POS BATCH SETTLEMENT', 14500.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-07', 'UBER EATS DIRECT DEP RESTAURANT', 4950.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-11', 'TOAST POS BATCH SETTLEMENT', 16200.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-15', 'DOORDASH RESTAURANT SETTLE', 5400.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-17', 'TOAST POS ST PATRICK WEEKEND SETTLE', 21400.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-21', 'SQUARE INC PRIVATE EVENT SPRING GALA', 11500.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-25', 'TOAST POS BATCH SETTLEMENT', 16800.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-28', 'DOORDASH RESTAURANT SETTLE', 5250.00, 'Credit', 'Operating Checking *4920');
addTxn('2025-03-31', 'TOAST POS BATCH SETTLEMENT', 8200.00, 'Credit', 'Operating Checking *4920');

// COGS (~$33,400)
addTxn('2025-03-03', 'BALDOR SPECIALTY FOODS PRODUCE NY', -3600.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-06', 'SYSCO METRO NY MEAT & POULTRY', -5900.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-10', 'SEA TO TABLE FRESH FISH BROOKLYN', -3400.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-13', 'MANHATTAN BEER DISTRIBUTORS KEGS & CRAFT', -5600.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-18', 'BALDOR SPECIALTY FOODS PRODUCE NY', -3900.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-20', 'SYSCO METRO NY MEAT & POULTRY', -5200.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-24', 'DAIRYLAND CHEFS WAREHOUSE DAIRY & CHEESE', -2100.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-27', 'SEA TO TABLE FRESH FISH BROOKLYN', -2500.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-30', 'MANHATTAN BEER DISTRIBUTORS BEV', -1200.00, 'Debit', 'Operating Checking *4920');

// Payroll (~$27,800 - Extra shifts & hiring for patio opening)
addTxn('2025-03-14', 'GUSTO PAYROLL PE0314 NET PAY', -11400.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-14', 'GUSTO TAX SERVICES TAXES PE0314', -2500.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-28', 'GUSTO PAYROLL PE0328 NET PAY', -11350.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-28', 'GUSTO TAX SERVICES TAXES PE0328', -2550.00, 'Debit', 'Operating Checking *4920');

// Operating Expenses (~$15,600)
addTxn('2025-03-01', 'BROADWAY COMMERCIAL REALTY MAR RENT', -8500.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-05', 'CON EDISON OF NY ELEC & GAS', -1780.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-08', 'TOAST POS HARDWARE/SOFTWARE SUBSCRIPTION', -499.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-12', 'RESTAURANT DEPOT PATIO FURNITURE & MENUS', -1520.00, 'Debit', 'Credit Card *8812');
addTxn('2025-03-16', 'EMPIRE LINEN COMMERCIAL CLEANING', -810.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-19', 'RESY RESERVATION SOFTWARE', -399.00, 'Debit', 'Credit Card *8812');
addTxn('2025-03-22', 'WASTE MANAGEMENT COMMERCIAL DUMPSTER', -650.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-26', 'STATE FARM BUSINESS CASUALTY INS', -850.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-29', 'NYC DOHMH RESTAURANT PERMIT RENEWAL FEE', -680.00, 'Debit', 'Operating Checking *4920');

// Non-P&L / Financing
addTxn('2025-03-02', 'CHASE BUS LOAN PMT 9931 PRINCIPAL', -1200.00, 'Debit', 'Operating Checking *4920');
addTxn('2025-03-15', 'MEMBER EQUITY CONTRIBUTION - PARTNER A', 25000.00, 'Credit', 'Operating Checking *4920');

// Generate CSV
const headers = ['transaction_id', 'date', 'description', 'amount', 'type', 'account', 'reference_number'];
const rows = transactions.map(t => [
  t.transaction_id,
  t.date,
  `"${t.description.replace(/"/g, '""')}"`,
  t.amount,
  t.type,
  `"${t.account}"`,
  t.reference_number
].join(','));

const csvContent = [headers.join(','), ...rows].join('\n');
const outputPath = path.join(__dirname, 'nyc_restaurant_co_transactions.csv');
fs.writeFileSync(outputPath, csvContent);
console.log(`Generated ${transactions.length} transactions at ${outputPath}`);
