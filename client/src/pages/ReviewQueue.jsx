import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Check,
  ShieldAlert,
  ArrowRight,
  Filter,
  History,
  Sparkles
} from 'lucide-react';
import { getReviewItems, resolveReview, correctClassification } from '../services/api.js';
import TransactionDrawer from '../components/common/TransactionDrawer.jsx';

export default function ReviewQueue() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending Review');
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadReviewItems();
  }, [statusFilter]);

  const loadReviewItems = async () => {
    try {
      setLoading(true);
      const res = await getReviewItems(statusFilter);
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickResolve = async (txn) => {
    try {
      setResolvingId(txn.transactionId);
      const res = await resolveReview(txn.transactionId, {
        notes: 'Approved as correct during accounting review',
        actor: 'Accounting Reviewer'
      });
      if (res.success) {
        loadReviewItems();
      }
    } catch (err) {
      alert(`Resolution error: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Financial Review Queue</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-mono font-bold uppercase">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Resolve potential duplicate charges, untracked ATM cash outlays, and ambiguous vendor entries with full audit trail logging.
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs shadow-inner">
          <button
            onClick={() => setStatusFilter('Pending Review')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              statusFilter === 'Pending Review'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setStatusFilter('Resolved')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              statusFilter === 'Resolved'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved History
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">Loading review queue items...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center space-y-4 border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                {statusFilter === 'Pending Review' ? 'Review Queue Clear!' : 'No Resolved Items Recorded'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                {statusFilter === 'Pending Review'
                  ? 'All transactions have been verified with acceptable confidence and zero compliance anomalies.'
                  : 'Items will appear here once reviewed or corrected.'}
              </p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.transactionId}
              className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Column: Details & Flag Reason */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.transactionId}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-600 font-medium">{item.account}</span>
                </div>

                <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {item.description}
                </div>

                {/* Flag Reason Callout */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Flag: {item.reviewReason || 'Low confidence classification'}</span>
                </div>

                {/* System Rationale */}
                <div className="text-xs text-slate-600">
                  Suggested Category: <strong className="text-slate-900 font-semibold">{item.category}</strong> ({item.subcategory || 'General'}) — <span className="italic text-slate-500">"{item.rationale}"</span>
                </div>
              </div>

              {/* Right Column: Amount & Actions */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <div className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900">
                    ${Math.abs(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Confidence: {Math.round((item.confidence || 0.5) * 100)}%
                  </div>
                </div>

                {statusFilter === 'Pending Review' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedTxn(item)}
                      className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Correct Category</span>
                    </button>
                    <button
                      onClick={() => handleQuickResolve(item)}
                      disabled={resolvingId === item.transactionId}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{resolvingId === item.transactionId ? 'Resolving...' : 'Approve'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedTxn(item)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Audit Trail</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onUpdated={() => {
          setSelectedTxn(null);
          loadReviewItems();
        }}
      />
    </div>
  );
}
