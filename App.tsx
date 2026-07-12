import React, { useState } from 'react';
import { AnalysisResult } from './types';
import { analyzeAdsData } from './services/geminiService';
import { DEMO_CSV_DATA } from './constants';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import BudgetAllocator from './components/BudgetAllocator';
import MarketNews from './components/MarketNews';
import MetaTrends from './components/MetaTrends';
import MerchantIntelligence from './components/MerchantIntelligence';
import OmniscienceEngine from './components/OmniscienceEngine';
import InfluencerLab from './components/InfluencerLab';
import MessagePipeline from './components/MessagePipeline';
import Chatbot from './components/Chatbot';
import { Hexagon, Terminal, BarChart2, Download, Activity, Database, History, Zap, Sword, ShieldAlert, LayoutDashboard, Globe, Network, ShoppingBag, Store, Instagram, Eye, Users, MessageCircle } from 'lucide-react';

type AppMode = 'select' | 'historical' | 'competitor' | 'allocator' | 'merchant' | 'news' | 'meta_trends' | 'omniscience' | 'influencer' | 'messaging';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('select');
  
  // Historical Mode State
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (csvData: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeAdsData(csvData);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError("DATA CORRUPTION DETECTED. CHECK INPUT.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = () => {
    handleAnalysis(DEMO_CSV_DATA);
  };

  const downloadSampleData = () => {
    const blob = new Blob([DEMO_CSV_DATA], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prethink_sample_portfolio.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // --- Render Functions ---

  const renderSelectionScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-in fade-in zoom-in-95 duration-500">
       <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-mono">
            PRETHINK_AI
          </h1>
          <p className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em]">
            Select Operation Mode
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-[1400px] px-4">
          {/* Historical Card */}
          <button 
            onClick={() => setMode('historical')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <History className="w-24 h-24 text-zinc-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <Database className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Post-Trade Analysis</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Historical Model</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Upload past performance CSVs to train the recommendation engine.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-emerald-500 transition-colors">
               <span>Initialize</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>

          {/* Budget & Creative Card */}
          <button 
            onClick={() => setMode('allocator')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutDashboard className="w-24 h-24 text-indigo-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                <Activity className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Live Portfolio</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Real-Time Allocator</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Airtable-style live ledger. Kelly Criterion position sizing & fatigue detection.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-indigo-500 transition-colors">
               <span>Launch Engine</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>

          {/* Merchant Intelligence Card (NEW) */}
          <button 
            onClick={() => setMode('merchant')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingBag className="w-24 h-24 text-emerald-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <Store className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Shopify / Woo</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Merchant Intel</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               POAS Analysis. Import SKUs & COGS to find true net-profit scalers.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-emerald-500 transition-colors">
               <span>Connect Store</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>

          {/* Competitor Card */}
          <button 
            onClick={() => setMode('competitor')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sword className="w-24 h-24 text-rose-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-rose-400 transition-colors">
                <ShieldAlert className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Market Recon</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Competitor Intel</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Spy on market rivals. Generate SWOT and attack vectors.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-rose-500 transition-colors">
               <span>Infiltrate</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>

          {/* Market News Card (NEW) */}
          <button 
            onClick={() => setMode('news')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-24 h-24 text-sky-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-sky-400 transition-colors">
                <Zap className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Global Intel</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Market News</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Real-time trend analysis and industry news wire. Detect alpha signals early.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-sky-500 transition-colors">
               <span>Scan Markets</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>
          {/* Meta Trends Card (NEW) */}
          <button 
            onClick={() => setMode('meta_trends')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Instagram className="w-24 h-24 text-pink-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-pink-400 transition-colors">
                <Zap className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Viral Pulse</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Meta Trends</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Real-time meme formats, trending audio, and viral hooks for Reels/TikTok.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-pink-500 transition-colors">
               <span>Extract Viral Data</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>
          {/* Omniscience Engine Card (NEW) */}
          <button 
            onClick={() => setMode('omniscience')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Eye className="w-24 h-24 text-violet-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-violet-400 transition-colors">
                <Network className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">All-Source Scan</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Omniscience Engine</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Analyze entire digital footprints. Scrape Reddit, Amazon, and media to find market gaps.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-violet-500 transition-colors">
               <span>Initiate Deep Scan</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>
          {/* Influencer Lab Card (NEW) */}
          <button 
            onClick={() => setMode('influencer')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-24 h-24 text-cyan-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-cyan-400 transition-colors">
                <Activity className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Asset Allocation</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">Influencer Lab</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Risk-weighted creator strategy. Predict POAS and generate data-backed creative briefs.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-cyan-500 transition-colors">
               <span>Allocate Capital</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>
          {/* Message Pipeline Card (NEW) */}
          <button 
            onClick={() => setMode('messaging')}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-green-500/50 p-8 text-left transition-all hover:bg-zinc-900/80"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageCircle className="w-24 h-24 text-green-500" />
             </div>
             <div className="flex items-center gap-3 mb-4 text-zinc-400 group-hover:text-green-400 transition-colors">
                <Database className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Data-to-Message</span>
             </div>
             <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">WhatsApp & Email Strategy</h3>
             <p className="text-xs text-zinc-500 font-mono leading-relaxed">
               Turn raw market data into high-converting WhatsApp nudges and Email narratives.
             </p>
             <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 group-hover:text-green-500 transition-colors">
               <span>Generate Scripts</span>
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </button>
       </div>
    </div>
  );

  const renderHistoricalView = () => (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-mono text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-zinc-500" />
          Historical Analysis Model
        </h2>
        <button 
          onClick={() => {
            setAnalysisResult(null);
            setMode('select');
          }}
          className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest hover:underline"
        >
          Exit_Module
        </button>
      </div>

      {error && (
          <div className="mb-6 p-3 bg-rose-950/20 border border-rose-900/50 text-rose-400 text-xs font-mono rounded-sm flex items-center gap-3">
             <Terminal className="w-4 h-4" />
             {error}
          </div>
        )}

      {!analysisResult ? (
        <div className="max-w-xl mx-auto mt-12">
            <FileUpload onFileUpload={handleAnalysis} isLoading={isLoading} />
              
            {!isLoading && (
              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={loadDemoData}
                  className="text-zinc-600 hover:text-emerald-500 transition-colors text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 w-full hover:bg-zinc-900/50 py-2 rounded-sm"
                >
                  <BarChart2 className="w-3 h-3" />
                  Load_Demo_Portfolio (Analyze Now)
                </button>
                <button
                  onClick={downloadSampleData}
                  className="text-zinc-600 hover:text-indigo-400 transition-colors text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 w-full hover:bg-zinc-900/50 py-2 rounded-sm"
                >
                  <Download className="w-3 h-3" />
                  Download_Sample_Data.csv
                </button>
              </div>
            )}
        </div>
      ) : (
        <Dashboard 
          data={analysisResult} 
          onReset={() => setAnalysisResult(null)} 
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/20 selection:text-emerald-200 flex flex-col">
      
      {/* STATUS BAR (Header) */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50 h-10 flex items-center justify-between px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-4">
          <button onClick={() => setMode('select')} className="text-zinc-300 font-bold flex items-center gap-2 hover:text-white transition-colors">
            <Hexagon className="w-3 h-3 text-emerald-500" />
            PRETHINK_AI // QUANT_FUND
          </button>
          <span className="hidden md:inline">v2.7.0-ALPHA</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
            SYSTEM_READY
          </span>
          <span>LATENCY: 14ms</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {mode === 'select' && renderSelectionScreen()}
        {mode === 'historical' && renderHistoricalView()}
        {mode === 'allocator' && <BudgetAllocator onBack={() => setMode('select')} />}
        {mode === 'competitor' && <CompetitorAnalysis onBack={() => setMode('select')} />}
        {mode === 'news' && <MarketNews onBack={() => setMode('select')} />}
        {mode === 'meta_trends' && <MetaTrends onBack={() => setMode('select')} />}
        {mode === 'omniscience' && <OmniscienceEngine onBack={() => setMode('select')} />}
        {mode === 'influencer' && <InfluencerLab onBack={() => setMode('select')} />}
        {mode === 'messaging' && <MessagePipeline onBack={() => setMode('select')} />}
        {mode === 'merchant' && <MerchantIntelligence onBack={() => setMode('select')} />}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-2 px-4">
        <div className="max-w-[1600px] mx-auto flex justify-between text-[10px] font-mono text-zinc-700 uppercase">
          <p>PreThink Quantitative Systems © 2024</p>
          <p>Encrypted Connection: TLS 1.3</p>
        </div>
      </footer>
      
      <Chatbot />
    </div>
  );
};

export default App;