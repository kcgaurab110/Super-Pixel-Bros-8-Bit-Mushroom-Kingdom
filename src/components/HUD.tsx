import React from 'react';
import { GameStats, PowerTier } from '../game/types';
import { Volume2, VolumeX, Pause, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  powerTier: PowerTier;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  powerTier,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  // Format score with leading zeros
  const scoreStr = stats.score.toString().padStart(6, '0');
  const coinStr = stats.coins.toString().padStart(2, '0');
  const timeStr = stats.timeRemaining.toString().padStart(3, '0');

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 md:p-4 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between font-pixel text-xs md:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {/* Score Cluster */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] md:text-xs text-amber-300">MARIO</span>
          <span className="tabular-nums tracking-wider text-sm md:text-base font-bold">{scoreStr}</span>
        </div>

        {/* Coins Cluster */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded border border-white/20">
          <div className="w-3 h-4 bg-amber-400 rounded-sm border border-amber-200 animate-pulse" />
          <span className="text-[10px] md:text-xs text-amber-200">×</span>
          <span className="tabular-nums font-bold tracking-wider">{coinStr}</span>
        </div>

        {/* World Cluster */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] md:text-xs text-amber-300">STAGE</span>
          <span className="tracking-wide font-bold">{stats.world}</span>
        </div>

        {/* Power State */}
        <div className="hidden sm:flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded border border-white/20">
          {powerTier === 'small' && <span className="text-[10px] text-slate-300">REGULAR</span>}
          {powerTier === 'super' && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> SUPER
            </span>
          )}
          {powerTier === 'fire' && (
            <span className="text-[10px] text-orange-400 flex items-center gap-1">
              <Flame className="w-3 h-3" /> FIRE
            </span>
          )}
          {powerTier === 'star' && (
            <span className="text-[10px] text-yellow-300 flex items-center gap-1 animate-bounce">
              <ShieldAlert className="w-3 h-3" /> STAR
            </span>
          )}
        </div>

        {/* Time Cluster */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] md:text-xs text-amber-300">TIME</span>
          <span className={`tabular-nums font-bold text-sm md:text-base ${stats.timeRemaining < 50 ? 'text-red-400 animate-pulse' : ''}`}>
            {timeStr}
          </span>
        </div>

        {/* Lives & Utility controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/40 px-2 py-1.5 rounded border border-white/20">
            <span className="text-red-500 text-xs">❤️</span>
            <span className="tabular-nums font-bold">×{stats.lives}</span>
          </div>

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute game' : 'Mute game'}
            className="p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/30 text-white transition-transform active:scale-95"
            title="Toggle Sound (M)"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onPause}
            aria-label="Pause game"
            className="p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/30 text-white transition-transform active:scale-95"
            title="Pause (Esc / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
