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

export default function NewNews() {
  const router = useRouter();
   const [adminName, setAdminName] = useState("");


     useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push("/admin/login"); return; }
        setAdminName(d.username);        
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);


  const [form, setForm] = useState({
    title: "", 
    newsbf: "",   
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
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          scheduled_at: form.scheduled_at || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/admin/news/${data.id}`);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
     
      {/* Top bar */}
          <Adminheader adminName={adminName} />

      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4 flex items-center gap-4 sticky top-0 z-50 admndsb_newstrm_heading">
        <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors text-sm">← Dashboard</Link>
        <h1 className="font-black uppercase tracking-widest text-sm">New News</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 admndsb_newstrm_body">
        <form onSubmit={handleSubmit} className="space-y-6 admndsb_newstrm_from">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5 admndsb_newstrm_frombody">
            <h2 className="font-bold uppercase tracking-widest text-xs text-zinc-500 admndsb_newstrm_body_title">Stream Details</h2>

            <div className="admndsb_newstrm_fromhdn">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">Title *</label>
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

           

            <div className="admndsb_newstrm_fromhdn">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">News In Breaf *</label>
              <input
                title="News In Breaf"
                type="text"
                value={form.newsbf}
                onChange={(e) => setForm({ ...form, newsbf: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                placeholder="Hot News"
                suppressHydrationWarning
              />
              <p className="text-zinc-600 text-xs mt-1"> News Line Text</p>
            </div>           

            <div className="admndsb_newstrm_fromhdn">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 admndsb_newstrm_lable">Scheduled Date & Time</label>
              <input
                title="Date & Time"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors admndsb_newstrm_input"
                suppressHydrationWarning
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer admndsb_newstrm_lable admndsb_newstrm_fromhdn">
              <div
                onClick={() => setForm({ ...form, is_live: !form.is_live })}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.is_live ? "bg-red-600" : "bg-zinc-700"} `}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_live ? "translate-x-7" : "translate-x-1"} `}
                />
              </div>
              <span className="text-sm font-bold text-white">Go Live</span>
            </label>
          </div>

          <div className="flex gap-3 admndsb_newstrm_fromhdn">
            <Link href="/admin" className="flex-1 text-center border border-zinc-700 hover:border-zinc-500 text-zinc-400 py-3 rounded-lg text-sm font-bold transition-colors admndsb_newstrm_btnbody">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors admndsb_newstrm_btnbody"
            >
              {saving ? "Creating..." : "Create News"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
