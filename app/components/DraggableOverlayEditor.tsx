"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Hls from "hls.js";

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
  is_active: boolean;
}

interface Props {
  overlays: Overlay[];
  onPositionChange: (id: number, pos_x: number, pos_y: number) => void;
  onSizeChange: (id: number, width: number, height: number) => void;
  activeAdId: number | null;

  sourceType?: "youtube" | "obs";
  youtubeUrl?: string | null;
  obsStreamUrl?: string | null;
}

const TYPE_COLORS = {
  logo: "border-blue-400",
  ad: "border-orange-400",
  banner: "border-purple-400",
};

const TYPE_LABELS = {
  logo: "🏷️ Logo",
  ad: "📢 Ad",
  banner: "🖼️ Banner",
};

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.pathname.includes("/embed/")) {
      const parts = parsed.pathname.split("/");
      return parts[parts.length - 1] || null;
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function isVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

interface DragState {
  id: number;
  startX: number;
  startY: number;
  origPx: number;
  origPy: number;
  containerW: number;
  containerH: number;
  overlayW: number;
  overlayH: number;
}

interface ResizeState {
  id: number;
  startX: number;
  startY: number;
  origW: number;
  origH: number;
  containerW: number;
  containerH: number;
}

const REFERENCE_WIDTH = 1280;

function ObsPreview({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      hls = new Hls({
        liveSyncDurationCount: 3,
        enableWorker: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("DraggableOverlayEditor HLS error:", data);
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full bg-black object-contain"
      autoPlay
      muted
      playsInline
      controls={false}
    />
  );
}

export default function DraggableOverlayEditor({
  overlays,
  onPositionChange,
  onSizeChange,
  activeAdId,
  sourceType = "youtube",
  youtubeUrl,
  obsStreamUrl,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [showStream, setShowStream] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  const isObs = sourceType === "obs";
  const isYouTube = sourceType === "youtube";

  const videoId = isYouTube ? extractYouTubeId(youtubeUrl) : null;

  const embedUrl =
    isYouTube && videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&controls=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&playsinline=1`
      : null;

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);

    return () => ro.disconnect();
  }, []);

  const getClient = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    if ("clientX" in e) {
      return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    }

    return null;
  };

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, overlay: Overlay) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect || rect.width === 0 || rect.height === 0) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      setSelected(overlay.id);

      dragRef.current = {
        id: overlay.id,
        startX: clientX,
        startY: clientY,
        origPx: Number(overlay.pos_x),
        origPy: Number(overlay.pos_y),
        containerW: rect.width,
        containerH: rect.height,
        overlayW: Number(overlay.width),
        overlayH: Number(overlay.height),
      };
    },
    []
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, overlay: Overlay) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect || rect.width === 0 || rect.height === 0) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      setSelected(overlay.id);

      resizeRef.current = {
        id: overlay.id,
        startX: clientX,
        startY: clientY,
        origW: Number(overlay.width),
        origH: Number(overlay.height),
        containerW: rect.width,
        containerH: rect.height,
      };
    },
    []
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e) e.preventDefault();

      const client = getClient(e);

      if (!client) return;

      const drag = dragRef.current;
      const resize = resizeRef.current;

      if (drag) {
        const dx = client.x - drag.startX;
        const dy = client.y - drag.startY;

        const dxPct = (dx / drag.containerW) * 100;
        const dyPct = (dy / drag.containerH) * 100;

        const newX = Math.min(Math.max(drag.origPx + dxPct, -80), 180);
        const newY = Math.min(Math.max(drag.origPy + dyPct, -80), 180);

        onPositionChange(drag.id, newX, newY);
      }

      if (resize) {
        const dx = client.x - resize.startX;
        const dy = client.y - resize.startY;

        const scale =
          resize.containerW > 0 ? REFERENCE_WIDTH / resize.containerW : 1;

        const newW = Math.min(
          Math.max(resize.origW + dx * scale, 10),
          REFERENCE_WIDTH * 4
        );

        const newH = Math.min(
          Math.max(resize.origH + dy * scale, 10),
          resize.containerH * 4 * scale
        );

        onSizeChange(resize.id, Math.round(newW), Math.round(newH));
      }
    };

    const handleUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [onPositionChange, onSizeChange]);

  const activeOverlays = overlays.filter((o) => o.is_active);
  const scale = containerWidth > 0 ? containerWidth / REFERENCE_WIDTH : 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-amber-300/40 text-xs">
          Drag overlays on the preview below. Use the ↘ handle to resize.
          Overlay sizes are scaled to match the live player exactly.
        </p>

        <button
          type="button"
          onClick={() => setShowStream((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500"
        >
          {showStream ? "Hide Stream Preview" : "Show Stream Preview"}
        </button>
      </div>

      <div className="text-xs text-zinc-500">
        Preview source:{" "}
        <span className="text-amber-400 font-bold">
          {isObs ? "OBS / HLS" : "YouTube"}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-video w-full overflow-hidden rounded-xl border border-amber-900/30 bg-black select-none"
      >
        {showStream && isYouTube && embedUrl && (
          <iframe
            src={embedUrl}
            title="YouTube stream preview"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            className="absolute inset-0 h-full w-full"
            style={{
              pointerEvents: "none",
            }}
          />
        )}

        {showStream && isYouTube && !embedUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-amber-300/40">
            Invalid YouTube URL
          </div>
        )}

        {showStream && isObs && obsStreamUrl && (
          <ObsPreview src={obsStreamUrl} />
        )}

        {showStream && isObs && !obsStreamUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-amber-300/40">
            OBS stream URL missing
          </div>
        )}

        {!showStream && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 to-zinc-900" />
        )}

        {activeOverlays.map((overlay) => {
          const isSelected = selected === overlay.id;
          const isActiveAd = activeAdId === overlay.id;
          const scaledWidth = Math.max(Number(overlay.width) * scale, 24);
          const scaledHeight = Math.max(Number(overlay.height) * scale, 24);

          return (
            <div
              key={overlay.id}
              className={`absolute group/overlay cursor-move border-2 ${
                TYPE_COLORS[overlay.type]
              } ${
                isSelected ? "ring-2 ring-white/70" : ""
              } ${isActiveAd ? "shadow-[0_0_25px_rgba(251,146,60,0.8)]" : ""}`}
              style={{
                left: `${overlay.pos_x}%`,
                top: `${overlay.pos_y}%`,
                width: scaledWidth,
                height: scaledHeight,
                opacity: overlay.opacity,
              }}
              onMouseDown={(e) => handleDragStart(e, overlay)}
              onTouchStart={(e) => handleDragStart(e, overlay)}
            >
              {isVideo(overlay.image_url) ? (
                <video
                  src={overlay.image_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-contain pointer-events-none"
                />
              ) : (
                <img
                  src={overlay.image_url}
                  alt={overlay.type}
                  className="h-full w-full object-contain pointer-events-none"
                  draggable={false}
                />
              )}

              <div className="absolute -top-6 left-0 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                {TYPE_LABELS[overlay.type]} #{overlay.id}
              </div>

              <div
                className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize rounded-sm border border-white/60 bg-amber-500"
                onMouseDown={(e) => handleResizeStart(e, overlay)}
                onTouchStart={(e) => handleResizeStart(e, overlay)}
                title="Resize"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}