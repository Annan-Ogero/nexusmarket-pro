
import React from 'react';
import { BookOpen, ShieldCheck, Zap, Bot, BarChart3, HelpCircle, ChevronRight, PlayCircle, Target, ShieldAlert, FastForward, Keyboard } from 'lucide-react';

const Training: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
          <BookOpen size={32}/>
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Command Center Training</h2>
          <p className="text-slate-500 text-lg font-medium">Empowering your store with high-velocity infrastructure</p>
        </div>
      </div>

      {/* NEW HIGH SPEED SECTION */}
      <div className="bg-blue-600 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md"><FastForward size={32}/></div>
            <h3 className="text-3xl font-black">High-Velocity Operations (IPM Max)</h3>
          </div>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl font-medium leading-relaxed">
            Nexus Pro is optimized for professional cashiers. Teach your staff to use the **Keyboard Flow** to handle 40% more customers per hour compared to touch-only systems.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ShortcutItem keys="1 - 6" label="Instant SKU Entry" desc="Adds popular items without scanning." />
            <ShortcutItem keys="SPACE" label="Fast Checkout" desc="Opens payment & completes sale." />
            <ShortcutItem keys="ESC" label="System Reset" desc="Wipes cart for next customer." />
          </div>
        </div>
        <FastForward size={300} className="absolute -bottom-20 -right-20 text-white/5 rotate-12"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TrainingCard 
          icon={<Zap className="text-blue-500" />}
          title="Phase 1: Real-Time Velocity"
          description="Legacy systems show yesterday's sales. Nexus shows 'Velocity'. If your transaction rate drops below 5 tx/hr during peak times, the system will nudge you to open another station."
          tip="Check the 'HUD' on your dashboard every 30 minutes."
        />
        <TrainingCard 
          icon={<ShieldAlert className="text-rose-500" />}
          title="Phase 2: Behavioral Integrity"
          description="Loss prevention is now automated. Gemini monitors 'Digital Tape' for patterns like phantom voids. A low Integrity Score (below 90%) means a cashier needs a manual audit."
          tip="Click any cashier in Staff Sync to see their specific risk weight."
        />
        <TrainingCard 
          icon={<Bot className="text-indigo-500" />}
          title="Phase 3: The AI Consultant"
          description="Don't spend hours on reports. Ask the consultant: 'Which products are slow movers?' or 'Who should I promote?'. It analyzes inventory and staff IPM (Items Per Minute) instantly."
          tip="Use the floating bot icon in the bottom right corner at any time."
        />
        <TrainingCard 
          icon={<Target className="text-emerald-500" />}
          title="Phase 4: Predictive Stocking"
          description="We use 'Demand Forecasting'. The system looks at current velocity and predicts when you'll run out, suggesting Purchase Orders before you even see an empty shelf."
          tip="Visit SmartStock Control to run a full AI Diagnostic daily."
        />
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-8 flex items-center gap-4">
            <HelpCircle className="text-blue-400" size={32}/> 
            Manager FAQ (Handling the Tough Questions)
          </h3>
          
          <div className="space-y-8">
            <FAQItem 
              q="What if the internet goes down mid-shift?"
              a="Nexus uses 'Edge-Persistence'. All transactions are stored locally in the browser's vault and will auto-sync to the master cloud archive once the connection is restored. No data is ever lost."
            />
            <FAQItem 
              q="How do I verify a suspicious transaction from 3 weeks ago?"
              a="Go to the 'Digital Vault'. Search by Auth ID or Date. Every item, quantity, and operator timestamp is cryptographically sealed and can't be tampered with."
            />
            <FAQItem 
              q="Can I change a cashier's IPM metrics manually?"
              a="No. Metrics are objective data points. This ensures fair, unbiased talent recognition and prevents 'manager favoritism' in bonus allocations."
            />
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-10"></div>
      </div>
    </div>
  );
};

const ShortcutItem = ({ keys, label, desc }: any) => (
  <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
    <div className="flex items-center gap-3 mb-3">
       <div className="bg-white text-blue-600 px-3 py-1 rounded-lg font-black text-xs">{keys}</div>
       <p className="font-black text-sm uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xs text-blue-100 font-medium leading-relaxed">{desc}</p>
  </div>
);

const TrainingCard = ({ icon, title, description, tip }: any) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed mb-6">{description}</p>
    <div className="pt-6 border-t border-slate-50">
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Pro Command Tip</p>
      <p className="text-sm font-bold text-slate-900">{tip}</p>
    </div>
  </div>
);

const FAQItem = ({ q, a }: any) => (
  <div className="space-y-2">
    <p className="text-lg font-black text-blue-400">Q: {q}</p>
    <p className="text-slate-300 font-medium leading-relaxed max-w-3xl">A: {a}</p>
  </div>
);

export default Training;
