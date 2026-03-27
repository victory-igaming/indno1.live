'use client';
import React, { useEffect, useRef, useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from 'next/image';

// Define your photos based on your Strapi data or local images
const photos = [
  { id: '1', title: 'ISO 3000', src: "/images/citi_1.jpg", width: 200, height: 200 },
  { id: '2', title: 'ISO 3001', src: "/images/citi_1.jpg", width: 200, height: 200 },
  { id: '3', title: 'ISO 3008', src: "/images/citi_1.jpg", width: 200, height: 200 },
  { id: '4', title: 'ISO 3010', src: "/images/citi_1.jpg", width: 200, height: 200 },
  { id: '5', title: 'ISO 3060', src: "/images/citi_1.jpg", width: 200, height: 200 },
  { id: '6', title: 'ISO 3080', src: "/images/citi_1.jpg", width: 200, height: 200 },
  { id: '7', title: 'ISO 3095', src: "/images/citi_1.jpg", width: 200, height: 200 },
  { id: '8', title: 'ISO 3300', src: "/images/citi_1.jpg", width: 200, height: 200 },
  // Add more photos here
];

// const galleryPhotos = strapiData.map((item: any) => ({
//   src: getStrapiMedia(item.image?.url),
//   width: item.image?.width || 800,
//   height: item.image?.height || 600,
//   category: item.category?.name || 'general'
// }));



export default function GallerySection() {

const [isMounted, setIsMounted] = useState(false);
 const [isExpanded, setIsExpanded] = useState(false);
 const widgetRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run this if we are mounted and the Trustpilot script is loaded
    const tp = (window as any).Trustpilot;
    if (isMounted && tp && widgetRef.current) {
      tp.loadFromElement(widgetRef.current);
    }
  }, [isMounted]);

  // To prevent hydration mismatch, we render a placeholder 
  // or nothing on the server
  if (!isMounted) {
    return <div className="h-13" />; // Matches the widget height
  }

  return (
    <section>
       {/* Other gallery code... */}
       <script type="text/javascript" src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>

       <div 
        ref={widgetRef}
        className="trustpilot-widget" 
        data-locale="en-US" 
        data-template-id="56278e9abfbbba0bdcd568bc" 
        data-businessunit-id="698d5c6ec479215d80d8b26f" 
        data-style-height="52px" 
        data-style-width="100%" 
        data-token="41d4d842-e21e-453c-99e4-478569cdcfdb"
      >


      </div>
    </section>
  );
}