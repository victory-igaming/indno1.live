'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const sportsCategories = [
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
];

interface LiveStream {
  id: number;
  title: string;
  sport_type: string;
  youtube_url: string;
  team1?: string;
  team2?: string;
  scheduled_at?: string;
  is_live: boolean;
}

function getStreamStatus(stream: LiveStream): 'live' | 'upcoming' | 'ended' {
  if (stream.is_live) return 'live';
  if (stream.scheduled_at) {
    const scheduledTime = new Date(stream.scheduled_at).getTime();
    if (scheduledTime > Date.now()) return 'upcoming';
  }
  return 'ended';
}

function shouldShowStream(stream: LiveStream): boolean {
  const status = getStreamStatus(stream);
  return status === 'live' || status === 'upcoming';
}

const SPORT_COLORS: Record<string, { live: string; upcoming: string }> = {
  cricket: { live: 'rgba(220,38,38,0.15)', upcoming: 'rgba(180,83,9,0.12)' },
  football: { live: 'rgba(220,38,38,0.15)', upcoming: 'rgba(180,83,9,0.12)' },
  basketball: { live: 'rgba(220,38,38,0.15)', upcoming: 'rgba(180,83,9,0.12)' },
};

export default function SportsTabs() {
  const [activeTab, setActiveTab] = useState('cricket');
  const [streams, setStreams] = useState<Record<string, LiveStream[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);
      try {
        const results = await Promise.all(
          sportsCategories.map((s) =>
            fetch(`/api/streams?sport=${s.id}`)
              .then((r) => r.json())
              .then((d) => ({ sport: s.id, streams: d.streams || [] }))
              .catch(() => ({ sport: s.id, streams: [] }))
          )
        );
        const map: Record<string, LiveStream[]> = {};
        results.forEach(({ sport, streams }) => { map[sport] = streams; });
        setStreams(map);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  const allStreams = streams[activeTab] || [];
  const currentStreams = allStreams.filter(shouldShowStream);

  return (
    <div className="w-full spotab_maincontent">
      {/* Section Title — centered */}
      <div className="flex flex-col items-center text-center mb-5 spotab_topcontent">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
          <h2 className="text-white font-black text-lg uppercase tracking-wider spotab_heading">Live &amp; Upcoming</h2>
          <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-yellow-400 rounded-full" />
        </div>
        <p className="text-amber-300/30 text-xs font-medium mt-1 spotab_headsmal">Watch live matches and upcoming fixtures</p>
      </div>

      {/* Tabs — centered */}
      <div className="flex justify-center gap-2 mb-6 flex-wrap spotab_menu">
        {sportsCategories.map((sport) => {
          const sportStreams = (streams[sport.id] || []).filter(shouldShowStream);
          const liveCount = sportStreams.filter((s) => s.is_live).length;
          const isActive = activeTab === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => setActiveTab(sport.id)}
              className={`spotab_menuitem flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                isActive
                  ? 'text-white shadow-lg shadow-amber-900/30'
                  : 'text-amber-300/60 hover:text-white'
              }`}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #b45309, #c2410c)'
                  : 'rgba(180,83,9,0.12)',
                border: isActive
                  ? '1px solid rgba(245,158,11,0.3)'
                  : '1px solid rgba(180,83,9,0.2)',
              }}
            >
              <span>{sport.icon}</span>
              {sport.label}
              {liveCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                  {liveCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse border border-amber-900/20 "
              style={{ background: 'linear-gradient(135deg, #1f0d04, #2a1005)' }} />
          ))}
        </div>
      ) : currentStreams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="text-5xl opacity-40">{sportsCategories.find((s) => s.id === activeTab)?.icon}</div>
          <p className="text-white/50 text-base font-bold">No {activeTab} matches right now</p>
          <p className="text-amber-300/25 text-xs">Check back soon for upcoming fixtures</p>
          <a
            href="https://4498.indno1f.com/?menuId=sports"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl text-black spotab_ftrbutn"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
          >
            ⚡ Bet on Live Sports
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 spotab_menuitemcntent">
          {currentStreams.map((stream) => {
            const status = getStreamStatus(stream);
            const sportInfo = sportsCategories.find((s) => s.id === stream.sport_type);
            const colorSet = SPORT_COLORS[stream.sport_type] || SPORT_COLORS.cricket;

            return (
              <div
                key={stream.id}
                className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl "
                style={{
                  background: `linear-gradient(160deg, #2e1408 0%, #1a0a03 100%)`,
                  border: status === 'live'
                    ? '1px solid rgba(220,38,38,0.4)'
                    : '1px solid rgba(180,83,9,0.25)',
                  boxShadow: status === 'live'
                    ? '0 4px 24px rgba(220,38,38,0.08)'
                    : '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Top accent line */}
                <div
                  className="h-0.5 w-full shrink-0"
                  style={{
                    background: status === 'live'
                      ? 'linear-gradient(to right, #ef4444, #991b1b)'
                      : 'linear-gradient(to right, #b45309, #c2410c)',
                  }}
                />

                {/* Card body */}
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {/* Header row: sport + status badge */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-400/70">
                      <span>{sportInfo?.icon}</span>
                      {stream.sport_type}
                    </span>
                    {status === 'live' ? (
                      <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow shadow-red-900/40 spotab_menuitemcntent_btnlive">
                        <span className="animate-pulse">●</span> LIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400/70 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-amber-800/40 spotab_menuitemcntent_btnupcome"
                        style={{ background: 'rgba(180,83,9,0.1)' }}>
                        ◷ Upcoming
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-white font-bold text-sm leading-snug group-hover:text-amber-200 transition-colors line-clamp-2 spotab_menuitemcntent_title">
                    {stream.title}
                  </p>

                  {/* Teams vs display */}
                  {(stream.team1 || stream.team2) && (
                    <div className="flex items-center justify-center gap-3 py-2 px-3 rounded-lg spotab_menuitemcntent_match"
                      style={{ background: 'rgba(0,0,0,0.25)' }}>
                      <span className="text-white/80 text-xs font-bold text-center flex-1 truncate">
                        {stream.team1 || '—'}
                      </span>
                      <span className="text-amber-500 text-xs font-black shrink-0">VS</span>
                      <span className="text-white/80 text-xs font-bold text-center flex-1 truncate">
                        {stream.team2 || '—'}
                      </span>
                    </div>
                  )}

                  {/* Scheduled time */}
                  {status === 'upcoming' && stream.scheduled_at && (
                    <div className="flex items-center gap-1.5 text-amber-400/50 text-xs spotab_menuitemcntent_shadulu">
                      <span>📅</span>
                      <span>{new Date(stream.scheduled_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Card footer: action buttons */}
                <div className="px-4 pb-4 flex gap-2">
                  <Link
                    href={`/watch/${stream.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-wide text-white transition-all hover:opacity-90 spotab_menuitemcntent_btnwatch"
                    style={{
                      background: status === 'live'
                        ? 'linear-gradient(135deg, #dc2626, #991b1b)'
                        : 'linear-gradient(135deg, #b45309, #92400e)',
                    }}
                  >
                    {status === 'live' ? (
                      <><span className="animate-pulse">●</span> Watch Live</>
                    ) : (
                      <>▶ View Match</>
                    )}
                  </Link>
                  <a
                    href="https://4498.indno1f.com/?menuId=sports"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-wide text-black transition-all hover:opacity-90 spotab_menuitemcntent_btnbetnow"
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
                  >
                    ⚡ Bet Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
