import { Suspense } from "react";
import NewsVideoPlayer from "@/components/NewsVideoPlayer";
import TrandingGame from './components/TrandingGame';

import CasinoBets from '@/components/CasinoBets';
import Sporttab from './components/sporttab';
import TrandingSport from './components/TrandingSport';

export default function Home() {
  return (
    <main className="min-h-screen  flex flex-col items-center justify-center p-4 gap-6">
      {/* 1. Wrap the component in Suspense */}
      <Suspense fallback={<div className="aspect-video w-full max-w-4xlanimate-pulse rounded-xl" />}>
        <NewsVideoPlayer 
          url="https://www.youtube.com/embed/QqB8gshJv7o"
          newsText="LIVE BROADCAST CONNECTED • INDNO1 PLATFORM ONLINE • IT Team @ INDNO1 * 622 To ensure fund security and fulfill Anti-Money Laundering (AML) •  compliance obligations, we must verify our users identities. This typically • involves submitting government-issued ID  or proof of address • Providing authentic information is crucial to preventing account and fund freezing. "
        />
      </Suspense>

     <div className="mt-2 pt-5 flex flex-col gap-6">

       {/* Live Sports */}
        <Sporttab /> 

         {/* Live Sports */}
         <CasinoBets />

        
        
        {/* Live Sports */}        
        <TrandingGame />


         </div>
    </main>
  );
}