import React, { useState } from 'react';
import { ArrowLeft, Globe, TrendingUp, Newspaper, Zap, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { fetchMarketNews } from '../services/geminiService';
import { MarketNewsResult } from '../types';

interface MarketNewsProps {
  onBack: () => void;
}

const MarketNews: React.FC<MarketNewsProps> = ({ onBack }) => {
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState<MarketNewsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!industry.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMarketNews(industry);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("FAILED TO FETCH REAL-TIME INTEL. TRY AGAIN.");
    } finally {
      setIsLoading(false);
    }
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
             <Globe className="w-8 h-8 text-sky-500 animate-pulse" />
             GLOBAL_NEWS_WIRE // REAL_TIME
           </h2>
           <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
             Live Market Intelligence & Trend Detection
           </p>
         </div>
      </div>

      {/* Input Section */}
      {!result && (
        <div className="max-w-2xl mx-auto mt-20 text-center">
           <div className="mb-8">
              <Newspaper className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-mono text-white mb-2">Initialize News Stream</h3>
              <p className="text-zinc-500 text-sm">Enter your target industry to scan for real-time alpha.</p>
           </div>
           
           <div className="flex gap-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-zinc-500" />
              </div>
              <input 
                type="text" 
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="E.g. Sustainable Fashion, SaaS, Crypto, Skincare..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-4 rounded-sm focus:outline-none focus:border-sky-500 font-mono text-sm transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button 
                onClick={handleAnalyze}
                disabled={isLoading || !industry}
                className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-sm font-mono uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isLoading ? 'SCANNING...' : 'ANALYZE'}
              </button>
           </div>
           
           {error && (
             <div className="mt-4 text-rose-500 text-xs font-mono bg-rose-950/20 p-2 border border-rose-900/50 rounded-sm">
               {error}
             </div>
           )}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Left Column: News Feed */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-mono text-white flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-sky-500" /> LATEST_WIRE
                </h3>
                <button onClick={() => setResult(null)} className="text-xs font-mono text-zinc-500 hover:text-white uppercase">
                  NEW_SEARCH
                </button>
             </div>

             <div className="space-y-4">
               {result.news_feed.map((news, idx) => (
                 <div key={idx} className="glass-panel p-6 rounded-sm border-l-2 border-l-zinc-700 hover:border-l-sky-500 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">
                         {news.source}
                       </span>
                       <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${
                         news.sentiment === 'POSITIVE' ? 'text-emerald-400 bg-emerald-950/30' : 
                         news.sentiment === 'NEGATIVE' ? 'text-rose-400 bg-rose-950/30' : 'text-zinc-400 bg-zinc-900'
                       }`}>
                         {news.sentiment}
                       </span>
                    </div>
                    <h4 className="text-lg font-bold text-zinc-200 mb-2 group-hover:text-sky-400 transition-colors">
                      <a href={news.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        {news.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light">
                      {news.summary}
                    </p>
                 </div>
               ))}
             </div>
             
             <div className="mt-8">
                <h3 className="text-lg font-mono text-white flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-500" /> REAL_TIME_SYNTHESIS
                </h3>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm text-sm text-zinc-300 leading-relaxed font-mono">
                   {result.real_time_analysis}
                </div>
             </div>
          </div>

          {/* Right Column: Trends & Implications */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Trending Topics */}
             <div className="glass-panel p-6 rounded-sm">
                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Trending_Vectors
                </h3>
                <div className="space-y-4">
                  {result.trending_topics.map((trend, idx) => (
                    <div key={idx} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-bold">{trend.topic}</span>
                          <span className="text-emerald-400 font-mono text-xs">{trend.growth_rate}</span>
                       </div>
                       <p className="text-xs text-zinc-500 mb-2">{trend.context}</p>
                       <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              trend.volume === 'HIGH' ? 'bg-emerald-500 w-3/4' : 
                              trend.volume === 'MEDIUM' ? 'bg-brand-yellow w-1/2' : 'bg-zinc-600 w-1/4'
                            }`}
                          ></div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Marketing Implications */}
             <div className="bg-indigo-950/10 border border-indigo-500/20 p-6 rounded-sm">
                <h3 className="text-sm font-mono text-indigo-400 uppercase tracking-widest mb-4">
                  Strategic_Implications
                </h3>
                <ul className="space-y-3">
                  {result.marketing_implications.map((imp, idx) => (
                    <li key={idx} className="flex gap-3 text-xs text-zinc-300">
                       <span className="text-indigo-500 font-bold">0{idx + 1}.</span>
                       {imp}
                    </li>
                  ))}
                </ul>
             </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MarketNews;
