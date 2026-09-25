import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { getTransactions, getPnlReport } from '../services/api.js';
import TransactionDrawer from '../components/common/TransactionDrawer.jsx';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [month, setMonth] = useState('All');
  const [reviewStatus, setReviewStatus] = useState('All');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, category, month, reviewStatus]);

  const loadMonths = async () => {
    try {
      const res = await getPnlReport();
      if (res.success) {
        setAvailableMonths(res.data.map(d => d.month));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await getTransactions({
        page: pagination.page,
        limit: pagination.limit,
        search,
        category,
        month,
        reviewStatus
      });
      if (res.success) {
        setTransactions(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setMonth('All');
    setReviewStatus('All');
    setPagination(p => ({ ...p, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">General Ledger Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search and audit double-entry bank transactions with automated classification confidence, method provenance, and audit logs.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor, description, account, or TXN-2025-..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-white/10 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-900 text-white placeholder-slate-500"
            />
          </form>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={month}
              onChange={(e) => { setMonth(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="rounded-xl border border-white/10 py-2 px-3 bg-slate-900 text-white font-mono text-xs focus:ring-emerald-500"
            >
              <option value="All">All Months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="rounded-xl border border-white/10 py-2 px-3 bg-slate-900 text-white text-xs focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Revenue">Revenue</option>
              <option value="Cost of Goods Sold">Cost of Goods Sold</option>
              <option value="Payroll">Payroll</option>
              <option value="Operating Expenses">Operating Expenses</option>
              <option value="Non-P&L">Non-P&L</option>
            </select>

            <select
              value={reviewStatus}
              onChange={(e) => { setReviewStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="rounded-xl border border-white/10 py-2 px-3 bg-slate-900 text-white text-xs focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Not Required">Not Required</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition border border-white/10"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.08] text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">Loading ledger records...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">No transactions match your search filter criteria.</td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isCredit = t.amount > 0 || t.type === 'Credit';
                  return (
                    <tr key={t.transactionId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        {t.transactionId}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate" title={t.description}>
                        {t.description}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          t.category === 'Revenue'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : t.category === 'Cost of Goods Sold'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : t.category === 'Payroll'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : t.category === 'Operating Expenses'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                        }`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {t.classificationMethod}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {Math.round((t.confidence || 1) * 100)}%
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {t.reviewStatus === 'Pending Review' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
                            Review Needed
                          </span>
                        ) : t.reviewStatus === 'Resolved' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" />
                            Resolved
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Verified</span>
                        )}
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold text-right whitespace-nowrap ${
                        isCredit ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {isCredit ? '+' : '-'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTxn(t)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{transactions.length}</span> of{' '}
            <span className="font-semibold text-white">{pagination.totalCount}</span> transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(p.page - 1, 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.page + 1, pagination.totalPages) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-30 hover:bg-slate-800 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onUpdated={() => {
          setSelectedTxn(null);
          loadTransactions();
        }}
      />
    </div>
  );
}
