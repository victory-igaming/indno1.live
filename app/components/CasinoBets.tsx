"use client";

import { useEffect, useMemo, useState } from "react";

type Priority = "high" | "mid" | "low";

type GameConfig = {
  name: string;
  priority: Priority;
};

type BetStatus = "win" | "lose";

type Bet = {
  id: string;
  game: string;
  user: string;
  time: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  status: BetStatus;
};

const sportsCategories = [
  { id: "cricket", label: "Slots", icon: "💰" },
  { id: "football", label: "Crash", icon: "🚀" },
  { id: "rugby", label: "Games", icon: "🎮" },
  { id: "tennis", label: "Fishing", icon: "🎁" },
];

// Edit these yourself.
// You said you will feed the game names and set the priority.
const gamePools: Record<string, GameConfig[]> = {
  cricket: [ // Slots
    { name: "Chicky Run", priority: "high" },
    { name: "Ganesha Fortune", priority: "high" },
    { name: "Ganesha Gold", priority: "high" },
    { name: "Fortune Dragon", priority: "high" },
    { name: "Treasures of Aztec", priority: "high" },
    { name: "Wild Bounty Showdown", priority: "low" },
    { name: "Caishen Wins", priority: "mid" },
    { name: "Wild Bandito", priority: "high" },
    { name: "Lucky Neko", priority: "mid" },
    { name: "Mahjong Ways", priority: "low" },
    { name: "Fortune Ox", priority: "mid" },
    { name: "Mahjong Ways 2", priority: "low" },
    { name: "Fortune Rabbit", priority: "mid" },
    { name: "Money Coming", priority: "low" },
    { name: "Legend of Perseus", priority: "high" },
    { name: "Money Coming 2", priority: "low" },
    { name: "Super Ace", priority: "mid" },
    { name: "Jungle Delight", priority: "low" },
    { name: "Fortune Tiger", priority: "mid" },
    { name: "Pinata Wins", priority: "low" },
    { name: "Cocktail Nights", priority: "mid" },
    { name: "Rise of Apollo", priority: "low" },
    { name: "Fortune Gems", priority: "mid" },
    { name: "Dragon Hatch", priority: "low" },
    { name: "Speed Winner", priority: "mid" },
    { name: "Fortune Gems 2", priority: "low" },
    { name: "Fortune Gems 3", priority: "mid" },
    { name: "Double Fortune", priority: "low" },
    { name: "Fortune Mouse", priority: "mid" },
    { name: "Boxing King", priority: "low" },
    { name: "Queen of Bounty", priority: "mid" },
    { name: "RomaX", priority: "low" },
    { name: "Dragon Tiger Luck", priority: "low" },
    { name: "Wild Ape #3258", priority: "low" },
    { name: "Golden Empire", priority: "high" },
    { name: "Fortune coins", priority: "low" },
    { name: "Crazy777", priority: "high" },
    { name: "Charge Buffalo", priority: "low" },
    { name: "Ali Baba", priority: "low" },
    { name: "Mega Ace", priority: "low" },
    { name: "Lucky Goldbricks", priority: "low" },
    { name: "Wheel", priority: "low" },
    { name: "Zeus", priority: "high" },
    { name: "Fortune Snake", priority: "low" },
    { name: "Crazy FaFaFa", priority: "low" },
    { name: "Jurassic Kingdom", priority: "low" },
    { name: "Ways of the Qilin", priority: "low" },
    { name: "Asgardian Rising", priority: "mid" },
    { name: "Anubis Wrath", priority: "low" },
    { name: "Captains Bounty", priority: "mid" },
    { name: "Wild Fireworks", priority: "low" },
    { name: "Crazy Hunter", priority: "mid" },
    { name: "Open Sesame", priority: "low" },
    { name: "Billionaire", priority: "mid" },    


  ],
  football: [ // Crash
    { name: "Aviator", priority: "high" },
    { name: "Mini Roulette", priority: "mid" },
    { name: "Keno", priority: "low" },
    { name: "Hi-Lo", priority: "high" },
    { name: "Mines", priority: "high" },
    { name: "Plinko", priority: "mid" },
    { name: "Dice", priority: "low" },
    { name: "Goal", priority: "high" },
    { name: "Hotline", priority: "high" },
  ],
  rugby: [  // Games
    { name: "Rummy", priority: "high" },
    { name: "TeenPatti", priority: "high" },   
  ],
  tennis: [ // Fishing
    { name: "Jackpot Fishing", priority: "high" },
    { name: "Happy Fishing", priority: "high" },
    { name: "Mega Fishing", priority: "low" },
    { name: "Dinosaur Tycoon", priority: "high" },
    { name: "Boom Legend", priority: "mid" },
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(percent: number): boolean {
  return Math.random() * 100 < percent;
}

function weightedGamePick(games: GameConfig[]): GameConfig {
  const weighted: GameConfig[] = [];

  games.forEach((game) => {
    const repeat =
      game.priority === "high" ? 6 : game.priority === "mid" ? 3 : 1;

    for (let i = 0; i < repeat; i++) {
      weighted.push(game);
    }
  });

  return randomFrom(weighted);
}

function generateIndianUsername(): string {
  const firstNames = [
    "aarav",
    "arjun",
    "rahul",
    "rohit",
    "vikram",
    "aditya",
    "krishna",
    "karan",
    "rishabh",
    "aman",
    "siddharth",
    "varun",
    "manish",
    "vivek",
    "shivam",
    "yash",
    "harsh",
    "dev",
    "anish",
    "raj",
    "veer",
    "mohit",
    "ayush",
    "laksh",
  ];

  const surnames = [
    "singh",
    "patel",
    "kumar",
    "sharma",
    "verma",
    "yadav",
    "gupta",
    "mehta",
    "agarwal",
    "reddy",
    "nair",
    "joshi",
    "malhotra",
    "pandey",
    "thakur",
  ];

  const gamerWords = [
    "king",
    "boss",
    "gamer",
    "legend",
    "pro",
    "sniper",
    "elite",
    "master",
    "rider",
    "x",
    "yt",
    "live",
  ];

  const name = randomFrom(firstNames);
  const surname = randomFrom(surnames);
  const gamer = randomFrom(gamerWords);
  const number = Math.floor(Math.random() * 999) + 1;
  const digit = Math.floor(Math.random() * 10);

  const styles = [
    () => `${name}${number}`,
    () => `${name}_${gamer}`,
    () => `${surname}${number}`,
    () => `${name}_${surname}`,
    () => `${name}${surname}`,
    () => `${name}_${number}`,
    () => `${name}${number}${Math.floor(Math.random() * 99)}`,
    () => `${name.slice(0, 1)}${digit}${name.slice(1)}${number}`,
    () => `${name}${surname}${Math.floor(Math.random() * 99)}`,
    () => `${name}_${gamer}${Math.floor(Math.random() * 99)}`,
  ];

  return randomFrom(styles)();
}

function generateUsername(): string {
  // 40% hidden players
  if (chance(40)) {
    return "🙈 Hidden";
  }

  return generateIndianUsername();
}

function generateTime(): string {
  const now = new Date();

  const delay = Math.floor(Math.random() * 5) + 1; // 1–5 minutes
  now.setMinutes(now.getMinutes() - delay);

  return now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function generateBetAmount(gamePriority: Priority): number {
  let min = 10;
  let max = 500;

  if (gamePriority === "high") {
    min = 100;
    max = 5000;
  } else if (gamePriority === "mid") {
    min = 50;
    max = 1500;
  }

  const amount = Math.random() * (max - min) + min;
  return Number(amount.toFixed(2));
}

function generateMultiplier(isWin: boolean, gamePriority: Priority): number {
  if (!isWin) return 0;

  let min = 1.05;
  let max = 3.5;

  if (gamePriority === "high") {
    min = 1.2;
    max = 8;
  } else if (gamePriority === "low") {
    min = 1.01;
    max = 2.2;
  }

  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function generateBet(games: GameConfig[]): Bet {
  const selectedGame = weightedGamePick(games);

  // 75% winning score / win rate
  const status: BetStatus = chance(75) ? "win" : "lose";

  const betAmount = generateBetAmount(selectedGame.priority);
  const multiplier = generateMultiplier(status === "win", selectedGame.priority);

  const payout =
    status === "win"
      ? Number((betAmount * multiplier).toFixed(2))
      : Number((-betAmount).toFixed(2));

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    game: selectedGame.name,
    user: generateUsername(),
    time: generateTime(),
    betAmount,
    multiplier,
    payout,
    status,
  };
}

function generateInitialBets(games: GameConfig[], count = 7): Bet[] {
  return Array.from({ length: count }, () => generateBet(games));
}

export default function CasinoBets() {
  const [activeTab, setActiveTab] = useState("cricket");
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentGamePool = useMemo(() => {
    return gamePools[activeTab] || [];
  }, [activeTab]);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setBets(generateInitialBets(currentGamePool, 7));
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentGamePool]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBets((prevBets) => {
        const newBet = generateBet(currentGamePool);
        return [newBet, ...prevBets.slice(0, 6)];
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [currentGamePool]);

  return (
    <div className="rowBetting w-full">
      <div className="flex items-center">
        {sportsCategories.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setActiveTab(sport.id)}
            className={`p-5 rounded-t-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap font-bold ${
              activeTab === sport.id
                ? "bg-[#ffb800] text-black shadow-[0_-2px_10px_rgba(255,184,0,0.3)]"
                : "text-[#8c6b3d] hover:text-[#ffb800]"
            }`}
            style={{ padding: "20px" }}
          >
            <span>{sport.icon}</span>
            {sport.label}
          </button>
        ))}
      </div>

      <div>
        {isLoading ? (
          <div
            className="col-span-full text-center text-[#ffb800] animate-pulse"
            style={{ padding: "150px" }}
          >
            {activeTab} Loading Live Scores...
          </div>
        ) : (
          <>
            <div className="rowBettingHead">
              <span>Game</span>
              <span>User</span>
              <span>Time</span>
              <span>Bet Amount</span>
              <span>Multiplier</span>
              <span>Payout</span>
            </div>

            {bets.map((bet) => {
              const isWin = bet.status === "win";

              return (
                <div key={bet.id} className="rowBettingData">
                  <span>{bet.game}</span>
                  <span>{bet.user}</span>
                  <span>{bet.time}</span>
                  <span>${bet.betAmount.toLocaleString()}</span>
                  <span>{bet.multiplier}×</span>
                  <span
                    style={{
                      color: isWin ? "#00ff66" : "#ff4444",
                      fontWeight: "bold",
                    }}
                  >
                    {bet.payout < 0
                      ? `$-${Math.abs(bet.payout).toLocaleString()}`
                      : `$${bet.payout.toLocaleString()}`}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}