"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Overlay {
  id: number;
  type: "logo" | "ad" | "banner";
  image_url: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  opacity: number;
  ad_duration: number;
  display_order: number;
}

interface Stream {
  id: number;
  title: string;
  sport_type: string;
  youtube_url: string;
  team1?: string;
  team2?: string;
  is_live: boolean;
  ad_active: boolean;
  active_overlay_id?: number | null;
}

interface StreamPlayerProps {
  stream: Stream;
  overlays: Overlay[];
  newsText?: string;
  pollInterval?: number;
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function isVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

const VIDEO_ASPECT = 16 / 9;

export default function StreamPlayer({
  stream: initialStream,
  overlays: initialOverlays,
  newsText,
  pollInterval = 2000,
}: StreamPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [stream, setStream] = useState(initialStream);
  const [overlays, setOverlays] = useState(initialOverlays);
  const [adCountdown, setAdCountdown] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [videoBounds, setVideoBounds] = useState({ top: 0, left: 0, width: 0, height: 0, containerW: 0, containerH: 0 });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bufferingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Poll for live ad state changes
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/streams/${stream.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setStream(data.stream);
        setOverlays(data.overlays);
      } catch {}
    };
    const interval = setInterval(poll, pollInterval);
    return () => clearInterval(interval);
  }, [stream.id, pollInterval]);

  // Manage ad countdown
  const activeAd = useMemo(() => {
    if (!stream.ad_active || !stream.active_overlay_id) return null;
    return overlays.find((o) => o.id === stream.active_overlay_id && o.type === "ad") || null;
  }, [stream.ad_active, stream.active_overlay_id, overlays]);

  useEffect(() => {
    if (activeAd) {
      setAdCountdown(activeAd.ad_duration);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev === null || prev <= 1) return activeAd.ad_duration;
          return prev - 1;
        });
      }, 1000);
    } else {
      setAdCountdown(null);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [activeAd]);

  const positionedOverlays = useMemo(() =>
    overlays.filter((o) => !(stream.ad_active && o.id === stream.active_overlay_id)),
    [overlays, stream.ad_active, stream.active_overlay_id]
  );

  const videoId = extractYouTubeId(stream.youtube_url);
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&controls=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&playsinline=1&enablejsapi=1`
    : null;

  const newsDuration = Math.trunc((newsText || "").length * 0.25) || 20;

  // Compute actual video bounds within container
  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cW = rect.width;
      const cH = rect.height;
      const containerAspect = cW / cH;
      let vW, vH, vLeft, vTop;
      if (containerAspect > VIDEO_ASPECT) {
        vH = cH;
        vW = vH * VIDEO_ASPECT;
        vLeft = (cW - vW) / 2;
        vTop = 0;
      } else {
        vW = cW;
        vH = vW / VIDEO_ASPECT;
        vLeft = 0;
        vTop = (cH - vH) / 2;
      }
      setVideoBounds({ top: vTop, left: vLeft, width: vW, height: vH, containerW: cW, containerH: cH });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [mounted, isFullscreen]);

  // YouTube postMessage API — mute/unmute without reloading
  const toggleMute = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    const func = isMuted ? "unMute" : "mute";
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      "*"
    );
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Fullscreen via browser API
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  // Auto-hide controls on idle
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // Listen for YouTube player state via postMessage
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "onStateChange") {
          if (data.info === 1) {
            // Playing
            if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
            setIsBuffering(false);
          } else if (data.info === 3) {
            // Buffering
            setIsBuffering(true);
          }
        }
        if (data?.event === "onReady") {
          if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
          setIsBuffering(false);
        }
      } catch {}
    };
    window.addEventListener("message", handleMessage);
    // Fallback: hide loading after 8 seconds regardless
    bufferingTimerRef.current = setTimeout(() => setIsBuffering(false), 8000);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
    };
  }, []);

  if (!mounted) return (
    <div className="aspect-video w-full rounded-2xl animate-pulse border border-amber-900/20"
      style={{ background: "linear-gradient(135deg, #1a0a03, #2a1005)" }} />
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video shadow-2xl border border-amber-900/20 group"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={showControlsTemporarily}
      onMouseLeave={() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        setShowControls(false);
      }}
      onTouchStart={showControlsTemporarily}
    >
      {/* YouTube iframe — oversized to clip branding */}
      {embedUrl ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={stream.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            position: "absolute",
            top: "-5%",
            left: "-5%",
            width: "110%",
            height: "110%",
            border: "none",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-amber-300/30 text-sm">
          Invalid YouTube URL
        </div>
      )}

      {/* Branded loading/buffering overlay */}
      <AnimatePresence>
        {isBuffering && !activeAd && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            style={{ background: "linear-gradient(135deg, #1a0803, #0d0401, #1f0d04)" }}
          >
            {/* Logo / brand mark */}
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full border-2 border-amber-600/30 flex items-center justify-center"
                style={{ background: "radial-gradient(circle, #3d1f08, #1a0a03)" }}>
                <span className="text-2xl">📺</span>
              </div>
              {/* Spinner ring */}
              <svg className="absolute -inset-2 w-20 h-20 animate-spin" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" strokeWidth="2"
                  stroke="url(#spinGrad)" strokeLinecap="round" strokeDasharray="120 100" />
                <defs>
                  <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="text-amber-200/80 text-sm font-bold tracking-widest uppercase mb-1">
              Loading Live Stream
            </p>
            <p className="text-amber-400/40 text-xs font-medium">Please wait…</p>
            {/* Animated shimmer bar */}
            <div className="mt-6 w-48 h-1 rounded-full overflow-hidden" style={{ background: "rgba(180,83,9,0.2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(to right, #f59e0b, #c2410c, #f59e0b)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay anchor: positioned to match actual rendered video rectangle */}
      {videoBounds.width > 0 && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            top: videoBounds.top,
            left: videoBounds.left,
            width: videoBounds.width,
            height: videoBounds.height,
          }}
        >
          {/* Positioned overlays (logos, banners, non-active ads) */}
          {positionedOverlays.map((o) => {
            // Scale factor: compare reference 16:9 space to actual video size
            const scale = videoBounds.width / 1280; // 1280 is reference width
            const scaledW = o.width * scale;
            const scaledH = o.height * scale;
            return (
              <div
                key={o.id}
                className="absolute"
                style={{
                  left: `${o.pos_x}%`,
                  top: `${o.pos_y}%`,
                  opacity: o.opacity,
                }}
              >
                {isVideo(o.image_url) ? (
                  <video
                    src={o.image_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: Math.max(scaledW, 24),
                      height: Math.max(scaledH, 24),
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <img
                    src={o.image_url}
                    alt={o.type}
                    style={{
                      width: Math.max(scaledW, 24),
                      height: Math.max(scaledH, 24),
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Live badge */}
      {stream.is_live && !activeAd && (
        <div className="absolute top-3 left-3 z-30 pointer-events-none ">
          <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-full shadow-lg shadow-red-900/50 indPlayer_txtLive">
            <span className="animate-pulse">●</span> LIVE
          </span>
        </div>
      )}

      {/* Full-screen Ad overlay */}
      <AnimatePresence>
        {activeAd && (
          <motion.div
            key={`ad-${activeAd.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black"
            style={{ opacity: activeAd.opacity }}
          >
            {isVideo(activeAd.image_url) ? (
              <video
                src={activeAd.image_url}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={activeAd.image_url}
                alt="Advertisement"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
            {adCountdown !== null && (
              <div className="absolute top-4 right-4 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                Ad ends in {adCountdown}s
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-full shadow-lg">
              <span className="animate-pulse">●</span> AD
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player controls (mute + fullscreen) — auto-hide */}
      <AnimatePresence>
        {showControls && !activeAd && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-10 right-3 z-30 flex items-center gap-2"
          >
            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-9 h-9 rounded-full text-white transition-all shadow-lg"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97V10l2.45 2.45c.03-.15.05-.3.05-.45zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18H18l1.73 1.73L21 18.46 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-9 h-9 rounded-full text-white transition-all shadow-lg"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News ticker — below video content, not overlapping */}
      {newsText && !activeAd && (
        <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none">
          <div
            className="flex items-stretch"
            style={{
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              borderTop: "1px solid rgba(180,83,9,0.4)",
            }}
          >
            <div
              className="text-white px-4 py-1.5 flex items-center justify-center font-black italic uppercase text-xs tracking-tighter whitespace-nowrap indPlayer_txtNews"
              style={{ background: "linear-gradient(to right, #b45309, #c2410c)" }}
            >
              <span className="animate-pulse mr-2">●</span> NEWS
            </div>
            <div className="flex-1 py-1.5 overflow-hidden whitespace-nowrap flex items-center">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{ repeat: Infinity, duration: newsDuration, ease: "linear" }}
                className="inline-block text-amber-100 font-bold text-sm uppercase px-4"
              >
                {newsText} • {newsText}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
