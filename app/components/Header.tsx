"use client"

import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";

// Lucide React Icons (you can replace with your preferred icon library)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);


// Hamburger Icon Component
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


export default function Header() {

  const [query, setQuery]               = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const [isMenuOpen, setIsMenuOpen]     = useState(false);

const searchParams = useSearchParams();
const searchKey = searchParams.get("search");

  // State holds the data for the QR code, or 'null' when closed
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const qrData = {
    android: { title: "Android QR", code: "/images/android.jpg",downloadUrl: "https://pay.example.com/download" },
    ios: { title: "IOS QR", code: "/images/ios.png",downloadUrl: "https://wifi.example.com/setup" }
  };

  const pathname = usePathname(); 
  const router = useRouter();

  // Check screen size on mount and on resize
useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the standard 'md' breakpoint
    };
     if (searchKey) {
      setQuery(searchKey);
    }
    checkDevice(); // Initial check
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [searchKey]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      // Redirects to /blog with the search query as a URL parameter
      router.push(`/search?search=${encodeURIComponent(query)}`);
      setQuery("");
      setIsSearchOpen(false);
    }
  };


  const handleOpenSite = () => {
    // window.open(URL, Target, Features)
    // '_blank' opens the link in a new tab
    // 'noopener,noreferrer' is a security best practice
    window.open("https://4498.indno1f.com/?menuId=sports", "_blank", "noopener,noreferrer");
   //router.push(`/playnow`);
  };
  
  return (
     <header className="header">
          <div className="header-content">

            <div className="logo-section">
              <Link  href="/">
              <div className="logo">
                <NextImage 
                  src="/images/logo1.png" 
                  alt="Indno1 Company Logo" 
                  title='Most Trusted<br/>Gaming & Betting<br/>Website'
                  width={60} 
                  height={60} 
                  style={{height:'auto'}}
                  unoptimized 
                  loading="lazy"
                /></div></Link>
              <div>
             
                <div className="logo-subtitle hidden md:block">Most Trusted<br/>Gaming & Betting<br/>Website</div>
              </div>
            </div>


             
           
              

            <div className="header-actions">
                 
              <button className="play-now-btn headerplay-btn" onClick={handleOpenSite}>PLAY NOW</button>

              {/* MATCHING THE IMAGE: Register Button */}
              <Link  href="/dowloadapp"> <button className="mobDownIcon" type="button"  >  Download App </button> </Link>

              {/* Mobile Menu Toggle Button */}
              <button  className="lg:hidden p-2 text-white mobIcon" onClick={() => setIsMenuOpen(!isMenuOpen)} >
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>

              </div>        
             


            </div>


          


     

          {/* The Popup Overlay */}
         {activeQr && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white p-10 rounded-lg text-center">            
            <h2 className="text-lg font-bold mb-4">Your QR Code</h2>
            
            {/* The Image changes based on which button was clicked */}
            <img src={activeQr} alt="QR Code" className="w-48 h-48 mx-auto mb-4" />
            
            <button 
              onClick={() => setActiveQr(null)} // Reset to null to close
              className="mt-2 text-sm text-gray-500 underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

        </header>
  )
}
