import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

interface UploaderProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export function Uploader({ onImageSelected, selectedImage, onClear }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  if (selectedImage) {
    return (
      <div className="relative aspect-[3/4] w-full rounded overflow-hidden border border-white/10 bg-[#111] flex items-center justify-center group">
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 border border-red-500/50 transition-colors shadow-lg"
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`aspect-[3/4] w-full border-2 border-dashed flex flex-col items-center justify-center p-6 cursor-pointer transition-colors rounded relative group ${
        isDragging
          ? "border-blue-500 bg-blue-500/5"
          : "border-white/10 bg-[#111] hover:border-white/20"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
        <UploadCloud className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
      </div>
      <h3 className="text-[11px] text-white/60 uppercase tracking-widest text-center">
        Upload Source Photo
      </h3>
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}
