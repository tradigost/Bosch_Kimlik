/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Uploader } from "./components/Uploader";
import { Loader2, Camera, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ATTIRE_OPTIONS = [
  "Sharp Navy Blue Corporate Suit with White Shirt and Subtle Tie",
  "Modern Charcoal Blazer with Crisp White T-shirt (Business Casual)",
  "Elegant Professional Black Turtleneck",
  "Classic Professional Dress Shirt (No Jacket)",
];

const BACKGROUND_OPTIONS = [
  "Seamless Studio Gray (Corporate Standard)",
  "Warm Neutral Studio Canvas (Soft & Approachable)",
  "Modern Glass Office with Suble Bokeh (Depth & Premium)",
  "Pure White (ID/Passport Style)",
];

const ASPECT_RATIOS = [
  { label: "Company ID (3:4)", value: "3:4" },
  { label: "LinkedIn / Avatar (1:1)", value: "1:1" },
  { label: "Directory Card (4:3)", value: "4:3" },
];

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [attire, setAttire] = useState(ATTIRE_OPTIONS[0]);
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [hairStyle, setHairStyle] = useState("preserve_long");
  const [customNotes, setCustomNotes] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          attire,
          background,
          aspect_ratio: aspectRatio,
          hairStyle,
          customNotes
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

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = "corporate-headshot.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden selection:bg-blue-900/50 selection:text-blue-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-white/10 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-[10px] text-white">AI</div>
          <h1 className="text-sm font-semibold tracking-tight uppercase">CORP-ID // STUDIO GENERATOR</h1>
          <span className="text-[10px] text-white/30 border border-white/20 px-2 py-0.5 rounded hidden sm:inline-block">GEMINI-3.1-IMAGE</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4 text-[10px] text-white/50 uppercase tracking-widest">
            <span>Safety: Block_High</span>
            <span>Temp: 0.2</span>
            <span>Top_P: 0.85</span>
          </div>
          <div className="text-[10px] text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-1 rounded flex items-center gap-1 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Powered by Gemini</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Configuration Panel (Left Sidebar) */}
        <aside className="w-80 lg:w-96 border-r border-white/10 bg-[#080808] p-6 flex flex-col gap-8 overflow-y-auto shrink-0">
          <div>
            <h2 className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">Configuration</h2>
            <p className="text-xs text-white/40">Upload a casual photo and define your professional style.</p>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4">Source Authentication</h3>
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
            
            <section className="space-y-5">
              {/* Attire Selection */}
              <div>
                <label className="block text-[10px] text-white/60 uppercase tracking-widest mb-2">Attire Presets</label>
                <select 
                  value={attire}
                  onChange={(e) => setAttire(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white/80 text-xs rounded px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  {ATTIRE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#111] text-white">{opt}</option>
                  ))}
                </select>
              </div>

              {/* Background Selection */}
              <div>
                <label className="block text-[10px] text-white/60 uppercase tracking-widest mb-2">Environment</label>
                <select 
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white/80 text-xs rounded px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  {BACKGROUND_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#111] text-white">{opt}</option>
                  ))}
                </select>
              </div>

              {/* Hair Preservation Setting */}
              <div>
                <label className="block text-[10px] text-white/60 uppercase tracking-widest mb-2">Hair Treatment</label>
                <select 
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white/80 text-xs rounded px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="preserve_long" className="bg-[#111] text-white">Preserve Long Hair (Do not cut short)</option>
                  <option value="preserve_original" className="bg-[#111] text-white">Strict Original Length & Texture</option>
                  <option value="natural_groomed" className="bg-[#111] text-white">Natural Groomed & Balanced</option>
                </select>
              </div>

              {/* Custom Guidance / Notes */}
              <div>
                <label className="block text-[10px] text-white/60 uppercase tracking-widest mb-2">Refinement Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Keep my long hair over shoulders, natural beard"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white/80 text-xs rounded px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-white/20"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-[10px] text-white/60 uppercase tracking-widest mb-2">Export Options (Ratio)</label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`py-2 px-2 text-[10px] uppercase font-bold tracking-wider rounded border transition-all ${
                        aspectRatio === ratio.value 
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' 
                          : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {ratio.label.split(' ')[0]} {/* Shorter label */}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-red-500/10 text-red-400 px-3 py-2 rounded text-[11px] font-mono border border-red-500/20">
                ERR: {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedImage || isGenerating}
              className="w-full bg-white text-black font-bold text-xs py-3 rounded hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  Generate Preview
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Preview Panel (Main Content Area) */}
        <section className="flex-1 relative flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_70%)] overflow-y-auto">
          {/* Decorative Corner Borders */}
          <div className="absolute top-8 left-8 border-l border-t border-white/20 w-12 h-12 hidden md:block"></div>
          <div className="absolute top-8 right-8 border-r border-t border-white/20 w-12 h-12 hidden md:block"></div>
          <div className="absolute bottom-8 left-8 border-l border-b border-white/20 w-12 h-12 hidden md:block"></div>
          <div className="absolute bottom-8 right-8 border-r border-b border-white/20 w-12 h-12 hidden md:block"></div>

          <div className="w-full max-w-2xl px-6 py-12 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-48 h-64 border border-blue-500/30 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                    <div className="w-40 h-52 border border-blue-500/20 rounded-full flex items-center justify-center relative">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute"></div>
                      <Sparkles className="w-8 h-8 text-blue-400 absolute opacity-50" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-[10px] uppercase tracking-widest text-blue-400">Live Rendering</span>
                    </div>
                    <h3 className="text-xs font-mono text-white/70">EXECUTIVE_STYLING_IN_PROGRESS...</h3>
                    <p className="text-[10px] text-white/40 mt-2 max-w-xs mx-auto">
                      Analyzing facial structure, styling haircut & grooming, correcting posture, and applying luxury studio lighting.
                    </p>
                  </div>
                </motion.div>
              ) : generatedImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative group rounded shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-[#111] p-2 border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(255,255,255,0.08)_0%,_transparent_60%)] pointer-events-none"></div>
                    <img 
                      src={generatedImage} 
                      alt="Generated Headshot" 
                      className="w-full max-w-md object-contain rounded-sm relative z-10"
                    />
                    
                    {/* Immersive overlays */}
                    <div className="absolute bottom-6 left-6 text-[9px] text-white/30 font-mono z-20 pointer-events-none">REF_ID: 8829-XQ-2024</div>
                    <div className="absolute bottom-6 right-6 text-[9px] text-white/30 font-mono z-20 pointer-events-none">ISO: 100 / 50MM</div>

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 backdrop-blur-sm">
                      <button 
                        onClick={handleDownload}
                        className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] uppercase tracking-widest"
                      >
                        <Download className="w-4 h-4" />
                        Download High-Res
                      </button>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mb-1"></div>
                      <span className="text-[10px] uppercase tracking-tighter text-white/40 font-mono">SYS_READY</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-[300px] sm:w-[400px] aspect-[4/5] bg-[#111] rounded shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 border border-white/5"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(255,255,255,0.03)_0%,_transparent_60%)]"></div>
                  <div className="w-full h-full border border-white/5 flex flex-col items-center justify-center relative">
                    <div className="w-48 h-64 border border-white/10 rounded-full flex items-center justify-center mb-12">
                      <div className="w-40 h-52 border border-white/5 rounded-full flex items-center justify-center">
                        <div className="text-white/10 text-[60px] font-thin"><Camera className="w-12 h-12" /></div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-[9px] text-white/20 font-mono">AWAITING_INPUT</div>
                    <div className="absolute bottom-4 right-4 text-[9px] text-white/20 font-mono">ID: --</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="h-8 bg-[#0a0a0a] border-t border-white/10 px-6 flex items-center justify-between text-[9px] text-white/30 font-mono shrink-0">
        <div className="flex gap-4">
          <span>SYS_READY</span>
          <span className="hidden sm:inline">STABLE_ID_RECOGNITION: ENABLED</span>
          <span className="hidden md:inline">STUDIO_LIGHTING: LAYER_3</span>
        </div>
        <div>GOOGLE AI STUDIO PROTOTYPE — 2024</div>
      </footer>
    </div>
  );
}
