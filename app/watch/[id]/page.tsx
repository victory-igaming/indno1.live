export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import pool from "@/lib/db";
import StreamPlayer from "@/components/StreamPlayer";
import TrandingGame from '@/components/TrandingGame';
import CasinoBets from '@/components/CasinoBets';
import BettingCTA from "@/components/BettingCTA";
import Link from "next/link";

import BannerLeft from '@/components/BannerLeft';
import BannerRight from '@/components/BannerRight';

import TopNewsPoint from '@/components/NewsAlert';

interface Props {
  params: Promise<{ id: string }>;
}

interface Banner {
  id: number;
  title: string;
  position: string;
  image_url?: string;
  target_url?: string;
  scheduled_at?: string;
  is_live?: boolean;
  is_active?: boolean;
  ad_active?: boolean;
  created_at?: string;
}

const NEWS_Default = "LIVE BROADCAST CONNECTED • INDNO1 PLATFORM ONLINE • IT Team @ INDNO1 * 622 To ensure fund security and fulfill Anti-Money Laundering (AML) • compliance obligations, we must verify our users identities. This typically • involves submitting government-issued ID or proof of address • Providing authentic information is crucial to preventing account and fund freezing.";


async function getStreamData(id: string) {
  const streamId = parseInt(id, 10);
  if (isNaN(streamId)) return null;

const streamRes = await pool.query(
  `
  SELECT
    id,
    title,
    sport_type,
    source_type,
    youtube_url,
    obs_stream_url,
    team1,
    team2,
    scheduled_at,
    is_live,
    is_active,
    ad_active,
    active_overlay_id,
    created_at,
    updated_at
  FROM streams
  WHERE id = $1
  LIMIT 1
  `,
  [streamId]
);
  if (!streamRes.rows[0]) return null;

  const stream = streamRes.rows[0];

  const overlaysRes = await pool.query(
    `SELECT id, type, image_url, pos_x, pos_y, width, height, opacity, ad_duration, display_order
     FROM overlays WHERE stream_id = $1 AND is_active = TRUE ORDER BY display_order ASC`,
    [streamId]
  );

  return { stream, overlays: overlaysRes.rows };
}

async function getNewsData() {
  const streamId = 1;
   const neswRes = await pool.query(
    `SELECT id, title, sport_type, youtube_url, team1, team2, scheduled_at, is_live, is_active, ad_active, active_overlay_id
     FROM streams WHERE is_live = 1`,
    [streamId]
  );

  if (!neswRes.rows[0]) return null;
 
  return { neswRes };
}


async function getNewsTopData() {
 try {
    // We look for the most recent news item where is_live is TRUE
  /*
    const newsRes = await pool.query(
      `SELECT id, title, newsbf, scheduled_at, is_live, ad_active 
       FROM news 
       WHERE is_live = true 
       ORDER BY created_at DESC 
       LIMIT 50`
    );
     if (newsRes.rowCount === 0) return null;
    
    return newsRes.rows[0];
  */
  const newsRes = await pool.query(
  `SELECT STRING_AGG(newsbf, ' • ' ORDER BY created_at DESC) as combined_news
   FROM news
   WHERE is_live = true AND is_active = true`
);

   

 //console.log(" newsRes ",newsRes);
   //const result = newsRes.rows[0].combined_news;
   const tickerText = newsRes.rows[0]?.combined_news;
    if (!tickerText) {
      return NEWS_Default; // Fallback to your hardcoded text if DB is empty
    }
     
   console.log(" News DB ",tickerText);
    return tickerText;
     
  } catch (error) {
    console.error("Error fetching news ticker:", error);
    return null;
  }
}

 
  async function getBannerData() {
   try {
    // 1. Fetch all columns needed for the banner object
const bannersRes = await pool.query(
  `SELECT id, image_url as img, target_url as link, position
   FROM banner
   WHERE is_live = true AND is_active = true
   ORDER BY id ASC`
);

    // 2. Initialize the structure
  const homeBanners: { left: Banner[]; right: Banner[] } = { left: [], right: [] };

    // 3. Loop through the database rows and push to the correct side
    bannersRes.rows.forEach(banner => {
      if (banner.position === 'left') {
        homeBanners.left.push(banner);
      } else if (banner.position === 'right') {
        homeBanners.right.push(banner);
      }
    });

    // 4. Fallback: If both are empty, you can return your defaults
    if (homeBanners.left.length === 0 && homeBanners.right.length === 0) {
       return {
         left: [{ id: 0, img: "/uploads/default-left.jpg", link: "#" }],
         right: [{ id: 0, img: "/uploads/default-right.jpg", link: "#" }]
       };
    }

    return homeBanners;

  } catch (error) {
    console.error("Error fetching banner data:", error);
    return { left: [], right: [] }; // Return empty structure on error
  }

}


const SPORT_ICONS: Record<string, string> = {
  cricket: "🏏",
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  other: "🎯",
};

const SPORT_NAMES: Record<string, string> = {
  cricket: "Cricket",
  football: "Football",
  basketball: "Basketball",
  tennis: "Tennis",
  other: "Sports",
};

function StatusScreen({ type, title, scheduledAt }: {
  type: 'not-started' | 'ended' | 'unavailable';
  title: string;
  scheduledAt?: string;
}) {
  const configs = {
    'not-started': {
      icon: '⏳',
      headline: 'Live Has Not Started Yet',
      sub: scheduledAt
        ? `Scheduled for ${new Date(scheduledAt).toLocaleString()}`
        : 'This match has not started yet. Please check back soon.',
      badge: 'UPCOMING',
      badgeStyle: { background: 'linear-gradient(135deg, #b45309, #92400e)' },
    },
    'ended': {
      icon: '🏁',
      headline: 'Live Match Has Ended',
      sub: 'This broadcast has concluded. Thank you for watching.',
      badge: 'ENDED',
      badgeStyle: { background: 'linear-gradient(135deg, #374151, #1f2937)' },
    },
    'unavailable': {
      icon: '⚠️',
      headline: 'Video Not Available',
      sub: 'This stream is currently unavailable. Please try again later.',
      badge: 'UNAVAILABLE',
      badgeStyle: { background: 'linear-gradient(135deg, #7f1d1d, #450a0a)' },
    },
  };

  const c = configs[type];

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1a0a03, #2e1005, #1a0a03)', border: '1px solid rgba(180,83,9,0.2)' }}>

        {/* Ambient Glow Background */}
      <div className="absolute inset-0 pointer-events-none "
        style={{ backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(202,138,4,0.12) 0%, transparent 65%)' }} />

        {/* Content Wrapper: Added flex-col and items-center for strict centering */}
      <div className="relative z-10 text-center px-8">
        <div className="text-6xl mb-4 pgWatch_nolive_icon">{c.icon}</div>
        <div className="inline-flex items-center gap-2 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full mb-4 tracking-widest pgWatch_nolive_icontext"
          style={c.badgeStyle}>
          {c.badge}
        </div>
        <h2 className="text-white font-black text-2xl mb-3 pgWatch_nolive_heading">{c.headline}</h2>
        <p className="text-amber-300/60 text-sm mb-2 font-medium pgWatch_nolive_title">{title}</p>
        <p className="text-amber-300/30 text-xs pgWatch_nolive_shadul">{c.sub}</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg pgWatch_nolive_btnBack"
          style={{ background: 'linear-gradient(135deg, #b45309, #c2410c)' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  const data = await getStreamData(id);
  // const datanws = await getNewsData();
  if (!data) notFound();

  const { stream, overlays } = data;
  const icon = SPORT_ICONS[stream.sport_type] || "🎯";
  const sportName = SPORT_NAMES[stream.sport_type] || stream.sport_type;

  // Determine stream status
  let streamStatus: 'live' | 'not-started' | 'ended' | 'unavailable' = 'live';
  if (!stream.is_active) {
    streamStatus = 'unavailable';
  } else if (!stream.is_live) {
    if (stream.scheduled_at && new Date(stream.scheduled_at).getTime() > Date.now()) {
      streamStatus = 'not-started';
    } else {
      streamStatus = 'ended';
    }
  }

  const matchLabel = stream.team1 && stream.team2
    ? `${stream.team1} vs ${stream.team2}`
    : stream.team1 || stream.team2 || null;

  //   const homeBanners = {
  //   left: [{ id: 1, img: "/uploads/leftbanner.jpeg", link: "https://indno1.com" }],
  //   right: [{ id: 2, img: "/uploads/rightbanner.jpeg", link: "https://indno1.win" }]
  // };

 
 const homeBanners = await getBannerData();
const homeNews = await getNewsTopData();
 

 const NEWS_TEXT = homeNews;

 return (
  <>

   {/* Hero section with live player */}
      <section className="w-full max-w-5xl mx-auto pt-3 sm:pt-4">
            <TopNewsPoint newsText={NEWS_TEXT}/>
        </section>   

    <div className="min-h-screen text-white bg-[#120803]" style={{ background: 'linear-gradient(to bottom, #1f0d04, #120803)' }}>
      
      {/* 1. MAIN WRAPPER: Flex container for Banners + Content */}
      <div className="relative w-full max-w-300 lg:max-w-400 mx-auto flex justify-center items-start px-8 lg:px-6">
        
        {/* --- LEFT BANNER (Desktop Only) --- */}
        <aside className="hidden xl:block w-64 sticky top-24 h-fit py-4 -ml-10 transform -translate-x-10 lg:-translate-x-20">
          <BannerLeft banners={homeBanners.left} />
        </aside>

        {/* --- CENTER MAIN CONTENT (Responsive) --- */}
        <main className="flex-1 w-full max-w-5xl flex flex-col items-center gap-6 py-6">
          
          {/* Back navigation */}
          <div className="w-full pgWatch_btnBckTop">
            <Link href="/" className="inline-flex items-center gap-2 text-amber-400/50 hover:text-amber-400 text-sm font-medium transition-colors">
              ← Back to Home
            </Link>
          </div>

          {/* Match header */}
          <div className="w-full rounded-2xl overflow-hidden "
            style={{ background: 'linear-gradient(135deg, #2e1408, #1a0a03)', border: '1px solid rgba(180,83,9,0.25)' }}>
            <div className="h-0.5 w-full "
              style={{ background: streamStatus === 'live' ? 'linear-gradient(to right, #ef4444, #b91c1c)' : 'linear-gradient(to right, #b45309, #c2410c)' }}
            />
            <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap pgWatch_top_conteiner">
              <div className="flex items-start gap-3">
                <div className="text-3xl mt-0.5">{icon}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-amber-400/70 text-[11px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full pgWatch_top_btnGame"
                      style={{ background: 'rgba(180,83,9,0.15)', border: '1px solid rgba(180,83,9,0.25)' }}>
                      {sportName}
                    </span>
                    {streamStatus === 'live' && (
                      <span className="flex items-center gap-1 bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full shadow shadow-red-900/40 pgWatch_top_btnStatus">
                        <span className="animate-pulse">●</span> LIVE
                      </span>
                    )}
                  </div>
                  <h1 className="text-white font-black text-lg sm:text-xl leading-tight mb-1 pgWatch_top_heading">{stream.title}</h1>
                  {matchLabel && <p className="text-amber-300/50 text-sm font-medium pgWatch_top_title">{matchLabel}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Player or Status Screen */}
          <div className="w-full">
            {streamStatus === 'live' ? (
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl opacity-15 blur-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, #ca8a04, transparent 70%)' }} />
                <div className="relative rounded-2xl overflow-hidden border shadow-2xl"
                  style={{ borderColor: 'rgba(180,83,9,0.3)' }}>
                  <StreamPlayer
                    stream={stream}
                    overlays={overlays}
                    newsText="LIVE BROADCAST • INDNO1 PLATFORM ONLINE • Watch responsibly"
                  />
                </div>
              </div>
            ) : (
              <StatusScreen
                type={streamStatus === 'unavailable' ? 'unavailable' : streamStatus}
                title={stream.title}
                scheduledAt={stream.scheduled_at}
              />
            )}
          </div>

          {/* Betting CTA */}
          <div className="w-full">
            <BettingCTA />
          </div>

          {/* Trending Games Section */}
          <section className="w-full mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #c2410c)' }} />
              <h2 className="text-white font-black text-base sm:text-lg uppercase tracking-wider">Trending Games</h2>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(180,83,9,0.3), transparent)' }} />
            </div>
            <TrandingGame />
          </section>
        </main>

        {/* --- RIGHT BANNER (Desktop Only) --- */}
        <aside className="hidden xl:block w-64 sticky top-24 h-fit py-4 -mr-10 transform translate-x-10">
          <BannerRight banners={homeBanners.right} />
        </aside>

      </div>
    </div>

    </>
  );

}
