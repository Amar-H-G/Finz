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
  Sparkles
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
                <span className="font-mono font-extrabold text-lg tracking-tight">FZ</span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Finz
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    AI-Native
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium -mt-0.5 flex items-center gap-1.5">
                  <span>NYC Restaurant Co.</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold">Live System</span>
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all relative ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>

                  {item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-extrabold rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {item.isAi && (
                    <Sparkles className="w-3 h-3 text-emerald-600 ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action Button */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                seedSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs'
              }`}
              title="Reload the 102 verified transactions for NYC Restaurant Co."
            >
              {seedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>NYC Data Loaded!</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-4 h-4 text-emerald-600 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Syncing...' : 'Load NYC Data'}</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => { setMobileMenuOpen(false); handleSeedDemo(); }}
              disabled={seeding}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs"
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
