"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SPORTS = [
  { value: "cricket", label: "Cricket", icon: "🏏" },
  { value: "football", label: "Football", icon: "⚽" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "tennis", label: "Tennis", icon: "🎾" },
  { value: "other", label: "Other", icon: "🎯" },
];

export default function NewStream() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    sport_type: "cricket",
    youtube_url: "",
    team1: "",
    team2: "",
    scheduled_at: "",
    is_live: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (!r.ok) router.push("/admin/login");
    });
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
          scheduled_at: form.scheduled_at || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/admin/streams/${data.stream.id}`);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors text-sm">← Dashboard</Link>
        <h1 className="font-black uppercase tracking-widest text-sm">New Stream</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
            <h2 className="font-bold uppercase tracking-widest text-xs text-zinc-500">Stream Details</h2>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={255}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="e.g. India vs Australia - 1st Test"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Sport *</label>
              <div className="grid grid-cols-5 gap-2">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, sport_type: s.value })}
                    className={`py-2 px-1 rounded-lg text-center text-xs font-bold transition-colors border ${
                      form.sport_type === s.value
                        ? "border-red-500 bg-red-600/20 text-red-400"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    <div className="text-lg mb-1">{s.icon}</div>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">YouTube URL *</label>
              <input
                type="url"
                value={form.youtube_url}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-zinc-600 text-xs mt-1">Paste the YouTube live stream or video URL</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Team 1</label>
                <input
                  type="text"
                  value={form.team1}
                  onChange={(e) => setForm({ ...form, team1: e.target.value })}
                  maxLength={150}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="India"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Team 2</label>
                <input
                  type="text"
                  value={form.team2}
                  onChange={(e) => setForm({ ...form, team2: e.target.value })}
                  maxLength={150}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Australia"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, is_live: !form.is_live })}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.is_live ? "bg-red-600" : "bg-zinc-700"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_live ? "translate-x-7" : "translate-x-1"}`}
                />
              </div>
              <span className="text-sm font-bold text-white">Go Live Immediately</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Link href="/admin" className="flex-1 text-center border border-zinc-700 hover:border-zinc-500 text-zinc-400 py-3 rounded-lg text-sm font-bold transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
            >
              {saving ? "Creating..." : "Create Stream"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
