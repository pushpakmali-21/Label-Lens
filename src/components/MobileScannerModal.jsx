import React, { useState, useRef } from "react";
import { X, Camera, Upload, Zap, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Scan, Sparkles } from "lucide-react";
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
    }, 1100);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleTriggerCapture();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-md flex flex-col justify-between animate-fadeIn">
      {/* Top Controls Bar */}
      <div className="p-4 flex items-center justify-between z-10 border-b border-panel-line bg-panel-darker">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg bg-panel-raised hover:bg-panel-line active:scale-95 text-text-1 flex items-center justify-center transition-all border border-panel-line"
          aria-label="Close Scanner"
        >
          <X size={19} />
        </button>

        <div className="text-center">
          <div className="text-xs font-serif font-semibold tracking-wide text-brass">
            LMPC Optical Inspection Scanner
          </div>
          <div className="text-[11px] text-text-2 font-mono">
            {currentScenario.tabTitle}
          </div>
        </div>

        <button
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${flashlightOn ? "bg-brass text-brass-ink border-brass" : "bg-panel-raised text-text-1 border-panel-line"
            }`}
          aria-label="Toggle Torch"
        >
          <Zap size={18} />
        </button>
      </div>

      {/* Main Viewfinder Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-3">
        {/* Viewfinder Target Frame */}
        <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-xl border-2 border-dashed border-brass/60 overflow-hidden bg-panel-darker flex items-center justify-center shadow-2xl">
          {/* Corner Crosshair Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-brass rounded-tl" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-brass rounded-tr" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-brass rounded-bl" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-brass rounded-br" />

          {/* Simulated Product inside Viewfinder */}
          <div className="p-4 text-center select-none opacity-90 scale-95">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-panel-raised border border-brass/40 flex items-center justify-center text-brass">
              <Scan size={32} className="animate-pulse" />
            </div>
            <div className="text-sm font-serif font-bold text-text-1">
              {currentScenario.product}
            </div>
            <div className="text-[11px] text-brass font-mono mt-0.5">
              {currentScenario.tag}
            </div>
          </div>

          {/* Laser Scanning Line */}
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brass to-transparent shadow-[0_0_15px_#C9A15A] pointer-events-none"
            style={{
              animation: "scanSweep 1.8s ease-in-out infinite"
            }}
          />

          {/* Capturing flash overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-paper/80 animate-ping pointer-events-none" />
          )}

          {/* Target Alignment Helper */}
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="text-[10px] font-mono text-text-1 bg-ink/80 px-2.5 py-1 rounded border border-panel-line">
              Align package panel, QR code, or ₹5 coin
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
                  className={`flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isSelected
                      ? "bg-brass text-brass-ink font-semibold shadow-sm"
                      : "bg-panel-raised text-text-2 border border-panel-line"
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
      <div className="p-5 bg-panel-darker border-t border-panel-line flex items-center justify-around z-10 pb-8">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-xl bg-panel-raised border border-panel-line text-text-1 flex items-center justify-center active:scale-95 transition-all"
          title="Upload Packaging Photo"
        >
          <Upload size={18} className="text-brass" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </button>

        {/* Large Brass Shutter Button */}
        <button
          onClick={handleTriggerCapture}
          disabled={isCapturing}
          className="w-18 h-18 rounded-full border-4 border-brass/40 p-1 flex items-center justify-center active:scale-90 transition-transform shadow-brass-glow bg-ink"
          aria-label="Capture and Audit"
        >
          <div className="w-14 h-14 rounded-full bg-brass hover:bg-brass-strong flex items-center justify-center text-brass-ink font-bold">
            {isCapturing ? (
              <RefreshCw size={22} className="animate-spin text-brass-ink" />
            ) : (
              <Camera size={24} className="text-brass-ink" />
            )}
          </div>
        </button>

        {/* Optical reference marker */}
        <div className="w-12 h-12 rounded-xl bg-panel-raised border border-panel-line text-text-1 flex flex-col items-center justify-center text-[10px] font-mono text-status-pass">
          <span>₹5 Coin</span>
          <span className="text-[8px] text-text-2">23mm</span>
        </div>
      </div>
    </div>
  );
}
