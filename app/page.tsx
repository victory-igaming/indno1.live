import { Suspense } from "react";
import HomeLivePlayer from "./components/HomeLivePlayer";
import TrandingGame from './components/TrandingGame';
import CasinoBets from '@/components/CasinoBets';
import Sporttab from './components/sporttab';
import BettingCTA from './components/BettingCTA';

const NEWS_TEXT = "LIVE BROADCAST CONNECTED • INDNO1 PLATFORM ONLINE • IT Team @ INDNO1 * 622 To ensure fund security and fulfill Anti-Money Laundering (AML) • compliance obligations, we must verify our users identities. This typically • involves submitting government-issued ID or proof of address • Providing authentic information is crucial to preventing account and fund freezing.";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-3 sm:p-4 gap-6 sm:gap-8">

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
  );
}
