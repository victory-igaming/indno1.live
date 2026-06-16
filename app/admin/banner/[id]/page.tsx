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

interface BannerForm {
  title: string;
  position: string;
  image_url: string;
  target_url: string;
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

  const [form, setForm] = useState<BannerForm>({
    title: "", 
    position: "", 
    image_url: "", 
    target_url: "", 
    scheduled_at: "",
    is_live: false,
    is_active: true, 
    ad_active: false, 
  });


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [togglingAd, setTogglingAd] = useState(false);

  const [uploadingFile, setUploadingFile] = useState(false);

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
  setError("");

  try {
    const res = await fetch(`/api/admin/banner/${id}`);

    const bnersData = await res.json();
    console.log("Fetched Banner Data:", bnersData);

    if (!res.ok) {
      setError(bnersData.error || "Failed to load banner data");
      return;
    }

    let item = null;

    if (Array.isArray(bnersData.banner)) {
      item = bnersData.banner[0];
    } else if (bnersData.banner) {
      item = bnersData.banner;
    } else {
      item = bnersData;
    }

    if (!item || !item.id) {
      setError("Banner item not found in the database.");
      return;
    }

    setForm({
      title: item.title || "",
      position: item.position || "left",
      image_url: item.image_url || "",
      target_url: item.target_url || "",
      scheduled_at: item.scheduled_at || "",
      is_live: item.is_live ?? false,
      is_active: item.is_active ?? true,
      ad_active: item.ad_active ?? false,
    });
  } catch (err) {
    console.error("Failed to load banner:", err);
    setError("Failed to load banner data");
  } finally {
    setLoading(false);
  }
}

  async function saveBanner(e: FormEvent) {
  e.preventDefault();
  setSaving(true);
  setError("");
  setSuccess("");
  try {
    const res = await fetch(`/api/admin/banner/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // Use 'form' instead of 'news'
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      setError(data.error || "Failed to save");
      return;
    }
    
    setSuccess("Banner updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  } catch (err) {
    setError("Network error occurred");
  } finally {
    setSaving(false);
  }
}


async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    console.log("upimageurl:",url)
    if (url) setForm((f) => ({ ...f, image_url: url }));
  }

async function uploadFile(file: File) {
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return null;
      }
      return data.url as string;
    } catch {
      setError("Upload failed");
      return null;
    } finally {
      setUploadingFile(false);
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
          Edit Banner
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
          onSubmit={saveBanner}
          className="rounded-2xl p-6 space-y-5 admndsb_editstrm_form"
          style={{
            background: "linear-gradient(135deg, #2e1408, #1a0a03)",
            border: "1px solid rgba(180,83,9,0.25)",
          }}
        >

          <input name="position" type="hidden" value={form.position} />

          <h2 className="font-bold uppercase tracking-widest text-xs text-amber-400/60 admndsb_editstrm_formbdy">
            Banner Details
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

          {/* Upload or URL */}
            <div>
              <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
                Media (Image / GIF )
              </label>
              <div className="flex gap-2 admndsb_editstrm_formbdy">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="shrink-0 disabled:opacity-50 text-amber-300/80 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 hover:text-white admndsb_editstrm_formbtn2"
                  style={{
                    background: "rgba(180,83,9,0.2)",
                    border: "1px solid rgba(180,83,9,0.3)",
                  }}
                >
                  {uploadingFile ? "Uploading..." : "⬆ Upload"}
                </button>
                <input
                  type="text"
                  value={form.image_url}                 
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="or paste URL..."
                  className="flex-1 rounded-lg px-3 py-2 text-white text-sm focus:outline-none placeholder-amber-300/20 admndsb_editstrm_forminput"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(180,83,9,0.25)",
                  }}
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm"
                className="hidden admndsb_editstrm_forminput"
                onChange={handleFileChange}
              />
              
            </div>

            <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              Target Url
            </label>
            <input
              title="target_url"
              type="text"
              value={form.target_url}
              onChange={(e) => setForm({ ...form, target_url: e.target.value })}              
              maxLength={255}
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
