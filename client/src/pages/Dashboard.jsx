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
  ChevronRight,
  RefreshCw,
  Building2
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

  const totalRevenue = pnlData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalGrossProfit = pnlData.reduce((acc, curr) => acc + (curr.grossProfit || 0), 0);
  const avgMargin = totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  // Zero-state onboarding
  if (pnlData.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <Building2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            No Transactions Ingested Yet
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Load the verified NYC Restaurant Co. general ledger data to calculate GAAP P&L statements, flag variances, and activate the AI analyst.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Loading Ledger...' : 'Load Verified NYC Restaurant Co. Dataset'}</span>
          </button>
          <Link
            to="/import"
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm rounded-xl transition"
          >
            Upload Custom CSV File
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Active Ledger: NYC Restaurant Co.</span>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
              Downtown Manhattan
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold">
              GAAP Minor-Unit Math
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Review Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Deterministic P&L metrics computed directly from verified bank transactions. All numbers are traceable to invoice line items.
          </p>
        </div>

        {/* Quick Metrics & Period Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center space-x-3 text-xs">
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Q1 Volume</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm">${totalRevenue.toLocaleString()}</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Avg Margin</span>
              <span className="font-mono font-extrabold text-emerald-700 text-sm">{avgMargin}%</span>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase">Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-mono text-sm font-extrabold text-slate-900 bg-transparent border-none focus:ring-0 cursor-pointer pr-3"
            >
              {pnlData.map(p => (
                <option key={p.month} value={p.month} className="font-mono">
                  {p.month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Financial Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              ${(currentReport.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                {currentReport.transactionCounts?.revenue || 0} deposits
              </span>
              <span>Toast POS & Catering</span>
            </div>
          </div>
        </div>

        {/* COGS Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">COGS (Food & Bev)</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              ${(currentReport.cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold text-[11px]">
                {currentReport.grossMarginPct}% Margin
              </span>
              <span>Food & Beverage</span>
            </div>
          </div>
        </div>

        {/* Gross Profit Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Profit</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-emerald-700 tracking-tight">
              ${(currentReport.grossProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-mono">
              Formula: <span className="text-slate-800 font-bold">Revenue − COGS</span>
            </div>
          </div>
        </div>

        {/* Operating Profit Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operating Profit</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              (currentReport.operatingProfit || 0) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className={`text-3xl font-extrabold font-mono tracking-tight ${
              (currentReport.operatingProfit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              ${(currentReport.operatingProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                {currentReport.operatingMarginPct}% Op Margin
              </span>
              <span>(EBITDA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Quarterly Financial Performance
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                GAAP Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Comparison across Revenue, Wholesale Cost of Goods, and Operating Profit</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs">
              <button
                onClick={() => setChartMode('bars')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  chartMode === 'bars' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Comparison Bars
              </button>
              <button
                onClick={() => setChartMode('trend')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  chartMode === 'trend' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profit Curve
              </button>
            </div>

            <Link
              to="/pnl"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition inline-flex items-center gap-1"
            >
              <span>Full P&L Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recharts Chart Viewport */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'bars' ? (
              <BarChart data={chartData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Bar dataKey="Revenue" fill="#059669" radius={[6, 6, 0, 0]} name="Sales Revenue ($)" />
                <Bar dataKey="COGS" fill="#e11d48" radius={[6, 6, 0, 0]} name="Cost of Goods ($)" />
                <Bar dataKey="OperatingProfit" fill="#2563eb" radius={[6, 6, 0, 0]} name="Operating Profit ($)" />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="GrossProfit" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#profitGrad)" name="Gross Profit ($)" />
                <Area type="monotone" dataKey="OperatingProfit" stroke="#2563eb" strokeWidth={3} fill="none" name="Operating Profit ($)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Review Alert & Material Variances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Review Queue Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Review Queue Pending</h2>
                <p className="text-xs text-slate-500">{pendingReviews.length} transaction flags requiring accounting review</p>
              </div>
            </div>
            <Link
              to="/review"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              Open Queue &rarr;
            </Link>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions currently requiring human review. All classifications verified.
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {pendingReviews.slice(0, 3).map((item) => (
                <div
                  key={item.transactionId}
                  onClick={() => setSelectedTxn(item)}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition cursor-pointer flex justify-between items-center text-xs group"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition flex items-center gap-1.5 truncate">
                      <span className="truncate">{item.description}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold shrink-0">
                        {item.transactionId}
                      </span>
                    </div>
                    <div className="text-amber-800 text-[11px] truncate">{item.reviewReason}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-base font-bold text-slate-900">
                      ${Math.abs(item.amount).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">Inspect</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Material Variances Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Material Period Shifts</h2>
                <p className="text-xs text-slate-500">Variances exceeding $1,000 & 15% threshold</p>
              </div>
            </div>
            <Link
              to="/variance"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              Analyze Drivers &rarr;
            </Link>
          </div>

          {variances.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No material variances flagged under configured thresholds.
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {variances.slice(0, 3).map((v) => {
                const isIncrease = v.absoluteChange >= 0;
                return (
                  <div key={v.key} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{v.lineItem}</div>
                      <div className="text-slate-500 text-xs font-mono mt-0.5">
                        ${v.priorAmount.toLocaleString()} &rarr; ${v.currentAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold text-sm flex items-center justify-end ${
                        isIncrease ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isIncrease ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                        {isIncrease ? '+' : '-'}${Math.abs(v.absoluteChange).toLocaleString()}
                      </div>
                      {v.percentChange !== null && (
                        <span className="text-[11px] text-slate-500 font-mono font-semibold">
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

      {/* AI Assistant Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Financial Analyst Grounded on Live Data</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">Have a financial question about NYC Restaurant Co.?</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            "What drove the increase in food costs?", "Why did operating profit change between February and March?" — all answered with verified figures and invoice evidence cards.
          </p>
        </div>
        <Link
          to="/analyst"
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition whitespace-nowrap shadow-sm"
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
