
import React, { useState, useEffect } from 'react';
import { 
  Users, Trash2, ShieldCheck, Sparkles, History, UserPlus, X, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Award, TrendingUp, Zap, Heart
} from 'lucide-react';
import { MOCK_STAFF } from '../constants';
import { analyzeStaffLoyalty } from '../services/geminiService';
import { UserRole } from '../types';

const Staff: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roster' | 'loyalty' | 'audit'>('roster');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loyaltyInsights, setLoyaltyInsights] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'CASHIER', pin: '' });
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('nexus_staff');
    const list = saved ? JSON.parse(saved) : MOCK_STAFF;
    setStaffList(list);
    
    fetchLoyalty(list);
  }, []);

  const fetchLoyalty = async (list: any[]) => {
    setLoadingAI(true);
    const result = await analyzeStaffLoyalty(list);
    setLoyaltyInsights(result);
    setLoadingAI(false);
  };

  const saveStaffList = (newList: any[]) => {
    setStaffList(newList);
    localStorage.setItem('nexus_staff', JSON.stringify(newList));
    fetchLoyalty(newList);
  };

  const togglePinVisible = (id: string) => {
    setShowPin(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddStaff = () => {
    if (!newStaff.name || newStaff.pin.length !== 6) {
      setPinError('Name and 6-digit PIN required');
      return;
    }
    if (staffList.some(s => s.pin === newStaff.pin)) {
      setPinError('PIN already assigned to another staff member');
      return;
    }

    const createdStaff = {
      id: 's' + Date.now(),
      ...newStaff,
      avatar: `https://i.pravatar.cc/150?u=${newStaff.name}`,
      metrics: { itemsPerMinute: 0, accuracy: 100, customerSatisfaction: 5, totalTransactions: 0, shiftSales: 0, badges: [], integrityScore: 100 }
    };

    saveStaffList([...staffList, createdStaff]);
    setShowAddModal(false);
    setNewStaff({ name: '', role: 'CASHIER', pin: '' });
    setPinError('');
  };

  const deleteStaff = (id: string) => {
    if (window.confirm("Terminate this employee's system access immediately?")) {
      saveStaffList(staffList.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Workforce Command</h2>
          <p className="text-slate-500 text-lg font-medium">Performance tracking & credential provisioning</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <TabButton active={activeTab === 'roster'} onClick={() => setActiveTab('roster')} label="Team Roster" />
            <TabButton active={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} label="Talent Insights" />
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
            <UserPlus size={24}/> Provision Identity
          </button>
        </div>
      </div>

      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staffList.map(member => (
            <div key={member.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <button onClick={() => deleteStaff(member.id)} className="absolute top-6 right-6 p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={20}/>
              </button>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img src={member.avatar} className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-50 shadow-sm" alt=""/>
                  {member.metrics.integrityScore > 95 && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                      <ShieldCheck size={14}/>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 leading-tight">{member.name}</h4>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{member.role}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl mb-6 border border-slate-100 group-hover:border-blue-100 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature PIN</p>
                  <button onClick={() => togglePinVisible(member.id)} className="text-blue-600 hover:text-blue-800">
                    {showPin[member.id] ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <p className="text-2xl font-black tracking-[0.4em] text-slate-900">
                  {showPin[member.id] ? member.pin : '••••••'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <MetricBox value={`${member.metrics.integrityScore}%`} label="Integrity" />
                 <MetricBox value={`${member.metrics.itemsPerMinute}`} label="IPM" />
                 <MetricBox value={`${member.metrics.accuracy}%`} label="Accuracy" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'loyalty' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-[500px]">
             <div className="relative z-10">
               <div className="flex items-center gap-4 mb-10">
                 <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-lg"><Zap size={32}/></div>
                 <div>
                   <h3 className="text-3xl font-black tracking-tight">Talent Recognition</h3>
                   <p className="text-blue-400 font-bold uppercase text-xs tracking-widest">AI Top Performer Analysis</p>
                 </div>
               </div>
               
               {loadingAI ? (
                 <div className="space-y-4 animate-pulse">
                   <div className="h-20 bg-white/5 rounded-3xl"></div>
                   <div className="h-20 bg-white/5 rounded-3xl"></div>
                 </div>
               ) : (
                 <div className="space-y-8">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                       <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Gemini Recognition Nudge</p>
                       <p className="text-2xl font-black mb-4 leading-tight">{loyaltyInsights?.topPerformer || "Evaluating Workforce..."}</p>
                       <p className="text-slate-400 font-medium italic">"{loyaltyInsights?.recognitionNudge}"</p>
                    </div>
                 </div>
               )}
             </div>
             <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-10"></div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col justify-between h-[500px]">
             <div>
               <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                 <Award className="text-amber-500" size={28}/> Recognition Ledger
               </h3>
               <div className="space-y-4">
                 {loadingAI ? (
                    [1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>)
                 ) : (
                   loyaltyInsights?.loyaltyBonusSuggestions?.map((bonus: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:border-blue-500 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400">{bonus.name[0]}</div>
                           <div>
                              <p className="font-black text-slate-900 leading-tight">{bonus.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{bonus.bonusReason || 'High Performance'}</p>
                           </div>
                        </div>
                        <button className="bg-blue-600 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-blue-500/20">
                           <Zap size={16}/>
                        </button>
                     </div>
                   ))
                 )}
               </div>
             </div>
             <div className="bg-emerald-50 p-6 rounded-3xl flex items-center gap-4 border border-emerald-100">
               <Heart className="text-emerald-500 fill-emerald-500" size={24}/>
               <p className="text-xs font-bold text-emerald-800 leading-relaxed">System monitoring suggests current staff morale is <span className="font-black uppercase tracking-widest">Optimal (98%)</span> based on efficiency metrics.</p>
             </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Provision Identity</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={32}/></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Staff Name</label>
                  <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-lg font-bold outline-none focus:border-blue-600" placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">6-Digit Secret PIN</label>
                  <input type="password" maxLength={6} value={newStaff.pin} onChange={e => setNewStaff({...newStaff, pin: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 px-6 text-2xl font-black tracking-[0.5em] outline-none focus:border-blue-600" placeholder="••••••" />
                  {pinError && <p className="mt-4 text-rose-600 font-bold text-xs">{pinError}</p>}
                </div>
                <div className="pt-6">
                  <button onClick={handleAddStaff} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4">Confirm Provisioning <CheckCircle2 size={24}/></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBox = ({ value, label }: any) => (
  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <p className="text-lg font-black text-slate-900">{value}</p>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

const TabButton: React.FC<any> = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
    active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
  }`}>
    {label}
  </button>
);

export default Staff;
