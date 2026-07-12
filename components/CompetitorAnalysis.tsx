import React, { useState } from 'react';
import { analyzeCompetitors } from '../services/geminiService';
import { CompetitorAnalysisResult } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { 
  Sword, Shield, Target, TrendingUp, AlertTriangle, 
  Search, Users, Building2, Zap, BrainCircuit, ArrowLeft, BookOpen, FileText, ExternalLink,
  Crosshair, Rocket, Briefcase, Lock, ClipboardCheck
} from 'lucide-react';

interface CompetitorAnalysisProps {
  onBack: () => void;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ onBack }) => {
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [formData, setFormData] = useState({
    myCompany: '',
    competitors: '',
    industry: ''
  });
  const [data, setData] = useState<CompetitorAnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    try {
      const result = await analyzeCompetitors(formData.myCompany, formData.competitors, formData.industry);
      setData(result);
      setStep('results');
    } catch (err) {
      console.error(err);
      setStep('input');
      // Simple error handling for demo
      alert("Intelligence gathering failed. Please try again.");
    }
  };

  if (step === 'input') {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 mb-8">
           <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <h2 className="text-2xl font-mono text-white tracking-tight flex items-center gap-2">
             <Sword className="w-6 h-6 text-rose-500" />
             COMPETITOR_RECON // INTEL_GATHERING
           </h2>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-sm backdrop-blur-sm">
          <form onSubmit={handleAnalyze} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                Target Asset (Your Company)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <input 
                  required
                  type="text" 
                  value={formData.myCompany}
                  onChange={(e) => setFormData({...formData, myCompany: e.target.value})}
                  placeholder="e.g. PreThink AI"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 text-zinc-200 text-sm font-mono py-3 pl-10 pr-4 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                Hostile Entities (Competitors)
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <textarea 
                  required
                  value={formData.competitors}
                  onChange={(e) => setFormData({...formData, competitors: e.target.value})}
                  placeholder="e.g. AdScale, Smartly.io, Madgicx (Comma separated)"
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500/50 text-zinc-200 text-sm font-mono py-3 pl-10 pr-4 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                Battlefield (Industry/Vertical)
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <input 
                  required
                  type="text" 
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g. SaaS Ad Automation"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500/50 text-zinc-200 text-sm font-mono py-3 pl-10 pr-4 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-4 bg-zinc-100 hover:bg-white text-black font-mono font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Initiate Surveillance
            </button>

          </form>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 animate-pulse">
        <BrainCircuit className="w-16 h-16 text-rose-500" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-mono text-white">ANALYZING MARKET VECTORS...</h3>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Scraping Sentiment // Estimating Spend // Calculating Alpha
          </p>
        </div>
      </div>
    );
  }

  if (step === 'results' && data) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
             <button onClick={() => setStep('input')} className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
               <h2 className="text-xl font-mono text-white">INTELLIGENCE REPORT</h2>
               <p className="text-[10px] font-mono text-zinc-500 uppercase">
                 Subject: {formData.myCompany} vs {formData.competitors.split(',')[0]}...
               </p>
             </div>
          </div>
          <div className="px-3 py-1 bg-rose-950/30 border border-rose-900/50 text-rose-400 text-[10px] font-mono uppercase tracking-widest rounded-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Classified
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col: Market Landscape */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Market Capture Playbook (NEW) */}
             <div className="glass-panel p-6 rounded-sm border-l-4 border-l-emerald-500">
               <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-emerald-500" /> Market Capture Playbook
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  {data.market_capture_playbook?.map((tactic, idx) => (
                    <div key={idx} className="bg-zinc-950/50 border border-zinc-800 rounded p-5 hover:border-emerald-500/30 transition-all">
                       <div className="flex items-start justify-between mb-3">
                         <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase rounded">Target: {tactic.competitor_target}</span>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                             <span className="text-[10px] font-mono text-rose-500 uppercase flex items-center gap-1 mb-1">
                               <AlertTriangle className="w-3 h-3" /> Vulnerability Identified
                             </span>
                             <p className="text-xs text-zinc-300 font-mono leading-relaxed">{tactic.vulnerability}</p>
                          </div>
                          <div>
                             <span className="text-[10px] font-mono text-emerald-500 uppercase flex items-center gap-1 mb-1">
                               <Rocket className="w-3 h-3" /> Counter-Tactic
                             </span>
                             <p className="text-xs text-emerald-100 font-mono leading-relaxed">{tactic.counter_tactic}</p>
                          </div>
                       </div>
                       
                       <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">Execution Protocol</span>
                          <ol className="list-decimal pl-4 space-y-1">
                             {tactic.execution_steps.map((step, i) => (
                               <li key={i} className="text-xs text-zinc-400 font-mono">{step}</li>
                             ))}
                          </ol>
                       </div>
                    </div>
                  ))}
               </div>
             </div>

             {/* Case Studies Section (ENHANCED) */}
             <div className="space-y-4">
               <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                 <Briefcase className="w-4 h-4 text-blue-500" /> Operational Forensics (Case Studies)
               </h3>
               <div className="grid grid-cols-1 gap-4">
                 {data.case_studies.map((study, idx) => (
                   <div key={idx} className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm hover:border-zinc-700 transition-colors group">
                     <div className="flex justify-between items-start mb-3">
                       <h4 className="text-sm font-bold text-zinc-100 font-mono flex items-center gap-2">
                         <Lock className="w-3 h-3 text-zinc-600 group-hover:text-blue-500 transition-colors" />
                         {study.title}
                       </h4>
                       <span className="px-2 py-0.5 bg-blue-950/30 text-blue-400 text-[10px] font-mono border border-blue-900/30 rounded">
                         CASE_FILE: {study.company}
                       </span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                       <div className="space-y-1">
                         <span className="text-zinc-500 block uppercase text-[9px] tracking-widest">Operational Context</span>
                         <p className="text-zinc-300 leading-relaxed">{study.scenario}</p>
                       </div>
                       <div className="space-y-1">
                         <span className="text-zinc-500 block uppercase text-[9px] tracking-widest">Tactical Execution</span>
                         <p className="text-zinc-300 leading-relaxed">{study.strategy_executed}</p>
                       </div>
                       <div className="space-y-1 bg-zinc-950 p-2 rounded border border-zinc-800">
                         <span className="text-emerald-500 block uppercase text-[9px] tracking-widest">Impact Analysis</span>
                         <p className="text-emerald-400 font-bold">{study.result_metrics}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Detailed Ad Dossier */}
             <div className="space-y-4">
               <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                 <FileText className="w-4 h-4 text-yellow-500" /> Creative Reconnaissance Dossier
               </h3>
               <div className="overflow-x-auto border border-zinc-800 rounded-sm">
                 <table className="w-full text-left text-xs font-mono">
                   <thead className="bg-zinc-900 text-zinc-500 border-b border-zinc-800">
                     <tr>
                       <th className="px-4 py-3 font-medium">Competitor</th>
                       <th className="px-4 py-3 font-medium">Primary Hook</th>
                       <th className="px-4 py-3 font-medium">Visual Style</th>
                       <th className="px-4 py-3 font-medium">Copy Framework</th>
                       <th className="px-4 py-3 font-medium text-right">Est. Spend</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800">
                     {data.ad_details.map((detail, idx) => (
                       <tr key={idx} className="bg-zinc-950/30 hover:bg-zinc-900/50 transition-colors">
                         <td className="px-4 py-3 text-zinc-300 font-bold">{detail.competitor_name}</td>
                         <td className="px-4 py-3 text-zinc-400">{detail.primary_hook}</td>
                         <td className="px-4 py-3 text-zinc-400">{detail.visual_style}</td>
                         <td className="px-4 py-3 text-zinc-400">{detail.copy_framework}</td>
                         <td className="px-4 py-3 text-right text-emerald-400">{detail.est_monthly_spend}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
             
             {/* Meta Ad Library Button */}
             <div className="pt-4 flex justify-end">
                <a 
                  href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(formData.competitors)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-mono font-bold text-xs uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  Inspect in Meta Ad Library
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
             </div>

          </div>

          {/* Right Col: SWOT & Insights */}
          <div className="space-y-6">
            
            {/* Market Share Chart */}
             <div className="glass-panel p-6 rounded-sm">
                <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" /> Estimated Market Dominance
                </h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.market_landscape} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="1 1" stroke="#27272a" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#a1a1aa" tick={{fontSize: 10, fontFamily: 'monospace'}} width={80} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#09090b', borderColor: '#27272a', color: '#e4e4e7'}}
                        itemStyle={{fontFamily: 'monospace', fontSize: '12px'}}
                      />
                      <Bar dataKey="market_share_est" radius={[0, 4, 4, 0]}>
                        {data.market_landscape.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name.toLowerCase().includes(formData.myCompany.toLowerCase()) ? '#34d399' : '#3f3f46'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

            {/* SWOT Matrix */}
            <div className="glass-panel p-5 rounded-sm">
               <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" /> Strategic Position (SWOT)
               </h3>
               
               <div className="space-y-4">
                 <div>
                   <span className="text-[10px] font-mono text-emerald-500 uppercase block mb-1">Strengths</span>
                   <ul className="text-xs text-zinc-400 list-disc pl-4 space-y-1">
                     {data.swot.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                   </ul>
                 </div>
                 <div>
                   <span className="text-[10px] font-mono text-rose-500 uppercase block mb-1">Weaknesses</span>
                   <ul className="text-xs text-zinc-400 list-disc pl-4 space-y-1">
                     {data.swot.weaknesses.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                   </ul>
                 </div>
                 <div>
                   <span className="text-[10px] font-mono text-amber-500 uppercase block mb-1">Opportunities</span>
                   <ul className="text-xs text-zinc-400 list-disc pl-4 space-y-1">
                     {data.swot.opportunities.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                   </ul>
                 </div>
               </div>
            </div>

            {/* Attack Vectors */}
             <div className="glass-panel p-6 rounded-sm border-l-4 border-l-rose-500">
                <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sword className="w-4 h-4" /> Recommended Attack Vectors
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {data.attack_vectors.map((vector, i) => (
                    <div key={i} className="bg-zinc-950/50 p-4 border border-zinc-800/50 hover:border-rose-900/50 transition-colors">
                      <div className="text-[10px] text-zinc-600 font-mono mb-2">VECTOR_0{i+1}</div>
                      <p className="text-xs text-zinc-300 font-mono leading-relaxed">{vector}</p>
                    </div>
                  ))}
                </div>
             </div>

          </div>
        </div>

      </div>
    );
  }

  return null;
};

export default CompetitorAnalysis;