import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Info,
  ChevronRight,
  Receipt,
  HelpCircle,
  TrendingUp,
  Percent,
  Download,
  X
} from 'lucide-react';
import { getPnlReport, getPnlTransactions } from '../services/api.js';
import TransactionDrawer from '../components/common/TransactionDrawer.jsx';

export default function PnlReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drillDownCategory, setDrillDownCategory] = useState(null);
  const [drillDownMonth, setDrillDownMonth] = useState(null);
  const [drillDownTxns, setDrillDownTxns] = useState([]);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadPnl();
  }, []);

  const loadPnl = async () => {
    try {
      setLoading(true);
      const res = await getPnlReport();
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load P&L report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrillDown = async (month, category) => {
    try {
      setDrillDownMonth(month);
      setDrillDownCategory(category);
      setDrillDownLoading(true);
      const res = await getPnlTransactions(month, category);
      if (res.success) {
        setDrillDownTxns(res.data);
      }
    } catch (err) {
      console.error('Drill down failed:', err);
    } finally {
      setDrillDownLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const months = reports.map(r => r.month);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Monthly Profit & Loss Statement</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold uppercase">
              GAAP • Integer Math
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Standardized operational income statement for NYC Restaurant Co. Click any figure to audit underlying invoices and bank entries.
          </p>
        </div>
      </div>

      {/* Main P&L Statement Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 font-bold text-slate-700 w-1/3 text-xs uppercase tracking-wider">Accounting Line Item</th>
                {months.map(m => (
                  <th key={m} className="py-4 px-6 font-mono font-bold text-slate-900 text-right text-xs uppercase tracking-wider">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* REVENUE SECTION */}
              <tr className="bg-slate-50/60">
                <td colSpan={months.length + 1} className="py-2.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Operating Inflows
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center space-x-2">
                  <span>Gross Sales & Revenue</span>
                  <span className="text-xs text-slate-500 font-normal">(Toast POS + Delivery + Catering)</span>
                </td>
                {reports.map(r => (
                  <td
                    key={r.month}
                    onClick={() => handleDrillDown(r.month, 'Revenue')}
                    className="py-3.5 px-6 font-mono font-semibold text-emerald-700 text-right cursor-pointer hover:bg-emerald-50 transition"
                    title="Click to view contributing revenue transactions"
                  >
                    ${r.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>

              {/* COGS SECTION */}
              <tr className="bg-slate-50/60">
                <td colSpan={months.length + 1} className="py-2.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Direct Cost of Goods Sold
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center space-x-2">
                  <span>Cost of Goods Sold (COGS)</span>
                  <span className="text-xs text-slate-500 font-normal">(Baldor, Sysco, Sea to Table, Beer)</span>
                </td>
                {reports.map(r => (
                  <td
                    key={r.month}
                    onClick={() => handleDrillDown(r.month, 'Cost of Goods Sold')}
                    className="py-3.5 px-6 font-mono font-medium text-rose-700 text-right cursor-pointer hover:bg-rose-50 transition"
                    title="Click to view COGS supplier transactions"
                  >
                    ${r.cogs.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>

              {/* GROSS PROFIT (DERIVED) */}
              <tr className="bg-emerald-50/60 border-y border-emerald-200">
                <td className="py-4 px-6 font-bold text-slate-900">
                  <div className="flex items-center space-x-2">
                    <span className="text-base text-emerald-900 font-extrabold">Gross Profit</span>
                    <span className="text-xs font-mono text-slate-500 font-normal">(Revenue − COGS)</span>
                  </div>
                </td>
                {reports.map(r => (
                  <td key={r.month} className="py-4 px-6 font-mono font-extrabold text-emerald-800 text-right text-base">
                    ${r.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>

              {/* GROSS MARGIN */}
              <tr className="text-xs text-slate-600 bg-emerald-50/20">
                <td className="py-2.5 px-6 font-medium">Gross Margin %</td>
                {reports.map(r => (
                  <td key={r.month} className="py-2.5 px-6 font-mono text-right font-bold text-emerald-800">
                    {r.grossMarginPct}%
                  </td>
                ))}
              </tr>

              {/* OPERATING EXPENSES SECTION */}
              <tr className="bg-slate-50/60">
                <td colSpan={months.length + 1} className="py-2.5 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Operating Overhead
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 text-slate-800">
                  <div className="font-semibold text-slate-900">Payroll & Benefits</div>
                  <div className="text-xs text-slate-500">Gusto net pay + employer taxes</div>
                </td>
                {reports.map(r => (
                  <td
                    key={r.month}
                    onClick={() => handleDrillDown(r.month, 'Payroll')}
                    className="py-3.5 px-6 font-mono text-slate-800 text-right cursor-pointer hover:bg-slate-100 transition"
                    title="Click to view payroll transactions"
                  >
                    ${r.payroll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 text-slate-800">
                  <div className="font-semibold text-slate-900">Operating Expenses (OpEx)</div>
                  <div className="text-xs text-slate-500">Commercial lease, ConEd, SaaS, kitchen supplies</div>
                </td>
                {reports.map(r => (
                  <td
                    key={r.month}
                    onClick={() => handleDrillDown(r.month, 'Operating Expenses')}
                    className="py-3.5 px-6 font-mono text-slate-800 text-right cursor-pointer hover:bg-slate-100 transition"
                    title="Click to view operating expense transactions"
                  >
                    ${r.opex.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>

              {/* OPERATING PROFIT (DERIVED) */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-950">
                <td className="py-5 px-6">
                  <div className="text-lg font-extrabold text-white">Operating Profit (EBITDA Proxy)</div>
                  <div className="text-xs font-normal text-slate-400">Gross Profit − Payroll − Operating Expenses</div>
                </td>
                {reports.map(r => (
                  <td key={r.month} className="py-5 px-6 font-mono text-right text-xl">
                    <span className={r.operatingProfit >= 0 ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'}>
                      ${r.operatingProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                ))}
              </tr>

              {/* OPERATING MARGIN */}
              <tr className="bg-slate-800 text-xs text-slate-300">
                <td className="py-2.5 px-6">Operating Margin %</td>
                {reports.map(r => (
                  <td key={r.month} className="py-2.5 px-6 font-mono text-right font-bold text-slate-200">
                    {r.operatingMarginPct}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounting Methodology Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <strong className="text-slate-900 block font-semibold text-sm">Minor-Unit Precision</strong>
          Calculations are computed in exact integer cents ($0.01 = 1 cent) to ensure GAAP mathematical integrity and eliminate JavaScript floating-point drift.
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <strong className="text-slate-900 block font-semibold text-sm">Balance Sheet Exclusions</strong>
          Partner equity injections (+$25,000.00), SBA loan principal amortizations, and inter-account bank transfers are strictly excluded from operational P&L.
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <strong className="text-slate-900 block font-semibold text-sm">Complete Traceability</strong>
          Every summarized number in this statement can be audited to its underlying transaction records by clicking the corresponding cell.
        </div>
      </div>

      {/* Drill Down Modal */}
      {drillDownCategory && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {drillDownMonth}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Contributing Transactions: {drillDownCategory}
                </h3>
              </div>
              <button
                onClick={() => setDrillDownCategory(null)}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {drillDownLoading ? (
                <div className="py-12 text-center text-slate-400">Loading ledger records...</div>
              ) : drillDownTxns.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No transactions found for this line item.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Subcategory</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drillDownTxns.map((t) => (
                      <tr key={t.transactionId} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                          {t.transactionId}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate" title={t.description}>
                          {t.description}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {t.subcategory || 'General'}
                        </td>
                        <td className={`py-2.5 px-3 font-mono font-bold text-right ${
                          t.amount >= 0 ? 'text-emerald-700' : 'text-slate-900'
                        }`}>
                          ${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setSelectedTxn(t)}
                            className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onUpdated={() => {
          setSelectedTxn(null);
          loadPnl();
          if (drillDownCategory) handleDrillDown(drillDownMonth, drillDownCategory);
        }}
      />
    </div>
  );
}
