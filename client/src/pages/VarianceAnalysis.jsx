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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Period Variance Analysis</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold uppercase">
              Materiality Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Detects operational shifts, vendor price spikes, and seasonal surges with multi-tiered materiality thresholds.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <form onSubmit={handleApplyThresholds} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Prior Period:</span>
          <select
            value={priorMonth}
            onChange={(e) => setPriorMonth(e.target.value)}
            className="rounded-xl border border-slate-300 font-mono text-xs px-3 py-1.5 bg-slate-50 text-slate-900 focus:ring-emerald-500"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Current Period:</span>
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="rounded-xl border border-slate-300 font-mono text-xs px-3 py-1.5 bg-slate-50 text-slate-900 focus:ring-emerald-500"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-600 font-medium">Min Dollar Shift:</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono">$</span>
            <input
              type="number"
              value={minDollar}
              onChange={(e) => setMinDollar(Number(e.target.value))}
              className="pl-6 w-24 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs py-1.5 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-600 font-medium">Min % Shift:</span>
          <div className="relative">
            <input
              type="number"
              value={minPct}
              onChange={(e) => setMinPct(Number(e.target.value))}
              className="pr-6 w-20 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs py-1.5 font-mono pl-2.5"
            />
            <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono">%</span>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-xs"
        >
          Recalculate
        </button>
      </form>

      {/* Variance Line Items Table */}
      {varianceData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-bold uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {varianceData.variances.map((v) => {
                const isPositive = v.absoluteChange >= 0;
                const hasDrivers = v.drivers && v.drivers.length > 0;

                return (
                  <React.Fragment key={v.key}>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {v.lineItem}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600 text-right">
                        ${v.priorAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-900 text-right font-medium">
                        ${v.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-mono text-right font-bold">
                        <span className={`inline-flex items-center ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                          {isPositive ? '+' : '-'}${Math.abs(v.absoluteChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-right text-xs">
                        {v.percentChange !== null ? (
                          <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                            Math.abs(v.percentChange) >= minPct
                              ? isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              : 'text-slate-500'
                          }`}>
                            {v.percentChange > 0 ? '+' : ''}{v.percentChange}%
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {v.isMaterial ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Material Shift
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Immaterial
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {hasDrivers ? (
                          <button
                            onClick={() => setActiveDriverItem(activeDriverItem === v.key ? null : v.key)}
                            className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center space-x-1 transition"
                          >
                            <span>{v.drivers.length} Vendors</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDriverItem === v.key ? 'rotate-180' : ''}`} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Vendor Driver Breakdown */}
                    {activeDriverItem === v.key && hasDrivers && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={7} className="p-5 px-8 border-b border-slate-200">
                          <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-emerald-600" />
                              <span>Vendor Attribution Behind Shift ({v.lineItem})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                              {v.drivers.map((d, idx) => (
                                <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                                  <div className="font-bold text-slate-900 truncate">{d.vendor}</div>
                                  <div className="flex justify-between text-slate-500 text-[11px]">
                                    <span>Prior: ${d.priorAmount.toLocaleString()}</span>
                                    <span>Current: ${d.currentAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-mono font-semibold pt-1 border-t border-slate-100">
                                    <span className="text-slate-500">Net Impact:</span>
                                    <span className={d.changeAmount >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
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
