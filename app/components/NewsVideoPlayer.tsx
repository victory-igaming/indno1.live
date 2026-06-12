"use client";
import React, { useState, useEffect,useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Hls from "hls.js";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

// --- UPDATE THIS INTERFACE ---
interface NewsVideoProps {
  url: string;      // Add this line
  newsText: string;
}

const NewsVideoPlayer = ({ url, newsText }: NewsVideoProps) => {
  const [mounted, setMounted] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  //const newsDuration = newsText? Math.round(newsText.length * .8) : 20;
  const newsDuration = Math.trunc(newsText.length * 0.25) || 20;
  //console.log ("newsDuration", newsDuration);

  const handleCentralButtonClick = () => {
    if (clickCount === 0) {
      window.open("https://indno1.com", "_blank");
      setClickCount(1);
    } else if (clickCount === 1) {
      window.open("https://indno1.win", "_blank"); // Replace with your WhatsApp link
      setClickCount(2);
      setIsPlaying(true);
    } else {
      // Third click: Play the actual video
      setIsPlaying(true);
    }
  };


  // Function to convert regular YouTube URL to Embed URL
  const embedUrl = useMemo(() => {
    if (!url) return "";
    
    // Extract Video ID (works for watch?v= or youtu.be/)
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    
    // Add parameters: autoplay, mute (required for autoplay), and modestbranding
   // return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&rel=0`;
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`;
  }, [url]);


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="aspect-video bg-black rounded-xl" />;

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video shadow-2xl border border-zinc-800 videoWrapper">
 <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen       
      />

     {/* 2. The Custom Interaction Overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={handleCentralButtonClick}
        >
          {/* Big Custom Play Button */}
          <div className="videoWrapper_button w-18 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-orange-500/50 shadow-2xl transition-transform group-hover:scale-110">
            <svg 
              viewBox="0 0 24 24" 
              className="w-10 h-10 fill-white ml-1"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Optional: Label to show what happens next */}
          <div className="absolute bottom-10 bg-black/60 px-4 py-2 rounded text-white text-xs font-bold uppercase tracking-widest">
            {clickCount === 0 && "Click to Open Google"}
            {clickCount === 1 && "Click for WhatsApp"}
            {clickCount === 2 && "Click to Watch Live"}
          </div>
        </div>
      )}



      
      {/* Marquee Overlay */}
      <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
        <div className="flex items-stretch bg-black/80 backdrop-blur-md border-t border-red-600">
          <div className="bg-red-600 text-white px-10 py-2 flex items-center justify-center font-black italic uppercase text-sm tracking-tighter videoWrapper_news" >
            <span className="animate-pulse mr-4"> ● </span> News Alert
          </div>
          <div className="flex-1 py-2 overflow-hidden whitespace-nowrap flex items-center">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "-100%" }}
              transition={{ repeat: Infinity, duration: newsDuration, ease: "linear" }}
              className="inline-block text-white font-bold text-lg uppercase px-4"
            >
              {newsText} • {newsText}
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NewsVideoPlayer;