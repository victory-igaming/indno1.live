"use client";
// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense, useEffect } from "react";

import Headers from './components/Header';
import Footer from './components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// Client-side protection component
function ClientProtection() {
  useEffect(() => {
    // 1️⃣ Block headless browsers (Selenium, Puppeteer, Playwright)
    if (navigator.webdriver) {
      document.body.innerHTML = "";
      window.location.href = "about:blank";
    }

    // 2️⃣ Block bots by known UA strings
    const ua = navigator.userAgent.toLowerCase();
    const blockedBots = [
      "bot",
      "spider",
      "crawl",
      "python",
      "wget",
      "curl",
      "google",
      "bing",
      "yandex",
      "baidu",
      "duckduckbot",
      "semrush"
    ];

    if (blockedBots.some(b => ua.includes(b))) {
      document.body.innerHTML = "";
      window.location.href = "about:blank";
    }

    // 3️⃣ Block invisible/unfocused tabs after 2s
    setTimeout(() => {
      if (!document.hasFocus()) {
        document.body.innerHTML = "";
      }
    }, 2000);
  }, []);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        {/* Client-side bot protection */}
        <ClientProtection />

        <div className="gaming-container">
          {/* Header */}
          <Suspense fallback={null}>
            <Headers />
          </Suspense>

          {/* Main Layout */}
          <div className="main-layout">
            <main className="main-content">{children}</main>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
