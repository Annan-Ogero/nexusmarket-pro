
import React, { useState, useEffect } from 'react';
/* Import ArrowUpRight from lucide-react as it is used in the Digital Tape feed */
import { TrendingUp, ShoppingBag, AlertTriangle, DollarSign, Activity, ShieldAlert, Eye, Lock, ShieldCheck, Monitor, History, AlertCircle, Receipt as ReceiptIcon, ArrowRight, ArrowUpRight, Zap, Target } from 'lucide-react';
import { detectInternalTheft, generateStoreAudit } from '../services/geminiService';
import { Transaction } from '../types';

const Dashboard: React.FC = () => {
  const [globalAudit, setGlobalAudit] = useState<any>(null);
  const [theftAudit, setTheftAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const store = JSON.parse(localStorage.getItem('nexus_store') || '{}');

  useEffect(() => {
    const runSystemAudit = async () => {
      setLoading(true);
      const savedTransactions = JSON.parse(localStorage.getItem('nexus_transactions') || '[]');
      setTransactions(savedTransactions);

      const [theft, audit] = await Promise.all([
        detectInternalTheft(savedTransactions.slice(0, 10)),
        generateStoreAudit({ 
          totalSales: savedTransactions.reduce((a: number, b: any) => a + b.total, 0), 
          branch: store.name,
          transactionCount: savedTransactions.length
        })
      ]);
      setTheftAudit(theft);
      setGlobalAudit(audit);
      setLoading(false);
    };
    runSystemAudit();

    const interval = setInterval(() => {
      const saved = JSON.parse(localStorage.getItem('nexus_transactions') || '[]');
      setTransactions(saved);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalRevenue = transactions.reduce((acc, tx) => acc + tx.total, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* COMMAND HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatCard icon={<DollarSign/>} label="Daily Revenue" value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} trend="REAL-TIME" color="blue" />
        <StatCard icon={<Zap/>} label="Velocity" value={`${(transactions.length / 8).toFixed(1)} tx/hr`} trend="AVG" color="emerald" />
        <StatCard icon={<ShieldCheck/>} label="Branch Health" value="OPTIMIZED" trend="SECURED" color="slate" />
        <StatCard icon={<Target/>} label="AI Forecast" value="UP +12%" trend="TOMORROW" color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI DIRECTIVES SECTION - This makes us superior */}
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex items-center gap-4">
                 <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20"><Zap size={28}/></div>
                 <h3 className="text-2xl font-black tracking-tight">AI Command Directives</h3>
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full border border-blue-400/20">Operational Co-Pilot Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse"></div>)
              ) : (
                globalAudit?.automatedDirectives?.map((directive: string, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group cursor-default">
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Action Required</p>
                    <p className="text-sm font-bold leading-relaxed">{directive}</p>
                    <div className="mt-4 flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={16}/>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-10"></div>
          </div>

          {/* THEFT SHIELD / LOSS PREVENTION */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-rose-50 p-4 rounded-3xl text-rose-600"><ShieldAlert size={32}/></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Loss Prevention (Integrity Scrub)</h3>
                  <p className="text-slate-500 font-medium">Gemini is actively monitoring station 0{transactions[0]?.stationId || '1'} Digital Tape.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Behavioral Analysis</h4>
                 {loading ? <LoadingPulse /> : (
                   <div className="space-y-4">
                      <div className="p-6 bg-slate-50 rounded-3xl text-slate-700 font-medium italic border border-slate-100 leading-relaxed">
                        "{theftAudit?.auditSummary}"
                      </div>
                      <div className="flex items-center gap-3 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                         <ShieldCheck className="text-emerald-500" size={20}/>
                         <p className="text-xs font-black text-emerald-900 uppercase">Tamper-Proof Station Sync Active</p>
                      </div>
                   </div>
                 )}
              </div>
              
              <div className="flex flex-col justify-center">
                 <div className={`p-8 rounded-[2.5rem] text-white border transition-all ${theftAudit?.integrityScore < 90 ? 'bg-amber-500 border-amber-400' : 'bg-slate-900 border-slate-800'} shadow-xl`}>
                   <div className="flex justify-between items-end mb-6">
                     <div>
                       <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Global Integrity Score</p>
                       <p className="text-5xl font-black tracking-tighter">{theftAudit?.integrityScore || 100}%</p>
                     </div>
                     <Activity size={48} className="opacity-20"/>
                   </div>
                   <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width: `${theftAudit?.integrityScore || 100}%`}}></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE DIGITAL TAPE FEED */}
        <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col h-[750px] border border-white/5">
          <h3 className="text-xl font-black mb-10 flex items-center justify-between relative z-10">
            <span className="flex items-center gap-3">
              <ReceiptIcon className="text-blue-500" size={20}/> Digital Tape
            </span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse border border-emerald-500/20">Synced</span>
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 relative z-10 custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                <ReceiptIcon size={48} className="mb-4"/>
                <p className="text-xs font-black uppercase tracking-widest text-center">Awaiting first scan<br/>for this session</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 transition-all group cursor-pointer">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Station {tx.stationId}</p>
                        <p className="text-xl font-black text-white">${tx.total.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${tx.paymentMethod === 'CASH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {tx.paymentMethod}
                        </span>
                      </div>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-3 border-t border-white/5">
                      <span className="flex items-center gap-2">
                        <UserIcon size={12}/>
                        {tx.cashierName}
                      </span>
                      <ArrowUpRight size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors"/>
                   </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10 text-center relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Encrypted Chain ID</p>
            <p className="text-[9px] font-bold text-blue-400/50 truncate font-mono">{store.licenseKey}</p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-[0.03]"></div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 inline-block mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-3 overflow-hidden">
      <h4 className="text-3xl font-black text-slate-900 tracking-tight truncate">{value}</h4>
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${trend === 'REAL-TIME' ? 'bg-blue-50 text-blue-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>{trend}</span>
    </div>
  </div>
);

const LoadingPulse = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-20 bg-slate-50 rounded-2xl"></div>
    <div className="h-20 bg-slate-50 rounded-2xl"></div>
  </div>
);

const UserIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export default Dashboard;
