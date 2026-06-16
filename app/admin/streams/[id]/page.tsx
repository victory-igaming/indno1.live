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
import DraggableOverlayEditor from "@/components/DraggableOverlayEditor";
import Adminheader from "@/components/Adminheader";

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
  display_order: number;
}

interface Stream {
  id: number;
  title: string;
  sport_type: string;
  source_type: "youtube" | "obs";
  youtube_url?: string | null;
  obs_stream_url?: string | null;
  team1?: string;
  team2?: string;
  scheduled_at?: string;
  is_live: boolean;
  is_active: boolean;
  ad_active: boolean;
  active_overlay_id?: number | null;
}

const SPORTS = ["cricket", "football", "basketball", "tennis", "other"];
const OVERLAY_TYPES = ["logo", "ad", "banner"];

// const DEFAULT_OBS_URL = "http://localhost:8090/hls/demo123.m3u8";
const DEFAULT_OBS_URL = "https://hls.indno1.live/hls/live123.m3u8";
 
const DEFAULT_YOUTUBE_URL = "https://www.youtube.com/watch?v=RCw7y0z6eRY";

export default function EditStream({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [stream, setStream] = useState<Stream | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switchingSource, setSwitchingSource] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminName, setAdminName] = useState("");
  const positionSaveTimers = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});

  const [overlayForm, setOverlayForm] = useState({
    type: "logo",
    image_url: "",
    pos_x: 5,
    pos_y: 5,
    width: 140,
    height: 70,
    opacity: 0.95,
    ad_duration: 30,
  });
  const [addingOverlay, setAddingOverlay] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
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
      const [streamRes, overlaysRes] = await Promise.all([
        fetch(`/api/streams/${id}`),
        fetch(`/api/admin/streams/${id}/overlays`),
      ]);
      if (!streamRes.ok) {
        router.push("/admin");
        return;
      }
      const streamData = await streamRes.json();
      setStream({
        ...streamData.stream,
        source_type: streamData.stream?.source_type || "youtube",
        youtube_url: streamData.stream?.youtube_url || DEFAULT_YOUTUBE_URL,
        obs_stream_url:
          streamData.stream?.obs_stream_url ||
          DEFAULT_OBS_URL,
      });

      if (overlaysRes.ok) {
        const overlaysData = await overlaysRes.json();
        setOverlays(
          (overlaysData.overlays || []).map((o: any) => ({
            ...o,
            pos_x: Number(o.pos_x),
            pos_y: Number(o.pos_y),
            width: Number(o.width),
            height: Number(o.height),
            opacity: Number(o.opacity),
            ad_duration: Number(o.ad_duration),
            display_order: Number(o.display_order),
            is_active: Boolean(o.is_active),
          })),
        );
      }
    } catch {
      setError("Failed to load stream");
    } finally {
      setLoading(false);
    }
  }

  async function updateStreamSource(nextSourceType: "youtube" | "obs") {
  if (!stream) return;

  setSwitchingSource(true);
  setError("");
  setSuccess("");

  const nextYoutubeUrl =
    nextSourceType === "youtube"
      ? stream.youtube_url || DEFAULT_YOUTUBE_URL
      : null;

  const nextObsStreamUrl =
    nextSourceType === "obs"
      ? stream.obs_stream_url || DEFAULT_OBS_URL
      : null;

  const nextStream = {
    ...stream,
    source_type: nextSourceType,
    youtube_url: nextYoutubeUrl,
    obs_stream_url: nextObsStreamUrl,
  };

  // Update UI immediately
  setStream(nextStream);

  try {
    const res = await fetch(`/api/admin/streams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nextStream.title,
        sport_type: nextStream.sport_type,
        source_type: nextSourceType,
        youtube_url: nextYoutubeUrl,
        obs_stream_url: nextObsStreamUrl,
        team1: nextStream.team1 || null,
        team2: nextStream.team2 || null,
        scheduled_at: nextStream.scheduled_at || null,
        is_live: Boolean(nextStream.is_live),
        is_active: nextStream.is_active !== false,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to update stream source");
      return;
    }

    setStream({
      ...data.stream,
      source_type: data.stream.source_type || "youtube",
      youtube_url: data.stream.youtube_url || DEFAULT_YOUTUBE_URL,
      obs_stream_url:
        data.stream.obs_stream_url || DEFAULT_OBS_URL,
    });

    setSuccess(
      nextSourceType === "youtube"
        ? "Switched to YouTube stream"
        : "Switched to OBS live stream",
    );

    setTimeout(() => setSuccess(""), 2000);
  } catch {
    setError("Network error while switching stream source");
  } finally {
    setSwitchingSource(false);
  }
}

  async function saveStream(e: FormEvent) {
  e.preventDefault();

  if (!stream) return;

  setSaving(true);
  setError("");
  setSuccess("");

  const finalSourceType =
    stream.source_type === "obs" || stream.source_type === "youtube"
      ? stream.source_type
      : "youtube";

  const payload = {
    title: stream.title,
    sport_type: stream.sport_type,
    source_type: finalSourceType,

    youtube_url:
      finalSourceType === "youtube"
        ? stream.youtube_url || DEFAULT_YOUTUBE_URL
        : null,

    obs_stream_url:
      finalSourceType === "obs"
        ? stream.obs_stream_url || DEFAULT_OBS_URL
        : null,

    team1: stream.team1 || null,
    team2: stream.team2 || null,
    scheduled_at: stream.scheduled_at || null,
    is_live: Boolean(stream.is_live),
    is_active: stream.is_active !== false,
  };

  console.log("SAVE STREAM PAYLOAD:", payload);

  try {
    const res = await fetch(`/api/admin/streams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save stream");
      return;
    }

    setStream({
      ...data.stream,
      source_type: data.stream.source_type || "youtube",
      youtube_url: data.stream.youtube_url || DEFAULT_YOUTUBE_URL,
      obs_stream_url:
        data.stream.obs_stream_url || DEFAULT_OBS_URL,
    });

    setSuccess("Saved!");
    setTimeout(() => setSuccess(""), 2000);
  } catch {
    setError("Network error");
  } finally {
    setSaving(false);
  }
}


  function formatNumber(value: unknown, fallback = "0") {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(0) : fallback;
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setOverlayForm((f) => ({ ...f, image_url: url }));
  }

  async function addOverlay(e: FormEvent) {
    e.preventDefault();
    if (!overlayForm.image_url) {
      setError("Please provide an image URL or upload a file");
      return;
    }
    setAddingOverlay(true);
    setError("");
    try {
      const res = await fetch("/api/admin/overlays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stream_id: id, ...overlayForm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setOverlays((prev) => [...prev, data.overlay]);
      setOverlayForm({
        type: "logo",
        image_url: "",
        pos_x: 5,
        pos_y: 5,
        width: 140,
        height: 70,
        opacity: 0.95,
        ad_duration: 30,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("Network error");
    } finally {
      setAddingOverlay(false);
    }
  }

  const handlePositionChange = useCallback(
    (overlayId: number, pos_x: number, pos_y: number) => {
      setOverlays((prev) =>
        prev.map((o) => (o.id === overlayId ? { ...o, pos_x, pos_y } : o)),
      );
      if (positionSaveTimers.current[overlayId])
        clearTimeout(positionSaveTimers.current[overlayId]);
      positionSaveTimers.current[overlayId] = setTimeout(async () => {
        await fetch(`/api/admin/overlays/${overlayId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pos_x, pos_y }),
        });
      }, 300);
    },
    [],
  );

  const handleSizeChange = useCallback(
    (overlayId: number, width: number, height: number) => {
      setOverlays((prev) =>
        prev.map((o) => (o.id === overlayId ? { ...o, width, height } : o)),
      );
      if (positionSaveTimers.current[overlayId])
        clearTimeout(positionSaveTimers.current[overlayId]);
      positionSaveTimers.current[overlayId] = setTimeout(async () => {
        await fetch(`/api/admin/overlays/${overlayId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ width, height }),
        });
      }, 300);
    },
    [],
  );

  async function deleteOverlay(overlayId: number) {
    if (!confirm("Delete this overlay?")) return;
    if (stream?.active_overlay_id === overlayId) {
      await toggleAd(false, null);
    }
    await fetch(`/api/admin/overlays/${overlayId}`, { method: "DELETE" });
    setOverlays((prev) => prev.filter((o) => o.id !== overlayId));
  }

  async function toggleOverlayActive(overlay: Overlay) {
    const res = await fetch(`/api/admin/overlays/${overlay.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !overlay.is_active }),
    });
    if (res.ok)
      setOverlays((prev) =>
        prev.map((o) =>
          o.id === overlay.id ? { ...o, is_active: !o.is_active } : o,
        ),
      );
  }

  async function toggleAd(active: boolean, overlayId: number | null) {
    if (!stream) return;
    setTogglingAd(true);
    try {
      const res = await fetch(`/api/admin/streams/${id}/ad`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_active: active,
          active_overlay_id: overlayId,
        }),
      });
      const data = await res.json();
      if (res.ok)
        setStream((s) =>
          s
            ? {
                ...s,
                ad_active: data.stream.ad_active,
                active_overlay_id: data.stream.active_overlay_id,
              }
            : s,
        );
    } finally {
      setTogglingAd(false);
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
  if (!stream) return null;

  const adOverlays = overlays.filter((o) => o.type === "ad" && o.is_active);
  const activeAdOverlay = overlays.find(
    (o) => o.id === stream.active_overlay_id,
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
          Edit Stream
        </h1>
        <div className="ml-auto flex gap-3">
          <Link
            href={`/watch/${id}`}
            target="_blank"
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-amber-400/70 hover:text-amber-300 admndsb_editstrm_mainheaderLink"
            style={{
              border: "1px solid rgba(180,83,9,0.3)",
              background: "rgba(180,83,9,0.08)",
            }}
          >
            Watch ↗
          </Link>
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

        {/* Stream Form */}
        <form
          onSubmit={saveStream}
          className="rounded-2xl p-6 space-y-5 admndsb_editstrm_form"
          style={{
            background: "linear-gradient(135deg, #2e1408, #1a0a03)",
            border: "1px solid rgba(180,83,9,0.25)",
          }}
        >
          <h2 className="font-bold uppercase tracking-widest text-xs text-amber-400/60 admndsb_editstrm_formbdy">
            Stream Details
          </h2>
          <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              Title
            </label>
            <input
              title="Title"
              type="text"
              value={stream.title}
              onChange={(e) => setStream({ ...stream, title: e.target.value })}
              required
              maxLength={255}
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(180,83,9,0.3)",
              }}
            />
          </div>
          <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              Sport
            </label>
            <div className="flex gap-2 flex-wrap">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStream({ ...stream, sport_type: s })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                    stream.sport_type === s
                      ? "text-white"
                      : "text-amber-300/50 hover:text-amber-300"
                  } admndsb_editstrm_forminput`}
                  style={{
                    background:
                      stream.sport_type === s
                        ? "linear-gradient(135deg, #b45309, #c2410c)"
                        : "rgba(180,83,9,0.1)",
                    border:
                      stream.sport_type === s
                        ? "1px solid rgba(245,158,11,0.4)"
                        : "1px solid rgba(180,83,9,0.2)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              Stream Source
            </label>

            <div className="grid grid-cols-2 gap-3">
             <button
  type="button"
  onClick={() =>
    setStream({
      ...stream,
      source_type: "youtube",
      youtube_url:
        stream.youtube_url || DEFAULT_YOUTUBE_URL,
      obs_stream_url: null,
    })
  }
  className={`py-3 rounded-lg text-sm font-bold border transition-colors ${
    stream.source_type === "youtube"
      ? "border-red-500 bg-red-600/20 text-red-400"
      : "border-amber-900/30 bg-black/20 text-amber-300/50 hover:border-amber-700/50"
  } admndsb_editstrm_forminput`}
>
  ▶ YouTube Stream
</button>

             <button
  type="button"
  onClick={() =>
    setStream({
      ...stream,
      source_type: "obs",
      youtube_url: null,
      obs_stream_url:
        stream.obs_stream_url || DEFAULT_OBS_URL,
    })
  }
  className={`py-3 rounded-lg text-sm font-bold border transition-colors ${
    stream.source_type === "obs"
      ? "border-red-500 bg-red-600/20 text-red-400"
      : "border-amber-900/30 bg-black/20 text-amber-300/50 hover:border-amber-700/50"
  } admndsb_editstrm_forminput`}
>
  🔴 OBS Live Stream
</button>
            </div>

            <p className="text-amber-300/30 text-xs mt-2">
              YouTube uses a normal YouTube URL. OBS uses your HLS .m3u8 stream URL.
            </p>
          </div>

          {stream.source_type === "youtube" && (
            <div className="admndsb_editstrm_formbdy">
              <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
                YouTube URL
              </label>
              <input
                title="YouTube URL"
                type="url"
                value={stream.youtube_url || ""}
                onChange={(e) =>
                  setStream({ ...stream, youtube_url: e.target.value })
                }
                required={stream.source_type === "youtube"}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(180,83,9,0.3)",
                }}
              />
            </div>
          )}

          {stream.source_type === "obs" && (
            <div className="admndsb_editstrm_formbdy">
              <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
                OBS HLS Stream URL
              </label>
              <input
                title="OBS HLS Stream URL"
                type="url"
                value={stream.obs_stream_url || ""}
                onChange={(e) =>
                  setStream({ ...stream, obs_stream_url: e.target.value })
                }
                required={stream.source_type === "obs"}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                placeholder={DEFAULT_OBS_URL}
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(180,83,9,0.3)",
                }}
              />
              <p className="text-amber-300/30 text-xs mt-1">
                Local test URL: {DEFAULT_OBS_URL}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="admndsb_editstrm_formbdy">
              <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
                Team 1
              </label>
              <input
                title="Team 1"
                type="text"
                value={stream.team1 || ""}
                onChange={(e) =>
                  setStream({ ...stream, team1: e.target.value })
                }
                maxLength={150}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(180,83,9,0.3)",
                }}
              />
            </div>
            <div className="admndsb_editstrm_formbdy">
              <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
                Team 2
              </label>
              <input
                title="Team 2"
                type="text"
                value={stream.team2 || ""}
                onChange={(e) =>
                  setStream({ ...stream, team2: e.target.value })
                }
                maxLength={150}
                className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(180,83,9,0.3)",
                }}
              />
            </div>
          </div>
          <div className="admndsb_editstrm_formbdy">
            <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
              Scheduled Date &amp; Time
            </label>
            <input
            title="Scheduled Date"
              type="datetime-local"
              value={
                stream.scheduled_at
                  ? new Date(stream.scheduled_at).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setStream({ ...stream, scheduled_at: e.target.value })
              }
              className="w-full rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(180,83,9,0.3)",
              }}
            />
          </div>
          <div className="flex items-center gap-6">
            {[
              { key: "is_live", label: "Live", color: "bg-red-600" },
              { key: "is_active", label: "Active", color: "bg-green-600" },
            ].map(({ key, label, color }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer admndsb_editstrm_formlable"
              >
                <div
                  onClick={() =>
                    setStream({ ...stream, [key]: !(stream as any)[key] })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${(stream as any)[key] ? color : "bg-amber-950/60"}`}
                  style={{ border: "1px solid rgba(180,83,9,0.3)" }}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${(stream as any)[key] ? "translate-x-7" : "translate-x-1"}`}
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

        {/* Ad Control Panel */}
        <div
          className={`rounded-2xl p-6 space-y-4 transition-colors ${stream.ad_active ? "border-orange-600/50" : ""}admndsb_editstrm_adctrbody`}
          style={{
            background: stream.ad_active
              ? "linear-gradient(135deg, #3d1a02, #2a1005)"
              : "linear-gradient(135deg, #2e1408, #1a0a03)",
            border: stream.ad_active
              ? "1px solid rgba(249,115,22,0.4)"
              : "1px solid rgba(180,83,9,0.25)",
          }}
        >
          <div className="flex items-center justify-between ">
            <div>
              <h2 className="font-bold uppercase tracking-widest text-xs text-amber-400/60 admndsb_editstrm_adctrbody_title">
                Ad Control
              </h2>
              {stream.ad_active && activeAdOverlay && (
                <p className="text-orange-400 text-xs mt-1 ">
                  🔴 Ad is live on all viewer screens
                </p>
              )}
            </div>
            {stream.ad_active && (
              <button
                onClick={() => toggleAd(false, null)}
                disabled={togglingAd}
                className="text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 admndsb_editstrm_formbtn2"
                style={{
                  background: "rgba(180,83,9,0.2)",
                  border: "1px solid rgba(180,83,9,0.4)",
                }}
              >
                ⏹ Stop Ad
              </button>
            )}
          </div>

          {adOverlays.length === 0 ? (
            <p className="text-amber-300/30 text-sm admndsb_editstrm_adctrbody_moto">
              Add an ad overlay below to enable ad controls.
            </p>
          ) : (
            <div className="grid gap-2">
              {adOverlays.map((ad) => {
                const isActive =
                  stream.active_overlay_id === ad.id && stream.ad_active;
                return (
                  <div
                    key={ad.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isActive ? "border-orange-500/60 bg-orange-500/10" : ""}`}
                    style={
                      !isActive
                        ? {
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(180,83,9,0.2)",
                          }
                        : {}
                    }
                  >
                    <div className="w-16 h-10 bg-zinc-700 rounded overflow-hidden shrink-0">
                      {ad.image_url.match(/\.(mp4|webm)/i) ? (
                        <video
                          src={ad.image_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={ad.image_url}
                          alt="Ad"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-zinc-400 truncate">
                        {ad.image_url.split("/").pop()}
                      </div>
                      <div className="text-xs text-zinc-600">
                        {ad.ad_duration}s loop · {ad.width}×{ad.height}px
                      </div>
                    </div>
                    {isActive ? (
                      <div className="flex items-center gap-1 text-orange-400 text-xs font-bold">
                        <span className="animate-pulse">●</span> ON AIR
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAd(true, ad.id)}
                        disabled={togglingAd}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 admndsb_editstrm_formbtn2"
                      >
                        ▶ Start Ad
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drag-and-drop Overlay Editor */}
        <div
          className="rounded-2xl p-6 space-y-4 admndsb_editstrm_adctrbody"
          style={{
            background: "linear-gradient(135deg, #2e1408, #1a0a03)",
            border: "1px solid rgba(180,83,9,0.25)",
          }}
        >
          <h2 className="font-bold uppercase tracking-widest text-xs text-amber-400/60 admndsb_editstrm_adctrbody_title ">
            Overlay Editor
          </h2>
         <DraggableOverlayEditor
  overlays={overlays}
  onPositionChange={handlePositionChange}
  onSizeChange={handleSizeChange}
  activeAdId={stream.active_overlay_id || null}
  sourceType={stream.source_type || "youtube"}
  youtubeUrl={stream.youtube_url || ""}
  obsStreamUrl={stream.obs_stream_url || ""}
/>

          {/* Overlay list */}
          {overlays.length > 0 && (
            <div className="space-y-2 mt-2 ">
              {overlays.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl transition-colors"
                  style={{
                    background: o.is_active
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(0,0,0,0.15)",
                    border: o.is_active
                      ? "1px solid rgba(180,83,9,0.3)"
                      : "1px solid rgba(180,83,9,0.15)",
                    opacity: o.is_active ? 1 : 0.6,
                  }}
                >
                  <div className="flex items-center gap-3 p-3 admndsb_editstrm_formbdy">
                    <div
                      className="w-12 h-8 rounded overflow-hidden shrink-0"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      {o.image_url.match(/\.(mp4|webm)/i) ? (
                        <video
                          src={o.image_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={o.image_url}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap admndsb_editstrm_formbdy">
                        <span
                          className={`text-xs font-black uppercase px-2 py-0.5 rounded ${o.type === "ad" ? "bg-orange-600/20 text-orange-400" : o.type === "logo" ? "bg-blue-600/20 text-blue-400" : "bg-purple-600/20 text-purple-400"}`}
                        >
                          {o.type}
                        </span>
                        {!o.is_active && (
                          <span className="text-xs text-amber-900/60 uppercase font-bold">
                            hidden
                          </span>
                        )}
                        <span className="text-xs text-amber-300/40">
                          {formatNumber(o.pos_x)}%, {formatNumber(o.pos_y)}%
                        </span>
                        <span className="text-xs text-amber-300/30">
                          {o.width}×{o.height}px
                        </span>
                      </div>
                      <div className="text-xs text-amber-300/25 truncate mt-0.5">
                        {o.image_url.split("/").pop()}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleOverlayActive(o)}
                      className={`shrink-0 text-xs px-2 py-1 rounded border transition-colors font-bold ${o.is_active ? "border-amber-800/40 text-amber-300/50 hover:border-red-600 hover:text-red-400" : "border-green-700/60 text-green-500 hover:border-green-500"} admndsb_editstrm_formbtn2`}
                    >
                      {o.is_active ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => deleteOverlay(o.id)}
                      className="shrink-0 text-xs px-2 py-1 rounded border border-red-900/30 text-red-500/40 hover:border-red-700 hover:text-red-400 transition-colors admndsb_editstrm_formbtn2"
                    >
                      Del
                    </button>
                  </div>
                  {/* Opacity slider */}
                  <div className="px-3 pb-3 flex items-center gap-3 admndsb_editstrm_formbdy">
                    <span className="text-xs text-amber-300/30 w-14 shrink-0">
                      Opacity
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={o.opacity}
                      onChange={(e) => {
                        const newOpacity = parseFloat(e.target.value);
                        setOverlays((prev) =>
                          prev.map((ov) =>
                            ov.id === o.id
                              ? { ...ov, opacity: newOpacity }
                              : ov,
                          ),
                        );
                        if (positionSaveTimers.current[o.id])
                          clearTimeout(positionSaveTimers.current[o.id]);
                        positionSaveTimers.current[o.id] = setTimeout(() => {
                          fetch(`/api/admin/overlays/${o.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ opacity: newOpacity }),
                          });
                        }, 300);
                      }}
                      className="flex-1 h-1.5 accent-orange-500 admndsb_editstrm_forminput"
                    />
                    <span className="text-xs text-zinc-400 w-8 text-right">
                      {Math.round(o.opacity * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add overlay form */}
          <form
            onSubmit={addOverlay}
            className="rounded-xl p-4 space-y-4 mt-4"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(180,83,9,0.2)",
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400/60">
              Add Overlay
            </h3>
            <div className="grid grid-cols-3 gap-2 admndsb_editstrm_formbdy">
              {OVERLAY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOverlayForm({ ...overlayForm, type: t })}
                  className={`py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                    overlayForm.type === t
                      ? "text-white"
                      : "text-amber-300/50 hover:text-amber-300"
                  } admndsb_editstrm_formbtn2`}
                  style={{
                    background:
                      overlayForm.type === t
                        ? "linear-gradient(135deg, #b45309, #c2410c)"
                        : "rgba(180,83,9,0.1)",
                    border:
                      overlayForm.type === t
                        ? "1px solid rgba(245,158,11,0.4)"
                        : "1px solid rgba(180,83,9,0.2)",
                  }}
                >
                  {t === "ad"
                    ? "📢 Ad"
                    : t === "logo"
                      ? "🏷️ Logo"
                      : "🖼️ Banner"}
                </button>
              ))}
            </div>

            {/* Upload or URL */}
            <div>
              <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-2 admndsb_editstrm_formlable">
                Media (Image / GIF / Video)
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
                  value={overlayForm.image_url}
                  onChange={(e) =>
                    setOverlayForm({
                      ...overlayForm,
                      image_url: e.target.value,
                    })
                  }
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
              {overlayForm.image_url && (
                <div
                  className="mt-2 h-16 rounded-lg overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                >
                  {overlayForm.image_url.match(/\.(mp4|webm)/i) ? (
                    <video
                      src={overlayForm.image_url}
                      className="h-full mx-auto object-contain"
                      muted
                    />
                  ) : (
                    <img
                      src={overlayForm.image_url}
                      alt="Preview"
                      className="h-full mx-auto object-contain"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 admndsb_editstrm_formbdy">
              <div className="admndsb_editstrm_formbdy">
                <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-1 admndsb_editstrm_formlable">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={overlayForm.width}
                  onChange={(e) =>
                    setOverlayForm({
                      ...overlayForm,
                      width: parseInt(e.target.value),
                    })
                  }
                  min={20}
                  max={800}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(180,83,9,0.25)",
                  }}
                />
              </div>
              <div className="admndsb_editstrm_formbdy">
                <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-1 admndsb_editstrm_formlable">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={overlayForm.height}
                  onChange={(e) =>
                    setOverlayForm({
                      ...overlayForm,
                      height: parseInt(e.target.value),
                    })
                  }
                  min={10}
                  max={600}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(180,83,9,0.25)",
                  }}
                />
              </div>
              <div className="admndsb_editstrm_formbdy">
                <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-1 admndsb_editstrm_formlable">
                  Opacity (0–1)
                </label>
                <input
                  type="number"
                  value={overlayForm.opacity}
                  onChange={(e) =>
                    setOverlayForm({
                      ...overlayForm,
                      opacity: parseFloat(e.target.value),
                    })
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(180,83,9,0.25)",
                  }}
                />
              </div>
              {overlayForm.type === "ad" && (
                <div className="admndsb_editstrm_formbdy">
                  <label className="block text-amber-300/50 text-xs uppercase tracking-widest mb-1 admndsb_editstrm_formlable">
                    Loop Duration (s)
                  </label>
                  <input
                    type="number"
                    value={overlayForm.ad_duration}
                    onChange={(e) =>
                      setOverlayForm({
                        ...overlayForm,
                        ad_duration: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    max={300}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none admndsb_editstrm_forminput"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(180,83,9,0.25)",
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={addingOverlay || uploadingFile}
              className="w-full disabled:opacity-50 text-amber-300/80 hover:text-white py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors admndsb_editstrm_formbtn"
              style={{
                background: "rgba(180,83,9,0.15)",
                border: "1px solid rgba(180,83,9,0.3)",
              }}
            >
              {addingOverlay ? "Adding..." : "+ Add Overlay"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
