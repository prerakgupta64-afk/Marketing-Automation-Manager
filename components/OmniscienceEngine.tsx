import React, { useState } from 'react';
import { ArrowLeft, Eye, Radar, Target, MessageSquare, AlertTriangle, Zap, Search, Users, FileText, BarChart2, Lightbulb, Video, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { fetchOmniscienceData } from '../services/geminiService';
import { OmniscienceResult } from '../types';

interface OmniscienceEngineProps {
  onBack: () => void;
}

const OmniscienceEngine: React.FC<OmniscienceEngineProps> = ({ onBack }) => {
  const [product, setProduct] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [result, setResult] = useState<OmniscienceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!product.trim() || !competitors.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOmniscienceData(product, competitors);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("FAILED TO INITIALIZE OMNISCIENCE ENGINE. CHECK CONNECTION.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="w-32 h-32 bg-violet-500 blur-[100px] rounded-full"></div>
         </div>
         <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors group z-10">
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
         </button>
         <div className="z-10">
           <h2 className="text-3xl font-mono text-white tracking-tight flex items-center gap-3">
             <Eye className="w-8 h-8 text-violet-500 animate-pulse" />
             OMNISCIENCE_ENGINE // DEEP FORENSICS
           </h2>
           <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
             Multidimensional Sentiment Mapping & Creative Strategy
           </p>
         </div>
      </div>

      {/* Input Section */}
      {!result && (
        <div className="max-w-2xl mx-auto mt-12">
           <div className="text-center mb-8">
              <Radar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-mono text-white mb-2">Initialize Deep Scan</h3>
              <p className="text-zinc-500 text-sm">Input your product and primary targets to scrape Reddit, Amazon, and Media.</p>
           </div>
           
           <div className="space-y-4 bg-zinc-900/50 p-6 rounded border border-zinc-800">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">My Product / Category</label>
                <div className="relative">
                  <Target className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g., Wireless Gaming Headphones"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-violet-500 font-mono text-sm transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Primary Competitors</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    placeholder="e.g., Razer, Logitech, SteelSeries"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-violet-500 font-mono text-sm transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isLoading || !product || !competitors}
                className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-sm font-mono uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Radar className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isLoading ? 'EXECUTING ALL-SOURCE SCAN...' : 'INITIATE OMNISCIENCE'}
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex justify-end">
             <button onClick={() => setResult(null)} className="text-xs font-mono text-zinc-500 hover:text-white uppercase flex items-center gap-2">
               <Search className="w-3 h-3" /> NEW_SCAN
             </button>
          </div>

          {/* Section 1: Deep-Level Reddit Forensics */}
          <div>
            <h3 className="text-xl font-mono text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Radar className="w-6 h-6 text-rose-500" /> 1. DEEP-LEVEL REDDIT FORENSICS
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vulnerability Vector */}
              <div className="glass-panel p-6 rounded-sm lg:col-span-2">
                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Vulnerability Vector
                </h4>
                <div className="space-y-4">
                  {result.reddit_forensics.vulnerability_vector.map((vuln, idx) => (
                    <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded hover:border-rose-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-bold text-sm">"{vuln.issue}"</span>
                        <span className="text-[10px] font-mono px-2 py-1 rounded uppercase bg-rose-950/50 text-rose-400">
                          {vuln.engagement_level} ENGAGEMENT
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase">
                        <MessageSquare className="w-3 h-3" /> Source: {vuln.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slang & Lingo */}
              <div className="glass-panel p-6 rounded-sm">
                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-500" /> Slang & Lingo Extraction
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.reddit_forensics.slang_and_lingo.map((slang, idx) => (
                    <span key={idx} className="bg-violet-950/30 text-violet-400 border border-violet-500/20 px-3 py-1 rounded text-xs font-mono">
                      "{slang}"
                    </span>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-4 font-mono">
                  Use these exact phrases in ad copy to sound like an authentic community recommendation.
                </p>
              </div>

              {/* Feature Gap Analysis */}
              <div className="glass-panel p-6 rounded-sm lg:col-span-3">
                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Feature Gap Analysis (USP Roadmap)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.reddit_forensics.feature_gap_analysis.map((gap, idx) => (
                    <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded">
                      <div className="text-amber-500 text-xs font-mono uppercase mb-1">Missing Feature</div>
                      <div className="text-white font-bold text-sm mb-3">{gap.missing_feature}</div>
                      
                      <div className="text-zinc-500 text-[10px] font-mono uppercase mb-1">Customer Demand</div>
                      <div className="text-zinc-300 text-xs mb-3 italic">"{gap.customer_demand}"</div>
                      
                      <div className="bg-amber-950/20 p-2 rounded border border-amber-900/50">
                        <div className="text-amber-400 text-[10px] font-mono uppercase mb-1">USP Roadmap</div>
                        <div className="text-amber-100 text-xs">{gap.usp_roadmap}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Video Hook & Creative Strategy */}
          <div>
            <h3 className="text-xl font-mono text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Video className="w-6 h-6 text-blue-500" /> 2. THE VIDEO HOOK & CREATIVE STRATEGY
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {result.video_creative_blueprints.map((blueprint, idx) => (
                <div key={idx} className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-sm hover:border-blue-500/30 transition-colors group">
                  <h4 className="text-lg font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {blueprint.concept_name}
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <span className="text-[10px] font-mono text-rose-400 uppercase block mb-1">0-3s: Confrontational Hook</span>
                      <p className="text-sm text-white font-bold italic">"{blueprint.pattern_interrupt_hooks.confrontational}"</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">0-3s: Social Proof Hook</span>
                      <p className="text-sm text-white font-bold italic">"{blueprint.pattern_interrupt_hooks.social_proof}"</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">3-15s: Visual Proof</span>
                      <p className="text-xs text-zinc-300">{blueprint.visual_proof}</p>
                    </div>

                    <div className="bg-blue-950/20 p-3 rounded border border-blue-900/50 mt-4">
                      <span className="text-[10px] font-mono text-blue-400 uppercase block mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Regret Minimization CTA
                      </span>
                      <p className="text-xs text-blue-100 font-medium">"{blueprint.regret_minimization_cta}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: In-Depth Intelligence Report */}
          <div>
            <h3 className="text-xl font-mono text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <BarChart2 className="w-6 h-6 text-emerald-500" /> 3. IN-DEPTH INTELLIGENCE REPORT
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Heatmap */}
              <div className="glass-panel p-6 rounded-sm">
                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Radar className="w-4 h-4 text-emerald-500" /> Sentiment Heatmap
                </h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Frustration Level</span>
                    <div className="text-rose-400 font-bold text-lg">{result.market_forensics_report.sentiment_heatmap.frustration_level}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Best Time to Attack</span>
                    <div className="text-emerald-400 font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {result.market_forensics_report.sentiment_heatmap.attack_timing}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Platforms Analyzed</span>
                    <div className="text-zinc-300 text-sm">{result.market_forensics_report.sentiment_heatmap.platforms_analyzed}</div>
                  </div>
                </div>
              </div>

              {/* Platform Specific Hooks */}
              <div className="glass-panel p-6 rounded-sm">
                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-500" /> Platform-Specific Hooks
                </h4>
                <div className="space-y-3">
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">TikTok</span>
                    <p className="text-sm text-white italic">"{result.market_forensics_report.platform_specific_hooks.tiktok}"</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">YouTube Shorts</span>
                    <p className="text-sm text-white italic">"{result.market_forensics_report.platform_specific_hooks.youtube}"</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Instagram Reels</span>
                    <p className="text-sm text-white italic">"{result.market_forensics_report.platform_specific_hooks.instagram}"</p>
                  </div>
                </div>
              </div>

              {/* Competitor Blindspots */}
              <div className="glass-panel p-6 rounded-sm">
                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-violet-500" /> Competitor Blindspots
                </h4>
                <div className="space-y-4">
                  {result.market_forensics_report.competitor_blindspots.map((spot, idx) => (
                    <div key={idx} className="border-l-2 border-violet-500 pl-4">
                      <div className="text-white font-bold text-sm mb-1">{spot.ignored_feature}</div>
                      <div className="text-zinc-400 text-xs">Angle: {spot.new_ad_angle}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content DNA */}
              <div className="glass-panel p-6 rounded-sm">
                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" /> Content DNA (Viral Elements)
                </h4>
                <div className="space-y-4">
                  {result.market_forensics_report.content_dna.map((dna, idx) => (
                    <div key={idx} className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                      <div className="text-amber-400 text-xs font-mono mb-1">Viral Element: {dna.viral_element}</div>
                      <div className="text-zinc-300 text-xs">Template: {dna.script_template}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Strategic Implementation for MSMEs */}
          <div className="bg-gradient-to-br from-violet-900/20 to-zinc-900 border border-violet-500/30 p-8 rounded-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full"></div>
             <h3 className="text-xl font-mono text-white mb-6 flex items-center gap-2 relative z-10">
               <Zap className="w-6 h-6 text-violet-400" /> 4. STRATEGIC IMPLEMENTATION FOR MSMEs
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                   <h4 className="text-sm font-bold text-white">Eliminating Research Costs</h4>
                 </div>
                 <p className="text-xs text-zinc-400 leading-relaxed">{result.msme_strategic_implementation.cost_elimination}</p>
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                   <h4 className="text-sm font-bold text-white">Data-Backed Spending</h4>
                 </div>
                 <p className="text-xs text-zinc-400 leading-relaxed">{result.msme_strategic_implementation.data_backed_spending}</p>
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                   <h4 className="text-sm font-bold text-white">Rapid Iteration</h4>
                 </div>
                 <p className="text-xs text-zinc-400 leading-relaxed">{result.msme_strategic_implementation.rapid_iteration}</p>
               </div>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default OmniscienceEngine;
