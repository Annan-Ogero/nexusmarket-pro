
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, Settings as SettingsIcon, LogOut, Bell, TrendingUp, Cpu, Heart, Key, Store as StoreIcon, ShieldCheck, ArrowRight, Loader2, Sparkles, Lock, X, Fingerprint, History, BookOpen, AlertCircle, CreditCard, Ticket, Terminal
} from 'lucide-react';
import { UserRole, User, MarketStore } from './types';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Analytics from './components/Analytics';
import Staff from './components/Staff';
import SalesHistory from './components/SalesHistory';
import AIConsultant from './components/AIConsultant';
import Training from './components/Training';
import Settings from './components/Settings';
import DeveloperPortal from './components/DeveloperPortal';
import { generateMarketLicense, validateRenewalKey, verifyMarketLicense } from './services/geminiService';
import { SYSTEM_DEFAULTS } from './constants';

const App: React.FC = () => {
  const [store, setStore] = useState<MarketStore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  // Registration & Activation
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [activationInput, setActivationInput] = useState('');
  const [activationStatus, setActivationStatus] = useState<'IDLE' | 'ERROR'>('IDLE');
  const [provisionedKey, setProvisionedKey] = useState<string | null>(null);

  // Subscription Renewal
  const [renewalKey, setRenewalKey] = useState('');
  const [renewalError, setRenewalError] = useState('');

  // Unified PIN Entry Modal
  const [showPinPad, setShowPinPad] = useState<'MANAGER' | 'CASHIER' | 'OWNER' | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showDevPortal, setShowDevPortal] = useState(false);

  // Easter Egg Detection (Developer Secret Trigger)
  const [typedSequence, setTypedSequence] = useState('');
  const SECRET_TRIGGER = "NEX-ANN-1982-A578-S2BAK0";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (user) return;
      if (e.key.length !== 1) return;

      const char = e.key.toUpperCase();
      setTypedSequence(prev => {
        const nextSeq = (prev + char).slice(-SECRET_TRIGGER.length);
        if (nextSeq === SECRET_TRIGGER) {
          setShowDevPortal(true);
          return '';
        }
        return nextSeq;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  useEffect(() => {
    const savedStore = localStorage.getItem('nexus_store');
    const savedUser = localStorage.getItem('nexus_user');
    const savedStaff = localStorage.getItem('nexus_staff');
    if (savedStore) setStore(JSON.parse(savedStore));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
  }, []);

  const isSubscriptionExpired = useMemo(() => {
    if (!store) return false;
    return new Date() > new Date(store.subscriptionExpiry);
  }, [store]);

  const daysLeft = useMemo(() => {
    if (!store) return 0;
    const diffTime = new Date(store.subscriptionExpiry).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [store]);

  const handleActivateStore = () => {
    const keyToValidate = provisionedKey || activationInput;
    if (!keyToValidate) return;

    if (!verifyMarketLicense(keyToValidate)) {
      setActivationStatus('ERROR');
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 14);

    const activatedStore: MarketStore = {
      id: `store_${keyToValidate.toLowerCase().replace(/-/g, '')}`,
      name: regName || 'Activated Branch',
      location: regLocation || 'Regional Office',
      licenseKey: keyToValidate,
      currency: 'USD',
      status: 'ACTIVE',
      plan: 'PRO',
      terminalCount: 1,
      maxTerminals: 5,
      subscriptionExpiry: expiryDate.toISOString(),
      isTrialUsed: true
    };
    setStore(activatedStore);
    localStorage.setItem('nexus_store', JSON.stringify(activatedStore));
  };

  const handleRedeemRenewal = () => {
    if (!store) return;
    const daysToAdd = validateRenewalKey(renewalKey);
    if (daysToAdd) {
      const currentExpiry = new Date(store.subscriptionExpiry);
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      const updatedStore = { ...store, subscriptionExpiry: baseDate.toISOString() };
      setStore(updatedStore);
      localStorage.setItem('nexus_store', JSON.stringify(updatedStore));
      setRenewalKey('');
      setRenewalError('');
    } else {
      setRenewalError('Invalid renewal signature.');
    }
  };

  const handleProvisionLicense = async () => {
    if (!regName || !regLocation) return;
    setIsProvisioning(true);
    const result = await generateMarketLicense(regName, regLocation);
    setProvisionedKey(result.licenseKey);
    setIsProvisioning(false);
  };

  const openAuth = (role: 'MANAGER' | 'CASHIER' | 'OWNER') => {
    setShowPinPad(role);
    setPinInput('');
    setAuthError('');
  };

  const verifyPin = () => {
    if (showPinPad === 'OWNER') {
      if (pinInput === '0118312225') {
        setShowDevPortal(true);
        setShowPinPad(null);
      } else {
        setAuthError('AUTHORIZATION FAILED');
        setPinInput('');
      }
      return;
    }
    if (showPinPad === 'MANAGER') {
      if (pinInput === SYSTEM_DEFAULTS.MANAGER_PIN) {
        handleLogin({ id: 'm1', name: 'Branch Manager', role: UserRole.MANAGER, pin: pinInput, avatar: 'https://i.pravatar.cc/150?u=manager' });
        setShowPinPad(null);
      } else {
        setAuthError('INVALID MASTER PIN');
        setPinInput('');
      }
    } else if (showPinPad === 'CASHIER') {
      const foundStaff = staffList.find(s => s.pin === pinInput);
      if (foundStaff) {
        handleLogin({ ...foundStaff, station: '0' + (Math.floor(Math.random() * 5) + 1) });
        setShowPinPad(null);
      } else {
        setAuthError('UNKNOWN OPERATOR PIN');
        setPinInput('');
      }
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('nexus_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  if (showDevPortal) {
    return <DeveloperPortal onClose={() => setShowDevPortal(false)} />;
  }

  const HiddenDot = () => (
    <div 
      onClick={() => openAuth('OWNER')}
      className="fixed bottom-1 right-1 w-1.5 h-1.5 bg-red-500/20 hover:bg-red-600 rounded-full cursor-pointer z-[200] transition-colors"
      title="System Terminal"
    />
  );

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden max-w-5xl w-full z-10 flex flex-col md:flex-row border border-white/20 animate-in zoom-in-95 duration-500">
          <div className="md:w-1/2 bg-slate-900 p-16 text-white flex flex-col justify-between">
             <div>
               <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-500/30">
                 <StoreIcon size={40}/>
               </div>
               <h1 className="text-6xl font-black mb-8 tracking-tighter leading-none">Nexus<br/>Market Pro</h1>
             </div>
             <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-3xl">
               <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles size={14}/> Verified Infrastructure</p>
               <p className="text-white font-medium">Input your signed Market License ID provided by the developer.</p>
             </div>
          </div>
          <div className="md:w-1/2 p-16 bg-white flex flex-col justify-center">
            {!isRegistering ? (
              <div className="space-y-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sync Hardware</h2>
                  <p className="text-slate-500 font-medium text-sm">Every Nexus terminal requires a verifiable signature.</p>
                </div>
                <div className="space-y-6">
                  <input 
                    type="text" 
                    value={activationInput}
                    onChange={(e) => { setActivationInput(e.target.value.toUpperCase()); setActivationStatus('IDLE'); }}
                    className={`w-full bg-slate-50 border-2 rounded-2xl py-6 px-6 text-xl font-black outline-none transition-all ${activationStatus === 'ERROR' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 focus:border-blue-600'}`}
                    placeholder="NEX-XXXX-XXXX-..."
                  />
                  {activationStatus === 'ERROR' && <p className="text-rose-600 font-black text-xs uppercase tracking-widest animate-pulse">Unauthorized License Fingerprint</p>}
                  <button onClick={handleActivateStore} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                    Activate Terminal <ArrowRight size={24}/>
                  </button>
                  <button onClick={() => setIsRegistering(true)} className="w-full text-blue-600 font-black text-sm uppercase tracking-widest">Request Provisioning</button>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Enroll Market</h2>
                <div className="space-y-4">
                  <input value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6" placeholder="Market Name" />
                  <input value={regLocation} onChange={e => setRegLocation(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6" placeholder="Location" />
                </div>
                <button onClick={handleProvisionLicense} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black shadow-lg shadow-blue-200">{isProvisioning ? 'Syncing...' : 'Generate Verifiable Key'}</button>
                {provisionedKey && (
                  <div className="mt-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 animate-in zoom-in-95">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Generated License ID</p>
                    <code className="block text-emerald-800 font-black text-xs break-all mb-4">{provisionedKey}</code>
                    <button onClick={handleActivateStore} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm">Activate Now</button>
                  </div>
                )}
                <button onClick={() => setIsRegistering(false)} className="w-full text-slate-400 font-black text-xs uppercase">Back</button>
              </div>
            )}
          </div>
        </div>
        <HiddenDot />
        {showPinPad && <PinPadModal />}
      </div>
    );
  }

  if (isSubscriptionExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[4rem] p-16 max-w-2xl w-full shadow-2xl border border-white/20 animate-in zoom-in-95">
          <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
            <AlertCircle size={48}/>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Access Suspended</h2>
          <p className="text-slate-500 font-medium text-lg mb-12 leading-relaxed">
            Infrastructure verification failed. Enter a verifiable renewal signature or contact 0118312225 for M-PESA activation.
          </p>
          <div className="space-y-6">
            <div className="relative group">
               <Ticket className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24}/>
               <input 
                  type="text" 
                  placeholder="RNW-XXXX-XXXX-..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-6 pl-16 pr-6 text-xl font-black outline-none focus:border-blue-600 transition-all uppercase"
                  value={renewalKey}
                  onChange={(e) => { setRenewalKey(e.target.value.toUpperCase()); setRenewalError(''); }}
               />
            </div>
            {renewalError && <p className="text-rose-600 font-black text-xs uppercase tracking-widest animate-pulse">{renewalError}</p>}
            <button 
              onClick={handleRedeemRenewal}
              className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              Update Signature <ArrowRight size={24}/>
            </button>
            <div className="pt-8 border-t border-slate-100">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">M-PESA: 0118312225</p>
            </div>
          </div>
        </div>
        <HiddenDot />
        {showPinPad && <PinPadModal />}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative text-center">
        <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl max-w-xl w-full border border-white animate-in zoom-in-95 duration-500 z-10">
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-900 shadow-inner">
              <StoreIcon size={48}/>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{store.name}</h2>
            <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${daysLeft <= 3 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
               <Sparkles size={12}/> {daysLeft} Days Remaining
            </div>
          </div>
          <div className="space-y-4">
            <button onClick={() => openAuth('MANAGER')} className="w-full group p-8 rounded-3xl border-2 border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all flex items-center gap-6 text-left">
              <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all"><Lock size={28}/></div>
              <div>
                <p className="font-black text-slate-900 text-xl">Branch Management</p>
                <p className="text-slate-400 text-sm font-medium">Master PIN Required</p>
              </div>
            </button>
            <button onClick={() => openAuth('CASHIER')} className="w-full group p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center gap-6 text-left">
              <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><Fingerprint size={28}/></div>
              <div>
                <p className="font-black text-slate-900 text-xl">Operator Terminal</p>
                <p className="text-slate-400 text-sm font-medium">Personal Access Code</p>
              </div>
            </button>
          </div>
        </div>
        <HiddenDot />
        {showPinPad && <PinPadModal />}
      </div>
    );
  }

  function PinPadModal() {
    return (
      <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative">
          <button onClick={() => setShowPinPad(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X size={32}/></button>
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${showPinPad === 'MANAGER' ? 'bg-slate-100 text-slate-900' : showPinPad === 'OWNER' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
              {showPinPad === 'MANAGER' ? <Lock size={32}/> : showPinPad === 'OWNER' ? <Terminal size={32}/> : <Fingerprint size={32}/>}
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">
              {showPinPad === 'MANAGER' ? 'Master Access' : showPinPad === 'OWNER' ? 'Owner Authorization' : 'Operator Login'}
            </h3>
            <p className="text-slate-500 font-medium text-sm">Input your secure credentials.</p>
          </div>
          <div className="space-y-8">
            <div className="flex justify-center gap-2">
              {[...Array(showPinPad === 'MANAGER' ? 4 : showPinPad === 'OWNER' ? 10 : 6)].map((_, i) => (
                <div key={i} className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${pinInput.length > i ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50'}`}>
                  {pinInput.length > i ? '•' : ''}
                </div>
              ))}
            </div>
            {authError && <p className="text-center text-rose-600 font-black text-xs tracking-widest animate-bounce">{authError}</p>}
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6,7,8,9, 'CLR', 0, 'OK'].map(val => (
                <button 
                  key={val}
                  onClick={() => {
                    if (val === 'CLR') setPinInput('');
                    else if (val === 'OK') verifyPin();
                    else if (pinInput.length < (showPinPad === 'MANAGER' ? 4 : showPinPad === 'OWNER' ? 10 : 6)) setPinInput(prev => prev + val);
                  }}
                  className="h-16 rounded-2xl bg-slate-50 text-xl font-black hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 selection:bg-blue-100">
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Cpu className="text-white" size={20}/></div>
              <span className="font-black text-xl text-slate-900">Nexus Pro</span>
            </div>
            <nav className="space-y-2">
              {user.role === UserRole.MANAGER ? (
                <>
                  <SidebarLink to="/" icon={<LayoutDashboard size={22}/>} label="Dashboard" />
                  <SidebarLink to="/inventory" icon={<Package size={22}/>} label="Inventory" />
                  <SidebarLink to="/staff" icon={<Users size={22}/>} label="Staff Sync" />
                  <SidebarLink to="/history" icon={<History size={22}/>} label="Digital Tape" />
                  <SidebarLink to="/analytics" icon={<TrendingUp size={22}/>} label="AI Forecast" />
                  <SidebarLink to="/training" icon={<BookOpen size={22}/>} label="Command Training" />
                  <SidebarLink to="/settings" icon={<SettingsIcon size={22}/>} label="System Config" />
                </>
              ) : (
                <>
                  <SidebarLink to="/pos" icon={<ShoppingCart size={22}/>} label="Terminal" />
                  <SidebarLink to="/performance" icon={<Heart size={22}/>} label="My Stats" />
                </>
              )}
            </nav>
          </div>
          <div className="mt-auto p-8 border-t bg-slate-50/50">
            <div className="flex items-center gap-4 mb-6">
              <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white shadow-sm" alt=""/>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[9px] text-slate-500 uppercase font-black">{user.role} • {user.station || 'MGMT'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-rose-600 transition-colors w-full font-black text-xs uppercase">
              <LogOut size={18}/> End Session
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-72">
          <header className="h-24 bg-white/80 backdrop-blur-xl border-b px-10 flex items-center justify-between sticky top-0 z-40">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{store.name}</p>
              <h2 className="text-xl font-black text-slate-900">{user.role === UserRole.MANAGER ? 'Management Suite' : `Active Station ${user.station}`}</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl">
                 <Sparkles size={14} className="text-blue-400"/>
                 <span className="text-[10px] font-black uppercase tracking-widest">{daysLeft}D REMAINING</span>
              </div>
              <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black text-slate-600 uppercase">Synchronized</span>
              </div>
            </div>
          </header>
          <div className="p-10">
            <Routes>
              <Route path="/" element={user.role === UserRole.MANAGER ? <Dashboard /> : <Navigate to="/pos" />} />
              <Route path="/inventory" element={user.role === UserRole.MANAGER ? <Inventory /> : <Navigate to="/pos" />} />
              <Route path="/staff" element={user.role === UserRole.MANAGER ? <Staff /> : <Navigate to="/pos" />} />
              <Route path="/history" element={user.role === UserRole.MANAGER ? <SalesHistory /> : <Navigate to="/pos" />} />
              <Route path="/analytics" element={user.role === UserRole.MANAGER ? <Analytics /> : <Navigate to="/pos" />} />
              <Route path="/training" element={user.role === UserRole.MANAGER ? <Training /> : <Navigate to="/pos" />} />
              <Route path="/settings" element={user.role === UserRole.MANAGER ? <Settings /> : <Navigate to="/pos" />} />
              <Route path="/pos" element={<POS />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
        {user.role === UserRole.MANAGER && <AIConsultant />}
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}>
      {icon} <span className="font-black text-sm">{label}</span>
    </Link>
  );
};

export default App;
