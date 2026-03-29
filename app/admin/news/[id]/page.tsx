"use client";

import {
  useState,
  useEffect,
  FormEvent,
  use,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Adminheader from "@/components/Adminheader";

interface NewsForm {
  title: string;
  newsbf: string;
  scheduled_at: string;
  is_live: boolean;
  is_active: boolean;
  ad_active: boolean;
}

export default function EditNews({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminName, setAdminName] = useState("");
  const positionSaveTimers = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});

  const [form, setForm] = useState<NewsForm>({
    title: "", 
    newsbf: "",   
    scheduled_at: "",
    is_live: false,
    is_active: true, 
    ad_active: false, 
  });


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [togglingAd, setTogglingAd] = useState(false);

  useEffect(() => {
   fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push("/admin/login"); return; }
        setAdminName(d.username);        
      })
      .catch(() => router.push("/admin/login"));
    loadData();
  }, [id, router]);

  
  async function loadData() {
  setLoading(true);
  try {
    const res = await fetch(`/api/admin/news/${id}`);

    if (!res.ok) {
      router.push("/admin");
      return;
    }

    const newsData = await res.json();
    console.log("Fetched Data:", newsData);


    // Check if newsData.news exists and has at least one item
    if (newsData.news && newsData.news.length > 0) {

      const item = newsData.news[0]; // This is where your 'test' data lives

        // The log shows newsData IS the object, so set it directly
    setForm({
      title: item.title || "",
      newsbf: item.newsbf || "",
      scheduled_at: item.scheduled_at || "",
      is_live: item.is_live || false,
      is_active: item.is_active || false,
      ad_active: item.ad_active || false,
    });
    
    
    } else {
      setError("News item not found in the database.");
    }
    
  
  } catch (err) {
    setError("Failed to load news data");
  } finally {
    setLoading(false);
  }
}

  async function saveNews(e: FormEvent) {
  e.preventDefault();
  setSaving(true);
  setError("");
  setSuccess("");
  try {
    const res = await fetch(`/api/admin/news/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // Use 'form' instead of 'news'
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      setError(data.error || "Failed to save");
      return;
    }
    
    setSuccess("News updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  } catch (err) {
    setError("Network error occurred");
  } finally {
    setSaving(false);
  }
}

  
  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center text-amber-300/40"
        style={{ background: "linear-gradient(to bottom, #1f0d04, #120602)" }}
      >
        Loading...
      </div>
    );

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(to bottom, #1f0d04, #120602)" }}
    >

        {/* Top bar */}
       <Adminheader adminName={adminName} />

      <div
        className="sticky top-0 z-50 backdrop-blur px-6 py-4 flex items-center gap-4"
        style={{
          background: "rgba(18,6,2,0.85)",
          borderBottom: "1px solid rgba(180,83,9,0.2)",
        }}
      >
        <Link
          href="/admin"
          className="text-amber-400/50 hover:text-amber-400 transition-colors text-sm font-medium admndsb_editstrm_mainheaderLink"
        >
          ← Dashboard
        </Link>
        <div className="w-px h-4 bg-amber-900/40 " />
        <h1 className="font-black uppercase tracking-widest text-sm text-amber-300/80 admndsb_editstrm_mainheader">
          Edit News
        </h1>
        <div className="ml-auto flex gap-3">
          
        </div>
      </div>



      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 admndsb_editstrm_main">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* News Form */}
        <form
          onSubmit={saveNews}
          className="rounded-2xl p-6 space-y-5 admndsb_editstrm_form"
          style={{
            background: "linear-gradient(135deg, #2e1408, #1a0a03)",
            border: "1px solid rgba(180,83,9,0.25)",
          }}
        >
          <h2 className="font-bold uppercase tracking-widest text-xs text-amber-400/60 admndsb_editstrm_formbdy">
            News Details
          </h2>

          
          <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              Title
            </label>
            <input
              title="Title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={255}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(180,83,9,0.3)",
              }}
              suppressHydrationWarning
            />
          </div>

          
          <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              News In Breaf
            </label>
            <input
            title="News In Breaf"
              type="text"
              value={form.newsbf}
              onChange={(e) => setForm({ ...form, newsbf: e.target.value })}
              required
              maxLength={255}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(180,83,9,0.3)",
              }}
              suppressHydrationWarning
            />
          </div>

          
          
          <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              Scheduled Date &amp; Time
            </label>
            <input
              title="Scheduled Date"
              type="datetime-local"
              value={
                form.scheduled_at
                  ? new Date(form.scheduled_at).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setForm({ ...form, scheduled_at: e.target.value })
              }
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(180,83,9,0.3)",
              }}
               suppressHydrationWarning
            />
          </div>


          <div className="flex items-center gap-6">
            {[
              { key: "is_live", label: "Live", color: "bg-red-600" },
             
            ].map(({ key, label, color }) => (
           
               <label
                key={key}
                className="flex items-center gap-3 cursor-pointer admndsb_editstrm_formlable"
              >
                <div
                  onClick={() =>
                    setForm({ ...form, [key]: !(form as any)[key] })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${(form as any)[key] ? color : "bg-amber-950/60"}`}
                  style={{ border: "1px solid rgba(180,83,9,0.3)" }}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${(form as any)[key] ? "translate-x-7" : "translate-x-1"}`}
                  />
                </div>
                <span className="text-sm font-bold text-amber-300/80">
                  {label}
                </span>
              </label>


            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full disabled:opacity-50 text-black py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:opacity-90 admndsb_editstrm_formbtn"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f97316)" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
        
      </div>
    </div>
  );
}
