
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Zap, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { askConsultant } from '../services/geminiService';
import { MOCK_PRODUCTS } from '../constants';

const AIConsultant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', text: string}>>([
    { role: 'ai', text: "Operational brain online. How can I optimize your shift today?" }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!query.trim() || isThinking) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    // Prepare context
    const transactions = JSON.parse(localStorage.getItem('nexus_transactions') || '[]');
    const staff = JSON.parse(localStorage.getItem('nexus_staff') || '[]');
    const context = {
      recentTransactionsCount: transactions.length,
      totalDailyRevenue: transactions.reduce((acc: number, tx: any) => acc + tx.total, 0),
      staffCount: staff.length,
      inventorySummary: MOCK_PRODUCTS.map(p => ({ name: p.name, stock: p.stock })),
      timestamp: new Date().toISOString()
    };

    const response = await askConsultant(userMsg, context);
    setIsThinking(false);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 w-20 h-20 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group overflow-hidden border-4 border-white"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
        <Bot size={32} className="relative z-10 group-hover:animate-bounce"/>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-10 right-10 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 z-[100] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl"><Bot size={20}/></div>
          <div>
            <p className="font-black text-sm">Nexus Consultant</p>
            <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Active Intelligence</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 space-y-4 max-h-[400px] overflow-y-auto bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-lg' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          placeholder="Ask operational questions..."
          className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={isThinking}
          className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          <Send size={20}/>
        </button>
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between">
         <div className="flex gap-2">
            <QuickAsk label="Risk" onClick={() => setQuery("Any operational risks today?")} />
            <QuickAsk label="Top Cashier" onClick={() => setQuery("Who is my most efficient cashier right now?")} />
         </div>
      </div>
    </div>
  );
};

const QuickAsk = ({ label, onClick }: any) => (
  <button onClick={onClick} className="text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 px-3 py-1 rounded-md text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all">
    {label}
  </button>
);

export default AIConsultant;
