import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Clock, Edit2, ShieldCheck, Tag, Receipt } from 'lucide-react';
import { correctClassification } from '../../services/api.js';

const ALLOWED_CATEGORIES = [
  'Revenue',
  'Cost of Goods Sold',
  'Payroll',
  'Operating Expenses',
  'Non-P&L'
];

export default function TransactionDrawer({ transaction, onClose, onUpdated }) {
  if (!transaction) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState(transaction.category);
  const [newSubcategory, setNewSubcategory] = useState(transaction.subcategory || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await correctClassification(transaction.transactionId, {
        newCategory,
        newSubcategory,
        notes: notes || 'Updated via transaction inspector',
        actor: 'Finance Reviewer'
      });
      if (res.success) {
        setIsEditing(false);
        if (onUpdated) onUpdated(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const isExpense = transaction.amount < 0 || transaction.type === 'Debit';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              {transaction.transactionId}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1.5">General Ledger Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Amount Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transaction Value</div>
            <div className={`text-3xl font-mono font-extrabold tracking-tight ${isExpense ? 'text-rose-700' : 'text-emerald-700'}`}>
              {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1 font-mono">
              <span className="text-slate-800 font-semibold">{transaction.type}</span>
              <span>•</span>
              <span>{transaction.account || 'Operating Checking'}</span>
            </div>
          </div>

          {/* Core Metadata */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ledger Information</h4>
            
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 text-xs shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-mono text-slate-900 font-medium">
                  {new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reporting Period:</span>
                <span className="font-mono text-emerald-700 font-bold">{transaction.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Description:</span>
                <span className="font-semibold text-slate-900 text-right max-w-[260px] truncate" title={transaction.description}>
                  {transaction.description}
                </span>
              </div>
              {transaction.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference / Check:</span>
                  <span className="font-mono text-slate-700">{transaction.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Accounting Treatment */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accounting Treatment</h4>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Correct Category</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveCorrection} className="bg-white border border-emerald-300 rounded-xl p-4 space-y-3 shadow-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target P&L Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white text-slate-900 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {ALLOWED_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder="e.g. Seafood, Produce, Utilities"
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white text-slate-900 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Rationale</label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reason for correction (e.g. Verified supplier invoice #1029)"
                    className="w-full text-xs rounded-lg border border-slate-300 bg-white text-slate-900 p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Apply Correction'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 text-xs shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Category:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {transaction.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subcategory:</span>
                  <span className="font-semibold text-slate-800">{transaction.subcategory || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">P&L Status:</span>
                  <span className={`text-xs font-semibold ${transaction.isPnlIncluded ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {transaction.isPnlIncluded ? 'Included in P&L Calculations' : 'Excluded (Balance Sheet / Transfer)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classification Method:</span>
                  <span className="text-xs text-slate-700 font-medium">{transaction.classificationMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {Math.round((transaction.confidence || 1) * 100)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-1">Engine Rationale:</div>
                  <div className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{transaction.rationale || 'Matched deterministic business rule'}"
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Review Status Card */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Review Status</h4>
            <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
              transaction.reviewStatus === 'Pending Review'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : transaction.reviewStatus === 'Resolved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              {transaction.reviewStatus === 'Pending Review' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold">{transaction.reviewStatus}</div>
                {transaction.reviewReason && (
                  <div className="text-xs mt-0.5 text-slate-600">{transaction.reviewReason}</div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail History */}
          {transaction.auditTrail && transaction.auditTrail.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Trail</h4>
              <div className="space-y-2">
                {transaction.auditTrail.map((entry, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Changed to: <strong className="text-emerald-700">{entry.newCategory}</strong></span>
                      <span className="text-slate-500 font-mono text-[10px]">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-600">By: {entry.changedBy}</div>
                    {entry.reason && <div className="text-slate-600 italic">"{entry.reason}"</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
