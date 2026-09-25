import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  FileSpreadsheet,
  Check,
  Database
} from 'lucide-react';
import { uploadCsv, seedSampleData, getImportBatches } from '../services/api.js';

export default function DataImport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await getImportBatches();
      if (res.success) {
        setBatches(res.data);
      }
    } catch (err) {
      console.error('Failed to load batches:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.name.endsWith('.csv')) {
        setError('Only CSV files are supported.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(f);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadCsv(file);
      if (res.success) {
        setResult(res.data);
        setFile(null);
        loadBatches();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleQuickSeed = async () => {
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await seedSampleData();
      if (res.success) {
        setResult(res.data);
        loadBatches();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Bank Data Ingestion</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold uppercase">
              ETL Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Safely parse bank feeds, normalize amount formats, flag duplicate charges, and trigger the hybrid classification pipeline.
          </p>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 sm:p-12 text-center transition cursor-pointer bg-slate-50 hover:bg-emerald-50/30">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer space-y-3 block">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {file ? file.name : 'Click to select CSV file, or drag and drop'}
              </div>
              <p className="text-xs text-slate-500">
                Supports Standard Bank & Credit Card CSV exports (up to 10MB)
              </p>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleQuickSeed}
              disabled={uploading}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-slate-700 bg-white text-xs font-bold rounded-lg hover:bg-slate-50 transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${uploading ? 'animate-spin' : ''}`} />
              <span>Load Verified NYC Restaurant Co. Dataset</span>
            </button>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-40 shadow-sm"
            >
              {uploading ? 'Processing Ingestion...' : 'Ingest File & Categorize'}
            </button>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Summary Card */}
        {result && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Ingestion Complete: Batch {result.batchId}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-500 block">Total Rows:</span>
                <span className="text-base font-bold font-mono text-slate-900">{result.totalRowsProcessed}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-500 block">Imported:</span>
                <span className="text-base font-bold font-mono text-emerald-700">{result.importedCount}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-500 block">Skipped Duplicates:</span>
                <span className="text-base font-bold font-mono text-amber-700">{result.skippedDuplicatesCount}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-500 block">Failed Rows:</span>
                <span className="text-base font-bold font-mono text-rose-700">{result.failedRowsCount}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <Link
                to="/transactions"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Inspect Imported Transactions &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Past Import Batches History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Recent Ingestion Batches</h2>
        {batches.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">No previous batches recorded.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {batches.map((b) => (
              <div key={b.batchId} className="py-3.5 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900">{b.filename}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Batch: {b.batchId} • {new Date(b.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-700 font-bold">{b.importedCount} rows</span>
                  {b.skippedDuplicatesCount > 0 && (
                    <span className="text-slate-500 text-[11px] ml-2">({b.skippedDuplicatesCount} dupes skipped)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
