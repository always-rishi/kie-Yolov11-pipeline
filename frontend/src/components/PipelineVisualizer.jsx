import React from 'react';
import { Image, Scan, FileText, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Image,
    label: 'Input Image',
    desc: 'Food package photo',
    accent: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  },
  {
    icon: Scan,
    label: 'YOLO Detection',
    desc: 'Locate ingredient region',
    accent: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400',
  },
  {
    icon: FileText,
    label: 'Text Extraction',
    desc: 'PaddleOCR reads the crop',
    accent: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  },
  {
    icon: Sparkles,
    label: 'LLM → JSON',
    desc: 'Groq parses ingredients',
    accent: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  },
];

const PipelineVisualizer = () => (
  <div className="glass-card p-5">
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isLast = idx === steps.length - 1;
        return (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-gradient-to-br flex-shrink-0 ${step.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-xs font-semibold leading-tight ${step.accent.split(' ').pop()}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-white/30 mt-0.5 truncate">{step.desc}</span>
              </div>
            </div>
            {!isLast && (
              <ArrowRight className="w-3.5 h-3.5 text-white/15 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

export default PipelineVisualizer;
