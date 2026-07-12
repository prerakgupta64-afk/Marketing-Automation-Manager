import React, { useState } from 'react';
import { ArrowLeft, Users, Target, TrendingUp, DollarSign, Megaphone, Briefcase, Video, ShieldCheck, Zap, Search } from 'lucide-react';
import { fetchInfluencerStrategy } from '../services/geminiService';
import { InfluencerMarketingResult } from '../types';

interface InfluencerLabProps {
  onBack: () => void;
}

const InfluencerLab: React.FC<InfluencerLabProps> = ({ onBack }) => {
  const [budget, setBudget] = useState('');
  const [product, setProduct] = useState('');
  const [goal, setGoal] = useState('Direct Sales (ROAS)');
  const [location, setLocation] = useState('India');
  const [result, setResult] = useState<InfluencerMarketingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!budget.trim() || !product.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInfluencerStrategy(budget, product, goal, location);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("FAILED TO INITIALIZE INFLUENCER LAB. CHECK CONNECTION.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="w-32 h-32 bg-cyan-500 blur-[100px] rounded-full"></div>
         </div>
         <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors group z-10">
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
         </button>
         <div className="z-10">
           <h2 className="text-3xl font-mono text-white tracking-tight flex items-center gap-3">
             <Users className="w-8 h-8 text-cyan-500 animate-pulse" />
             INFLUENCER_ASSET_LAB // RISK-WEIGHTED
           </h2>
           <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
             Performance-Driven Creator Allocation
           </p>
         </div>
      </div>

      {/* Input Section */}
      {!result && (
        <div className="max-w-2xl mx-auto mt-12">
           <div className="text-center mb-8">
              <Megaphone className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-mono text-white mb-2">Initialize Asset Allocation</h3>
              <p className="text-zinc-500 text-sm">Input your parameters to generate a risk-weighted influencer strategy.</p>
           </div>
           
           <div className="space-y-4 bg-zinc-900/50 p-6 rounded border border-zinc-800">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Total Budget (Include Currency)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., ₹5,00,000 or $10,000"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-cyan-500 font-mono text-sm transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Sector / Product</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g., Sustainable Skincare"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-cyan-500 font-mono text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Target Region</label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-cyan-500 font-mono text-sm transition-colors appearance-none"
                    >
                      <option value="India">India</option>
                      <option value="Foreign/Global">Foreign / Global</option>
                      <option value="Mixed (India & Global)">Mixed (India & Global)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Primary Goal</label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <select 
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-cyan-500 font-mono text-sm transition-colors appearance-none"
                    >
                      <option value="Direct Sales (ROAS)">Direct Sales (ROAS)</option>
                      <option value="Brand Awareness">Brand Awareness</option>
                      <option value="Lead Generation">Lead Generation</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isLoading || !budget || !product}
                className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-sm font-mono uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <TrendingUp className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isLoading ? 'CALCULATING ALLOCATIONS...' : 'GENERATE STRATEGY'}
              </button>
           </div>
           
           {error && (
             <div className="mt-4 text-rose-500 text-xs font-mono bg-rose-950/20 p-3 border border-rose-900/50 rounded-sm text-center">
               {error}
             </div>
           )}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex justify-end">
             <button onClick={() => setResult(null)} className="text-xs font-mono text-zinc-500 hover:text-white uppercase flex items-center gap-2">
               <Search className="w-3 h-3" /> NEW_STRATEGY
             </button>
          </div>

          {/* Strategic Summary & Budget Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-cyan-900/20 to-zinc-900 border border-cyan-500/30 p-8 rounded-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full"></div>
               <h3 className="text-xl font-mono text-white mb-4 flex items-center gap-2 relative z-10">
                 <Target className="w-6 h-6 text-cyan-400" /> STRATEGIC_SUMMARY
               </h3>
               <p className="text-zinc-300 leading-relaxed font-light relative z-10">
                 {result.strategic_summary}
               </p>
            </div>

            <div className="glass-panel p-6 rounded-sm flex flex-col justify-between">
               <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <DollarSign className="w-4 h-4 text-emerald-500" /> Budget_Split
               </h3>
               
               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500"/> Safe Bets</span>
                     <span className="text-lg font-bold text-emerald-400">{result.budget_split.safe_bets_percentage}%</span>
                   </div>
                   <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${result.budget_split.safe_bets_percentage}%` }}></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-500"/> High-Growth</span>
                     <span className="text-lg font-bold text-cyan-400">{result.budget_split.high_growth_percentage}%</span>
                   </div>
                   <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                     <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${result.budget_split.high_growth_percentage}%` }}></div>
                   </div>
                 </div>
               </div>

               <p className="text-[10px] text-zinc-500 mt-6 font-mono border-t border-zinc-800 pt-4">
                 {result.budget_split.reasoning}
               </p>
            </div>
          </div>

          {/* Influencer Roster */}
          <div>
             <h3 className="text-lg font-mono text-white flex items-center gap-2 mb-6">
               <Users className="w-5 h-5 text-cyan-500" /> INFLUENCER_ROSTER
             </h3>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {result.influencers.map((inf, idx) => (
                 <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-cyan-500/30 transition-colors group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                         <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{inf.name}</h4>
                         <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-mono text-zinc-500 uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1">
                             <Video className="w-3 h-3" /> {inf.platform}
                           </span>
                           <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                             inf.category === 'Safe Bet' ? 'bg-emerald-950/30 text-emerald-400' : 'bg-cyan-950/30 text-cyan-400'
                           }`}>
                             {inf.category}
                           </span>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-xs font-mono text-zinc-500 uppercase">Allocation</div>
                         <div className="text-lg font-bold text-white">{inf.approx_allocation}</div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                         <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Why Them?</span>
                         <p className="text-xs text-zinc-300">{inf.why_them}</p>
                       </div>
                       <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex flex-col justify-between">
                         <div>
                           <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Platform Edge</span>
                           <p className="text-xs text-zinc-300">{inf.why_platform}</p>
                         </div>
                         <div className="mt-2 pt-2 border-t border-zinc-800">
                           <span className="text-[10px] font-mono text-zinc-500 uppercase block">Predictive POAS</span>
                           <span className="text-sm font-bold text-emerald-400">{inf.predictive_poas}x</span>
                         </div>
                       </div>
                    </div>

                    <div className="mt-auto space-y-3">
                       <div>
                         <span className="text-[10px] font-mono text-cyan-500 uppercase block mb-1">The 3-Second Hook</span>
                         <p className="text-sm text-white font-bold italic">"{inf.hook}"</p>
                       </div>
                       <div className="bg-cyan-950/10 p-3 rounded border border-cyan-500/20">
                         <span className="text-[10px] font-mono text-cyan-500 uppercase block mb-1">Creative Brief</span>
                         <p className="text-xs text-zinc-300">{inf.creative_brief}</p>
                       </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800">
                       <h5 className="text-[10px] font-mono text-emerald-500 uppercase mb-3 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Deep Price Analysis</h5>
                       <div className="grid grid-cols-1 gap-3">
                         <div className="bg-zinc-950 p-3 rounded border border-zinc-800/50">
                           <span className="text-[9px] text-zinc-500 uppercase block mb-1">Est. CPM</span>
                           <span className="text-xs text-zinc-300">{inf.price_analysis.estimated_cpm}</span>
                         </div>
                         <div className="bg-zinc-950 p-3 rounded border border-zinc-800/50">
                           <span className="text-[9px] text-zinc-500 uppercase block mb-1">Negotiation Leverage</span>
                           <span className="text-xs text-zinc-300">{inf.price_analysis.negotiation_leverage}</span>
                         </div>
                         <div className="bg-zinc-950 p-3 rounded border border-zinc-800/50">
                           <span className="text-[9px] text-zinc-500 uppercase block mb-1">Hidden Costs</span>
                           <span className="text-xs text-zinc-300">{inf.price_analysis.hidden_costs}</span>
                         </div>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default InfluencerLab;
