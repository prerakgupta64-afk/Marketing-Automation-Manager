import React, { useRef, useState } from 'react';
import { Upload, FileCode, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("INVALID FORMAT. CSV REQUIRED.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onFileUpload(e.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative group border border-dashed transition-all duration-300 ease-out
          ${isLoading ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/30'}
        `}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="absolute top-0 left-0 px-2 py-1 bg-zinc-900 border-r border-b border-zinc-700 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          Input_Module_V1
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv"
        />

        <div className="flex flex-col items-center justify-center text-center p-16 space-y-6">
          <div className="relative">
             {isLoading ? (
               <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20"></div>
             ) : null}
            <div className={`p-5 rounded-full border ${isLoading ? 'border-emerald-500/50 bg-emerald-900/20' : 'border-zinc-700 bg-zinc-900'} transition-all`}>
              {isLoading ? (
                <Database className="w-8 h-8 text-emerald-500 animate-pulse" />
              ) : (
                <FileCode className="w-8 h-8 text-zinc-400" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-mono tracking-tight text-zinc-200">
              {isLoading ? 'PROCESSING_DATA_STREAM...' : 'INITIATE_DATA_INGESTION'}
            </h3>
            <p className="text-xs font-mono text-zinc-500 max-w-sm uppercase">
              Securely upload portfolio CSV for algorithmic allocation.
            </p>
          </div>

          {!isLoading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group px-8 py-3 bg-zinc-100 hover:bg-white text-black text-xs font-bold tracking-widest uppercase transition-all"
            >
              Select Payload
            </button>
          )}
        </div>

        {error && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 text-rose-500 text-xs font-mono bg-rose-950/20 py-2 border border-rose-900/50">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between text-[10px] font-mono text-zinc-600 uppercase">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> End-to-End Encrypted</span>
        <span>Ready for Input</span>
      </div>
    </div>
  );
};

export default FileUpload;