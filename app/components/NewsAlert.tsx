"use client";

import { motion } from "framer-motion";

interface NewsVideoProps {
  newsText: string;
}

function NewsAlert({ newsText }: NewsVideoProps) {

  const newsDuration = Math.trunc(newsText.length * 0.25) || 20;

  return (
    <section>

      {/* News Alert Bar */}
      <div className="absolute  top-22 left-0 w-full z-50 pointer-events-none transform -trams ">

        <div className="flex items-stretch bg-black/80 backdrop-blur-md border-b border-yellow-400">

          <div className="bg-red-600 text-white px-10 py-2 flex items-center font-black italic uppercase text-sm tracking-tighter">
            &nbsp;&nbsp;
            <span className="animate-pulse mr-3">●</span>
            IND Top News Alert 
            &nbsp; &nbsp;

          </div>

          <div className="flex-4 py-16 overflow-hidden whitespace-nowrap flex items-center">

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "-100%" }}
              transition={{
                repeat: Infinity,
                duration: newsDuration,
                ease: "linear"
              }}
              className="inline-block  text-white text-[22px] py-6 px-12  uppercase"
            >
              {newsText} • {newsText}
            </motion.div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default NewsAlert;