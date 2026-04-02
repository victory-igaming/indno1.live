"use client";
import React from "react";

export default function BannerRight({ banners }: { banners?: any[] }){

//     const rightBanners = [
//     { id: 2, img: "./uploads/rightbanner.jpeg", link: "https://indno1.win" }
//   ];

  // Default banner if none provided
  const rightBanners = banners || [
    { id: 2, img: "/uploads/rightbanner.jpeg", link: "https://indno1.win" }
  ];

    return(
        <div >

            {/* --- RIGHT SIDEBAR (Hidden on Mobile/Tab) --- */}
            <aside className="hidden lg:flex flex-col gap-4 w-75 p-4 sticky top-0 h-screen">
                {/* <p className="text-center text-[10px] text-zinc-500 uppercase font-bold">Ad</p> */}
                {rightBanners.map((ad) => (
                <a key={ad.id} href={ad.link} target="_blank" className="hover:opacity-80 transition">
                    <img src={ad.img} alt="Banner Right" className="w-full rounded shadow-lg" />
                </a>
                ))}
            </aside>

        </div>
    )

}