import React, { useState, useEffect } from 'react';
import { ArrowLeft, Instagram, Music, Hash, Zap, Copy, Check, TrendingUp, Layers, Lightbulb } from 'lucide-react';
import { fetchMetaTrends } from '../services/geminiService';
import { MetaTrendResult } from '../types';

interface MetaTrendsProps {
  onBack: () => void;
}

const MetaTrends: React.FC<MetaTrendsProps> = ({ onBack }) => {
  const [result, setResult] = useState<MetaTrendResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleFetchTrends = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMetaTrends();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("FAILED TO FETCH META TRENDS. TRY AGAIN.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    handleFetchTrends();
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-6">
         <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors group">
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
         </button>
         <div>
           <h2 className="text-3xl font-mono text-white tracking-tight flex items-center gap-3">
             <Instagram className="w-8 h-8 text-pink-500 animate-pulse" />
             META_TREND_PULSE // REAL_TIME
           </h2>
           <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
             Viral Memes, Audio & Ad Formats
           </p>
         </div>
      </div>

      {isLoading && !result && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
           <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
           <p className="text-zinc-500 font-mono text-xs animate-pulse">SCANNING INSTAGRAM & FACEBOOK API...</p>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto mt-12 p-4 bg-rose-950/20 border border-rose-900/50 rounded text-center">
           <p className="text-rose-400 font-mono text-xs mb-4">{error}</p>
           <button 
             onClick={handleFetchTrends}
             className="bg-rose-900/50 hover:bg-rose-900 text-rose-200 px-4 py-2 rounded text-xs font-mono uppercase"
           >
             Retry Connection
           </button>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Left Column: Memes & Formats */}
          <div className="lg:col-span-7 space-y-8">
             
             {/* Viral Memes Section */}
             <div>
                <h3 className="text-lg font-mono text-white flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-pink-500" /> VIRAL_MEME_FORMATS
                </h3>
                <div className="space-y-4">
                  {result.viral_memes.map((meme, idx) => (
                    <div key={idx} className="glass-panel p-6 rounded-sm border-l-2 border-l-zinc-700 hover:border-l-pink-500 transition-colors group">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-zinc-200 group-hover:text-pink-400 transition-colors">
                            {meme.name}
                          </h4>
                          <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-1 rounded uppercase">
                            {meme.visual_style}
                          </span>
                       </div>
                       <p className="text-sm text-zinc-400 mb-4">{meme.description}</p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                             <span className="text-pink-500 block mb-1 uppercase">Why It's Viral</span>
                             <span className="text-zinc-300">{meme.viral_reason}</span>
                          </div>
                          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                             <span className="text-emerald-500 block mb-1 uppercase">Example Hook</span>
                             <span className="text-zinc-300">"{meme.example_hook}"</span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Deep Strategy */}
             <div className="bg-gradient-to-br from-pink-900/10 to-zinc-900 border border-pink-500/20 p-6 rounded-sm">
                <h3 className="text-sm font-mono text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Deep_Strategy_Analysis
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed font-light">
                  {result.deep_strategy}
                </p>
             </div>

          </div>

          {/* Right Column: Audio, Hooks, Formats */}
          <div className="lg:col-span-5 space-y-6">
             
             {/* Trending Audio */}
             <div className="glass-panel p-6 rounded-sm">
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-500" /> Trending_Audio
                </h3>
                <div className="space-y-4">
                  {result.trending_audio.map((audio, idx) => (
                    <div key={idx} className="flex items-center gap-4 border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                       <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 font-bold text-xs">
                         {idx + 1}
                       </div>
                       <div>
                          <div className="text-white font-bold text-sm">{audio.name}</div>
                          <div className="text-xs text-zinc-500 mt-1">
                             <span className="text-zinc-400">{audio.mood}</span> • {audio.usage_context}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Actionable Hooks */}
             <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm">
                <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Copy_Paste_Hooks
                </h3>
                <div className="space-y-3">
                  {result.actionable_hooks.map((hook, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-zinc-950 p-3 rounded border border-zinc-800 group hover:border-emerald-500/30 transition-colors">
                       <span className="text-sm text-zinc-300 font-mono">"{hook}"</span>
                       <button 
                         onClick={() => copyToClipboard(hook, idx)}
                         className="text-zinc-500 hover:text-emerald-500 transition-colors p-2"
                       >
                         {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                  ))}
                </div>
             </div>

             {/* Trending Formats */}
             <div className="glass-panel p-6 rounded-sm">
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" /> Winning_Ad_Formats
                </h3>
                <div className="flex flex-wrap gap-2">
                   {result.ad_formats.map((format, idx) => (
                     <span key={idx} className="bg-blue-900/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-mono">
                       {format}
                     </span>
                   ))}
                </div>
             </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MetaTrends;
