import React from 'react';
import { RotateCcw, Home, Trophy } from 'lucide-react';
import { GameStats } from '../game/types';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onQuitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onQuitToTitle,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 select-none animate-fade-in">
      <div className="w-full max-w-md bg-slate-950 border-2 border-red-500/60 p-6 rounded-lg text-white font-pixel shadow-[0_12px_32px_rgba(255,0,0,0.3)] flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl text-red-500 mb-6 drop-shadow-[0_4px_8px_rgba(255,0,0,0.6)] animate-pulse">
          GAME OVER
        </h2>

        {/* Stats Summary */}
        <div className="w-full bg-slate-900/80 p-4 rounded border border-white/10 mb-6 flex flex-col gap-2 text-xs md:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">FINAL SCORE:</span>
            <span className="tabular-nums font-bold text-amber-300">{stats.score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">COINS EARNED:</span>
            <span className="tabular-nums font-bold text-amber-200">{stats.coins}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">HIGH SCORE:</span>
            <span className="tabular-nums font-bold text-emerald-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {stats.highScore.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded border border-white/30 text-xs md:text-sm transition-all active:translate-y-0.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN (ENTER)</span>
          </button>

          <button
            onClick={onQuitToTitle}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded border border-white/20 text-xs md:text-sm transition-all active:translate-y-0.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>TITLE SCREEN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
