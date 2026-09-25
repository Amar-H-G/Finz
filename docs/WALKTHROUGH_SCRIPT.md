# Technical Walkthrough & Live Demo Script
## Finz AI-Native Financial Review Platform

Use this step-by-step demonstration script for live coding sessions, interview evaluations, or video submissions.

---

### Step 1: Ingestion & Bank Statement Normalization
1. Navigate to **Data Import** (`/import`).
2. Click **"Load Verified NYC Restaurant Co. Dataset"** (or upload `nyc_restaurant_co_transactions.csv`).
3. Point out the Ingestion Summary card:
   - 102 transactions processed across Jan – Mar 2025.
   - Duplicate charge detected: Sysco Metro NY charged twice ($1,850.00 each) on 2025-02-14.
   - Non-P&L items separated (Partner equity contribution +$25k, SBA loan repayments).

---

### Step 2: Deterministic P&L Calculation Engine
1. Navigate to **P&L Statement** (`/pnl`).
2. Demonstrate GAAP compliance and exact minor-unit cents arithmetic:
   - **January 2025**:
     * Revenue: `$83,461.50`
     * COGS: `$26,901.25`
     * Gross Profit: `$56,560.25` (Gross Margin: 67.77%)
     * Operating Profit: `$17,390.50`
   - Point out that Gross Profit equals `Revenue - COGS` to the penny with zero floating-point accumulation drift.
3. Click any number in the table (e.g. `$26,901.25` under COGS) to open the **Contributing Transactions Modal**. Show that each total is traceable to specific vendor invoices (Baldor, Sysco, Sea to Table, Manhattan Beer).

---

### Step 3: Period-over-Period Variance & Vendor Driver Attribution
1. Navigate to **Variance Analysis** (`/variance`).
2. Select **Prior Period**: `2025-02`, **Current Period**: `2025-03`.
3. Point out the detected **Material Variances**:
   - **Revenue**: Increased by `+$25,750.00` (+32.8%) due to St. Patrick's Day surge and Spring Gala catering.
   - **Payroll**: Increased by `+$3,700.00` (+15.35%) due to patio staffing.
4. Expand the **Drivers** button on any line item to reveal the exact vendor-level breakdown (e.g., Baldor, Toast POS, Square Inc).

---

### Step 4: Human-in-the-Loop Review Queue & Audit Trail
1. Navigate to **Review Queue** (`/review`).
2. Note the pending review items flagged by the hybrid classification pipeline:
   - Duplicate charge flag: `SYSCO METRO NY`
   - Cash outlay flag: `ATM CASH WITHDRAWAL CHASE 14TH ST NY` ($500.00)
   - Ambiguous description flag: `VENMO PAYMENT - J. SMITH DINNER SETTLE` ($420.00)
3. Click **"Correct Category"** on the Venmo transaction.
   - Change category from `Operating Expenses` to `Cost of Goods Sold` (or vice versa).
   - Enter reason: *"Reimbursement for local specialty kitchen ingredient purchase"*.
   - Click **"Apply Correction"**.
4. Show that the item moves to **Resolved History** with an immutable audit entry recording who changed it, the previous state, new state, and timestamp.
5. Return to `/pnl` to demonstrate that the P&L statement immediately recomputed to reflect the updated classification.

---

### Step 5: Grounded AI Financial Analyst
1. Navigate to **AI Analyst** (`/analyst`).
2. Click the suggested question: **"What was our revenue in March?"**
   - The analyst provides the exact verified revenue (`$104,250.00`), the contributing deposit channels (Toast POS settlements and Square Private Event Gala), and displays supporting transaction evidence cards.
3. Ask a comparative question: **"Why did operating profit change between February and March?"**
   - The analyst compares the two periods using the deterministic variance engine, highlighting the revenue growth against increased payroll and food costs.
4. Click any transaction card inside the AI response to open the **Transaction Inspector Drawer** and trace the AI's explanation back to the raw bank ledger row.

---

### Step 6: Automated Test Verification
Run the automated test suite in terminal:
```bash
npm run test
```
Show the 11/11 passing tests verifying rules, CSV ingestion, math precision, P&L formulas, and audit persistence.
