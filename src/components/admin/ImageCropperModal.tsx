"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Upload,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Check,
  Crop,
  Move,
  Sparkles,
} from "lucide-react";
import Button3D from "@/components/ui/Button3D";
import { playButtonClick, playSuccessSound, playWarningTone } from "@/lib/audio";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedBlob: Blob, previewUrl: string) => void;
  initialImage?: string;
  title?: string;
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  onSave,
  initialImage,
  title = "Crop & Optimize Profile Photo",
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4">("1:1");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialImage) {
        setImageSrc(initialImage);
      }
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setErrorMessage(null);
    }
  }, [isOpen, initialImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file format. Please select PNG, JPG, JPEG, WEBP, or AVIF.");
      playWarningTone();
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image is too large. Maximum allowed size is 8 MB.");
      playWarningTone();
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImageSrc(event.target.result);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        playSuccessSound();
      }
    };
    reader.readAsDataURL(file);
  };

  // Mouse / Touch drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    playButtonClick();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    playButtonClick();
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const generateCroppedImage = useCallback(async () => {
    if (!imageSrc || !imageRef.current || !containerRef.current) return;
    setIsProcessing(true);
    playButtonClick();

    try {
      const img = imageRef.current;
      const targetWidth = 1200;
      const targetHeight = aspectRatio === "1:1" ? 1200 : 1600;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not initialize canvas context");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill dark background in case transparent
      ctx.fillStyle = "#05050c";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Translate to center of canvas
      ctx.save();
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Compute relative scaling
      const containerRect = containerRef.current.getBoundingClientRect();
      const scaleFactorX = targetWidth / containerRect.width;
      const scaleFactorY = targetHeight / containerRect.height;
      const avgScaleFactor = Math.max(scaleFactorX, scaleFactorY);

      const renderWidth = img.naturalWidth * (zoom / 1) * (targetWidth / Math.min(img.naturalWidth, img.naturalHeight));
      const renderHeight = img.naturalHeight * (zoom / 1) * (targetWidth / Math.min(img.naturalWidth, img.naturalHeight));

      const drawX = pan.x * avgScaleFactor - renderWidth / 2;
      const drawY = pan.y * avgScaleFactor - renderHeight / 2;

      ctx.drawImage(img, drawX, drawY, renderWidth, renderHeight);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            playSuccessSound();
            onSave(blob, previewUrl);
            onClose();
          }
          setIsProcessing(false);
        },
        "image/webp",
        0.88
      );
    } catch (err) {
      console.error("Cropping error:", err);
      setErrorMessage("Failed to process cropped image.");
      setIsProcessing(false);
    }
  }, [imageSrc, zoom, rotation, pan, aspectRatio, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none">
      <div className="red-glass rounded-3xl border border-red-500/40 w-full max-w-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(239,68,68,0.25)] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-950/80 flex items-center justify-between bg-[#070712]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/30">
              <Crop className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">{title}</h2>
              <p className="text-[10px] text-slate-400">Position, crop and export high-res WebP avatar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-red-950 text-slate-400 hover:text-white hover:border-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-grow">
          
          {/* File Picker trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/60 rounded-2xl border border-red-950">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-600 border border-red-500/40 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-red-400" />
              <span>CHOOSE FROM DEVICE</span>
            </button>
            <span className="text-[10px] text-slate-400">
              Supports PNG, JPG, JPEG, WEBP, AVIF (Max 8 MB)
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Interactive Cropper Canvas Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            
            {/* Cropper Viewport */}
            <div className="md:col-span-8 flex justify-center">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`relative w-full aspect-square max-w-[320px] rounded-2xl bg-black border-2 border-red-500/50 overflow-hidden cursor-move shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center ${
                  isDragging ? "ring-2 ring-red-500" : ""
                }`}
              >
                {imageSrc ? (
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop workspace"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                      transition: isDragging ? "none" : "transform 0.1s ease-out",
                    }}
                    className="max-w-none max-h-none pointer-events-none select-none object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="text-center p-6 space-y-2 text-slate-500">
                    <Crop className="w-8 h-8 mx-auto text-red-500/40 animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">No Image Selected</p>
                    <p className="text-[10px]">Click &ldquo;Choose from Device&rdquo; above to load photo.</p>
                  </div>
                )}

                {/* Framing Overlay Grid */}
                {imageSrc && (
                  <div className="absolute inset-0 pointer-events-none border border-red-500/20">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-red-500/15" />
                      <div className="border-r border-b border-red-500/15" />
                      <div className="border-b border-red-500/15" />
                      <div className="border-r border-b border-red-500/15" />
                      <div className="border-r border-b border-red-500/15" />
                      <div className="border-b border-red-500/15" />
                      <div className="border-r border-red-500/15" />
                      <div className="border-r border-red-500/15" />
                      <div />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Dual Preview (Circle + Rect) */}
            <div className="md:col-span-4 space-y-4 text-center">
              <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live Preview</div>
              
              <div className="flex flex-col items-center gap-3">
                {/* Circle Avatar Preview */}
                <div className="w-20 h-20 rounded-full border-2 border-red-500/60 overflow-hidden bg-black shadow-[0_0_15px_rgba(239,68,68,0.3)] relative">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Circle preview"
                      style={{
                        transform: `translate(${pan.x * 0.25}px, ${pan.y * 0.25}px) scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}
                </div>
                <span className="text-[9px] text-slate-500 uppercase">Navbar / Avatar</span>

                {/* Card Preview */}
                <div className="w-24 h-24 rounded-2xl border-2 border-red-500/40 overflow-hidden bg-black relative">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Card preview"
                      style={{
                        transform: `translate(${pan.x * 0.3}px, ${pan.y * 0.3}px) scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}
                </div>
                <span className="text-[9px] text-slate-500 uppercase">Leadership Card</span>
              </div>
            </div>

          </div>

          {/* Controls Bar */}
          {imageSrc && (
            <div className="space-y-4 p-4 rounded-2xl bg-black/60 border border-red-950">
              
              {/* Zoom Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-red-400">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom Level ({zoom.toFixed(2)}x)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">1.0x — 3.0x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-red-950/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="px-3 py-1.5 rounded-xl border border-red-950 hover:border-red-500/50 bg-black/40 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-red-400" />
                    <span>Rotate 90&deg;</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-xl border border-red-950 hover:border-red-500/50 bg-black/40 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("1:1")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      aspectRatio === "1:1"
                        ? "bg-red-950 border-red-500 text-red-300"
                        : "border-red-950 text-slate-500 hover:text-white"
                    }`}
                  >
                    1:1 Square
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("3:4")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      aspectRatio === "3:4"
                        ? "bg-red-950 border-red-500 text-red-300"
                        : "border-red-950 text-slate-500 hover:text-white"
                    }`}
                  >
                    3:4 Portrait
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-red-950/80 flex items-center justify-between bg-[#070712]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-red-950 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>

          <Button3D
            type="button"
            variant="primary"
            disabled={!imageSrc || isProcessing}
            onClick={generateCroppedImage}
            className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? "PROCESSING CROP..." : "APPLY & SAVE PHOTO"}</span>
          </Button3D>
        </div>

      </div>
    </div>
  );
}
