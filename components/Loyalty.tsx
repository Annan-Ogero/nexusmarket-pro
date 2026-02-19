
import React, { useState } from 'react';
import { Search, Plus, Filter, Heart, Gift, MessageSquare, Sparkles, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { MOCK_CUSTOMERS } from '../constants';

const Loyalty: React.FC = () => {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">NexusRewards</h2>
          <p className="text-slate-500 text-lg font-medium">Customer retention & automated marketing platform</p>
        </div>
        <button className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
          <Plus size={24}/>
          Enroll New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                <input 
                  type="text" 
                  placeholder="Search by Name, Email, or Phone..." 
                  className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                />
              </div>
              <button className="px-6 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                <Filter size={24}/>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Customer Profile</th>
                    <th className="px-8 py-5">Contact Info</th>
                    <th className="px-8 py-5">Loyalty Points</th>
                    <th className="px-8 py-5">Member Since</th>
                    <th className="px-8 py-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {customers.map(cust => (
                    <tr key={cust.id} onClick={() => setSelectedCustomer(cust)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                            {cust.name[0]}
                          </div>
                          <p className="text-slate-900">{cust.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm">{cust.phone}</p>
                        <p className="text-xs text-slate-400">{cust.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-xl text-sm ${cust.points > 2000 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {cust.points}
                          </div>
                          {cust.points > 2000 && <Gift size={18} className="text-amber-500"/>}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-400 text-sm">
                        {new Date(cust.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors">
                          <MessageSquare size={20}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          {selectedCustomer ? (
            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-right-10">
              <div className="flex justify-between items-start mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-4xl font-black">
                  {selectedCustomer.name[0]}
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xl font-black">{selectedCustomer.points > 2000 ? 'GOLD TIER' : 'SILVER TIER'}</p>
                </div>
              </div>
              <h3 className="text-3xl font-black mb-2">{selectedCustomer.name}</h3>
              <p className="text-slate-400 font-medium mb-10">Total Lifetime Spend: $4,250.00</p>
              
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <Sparkles className="text-amber-400" size={24}/>
                    <h4 className="font-black text-lg">AI Generated Promo</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">Based on frequent Dairy purchases, this customer is eligible for a 20% discount on Artisanal Cheese.</p>
                  <button className="w-full py-4 bg-blue-600 rounded-2xl font-black flex items-center justify-center gap-3">
                    Send via Email
                    <ArrowUpRight size={20}/>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-2xl font-black">12</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Visits/mo</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-2xl font-black">$354</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Avg Ticket</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Heart size={40} className="text-slate-200"/>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Select a customer<br/>to view deep insights</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white">
            <h3 className="text-xl font-black mb-6">Program Analytics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-black mb-2 uppercase tracking-widest">
                  <span className="text-indigo-200">Point Burn Rate</span>
                  <span>74%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                  <div className="h-full w-[74%] bg-white rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-2xl font-black">2.4k</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Members</p>
                </div>
                <div>
                  <p className="text-2xl font-black">+124</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">New this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loyalty;
