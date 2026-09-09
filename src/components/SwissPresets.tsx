import React from "react";
import { Check, Edit3 } from "lucide-react";

export interface PresetSelection {
  attire: string;
  isCustomAttire: boolean;
  hairStyle: string;
  isCustomHair: boolean;
  aspectRatio: string;
  customNotes: string;
}

interface SwissPresetsProps {
  selection: PresetSelection;
  onChange: (updated: Partial<PresetSelection>) => void;
}

export const ATTIRE_PRESETS = [
  {
    id: "navy",
    label: "Navy Suit",
    description: "Tailored navy blazer, white shirt and silk tie",
    fullPrompt: "Sharp Navy Blue Corporate Suit with White Shirt and Subtle Tie",
  },
  {
    id: "blazer_tee",
    label: "Charcoal Blazer",
    description: "Modern charcoal jacket over premium white crewneck",
    fullPrompt: "Modern Charcoal Blazer with Crisp White T-shirt (Business Casual)",
  },
  {
    id: "turtleneck",
    label: "Black Turtleneck",
    description: "Fine-knit matte black turtleneck, executive style",
    fullPrompt: "Elegant Professional Black Turtleneck",
  },
  {
    id: "dress_shirt",
    label: "Dress Shirt",
    description: "Immaculate crisp white French-cuff dress shirt",
    fullPrompt: "Classic Professional Dress Shirt (No Jacket)",
  },
  {
    id: "tweed",
    label: "Tweed Blazer",
    description: "Textured slate tweed with light blue oxford shirt",
    fullPrompt: "Tailored Textured Grey Tweed Blazer with Light Blue Oxford Shirt",
  },
];

export const HAIR_PRESETS = [
  {
    id: "preserve_original",
    value: "preserve_original",
    label: "Original Cut",
    description: "Keeps exact source length and style intact",
  },
  {
    id: "preserve_long",
    value: "preserve_long",
    label: "Preserve Long Hair",
    description: "Maintains natural length, curls, and volume",
  },
  {
    id: "natural_groomed",
    value: "natural_groomed",
    label: "Neatly Groomed",
    description: "Clean executive tidy without altering length",
  },
];

export const ASPECT_RATIOS = [
  { id: "3:4", label: "3:4", sub: "Portrait", value: "3:4", w: 3, h: 4 },
  { id: "1:1", label: "1:1", sub: "Square", value: "1:1", w: 1, h: 1 },
  { id: "4:3", label: "4:3", sub: "Landscape", value: "4:3", w: 4, h: 3 },
  { id: "9:16", label: "9:16", sub: "Story", value: "9:16", w: 9, h: 16 },
];

const ATTIRE_SUGGESTIONS = [
  "Navy wool blazer with pocket square",
  "Cashmere olive crewneck",
  "Tailored beige trench coat",
  "Silk blouse with mandarin collar",
  "Anthracite double-breasted suit",
];

const HAIR_SUGGESTIONS = [
  "Preserve shoulder-length natural waves",
  "Keep natural curls hydrated and defined",
  "Clean textured crop with tapered neckline",
  "Sleek low bun with professional side part",
];

export function SwissPresets({ selection, onChange }: SwissPresetsProps) {
  return (
    <div className="space-y-7">
      {/* 01: ATTIRE */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Attire
          </h3>

          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded">
            <button
              type="button"
              onClick={() => onChange({ isCustomAttire: false })}
              className={`px-2 py-0.5 text-[10px] uppercase font-medium rounded transition-colors ${
                !selection.isCustomAttire
                  ? "bg-white text-black font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Presets
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ isCustomAttire: true });
                if (!selection.attire) {
                  onChange({ attire: ATTIRE_SUGGESTIONS[0] });
                }
              }}
              className={`px-2 py-0.5 text-[10px] uppercase font-medium rounded flex items-center gap-1 transition-colors ${
                selection.isCustomAttire
                  ? "bg-white text-black font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Edit3 className="w-2.5 h-2.5" />
              Custom
            </button>
          </div>
        </div>

        {selection.isCustomAttire ? (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={selection.attire}
              onChange={(e) => onChange({ attire: e.target.value })}
              placeholder="Describe your outfit (e.g. Charcoal wool blazer with white spread collar shirt)..."
              className="w-full bg-[#111317] border border-white/15 text-white text-xs p-2.5 rounded outline-none focus:border-white/50 placeholder:text-white/25 transition-all resize-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {ATTIRE_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange({ attire: sug })}
                  className="text-[10px] px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ATTIRE_PRESETS.map((preset) => {
              const isSelected = selection.attire === preset.fullPrompt && !selection.isCustomAttire;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange({ attire: preset.fullPrompt, isCustomAttire: false })}
                  className={`text-left p-2.5 rounded border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-[#111317] text-white border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-tight">
                      {preset.label}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-black stroke-[2.5]" />}
                  </div>
                  <span
                    className={`text-[10px] leading-relaxed mt-1 line-clamp-2 ${
                      isSelected ? "text-black/70" : "text-white/45"
                    }`}
                  >
                    {preset.description}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                onChange({ isCustomAttire: true });
                if (!selection.attire) {
                  onChange({ attire: ATTIRE_SUGGESTIONS[0] });
                }
              }}
              className="p-2.5 rounded border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/40 text-left flex flex-col justify-center transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                <Edit3 className="w-3 h-3" />
                <span>Custom Attire</span>
              </div>
              <span className="text-[10px] text-white/40 mt-1">
                Type any custom clothing or fabric
              </span>
            </button>
          </div>
        )}
      </section>

      {/* 03: HAIR */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Hair Style
          </h3>

          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded">
            <button
              type="button"
              onClick={() => onChange({ isCustomHair: false, hairStyle: "preserve_original" })}
              className={`px-2 py-0.5 text-[10px] uppercase font-medium rounded transition-colors ${
                !selection.isCustomHair
                  ? "bg-white text-black font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Presets
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ isCustomHair: true });
                if (!selection.hairStyle || ["preserve_long", "preserve_original", "natural_groomed"].includes(selection.hairStyle)) {
                  onChange({ hairStyle: HAIR_SUGGESTIONS[0] });
                }
              }}
              className={`px-2 py-0.5 text-[10px] uppercase font-medium rounded flex items-center gap-1 transition-colors ${
                selection.isCustomHair
                  ? "bg-white text-black font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Edit3 className="w-2.5 h-2.5" />
              Custom
            </button>
          </div>
        </div>

        {selection.isCustomHair ? (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={selection.hairStyle}
              onChange={(e) => onChange({ hairStyle: e.target.value })}
              placeholder="Specify hair style instructions (e.g. Keep natural shoulder-length waves)..."
              className="w-full bg-[#111317] border border-white/15 text-white text-xs p-2.5 rounded outline-none focus:border-white/50 placeholder:text-white/25 transition-all resize-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {HAIR_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange({ hairStyle: sug })}
                  className="text-[10px] px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {HAIR_PRESETS.map((preset) => {
              const isSelected = selection.hairStyle === preset.value && !selection.isCustomHair;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange({ hairStyle: preset.value, isCustomHair: false })}
                  className={`text-left p-2.5 rounded border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-[#111317] text-white border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-tight">
                      {preset.label}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-black stroke-[2.5]" />}
                  </div>
                  <span
                    className={`text-[10px] leading-relaxed mt-1 ${
                      isSelected ? "text-black/70" : "text-white/45"
                    }`}
                  >
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 04: ASPECT RATIO */}
      <section className="space-y-2.5">
        <div className="pb-1 border-b border-white/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Aspect Ratio
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = selection.aspectRatio === ratio.value;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => onChange({ aspectRatio: ratio.value })}
                className={`p-3 rounded border text-center flex flex-col items-center justify-between transition-all ${
                  isSelected
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-[#111317] text-white border-white/10 hover:border-white/25"
                }`}
              >
                <div className="h-10 flex items-center justify-center my-1">
                  <div
                    className={`border transition-all ${
                      isSelected
                        ? "border-black bg-black/5"
                        : "border-white/30 bg-white/5"
                    }`}
                    style={{
                      width: `${(ratio.w / Math.max(ratio.w, ratio.h)) * 26 + 10}px`,
                      height: `${(ratio.h / Math.max(ratio.w, ratio.h)) * 26 + 10}px`,
                    }}
                  />
                </div>

                <div className="mt-1">
                  <div className="text-xs font-bold">{ratio.label}</div>
                  <div className={`text-[10px] ${isSelected ? "text-black/70" : "text-white/45"}`}>
                    {ratio.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 05: NOTES */}
      <section className="space-y-2">
        <div className="pb-1 border-b border-white/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Additional Requests
          </h3>
        </div>

        <input
          type="text"
          placeholder="e.g. Natural gentle smile, wear thin silver glasses, soft lighting"
          value={selection.customNotes}
          onChange={(e) => onChange({ customNotes: e.target.value })}
          className="w-full bg-[#111317] border border-white/15 text-white text-xs p-2.5 rounded outline-none focus:border-white/50 placeholder:text-white/25 transition-all"
        />
      </section>
    </div>
  );
}
