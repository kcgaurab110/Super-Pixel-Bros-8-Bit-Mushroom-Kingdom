import React from 'react';
import { Trophy, RotateCcw, Home, Sparkles } from 'lucide-react';
import { GameStats } from '../game/types';

interface VictoryModalProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onQuitToTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onPlayAgain,
  onQuitToTitle,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 select-none animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 p-6 sm:p-8 rounded-lg text-white font-pixel shadow-[0_16px_36px_rgba(245,158,11,0.4)] flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Sparkles className="w-6 h-6 animate-spin" />
          <Trophy className="w-8 h-8" />
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>

        <h2 className="text-xl sm:text-2xl text-amber-300 mb-2 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">
          CONGRATULATIONS!
        </h2>
        <div className="text-xs text-white/80 mb-6">
          YOU RESCUED THE KINGDOM AND CONQUERED ALL WORLDS!
        </div>

        {/* Stats Summary */}
        <div className="w-full bg-black/40 p-4 rounded border border-white/20 mb-6 flex flex-col gap-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">TOTAL SCORE:</span>
            <span className="tabular-nums font-bold text-amber-300">{stats.score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">COINS COLLECTED:</span>
            <span className="tabular-nums font-bold text-yellow-200">{stats.coins}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">LIVES REMAINING:</span>
            <span className="tabular-nums font-bold text-red-400">❤️ ×{stats.lives}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-slate-400">HIGH SCORE RECORD:</span>
            <span className="tabular-nums font-bold text-emerald-400">{stats.highScore.toString().padStart(6, '0')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded border border-white/30 text-xs sm:text-sm transition-all active:translate-y-0.5 cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onQuitToTitle}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded border border-white/20 text-xs sm:text-sm transition-all active:translate-y-0.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>TITLE MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
