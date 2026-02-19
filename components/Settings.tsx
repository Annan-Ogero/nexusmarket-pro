
import React, { useState } from 'react';
import { Settings as SettingsIcon, Monitor, ShieldAlert, Key, RefreshCw, Trash2, CheckCircle2, Cpu, Globe, Lock, ShieldCheck, Fingerprint, ChevronRight, X, CreditCard, Sparkles, Zap, Package, BarChart3, Wallet, Landmark, ArrowRight, Ticket, Receipt } from 'lucide-react';
import { SYSTEM_DEFAULTS } from '../constants';
import { validateRenewalKey } from '../services/geminiService';

const Settings: React.FC = () => {
  const store = JSON.parse(localStorage.getItem('nexus_store') || '{}');
  const [isWiping, setIsWiping] = useState(false);
  
  // PIN Change State
  const [showPinForm, setShowPinForm] = useState(false);
  const [pinStage, setPinStage] = useState<'current' | 'new'>('current');
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Subscription State
  const [currentPlan, setCurrentPlan] = useState(store.plan || 'PRO');
  const [activationKey, setActivationKey] = useState('');
  const [activationError, setActivationError] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);

  const handleDeactivate = () => {
    if (window.confirm("CRITICAL: This will permanently de-activate this terminal. You will need the master license key to re-activate this hardware. Proceed?")) {
      setIsWiping(true);
      setTimeout(() => {
        localStorage.removeItem('nexus_store');
        localStorage.removeItem('nexus_user');
        window.location.reload();
      }, 1500);
    }
  };

  const updatePlan = (plan: string) => {
    const updatedStore = { ...store, plan };
    localStorage.setItem('nexus_store', JSON.stringify(updatedStore));
    setCurrentPlan(plan);
    window.location.reload();
  };

  const handleRedeemKey = () => {
    const daysToAdd = validateRenewalKey(activationKey);
    if (daysToAdd) {
      const currentExpiry = new Date(store.subscriptionExpiry);
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      
      const updatedStore = { ...store, subscriptionExpiry: baseDate.toISOString() };
      localStorage.setItem('nexus_store', JSON.stringify(updatedStore));
      setActivationSuccess(true);
      setTimeout(() => {
        setActivationSuccess(false);
        setActivationKey('');
        window.location.reload();
      }, 2000);
    } else {
      setActivationError('Invalid or expired activation key.');
    }
  };

  const handlePinUpdate = () => {
    if (pinStage === 'current') {
      if (pinInput === SYSTEM_DEFAULTS.MANAGER_PIN) {
        setPinStage('new');
        setPinInput('');
        setPinError('');
      } else {
        setPinError('Incorrect current Master PIN');
        setPinInput('');
      }
    } else {
      if (pinInput.length === 4) {
        localStorage.setItem('nexus_manager_pin', pinInput);
        setPinSuccess(true);
        setTimeout(() => {
          setShowPinForm(false);
          setPinSuccess(false);
          setPinStage('current');
          setPinInput('');
        }, 2000);
      } else {
        setPinError('New PIN must be exactly 4 digits');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-[1.5rem] flex items-center justify-center shadow-sm">
          <SettingsIcon size={32} className="text-slate-900"/>
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Infrastructure</h2>
          <p className="text-slate-500 text-lg font-medium">Terminal identity & subscription provisioning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard icon={<Monitor/>} label="Terminal Status" value="Online" sub="Linked to Nexus Master" color="emerald" />
        <StatusCard icon={<Cpu/>} label="Logic Engine" value="Gemini 3.0" sub="High-Latency Mode" color="blue" />
        <StatusCard icon={<Globe/>} label="Network Mode" value="Hybrid" sub="Edge Persistence Active" color="indigo" />
      </div>

      {/* SUBSCRIPTION & BILLING SECTION */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200"><CreditCard size={24}/></div>
            <h3 className="text-2xl font-black text-slate-900">Billing & Global Payments</h3>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
             Expiry: {new Date(store.subscriptionExpiry).toLocaleDateString()}
          </div>
        </div>
        
        <div className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <PlanCard 
              name="BASIC" 
              price="Free" 
              desc="For solo kiosks" 
              active={currentPlan === 'BASIC'} 
              features={['1 Terminal', 'Manual Inventory', 'Email Support']} 
              onSelect={() => updatePlan('BASIC')}
            />
            <PlanCard 
              name="PRO" 
              price="$49/mo" 
              desc="For growing markets" 
              active={currentPlan === 'PRO'} 
              premium 
              features={['5 Terminals', 'AI Consultant', 'Auto-Theft Shield']} 
              onSelect={() => updatePlan('PRO')}
            />
            <PlanCard 
              name="ENTERPRISE" 
              price="$149/mo" 
              desc="For chains & clusters" 
              active={currentPlan === 'ENTERPRISE'} 
              features={['Unlimited Terminals', 'Multi-Store Sync', '24/7 Priority Support']} 
              onSelect={() => updatePlan('ENTERPRISE')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* REDEEM SECTION */}
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-black mb-4 flex items-center gap-3"><Ticket size={24} className="text-blue-400"/> Redeem Activation Key</h4>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">Purchased a key from the developer? Enter it here to automatically extend your branch access.</p>
                  
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="RNW-XXXX-XXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-all text-white"
                      value={activationKey}
                      onChange={(e) => {
                        setActivationKey(e.target.value);
                        setActivationError('');
                      }}
                    />
                    {activationError && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest">{activationError}</p>}
                    {activationSuccess && <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Key Validated! Syncing...</p>}
                    
                    <button 
                      onClick={handleRedeemKey}
                      className="w-full py-5 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20"
                    >
                      Sync Key
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-10"></div>
             </div>

             {/* HOW TO PAY SECTION */}
             <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200">
                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><Receipt size={24} className="text-blue-600"/> How to Renew</h4>
                <div className="space-y-6">
                   <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">1</div>
                      <div>
                        <p className="font-bold text-slate-900">Select Payment Method</p>
                        <div className="flex gap-3 mt-2">
                           <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><Wallet size={12} className="text-emerald-500"/> M-PESA: 0118312225</div>
                           <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><CreditCard size={12} className="text-blue-500"/> Intl Card</div>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">2</div>
                      <div>
                        <p className="font-bold text-slate-900">Send Reference to Developer</p>
                        <p className="text-xs text-slate-500 mt-1">Include your Store ID in the transaction note or email to 0118312225.</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">3</div>
                      <div>
                        <p className="font-bold text-slate-900">Receive Key & Activate</p>
                        <p className="text-xs text-slate-500 mt-1">Your encrypted key will be sent via SMS/Email within 5 minutes of verification.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* SECURITY VAULT SECTION */}
      <div className="bg-slate-950 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden group">
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4 text-white">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20"><Lock size={24}/></div>
            <h3 className="text-2xl font-black">Security Vault</h3>
          </div>
          <span className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Master Access</span>
        </div>
        
        <div className="p-10 space-y-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <p className="text-lg font-black text-white mb-2">Master PIN Rotation</p>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Regularly update your management credentials to prevent unauthorized station overrides. Current status: <span className="text-emerald-400 font-bold uppercase text-xs tracking-widest">Secured</span>
                </p>
              </div>
              <button 
                onClick={() => setShowPinForm(true)}
                className="px-8 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black text-lg hover:bg-blue-50 transition-all flex items-center gap-3 active:scale-95"
              >
                <Fingerprint size={24}/>
                Rotate Master PIN
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-white"><Key size={24}/></div>
            <h3 className="text-2xl font-black text-slate-900">License Provisions</h3>
          </div>
          <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">Validated License</span>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Activated Market</p>
              <p className="text-xl font-bold text-slate-900">{store.name}</p>
              <p className="text-sm text-slate-500 font-medium">{store.location}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Master License Key</p>
              <div className="flex items-center gap-3">
                <code className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-mono font-black text-blue-600">
                  {store.licenseKey}
                </code>
                <button className="text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw size={18}/></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIN ROTATION MODAL */}
      {showPinForm && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
              <button onClick={() => setShowPinForm(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X size={32}/></button>
              
              <div className="text-center mb-10">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${pinSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {pinSuccess ? <CheckCircle2 size={32}/> : <Lock size={32}/>}
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">
                  {pinSuccess ? 'PIN Rotated' : pinStage === 'current' ? 'Verify Identity' : 'Set New PIN'}
                </h3>
                <p className="text-slate-500 font-medium">
                  {pinSuccess ? 'Identity credentials updated successfully.' : pinStage === 'current' ? 'Enter current 4-digit Master PIN' : 'Enter a new 4-digit Master PIN'}
                </p>
              </div>

              {!pinSuccess && (
                <div className="space-y-10">
                   <div className="flex justify-center gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${pinInput.length > i ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50'}`}>
                        {pinInput.length > i ? '•' : ''}
                      </div>
                    ))}
                  </div>

                  {pinError && <p className="text-center text-rose-600 font-black text-xs tracking-widest animate-bounce">{pinError}</p>}

                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3,4,5,6,7,8,9, 'CLR', 0, 'OK'].map(val => (
                      <button 
                        key={val}
                        onClick={() => {
                          if (val === 'CLR') setPinInput('');
                          else if (val === 'OK') handlePinUpdate();
                          else if (pinInput.length < 4) setPinInput(prev => prev + val);
                        }}
                        className="h-16 rounded-2xl bg-slate-50 text-xl font-black hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const StatusCard = ({ icon, label, value, sub, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
    <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
      <p className="text-xs font-bold text-slate-400">{sub}</p>
    </div>
  </div>
);

const PlanCard = ({ name, price, desc, active, features, premium, onSelect }: any) => (
  <div className={`relative p-8 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between ${
    active ? 'border-blue-600 shadow-xl ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-300'
  }`}>
    {premium && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
        <Sparkles size={10}/> Most Popular
      </div>
    )}
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{name}</p>
      <h4 className="text-3xl font-black text-slate-900 mb-2">{price}</h4>
      <p className="text-sm font-bold text-slate-500 mb-8">{desc}</p>
      
      <ul className="space-y-4 mb-8">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <CheckCircle2 size={16} className="text-emerald-500"/> {f}
          </li>
        ))}
      </ul>
    </div>
    
    <button 
      onClick={onSelect}
      disabled={active}
      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
        active ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg'
      }`}
    >
      {active ? 'Current Plan' : 'Switch Plan'}
    </button>
  </div>
);

export default Settings;
