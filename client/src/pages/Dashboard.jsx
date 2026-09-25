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
  RefreshCw,
  Activity,
  Zap,
  Building2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
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
  const [chartMode, setChartMode] = useState('bars'); // 'bars' | 'trend'

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

  // Aggregated totals across all months
  const totalRevenue = pnlData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalGrossProfit = pnlData.reduce((acc, curr) => acc + (curr.grossProfit || 0), 0);
  const totalOpProfit = pnlData.reduce((acc, curr) => acc + (curr.operatingProfit || 0), 0);
  const avgMargin = totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-32 bg-slate-900/60 rounded-3xl border border-white/5"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-slate-900/60 rounded-3xl border border-white/5"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-900/60 rounded-3xl border border-white/5"></div>
      </div>
    );
  }

  // Zero-state onboarding
  if (pnlData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-8 animate-fade-in">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald">
            <Building2 className="w-12 h-12 text-emerald-400" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to Finz Financial Review
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Ingest NYC Restaurant Co. bank statements to trigger deterministic GAAP P&L calculations, automated duplicate detection, and verified AI financial analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm rounded-2xl transition duration-300 shadow-glow-emerald flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Loading Verified Ledger...' : 'Load Verified NYC Restaurant Co. Dataset'}</span>
          </button>
          <Link
            to="/import"
            className="px-8 py-4 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-bold text-sm rounded-2xl transition flex items-center justify-center"
          >
            Upload Custom CSV Statement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Intelligence Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-emerald-950/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Ledger: NYC Restaurant Co.</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono">
                Downtown Manhattan
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-semibold">
                GAAP Minor-Unit Math
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Financial Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time financial performance statement calculated deterministically from general ledger entries with complete invoice auditability.
            </p>
          </div>

          {/* Quick Metrics & Period Selector */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Quick Stat Pill */}
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-white/10 shadow-inner flex items-center space-x-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Q1 Volume</span>
                <span className="text-sm font-mono font-extrabold text-emerald-400">${(totalRevenue).toLocaleString()}</span>
              </div>
              <div className="h-6 w-px bg-white/10"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Avg Margin</span>
                <span className="text-sm font-mono font-extrabold text-white">{avgMargin}%</span>
              </div>
            </div>

            {/* Period Switcher */}
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-white/10 shadow-inner flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="font-mono text-sm font-extrabold text-white bg-transparent border-none focus:ring-0 cursor-pointer pr-3"
              >
                {pnlData.map(p => (
                  <option key={p.month} value={p.month} className="bg-slate-900 text-white font-mono">
                    {p.month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ambient Decorative Mesh Glow */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Financial Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue Card */}
        <div className="finz-card p-6 space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-glow-emerald group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
              ${(currentReport.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30">
                {currentReport.transactionCounts?.revenue || 0} deposits
              </span>
              <span>Toast & Catering</span>
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full animate-pulse-subtle"></div>
          </div>
        </div>

        {/* COGS Card */}
        <div className="finz-card p-6 space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">COGS (Food & Bev)</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
              ${(currentReport.cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 font-mono font-bold text-[11px] border border-rose-500/30">
                {currentReport.grossMarginPct}% Margin
              </span>
              <span>Wholesale food</span>
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400 w-3/4"></div>
          </div>
        </div>

        {/* Gross Profit Card */}
        <div className="finz-card p-6 space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Profit</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
              ${(currentReport.grossProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-2 font-mono">
              Formula: <span className="text-slate-200">Revenue − COGS</span>
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 w-2/3"></div>
          </div>
        </div>

        {/* Operating Profit Card */}
        <div className="finz-card p-6 space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Profit</span>
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
              (currentReport.operatingProfit || 0) >= 0
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-glow-emerald'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className={`text-3xl font-extrabold font-mono tracking-tight ${
              (currentReport.operatingProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ${(currentReport.operatingProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30">
                {currentReport.operatingMarginPct}% Op Margin
              </span>
              <span>(EBITDA)</span>
            </div>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-1/2"></div>
          </div>
        </div>
      </div>

      {/* Main Interactive Charts Hub */}
      <div className="finz-card-static p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Financial Trajectory & Margin Analysis</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Multi-period comparison of Revenue, COGS, and Operational EBITDA</p>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-white/10 flex text-xs">
              <button
                onClick={() => setChartMode('bars')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  chartMode === 'bars' ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald' : 'text-slate-400 hover:text-white'
                }`}
              >
                Comparison Bars
              </button>
              <button
                onClick={() => setChartMode('trend')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  chartMode === 'trend' ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald' : 'text-slate-400 hover:text-white'
                }`}
              >
                Profit Curve
              </button>
            </div>

            <Link
              to="/pnl"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition inline-flex items-center gap-1.5"
            >
              <span>Full Statement</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'bars' ? (
              <BarChart data={chartData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Bar dataKey="Revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Sales Revenue ($)" />
                <Bar dataKey="COGS" fill="#f43f5e" radius={[8, 8, 0, 0]} name="Cost of Goods ($)" />
                <Bar dataKey="OperatingProfit" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Operating Profit ($)" />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="GrossProfit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#profitGrad)" name="Gross Profit ($)" />
                <Area type="monotone" dataKey="OperatingProfit" stroke="#3b82f6" strokeWidth={3} fill="none" name="Operating Profit ($)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Review Queue & Material Variances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Review Queue Card */}
        <div className="finz-card-static p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-glow-amber">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Review Queue Pending</h2>
                <p className="text-xs text-slate-400">{pendingReviews.length} compliance flags awaiting accounting sign-off</p>
              </div>
            </div>
            <Link
              to="/review"
              className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 transition"
            >
              Open Queue &rarr;
            </Link>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No transactions currently requiring human review. All classifications verified.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {pendingReviews.slice(0, 3).map((item) => (
                <div
                  key={item.transactionId}
                  onClick={() => setSelectedTxn(item)}
                  className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] transition cursor-pointer flex justify-between items-center text-xs group"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-2 truncate">
                      <span className="truncate">{item.description}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        {item.transactionId}
                      </span>
                    </div>
                    <div className="text-amber-400/90 text-[11px] truncate">{item.reviewReason}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-base font-extrabold text-white">
                      ${Math.abs(item.amount).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold underline underline-offset-2">Inspect</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Material Variances Card */}
        <div className="finz-card-static p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Material Period Shifts</h2>
                <p className="text-xs text-slate-400">Variances exceeding $1k & 15% threshold</p>
              </div>
            </div>
            <Link
              to="/variance"
              className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 transition"
            >
              Analyze Drivers &rarr;
            </Link>
          </div>

          {variances.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No material variances flagged under configured thresholds.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {variances.slice(0, 3).map((v) => {
                const isIncrease = v.absoluteChange >= 0;
                return (
                  <div key={v.key} className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{v.lineItem}</div>
                      <div className="text-slate-400 text-xs font-mono mt-0.5">
                        ${v.priorAmount.toLocaleString()} &rarr; ${v.currentAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-extrabold text-sm flex items-center justify-end ${
                        isIncrease ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIncrease ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                        {isIncrease ? '+' : '-'}${Math.abs(v.absoluteChange).toLocaleString()}
                      </div>
                      {v.percentChange !== null && (
                        <span className="text-[11px] text-slate-400 font-mono font-semibold">
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

      {/* Grounded AI Assistant Launchpad */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 p-6 sm:p-8 backdrop-blur-2xl shadow-glow-emerald flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Financial Analyst Grounded on Live Data</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">Have a question about NYC Restaurant Co.?</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            "What drove the increase in food costs?", "Why did operating profit change between February and March?" — all answered with verified figures and transaction evidence cards.
          </p>
        </div>
        <Link
          to="/analyst"
          className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-glow-emerald transition duration-300 whitespace-nowrap"
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
