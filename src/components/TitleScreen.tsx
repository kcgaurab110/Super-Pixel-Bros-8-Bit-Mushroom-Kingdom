import React, { useState } from 'react';
import { Play, Trophy, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface TitleScreenProps {
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartGame: (stageIndex: number) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  highScore,
  isMuted,
  onToggleMute,
  onStartGame,
}) => {
  const [selectedStage, setSelectedStage] = useState(0);

  const stages = [
    { id: 0, name: 'WORLD 1-1', subtitle: 'Sunny Grasslands & Pipes' },
    { id: 1, name: 'WORLD 1-2', subtitle: 'Underground Caverns & Secrets' },
    { id: 2, name: 'WORLD 1-3', subtitle: 'Highland Mushroom Canopy' },
  ];

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 select-none bg-radial from-transparent via-black/20 to-black/60 pointer-events-auto">
      {/* Top Utility Ribbon */}
      <div className="w-full max-w-4xl flex items-center justify-between font-pixel text-xs text-white/90">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/20">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300">TOP-</span>
          <span className="tabular-nums font-bold tracking-wider">{highScore.toString().padStart(6, '0')}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded border border-white/20 transition-all text-xs active:scale-95 cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke Retro SVG Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto text-center">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="relative mb-6 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transform hover:scale-105 transition-transform">
          <svg
            viewBox="0 0 600 130"
            className="w-[320px] sm:w-[460px] md:w-[580px] h-auto overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outline drop shadows */}
            <text
              x="50%"
              y="58"
              textAnchor="middle"
              className="font-pixel font-black"
              fontSize="44"
              fill="#000000"
              stroke="#000000"
              strokeWidth="12"
            >
              SUPER PIXEL
            </text>
            <text
              x="50%"
              y="114"
              textAnchor="middle"
              className="font-pixel font-black"
              fontSize="48"
              fill="#000000"
              stroke="#000000"
              strokeWidth="12"
            >
              BROS
            </text>

            {/* Red / Gold 3D Bevel Layers */}
            <text
              x="50%"
              y="54"
              textAnchor="middle"
              className="font-pixel font-black"
              fontSize="44"
              fill="#b82000"
            >
              SUPER PIXEL
            </text>
            <text
              x="50%"
              y="50"
              textAnchor="middle"
              className="font-pixel font-black"
              fontSize="44"
              fill="#ff4422"
            >
              SUPER PIXEL
            </text>

            <text
              x="50%"
              y="110"
              textAnchor="middle"
              className="font-pixel font-black"
              fontSize="48"
              fill="#c08000"
            >
              BROS
            </text>
            <text
              x="50%"
              y="106"
              textAnchor="middle"
              className="font-pixel font-black"
              fontSize="48"
              fill="#ffcc00"
            >
              BROS
            </text>
          </svg>

          {/* Subtitle banner */}
          <div className="font-pixel text-[11px] sm:text-xs text-amber-200 tracking-widest text-center mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            ★ 8-BIT PLATFORM ADVENTURE ★
          </div>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {stages.map((stg) => (
            <button
              key={stg.id}
              onClick={() => setSelectedStage(stg.id)}
              className={`font-pixel text-[10px] sm:text-xs px-3 py-2 rounded transition-all cursor-pointer ${
                selectedStage === stg.id
                  ? 'bg-amber-400 text-black font-bold ring-2 ring-white scale-105 shadow-lg'
                  : 'bg-black/50 hover:bg-black/80 text-white/80 border border-white/20'
              }`}
            >
              {stg.name}
            </button>
          ))}
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={() => onStartGame(selectedStage)}
          className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-pixel text-sm sm:text-base rounded-md border-2 border-white shadow-[0_6px_0_#801800] active:translate-y-1 active:shadow-[0_2px_0_#801800] transition-all cursor-pointer animate-pulse"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>START GAME</span>
        </button>

        <div className="font-pixel text-[10px] text-white/70 mt-3">
          PRESS <span className="text-amber-300">ENTER</span> OR <span className="text-amber-300">SPACE</span> TO PLAY
        </div>
      </div>

      {/* Single Flat Control-Hint Line */}
      <div className="w-full max-w-4xl text-center font-pixel text-[10px] sm:text-xs text-white/85 bg-black/50 px-4 py-2.5 rounded border border-white/20">
        <span>WASD / Arrow Keys Move · Space/Z Jump · X Run/Fireball · Esc Pause</span>
      </div>
    </div>
  );
};
