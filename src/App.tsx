/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Uploader } from "./components/Uploader";
import { SwissPresets, PresetSelection, ATTIRE_PRESETS } from "./components/SwissPresets";
import { Loader2, Camera, Download, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [presetSelection, setPresetSelection] = useState<PresetSelection>({
    attire: ATTIRE_PRESETS[0].fullPrompt,
    isCustomAttire: false,
    hairStyle: "preserve_original",
    isCustomHair: false,
    aspectRatio: "3:4",
    customNotes: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePresetChange = (updated: Partial<PresetSelection>) => {
    setPresetSelection((prev) => ({ ...prev, ...updated }));
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-headshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          attire: presetSelection.attire,
          aspect_ratio: presetSelection.aspectRatio,
          hairStyle: presetSelection.hairStyle,
          customNotes: presetSelection.customNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setGeneratedImage(data.generatedImage);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `headshot-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    } catch (err) {
      console.error("Blob download failed, using direct data link fallback:", err);
      const a = document.createElement("a");
      a.href = generatedImage;
      a.download = `headshot-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0A0B0E] text-[#EDEDED] font-sans selection:bg-red-600 selection:text-white">
      {/* Clean Minimal Header */}
      <header className="border-b border-white/10 bg-[#0E1014] shrink-0 sticky top-0 z-30 px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-600 flex items-center justify-center font-bold text-xs text-white tracking-wider rounded-sm">
              H
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-white">
                Headshot Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Column: Settings */}
        <aside className="w-full lg:w-[460px] xl:w-[500px] border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0C0D11] p-5 sm:p-6 flex flex-col gap-6 shrink-0 lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          {/* Source Photo Section */}
          <section className="space-y-2.5">
            <div className="pb-1 border-b border-white/10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                Source Photo
              </h2>
            </div>

            <Uploader
              onImageSelected={setSelectedImage}
              selectedImage={selectedImage}
              onClear={() => {
                setSelectedImage(null);
                setGeneratedImage(null);
                setError(null);
              }}
            />
          </section>

          {/* Presets & Customizations */}
          <SwissPresets selection={presetSelection} onChange={handlePresetChange} />

          {/* Error Feed */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/40 p-3 rounded text-red-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-2 sticky bottom-0 bg-[#0C0D11]/95 backdrop-blur py-3 border-t border-white/10 z-20">
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || isGenerating}
              className="w-full bg-white text-black font-bold text-xs sm:text-sm py-3.5 px-5 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black disabled:cursor-not-allowed transition-all rounded flex items-center justify-between uppercase tracking-wider group shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-600 group-hover:text-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-red-600 group-hover:bg-white transition-colors"></div>
                )}
                <span>{isGenerating ? "Generating Headshot..." : "Generate Headshot"}</span>
              </div>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </aside>

        {/* Right Column: Output Canvas */}
        <section className="flex-1 relative flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#08090C] min-h-[500px] lg:min-h-0 overflow-y-auto">
          <div className="w-full max-w-lg flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full max-w-md border border-white/10 bg-[#0E1015] rounded-lg p-8 text-center space-y-5 shadow-2xl"
                >
                  <div className="w-12 h-12 mx-auto rounded-full border-2 border-white/20 border-t-red-500 animate-spin"></div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-white">
                      Generating Your Headshot
                    </h3>
                    <p className="text-xs text-white/50 max-w-xs mx-auto">
                      Applying studio lighting, attire, and professional background.
                    </p>
                  </div>
                </motion.div>
              ) : generatedImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-full max-w-md bg-[#0E1015] border border-white/10 rounded-lg shadow-2xl p-4 sm:p-5 space-y-4">
                    {/* The Output Image */}
                    <div className="overflow-hidden rounded bg-black border border-white/10">
                      <img
                        src={generatedImage}
                        alt="Generated Headshot"
                        className="w-full h-auto object-contain block"
                      />
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-wider shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Image</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-md border border-white/10 bg-[#0D0E12] rounded-lg p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <Camera className="w-7 h-7 stroke-[1.5]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white/90">
                      Preview Standby
                    </h3>
                    <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
                      Upload your photo and select your style on the left to generate your headshot.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
