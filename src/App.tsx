import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameMode, GameStats, PowerTier } from './game/types';
import { sound } from './audio/SoundManager';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { TouchControls } from './components/TouchControls';

const GAME_CONTROL_CODES = new Set([
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyZ',
  'KeyX',
  'ShiftLeft',
  'ShiftRight',
  'KeyJ',
  'KeyK',
]);

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameMode, setGameMode] = useState<GameMode>('TITLE');
  const [powerTier, setPowerTier] = useState<PowerTier>('small');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    coins: 0,
    lives: 3,
    world: 'WORLD 1-1',
    timeRemaining: 300,
    highScore: 10000,
  });

  const blurActiveButton = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 448;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.setStatsCallback((updatedStats, updatedMode, updatedPowerTier) => {
      setStats(updatedStats);
      setGameMode(updatedMode);
      setPowerTier(updatedPowerTier);
    });

    engine.startLoop();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Space / Arrow keys from scrolling or re-clicking a focused UI button
      if (GAME_CONTROL_CODES.has(e.code)) {
        e.preventDefault();
      }

      // Ignore OS key-repeat events to keep input state ultra-clean and fast
      if (e.repeat) return;

      sound.unlock();

      if (e.code === 'KeyM') {
        const muted = sound.toggleMute();
        setIsMuted(muted);
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        blurActiveButton();
        engine.togglePause();
        return;
      }

      if (engine.mode === 'TITLE' && (e.code === 'Enter' || e.code === 'Space')) {
        blurActiveButton();
        engine.startNewGame(0);
        return;
      }

      if (engine.mode === 'GAME_OVER' && (e.code === 'Enter' || e.code === 'Space')) {
        blurActiveButton();
        engine.startNewGame(0);
        return;
      }

      if (GAME_CONTROL_CODES.has(e.code)) {
        engine.handleKeyChange(e.code, true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (GAME_CONTROL_CODES.has(e.code)) {
        e.preventDefault();
        engine.handleKeyChange(e.code, false);
      }
    };

    const handleBlur = () => {
      engine.clearAllInputs();
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    window.addEventListener('blur', handleBlur);

    return () => {
      engine.stopLoop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleToggleMute = () => {
    blurActiveButton();
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleStartGame = (stageIndex: number) => {
    blurActiveButton();
    if (engineRef.current) {
      engineRef.current.startNewGame(stageIndex);
    }
  };

  const handlePause = () => {
    blurActiveButton();
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleResume = () => {
    blurActiveButton();
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleRestart = () => {
    blurActiveButton();
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    }
  };

  const handleQuitToTitle = () => {
    blurActiveButton();
    if (engineRef.current) {
      engineRef.current.clearAllInputs();
      engineRef.current.mode = 'TITLE';
      engineRef.current.loadLevel(0);
      setGameMode('TITLE');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center select-none">
      {/* Game Viewport Container with Crisp Retro Scaling */}
      <div className="relative w-full h-full max-w-[1400px] max-h-[800px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain bg-[#080814] shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* HUD Cluster */}
        {gameMode !== 'TITLE' && (
          <HUD
            stats={stats}
            powerTier={powerTier}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
          />
        )}

        {/* Title Screen Overlay */}
        {gameMode === 'TITLE' && (
          <TitleScreen
            highScore={stats.highScore}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onStartGame={handleStartGame}
          />
        )}

        {/* Pause Modal */}
        {gameMode === 'PAUSED' && (
          <PauseModal
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onResume={handleResume}
            onRestart={handleRestart}
            onQuitToTitle={handleQuitToTitle}
          />
        )}

        {/* Game Over Modal */}
        {gameMode === 'GAME_OVER' && (
          <GameOverModal
            stats={stats}
            onRestart={handleRestart}
            onQuitToTitle={handleQuitToTitle}
          />
        )}

        {/* Victory Modal */}
        {gameMode === 'STAGE_CLEAR' && (
          <VictoryModal
            stats={stats}
            onPlayAgain={() => handleStartGame(0)}
            onQuitToTitle={handleQuitToTitle}
          />
        )}

        {/* Touch Gamepad on mobile devices */}
        {gameMode === 'PLAYING' && isTouchDevice && engineRef.current && (
          <TouchControls engine={engineRef.current} />
        )}
      </div>
    </div>
  );
}
