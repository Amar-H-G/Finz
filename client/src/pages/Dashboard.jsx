import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileSpreadsheet,
  Bot,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getPnlReport, getReviewItems, getPeriodVariance, seedSampleData } from '../services/api.js';
import TransactionDrawer from '../components/common/TransactionDrawer.jsx';

export default function Dashboard() {
  const [pnlData, setPnlData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [variances, setVariances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pnlRes, reviewRes] = await Promise.all([
        getPnlReport(),
        getReviewItems('Pending Review')
      ]);

      if (pnlRes.success && pnlRes.data.length > 0) {
        setPnlData(pnlRes.data);
        const latestMonth = pnlRes.data[pnlRes.data.length - 1].month;
        setSelectedMonth(latestMonth);

        if (pnlRes.data.length >= 2) {
          const prior = pnlRes.data[pnlRes.data.length - 2].month;
          const current = latestMonth;
          const varRes = await getPeriodVariance(prior, current);
          if (varRes.success) {
            setVariances(varRes.data.variances.filter(v => v.isMaterial));
          }
        }
      }

      if (reviewRes.success) {
        setPendingReviews(reviewRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await seedSampleData();
      await loadDashboardData();
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const currentReport = pnlData.find(p => p.month === selectedMonth) || pnlData[pnlData.length - 1] || {};

  const chartData = pnlData.map(p => ({
    month: p.month,
    Revenue: p.revenue,
    COGS: p.cogs,
    GrossProfit: p.grossProfit,
    OperatingProfit: p.operatingProfit
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900/60 rounded-2xl border border-white/5"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-slate-900/60 rounded-2xl border border-white/5"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-900/60 rounded-2xl border border-white/5"></div>
      </div>
    );
  }

  // Empty state with interactive quick start
  if (pnlData.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald">
          <FileSpreadsheet className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">No Financial Transactions Ingested</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Ingest NYC Restaurant Co. bank statements to calculate verified P&L statements, flag material variances, and empower the AI analyst.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-glow-emerald flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding 102 Transactions...' : 'Load Verified NYC Restaurant Co. Dataset'}</span>
          </button>
          <Link
            to="/import"
            className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 font-semibold text-sm rounded-xl transition"
          >
            Upload Custom CSV Statement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Executive Financial Intelligence</span>
              <span>•</span>
              <span className="font-mono text-emerald-400">{selectedMonth}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              NYC Restaurant Co. Financial Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Deterministic calculations derived from double-entry bank transactions. Traceable to raw general ledger line items with minor-unit integer precision.
            </p>
          </div>

          {/* Period Selector Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-mono text-sm font-bold text-white bg-transparent border-none focus:ring-0 cursor-pointer pr-4"
            >
              {pnlData.map(p => (
                <option key={p.month} value={p.month} className="bg-slate-900 text-white">
                  {p.month}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ambient Decorative Mesh Glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white">
              ${(currentReport.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{currentReport.transactionCounts?.revenue || 0} deposits</span>
              <span>(Toast & Catering)</span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full"></div>
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">COGS (Food & Bev)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white">
              ${(currentReport.cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Gross Margin:</span>
              <span className="text-emerald-400 font-mono font-bold">{currentReport.grossMarginPct}%</span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400 w-3/4"></div>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Profit</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-emerald-400">
              ${(currentReport.grossProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Formula: <span className="font-mono text-slate-300">Revenue − COGS</span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 w-2/3"></div>
          </div>
        </div>

        {/* Operating Profit */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Profit</span>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              (currentReport.operatingProfit || 0) >= 0
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-3xl font-bold font-mono tracking-tight ${
              (currentReport.operatingProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ${(currentReport.operatingProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Op Margin:</span>
              <span className="text-white font-mono font-bold">{currentReport.operatingMarginPct}%</span>
              <span>(EBITDA Proxy)</span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-1/2"></div>
          </div>
        </div>
      </div>

      {/* P&L Trajectory Chart */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Quarterly P&L Trajectory (Q1 2025)</h2>
            <p className="text-xs text-slate-400">Deterministic comparison across Revenue, Wholesale Cost of Goods, and Operating Profit</p>
          </div>
          <Link
            to="/pnl"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition inline-flex items-center gap-1"
          >
            <span>Audit Full P&L Table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
              <Bar dataKey="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue ($)" />
              <Bar dataKey="COGS" fill="#f43f5e" radius={[6, 6, 0, 0]} name="COGS ($)" />
              <Bar dataKey="OperatingProfit" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Operating Profit ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Grid: Review Queue & Material Variances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Review Queue Alert */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Review Queue Pending</h2>
                <p className="text-[11px] text-slate-400">{pendingReviews.length} transaction flags requiring accounting approval</p>
              </div>
            </div>
            <Link
              to="/review"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Open Queue &rarr;
            </Link>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions currently requiring human review. All classifications verified.
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {pendingReviews.slice(0, 3).map((item) => (
                <div
                  key={item.transactionId}
                  onClick={() => setSelectedTxn(item)}
                  className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] transition cursor-pointer flex justify-between items-center text-xs group"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="font-semibold text-white group-hover:text-emerald-300 transition flex items-center gap-1.5 truncate">
                      <span className="truncate">{item.description}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        {item.transactionId}
                      </span>
                    </div>
                    <div className="text-amber-400/90 text-[11px] truncate">{item.reviewReason}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-white">
                      ${Math.abs(item.amount).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-500">Click to Inspect</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Material Variances Summary */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Material Period Shifts</h2>
                <p className="text-[11px] text-slate-400">Variances exceeding $1k & 15% threshold</p>
              </div>
            </div>
            <Link
              to="/variance"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Analyze Drivers &rarr;
            </Link>
          </div>

          {variances.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No material variances flagged under configured thresholds.
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {variances.slice(0, 3).map((v) => {
                const isIncrease = v.absoluteChange >= 0;
                return (
                  <div key={v.key} className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{v.lineItem}</div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        ${v.priorAmount.toLocaleString()} &rarr; ${v.currentAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold flex items-center justify-end ${
                        isIncrease ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIncrease ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                        {isIncrease ? '+' : '-'}${Math.abs(v.absoluteChange).toLocaleString()}
                      </div>
                      {v.percentChange !== null && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {v.percentChange > 0 ? '+' : ''}{v.percentChange}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Analyst Callout Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 p-6 sm:p-8 backdrop-blur-xl shadow-glow-emerald flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Financial Analyst Grounded on Live Data</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Ask Natural Language Financial Questions</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            "What drove the increase in food costs?", "Why did operating profit change between February and March?" — all answered with supporting general ledger evidence cards.
          </p>
        </div>
        <Link
          to="/analyst"
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-glow-emerald transition duration-300 whitespace-nowrap"
        >
          Launch AI Analyst &rarr;
        </Link>
      </div>

      {/* Transaction Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onUpdated={() => {
          setSelectedTxn(null);
          loadDashboardData();
        }}
      />
    </div>
  );
}
