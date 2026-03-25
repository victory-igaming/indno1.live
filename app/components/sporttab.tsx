'use client';
import React, { useState, useEffect } from 'react';

const sportsCategories = [
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'rugby', label: 'Rugby', icon: '🏉' },
  { id: 'Tennis', label: 'Tennis', icon: '🎾' }, // Fixed icon
];

const liveRacing: any = {
  cricket: [
    { team1: 'veniam cricket', team2: 'veniam dolore', score1: '7-8', score2: '7-8', time: '70:50' },
    { team1: 'veniam cricket', team2: 'cricket dolore', score1: '7-8', score2: '7-8', time: '70:50' },
  ],
  football: [
    { team1: 'veniam dolore', team2: 'football dolore', score1: '7-8', score2: '7-8', time: '70:50' },
  ],
  rugby: [
    { team1: 'rugby dolore', team2: 'veniam dolore', score1: '7-8', score2: '7-8', time: '70:50' },
  ],
  Tennis: [
    { team1: 'basketball dolore', team2: 'veniam dolore', score1: '7-8', score2: '7-8', time: '70:50' },
  ],
};

export default function SportsTabs() {
  const [activeTab, setActiveTab] = useState('cricket');
  const [liveData, setLiveData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use useEffect to fetch API data
  useEffect(() => {
    const fetchSportsData = async () => {
      setIsLoading(true);
      try {
        let url = "";
        if (activeTab === "cricket") url = "https://apiv2.allsportsapi.com/football/?met=Leagues&APIkey=f462601f7ac94df2e15eaa5cb79821cff30d1dd8fc7ac3cd9d35e1b3a7dedf77";
        else if (activeTab === "football") url = "https://apiv2.allsportsapi.com/football/?met=Leagues&APIkey=f462601f7ac94df2e15eaa5cb79821cff30d1dd8fc7ac3cd9d35e1b3a7dedf77";
        else if (activeTab === "rugby") url = "https://apiv2.allsportsapi.com/football/?met=Leagues&APIkey=f462601f7ac94df2e15eaa5cb79821cff30d1dd8fc7ac3cd9d35e1b3a7dedf77";
        else if (activeTab === "Tennis") url = "https://apiv2.allsportsapi.com/football/?met=Leagues&APIkey=f462601f7ac94df2e15eaa5cb79821cff30d1dd8fc7ac3cd9d35e1b3a7dedf77";
        else url = "https://apiv2.allsportsapi.com/football/?met=Leagues&APIkey=f462601f7ac94df2e15eaa5cb79821cff30d1dd8fc7ac3cd9d35e1b3a7dedf77";

        const response = await fetch(url);
        const result = await response.json();
        //console.log(result.result)
        let formattedData = [];

        if (activeTab === "cricket" && result) {
            
            // CricAPI structure
              formattedData = result.result.map((match: any) => ({                
                team1: match.country_name,
                team2: match.league_name,
                score1: match.league_key,
                score2: match.country_key,
                time: match.stage_name || 'Live'
            }));
            setIsLoading(false);

        } else if (activeTab === "football" && result) {

            // AllSportsAPI structure
            formattedData = result.result.map((match: any) => ({                
                team1: match.country_name,
                team2: match.league_name,
                score1: match.league_key,
                score2: match.country_key,
                time: match.stage_name || 'Live'
            }));

            setIsLoading(false);

        } else if (activeTab === "rugby" && result) {

            // AllSportsAPI structure
            formattedData = result.result.map((match: any) => ({                
                team1: match.country_name,
                team2: match.league_name,
                score1: match.league_key,
                score2: match.country_key,
                time: match.stage_name || 'Live'
            }));
            setIsLoading(false);

         } else if (activeTab === "Tennis" && result) {

            // AllSportsAPI structure
            formattedData = result.result.map((match: any) => ({                
                team1: match.country_name,
                team2: match.league_name,
                score1: match.league_key,
                score2: match.country_key,
                time: match.stage_name || 'Live'
            }));

            setIsLoading(false);

        }
      
         setLiveData(formattedData);

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        //setIsLoading(false);
      }
    };
    fetchSportsData();
  }, [activeTab]);

  // Use the dummy data from liveRacing based on the active tab
  const displayData = liveRacing[activeTab] || [];

  return (
    <div className="w-full bg-[#261007] p-4 rounded-xl border border-[#eab308] text-[#ffb800]">
      {/* Tab Header Area */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#eab308] pb-2 overflow-x-auto no-scrollbar">
        {sportsCategories.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setActiveTab(sport.id)}
            className={`p-5 rounded-t-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap font-bold  ${
                activeTab === sport.id
                  ? 'bg-[#ffb800] text-black shadow-[0_-2px_10px_rgba(255,184,0,0.3)]'
                  : 'text-[#8c6b3d] hover:text-[#ffb800]'
              }` }

                style={{ padding: '20px' }}
          >
            <span>{sport.icon}</span>
            {sport.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Area: Mapping displayData instead of categories */}
     <div className="live-grid flex justify-between items-center mb-4 p-10">
        {/* Show loading spinner if data is fetching */}
        {/* console.log(liveData) */}
  {isLoading ? (
    <div className="col-span-full text-center text-[#ffb800] animate-pulse p-50" style={{ padding: '150px' }}>
       {activeTab} Loading Live Scores...
    </div>
) : (

    
    liveData?.map((game: any, index: number) => (
          <div key={index} className="live-card " >
                    <div className="live-header">
                      <span className="live-tag">🏇  {activeTab}</span>
                      <span className="live-badge">⚫ Live</span>
                    </div>
                    <div>
                      <div className="team-row">
                        <div className="team-info">
                          <div className="team-icon" style={{ background: 'white' }}></div>
                          <span className="team-name">{game.team1}</span>
                        </div>
                        <span className="team-score">{game.score1}</span>
                      </div>
                      <div className="team-row">
                        <div className="team-info">
                          <div className="team-icon" style={{ background: '#dc2626' }}></div>
                          <span className="team-name">{game.team2}</span>
                        </div>
                        <span className="team-score">{game.score2}</span>
                      </div>
                      <div className="match-time">{game.time}</div>
                    </div>
                  </div>
     ))
  )}
      </div>
    
    </div>
  );

  
}