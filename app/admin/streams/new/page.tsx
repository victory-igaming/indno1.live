"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Adminheader from "@/components/Adminheader";

const SPORTS = [
  { value: "cricket", label: "Cricket", icon: "🏏" },
  { value: "football", label: "Football", icon: "⚽" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "tennis", label: "Tennis", icon: "🎾" },
  { value: "other", label: "Other", icon: "🎯" },
];

export default function NewStream() {
  const router = useRouter();

  const [adminName, setAdminName] = useState("");

  const [form, setForm] = useState({
    title: "",
    sport_type: "cricket",
    source_type: "youtube",
    youtube_url: "",
    obs_stream_url: "http://62.171.169.111:8090/live/stream.m3u8",
    team1: "",
    team2: "",
    scheduled_at: "",
    is_live: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          router.push("/admin/login");
          return;
        }

        setAdminName(d.username);
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          youtube_url: form.source_type === "youtube" ? form.youtube_url : null,
          obs_stream_url:
            form.source_type === "obs" ? form.obs_stream_url : null,
          scheduled_at: form.scheduled_at || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create stream");
        return;
      }

      router.push(`/admin/streams/${data.stream.id}`);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Adminheader adminName={adminName} />

      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4 flex items-center gap-4 sticky top-0 z-50 admndsb_newstrm_heading">
        <Link
          href="/admin"
          className="text-zinc-500 hover:text-white transition-colors text-sm"
        >
          ← Dashboard
        </Link>

        <h1 className="font-black uppercase tracking-widest text-sm">
          New Stream
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 admndsb_newstrm_body">
        <form onSubmit={handleSubmit} className="space-y-6 admndsb_newstrm_from">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5 admndsb_newstrm_frombody">
            <h2 className="font-bold uppercase tracking-widest text-xs text-zinc-500 admndsb_newstrm_body_title">
              Stream Details
            </h2>

            {/* Title */}
            <div className="admndsb_newstrm_fromhdn">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                Title *
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={255}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                placeholder="e.g. India vs Australia - 1st Test"
                suppressHydrationWarning
              />
            </div>

            {/* Sport */}
            <div className="admndsb_newstrm_fromhdn">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                Sport *
              </label>

              <div className="grid grid-cols-5 gap-2">
                {SPORTS.map((s) => (
                  <button
                    title={s.label}
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, sport_type: s.value })}
                    className={`py-2 px-1 rounded-lg text-center text-xs font-bold transition-colors border ${
                      form.sport_type === s.value
                        ? "border-red-500 bg-red-600/20 text-red-400"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500"
                    } admndsb_newstrm_sport`}
                    suppressHydrationWarning
                  >
                    <div className="text-lg mb-1">{s.icon}</div>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stream Source */}
            <div className="admndsb_newstrm_fromhdn">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                Stream Source *
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      source_type: "youtube",
                    })
                  }
                  className={`py-3 rounded-lg text-sm font-bold border transition-colors ${
                    form.source_type === "youtube"
                      ? "border-red-500 bg-red-600/20 text-red-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500"
                  }`}
                  suppressHydrationWarning
                >
                  ▶ YouTube Stream
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      source_type: "obs",
                    })
                  }
                  className={`py-3 rounded-lg text-sm font-bold border transition-colors ${
                    form.source_type === "obs"
                      ? "border-red-500 bg-red-600/20 text-red-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500"
                  }`}
                  suppressHydrationWarning
                >
                  🔴 OBS Live Stream
                </button>
              </div>

              <p className="text-zinc-600 text-xs mt-2">
                Select YouTube for normal YouTube live/video. Select OBS for
                your own RTMP/HLS live broadcast.
              </p>
            </div>

            {/* YouTube URL */}
            {form.source_type === "youtube" && (
              <div className="admndsb_newstrm_fromhdn">
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                  YouTube URL *
                </label>

                <input
                  title="YouTube URL"
                  type="url"
                  value={form.youtube_url}
                  onChange={(e) =>
                    setForm({ ...form, youtube_url: e.target.value })
                  }
                  required={form.source_type === "youtube"}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  suppressHydrationWarning
                />

                <p className="text-zinc-600 text-xs mt-1">
                  Paste the YouTube live stream or video URL.
                </p>
              </div>
            )}

            {/* OBS HLS URL */}
            {form.source_type === "obs" && (
              <div className="admndsb_newstrm_fromhdn">
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                  OBS HLS Stream URL *
                </label>

                <input
                  title="OBS HLS Stream URL"
                  type="url"
                  value={form.obs_stream_url}
                  onChange={(e) =>
                    setForm({ ...form, obs_stream_url: e.target.value })
                  }
                  required={form.source_type === "obs"}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                  placeholder="http://62.171.169.111:8090/live/stream.m3u8"
                  suppressHydrationWarning
                />

                <p className="text-zinc-600 text-xs mt-1">
                  For localhost testing use{" "}
                  <span className="text-zinc-400">
                    http://62.171.169.111:8090/live/stream.m3u8
                  </span>
                  . For production use{" "}
                  <span className="text-zinc-400">
                    https://indno1.live/live/stream.m3u8
                  </span>
                  .
                </p>
              </div>
            )}

            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
              <div className="admndsb_newstrm_fromhdn">
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                  Team 1
                </label>

                <input
                  title="Team 1"
                  type="text"
                  value={form.team1}
                  onChange={(e) => setForm({ ...form, team1: e.target.value })}
                  maxLength={150}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                  placeholder="India"
                  suppressHydrationWarning
                />
              </div>

              <div className="admndsb_newstrm_fromhdn">
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                  Team 2
                </label>

                <input
                  title="Team 2"
                  type="text"
                  value={form.team2}
                  onChange={(e) => setForm({ ...form, team2: e.target.value })}
                  maxLength={150}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                  placeholder="Australia"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="admndsb_newstrm_fromhdn">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">
                Scheduled Date & Time
              </label>

              <input
                title="Date & Time"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) =>
                  setForm({ ...form, scheduled_at: e.target.value })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                suppressHydrationWarning
              />
            </div>

            {/* Go Live */}
            <label className="flex items-center gap-3 cursor-pointer admndsb_newstrm_lable admndsb_newstrm_fromhdn">
              <div
                onClick={() => setForm({ ...form, is_live: !form.is_live })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form.is_live ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.is_live ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </div>

              <span className="text-sm font-bold text-white">
                Go Live Immediately
              </span>
            </label>
          </div>

          <div className="flex gap-3 admndsb_newstrm_fromhdn">
            <Link
              href="/admin"
              className="flex-1 text-center border border-zinc-700 hover:border-zinc-500 text-zinc-400 py-3 rounded-lg text-sm font-bold transition-colors admndsb_newstrm_btnbody"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors admndsb_newstrm_btnbody"
            >
              {saving ? "Creating..." : "Create Stream"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}