import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';

interface PauseModalProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isMuted,
  onToggleMute,
  onResume,
  onRestart,
  onQuitToTitle,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/60 select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-white/40 p-6 rounded-lg text-white font-pixel shadow-[0_12px_28px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        <h2 className="text-xl md:text-2xl text-amber-300 mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          PAUSED
        </h2>

        <div className="w-full flex flex-col gap-3 mb-6">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded border border-white/30 text-xs md:text-sm active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>CONTINUE (ESC)</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded border border-white/30 text-xs md:text-sm active:translate-y-0.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART STAGE</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded border border-white/20 text-xs md:text-sm active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'SOUND: OFF' : 'SOUND: ON'}</span>
          </button>

          <button
            onClick={onQuitToTitle}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded border border-white/20 text-xs md:text-sm active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>TITLE MENU</span>
          </button>
        </div>

        {/* Controls Reference */}
        <div className="w-full bg-black/40 p-3 rounded text-[10px] text-white/70 flex flex-col gap-1 border border-white/10">
          <div className="text-amber-200">CONTROLS:</div>
          <div>Movement: Arrow Keys / WASD</div>
          <div>Jump: Space / Z</div>
          <div>Run / Fireball: X / Shift</div>
        </div>
      </div>
    </div>
  );
};
