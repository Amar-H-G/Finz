import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  ChevronDown,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { getPnlReport, getPeriodVariance } from '../services/api.js';
import TransactionDrawer from '../components/common/TransactionDrawer.jsx';

export default function VarianceAnalysis() {
  const [months, setMonths] = useState([]);
  const [priorMonth, setPriorMonth] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const [minDollar, setMinDollar] = useState(1000);
  const [minPct, setMinPct] = useState(15);
  const [varianceData, setVarianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDriverItem, setActiveDriverItem] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadMonths();
  }, []);

  const loadMonths = async () => {
    try {
      setLoading(true);
      const res = await getPnlReport();
      if (res.success && res.data.length >= 2) {
        const availableMonths = res.data.map(r => r.month);
        setMonths(availableMonths);
        const p = availableMonths[availableMonths.length - 2];
        const c = availableMonths[availableMonths.length - 1];
        setPriorMonth(p);
        setCurrentMonth(c);
        fetchVariance(p, c, minDollar, minPct);
      }
    } catch (err) {
      console.error('Failed to load months:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariance = async (p, c, dollar, pct) => {
    try {
      setLoading(true);
      const res = await getPeriodVariance(p, c, {
        minDollarChange: dollar,
        minPercentChange: pct
      });
      if (res.success) {
        setVarianceData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch variance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyThresholds = (e) => {
    e.preventDefault();
    if (priorMonth && currentMonth) {
      fetchVariance(priorMonth, currentMonth, minDollar, minPct);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Period Variance Analysis</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono font-bold uppercase">
              Materiality Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detects operational shifts, vendor price spikes, and seasonal surges with multi-tiered materiality thresholds.
          </p>
        </div>
      </div>

      {/* Control Bar: Months & Thresholds */}
      <form onSubmit={handleApplyThresholds} className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300">Prior Period:</span>
          <select
            value={priorMonth}
            onChange={(e) => setPriorMonth(e.target.value)}
            className="rounded-xl border border-white/10 font-mono text-xs px-3 py-1.5 bg-slate-900 text-white focus:ring-emerald-500 focus:border-emerald-500"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300">Current Period:</span>
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="rounded-xl border border-white/10 font-mono text-xs px-3 py-1.5 bg-slate-900 text-white focus:ring-emerald-500 focus:border-emerald-500"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-white/10 hidden md:block"></div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Min Dollar Shift:</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-slate-500 font-mono">$</span>
            <input
              type="number"
              value={minDollar}
              onChange={(e) => setMinDollar(Number(e.target.value))}
              className="pl-6 w-24 rounded-xl border border-white/10 bg-slate-900 text-white text-xs py-1.5 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Min % Shift:</span>
          <div className="relative">
            <input
              type="number"
              value={minPct}
              onChange={(e) => setMinPct(Number(e.target.value))}
              className="pr-6 w-20 rounded-xl border border-white/10 bg-slate-900 text-white text-xs py-1.5 font-mono pl-2.5"
            />
            <span className="absolute right-2.5 top-1.5 text-slate-500 font-mono">%</span>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl transition shadow-glow-emerald"
        >
          Recalculate
        </button>
      </form>

      {/* Variance Line Items Table */}
      {varianceData && (
        <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-white/[0.03] border-b border-white/[0.08] text-xs text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">P&L Metric</th>
                <th className="py-4 px-6 text-right font-mono">{varianceData.priorMonth}</th>
                <th className="py-4 px-6 text-right font-mono">{varianceData.currentMonth}</th>
                <th className="py-4 px-6 text-right font-mono">Absolute Shift</th>
                <th className="py-4 px-6 text-right font-mono">% Change</th>
                <th className="py-4 px-6 text-center">Materiality</th>
                <th className="py-4 px-6 text-right">Drivers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {varianceData.variances.map((v) => {
                const isPositive = v.absoluteChange >= 0;
                const hasDrivers = v.drivers && v.drivers.length > 0;

                return (
                  <React.Fragment key={v.key}>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        {v.lineItem}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 text-right">
                        ${v.priorAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-mono text-white text-right font-medium">
                        ${v.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-mono text-right font-bold">
                        <span className={`inline-flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                          {isPositive ? '+' : '-'}${Math.abs(v.absoluteChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-right text-xs">
                        {v.percentChange !== null ? (
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            Math.abs(v.percentChange) >= minPct
                              ? isPositive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'text-slate-500'
                          }`}>
                            {v.percentChange > 0 ? '+' : ''}{v.percentChange}%
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {v.isMaterial ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-glow-amber">
                            Material Shift
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">
                            Immaterial
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {hasDrivers ? (
                          <button
                            onClick={() => setActiveDriverItem(activeDriverItem === v.key ? null : v.key)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 inline-flex items-center space-x-1 transition"
                          >
                            <span>{v.drivers.length} Vendors</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDriverItem === v.key ? 'rotate-180' : ''}`} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Vendor Driver Breakdown */}
                    {activeDriverItem === v.key && hasDrivers && (
                      <tr className="bg-slate-900/60">
                        <td colSpan={7} className="p-5 px-8 border-b border-white/10">
                          <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-emerald-400" />
                              <span>Vendor Attribution Behind Shift ({v.lineItem})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                              {v.drivers.map((d, idx) => (
                                <div key={idx} className="glass-card p-3.5 rounded-xl border border-white/10 space-y-1.5 text-xs">
                                  <div className="font-bold text-white truncate">{d.vendor}</div>
                                  <div className="flex justify-between text-slate-400 text-[11px]">
                                    <span>Prior: ${d.priorAmount.toLocaleString()}</span>
                                    <span>Current: ${d.currentAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-mono font-semibold pt-1 border-t border-white/5">
                                    <span className="text-slate-500">Net Impact:</span>
                                    <span className={d.changeAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                      {d.changeAmount >= 0 ? '+' : '-'}${Math.abs(d.changeAmount).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onUpdated={() => {
          setSelectedTxn(null);
          fetchVariance(priorMonth, currentMonth, minDollar, minPct);
        }}
      />
    </div>
  );
}
