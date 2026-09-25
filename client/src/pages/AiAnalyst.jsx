import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Receipt,
  Layers,
  ArrowRight,
  HelpCircle,
  Clock,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { askAnalyst } from '../services/api.js';
import TransactionDrawer from '../components/common/TransactionDrawer.jsx';

const SAMPLE_QUESTIONS = [
  "What was our revenue in March?",
  "Why did operating profit change between February and March?",
  "What drove the increase in food costs?",
  "How much did we spend on payroll each month?",
  "Which transactions need my attention?"
];

export default function AiAnalyst() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your AI Financial Analyst for NYC Restaurant Co. Every figure and driver I present is deterministically grounded in verified bank transactions and GAAP operational metrics. How can I help analyze your performance today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q || q.trim() === '') return;

    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAnalyst(q);
      if (res.success) {
        const aiMsg = {
          sender: 'ai',
          text: res.data.answer,
          verifiedData: res.data.verifiedData,
          evidence: res.data.evidence,
          source: res.data.source,
          model: res.data.model,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `I encountered an issue processing your query: ${err.response?.data?.error || err.message}. Please ensure the financial dataset is loaded.`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AI Financial Analyst</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Grounding
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Grounded intelligence powered by Google Gemini and deterministic general ledger queries. Zero hallucinations.
          </p>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Recommended Prompt Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              disabled={loading}
              className="text-xs px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition text-left shadow-sm font-medium"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Terminal Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/60">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-2 mb-1.5 px-1">
                {m.sender === 'ai' ? (
                  <>
                    <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                      F
                    </div>
                    <span className="text-xs font-bold text-slate-800">Finz Analyst</span>
                    {m.model && (
                      <span className="text-[10px] font-mono text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-medium">
                        {m.model}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-700">You</span>
                )}
                <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 sm:p-5 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                    : m.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-3.5 shadow-sm'
                }`}
              >
                <div className={`whitespace-pre-line ${m.sender === 'user' ? 'text-white' : 'text-slate-800'}`}>{m.text}</div>

                {/* Grounded Evidence Card */}
                {m.evidence && m.evidence.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supporting Transaction Evidence ({m.evidence.length})</span>
                      </span>
                      {m.verifiedData?.verifiedAmount && (
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {m.verifiedData.verifiedAmount}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {m.evidence.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTxn({ ...t, transactionId: t.id })}
                          className="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition cursor-pointer text-xs space-y-1.5 group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-emerald-700 text-[11px] group-hover:underline">{t.id}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{t.date}</span>
                          </div>
                          <div className="font-semibold text-slate-800 truncate" title={t.description}>
                            {t.description}
                          </div>
                          <div className="flex justify-between items-center pt-1 font-mono border-t border-slate-200">
                            <span className="text-[10px] text-slate-600">{t.category}</span>
                            <span className={`font-bold ${t.amount >= 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                              ${Math.abs(t.amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs py-3 px-1 animate-pulse">
              <Bot className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>Verifying general ledger math and synthesizing financial explanation...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-200 bg-white flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a financial question (e.g. 'What was our revenue in March?' or 'Why did food costs change?')..."
            className="flex-1 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-40 transition shadow-sm"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>

      {/* Transaction Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
}
