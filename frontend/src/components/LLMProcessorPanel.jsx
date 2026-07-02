import React, { useState } from 'react';
import { Sparkles, ChevronDown, ClipboardCopy, Download, Check, Trash2 } from 'lucide-react';

const LLMProcessorPanel = ({ results, isLoading, handleReset }) => {
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const extractedText = results?.extracted_text || '';
  const ingredientsJson = results?.ingredients_json || [];

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleDownloadJson = () => {
    if (!ingredientsJson.length) return;
    const blob = new Blob(
      [JSON.stringify({ ingredients: ingredientsJson }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ingredients.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-white/90">Extracted ingredients text</h2>
        <p className="text-[11px] text-white/35 mt-0.5">
          OCR text cleaned and corrected by Llama 3.3 · 70B
        </p>
      </div>

      {!results ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-xl text-center">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4 text-white/25" />
          </div>
          <p className="text-xs text-white/30">
            The extracted ingredients text will appear here after processing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Corrected text block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Corrected text
              </span>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 text-[10px] font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {copied
                  ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                  : <><ClipboardCopy className="w-3 h-3" /><span>Copy</span></>
                }
              </button>
            </div>
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 max-h-[180px] overflow-auto">
              <p className="font-mono text-xs text-white/70 leading-relaxed whitespace-pre-wrap">
                {extractedText || <span className="text-white/20 italic">No text extracted.</span>}
              </p>
            </div>
          </div>

          {/* Collapsible JSON toggle */}
          <div className="border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => setJsonExpanded(!jsonExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer text-xs font-semibold text-white/60 hover:text-white/90"
            >
              <span>View as JSON &nbsp;
                <span className="text-white/30 font-normal">({ingredientsJson.length} ingredients)</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${jsonExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {jsonExpanded && (
              <div className="p-4 space-y-3 border-t border-white/8 animate-fade-in">
                <div className="bg-black/40 text-emerald-400 p-3 rounded-lg font-mono text-[10px] max-h-[200px] overflow-auto whitespace-pre leading-relaxed border border-white/5">
                  {JSON.stringify({ ingredients: ingredientsJson }, null, 2)}
                </div>
                <button
                  onClick={handleDownloadJson}
                  disabled={!ingredientsJson.length}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JSON
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset */}
      {results && (
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/8 border border-red-500/15 py-2 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      )}
    </div>
  );
};

export default LLMProcessorPanel;
