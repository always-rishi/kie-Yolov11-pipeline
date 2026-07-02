import React from 'react';
import UploadCard from './UploadCard';

const ControlPanel = ({ image, onImageSelected, handleExtract, isLoading }) => (
  <div className="glass-card p-6 space-y-4">
    <UploadCard onImageSelected={onImageSelected} selectedImage={image} />

    <button
      onClick={handleExtract}
      disabled={!image || isLoading}
      className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl text-sm transition-all duration-200 ${
        image && !isLoading
          ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white cursor-pointer active:scale-[0.98] shadow-lg shadow-blue-900/30'
          : 'bg-white/5 text-white/25 cursor-not-allowed border border-white/8'
      }`}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing…</span>
        </>
      ) : (
        <span>Extract Ingredients</span>
      )}
    </button>
  </div>
);

export default ControlPanel;
