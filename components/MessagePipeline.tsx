import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Mail, Database, Zap, Search, Target, Users, Copy, Check, Quote, Clock, MapPin } from 'lucide-react';
import { fetchMessagePipeline } from '../services/geminiService';
import { MessagePipelineResult } from '../types';

interface MessagePipelineProps {
  onBack: () => void;
}

const MessagePipeline: React.FC<MessagePipelineProps> = ({ onBack }) => {
  const [product, setProduct] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [result, setResult] = useState<MessagePipelineResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!product.trim() || !competitors.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMessagePipeline(product, competitors);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("FAILED TO INITIALIZE STRATEGY. CHECK CONNECTION.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="w-32 h-32 bg-green-500 blur-[100px] rounded-full"></div>
         </div>
         <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors group z-10">
           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
         </button>
         <div className="z-10">
           <h2 className="text-3xl font-mono text-white tracking-tight flex items-center gap-3">
             <MessageCircle className="w-8 h-8 text-green-500 animate-pulse" />
             WHATSAPP_&_EMAIL_STRATEGY
           </h2>
           <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
             WhatsApp & Email Marketing Automation
           </p>
         </div>
      </div>

      {/* Input Section */}
      {!result && (
        <div className="max-w-2xl mx-auto mt-12">
           <div className="text-center mb-8">
              <Database className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-mono text-white mb-2">Initialize Data Scraping</h3>
              <p className="text-zinc-500 text-sm">Input your product and competitors to extract high-impact points.</p>
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
                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-green-500 font-mono text-sm transition-colors"
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
                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-green-500 font-mono text-sm transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isLoading || !product || !competitors}
                className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-sm font-mono uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Zap className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isLoading ? 'SCRAPING & SCRIPTING...' : 'GENERATE CAMPAIGNS'}
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
               <Search className="w-3 h-3" /> NEW_STRATEGY
             </button>
          </div>

          {/* Strategic Summary */}
          <div className="bg-gradient-to-br from-green-900/20 to-zinc-900 border border-green-500/30 p-8 rounded-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full"></div>
             <h3 className="text-xl font-mono text-white mb-4 flex items-center gap-2 relative z-10">
               <Zap className="w-6 h-6 text-green-400" /> STRATEGIC_SUMMARY
             </h3>
             <p className="text-zinc-300 leading-relaxed font-light relative z-10">
               {result.strategic_summary}
             </p>
          </div>

          {/* Point Extraction */}
          <div>
            <h3 className="text-xl font-mono text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Database className="w-6 h-6 text-blue-500" /> 1. POINT EXTRACTION (THE INTELLIGENCE)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.extracted_points.map((point, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-sm border-t-2 border-t-blue-500">
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Pain Point</span>
                    <p className="text-sm text-white font-bold">"{point.pain_point}"</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Desired Outcome</span>
                    <p className="text-sm text-emerald-400">"{point.desired_outcome}"</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Source Vulnerability</span>
                    <p className="text-xs text-zinc-400">{point.source_vulnerability}</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                    <span className="text-[10px] font-mono text-violet-400 uppercase block mb-2">Customer Lingo</span>
                    <div className="flex flex-wrap gap-2">
                      {point.customer_lingo.map((lingo, lIdx) => (
                        <span key={lIdx} className="bg-violet-950/30 text-violet-300 px-2 py-1 rounded text-[10px] font-mono border border-violet-500/20">
                          "{lingo}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy & Scripting */}
          <div>
            <h3 className="text-xl font-mono text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <MessageCircle className="w-6 h-6 text-green-500" /> 2. STRATEGY & SCRIPTING (THE OUTPUT)
            </h3>
            <div className="space-y-8">
              {result.campaigns.map((campaign, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                  <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h4 className="text-lg font-bold text-white font-mono">{campaign.campaign_name}</h4>
                    <span className="text-[10px] font-mono bg-green-950/30 text-green-400 px-2 py-1 rounded uppercase border border-green-500/20">
                      Campaign 0{idx + 1}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    {/* Demographic & Timing Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-zinc-950 p-4 rounded border border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-3 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-500"/> Target Demographic
                        </span>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span className="text-xs text-zinc-400">Age Group</span>
                            <span className="text-xs font-bold text-white">{campaign.target_demographic.age_group}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span className="text-xs text-zinc-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> Geography</span>
                            <span className="text-xs font-bold text-white">{campaign.target_demographic.geography}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400">Behavioral Trait</span>
                            <span className="text-xs font-bold text-amber-400">{campaign.target_demographic.behavioral_trait}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-950 p-4 rounded border border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-violet-500"/> Optimal Dispatch Timing
                        </span>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span className="text-xs text-zinc-400 flex items-center gap-1"><MessageCircle className="w-3 h-3 text-green-500"/> WhatsApp</span>
                            <span className="text-xs font-bold text-green-400">{campaign.optimal_dispatch_time.whatsapp}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span className="text-xs text-zinc-400 flex items-center gap-1"><Mail className="w-3 h-3 text-blue-500"/> Email</span>
                            <span className="text-xs font-bold text-blue-400">{campaign.optimal_dispatch_time.email}</span>
                          </div>
                          <div className="pt-1">
                            <p className="text-[10px] text-zinc-500 leading-relaxed italic">"{campaign.optimal_dispatch_time.reasoning}"</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">The Hook</span>
                      <p className="text-sm text-white font-bold italic border-l-2 border-green-500 pl-3">"{campaign.hook}"</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* WhatsApp Format */}
                      <div className="bg-zinc-950 rounded border border-zinc-800 p-4 relative group">
                        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-mono text-zinc-400 uppercase">WhatsApp Nudge</span>
                        </div>
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                          {campaign.whatsapp_copy}
                        </p>
                        <button 
                          onClick={() => copyToClipboard(campaign.whatsapp_copy, `wa-${idx}`)}
                          className="absolute top-4 right-4 text-zinc-500 hover:text-green-500 transition-colors bg-zinc-900 p-1.5 rounded"
                        >
                          {copiedIndex === `wa-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Email Format */}
                      <div className="bg-zinc-950 rounded border border-zinc-800 p-4 relative group">
                        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-mono text-zinc-400 uppercase">Email Narrative</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Subject</span>
                          <p className="text-sm text-white font-bold">{campaign.email_subject}</p>
                        </div>
                        <div className="mb-4">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Body</span>
                          <p className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                            {campaign.email_body}
                          </p>
                        </div>
                        <div className="bg-blue-950/10 p-3 rounded border border-blue-900/30">
                          <span className="text-[10px] font-mono text-blue-400 uppercase block mb-1 flex items-center gap-1">
                            <Quote className="w-3 h-3" /> Social Proof Integration
                          </span>
                          <p className="text-xs text-zinc-400 italic">"{campaign.social_proof_quote}"</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(`Subject: ${campaign.email_subject}\n\n${campaign.email_body}`, `email-${idx}`)}
                          className="absolute top-4 right-4 text-zinc-500 hover:text-blue-500 transition-colors bg-zinc-900 p-1.5 rounded"
                        >
                          {copiedIndex === `email-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
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

export default MessagePipeline;
