import React, { useState, useRef } from 'react';
import { UploadCloud, Trash2, FileImage } from 'lucide-react';

const UploadCard = ({ onImageSelected, selectedImage }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => onImageSelected(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Source Image</h3>
          <p className="text-[11px] text-white/30 mt-0.5">Upload a product or ingredient label</p>
        </div>
        {selectedImage && (
          <button
            onClick={() => onImageSelected(null)}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-400/70 hover:text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/15 hover:bg-red-500/8 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {!selectedImage ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[200px] transition-all duration-200 cursor-pointer ${
            isDragActive
              ? 'border-blue-500/60 bg-blue-500/8'
              : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
        >
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleChange} />
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all ${isDragActive ? 'bg-blue-500/20' : 'bg-white/6'}`}>
            <UploadCloud className={`w-6 h-6 ${isDragActive ? 'text-blue-400' : 'text-white/30'}`} style={{ animationDuration: '3s' }} />
          </div>
          <p className="text-sm font-semibold text-white/60">
            Drag & drop, or <span className="text-blue-400 hover:text-blue-300">browse</span>
          </p>
          <p className="text-xs text-white/25 mt-1">PNG, JPG, JPEG supported</p>
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden bg-black/20 border border-white/8 flex items-center justify-center p-2 min-h-[200px]">
          <img
            src={selectedImage}
            alt="Source preview"
            className="max-h-[280px] w-auto object-contain rounded-lg animate-fade-in"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
            >
              <FileImage className="w-3.5 h-3.5 text-blue-400" />
              Replace Image
            </button>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

export default UploadCard;
