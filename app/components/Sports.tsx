import NextImage from 'next/image';

export default function Sports() {
  return (
    <div className="section-grid">
              <div className="section-card">
                <h1 className="section-title text-left" > Indno1 – Trusted Online Casino & Betting Platform</h1>
                <div className="section-content">
                  <p className="section-text">Indno1 (Indno1.win) is one of the most trusted online betting platforms in India, offering a wide range of casino games, live sports betting, and instant withdrawals. With popular games like Teen Patti, Aviator, Rummy, and live casino experiences, Indno1 provides a secure and exciting gaming experience.</p>
                
                </div>
              </div>
              <div className="section-card">
                <h2 className="section-title text-left" > Why Choose Indno1?</h2>
                <div className="section-content">
                   <ul className="section-text">
                <li>⚡ Fast deposits and withdrawals</li>
                <li>🎧 24/7 customer support</li>
                <li>🎮 Wide range of casino and sports betting options</li>
                <li>🛡 Trusted platform for Indian users</li>
                
            </ul>


                

                   <div className="section-icon2" >
                    <NextImage src="/images/sports_1.png"  alt="Company Logo"  width={164}  height={164}  unoptimized loading="lazy" />                   
                  </div>
                </div>
              </div>
            </div>
  )
}
