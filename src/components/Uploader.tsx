import React, { useState, useRef, useEffect, useCallback } from "react";
import { UploadCloud, Camera, SwitchCamera, X, RotateCcw, AlertCircle, Check } from "lucide-react";

interface UploaderProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export function Uploader({ onImageSelected, selectedImage, onClear }: UploaderProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [isDragging, setIsDragging] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Kamera bu tarayıcıda desteklenmiyor.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      let msg = "Kameraya erişilemedi. Lütfen kamera izni verin.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Kamera izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "Bağlı bir kamera bulunamadı.";
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [stopCamera]);

  // Handle switching tabs or unmounting
  useEffect(() => {
    if (activeTab === "camera" && !selectedImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode, selectedImage, startCamera, stopCamera]);

  const toggleCameraFacing = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
  };

  const capturePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If using front camera, mirror image naturally
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    stopCamera();
    onImageSelected(dataUrl);
  };

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
      alert("Lütfen geçerli bir görsel dosyası seçin.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      stopCamera();
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  // If image is already captured/uploaded
  if (selectedImage) {
    return (
      <div className="relative aspect-[3/4] w-full rounded overflow-hidden border border-white/10 bg-[#111] flex items-center justify-center group">
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              if (activeTab === "camera") {
                startCamera(facingMode);
              }
            }}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 border border-red-500/50 transition-colors shadow-lg flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"
            title="Yeniden Çek / Kaldır"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeniden Çek</span>
          </button>
        </div>
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] text-green-400 font-mono flex items-center gap-1 border border-white/10">
          <Check className="w-3 h-3" />
          <span>KAYNAK HAZIR</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Tab Selectors */}
      <div className="grid grid-cols-2 p-1 bg-white/5 rounded border border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-medium transition-all ${
            activeTab === "camera"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Kamera</span>
        </button>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab("upload");
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-medium transition-all ${
            activeTab === "upload"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Dosya Yükle</span>
        </button>
      </div>

      {/* Camera Mode */}
      {activeTab === "camera" && (
        <div className="relative aspect-[3/4] w-full rounded overflow-hidden border border-white/10 bg-[#0c0c0c] flex flex-col items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-white/70 max-w-xs">{cameraError}</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] rounded border border-white/10 transition-colors"
                >
                  Tekrar Dene
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[11px] rounded transition-colors"
                >
                  Dosya Yükle
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Live Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Headshot Portrait Framing Oval Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[62%] h-[68%] border-2 border-dashed border-white/30 rounded-[50%] flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
                  <div className="w-2 h-2 rounded-full bg-blue-400/40 animate-pulse"></div>
                </div>
                <div className="absolute top-3 text-[9px] font-mono uppercase tracking-widest text-white/60 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                  Yüzünüzü çemberin içine hizalayın
                </div>
              </div>

              {/* Camera Controls Bar */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                {/* Front / Back Switch Camera Toggle */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all shadow-lg active:scale-95"
                  title={facingMode === "user" ? "Arka Kameraya Geç" : "Ön Kameraya Geç"}
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>

                {/* Shutter Capture Button */}
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="relative p-1 rounded-full border-2 border-white/80 hover:border-white transition-all group active:scale-95 shadow-xl"
                  title="Fotoğraf Çek"
                >
                  <div className="w-11 h-11 rounded-full bg-white group-hover:bg-blue-400 transition-colors flex items-center justify-center">
                    <Camera className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
                  </div>
                </button>

                {/* Facing Mode Badge */}
                <span className="text-[9px] font-mono text-white/50 bg-black/60 border border-white/10 px-2 py-1 rounded backdrop-blur-md uppercase">
                  {facingMode === "user" ? "Ön Kamera" : "Arka Kamera"}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* File Upload Mode */}
      {activeTab === "upload" && (
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
            Fotoğraf Seç veya Sürükle
          </h3>
          <p className="text-[9px] text-white/30 text-center mt-1">
            JPG, PNG veya WEBP formatı
          </p>
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      )}
    </div>
  );
}

