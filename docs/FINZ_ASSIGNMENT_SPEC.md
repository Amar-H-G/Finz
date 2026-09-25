# Finz AI-Native Financial Review Platform
## Software Engineering Internship Technical Challenge Specification

### Overview
Finz builds AI-native financial review tooling that ingests raw bank and credit card transactions for small-to-medium businesses (SMBs), normalizes them, categorizes them with an explainable hybrid rules/AI pipeline, calculates verified monthly Profit & Loss (P&L) statements, flags material month-over-month variances, and provides an explainable AI Financial Analyst assistant with transaction-level traceability.

### Target Client: NYC Restaurant Co.
NYC Restaurant Co. operates a popular downtown Manhattan dining establishment. Their transaction volume includes:
- **Revenue**: Point of Sale (Toast, Square), Delivery platforms (DoorDash, UberEats), Private Dining & Events.
- **Cost of Goods Sold (COGS)**: Produce, Meats, Seafood, Dairy, Beverage suppliers (Sysco, Baldor, Sea to Table, Chef's Warehouse).
- **Payroll**: Bi-weekly payroll processing (Gusto, ADP), Payroll tax distributions.
- **Operating Expenses (OpEx)**: Commercial Kitchen Rent, ConEdison Utilities, Kitchen Linen Cleaning, SaaS tools (Toast POS, Resy, 7shifts), General Supplies.
- **Non-P&L Activities**: Bank Transfers, Loan Principal, Owner Equity Injections.
- **Flagged & Ambiguous Items**: Unlabeled Venmo reimbursements, duplicate supplier charges, uncategorized retail purchases.

### P&L Accounting Rules & Conventions
1. **Gross Profit** = `Revenue - Cost of Goods Sold (COGS)`
2. **Operating Profit (EBITDA proxy)** = `Gross Profit - Payroll - Operating Expenses`
3. **P&L Inclusions**:
   - `Revenue`: Positive inflows from sales
   - `Cost of Goods Sold`: Direct ingredient/food/beverage costs
   - `Payroll`: Wages, contractor pay, payroll taxes
   - `Operating Expenses`: Rent, utilities, software, supplies, maintenance, marketing
4. **P&L Exclusions (Non-P&L)**:
   - Internal account transfers
   - Owner draws / capital contributions
   - Loan principal disbursements / repayments
5. **Sign Convention**:
   - In raw bank feed: Inflows are positive (+) or designated as credit; outflows are negative (-) or designated as debit.
   - In P&L presentation: Revenue and expenses are represented as positive absolute figures, with gross profit and operating profit calculated via subtraction.
6. **Materiality Threshold**:
   - Variances are flagged as material if the absolute dollar change is >= $1,000 AND the relative percentage change is >= 15%, or if any single category changes by > $5,000 regardless of percentage.
