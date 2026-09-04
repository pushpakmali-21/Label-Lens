import React, { useState, useRef } from "react";
import { X, Camera, Upload, Flashlight, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Scan, Sparkles } from "lucide-react";
import { SCENARIOS, MODE_ORDER } from "../data/scenarios";

export default function MobileScannerModal({ isOpen, onClose, onSelectScenarioAndScan }) {
  const [activeMode, setActiveMode] = useState("qr");
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentScenario = SCENARIOS[activeMode];

  const handleTriggerCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      onSelectScenarioAndScan(activeMode);
      onClose();
    }, 1200);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleTriggerCapture();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between animate-fadeIn">
      {/* Top Controls Bar */}
      <div className="p-4 flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all"
          aria-label="Close Scanner"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#A855F7]">
            LMPC Optical Scanner
          </div>
          <div className="text-[11px] text-[#94A3B8] font-mono">
            {currentScenario.tabTitle}
          </div>
        </div>

        <button
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            flashlightOn ? "bg-amber-400 text-black shadow-lg" : "bg-white/10 text-white"
          }`}
          aria-label="Toggle Torch"
        >
          <Flashlight size={18} />
        </button>
      </div>

      {/* Main Viewfinder Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4">
        {/* Viewfinder Target Frame */}
        <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-2xl border-2 border-dashed border-purple-500/60 overflow-hidden bg-black/40 flex items-center justify-center shadow-2xl">
          {/* Corner Guides */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#8B5CF6] rounded-tl-md" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#8B5CF6] rounded-tr-md" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#8B5CF6] rounded-bl-md" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#8B5CF6] rounded-br-md" />

          {/* Simulated Product inside Viewfinder */}
          <div className="p-4 text-center select-none opacity-85 scale-95">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Scan size={32} className="animate-pulse" />
            </div>
            <div className="text-sm font-semibold text-white font-sans">
              {currentScenario.product}
            </div>
            <div className="text-[11px] text-purple-300 font-mono mt-0.5">
              {currentScenario.tag}
            </div>
          </div>

          {/* Laser Scanning Line */}
          <div 
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent shadow-[0_0_15px_#8B5CF6] pointer-events-none"
            style={{
              animation: "scanSweep 1.8s ease-in-out infinite"
            }}
          />

          {/* Capturing flash overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white/80 animate-ping pointer-events-none" />
          )}

          {/* Optical Target Indicator */}
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="text-[10px] font-mono text-white/80 bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
              Align mandatory declarations or QR within frame
            </span>
          </div>
        </div>

        {/* Swipeable Target Preset Selector */}
        <div className="w-full max-w-sm mt-4 px-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {MODE_ORDER.map((key) => {
              const sc = SCENARIOS[key];
              const isSelected = activeMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveMode(key)}
                  className={`flex-none px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white font-semibold shadow-purple-glow"
                      : "bg-[#182032] text-[#94A3B8] border border-[#232D45]"
                  }`}
                >
                  {sc.tabTitle}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Shutter Controls */}
      <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around z-10 pb-10">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-[#182032] border border-[#232D45] text-white flex items-center justify-center active:scale-95 transition-all"
          title="Upload Packaging Photo"
        >
          <Upload size={18} className="text-[#A855F7]" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </button>

        {/* Large Shutter Button */}
        <button
          onClick={handleTriggerCapture}
          disabled={isCapturing}
          className="w-20 h-20 rounded-full border-4 border-white/30 p-1 flex items-center justify-center active:scale-90 transition-transform shadow-purple-glow"
          aria-label="Capture and Audit"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white">
            {isCapturing ? (
              <RefreshCw size={24} className="animate-spin" />
            ) : (
              <Camera size={26} />
            )}
          </div>
        </button>

        {/* Quick Help / Info */}
        <div className="w-12 h-12 rounded-full bg-[#182032] border border-[#232D45] text-white flex items-center justify-center text-xs font-mono text-[#10B981]">
          ₹5 Coin
        </div>
      </div>
    </div>
  );
}
