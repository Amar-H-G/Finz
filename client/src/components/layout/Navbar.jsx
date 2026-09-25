import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  GitCompare,
  AlertTriangle,
  Bot,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getReviewItems, seedSampleData } from '../../services/api.js';

export default function Navbar() {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchBadge = async () => {
    try {
      const res = await getReviewItems('Pending Review');
      if (res.success) {
        setPendingCount(res.count || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBadge();
    const interval = setInterval(fetchBadge, 12000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await seedSampleData();
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  // Structured nav items: Core reporting vs Intelligent tools
  const coreNavLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/pnl', label: 'P&L Statement', icon: FileSpreadsheet },
    { to: '/variance', label: 'Variance', icon: GitCompare },
    { to: '/transactions', label: 'Ledger', icon: Receipt },
  ];

  const intelligenceNavLinks = [
    { to: '/review', label: 'Review Queue', icon: AlertTriangle, badge: pendingCount },
    { to: '/analyst', label: 'AI Analyst', icon: Bot, isAi: true },
    { to: '/import', label: 'Import CSV', icon: UploadCloud }
  ];

  const allNavLinks = [...coreNavLinks, ...intelligenceNavLinks];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo & Client Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-mono font-extrabold text-sm tracking-tight group-hover:bg-emerald-700 transition">
                FZ
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                    Finz
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  NYC Restaurant Co.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Bar - Well-spaced with logical grouping */}
          <nav className="hidden xl:flex items-center space-x-1 border border-slate-200 bg-slate-50/70 p-1 rounded-xl">
            {/* Core Financials */}
            <div className="flex items-center space-x-0.5">
              {coreNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* AI & Ops Tools */}
            <div className="flex items-center space-x-0.5">
              {intelligenceNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>

                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-extrabold rounded-full">
                        {item.badge}
                      </span>
                    )}

                    {item.isAi && (
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Medium Screen Responsive Nav (Compact without clutter) */}
          <nav className="hidden md:flex xl:hidden items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            {allNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Sync / Seed Demo Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border shadow-xs ${
                seedSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400'
              }`}
              title="Reset and reload verified Q1 2025 dataset for NYC Restaurant Co."
            >
              {seedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold">Loaded</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${seeding ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{seeding ? 'Syncing...' : 'Reload Sample Data'}</span>
                  <span className="sm:hidden">{seeding ? '...' : 'Sync'}</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Financial Statements
          </div>
          {coreNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </Link>
            );
          })}

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-3 py-1">
            Intelligence & Automation
          </div>
          {intelligenceNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.isAi && <Sparkles className="w-3 h-3 text-emerald-600" />}
                </div>
                {item.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => { setMobileMenuOpen(false); handleSeedDemo(); }}
              disabled={seeding}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Syncing...' : 'Reload NYC Restaurant Co. Sample Data'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
