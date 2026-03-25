  
  const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

  
  const liveRacing = [
    { team1: 'veniam dolore', team2: 'veniam dolore', score1: '7-8', score2: '7-8', time: '70:50' },
    { team1: 'veniam dolore', team2: 'veniam dolore', score1: '7-8', score2: '7-8', time: '70:50' },
    { team1: 'veniam dolore', team2: 'veniam dolore', score1: '7-8', score2: '7-8', time: '70:50' },
  ];


export default function LiveSports() {
  return (
    <div className="live-section">
              <div className="section-header">
                <h3 className="section-title">⚡ Live Sports</h3>
                <div className="section-actions">
                  <button className="all-btn">ALL</button>
                  <span className="nav-arrow"><ChevronLeft /></span>
                  <span className="nav-arrow"><ChevronRight /></span>
                </div>
              </div>
              <div className="live-grid">
                {liveRacing.map((race, i) => (
                  <div key={i} className="live-card">
                    <div className="live-header">
                      <span className="live-tag">🏇 RACING</span>
                      <span className="live-badge">⚫ Live</span>
                    </div>
                    <div>
                      <div className="team-row">
                        <div className="team-info">
                          <div className="team-icon" style={{ background: 'white' }}></div>
                          <span className="team-name">{race.team1}</span>
                        </div>
                        <span className="team-score">{race.score1}</span>
                      </div>
                      <div className="team-row">
                        <div className="team-info">
                          <div className="team-icon" style={{ background: '#dc2626' }}></div>
                          <span className="team-name">{race.team2}</span>
                        </div>
                        <span className="team-score">{race.score2}</span>
                      </div>
                      <div className="match-time">{race.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
  )
}
