import Link from 'next/link';  

import GallerySection from '@/components/blocks/FooterGallery';  

  const socialLinks = [
    { id: '1', label: 'FaceBook', icon: 'f', url: 'https://www.facebook.com/profile.php?id=61586993265602' },
    { id: '2', label: 'x', icon: '𝕏' , url: 'https://www.instagram.com/ind_no1_official/' },
    { id: '3', label: 'Instagram', icon: 'I', url: 'https://www.instagram.com/ind_no1_official/' },
    { id: '4', label: 'Youtube', icon: 'y', url: 'https://www.youtube.com/@INDNO1-official' },
  ]; 

['🌐', '𝕏', 'f', '📷', '📺', '💬', '📱']




export default function Footer() {
  return (
    <footer className="footer">
          <div className="footer-content">  

             <div className="footer-grid">

            <div className="footer-column"> </div>

            <div className="footer-column"> </div>

            <div className="footer-column"> 
             

            </div>

             <div className="footer-column text-right flex flex-col items-end">

                <h4>Our Global Community</h4>
                <div className="social-icons mb-5 flex gap-3">
                  {socialLinks.map((scialitem, i) => (
                    <div key={i} className="social-icon" title={scialitem.label}>
                      <Link href={scialitem.url}>{scialitem.icon}</Link>                    
                    </div>
                  ))}
                </div>          

            </div>
            
</div>
            
          {/* Added Copyright Footer */}         
          <p className="copyright-text">
            IndNO1 © 2026 All rights reserved.
          </p>
          
          </div>
        </footer>
  )
}
