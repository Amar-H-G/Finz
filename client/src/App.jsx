import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PnlReport from './pages/PnlReport.jsx';
import VarianceAnalysis from './pages/VarianceAnalysis.jsx';
import Transactions from './pages/Transactions.jsx';
import ReviewQueue from './pages/ReviewQueue.jsx';
import AiAnalyst from './pages/AiAnalyst.jsx';
import DataImport from './pages/DataImport.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pnl" element={<PnlReport />} />
          <Route path="/variance" element={<VarianceAnalysis />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/analyst" element={<AiAnalyst />} />
          <Route path="/import" element={<DataImport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>Finz AI-Native Financial Review Platform &bull; NYC Restaurant Co. Technical Challenge &bull; Built with MERN Stack</p>
      </footer>
    </div>
  );
}
