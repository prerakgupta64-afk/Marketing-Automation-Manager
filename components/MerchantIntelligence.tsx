import React, { useState } from 'react';
import { analyzeMerchantData } from '../services/geminiService';
import { MerchantAnalysisResult } from '../types';
import { DEMO_MERCHANT_DATA } from '../constants';
import { 
  ArrowLeft, ShoppingBag, Store, TrendingUp, DollarSign, 
  Activity, ArrowRight, Wallet, Percent, AlertCircle, 
  BarChart4, ArrowUpRight, Scale, CheckCircle2, Link2, Loader2,
  Package, Truck, Coins, BrainCircuit
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label
} from 'recharts';

interface MerchantIntelligenceProps {
  onBack: () => void;
}

const MerchantIntelligence: React.FC<MerchantIntelligenceProps> = ({ onBack }) => {
  const [step, setStep] = useState<'connect' | 'loading' | 'dashboard'>('connect');
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce' | null>(null);
  const [data, setData] = useState<MerchantAnalysisResult | null>(null);

  const handleConnect = async (selectedPlatform: 'shopify' | 'woocommerce') => {
    setPlatform(selectedPlatform);
    setStep('loading');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const result = await analyzeMerchantData(DEMO_MERCHANT_DATA);
      setData(result);
      setStep('dashboard');
    } catch (err) {
      console.error(err);
      setStep('connect');
      alert("Integration failed. Please try again.");
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  if (step === 'connect') {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 mb-8">
           <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <h2 className="text-2xl font-mono text-white tracking-tight flex items-center gap-2">
             <ShoppingBag className="w-6 h-6 text-emerald-500" />
             MERCHANT_INTEL // POAS_ANALYZER
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-sm backdrop-blur-sm">
             <h3 className="text-xl font-mono text-white mb-6">Connect Storefront</h3>
             <div className="space-y-4">
                <button 
                  onClick={() => handleConnect('shopify')}
                  className="w-full p-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-[#96bf48] transition-all rounded flex items-center justify-between group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#96bf48]/20 rounded flex items-center justify-center">
                         <Store className="w-6 h-6 text-[#96bf48]" />
                      </div>
                      <div className="text-left">
                         <div className="text-sm font-bold text-white font-mono group-hover:text-[#96bf48]">Shopify</div>
                         <div className="text-xs text-zinc-500 font-mono">Connect via Sales API</div>
                      </div>
                   </div>
                   <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                </button>

                <button 
                  onClick={() => handleConnect('woocommerce')}
                  className="w-full p-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-[#9b5c8f] transition-all rounded flex items-center justify-between group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#9b5c8f]/20 rounded flex items-center justify-center">
                         <Store className="w-6 h-6 text-[#9b5c8f]" />
                      </div>
                      <div className="text-left">
                         <div className="text-sm font-bold text-white font-mono group-hover:text-[#9b5c8f]">WooCommerce</div>
                         <div className="text-xs text-zinc-500 font-mono">Connect via REST API</div>
                      </div>
                   </div>
                   <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                </button>
             </div>
             
             <div className="mt-8 pt-6 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-2">
                   <Link2 className="w-3 h-3" /> Secure Integration
                </div>
                <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                   We sync SKU-level sales data, COGS, and shipping costs to calculate true "Profit on Ad Spend" (POAS). No customer PII is stored.
                </p>
             </div>
           </div>

           <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/20 p-8 rounded-sm flex flex-col justify-center">
              <h3 className="text-lg font-mono text-emerald-400 mb-4">Why POAS matters?</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                       <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-white font-mono">Stop "Fake Winners"</h4>
                       <p className="text-xs text-zinc-400 font-mono mt-1">
                          A product with 4.0 ROAS might be losing money if margins are thin. POAS reveals the truth.
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                       <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-white font-mono">Find "Hidden Scalers"</h4>
                       <p className="text-xs text-zinc-400 font-mono mt-1">
                          High-margin products can be profitable even at 1.5 ROAS. We identify where to push spend.
                       </p>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 animate-pulse">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
           <h3 className="text-xl font-mono text-white">SYNCING STOREFRONT...</h3>
           <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Importing SKUs // Calculating COGS // Merging Ad Spend
           </p>
        </div>
      </div>
    );
  }

  if (step === 'dashboard' && data) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 pb-20">
         
         {/* Header */}
         <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
           <div className="flex items-center gap-4">
              <button onClick={() => setStep('connect')} className="text-zinc-500 hover:text-white transition-colors">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-mono text-white flex items-center gap-2">
                   <Store className="w-5 h-5 text-emerald-500" />
                   MERCHANT PROFIT LEDGER
                </h2>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">
                  Connected: {platform === 'shopify' ? 'Shopify Store (Sales API)' : 'WooCommerce Store'}
                </p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="text-right">
                 <span className="block text-[10px] font-mono text-zinc-500 uppercase">Total Net Profit</span>
                 <span className="text-lg font-mono font-bold text-emerald-400">{formatCurrency(data.global_metrics.total_net_profit)}</span>
              </div>
              <div className="text-right border-l border-zinc-800 pl-4">
                 <span className="block text-[10px] font-mono text-zinc-500 uppercase">Blended POAS</span>
                 <span className="text-lg font-mono font-bold text-white">{data.global_metrics.blended_poas}x</span>
              </div>
           </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* Strategic Advice */}
               <div className="glass-panel p-5 rounded-sm border-l-4 border-l-emerald-500">
                  <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> CFO Executive Summary
                  </h3>
                  <p className="text-sm font-mono text-zinc-300 leading-relaxed">
                     {data.strategic_advice}
                  </p>
               </div>

               {/* SKU Ledger Table */}
               <div className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-900/20 backdrop-blur-sm">
                  <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
                     <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" /> SKU Unit Economics
                     </h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                           <tr>
                              <th className="px-4 py-3 font-medium">SKU</th>
                              <th className="px-4 py-3 font-medium text-right">Break-Even</th>
                              <th className="px-4 py-3 font-medium text-right">ROAS</th>
                              <th className="px-4 py-3 font-medium text-right">POAS</th>
                              <th className="px-4 py-3 font-medium text-right">Net Profit</th>
                              <th className="px-4 py-3 font-medium text-center">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                           {data.products.map((prod) => (
                              <tr key={prod.sku} className="hover:bg-zinc-800/30 transition-colors">
                                 <td className="px-4 py-3">
                                    <div className="text-zinc-200 font-bold">{prod.product_name}</div>
                                    <div className="text-[10px] text-zinc-500">{prod.sku}</div>
                                 </td>
                                 <td className="px-4 py-3 text-right text-zinc-400">{prod.break_even_roas}x</td>
                                 <td className="px-4 py-3 text-right text-zinc-300">{prod.actual_roas}x</td>
                                 <td className="px-4 py-3 text-right font-bold">
                                    <span className={`${prod.poas > 1.2 ? 'text-emerald-400' : prod.poas < 1.0 ? 'text-rose-400' : 'text-yellow-400'}`}>
                                       {prod.poas}x
                                    </span>
                                 </td>
                                 <td className="px-4 py-3 text-right text-zinc-300">{formatCurrency(prod.net_profit)}</td>
                                 <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                                       prod.recommendation === 'PUSH_AGGRESSIVE' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                                       prod.recommendation === 'LIQUIDATE' ? 'bg-rose-950/40 text-rose-400 border-rose-900/30' :
                                       'bg-yellow-950/40 text-yellow-400 border-yellow-900/30'
                                    }`}>
                                       {prod.recommendation.replace('_', ' ')}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* Side Panel (1/3) */}
            <div className="space-y-6">
               
               {/* Visualizer: ROAS vs POAS */}
               <div className="glass-panel p-4 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <BarChart4 className="w-4 h-4 text-indigo-500" /> Profit Matrix
                  </h3>
                  <div className="h-[200px] w-full bg-zinc-900/50 rounded border border-zinc-800 p-2">
                     <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                           <XAxis type="number" dataKey="actual_roas" name="ROAS" stroke="#71717a" fontSize={10} tickCount={5} label={{ value: 'ROAS', position: 'bottom', fill: '#71717a', fontSize: 10 }} />
                           <YAxis type="number" dataKey="poas" name="POAS" stroke="#71717a" fontSize={10} tickCount={5} label={{ value: 'POAS', angle: -90, position: 'left', fill: '#71717a', fontSize: 10 }} />
                           <Tooltip 
                             cursor={{ strokeDasharray: '3 3' }}
                             content={({ payload }) => {
                                if (payload && payload.length) {
                                   const d = payload[0].payload;
                                   return (
                                      <div className="bg-zinc-950 border border-zinc-800 p-2 rounded text-[10px] font-mono shadow-xl">
                                         <p className="text-white font-bold">{d.product_name}</p>
                                         <p className="text-zinc-400">ROAS: {d.actual_roas}x</p>
                                         <p className={`${d.poas > 1 ? 'text-emerald-400' : 'text-rose-400'}`}>POAS: {d.poas}x</p>
                                      </div>
                                   );
                                }
                                return null;
                             }}
                           />
                           <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="3 3" />
                           <Scatter name="Products" data={data.products} fill="#10b981">
                              {data.products.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.poas > 1 ? '#10b981' : '#ef4444'} />
                              ))}
                           </Scatter>
                        </ScatterChart>
                     </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono mt-2 text-center">
                     Dots above red line are truly profitable.
                  </p>
               </div>

               {/* Scaling Opportunities */}
               <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <ArrowUpRight className="w-4 h-4" /> Top Scalers
                  </h3>
                  <div className="space-y-3">
                     {data.scaling_opportunities.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                           <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[10px] font-bold text-indigo-400">{i+1}</span>
                           </div>
                           <p className="text-xs text-zinc-300 font-mono leading-snug">{item}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Stats Summary */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                     <div className="text-[10px] text-zinc-500 uppercase font-mono">Total Spend</div>
                     <div className="text-sm font-bold text-white font-mono mt-1">{formatCurrency(data.global_metrics.total_spend)}</div>
                  </div>
                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                     <div className="text-[10px] text-zinc-500 uppercase font-mono">Blended ROAS</div>
                     <div className="text-sm font-bold text-emerald-400 font-mono mt-1">{data.global_metrics.blended_roas}x</div>
                  </div>
               </div>

            </div>
         </div>
      </div>
    );
  }

  return null;
};

export default MerchantIntelligence;