import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, AdMetric, GeneratedCreative } from '../types';
import { analyzeAdsData, generateAdCreative } from '../services/geminiService';
import { 
  initFacebookSdk, loginToFacebook, getAdAccounts, getAccountInsights, MetaAdAccount,
  mockLogin, mockGetAdAccounts, mockGetInsights, AdDataPacket 
} from '../services/metaService';
import Dashboard from './Dashboard';
import { 
  Wifi, Lock, CheckCircle2, Loader2, Globe, Server, Facebook, AlertTriangle, ShieldAlert,
  Wand2, Upload, RefreshCw, Zap, Layers, Sparkles, MoveRight, ImagePlus, Type, Wallpaper
} from 'lucide-react';

interface RealTimeAllocatorProps {
  onBack: () => void;
}

const RealTimeAllocator: React.FC<RealTimeAllocatorProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'authenticating' | 'selecting_account' | 'fetching' | 'analyzing' | 'complete'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);

  // --- Ad Generator State ---
  const [genStep, setGenStep] = useState<'idle' | 'uploading' | 'generating' | 'done'>('idle');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [generatedAd, setGeneratedAd] = useState<GeneratedCreative | null>(null);
  
  // New State for Overrides
  const [customBg, setCustomBg] = useState('');
  const [customText, setCustomText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize SDK on mount
    setStatus('initializing');
    initFacebookSdk()
      .then(() => {
        setStatus('idle');
        addLog("Meta SDK Initialized. Ready for handshake.");
      })
      .catch((e) => {
        setError("Failed to load Meta SDK. Check network blockers.");
        addLog("ERROR: SDK Load Failure");
      });
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleLogin = async () => {
    // Trigger external webhook
    try {
      fetch('https://prerak37.app.n8n.cloud/webhook-test/google-ai-studio-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: 'login_initiated',
          timestamp: new Date().toISOString(),
          source: 'prethink_ai_frontend'
        })
      }).catch(err => console.warn("Webhook trigger failed silently:", err));
    } catch (e) {
      // Non-blocking
    }

    setStatus('authenticating');
    setError(null);
    addLog("Initiating OAuth 2.0 handshake with Meta Business Suite...");
    
    try {
      const token = await loginToFacebook();
      setAccessToken(token);
      setIsSandbox(false);
      addLog("Secure Token Acquired.");
      
      addLog("Fetching accessible Ad Accounts...");
      const accounts = await getAdAccounts(token);
      setAdAccounts(accounts);
      setStatus('selecting_account');
      addLog(`Found ${accounts.length} Ad Accounts.`);
    } catch (err: any) {
      if (err === "HTTPS_REQUIRED" || (typeof err === 'string' && err.includes('http pages'))) {
        addLog("WARNING: Insecure Connection Detected (HTTP). Switching to Sandbox Mode.");
        runSandboxMode();
      } else {
        addLog(`AUTH ERROR: ${JSON.stringify(err)}. Fallback to Sandbox.`);
        runSandboxMode();
      }
    }
  };

  const runSandboxMode = async () => {
    setIsSandbox(true);
    try {
      addLog("Initializing PreThink Sandbox Environment...");
      const token = await mockLogin();
      setAccessToken(token);
      addLog("Sandbox Identity Verified.");
      
      const accounts = await mockGetAdAccounts();
      setAdAccounts(accounts);
      setStatus('selecting_account');
      addLog(`Loaded ${accounts.length} Mock Accounts.`);
    } catch (e) {
      setError("Sandbox Initialization Failed.");
      setStatus('idle');
    }
  };

  const handleAccountSelect = async (accountId: string) => {
    if (!accessToken) return;
    
    setStatus('fetching');
    addLog(`Targeting Account ID: ${accountId}...`);
    addLog("Streaming live campaign insights (Creative + Performance)...");

    try {
      let packet: AdDataPacket;
      
      if (isSandbox) {
        addLog("Generating Synthetic High-Fidelity Data Stream...");
        packet = await mockGetInsights();
      } else {
        addLog("Fetching Graph API Data...");
        packet = await getAccountInsights(accountId, accessToken);
      }
      
      addLog(`Stream received. Parsing ${packet.csv.split('\n').length - 1} data points...`);
      
      // 2. Analyze with Gemini
      setStatus('analyzing');
      addLog("Transmitting to PreThink AI Optimization Engine...");
      const result = await analyzeAdsData(packet.csv);
      
      // 3. Merge Images back into the result
      const mapImages = (ads: AdMetric[]) => {
        return ads.map(ad => ({
          ...ad,
          thumbnail: packet.images[ad.name] || packet.images[Object.keys(packet.images).find(k => ad.name.includes(k)) || '']
        }));
      };

      const enhancedResult: AnalysisResult = {
        ...result,
        top_ads: mapImages(result.top_ads),
        low_ads: mapImages(result.low_ads)
      };

      setData(enhancedResult);
      setStatus('complete');
      addLog("Optimization Complete.");
    } catch (err: any) {
      setError(err.message || "Analysis Failed");
      setStatus('idle'); 
      addLog(`ERROR: ${err.message}`);
    }
  };

  // --- AD GENERATOR HANDLERS ---

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
        setGenStep('uploading');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAd = async () => {
    if (!productImage || !data) return;
    
    setGenStep('generating');
    try {
      // Extract base64 clean string
      const cleanBase64 = productImage.split(',')[1];
      const result = await generateAdCreative(cleanBase64, data.top_ads, customBg, customText);
      setGeneratedAd(result);
      setGenStep('done');
    } catch (e) {
      console.error(e);
      setGenStep('uploading');
      addLog("Generative Model Failed.");
    }
  };

  // --- RENDER COMPLETE DASHBOARD (SPLIT VIEW) ---

  if (status === 'complete' && data) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-100px)] flex flex-col">
        
        {/* Top Status Bar */}
        <div className={`flex items-center justify-between mb-4 ${isSandbox ? 'bg-amber-950/20 border-amber-900/50' : 'bg-emerald-950/20 border-emerald-900/50'} border p-2 rounded-sm shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSandbox ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSandbox ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className={`text-[10px] font-mono ${isSandbox ? 'text-amber-400' : 'text-emerald-400'} uppercase tracking-widest`}>
              {isSandbox ? 'SANDBOX // SYNTHETIC DATA' : 'LIVE STREAM ACTIVE // META GRAPH API'}
            </span>
          </div>
          <button 
            onClick={() => { setStatus('selecting_account'); setData(null); }}
            className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase"
          >
            Switch Account
          </button>
        </div>

        {/* MAIN SPLIT VIEW */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT: DATA LEDGER (60%) */}
          <div className="col-span-7 flex flex-col min-h-0 bg-zinc-950/30 border border-zinc-800 rounded-sm p-4 relative">
             <div className="flex items-center justify-between mb-4 shrink-0">
               <div className="flex items-center gap-2">
                 <Layers className="w-4 h-4 text-blue-500" />
                 <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Creative Automation & Budget Allocator</h3>
               </div>
               
               {/* AIRTABLE BUTTON */}
               <a 
                 href="https://airtable.com" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-500/30 hover:bg-yellow-400/20 text-yellow-500 text-[10px] font-mono uppercase rounded transition-colors"
               >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Airtable_Logo.svg" className="w-3 h-3 invert grayscale contrast-200" alt="" />
                  Open in Airtable
               </a>
             </div>
             <Dashboard data={data} onReset={() => setStatus('selecting_account')} />
          </div>

          {/* RIGHT: AI AD STUDIO (40%) */}
          <div className="col-span-5 flex flex-col min-h-0 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-sm p-0 overflow-hidden relative group">
             
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

             {/* Header */}
             <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md z-10">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-indigo-400" />
                 <h3 className="text-xs font-mono font-bold text-indigo-100 uppercase tracking-widest">GenAI Ad Studio (UGC 3D)</h3>
               </div>
               <div className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[9px] font-mono text-indigo-300">
                 Gemini 2.5 Vision
               </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center relative z-10 custom-scrollbar">
                
                {genStep === 'idle' || genStep === 'uploading' ? (
                  <div className="w-full space-y-6">
                     {/* Upload Area */}
                     <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-lg p-6 transition-colors cursor-pointer bg-zinc-900/50 text-center"
                          onClick={() => fileInputRef.current?.click()}
                     >
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductUpload} />
                        
                        {productImage ? (
                          <div className="relative">
                            <img src={productImage} alt="Preview" className="h-32 w-full object-contain mx-auto rounded shadow-lg" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
                               <p className="text-xs font-mono text-white">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                             <ImagePlus className="w-8 h-8 text-zinc-600" />
                             <p className="text-xs font-mono text-zinc-400">Upload Product Shot</p>
                          </div>
                        )}
                     </div>

                     {/* Controls for Generation */}
                     {productImage && (
                       <div className="space-y-4 bg-zinc-900/50 p-4 rounded border border-zinc-800">
                          <h4 className="text-[10px] font-mono text-zinc-500 uppercase">Creative Controls</h4>
                          
                          {/* Background Input */}
                          <div className="space-y-1">
                             <label className="flex items-center gap-2 text-[10px] text-zinc-400">
                               <Wallpaper className="w-3 h-3" /> Target Background
                             </label>
                             <input 
                               type="text" 
                               value={customBg}
                               onChange={(e) => setCustomBg(e.target.value)}
                               placeholder="e.g. Modern penthouse, Neon city..."
                               className="w-full bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 py-2 rounded focus:border-indigo-500 outline-none"
                             />
                          </div>

                          {/* Text Input */}
                          <div className="space-y-1">
                             <label className="flex items-center gap-2 text-[10px] text-zinc-400">
                               <Type className="w-3 h-3" /> Ad Headline
                             </label>
                             <input 
                               type="text" 
                               value={customText}
                               onChange={(e) => setCustomText(e.target.value)}
                               placeholder="e.g. The Future of Comfort"
                               className="w-full bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 py-2 rounded focus:border-indigo-500 outline-none"
                             />
                          </div>
                       </div>
                     )}

                     {productImage && (
                       <div className="space-y-2 w-full">
                         <button 
                           onClick={handleGenerateAd}
                           className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-widest rounded shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                         >
                           <Wand2 className="w-4 h-4" />
                           Generate 3D Creative
                         </button>
                         <p className="text-[9px] text-zinc-600 text-center font-mono">
                            Powered by Portfolio Data: Analyzed {data.top_ads.length} winning concepts.
                         </p>
                       </div>
                     )}
                  </div>
                ) : genStep === 'generating' ? (
                   <div className="text-center space-y-4 my-auto">
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin reverse"></div>
                      </div>
                      <p className="text-xs font-mono text-indigo-300 animate-pulse">Rendering 3D Environment...</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Applying Winning Campaign Patterns...</p>
                   </div>
                ) : (
                  <div className="w-full space-y-4 animate-in fade-in zoom-in-95">
                     <div className="relative group rounded-lg overflow-hidden border border-zinc-700 shadow-2xl">
                        <img src={generatedAd?.imageUrl} alt="AI Generated" className="w-full h-auto object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                           <p className="text-xs font-bold text-white font-mono">{generatedAd?.headline}</p>
                        </div>
                     </div>

                     <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800">
                        <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Winning Hook Theory</h4>
                        <p className="text-xs text-zinc-300 leading-snug">{generatedAd?.hook}</p>
                     </div>
                     
                     <div className="flex gap-2">
                        <button onClick={() => setGenStep('idle')} className="flex-1 py-2 border border-zinc-700 text-zinc-400 hover:text-white text-[10px] font-mono uppercase rounded hover:bg-zinc-800 transition-colors">
                           Reset
                        </button>
                        <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono uppercase rounded shadow-lg flex items-center justify-center gap-2">
                           <Upload className="w-3 h-3" /> Push to Meta
                        </button>
                     </div>
                  </div>
                )}
             </div>
          </div>

        </div>

      </div>
    );
  }

  // --- ACCOUNT SELECTION VIEW (UNCHANGED LOGIC, JUST STYLING) ---
  if (status === 'selecting_account') {
    return (
       <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2">
         <h2 className="text-xl font-mono text-white mb-6 flex items-center gap-2">
           <Server className="w-5 h-5 text-blue-500" /> Select Ad Account
         </h2>
         {isSandbox && (
           <div className="mb-4 p-3 bg-amber-950/20 border border-amber-900/50 text-amber-400 text-[10px] font-mono flex items-center gap-2">
             <ShieldAlert className="w-3 h-3" />
             SANDBOX MODE ACTIVE: These are simulated accounts for testing.
           </div>
         )}
         <div className="grid gap-3">
           {adAccounts.length === 0 && <div className="text-zinc-500 font-mono text-sm">No ad accounts found attached to this user.</div>}
           {adAccounts.map(account => (
             <button
               key={account.id}
               onClick={() => handleAccountSelect(account.id)}
               className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 hover:border-blue-500 hover:bg-zinc-800/80 transition-all text-left group"
             >
               <div>
                 <div className="font-bold text-zinc-200 font-mono group-hover:text-blue-400">{account.name}</div>
                 <div className="text-[10px] text-zinc-500 font-mono mt-1">ID: {account.account_id} • {account.currency}</div>
               </div>
               <div className="text-zinc-600 group-hover:text-blue-400">→</div>
             </button>
           ))}
         </div>
       </div>
    );
  }

  // --- LOGIN VIEW (UNCHANGED) ---
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-2xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-zinc-900 rounded-full border border-zinc-800 mb-4">
          <Globe className={`w-8 h-8 ${status === 'idle' ? 'text-zinc-500' : 'text-blue-500 animate-pulse'}`} />
        </div>
        <h2 className="text-2xl font-mono text-white tracking-tight">Personal Dashboard</h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
          Connect directly to Meta Business Suite for live portfolio optimization.
        </p>
      </div>

      {/* CONNECT CARD */}
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm overflow-hidden backdrop-blur-sm">
        
        {/* Connection Status Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Server className="w-4 h-4" />
            <span>META_GRAPH_API_V18.0</span>
          </div>
          <div className="flex items-center gap-2">
            {['idle', 'selecting_account'].includes(status) ? (
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-600 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                DISCONNECTED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-950/30 px-2 py-1 rounded-sm border border-blue-900/30">
                <Loader2 className="w-3 h-3 animate-spin" />
                {status.toUpperCase().replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="p-8 flex flex-col items-center">
          
          {error && (
            <div className="w-full mb-6 p-3 bg-rose-950/20 border border-rose-900/50 text-rose-400 text-xs font-mono rounded-sm flex items-center gap-3">
               <AlertTriangle className="w-4 h-4" />
               {error}
            </div>
          )}

          {status === 'idle' || status === 'initializing' ? (
            <div className="space-y-6 w-full max-w-sm text-center">
              <div className="space-y-2">
                 <div className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-950 rounded text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-zinc-600" /> Read_Insights</span>
                    <Lock className="w-3 h-3 text-zinc-600" />
                 </div>
                 <div className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-950 rounded text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-zinc-600" /> Ads_Management</span>
                    <Lock className="w-3 h-3 text-zinc-600" />
                 </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={status === 'initializing'}
                className="w-full py-4 bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold tracking-wider uppercase text-xs rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Facebook className="w-4 h-4 fill-current" />
                {status === 'initializing' ? 'Loading SDK...' : 'Log in with Facebook'}
              </button>
              
              <p className="text-[10px] text-zinc-600 font-mono">
                Requires a Meta Business Account. Data is processed locally by PreThink AI.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-6">
               <div className="flex justify-center">
                 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
               </div>
               
              {/* Logs Console */}
              <div className="font-mono text-[10px] bg-black p-4 rounded border border-zinc-800 h-48 overflow-y-auto flex flex-col-reverse shadow-inner">
                {logs.length === 0 && <span className="text-zinc-700">Waiting for stream...</span>}
                {logs.map((log, i) => (
                  <div key={i} className={`border-l-2 pl-2 mb-1 ${log.includes('WARNING') ? 'border-amber-500/50 text-amber-400/80' : 'border-blue-900/50 text-blue-400/80'}`}>
                    <span className="text-zinc-600 mr-2">{'>'}</span>{log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button onClick={onBack} className="mt-8 text-xs font-mono text-zinc-600 hover:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        ← Return to Main Terminal
      </button>

    </div>
  );
};

export default RealTimeAllocator;