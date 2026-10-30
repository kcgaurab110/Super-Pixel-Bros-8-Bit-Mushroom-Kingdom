import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { GameEngine, InputState } from '../game/GameEngine';

interface TouchControlsProps {
  engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const handlePress = (key: keyof InputState, isDown: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    engine.setTouchInput(key, isDown);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none p-4 pb-6 flex items-end justify-between select-none">
      {/* Directional D-Pad */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onTouchStart={handlePress('left', true)}
          onTouchEnd={handlePress('left', false)}
          onTouchCancel={handlePress('left', false)}
          onMouseDown={handlePress('left', true)}
          onMouseUp={handlePress('left', false)}
          onMouseLeave={handlePress('left', false)}
          className="w-14 h-14 bg-black/60 active:bg-black/90 border-2 border-white/40 rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform touch-none shadow-lg"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          onTouchStart={handlePress('down', true)}
          onTouchEnd={handlePress('down', false)}
          onTouchCancel={handlePress('down', false)}
          onMouseDown={handlePress('down', true)}
          onMouseUp={handlePress('down', false)}
          onMouseLeave={handlePress('down', false)}
          className="w-12 h-12 bg-black/60 active:bg-black/90 border-2 border-white/40 rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform touch-none shadow-lg"
          aria-label="Crouch"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          onTouchStart={handlePress('right', true)}
          onTouchEnd={handlePress('right', false)}
          onTouchCancel={handlePress('right', false)}
          onMouseDown={handlePress('right', true)}
          onMouseUp={handlePress('right', false)}
          onMouseLeave={handlePress('right', false)}
          className="w-14 h-14 bg-black/60 active:bg-black/90 border-2 border-white/40 rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform touch-none shadow-lg"
          aria-label="Move Right"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Run / Fire Button */}
        <button
          onTouchStart={handlePress('action', true)}
          onTouchEnd={handlePress('action', false)}
          onTouchCancel={handlePress('action', false)}
          onMouseDown={handlePress('action', true)}
          onMouseUp={handlePress('action', false)}
          onMouseLeave={handlePress('action', false)}
          className="w-14 h-14 bg-red-600/80 active:bg-red-600 border-2 border-white/50 rounded-full flex flex-col items-center justify-center text-white font-pixel text-xs active:scale-95 transition-transform touch-none shadow-lg"
          aria-label="Run or Shoot Fireball"
        >
          <span>X</span>
          <span className="text-[8px] text-white/80">FIRE</span>
        </button>

        {/* Jump Button */}
        <button
          onTouchStart={handlePress('jump', true)}
          onTouchEnd={handlePress('jump', false)}
          onTouchCancel={handlePress('jump', false)}
          onMouseDown={handlePress('jump', true)}
          onMouseUp={handlePress('jump', false)}
          onMouseLeave={handlePress('jump', false)}
          className="w-16 h-16 bg-amber-500/80 active:bg-amber-500 border-2 border-white/50 rounded-full flex flex-col items-center justify-center text-white font-pixel text-xs active:scale-95 transition-transform touch-none shadow-lg"
          aria-label="Jump"
        >
          <span className="text-sm">SPACE</span>
          <span className="text-[8px] text-white/80">JUMP</span>
        </button>
      </div>
    </div>
  );
};
