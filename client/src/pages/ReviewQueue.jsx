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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Financial Review Queue</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold uppercase">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Resolve potential duplicate charges, untracked ATM cash outlays, and ambiguous vendor entries with full audit trail logging.
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex rounded-xl border border-white/10 bg-slate-900/80 p-1 text-xs shadow-inner">
          <button
            onClick={() => setStatusFilter('Pending Review')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              statusFilter === 'Pending Review'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setStatusFilter('Resolved')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              statusFilter === 'Resolved'
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved History
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading review queue items...</div>
        ) : items.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center space-y-4 border border-white/10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                {statusFilter === 'Pending Review' ? 'Review Queue Clear!' : 'No Resolved Items Recorded'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
              className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Column: Details & Flag Reason */}
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.transactionId}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{item.account}</span>
                </div>

                <div className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {item.description}
                </div>

                {/* Flag Reason Callout */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Flag: {item.reviewReason || 'Low confidence classification'}</span>
                </div>

                {/* System Rationale */}
                <div className="text-xs text-slate-400 italic">
                  Suggested Category: <strong className="text-emerald-400 font-semibold">{item.category}</strong> ({item.subcategory || 'General'}) — "{item.rationale}"
                </div>
              </div>

              {/* Right Column: Amount & Actions */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="text-right">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white">
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
                      className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.03] text-slate-200 hover:text-white hover:bg-white/[0.08] text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Correct Category</span>
                    </button>
                    <button
                      onClick={() => handleQuickResolve(item)}
                      disabled={resolvingId === item.transactionId}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-glow-emerald"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{resolvingId === item.transactionId ? 'Resolving...' : 'Approve'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedTxn(item)}
                    className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5"
                  >
                    <History className="w-3.5 h-3.5 text-emerald-400" />
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
