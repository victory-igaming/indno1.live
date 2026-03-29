"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Adminheader from "@/components/Adminheader";

interface Stream {
  id: number;
  title: string;
  sport_type: string;
  youtube_url: string;
  team1?: string;
  team2?: string;
  scheduled_at?: string;
  is_live: boolean;
  is_active: boolean;
  created_at: string;
}


interface News {
  id: number;
  title: string;
  newsbf: string; 
  scheduled_at?: string;
  is_live: boolean;
  is_active: boolean;
  created_at: string;
}


interface Banners {
  id: number;
  title: string;
  image_url: string;  
  scheduled_at?: string;
  is_live: boolean;
  is_active: boolean;
  created_at: string;
}

const SPORT_ICONS: Record<string, string> = {
  cricket: "🏏",
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  other: "🎯",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [news, setNews] = useState<News[]>([]);
  
  const [banners, setBanners] = useState<Banners[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push("/admin/login"); return; }
        setAdminName(d.username);
        loadStreams();
        loadNews();
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  async function loadStreams() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/streams");
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStreams(data.streams);
    } catch {
      setError("Failed to load streams");
    } finally {
      setLoading(false);
    }
  }


  async function loadNews() {
    setLoading(true);
    try {
      // Note: Ensure your API route is now at /api/admin/news 
      // to match your new database table logic.
      const res = await fetch("/api/admin/news");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch news");
        return;
      }

      // Updated to match the array returned by your GET API
      setNews(data.news); 
    } catch (err) {
      setError("Failed to load news");
      console.error("News Load Error:", err);
    } finally {
      setLoading(false);
    }
}

  async function toggleLive(stream: Stream) {
    setTogglingId(stream.id);
    try {
      const res = await fetch(`/api/admin/streams/${stream.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_live: !stream.is_live }),
      });
      if (res.ok) {
        setStreams((prev) =>
          prev.map((s) => (s.id === stream.id ? { ...s, is_live: !s.is_live } : s))
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteStream(id: number) {
    if (!confirm("Delete this stream? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/streams/${id}`, { method: "DELETE" });
      setStreams((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  }


    async function deleteNews(id: number) {
    if (!confirm("Delete this stream? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      setStreams((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const totalLive = streams.filter((s) => s.is_live).length;
  const totalActive = streams.filter((s) => s.is_active).length;
  const totalSports = new Set(streams.map((s) => s.sport_type)).size;
  const totalNews = news.length;
 

  return (
    <div className="min-h-screen text-white admndsb_continaer" style={{ background: "linear-gradient(160deg, #080402 0%, #0d0602 100%)" }}>

      {/* Top bar */}
     <Adminheader adminName={adminName} />

      <div className="max-w-8xl mx-auto px-4 py-6 space-y-6">

        {/* Stats row */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-6">
          {[
            { label: "Total Streams", value: streams.length, icon: "📺", color: "from-blue-900/30 to-blue-900/10", border: "border-blue-800/30" },
            { label: "Live Now", value: totalLive, icon: "🔴", color: "from-red-900/30 to-red-900/10", border: "border-red-800/30", pulse: totalLive > 0 },
            { label: "Active", value: totalActive, icon: "✅", color: "from-green-900/30 to-green-900/10", border: "border-green-800/30" },
            { label: "Sports", value: totalSports, icon: "🏆", color: "from-amber-900/30 to-amber-900/10", border: "border-amber-800/30" },
           { label: "News", value: totalNews, icon: "🆕", color: "from-amber-900/30 to-amber-900/10", border: "border-amber-800/30" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-xl border-2 p-4 ${stat.border} flex flex-col items-center justify-center text-center admndsb_body_card`}
              style={{ background: `linear-gradient(135deg, ${stat.color.replace("from-", "").replace(" to-", ", ")})` }}
            >
              <div className="flex items-start justify-between admndsb_body_cardbox">
                <div>
                  <div className="text-2xl font-black text-white admndsb_body_card_count">{stat.value}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-widest mt-0.5 admndsb_body_card_title">{stat.label}</div>
                </div>
                <span className={`text-xl ${stat.pulse ? "animate-pulse" : ""} admndsb_body_card_icon`}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          

          {/* Left side Menu */}
        <div className="lg:col-span-8 space-y-6">        

        

        {/* Streams panel */}
        <div>
          <div className="flex items-center justify-between mb-3 admndsb_body_strmcontainer">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #f59e0b, #c2410c)" }} />
              <h2 className="font-black text-base uppercase tracking-widest">Streams</h2>
              {totalLive > 0 && (
                <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-black uppercase px-2 py-0.5 rounded-full animate-pulse admndsb_body_strmbody_live">
                  ● {totalLive} Live
                </span>
              )}
            </div>
            <Link
              href="/admin/streams/new"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-xl transition-all admndsb_body_strmbody_live"
              style={{
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "white",
                boxShadow: "0 2px 12px rgba(220,38,38,0.3)",
              }}
            >
              + New Stream
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse border border-zinc-800"
                  style={{ background: "linear-gradient(135deg, #141414, #0f0f0f)" }} />
              ))}
            </div>
          ) : streams.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl border-2 border-dashed"
              style={{ borderColor: "rgba(180,83,9,0.2)", background: "rgba(180,83,9,0.03)" }}
            >
              <div className="text-4xl mb-3">📡</div>
              <p className="font-bold text-zinc-400">No streams yet</p>
              <p className="text-zinc-600 text-sm mt-1">Create your first stream to get started</p>
              <Link
                href="/admin/streams/new"
                className="mt-4 inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm font-bold transition-colors"
              >
                + Create your first stream
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  className="rounded-xl border transition-all duration-200 admndsb_body_strmbody"
                  style={{
                    background: stream.is_live
                      ? "linear-gradient(135deg, #1f0707, #170404)"
                      : "linear-gradient(135deg, #111111, #0d0d0d)",
                    borderColor: stream.is_live ? "rgba(220,38,38,0.4)" : "rgba(60,60,60,0.6)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                    {/* Stream info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-base">{SPORT_ICONS[stream.sport_type] || "🎯"}</span>
                        <span className="font-bold text-white text-sm truncate max-w-[200px] sm:max-w-xs admndsb_body_strmbody_heading">
                          {stream.title}
                        </span>
                        {stream.is_live && (
                          <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-black uppercase px-2 py-0.5 rounded-full animate-pulse admndsb_body_strmbody_live">
                            ● LIVE
                          </span>
                        )}
                        {!stream.is_active && (
                          <span className="bg-zinc-700/60 text-zinc-400 text-xs font-bold uppercase px-2 py-0.5 rounded-full border border-zinc-700 admndsb_body_strmbody_live">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-500 text-xs truncate max-w-xs admndsb_body_strmbody_url">{stream.youtube_url}</div>
                      {(stream.team1 || stream.team2) && (
                        <div className="text-zinc-400 text-xs mt-1 flex items-center gap-1.5 admndsb_body_strmbody_title">
                          <span>{stream.team1}</span>
                          {stream.team1 && stream.team2 && <span className="text-amber-600/50 font-bold">vs</span>}
                          <span>{stream.team2}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <Link
                        href={`/watch/${stream.id}`}
                        target="_blank"
                        className="text-xs border border-zinc-700/60 hover:border-amber-700/50 text-zinc-400 hover:text-amber-400 px-3 py-1.5 rounded-lg transition-all admndsb_body_strmbody_btnbody"
                      >
                        Watch 👁️
                      </Link>
                      <Link
                        href={`/admin/streams/${stream.id}`}
                        className="text-xs border border-zinc-700/60 hover:border-amber-700/50 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-all admndsb_body_strmbody_btnbody"
                      >
                        Edit 🛠️
                      </Link>
                      <button
                        onClick={() => toggleLive(stream)}
                        disabled={togglingId === stream.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 ${
                          stream.is_live
                            ? "bg-red-600/15 border border-red-600/50 text-red-400 hover:bg-red-600/25"
                            : "bg-green-600/15 border border-green-600/50 text-green-400 hover:bg-green-600/25"
                        } admndsb_body_strmbody_btnbody`}
                      >
                        {togglingId === stream.id ? "…" : stream.is_live ? "Stop Live" : "Go Live"} 🖥️
                      </button>
                      <button
                        onClick={() => deleteStream(stream.id)}
                        disabled={deletingId === stream.id}
                        className="text-xs border border-zinc-800 hover:border-red-900/50 text-zinc-600 hover:text-red-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 admndsb_body_strmbody_btnbody"
                      >
                        {deletingId === stream.id ? "…" : "Delete"} 🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        

          
        </div>

          
        </div>


           {/* Right side Menu */}
        <div className="lg:col-span-4 space-y-6">
              <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

                  
                  
                   {/* Banners panel */}
                  <div>
                    <div className="flex items-center justify-between mb-3 admndsb_body_strmcontainer">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #f59e0b, #c2410c)" }} />
                        <h2 className="font-black text-base uppercase tracking-widest">Side Banners</h2>

                        
                        </div>


                        
                      </div>
                   </div>
                  
                  
                   {/* News panel */}
                  <div>
                    <div className="flex items-center justify-between mb-3 admndsb_body_strmcontainer">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #f59e0b, #c2410c)" }} />
                        <h2 className="font-black text-base uppercase tracking-widest">News</h2>                     
                        
                        </div>
                        <Link
              href="/admin/news/new"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-xl transition-all admndsb_body_strmbody_live"
              style={{
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "white",
                boxShadow: "0 2px 12px rgba(220,38,38,0.3)",
              }}
            >
              + New News
            </Link>
                      </div>


                       {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse border border-zinc-800"
                  style={{ background: "linear-gradient(135deg, #141414, #0f0f0f)" }} />
              ))}
            </div>
          ) : streams.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl border-2 border-dashed"
              style={{ borderColor: "rgba(180,83,9,0.2)", background: "rgba(180,83,9,0.03)" }}
            >
              </div>
               ) : (
                <div className="space-y-2.5">
                   {news.map((newses) => (
                    <div
                  key={newses.id}
                  className="rounded-xl border transition-all duration-200 admndsb_body_strmbody"
                  style={{
                    background: newses.is_live
                      ? "linear-gradient(135deg, #1f0707, #170404)"
                      : "linear-gradient(135deg, #111111, #0d0d0d)",
                    borderColor: newses.is_live ? "rgba(220,38,38,0.4)" : "rgba(60,60,60,0.6)",
                  }} >
 <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
{/* News info */}
<div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">


                        <span className="font-bold text-white text-sm truncate max-w-[200px] sm:max-w-xs admndsb_body_strmbody_heading">
                          {newses.title}
                        </span>
                        
                         {newses.is_live && (
                          <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-black uppercase px-2 py-0.5 rounded-full animate-pulse admndsb_body_strmbody_live">
                            ● LIVE
                          </span>
                        )}
                         
                        {/* Actions */}
                         <div className="flex items-center gap-2 flex-wrap shrink-0">

                           <Link
                        href={`/admin/news/${newses.id}`}
                        className="text-xs border border-zinc-700/60 hover:border-amber-700/50 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-all admndsb_body_strmbody_btnbody"
                      >
                        Edit 🛠️
                      </Link>


                      <button
                        onClick={() => deleteNews(newses.id)}
                        disabled={deletingId === newses.id}
                        className="text-xs border border-zinc-800 hover:border-red-900/50 text-zinc-600 hover:text-red-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 admndsb_body_strmbody_btnbody"
                      >
                        {deletingId === newses.id ? "…" : "Delete"} 🗑️
                      </button>

                          </div>


                        </div>  

                        </div>  
  </div>
                  
                </div>
                ))}
                  
                </div>
                )}

                   </div>



                 

                       
               </div>

        </div>

        </div>

        
      </div>

      {/* Footer hint */}
        <p className="text-center text-zinc-700 text-xs pb-4">
          Broadcast Control Panel · IndNO1 Admin · {new Date().getFullYear()}
        </p>
    </div>
  );
}
