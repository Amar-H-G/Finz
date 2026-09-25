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
  Database
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

  const navLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/pnl', label: 'P&L Statement', icon: FileSpreadsheet },
    { to: '/variance', label: 'Variance', icon: GitCompare },
    { to: '/transactions', label: 'Ledger', icon: Receipt },
    { to: '/review', label: 'Review Queue', icon: AlertTriangle, badge: pendingCount },
    { to: '/analyst', label: 'AI Analyst', icon: Bot, isAi: true },
    { to: '/import', label: 'Ingest', icon: UploadCloud }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-glow-emerald group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <span className="font-mono font-bold text-lg text-emerald-400 tracking-tighter">FZ</span>
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    Finz
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AI-Native
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium -mt-0.5 flex items-center gap-1">
                  <span>NYC Restaurant Co.</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400/80">Atlas Live</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all relative ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>

                  {item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-glow-amber animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {item.isAi && (
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse-subtle ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                seedSuccess
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
                  : 'bg-white/[0.03] border-white/[0.1] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white'
              }`}
              title="Reload the 102 verified transactions for NYC Restaurant Co."
            >
              {seedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NYC Data Loaded!</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Syncing...' : 'Load NYC Data'}</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/[0.08] bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => { setMobileMenuOpen(false); handleSeedDemo(); }}
              disabled={seeding}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Syncing...' : 'Load Verified NYC Data'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
