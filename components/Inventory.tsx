
import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, ArrowUpDown, AlertCircle, PackageCheck, Cpu, ArrowUpRight, ShoppingCart, TrendingDown, Trash2, X, AlertTriangle
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
// Fixed: Removed non-existent export getSmartPricing
import { getInventoryInsights } from '../services/geminiService';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [showPOModal, setShowPOModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const runFullAnalysis = async () => {
    setLoadingAI('full');
    // Fix: getInventoryInsights expects only 1 argument.
    const result = await getInventoryInsights(products);
    setAiInsight(result);
    setLoadingAI(null);
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setProductToDelete(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">SmartStock Control</h2>
          <p className="text-slate-500 text-lg font-medium">Predictive inventory & automated procurement</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runFullAnalysis}
            className="flex items-center gap-3 bg-white border-2 border-slate-200 px-8 py-4 rounded-[1.5rem] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Cpu size={24} className={loadingAI === 'full' ? 'animate-spin' : ''}/>
            Run AI Diagnostic
          </button>
          <button className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            <Plus size={24}/>
            Register SKU
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between gap-6 flex-wrap">
              <div className="relative flex-1 min-w-[400px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                <input 
                  type="text" 
                  placeholder="Scan SKU or type product name..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-16 pr-6 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-xs uppercase tracking-widest">
                  <Filter size={20}/>
                  Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6">Product Information</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6">Valuation</th>
                    <th className="px-10 py-6">Stock Health</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <AlertCircle size={64} className="mb-4 opacity-20"/>
                          <p className="font-black text-xl uppercase tracking-widest">No products found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => {
                      const isLow = product.stock <= product.minStock;
                      return (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors group animate-in slide-in-from-left-4 duration-300">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                {product.name[0]}
                              </div>
                              <div>
                                <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-black">{product.sku} • {product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${isLow ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {isLow ? <AlertCircle size={14}/> : <PackageCheck size={14}/>}
                              {isLow ? 'Low Stock' : 'Optimized'}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <p className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</p>
                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Margin: {((product.price - product.cost)/product.price * 100).toFixed(0)}%</p>
                          </td>
                          <td className="px-10 py-8">
                            <div className="w-48">
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-black text-slate-900">{product.stock} {product.unit}s</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Min: {product.minStock}</span>
                              </div>
                              <div className="h-3 w-full bg-slate-100 rounded-full p-0.5 overflow-hidden border border-slate-100">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'}`} 
                                  style={{ width: `${Math.min(100, (product.stock / (product.minStock * 4)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setProductToDelete(product)}
                                className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                              >
                                <Trash2 size={20}/>
                              </button>
                              <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                <MoreVertical size={24}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {aiInsight && (
            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-right-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-blue-600 p-3 rounded-2xl">
                    <Sparkles size={28}/>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">AI Forecasting</h3>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3">7-Day Demand</p>
                    <p className="text-lg leading-relaxed font-medium">{aiInsight.forecast}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Pricing Hint</p>
                    <p className="text-lg leading-relaxed font-medium">{aiInsight.pricingStrategy}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPOModal(true)}
                  className="mt-10 w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 group-hover:bg-blue-50 transition-colors"
                >
                  Generate Purchase Orders
                  <ShoppingCart size={24}/>
                </button>
              </div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-10"></div>
            </div>
          )}

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Stock Warnings</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-5 p-6 bg-rose-50 rounded-3xl border border-rose-100 group cursor-pointer hover:bg-rose-100 transition-colors">
                <div className="bg-rose-600 p-3 rounded-2xl text-white shadow-lg shadow-rose-200"><AlertCircle size={24}/></div>
                <div>
                  <p className="text-lg font-black text-rose-900">12 Stockouts</p>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Immediate action needed</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-6 bg-amber-50 rounded-3xl border border-amber-100 group cursor-pointer hover:bg-amber-100 transition-colors">
                <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-200"><TrendingDown size={24}/></div>
                <div>
                  <p className="text-lg font-black text-amber-900">Overstock Alert</p>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">8 slow moving categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Removal Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40}/>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">De-list Product?</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                You are about to remove <span className="text-slate-900 font-bold">"{productToDelete.name}"</span> from the active catalog. This will stop all sales and stock tracking for this item.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-5 rounded-2xl font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  Keep Product
                </button>
                <button 
                  onClick={() => removeProduct(productToDelete.id)}
                  className="flex-1 py-5 rounded-2xl font-black text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all"
                >
                  Confirm Removal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPOModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-10 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Procurement Console</h3>
                <p className="text-slate-500 text-lg font-medium">Auto-generated POs for upcoming replenishment</p>
              </div>
              <button onClick={() => setShowPOModal(false)} className="p-4 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={32}/></button>
            </div>
            <div className="p-12 space-y-8 max-h-[60vh] overflow-y-auto">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-500 transition-all">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center font-black text-blue-600 text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">PO</div>
                    <div>
                      <p className="text-xl font-black text-slate-900">Vendor: Premium Dairy Solutions</p>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">48 items • Predicted 2-day depletion</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Est. Value</p>
                      <p className="text-2xl font-black text-slate-900">$2,450.00</p>
                    </div>
                    <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all">Review & Sign</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-12 bg-slate-50 border-t border-slate-100 flex justify-end gap-6">
              <button onClick={() => setShowPOModal(false)} className="px-10 py-5 rounded-2xl font-black text-slate-500 hover:bg-slate-200 transition-all">Cancel Procurement</button>
              <button className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Sign All Purchase Orders</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sparkles: React.FC<any> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="M5 3v4"></path>
    <path d="M19 17v4"></path>
    <path d="M3 5h4"></path>
    <path d="M17 19h4"></path>
  </svg>
);

export default Inventory;
