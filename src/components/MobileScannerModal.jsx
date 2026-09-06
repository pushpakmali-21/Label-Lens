import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Camera, Upload, Zap as Flashlight, RefreshCw, Scan, VideoOff } from "lucide-react";
import { SCENARIOS, MODE_ORDER } from "../data/scenarios";

export default function MobileScannerModal({ isOpen, onClose, onSelectScenarioAndScan }) {
  const [activeMode, setActiveMode] = useState("qr");
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Camera state
  const [cameraStream, setCameraStream] = useState(null);   // MediaStream | null
  const [cameraError, setCameraError] = useState(null);     // string | null
  const [cameraReady, setCameraReady] = useState(false);    // true once <video> is playing

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentScenario = SCENARIOS[activeMode];

  // ── Start camera ─────────────────────────────────────────────────────────────
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Using demo mode."
          : err.name === "NotFoundError"
          ? "No camera found. Using demo mode."
          : "Camera unavailable. Using demo mode.";
      setCameraError(msg);
    }
  }, []);

  // ── Stop camera ───────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    setCameraStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
    setCameraReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // ── Lifecycle: open → start, close → stop ────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setIsCapturing(false);
      setCameraError(null);
    }
  }, [isOpen, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Torch (best-effort — only works on some Android browsers) ─────────────────
  useEffect(() => {
    if (!cameraStream) return;
    const [videoTrack] = cameraStream.getVideoTracks();
    if (!videoTrack?.applyConstraints) return;
    videoTrack.applyConstraints({ advanced: [{ torch: flashlightOn }] }).catch(() => {
      /* Torch not supported — silently ignore */
    });
  }, [flashlightOn, cameraStream]);

  // ── Capture from live video or fall back to demo flow ────────────────────────
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !cameraReady) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Returns base64 JPEG (strip the data-URL prefix for the API)
    return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
  }, [cameraReady]);

  const handleTriggerCapture = useCallback(() => {
    setIsCapturing(true);

    // Capture real frame if camera is live; otherwise fall through to demo
    const frameB64 = captureFrame();

    setTimeout(() => {
      setIsCapturing(false);
      // Pass captured frame so the scan handler can optionally use it;
      // the existing demo flow is preserved when frameB64 is null.
      onSelectScenarioAndScan(activeMode, frameB64);
      onClose();
    }, 1100);
  }, [activeMode, captureFrame, onSelectScenarioAndScan, onClose]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result.split(",")[1];
      setIsCapturing(true);
      setTimeout(() => {
        setIsCapturing(false);
        onSelectScenarioAndScan(activeMode, b64);
        onClose();
      }, 1100);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const showLiveFeed = cameraStream && !cameraError;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1520]/95 backdrop-blur-md flex flex-col justify-between animate-fadeIn">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Top Controls Bar */}
      <div className="p-4 flex items-center justify-between z-10 border-b border-[#26394B] bg-[#0E1A26]">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg bg-[#17293B] hover:bg-[#26394B] active:scale-95 text-[#EDEAE1] flex items-center justify-center transition-all border border-[#26394B]"
          aria-label="Close Scanner"
        >
          <X size={19} />
        </button>

        <div className="text-center">
          <div className="text-xs font-serif font-semibold tracking-wide text-[#C9A15A]">
            LMPC Optical Inspection Scanner
          </div>
          <div className="text-[11px] text-[#99AAB8] font-mono">
            {currentScenario.tabTitle}
          </div>
        </div>

        <button
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${
            flashlightOn
              ? "bg-[#C9A15A] text-[#241B08] border-[#C9A15A]"
              : "bg-[#17293B] text-[#EDEAE1] border-[#26394B]"
          }`}
          aria-label="Toggle Torch"
        >
          <Flashlight size={18} />
        </button>
      </div>

      {/* Main Viewfinder Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-3">
        {/* Viewfinder Target Frame */}
        <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-xl border-2 border-dashed border-[#C9A15A]/60 overflow-hidden bg-[#0E1A26] flex items-center justify-center shadow-2xl">

          {/* ── Live camera feed ── */}
          {showLiveFeed && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => setCameraReady(true)}
              className="absolute inset-0 w-full h-full object-cover"
              aria-label="Live camera feed"
            />
          )}

          {/* Hidden video ref holder when no stream (keeps ref stable) */}
          {!showLiveFeed && (
            <video ref={videoRef} className="hidden" muted playsInline aria-hidden="true" />
          )}

          {/* ── Camera unavailable banner ── */}
          {cameraError && (
            <div className="absolute top-3 left-3 right-3 z-20 bg-[#0B1520]/90 border border-[#C9A15A]/40 rounded-lg px-3 py-2 flex items-start gap-2">
              <VideoOff size={14} className="text-[#C9A15A] shrink-0 mt-0.5" />
              <span className="text-[11px] text-[#99AAB8] font-mono leading-snug">{cameraError}</span>
            </div>
          )}

          {/* ── Demo/fallback content (shown when no live feed) ── */}
          {!showLiveFeed && (
            <div className="p-4 text-center select-none opacity-90 scale-95 z-10">
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-[#17293B] border border-[#C9A15A]/40 flex items-center justify-center text-[#C9A15A]">
                <Scan size={32} className="animate-pulse" />
              </div>
              <div className="text-sm font-serif font-bold text-[#EDEAE1]">
                {currentScenario.product}
              </div>
              <div className="text-[11px] text-[#C9A15A] font-mono mt-0.5">
                {currentScenario.tag}
              </div>
            </div>
          )}

          {/* Corner Crosshair Brackets (always shown over everything) */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#C9A15A] rounded-tl z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#C9A15A] rounded-tr z-20 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#C9A15A] rounded-bl z-20 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#C9A15A] rounded-br z-20 pointer-events-none" />

          {/* Laser Scanning Line */}
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A15A] to-transparent shadow-[0_0_15px_#C9A15A] pointer-events-none z-20"
            style={{ animation: "scanSweep 1.8s ease-in-out infinite" }}
          />

          {/* Capturing flash overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-[#ECE7D9]/80 animate-ping pointer-events-none z-30" />
          )}

          {/* Bottom alignment hint */}
          <div className="absolute bottom-3 left-0 right-0 text-center z-20 pointer-events-none">
            <span className="text-[10px] font-mono text-[#EDEAE1] bg-[#0B1520]/80 px-2.5 py-1 rounded border border-[#26394B]">
              {showLiveFeed ? "Point at package panel, QR code or ₹5 coin" : "Align package panel, QR code, or ₹5 coin"}
            </span>
          </div>
        </div>

        {/* Scenario chip selector */}
        <div className="w-full max-w-sm mt-4 px-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {MODE_ORDER.map((key) => {
              const sc = SCENARIOS[key];
              const isSelected = activeMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveMode(key)}
                  className={`flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#C9A15A] text-[#241B08] font-semibold shadow-sm"
                      : "bg-[#17293B] text-[#99AAB8] border border-[#26394B]"
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
      <div className="p-5 bg-[#0E1A26] border-t border-[#26394B] flex items-center justify-around z-10 pb-8">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-xl bg-[#17293B] border border-[#26394B] text-[#EDEAE1] flex items-center justify-center active:scale-95 transition-all"
          title="Upload Packaging Photo"
        >
          <Upload size={18} className="text-[#C9A15A]" />
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
          className="w-18 h-18 rounded-full border-4 border-[#C9A15A]/40 p-1 flex items-center justify-center active:scale-90 transition-transform shadow-brass-glow bg-[#0B1520]"
          aria-label="Capture and Audit"
        >
          <div className="w-14 h-14 rounded-full bg-[#C9A15A] hover:bg-[#E0BE7E] flex items-center justify-center text-[#241B08] font-bold">
            {isCapturing ? (
              <RefreshCw size={22} className="animate-spin text-[#241B08]" />
            ) : (
              <Camera size={24} className="text-[#241B08]" />
            )}
          </div>
        </button>

        {/* Optical reference marker */}
        <div className="w-12 h-12 rounded-xl bg-[#17293B] border border-[#26394B] text-[#EDEAE1] flex flex-col items-center justify-center text-[10px] font-mono text-[#5AAE83]">
          <span>₹5 Coin</span>
          <span className="text-[8px] text-[#99AAB8]">23mm</span>
        </div>
      </div>
    </div>
  );
}
