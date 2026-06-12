import { Suspense } from "react";
import HomeLivePlayer from "@/components/HomeLivePlayer";
import TrandingGame from '@/components/TrandingGame';
import CasinoBets from '@/components/CasinoBets';
import Sporttab from '@/components/sporttab';
import BettingCTA from '@/components/BettingCTA';
import pool from "@/lib/db";

import BannerLeft from '@/components/BannerLeft';
import BannerRight from '@/components/BannerRight';

import TopNewsPoint from '@/components/NewsAlert';

const NEWS_Default = "LIVE BROADCAST CONNECTED • INDNO1 PLATFORM ONLINE • IT Team @ INDNO1 * 622 To ensure fund security and fulfill Anti-Money Laundering (AML) • compliance obligations, we must verify our users identities. This typically • involves submitting government-issued ID or proof of address • Providing authentic information is crucial to preventing account and fund freezing.";

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

async function getNewsData() {
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
      `SELECT STRING_AGG(newsbf, ' • ') as combined_news FROM news WHERE is_live = true`
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

// const homeBanners = {
//     left: [{ id: 1, img: "/uploads/leftbanner.jpeg", link: "https://indno1.com" }],
//     right: [{ id: 2, img: "/uploads/rightbanner.jpeg", link: "https://indno1.win" }]
//   };

 
 
  async function getBannerData() {
   try {
    // 1. Fetch all columns needed for the banner object
    const bannersRes = await pool.query(
      `SELECT id, image_url as img, target_url as link, position 
       FROM banner 
       WHERE is_live = true AND is_active = true`
    );

    // 2. Initialize the structure
    // const homeBanners = {
    //   left: [],
    //   right: []
    // };

    const homeBanners: { left: Banner[]; right: Banner[] } = { left: [], right: [] };

    // 3. Loop through the database rows and push to the correct side
    bannersRes.rows.forEach(banner => {
      if (banner.position === 'left') {
        homeBanners.left.push(banner);
      } else if (banner.position === 'right') {
        homeBanners.right.push(banner);
      }
    });
 console.log(" Banners Db ",bannersRes.rows);
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


export default async function Home() {

const liveNews = await getNewsData();

const NEWS_TEXT = liveNews;

//console.log(" NEWS_TEXT ",NEWS_TEXT);

const homeBanners = await getBannerData();


  return (
<>

 {/* Hero section with live player */}
      <section className="w-full max-w-5xl mx-auto pt-3 sm:pt-4">
            <TopNewsPoint newsText={NEWS_TEXT}/>
        </section>    


    <div className="relative w-full max-w-400 mx-auto flex justify-center items-start px-4">

       

      {/* BannerLeft */}
        <aside className="hidden xl:block w-65 sticky top-20 h-fit py-4 transform -translate-x-20">
          <BannerLeft  banners={homeBanners.left}/>
        </aside>

   
    <main className="min-h-screen flex flex-col items-center p-3 sm:p-4 gap-6 sm:gap-8 max-w-5xl">  

      

      {/* Hero section with live player */}
      <section className="w-full max-w-5xl mx-auto pt-3 sm:pt-4">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #c2410c)' }} />
          <h1 className="text-white font-black text-base sm:text-lg uppercase tracking-wider featueLive">Featured Live</h1>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(180,83,9,0.3), transparent)' }} />
        </div>

        <Suspense fallback={
          <div className="aspect-video w-full max-w-5xl rounded-2xl animate-pulse border border-amber-900/20"
            style={{ background: 'linear-gradient(135deg, #1a0a03, #2a1005)' }} />
        }>
          <HomeLivePlayer newsText={NEWS_TEXT} />
        </Suspense>
      </section>

      {/* Premium Betting CTA — right below the stream */}
      <section className="w-full max-w-5xl mx-auto">
        <BettingCTA />
      </section>

      {/* Content sections */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-10">

        {/* Live & Upcoming Sports */}
        <section className="w-full rounded-2xl border border-amber-900/20 p-4 sm:p-5"
          style={{ background: 'linear-gradient(135deg, #1f0d04, #160903)' }}>
          <Sporttab />
        </section>

        {/* Casino Bets */}
        <section>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #c2410c)' }} />
            <h2 className="text-white font-black text-base sm:text-lg uppercase tracking-wider">Casino & Bets</h2>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(180,83,9,0.3), transparent)' }} />
          </div>
          <CasinoBets />
        </section>

        {/* Trending Games */}
        <section>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #c2410c)' }} />
            <h2 className="text-white font-black text-base sm:text-lg uppercase tracking-wider">Trending Games</h2>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(180,83,9,0.3), transparent)' }} />
          </div>
          <TrandingGame />
        </section>

      </div>

    </main>

          {/* BannerRight */}         
        <aside className="hidden xl:block w-45 sticky top-20 h-fit py-4 transform translate-x-10">
        <BannerRight banners={homeBanners.right} />
      </aside>

     </div>

     </>
  );
}
