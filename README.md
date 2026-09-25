# Finz AI-Native Financial Review Platform
### Senior Full-Stack Engineering MVP & Technical Challenge Submission

Finz transforms raw bank transactions into an explainable, auditable, and deterministic financial review for small-to-medium businesses. Built specifically for **NYC Restaurant Co.**, a downtown Manhattan dining establishment.

---

## 🌟 Key Capabilities

1. **Intelligent Bank Ingestion**: Uploads CSV bank statements with schema validation, normalization, and duplicate charge detection.
2. **Deterministic Financial Engine**: Computes GAAP-aligned monthly P&L statements (Revenue, COGS, Gross Profit, Payroll, OpEx, Operating Profit) using minor-unit cents arithmetic to eliminate floating-point precision errors.
3. **Period-over-Period Variance Analysis**: Automatically detects material month-over-month variances using configurable materiality thresholds (`>$1,000` & `>15%`, or critical shifts `>$5,000`) with vendor-level driver attribution.
4. **Human-in-the-Loop Review Queue**: Flags potential duplicate charges, cash withdrawals, and ambiguous transactions with an audit trail that persists and automatically recalculates subsequent P&L reports.
5. **AI Financial Analyst (Grounded & Traceable)**: Conversational interface powered by Google Gemini SDK (`@google/generative-ai`) strictly grounded in verified general ledger calculations. Every answer includes supporting transaction evidence cards with one-click drill-downs.

---

## 🏗️ Architecture & Technology Stack

```
finz-financial-review/
├── client/                     # Vite + React 18 + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI components & Transaction Inspector Drawer
│   │   ├── pages/              # Dashboard, P&L, Variance, Ledger, Review Queue, AI Analyst, Ingestion
│   │   └── services/           # Axios API client
│   └── vite.config.js          # API proxy to backend
├── server/                     # Node.js + Express (ES Modules)
│   ├── src/
│   │   ├── config/             # DB connection (Atlas + MemoryServer fallback), constants
│   │   ├── controllers/        # REST route handlers
│   │   ├── models/             # Mongoose schemas (Transaction, ImportBatch, ReviewHistory)
│   │   ├── services/
│   │   │   ├── ingestion/      # CSV streaming parser & duplicate detector
│   │   │   ├── categorization/ # Deterministic rules + Gemini AI classifier
│   │   │   ├── financial/      # Deterministic P&L calculation engine (minor-unit integer cents)
│   │   │   ├── variance/       # Period variance & vendor driver engine
│   │   │   ├── review/         # Human review queue & persistent audit trail
│   │   │   └── analyst/        # AI Financial Analyst with verified fact retrieval
│   │   ├── routes/             # REST API routes
│   │   └── server.js           # Server entrypoint
│   └── tests/                  # Unit and integration test suite
├── data/                       # Verified NYC Restaurant Co. transactions dataset (102 rows)
└── docs/                       # Specifications & Walkthrough Guides
```

### Technology Highlights
- **Backend**: Node.js v20+, Express.js, MongoDB / Mongoose, Official Google Gemini JS SDK (`@google/generative-ai`), Multer, CSV-Parser, Helmet, Express-Rate-Limit.
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router v6.
- **Database Flexibility**: Supports standard MongoDB Atlas via `MONGODB_URI`, with an automatic embedded `mongodb-memory-server` fallback for offline or zero-configuration evaluation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Installation
Clone the repository and install dependencies:
```bash
cd finz-financial-review
npm run install:all
```
*(Or install separately: `cd server && npm install`, `cd client && npm install`)*

### 2. Environment Configuration
Create `.env` inside `server/` (a template is provided in `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
MAX_UPLOAD_SIZE_MB=10
```
> **Note**: `GEMINI_API_KEY` is optional. If omitted, the AI Analyst seamlessly utilizes the deterministic financial reasoning fallback with 100% verified ledger figures and zero hallucinations. If `MONGODB_URI` is omitted, the system starts an in-memory MongoDB instance automatically.

### 3. Run the Development Servers
Start both backend and frontend concurrently:
```bash
# Terminal 1: Backend API (Port 5000)
npm run server

# Terminal 2: Frontend Client (Port 5173)
npm run client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Load the Verified Dataset
Click **"Load NYC Data"** in the top navigation bar or go to **Data Import** to load the 102 verified transactions for NYC Restaurant Co.

---

## 🧪 Automated Testing

Run the automated test suite covering rules, CSV ingestion, P&L formulas, variance detection, and audit persistence:
```bash
npm run test
```
**Test Results (11/11 passing)**:
- Deterministic rules correctly categorize POS settlements, meat/produce vendors, payroll, rent, utilities, and non-P&L transfers.
- Ingestion detects duplicate charges (e.g. Sysco duplicate on 2025-02-14) and flags them for human review.
- Minor-unit cents arithmetic prevents floating-point summation drift.
- Gross Profit and Operating Profit formulas match expected values.
- Variance engine identifies material cost surges between February and March.
- Audit trail updates and persists category corrections.

---

## 📊 Accounting Rules & Conventions

| Metric | Accounting Formula | Notes |
|---|---|---|
| **Gross Profit** | `Revenue - Cost of Goods Sold` | COGS includes direct wholesale food, produce, and beverage suppliers. |
| **Operating Profit** | `Gross Profit - Payroll - Operating Expenses` | EBITDA proxy for restaurant operations. |
| **P&L Inclusions** | Revenue (credits), COGS (debits), Payroll (debits), OpEx (debits). | Presented as positive numbers for intuitive subtraction. |
| **P&L Exclusions** | Owner capital contributions, loan principal repayments, internal bank transfers. | Categorized as `Non-P&L` and excluded from operational margins. |
| **Materiality** | Absolute change $\ge \$1,000$ AND % change $\ge 15\%$, OR absolute change $\ge \$5,000$. | Vendor-level drivers attributed to material variances. |

---

## 🛡️ AI Safety & Explainability Architecture

To ensure financial accuracy in executive reporting:
1. **Zero LLM Math**: All financial metrics, margins, and variances are calculated deterministically in backend services. The LLM is never permitted to perform unverified arithmetic.
2. **Strict Grounding**: The user's query triggers structured fact retrieval from MongoDB. Only verified figures and underlying transaction evidence are provided to Gemini.
3. **Transaction Traceability**: Answers link to underlying transaction IDs (`TXN-2025-XXXX`). Users can click any evidence card to inspect the raw bank ledger row, vendor memo, and audit history.
4. **Deterministic Fallback**: If an API key is not provided, the system uses rule-grounded synthesis to answer inquiries without external network calls.

---

## 📡 REST API Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Service status and timestamp ping |
| `/api/ingest/upload` | POST | Upload and process transaction CSV file |
| `/api/ingest/seed` | POST | One-click seed of verified NYC Restaurant Co. dataset |
| `/api/pnl` | GET | Monthly P&L statements (supports `?month=YYYY-MM`) |
| `/api/pnl/transactions` | GET | Contributing transactions for a P&L line item |
| `/api/variance` | GET | Month-over-month variance with vendor drivers |
| `/api/transactions` | GET | Paginated transaction ledger with multi-filters |
| `/api/review` | GET | Retrieve pending or resolved review queue items |
| `/api/review/:id/correct` | POST | Correct category with audit trail and P&L recalculation |
| `/api/review/:id/resolve` | POST | Approve review item |
| `/api/analyst/ask` | POST | Query AI Financial Analyst with verified evidence |

---

## 🚢 Deployment Guidelines

### 1. Backend (e.g. Render / Railway)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Set `MONGODB_URI`, `CLIENT_URL`, `GEMINI_API_KEY`, `NODE_ENV=production`.

### 2. Frontend (e.g. Vercel / Netlify)
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Set `VITE_API_URL` to your deployed backend URL (e.g. `https://finz-backend.onrender.com/api`).
