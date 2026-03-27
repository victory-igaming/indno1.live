"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";

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
  youtubeUrl?: string;
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

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
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

// Reference width used in StreamPlayer for scale calculations
const REFERENCE_WIDTH = 1280;

export default function DraggableOverlayEditor({
  overlays,
  onPositionChange,
  onSizeChange,
  activeAdId,
  youtubeUrl,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [showStream, setShowStream] = useState(true);
  // Track real container width so overlay sizes match StreamPlayer's scale factor
  const [containerWidth, setContainerWidth] = useState(0);

  const videoId = extractYouTubeId(youtubeUrl || "");
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0&controls=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&playsinline=1`
    : null;

  // Keep containerWidth in sync using ResizeObserver — same approach as StreamPlayer
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
    [],
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

      // Resize deltas are in screen pixels; we need to convert them back to
      // reference-space pixels so stored values match what StreamPlayer expects.
      // We store this scale in containerH so the move handler can un-scale.
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
    [],
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

        // Convert screen-pixel delta back to reference-space pixels
        const scale = resize.containerW > 0 ? REFERENCE_WIDTH / resize.containerW : 1;
        const newW = Math.min(Math.max(resize.origW + dx * scale, 10), REFERENCE_WIDTH * 4);
        const newH = Math.min(Math.max(resize.origH + dy * scale, 10), resize.containerH * 4 * scale);

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

  // Scale factor: same formula as StreamPlayer uses
  const scale = containerWidth > 0 ? containerWidth / REFERENCE_WIDTH : 1;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-amber-300/40 text-xs">
          Drag overlays on the preview below. Use the ↘ handle to resize.
          Overlay sizes are scaled to match the live player exactly.
        </p>
        {embedUrl && (
          <button
            type="button"
            onClick={() => setShowStream((v) => !v)}
            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
              showStream
                ? "bg-red-600/20 border-red-600/50 text-red-400"
                : "bg-amber-950/40 border-amber-900/30 text-amber-400/70 hover:text-white"
            }`}
          >
            {showStream ? "▶ Stream ON" : "▶ Stream OFF"}
          </button>
        )}
      </div>

      {/* Scale info */}
      {containerWidth > 0 && (
        <p className="text-amber-900/60 text-xs">
          Preview scale: {Math.round(scale * 100)}% of reference (1280px). Overlays appear at the same relative size as in the live player.
        </p>
      )}

      {/* Editor canvas */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-amber-900/40"
        style={{
          aspectRatio: "16 / 9",
          background: "#0d0503",
          userSelect: "none",
          touchAction: "none",
          minHeight: "180px",
        }}
        onClick={() => setSelected(null)}
      >
        {/* YouTube iframe */}
        {embedUrl && showStream ? (
          <iframe
            src={embedUrl}
            title="Stream Preview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ position: 'absolute', top: '-5%', left: '-5%', width: '110%', height: '110%', border: 'none', pointerEvents: "none", zIndex: 1 }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 1, pointerEvents: "none" }}
          >
            <div className="text-center">
              <div className="text-amber-900/50 text-5xl mb-2">▶</div>
              <div className="text-amber-900/40 text-xs uppercase tracking-widest">
                {embedUrl ? "Stream hidden" : "Video Preview Area"}
              </div>
            </div>
          </div>
        )}

        {/* Active overlays */}
        {activeOverlays.map((overlay) => {
          const isSelected = selected === overlay.id;
          const isActiveAd = overlay.type === "ad" && overlay.id === activeAdId;
          const isVideoFile = /\.(mp4|webm)(\?|$)/i.test(overlay.image_url);

          // Apply same scale factor as StreamPlayer so editor matches player view exactly
          const scaledW = Math.max(Number(overlay.width) * scale, 8);
          const scaledH = Math.max(Number(overlay.height) * scale, 8);

          return (
            <div
              key={overlay.id}
              className={`absolute border-2 rounded ${TYPE_COLORS[overlay.type]} ${
                isSelected ? "shadow-[0_0_0_2px_white] border-solid" : "border-dashed"
              } ${isActiveAd ? "ring-2 ring-orange-400" : ""}`}
              style={{
                left: `${Number(overlay.pos_x)}%`,
                top: `${Number(overlay.pos_y)}%`,
                width: `${scaledW}px`,
                height: `${scaledH}px`,
                opacity: Number(overlay.opacity),
                zIndex: isSelected ? 30 : 20,
                cursor: "grab",
                touchAction: "none",
                userSelect: "none",
              }}
              onMouseDown={(e) => handleDragStart(e, overlay)}
              onTouchStart={(e) => handleDragStart(e, overlay)}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(overlay.id);
              }}
            >
              {isVideoFile ? (
                <video
                  src={overlay.image_url}
                  className="w-full h-full object-contain"
                  style={{ pointerEvents: "none" }}
                  muted
                  loop
                  autoPlay
                  playsInline
                  draggable={false}
                />
              ) : (
                <img
                  src={overlay.image_url}
                  alt={overlay.type}
                  className="w-full h-full object-contain"
                  style={{ pointerEvents: "none" }}
                  draggable={false}
                />
              )}

              {/* Label */}
              <div
                className="absolute -top-6 left-0 text-xs bg-black/90 px-2 py-0.5 rounded text-white whitespace-nowrap border border-amber-900/40"
                style={{ pointerEvents: "none" }}
              >
                {TYPE_LABELS[overlay.type]}
                {isActiveAd ? " 🔴 LIVE" : ""}
              </div>

              {/* Resize handle */}
              <div
                className="absolute bottom-0 right-0 w-5 h-5 bg-amber-500/90 rounded-tl flex items-center justify-center text-black text-xs font-bold hover:bg-amber-400 transition-colors"
                style={{ zIndex: 31, cursor: "se-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart(e, overlay);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleResizeStart(e, overlay);
                }}
                title="Drag to resize"
              >
                ↘
              </div>
            </div>
          );
        })}

        {activeOverlays.length === 0 && (
          <div
            className="absolute inset-0 flex items-end justify-center pb-4"
            style={{ zIndex: 15, pointerEvents: "none" }}
          >
            <p className="text-amber-900/50 text-xs bg-black/60 px-3 py-1 rounded-full">
              No active overlays — add one below
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-amber-300/40">
        <span><span className="text-blue-400 font-bold">—</span> Logo</span>
        <span><span className="text-orange-400 font-bold">—</span> Ad</span>
        <span><span className="text-purple-400 font-bold">—</span> Banner</span>
        {activeAdId && <span className="text-orange-400 font-bold animate-pulse">● Ad is live</span>}
      </div>
    </div>
  );
}
