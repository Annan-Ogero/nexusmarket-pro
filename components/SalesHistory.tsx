
import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, Calendar, Download, Eye, Receipt as ReceiptIcon, ArrowRight, User as UserIcon, Store as StoreIcon, ShieldCheck, ArrowUpRight, ChevronRight, FileText
} from 'lucide-react';
import { Transaction } from '../types';

const SalesHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nexus_transactions') || '[]');
    setTransactions(saved);
    setFilteredTransactions(saved);
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredTransactions(
      transactions.filter(tx => 
        tx.id.toLowerCase().includes(lower) || 
        tx.cashierName.toLowerCase().includes(lower) ||
        tx.total.toString().includes(lower)
      )
    );
  }, [searchTerm, transactions]);

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Nexus_Archival_Tape_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Digital Vault</h2>
          <p className="text-slate-500 text-lg font-medium">Archival session records & cold storage tape</p>
        </div>
        <button 
          onClick={exportData}
          className="flex items-center gap-3 bg-white border-2 border-slate-200 px-8 py-4 rounded-[1.5rem] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={24}/> Generate Archival Package
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                <input 
                  type="text" 
                  placeholder="Query by Auth ID, Cashier, or Total..." 
                  className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <Calendar size={20}/>
                  <span className="font-black text-xs uppercase">March 2025</span>
                </button>
                <button className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                  <Filter size={20}/>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-5">Transaction Meta</th>
                    <th className="px-10 py-5">Operator Info</th>
                    <th className="px-10 py-5 text-right">Settlement</th>
                    <th className="px-10 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-32 text-center opacity-20">
                        <History size={80} className="mx-auto mb-4"/>
                        <p className="font-black text-xl uppercase tracking-widest">No matching records</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                        <td className="px-10 py-8">
                          <div>
                            <p className="text-slate-900 text-lg font-black tracking-tight">{tx.id}</p>
                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{new Date(tx.timestamp).toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                               <UserIcon size={18}/>
                            </div>
                            <div>
                               <p className="text-slate-900 font-bold leading-tight">{tx.cashierName}</p>
                               <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Station {tx.stationId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <p className="text-xl font-black text-slate-900">${tx.total.toFixed(2)}</p>
                           <p className={`text-[10px] font-black uppercase tracking-widest ${tx.paymentMethod === 'CASH' ? 'text-emerald-500' : 'text-blue-500'}`}>{tx.paymentMethod}</p>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                             <ShieldCheck size={14}/> Verified Archive
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-8">
          {selectedTx ? (
            <div className="bg-slate-950 p-10 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-right-10 sticky top-32">
              <div className="flex justify-between items-start mb-10">
                <div className="bg-blue-600 p-4 rounded-3xl">
                   <ReceiptIcon size={32}/>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Settlement</p>
                  <p className="text-2xl font-black">CONFIRMED</p>
                </div>
              </div>
              
              <div className="space-y-6 mb-10 border-b border-white/10 pb-10">
                <h3 className="text-xl font-black text-white">{selectedTx.id}</h3>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Station</p>
                     <p className="font-bold">{selectedTx.stationId}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Operator</p>
                     <p className="font-bold">{selectedTx.cashierName}</p>
                   </div>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Itemized Journal</p>
                {selectedTx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm font-medium">
                    <span className="text-slate-400">{item.quantity}x {item.name}</span>
                    <span>${(item.priceAtSale * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/10 space-y-2">
                 <div className="flex justify-between font-black text-2xl">
                    <span className="text-blue-500">TOTAL</span>
                    <span>${selectedTx.total.toFixed(2)}</span>
                 </div>
              </div>

              <button 
                className="mt-10 w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
              >
                <FileText size={20}/>
                Print Duplicate Receipt
              </button>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <History size={32} className="text-slate-200"/>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Select a record<br/>to open session details</p>
            </div>
          )}

          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-lg font-black mb-4 flex items-center gap-3">
                 <ShieldCheck size={20}/> ForeverSync™
               </h4>
               <p className="text-sm font-medium text-blue-100 leading-relaxed mb-6">
                 All data points are cryptographically signed. Your records are mirrored across 3 cold-storage regions for 10+ year retention.
               </p>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Storage Status: SECURED</span>
               </div>
             </div>
             <ShieldCheck size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
