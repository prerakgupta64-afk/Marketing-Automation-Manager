import React from 'react';
import { AnalysisResult, AdMetric } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, Target, 
  ArrowRight, ArrowUpRight, ArrowDownRight, Zap, PieChart,
  Megaphone, AlertTriangle, FlaskConical, Wallet, CheckCircle2, XCircle, Cpu, Image,
  ListFilter, LayoutGrid, Tags, Sparkles, BrainCircuit
} from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  
  // Merge all ads for the master ledger
  const allAds = [...data.top_ads, ...data.low_ads];
  
  // Sort by Spend desc for "Market Cap" feel
  const ledgerData = [...allAds].sort((a, b) => b.revenue - a.revenue);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* ML HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-mono font-bold text-zinc-100 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-500" />
            LIVE_PORTFOLIO_VIEW
          </h2>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800">
               Model: Bayesian Regressor v4.2
             </span>
             <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800">
               Confidence: 98.4%
             </span>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2 hover:bg-zinc-800 rounded transition-colors"><ListFilter className="w-4 h-4 text-zinc-500" /></button>
        </div>
      </div>

      {/* AIRTABLE STYLE GRID */}
      <div className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-900/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium border-r border-zinc-800/50 w-12">Asset</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800/50">Name</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800/50">Tags</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800/50 text-right">Spend</th>
                <th className="px-4 py-3 font-medium border-r border-zinc-800/50 text-right">ROAS</th>
                <th className="px-4 py-3 font-medium text-center">ML Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {ledgerData.map((ad, idx) => {
                const isTop = ad.roi >= 2.5;
                const isLow = ad.roi < 1.5;
                return (
                  <tr key={ad.id} className="group hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-2 border-r border-zinc-800/50">
                      {ad.thumbnail ? (
                        <div className="w-8 h-8 rounded overflow-hidden border border-zinc-700 relative group-hover:scale-110 transition-transform">
                          <img src={ad.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">
                          <Image className="w-3 h-3 text-zinc-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r border-zinc-800/50">
                      <div className="text-zinc-300 font-medium truncate max-w-[120px]">{ad.name}</div>
                    </td>
                    <td className="px-4 py-2 border-r border-zinc-800/50">
                      <div className="flex gap-1 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] uppercase border ${
                          ad.creative_type === 'video' 
                            ? 'bg-blue-950/40 text-blue-400 border-blue-900/30' 
                            : 'bg-orange-950/40 text-orange-400 border-orange-900/30'
                        }`}>
                          {ad.creative_type}
                        </span>
                         <span className="px-1.5 py-0.5 rounded-[3px] text-[9px] uppercase bg-zinc-800 text-zinc-500 border border-zinc-700">
                          {ad.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right border-r border-zinc-800/50 text-zinc-400">
                      {formatCurrency(ad.spend)}
                    </td>
                    <td className="px-4 py-2 text-right border-r border-zinc-800/50">
                       <span className={`font-bold ${isTop ? 'text-emerald-400' : isLow ? 'text-rose-400' : 'text-zinc-400'}`}>
                         {ad.roi}x
                       </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center">
                        {isTop ? (
                           <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] border border-emerald-500/20">
                             <TrendingUp className="w-3 h-3" /> SCALE
                           </span>
                        ) : isLow ? (
                           <span className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full text-[9px] border border-rose-500/20">
                             <XCircle className="w-3 h-3" /> KILL
                           </span>
                        ) : (
                          <span className="text-zinc-600 text-[9px]">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSIGHTS CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-sm">
           <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-2 flex items-center gap-2">
             <BrainCircuit className="w-3 h-3" /> Pattern Recognition
           </h4>
           <p className="text-xs text-zinc-300 leading-relaxed border-l-2 border-emerald-500 pl-3">
             {data.patterns[0]}
           </p>
        </div>
        <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-sm">
           <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-2 flex items-center gap-2">
             <Target className="w-3 h-3" /> Allocation Shift
           </h4>
           <p className="text-xs text-zinc-300 leading-relaxed border-l-2 border-indigo-500 pl-3">
             {data.recommendations.budget_shift_tip}
           </p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;