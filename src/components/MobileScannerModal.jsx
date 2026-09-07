import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Camera, Upload, Zap, RefreshCw, Scan, VideoOff } from "lucide-react";
import { SCENARIOS, MODE_ORDER } from "../data/scenarios";

export default function MobileScannerModal({ isOpen, onClose, onSelectScenarioAndScan }) {
  const [activeMode, setActiveMode] = useState("qr");
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentScenario = SCENARIOS[activeMode];

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera API not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. You can still upload an image."
          : err.name === "NotFoundError"
            ? "No camera found. You can still upload an image."
            : "Camera unavailable. You can still upload an image."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    setCameraStream((stream) => {
      stream?.getTracks().forEach((track) => track.stop());
      return null;
    });
    setCameraReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (isOpen) startCamera();
    else {
      stopCamera();
      setIsCapturing(false);
      setCameraError(null);
    }
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    const track = cameraStream?.getVideoTracks()[0];
    if (!track?.applyConstraints) return;
    track.applyConstraints({ advanced: [{ torch: flashlightOn }] }).catch(() => {});
  }, [flashlightOn, cameraStream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !cameraReady) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 400;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
  }, [cameraReady]);

  const completeCapture = useCallback((imageBase64 = null) => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      onSelectScenarioAndScan(activeMode, imageBase64);
      onClose();
    }, 1100);
  }, [activeMode, onClose, onSelectScenarioAndScan]);

  const handleTriggerCapture = useCallback(() => completeCapture(captureFrame()), [captureFrame, completeCapture]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => completeCapture(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const showLiveFeed = cameraStream && !cameraError;

  return (
    <div className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-md flex flex-col justify-between animate-fadeIn">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
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
          {showLiveFeed && (
            <video ref={videoRef} autoPlay playsInline muted onCanPlay={() => setCameraReady(true)} className="absolute inset-0 w-full h-full object-cover" aria-label="Live camera feed" />
          )}
          {!showLiveFeed && <video ref={videoRef} className="hidden" muted playsInline aria-hidden="true" />}
          {cameraError && (
            <div className="absolute top-3 left-3 right-3 z-20 bg-ink/90 border border-brass/40 rounded-lg px-3 py-2 flex items-start gap-2">
              <VideoOff size={14} className="text-brass shrink-0 mt-0.5" />
              <span className="text-[11px] text-text-2 font-mono leading-snug">{cameraError}</span>
            </div>
          )}
          {/* Corner Crosshair Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-brass rounded-tl z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-brass rounded-tr z-20 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-brass rounded-bl z-20 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-brass rounded-br z-20 pointer-events-none" />

          {/* Simulated Product inside Viewfinder */}
          {!showLiveFeed && <div className="p-4 text-center select-none opacity-90 scale-95 z-10">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-panel-raised border border-brass/40 flex items-center justify-center text-brass">
              <Scan size={32} className="animate-pulse" />
            </div>
            <div className="text-sm font-serif font-bold text-text-1">
              {currentScenario.product}
            </div>
            <div className="text-[11px] text-brass font-mono mt-0.5">
              {currentScenario.tag}
            </div>
          </div>}

          {/* Laser Scanning Line */}
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brass to-transparent shadow-[0_0_15px_#C9A15A] pointer-events-none z-20"
            style={{
              animation: "scanSweep 1.8s ease-in-out infinite"
            }}
          />

          {/* Capturing flash overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-paper/80 animate-ping pointer-events-none z-30" />
          )}

          {/* Target Alignment Helper */}
          <div className="absolute bottom-3 left-0 right-0 text-center z-20 pointer-events-none">
            <span className="text-[10px] font-mono text-text-1 bg-ink/80 px-2.5 py-1 rounded border border-panel-line">
              {showLiveFeed ? "Point at package panel, QR code, or ₹5 coin" : "Align package panel, QR code, or ₹5 coin"}
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
