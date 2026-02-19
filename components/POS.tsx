
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, Trash2, CreditCard, Wallet, Banknote, Plus, Minus, CheckCircle2, Barcode, ShoppingCart, 
  User as UserIcon, Heart, X, Sparkles, ArrowUpRight, Camera, Zap, ShieldAlert, Receipt as ReceiptIcon, Printer, QrCode, Timer, FastForward, Monitor
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
import Scanner from './Scanner';
import { AuditEvent, Transaction } from '../types';

const POS: React.FC = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [scanFlash, setScanFlash] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'NFC'>('CASH');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  
  // Performance Tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [currentIPM, setCurrentIPM] = useState(0);

  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');
  const store = JSON.parse(localStorage.getItem('nexus_store') || '{}');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  const tenderedNum = parseFloat(amountTendered) || 0;
  const changeDue = tenderedNum > total ? tenderedNum - total : 0;

  // Audio Feedback Logic
  const playScanBlip = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High A
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio feedback failed');
    }
  };

  // Real-time IPM Calculation
  useEffect(() => {
    if (startTime && itemCount > 0) {
      const interval = setInterval(() => {
        const elapsedMinutes = (Date.now() - startTime) / 60000;
        const ipm = Math.round(itemCount / Math.max(elapsedMinutes, 0.01));
        setCurrentIPM(ipm);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, itemCount]);

  const addToCart = useCallback((product: any) => {
    if (!startTime) setStartTime(Date.now());
    
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [{ ...product, quantity: 1 }, ...prev]; // New items at top for visibility
    });
    
    setItemCount(prev => prev + 1);
    playScanBlip();
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 150);
    
    logAudit('SCAN', `Added ${product.name}`, 0);
    setSearch('');
    // Snatch focus back immediately
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [startTime]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is in amount input
      const activeEl = document.activeElement as HTMLInputElement;
      if (activeEl?.tagName === 'INPUT' && activeEl?.type === 'number') return;

      // Finalize Sale
      if (e.key === ' ' && cart.length > 0) {
        e.preventDefault();
        handleCheckout();
      }

      // Reset
      if (e.key === 'Escape') {
        if (showReceipt) {
          setShowReceipt(false);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        } else {
          setCart([]);
          setSearch('');
          setAmountTendered('');
          searchInputRef.current?.focus();
        }
      }

      // Payment Shortcuts
      if (e.shiftKey && e.key.toLowerCase() === 'c') setPaymentMethod('CASH');
      if (e.shiftKey && e.key.toLowerCase() === 'k') setPaymentMethod('CARD');
      if (e.shiftKey && e.key.toLowerCase() === 'n') setPaymentMethod('NFC');

      // Quick pick items 1-6
      if (!isNaN(parseInt(e.key)) && parseInt(e.key) <= MOCK_PRODUCTS.length && !e.shiftKey) {
        const idx = parseInt(e.key) - 1;
        addToCart(MOCK_PRODUCTS[idx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, addToCart, showReceipt]);

  const logAudit = (type: AuditEvent['type'], details: string, weight: number = 0) => {
    const event: AuditEvent = {
      type,
      timestamp: new Date().toISOString(),
      details,
      riskWeight: weight,
      cashierId: user.id || 'system'
    };
    setAuditTrail(prev => [...prev, event]);
  };

  const removeFromCart = (id: string, name: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
    logAudit('VOID', `Removed ${name} from cart`, 2);
    searchInputRef.current?.focus();
  };

  const handleCheckout = () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    
    const transaction: Transaction = {
      id: `TX-${Date.now()}`,
      storeId: store.id,
      timestamp: new Date().toISOString(),
      cashierId: user.id,
      cashierName: user.name,
      stationId: user.station || '01',
      items: cart.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, priceAtSale: i.price })),
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethod === 'NFC' ? 'MOBILE' : paymentMethod,
      auditTrail: auditTrail
    };

    const savedTape = JSON.parse(localStorage.getItem('nexus_transactions') || '[]');
    localStorage.setItem('nexus_transactions', JSON.stringify([transaction, ...savedTape].slice(0, 500)));

    setTimeout(() => {
      setIsProcessing(false);
      setLastTransaction(transaction);
      setShowReceipt(true);
      setCart([]);
      setAmountTendered('');
      setAuditTrail([]);
      setStartTime(null);
      setItemCount(0);
      setCurrentIPM(0);
    }, 600); // Shorter duration for high-speed feel
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 h-[calc(100vh-140px)] animate-in slide-in-from-bottom-4 duration-700 transition-all ${scanFlash ? 'ring-[20px] ring-blue-500/20' : ''}`}>
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* HIGH-SPEED PERFORMANCE HUD */}
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-slate-900 p-5 rounded-[2rem] text-white flex items-center justify-between border border-white/5 shadow-xl">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Station</p>
                <p className="text-2xl font-black">{user.station || '01'}</p>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><Monitor size={20}/></div>
           </div>
           
           <div className="bg-white p-5 rounded-[2rem] border border-slate-200 flex items-center justify-between shadow-sm group">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1 pr-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speed (IPM)</p>
                  <p className="text-[8px] font-black text-blue-500 uppercase">Target: 30</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-black transition-colors ${currentIPM > 30 ? 'text-blue-600' : 'text-slate-900'}`}>{currentIPM}</p>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-blue-500/50 z-10"></div>
                    <div className={`h-full transition-all duration-500 rounded-full ${currentIPM > 30 ? 'bg-blue-600' : 'bg-slate-900'}`} style={{width: `${Math.min(100, (currentIPM/40)*100)}%`}}></div>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-blue-600 p-5 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-blue-200">
              <div>
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Session Total</p>
                <p className="text-2xl font-black">${total.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><DollarSignIcon size={20}/></div>
           </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Barcode size={24} className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${scanFlash ? 'text-blue-600' : 'text-slate-400'}`}/>
            <input 
              ref={searchInputRef}
              autoFocus
              type="text"
              className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-6 pl-16 pr-24 text-xl outline-none focus:ring-[12px] focus:ring-blue-500/5 focus:border-blue-600 transition-all shadow-sm font-black placeholder:text-slate-200"
              placeholder="SCAN NOW (Hotkeys: 1-6)"
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                const match = MOCK_PRODUCTS.find(p => p.sku === val || p.name.toLowerCase() === val.toLowerCase());
                if (match) addToCart(match);
              }}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Ready</span>
               <button onClick={() => setShowScanner(true)} className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-blue-600 transition-all active:scale-90"><Camera size={24}/></button>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS GRID */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-6 pr-2">
          {MOCK_PRODUCTS.map((product, idx) => (
            <button 
              key={product.id} 
              onClick={() => addToCart(product)} 
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-600 hover:shadow-xl transition-all text-left flex items-center gap-6 group relative"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {idx + 1}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                <p className="text-xs font-bold text-slate-400">${product.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col">
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl flex flex-col flex-1 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Current Sale</h3>
            <div className="flex gap-2">
               <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl">{cart.length} ITEMS</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-50">
                <FastForward size={80} strokeWidth={1} className="mb-4 animate-pulse"/>
                <p className="font-black text-xs uppercase tracking-widest text-center">Awaiting Entry...<br/><span className="text-[10px] font-bold">Try Hotkeys 1-6</span></p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 group animate-in slide-in-from-right-4 duration-200">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">{item.quantity}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 leading-tight truncate">{item.name}</p>
                    <p className="text-xs font-bold text-slate-400">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.name)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><X size={18}/></button>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-slate-900 rounded-b-[3.5rem] space-y-6">
            <div className="flex justify-between items-center text-white pt-2">
              <span className="text-xl font-black opacity-40">TOTAL DUE</span>
              <span className="text-5xl font-black text-blue-400 tracking-tighter">${total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <PayModeBtn icon={<Banknote size={20}/>} label="Cash [S+C]" active={paymentMethod === 'CASH'} onClick={() => setPaymentMethod('CASH')} />
              <PayModeBtn icon={<CreditCard size={20}/>} label="Card [S+K]" active={paymentMethod === 'CARD'} onClick={() => setPaymentMethod('CARD')} />
              <PayModeBtn icon={<Wallet size={20}/>} label="NFC [S+N]" active={paymentMethod === 'NFC'} onClick={() => setPaymentMethod('NFC')} />
            </div>

            {paymentMethod === 'CASH' && (
              <div className="space-y-4">
                <input 
                  type="number" 
                  placeholder="Tendered Amount"
                  className="w-full bg-white/10 border-2 border-white/5 rounded-2xl py-6 px-6 text-4xl font-black text-white outline-none focus:border-blue-500 transition-all text-center"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                />
                {tenderedNum > 0 && (
                  <div className="flex justify-between items-center text-emerald-400 font-black px-2">
                    <span className="text-xs uppercase tracking-widest">Change Due</span>
                    <span className="text-3xl">${changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <button 
              disabled={cart.length === 0 || isProcessing || (paymentMethod === 'CASH' && tenderedNum < total && amountTendered !== '')}
              onClick={handleCheckout}
              className={`w-full py-7 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl group ${
                isProcessing ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
              }`}
            >
              {isProcessing ? (
                <Zap size={24} className="animate-pulse text-blue-400"/>
              ) : (
                <>
                  <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform"/>
                  FINAL SALE [SPACE]
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showScanner && <Scanner onScan={(code) => {
          const product = MOCK_PRODUCTS.find(p => p.sku === code) || MOCK_PRODUCTS[0];
          addToCart(product);
      }} onClose={() => setShowScanner(false)} title="TurboVision Engine" />}

      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 size={48}/>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">Sale Complete</h3>
              <p className="text-slate-500 font-bold mb-10 tracking-widest uppercase text-xs">Auth: {lastTransaction.id}</p>
              
              <div className="w-full space-y-3 mb-10">
                 <button onClick={() => window.print()} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black flex items-center justify-center gap-4 hover:bg-slate-800 transition-all">
                   <Printer size={20}/>
                   Print Physical Receipt
                 </button>
                 <button onClick={() => { setShowReceipt(false); setTimeout(() => searchInputRef.current?.focus(), 50); }} className="w-full py-5 bg-slate-100 text-slate-600 rounded-3xl font-black hover:bg-slate-200 transition-all">
                   Dismiss & Next [ESC]
                 </button>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-3xl w-full border border-blue-100 flex items-center gap-4">
                 <div className="bg-blue-600 p-2 rounded-xl text-white"><FastForward size={20}/></div>
                 <div>
                   <p className="text-xs font-black text-blue-900 uppercase">Performance Summary</p>
                   <p className="text-sm font-bold text-blue-700">Scan Speed: {Math.round(lastTransaction.items.length / 0.5)} IPM avg.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PayModeBtn = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all flex-1 ${
    active ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/5 text-slate-500 hover:bg-white/5'
  }`}>
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const DollarSignIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

export default POS;
