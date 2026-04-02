


export default function BannerLeft({ banners }: { banners?: any[] }){

// const leftBanners = [
//     { id: 1, img: "./uploads/leftbanner.jpeg", link: "https://indno1.com" },
//   ];

  const leftBanners = banners || [
    { id: 2, img: "/uploads/rightbanner.jpeg", link: "https://indno1.win" }
  ];

    return(
        <div>
            {/* --- LEFT SIDEBAR (Hidden on Mobile/Tab) --- */}
            <aside className="hidden lg:flex flex-col gap-4 w-75 p-4 sticky top-0 h-screen  ">
                {/* <p className="text-center text-[10px] text-zinc-500 uppercase font-bold">Ad</p> */}
                {leftBanners.map((ad) => (
                <a key={ad.id} href={ad.link} target="_blank" className="hover:opacity-80 transition">
                    <img src={ad.img} alt="Banner Left" className="w-full rounded shadow-lg" />
                </a>
                
                ))}
            </aside>

        </div>
    )

}