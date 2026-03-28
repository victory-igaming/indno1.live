"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Adminheader({ adminName }: any) {
    const router = useRouter();

    async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }
  
  return (   
      <header
        className="sticky top-0 z-50 border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 admndsb_header"
        style={{
          background: "rgba(10,5,2,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(180,83,9,0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 admndsb_header_logo"
            style={{ background: "linear-gradient(135deg, #b45309, #9a3412)" }}
          >
            📡
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-widest text-white admndsb_header_title">Broadcast Control</h1>
            <p className="text-amber-600/60 text-xs hidden sm:block admndsb_header_moto">Live Stream Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {adminName && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400/60 border border-amber-900/30 px-2.5 py-1 rounded-lg admndsb_header_btnLupanel">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              {adminName}
            </span>
          )}
          <Link
            href="/"
            target="_blank"
            className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors border border-amber-900/30 hover:border-amber-700/50 px-3 py-1.5 rounded-lg admndsb_header_btnLupanel"
          >
            View Site ↗
          </Link>
          <button
            onClick={logout}
            className="text-xs text-red-400/80 hover:text-red-300 transition-colors border border-red-900/40 hover:border-red-700/60 px-3 py-1.5 rounded-lg admndsb_header_btnLupanel"
          >
            Logout
          </button>
        </div>
      </header>
  );
}
