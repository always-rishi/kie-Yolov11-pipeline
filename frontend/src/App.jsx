import React, { useState } from 'react';
import './App.css';


import ControlPanel from './components/ControlPanel';
import VisualPanel from './components/VisualPanel';
import LLMProcessorPanel from './components/LLMProcessorPanel';

import { runOneClickExtraction } from './services/api';

function App() {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleImageSelected = (imageDataUrl) => {
    setImage(imageDataUrl);
    setResults(null);
  };

  const handleExtract = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const data = await runOneClickExtraction(image, 0.45);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResults(null);
  };

  const handleDownloadImage = () => {
    if (!results?.annotated_image_base64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${results.annotated_image_base64}`;
    link.download = 'annotated_ingredient_region.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] font-sans text-white">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[800px] mx-auto px-6 py-5 text-center">
          <h1 className="gradient-title text-3xl font-bold tracking-tight leading-tight">
            Ingredient Detection and Text Extraction
          </h1>
          <p className="text-white/40 text-sm mt-1.5 font-light">
            Upload a food label · YOLO detects the region · LLM parses the list
          </p>
        </div>
      </header>

      {/* ── Main stack ─────────────────────────────────────────── */}
      <main className="max-w-[800px] mx-auto px-6 py-8 space-y-5">


        {/* Upload + Extract */}
        <ControlPanel
          image={image}
          onImageSelected={handleImageSelected}
          handleExtract={handleExtract}
          isLoading={isLoading}
        />

        {/* Annotated image */}
        <VisualPanel
          results={results}
          isLoading={isLoading}
          handleDownloadImage={handleDownloadImage}
        />

        {/* Extracted text + JSON toggle */}
        <LLMProcessorPanel
          results={results}
          isLoading={isLoading}
          handleReset={handleReset}
        />

      </main>
    </div>
  );
}

export default App;
