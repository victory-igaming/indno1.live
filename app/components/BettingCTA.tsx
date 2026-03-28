"use client";
import { motion } from "framer-motion";

export default function BettingCTA() {
  const handlePlayNow = () => {
    window.open("https://4498.indno1f.com/?menuId=sports", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="w-full relative overflow-hidden rounded-2xl">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1a0500 0%, #2e0d02 40%, #1a0500 100%)",
        }}
      />
      
      {/* Decorative glow */}
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #c2410c, transparent 70%)" }}
      />
      {/* Border */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ border: "1px solid rgba(245,158,11,0.25)" }}
      />

      <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row items-center gap-6">

        {/* Left: text */}
        <div className="flex-1 text-center sm:text-left titelNameSecLeft">
          {/* Urgency badge */}
          <div className="inline-flex items-center gap-2 mb-3 titelNameSecLeft_top">
            <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "#f59e0b" }}
            >
              Live Odds Moving Now
            </span>
          </div>

          <h2
            className="font-black text-white leading-tight mb-2 titelNameSecLeft_headline"
            style={{ fontSize: "clamp(1.2rem, 4vw, 1.75rem)" }}
          >
            Turn the Action Into{" "}
            <span
              style={{
                background: "linear-gradient(to right, #fbbf24, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Winnings
            </span>
          </h2>
          <p className="text-amber-200/60 text-sm font-medium max-w-md leading-relaxed titelNameSecLeft_moto">
            Join thousands of players betting live right now. Real-time odds,
            instant payouts — don't miss the next big win.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center sm:justify-start gap-5 mt-4">
            {[
              { label: "Players Online", value: "12K+" },
              { label: "Live Markets", value: "200+" },
              { label: "Instant Payout", value: "24/7" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-black text-amber-400 text-base leading-tight">{stat.value}</div>
                <div className="text-amber-300/40 text-xs uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex flex-col items-center gap-3 shrink-0 w-full sm:w-auto titelNameSecRight">
          <motion.button
            onClick={handlePlayNow}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto relative font-black text-black text-sm uppercase tracking-widest px-8 py-3.5 rounded-xl overflow-hidden shadow-lg shadow-amber-900/40"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
              minWidth: "180px",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 titelNameSecRight_btnbet">
              <span className="titelNameSecRight_btnbetIcon">⚡</span>
              Bet Now
            </span>
          </motion.button>

          <motion.button
            onClick={handlePlayNow}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto font-bold text-amber-400 text-sm uppercase tracking-wide px-8 py-3 rounded-xl transition-all titelNameSecRight_btnlods"
            style={{
              border: "1px solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.07)",
              minWidth: "180px",
            }}
          >
            Explore Live Odds →
          </motion.button>

          <p className="text-amber-300/30 text-xs text-center max-w-[180px] titelNameSecRight_txtbtom">
            18+ · Bet responsibly · T&Cs apply
          </p>
        </div>
      </div>
    </section>
  );
}
