"use client";
import { useState, useEffect, useCallback } from "react";
import StreamPlayer from "./StreamPlayer";
import { motion, AnimatePresence } from "framer-motion";

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

const SPORT_ICONS: Record<string, string> = {
  cricket: "🏏", football: "⚽", basketball: "🏀", tennis: "🎾", other: "🎯",
};

const ROTATION_MS = 30_000;

export default function HomeLivePlayer({ newsText }: { newsText?: string }) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStreams = useCallback(async () => {
    try {
      const res = await fetch("/api/streams?live=true");
      const data = await res.json();
      if (data.streams?.length > 0) {
        const shuffled = [...data.streams].sort(() => Math.random() - 0.5);
        setStreams(shuffled);
        setCurrentIdx(0);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadStreams(); }, [loadStreams]);

  useEffect(() => {
    const current = streams[currentIdx];
    if (!current) return;
    fetch(`/api/streams/${current.id}`)
      .then((r) => r.json())
      .then((d) => {
        setStreams((prev) => prev.map((s, i) => i === currentIdx ? { ...s, ...d.stream } : s));
        setOverlays(d.overlays || []);
      })
      .catch(() => {});
  }, [currentIdx, streams.length]);

  useEffect(() => {
    if (streams.length <= 1) return;
    const t = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % streams.length);
    }, ROTATION_MS);
    return () => clearInterval(t);
  }, [streams.length]);

  const current = streams[currentIdx];

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="aspect-video w-full rounded-2xl animate-pulse border border-amber-900/20"
          style={{ background: 'linear-gradient(135deg, #1a0a03, #2a1005)' }} />
      </div>
    );
  }

  if (!current) {
    return <NoLiveAvailable />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-2.5">
      {/* Stream header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl sm:text-2xl shrink-0">{SPORT_ICONS[current.sport_type] || "🎯"}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-black text-sm sm:text-base tracking-tight truncate max-w-[160px] sm:max-w-none">{current.title}</span>
              <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-black uppercase px-2 py-0.5 rounded-full shadow-lg shadow-red-900/40 shrink-0">
                <span className="animate-pulse">●</span> LIVE
              </span>
            </div>
            {(current.team1 || current.team2) && (
              <div className="text-amber-300/60 text-xs font-medium mt-0.5 truncate">
                {current.team1}{current.team2 ? ` vs ${current.team2}` : ""}
              </div>
            )}
          </div>
        </div>

        {/* Stream switcher */}
        {streams.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-amber-400/40 text-xs font-medium">{currentIdx + 1}/{streams.length}</span>
            <div className="flex gap-1.5">
              {streams.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentIdx(i)}
                  title={s.title}
                  className={`rounded-full transition-all duration-200 ${
                    i === currentIdx
                      ? "w-6 h-2 bg-gradient-to-r from-amber-500 to-orange-500"
                      : "w-2 h-2 bg-amber-900/50 hover:bg-amber-700"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentIdx((i) => (i + 1) % streams.length)}
              className="text-amber-400/60 hover:text-amber-400 text-xs border border-amber-900/30 hover:border-amber-700/50 px-3 py-1 rounded-lg transition-all"
            >
              Next ›
            </button>
          </div>
        )}
      </div>

      {/* Player with decorative frame */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-2xl opacity-20 blur-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, #ca8a04, transparent 70%)' }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl overflow-hidden border border-amber-900/30 shadow-2xl"
          >
            <StreamPlayer stream={current} overlays={overlays} newsText={newsText} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function NoLiveAvailable() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="w-full aspect-video rounded-2xl border border-amber-900/20 flex flex-col items-center justify-center gap-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a03, #2a1005, #1a0a03)' }}>
        {/* decorative glow */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(202,138,4,0.18) 0%, transparent 70%)' }} />
        {/* icon */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
          <div className="w-20 h-20 rounded-full border-2 border-amber-900/40 flex items-center justify-center mb-1"
            style={{ background: 'rgba(180,83,9,0.08)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(180,83,9,0.6)" strokeWidth="1.5">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-white font-black text-xl tracking-tight">No Live Stream Available</h3>
          <p className="text-amber-300/40 text-sm max-w-xs leading-relaxed">
            There are no live events at the moment. Check back soon for upcoming matches.
          </p>
          <a
            href="https://4498.indno1f.com/?menuId=sports"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 font-black text-sm uppercase tracking-widest px-6 py-3 rounded-xl text-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
          >
            ⚡ Explore Live Betting
          </a>
        </div>
      </div>
    </div>
  );
}
