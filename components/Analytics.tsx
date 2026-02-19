
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { getInventoryInsights } from '../services/geminiService';
import { MOCK_PRODUCTS } from '../constants';

const Analytics: React.FC = () => {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    // Fix: getInventoryInsights expects only 1 argument.
    const result = await getInventoryInsights(MOCK_PRODUCTS);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Analytics Studio</h2>
          <p className="text-slate-500 text-lg">Predictive intelligence and optimization for your supermarket.</p>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>
          Refresh Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Forecast */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-96">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Sparkles size={24}/></div>
              <h3 className="text-xl font-bold uppercase tracking-widest">7-Day Demand Forecast</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse"></div>
              </div>
            ) : (
              <p className="text-xl text-blue-50 leading-relaxed font-medium">
                {insight?.forecast || "Simulating market conditions..."}
              </p>
            )}
          </div>
          <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Confidence Score</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-white/20 rounded-full">
                  <div className="h-full w-[94%] bg-white rounded-full"></div>
                </div>
                <span className="font-bold">94%</span>
              </div>
            </div>
            <Zap size={48} className="text-white/20"/>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] opacity-10 translate-x-20 -translate-y-20"></div>
        </div>

        {/* Strategic Cards */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Target size={24}/></div>
              <h3 className="text-xl font-bold text-slate-800">Pricing Optimization</h3>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              {loading ? "Calculating margins..." : insight?.pricingStrategy}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl">Margin Max+</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-xl">Volume Optimized</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-600"><TrendingUp size={24}/></div>
              <h3 className="text-xl font-bold text-slate-800">Risk Assessment</h3>
            </div>
            <ul className="space-y-3">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-3 bg-slate-100 rounded w-full animate-pulse"></div>)
              ) : (
                insight?.risks?.map((risk: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                    <div className="w-5 h-5 bg-rose-50 text-rose-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">!</div>
                    {risk}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-blue-600 p-4 rounded-3xl"><BarChart3 size={32}/></div>
          <div>
            <h3 className="text-2xl font-bold">Manager Recommendations</h3>
            <p className="text-slate-400">Automated tactical moves for today's shift</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse"></div>)
          ) : (
            insight?.recommendations?.map((rec: string, i: number) => (
              <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-lg leading-relaxed font-medium mb-4">{rec}</p>
                <button className="text-blue-400 text-sm font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">
                  Apply Strategy &rarr;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
