import React, { useState, useRef } from 'react';
import { analyzeBudgetAndCreative, generateCreativeFromPrompt } from '../services/geminiService';
import { BudgetAnalysisResult, GeneratedCreative } from '../types';
import { DEMO_BUDGET_DATA } from '../constants';
import { 
  ArrowLeft, Upload, FileSpreadsheet, Activity, TrendingUp, TrendingDown, 
  AlertTriangle, DollarSign, Wand2, Paintbrush, Zap, ArrowRight, ImagePlus,
  Loader2, CheckCircle2, Clock, Scale, Table2
} from 'lucide-react';

interface BudgetAllocatorProps {
  onBack: () => void;
}

const BudgetAllocator: React.FC<BudgetAllocatorProps> = ({ onBack }) => {
  const [step, setStep] = useState<'input' | 'analyzing' | 'dashboard'>('input');
  const [data, setData] = useState<BudgetAnalysisResult | null>(null);
  
  // Image Gen State
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedCreative | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null); // For Product Image
  const csvInputRef = useRef<HTMLInputElement>(null); // For CSV Data

  const handleDemoLoad = async () => {
    setStep('analyzing');
    try {
      const result = await analyzeBudgetAndCreative(DEMO_BUDGET_DATA);
      setData(result);
      setStep('dashboard');
    } catch (e) {
      console.error(e);
      setStep('input');
      alert("Analysis failed.");
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('analyzing');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("File is empty");
        
        const result = await analyzeBudgetAndCreative(content);
        setData(result);
        setStep('dashboard');
      } catch (err) {
        console.error(err);
        setStep('input');
        alert("Failed to analyze CSV. Please ensure it matches the required format.");
      }
    };
    reader.readAsText(file);
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
        setGenError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!productImage || !data) return;
    setIsGenerating(true);
    setGenError(null);
    try {
      const cleanBase64 = productImage.split(',')[1];
      const result = await generateCreativeFromPrompt(cleanBase64, data.gemini_generation_prompt);
      setGeneratedAd(result);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('429') || e.message?.includes('Quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
         setGenError("API Quota Reached. Please wait 1 minute before generating again.");
      } else {
         setGenError("Generation failed. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 'input') {
    return (
      <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 mb-8">
           <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <h2 className="text-xl font-mono text-white tracking-tight flex items-center gap-2">
             <Activity className="w-6 h-6 text-indigo-500" />
             REALTIME_ALLOCATOR // LIVE_LEDGER
           </h2>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-sm backdrop-blur-sm text-center">
           <div className="mb-6 flex justify-center">
             <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
               <FileSpreadsheet className="w-8 h-8 text-zinc-400" />
             </div>
           </div>
           <h3 className="text-lg font-mono text-white mb-2">Ingest Campaign Stream</h3>
           <p className="text-xs font-mono text-zinc-500 mb-8 max-w-xs mx-auto">
             Upload real-time CSV data. The system will apply Kelly Criterion logic for optimal position sizing.
           </p>
           
           <div className="space-y-3">
             <input 
               type="file" 
               ref={csvInputRef}
               onChange={handleCsvUpload}
               className="hidden"
               accept=".csv"
             />
             <button 
               onClick={() => csvInputRef.current?.click()}
               className="w-full py-3 bg-zinc-100 text-black font-mono font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Upload className="w-3 h-3" /> Upload Live CSV
             </button>
             <button 
               onClick={handleDemoLoad}
               className="w-full py-3 bg-indigo-900/20 text-indigo-400 border border-indigo-500/30 font-mono font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-indigo-900/30 flex items-center justify-center gap-2"
             >
                <Zap className="w-3 h-3" /> Load Live Demo Stream
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 animate-pulse">
        <Activity className="w-16 h-16 text-indigo-500" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-mono text-white">CALCULATING VECTORS...</h3>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Detecting Fatigue // Applying Kelly Criterion // Drafting Creative
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
             <button onClick={() => setStep('input')} className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
               <h2 className="text-xl font-mono text-white flex items-center gap-2">
                  <Table2 className="w-5 h-5 text-indigo-500" />
                  LIVE AIRTABLE PORTFOLIO
               </h2>
               <p className="text-[10px] font-mono text-zinc-500 uppercase">
                 Method: Kelly Criterion (f*) // AI_SIGNAL: ACTIVE
               </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             {data.realtime_notes.slice(0, 1).map((note, i) => (
               <span key={i} className="text-[10px] font-mono text-amber-500 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30 flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> {note}
               </span>
             ))}
          </div>
        </div>

        {/* 1. AI INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass-panel p-5 rounded-sm">
              <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Performance Summary
              </h3>
              <p className="text-sm font-mono text-zinc-400 leading-relaxed">
                {data.ai_insights.performance_summary}
              </p>
           </div>
           <div className="glass-panel p-5 rounded-sm border-l-4 border-l-rose-500">
              <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Fatigue Alerts
              </h3>
              <ul className="space-y-2">
                {data.ai_insights.fatigue_alerts.map((alert, i) => (
                  <li key={i} className="text-xs font-mono text-zinc-300 flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">»</span> {alert}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        {/* 2. BUDGET ACTIONS TABLE */}
        <div className="glass-panel rounded-sm overflow-hidden border border-zinc-800">
           <div className="p-4 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/50">
              <Scale className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Realtime Budget Allocation (Kelly Sizing)</h3>
           </div>
           <table className="w-full text-left text-xs font-mono">
             <thead className="bg-zinc-900 text-zinc-500">
               <tr>
                 <th className="px-4 py-3 border-r border-zinc-800/50">Campaign</th>
                 <th className="px-4 py-3 border-r border-zinc-800/50">Action</th>
                 <th className="px-4 py-3 text-right border-r border-zinc-800/50">Adjustment</th>
                 <th className="px-4 py-3">AI Reasoning</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-zinc-800">
               {data.budget_actions.map((item, idx) => (
                 <tr key={idx} className="bg-zinc-950/30 hover:bg-zinc-900/50">
                   <td className="px-4 py-3 text-zinc-300 font-bold border-r border-zinc-800/50">{item.campaign}</td>
                   <td className="px-4 py-3 border-r border-zinc-800/50">
                     <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                       item.action === 'SCALE' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                       item.action === 'REDUCE' ? 'bg-rose-950/40 text-rose-400 border-rose-900/30' :
                       item.action === 'KILL' ? 'bg-red-950 text-red-500 border-red-900' :
                       'bg-zinc-800 text-zinc-400 border-zinc-700'
                     }`}>
                       {item.action}
                     </span>
                   </td>
                   <td className="px-4 py-3 text-right text-zinc-200 border-r border-zinc-800/50">{item.amount_suggestion}</td>
                   <td className="px-4 py-3 text-zinc-500 italic">{item.reasoning}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        {/* 3. CREATIVE CHANGES & GENERATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Suggestions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
             <div className="glass-panel p-5 rounded-sm h-full">
               <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-blue-500" /> Creative Optimization
               </h3>
               <div className="space-y-4">
                  {data.creative_changes.map((change, i) => (
                    <div key={i} className="bg-zinc-900/50 p-3 border border-zinc-800 rounded hover:border-blue-500/30 transition-colors">
                       <div className="flex justify-between mb-1">
                         <span className="text-[10px] text-zinc-500 uppercase">{change.ad_name}</span>
                         <span className={`text-[9px] px-1.5 rounded border ${change.priority === 'HIGH' ? 'text-rose-400 border-rose-900/30 bg-rose-950/20' : 'text-zinc-500 border-zinc-800'}`}>{change.priority}</span>
                       </div>
                       <p className="text-xs text-zinc-300 font-mono">{change.suggestion}</p>
                    </div>
                  ))}
               </div>
             </div>
          </div>

          {/* Right: Gemini Generator (7 Cols) */}
          <div className="lg:col-span-7">
             <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                   <h3 className="text-sm font-mono font-bold text-indigo-100 uppercase tracking-widest flex items-center gap-2">
                     <Wand2 className="w-4 h-4 text-indigo-400" /> Gemini Creative Generator
                   </h3>
                   <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-mono rounded">
                     MODEL: GEMINI-2.5-FLASH-IMAGE
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                   
                   {/* Prompt Details */}
                   <div className="space-y-4">
                      <div className="bg-black/40 p-3 rounded border border-zinc-800">
                        <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Winning Visual Pattern</h4>
                        <div className="space-y-2 text-xs font-mono text-zinc-300">
                           <div className="flex gap-2"><span className="text-zinc-600">Style:</span> {data.gemini_generation_prompt.visual_style}</div>
                           <div className="flex gap-2"><span className="text-zinc-600">Bg:</span> {data.gemini_generation_prompt.background}</div>
                           <div className="flex gap-2"><span className="text-zinc-600">Tone:</span> {data.gemini_generation_prompt.text_style}</div>
                        </div>
                      </div>

                      <div className="border border-dashed border-zinc-700 hover:border-indigo-500/50 rounded p-4 bg-zinc-900/30 cursor-pointer transition-colors"
                           onClick={() => fileInputRef.current?.click()}>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductUpload} />
                         {productImage ? (
                           <div className="flex items-center gap-3">
                             <img src={productImage} className="w-12 h-12 object-cover rounded" />
                             <span className="text-xs font-mono text-emerald-400">Product Image Loaded</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-3 text-zinc-500">
                             <ImagePlus className="w-5 h-5" />
                             <span className="text-xs font-mono">Upload Product Reference</span>
                           </div>
                         )}
                      </div>

                      <button 
                        onClick={handleGenerate}
                        disabled={!productImage || isGenerating}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-bold text-xs uppercase tracking-widest rounded shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {isGenerating ? 'Generating...' : 'Generate Optimized Creative'}
                      </button>
                      
                      {genError && (
                         <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded text-rose-400 text-[10px] font-mono flex items-start gap-2">
                            <Clock className="w-3 h-3 shrink-0 mt-0.5" />
                            {genError}
                         </div>
                      )}
                   </div>

                   {/* Output Area */}
                   <div className="bg-black/40 border border-zinc-800 rounded min-h-[250px] flex items-center justify-center relative overflow-hidden">
                      {generatedAd ? (
                        <div className="w-full h-full relative group">
                           <img src={generatedAd.imageUrl} alt="Generated Ad" className="w-full h-full object-contain" />
                           <div className="absolute inset-x-0 bottom-0 bg-black/80 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                             <p className="text-white text-xs font-bold font-mono">{generatedAd.headline}</p>
                             <p className="text-zinc-400 text-[10px] font-mono">{generatedAd.hook}</p>
                           </div>
                           <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-black text-[9px] font-bold font-mono uppercase rounded">
                             Generated
                           </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 opacity-50">
                           <Wand2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                           <p className="text-xs font-mono text-zinc-600">Waiting for generation command...</p>
                        </div>
                      )}
                   </div>

                </div>
             </div>
          </div>

        </div>

      </div>
    );
  }

  return null;
};

export default BudgetAllocator;