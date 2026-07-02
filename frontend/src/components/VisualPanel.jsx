import React from 'react';
import { Eye, Download, Cpu } from 'lucide-react';

const VisualPanel = ({ results, isLoading, handleDownloadImage }) => {
  const annotatedSrc = results?.annotated_image_base64
    ? `data:image/png;base64,${results.annotated_image_base64}`
    : null;

  return (
    <div className="glass-card p-6 space-y-4 relative overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0f1117]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-fade-in rounded-2xl">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-blue-500 animate-spin" />
            <Cpu className="w-4 h-4 text-blue-400 absolute animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-white/80">Running pipeline…</p>
          <p className="text-xs text-white/30 mt-1">YOLO · PaddleOCR · Groq LLM</p>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white/90">Detected ingredient region</h2>
          <p className="text-[11px] text-white/35 mt-0.5">Single bounding box drawn server-side</p>
        </div>
        {annotatedSrc && (
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        )}
      </div>

      {!annotatedSrc ? (
        <div className="flex flex-col items-center justify-center py-14 border border-dashed border-white/10 rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <Eye className="w-5 h-5 text-white/25" />
          </div>
          <p className="text-sm font-medium text-white/40">Ingredient region</p>
          <p className="text-xs text-white/20 mt-1 max-w-[200px]">
            Upload a food package photo to extract the ingredients list.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center bg-black/20 rounded-xl overflow-hidden border border-white/6 p-2">
          <img
            src={annotatedSrc}
            alt="Annotated ingredient region"
            className="max-h-[440px] max-w-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default VisualPanel;
