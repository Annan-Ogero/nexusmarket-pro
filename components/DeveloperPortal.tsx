
import React, { useState } from 'react';
import { ShieldCheck, Zap, Copy, CheckCircle2, Terminal, Landmark, Wallet, ArrowLeft, Key } from 'lucide-react';
import { generateActivationKey } from '../services/geminiService';

const DeveloperPortal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [days, setDays] = useState(30);
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const key = generateActivationKey(days);
    setGeneratedKey(key);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-500">
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4 text-white">
           <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20"><Terminal size={24}/></div>
           <h2 className="text-xl font-black uppercase tracking-tighter">Nexus Dev Console</h2>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={18}/> Exit Terminal
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div className="space-y-8">
             <div>
               <h3 className="text-3xl font-black text-white mb-4">Provision Access</h3>
               <p className="text-slate-500 font-medium leading-relaxed">Select the duration paid for via M-PESA or Intl Card. The system will generate a cryptographically signed key for the user.</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <DaySelector active={days === 14} label="Trial (14d)" onClick={() => setDays(14)} />
                <DaySelector active={days === 30} label="Monthly (30d)" onClick={() => setDays(30)} />
                <DaySelector active={days === 90} label="Quarterly (90d)" onClick={() => setDays(90)} />
                <DaySelector active={days === 365} label="Yearly (365d)" onClick={() => setDays(365)} />
             </div>

             <button 
                onClick={handleGenerate}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-4"
             >
                <Zap size={24}/> Generate Signed Key
             </button>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden flex flex-col justify-center">
             {generatedKey ? (
                <div className="space-y-6 relative z-10 animate-in zoom-in-95">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">Active Activation Key</p>
                   <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
                      <code className="text-white text-3xl font-black tracking-widest break-all leading-tight">
                        {generatedKey}
                      </code>
                   </div>
                   <button 
                      onClick={copyToClipboard}
                      className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${
                        copied ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                   >
                      {copied ? <CheckCircle2 size={24}/> : <Copy size={24}/>}
                      {copied ? 'Copied to Clipboard' : 'Copy Key for User'}
                   </button>
                </div>
             ) : (
                <div className="text-center space-y-4 opacity-30 relative z-10">
                   <Key size={80} className="mx-auto text-slate-500"/>
                   <p className="text-sm font-black uppercase tracking-widest text-slate-500">Awaiting Provisioning Command</p>
                </div>
             )}
             <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600 rounded-full blur-[150px] opacity-10"></div>
          </div>

        </div>
      </div>

      <div className="p-10 border-t border-white/5 bg-slate-950">
         <div className="max-w-6xl mx-auto flex flex-wrap gap-10 items-center justify-center opacity-40 grayscale">
            <PaymentBadge icon={<Wallet/>} label="M-PESA" />
            <PaymentBadge icon={<Landmark/>} label="Flutterwave" />
            <PaymentBadge icon={<ShieldCheck/>} label="SHA-256 Validated" />
         </div>
      </div>
    </div>
  );
};

const DaySelector = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
      active ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const PaymentBadge = ({ icon, label }: any) => (
  <div className="flex items-center gap-3 text-white">
    {icon}
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default DeveloperPortal;
