import { sound } from '../audio/SoundManager';
import {
  Block,
  Enemy,
  Fireball,
  GameMode,
  GameStats,
  Item,
  LevelData,
  Particle,
  Player,
  PowerTier,
} from './types';
import {
  COLORS,
  drawBush,
  drawCloud,
  drawEnemy,
  drawFireball,
  drawHill,
  drawItem,
  drawPlayer,
  drawTile,
  TILE_SIZE,
} from './sprites';
import { LEVELS } from './levels';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  action: boolean;
  actionPressed: boolean;
}

const JUMP_KEYS = new Set(['Space', 'KeyZ', 'ArrowUp', 'KeyW']);
const LEFT_KEYS = new Set(['ArrowLeft', 'KeyA']);
const RIGHT_KEYS = new Set(['ArrowRight', 'KeyD']);
const DOWN_KEYS = new Set(['ArrowDown', 'KeyS']);
const ACTION_KEYS = new Set(['KeyX', 'ShiftLeft', 'ShiftRight', 'KeyJ', 'KeyK']);

const MAX_PARTICLES = 48;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private tickCount: number = 0;
  private timerAccum: number = 0;

  // Game Loop State
  public mode: GameMode = 'TITLE';
  public currentLevelIdx: number = 0;
  public currentLevel!: LevelData;
  public stats: GameStats = {
    score: 0,
    coins: 0,
    lives: 3,
    world: 'WORLD 1-1',
    timeRemaining: 300,
    highScore: 10000,
  };

  // Dirty-check cache so React HUD only re-renders when values actually change
  private lastNotifiedKey: string = '';
  public onStatsChange?: (stats: GameStats, mode: GameMode, powerTier: PowerTier) => void;

  // Entities
  public player!: Player;
  public enemies: Enemy[] = [];
  public items: Item[] = [];
  public fireballs: Fireball[] = [];
  public particles: Particle[] = [];

  // Camera
  public cameraX: number = 0;
  private screenShake: number = 0;
  private hitstopTimer: number = 0;

  // Flagpole cinematic state
  private flagpoleState: 'none' | 'sliding' | 'walking_to_castle' | 'entered_castle' = 'none';
  private flagpoleTargetY: number = 0;
  private castleTargetX: number = 0;
  private flagY: number = 0;

  // Fast Multi-Key Hardware Input Tracking
  private activeKeys: Set<string> = new Set();
  private touchInputs: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpPressed: false,
    action: false,
    actionPressed: false,
  };

  public inputs: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpPressed: false,
    action: false,
    actionPressed: false,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    const savedHighScore = localStorage.getItem('mario_high_score');
    if (savedHighScore) {
      this.stats.highScore = parseInt(savedHighScore, 10) || 10000;
    }

    this.loadLevel(0);
  }

  /**
   * Instantaneous multi-key handler supporting simultaneous key chords without ghosting
   */
  public handleKeyChange(code: string, isDown: boolean) {
    if (isDown) {
      const wasAlreadyDown = this.activeKeys.has(code);
      this.activeKeys.add(code);

      if (!wasAlreadyDown) {
        if (JUMP_KEYS.has(code)) {
          this.inputs.jumpPressed = true;
          if (this.player) {
            this.player.jumpBufferTimer = 0.15; // 150ms responsive jump buffer
          }
        }
        if (ACTION_KEYS.has(code)) {
          this.inputs.actionPressed = true;
        }
      }
    } else {
      this.activeKeys.delete(code);
    }

    this.syncCombinedInputs();
  }

  public setTouchInput(key: keyof InputState, isDown: boolean) {
    if (isDown && !this.touchInputs[key]) {
      if (key === 'jump') {
        this.inputs.jumpPressed = true;
        if (this.player) {
          this.player.jumpBufferTimer = 0.15;
        }
      }
      if (key === 'action') {
        this.inputs.actionPressed = true;
      }
    }
    this.touchInputs[key] = isDown;
    this.syncCombinedInputs();
  }

  public clearAllInputs() {
    this.activeKeys.clear();
    this.touchInputs.left = false;
    this.touchInputs.right = false;
    this.touchInputs.up = false;
    this.touchInputs.down = false;
    this.touchInputs.jump = false;
    this.touchInputs.action = false;
    this.syncCombinedInputs();
  }

  private syncCombinedInputs() {
    let left = this.touchInputs.left;
    let right = this.touchInputs.right;
    let down = this.touchInputs.down;
    let jump = this.touchInputs.jump;
    let action = this.touchInputs.action;

    for (const k of this.activeKeys) {
      if (LEFT_KEYS.has(k)) left = true;
      if (RIGHT_KEYS.has(k)) right = true;
      if (DOWN_KEYS.has(k)) down = true;
      if (JUMP_KEYS.has(k)) jump = true;
      if (ACTION_KEYS.has(k)) action = true;
    }

    this.inputs.left = left;
    this.inputs.right = right;
    this.inputs.down = down;
    this.inputs.jump = jump;
    this.inputs.action = action;
  }

  public setStatsCallback(cb: (stats: GameStats, mode: GameMode, powerTier: PowerTier) => void) {
    this.onStatsChange = cb;
    this.notifyStats(true);
  }

  private notifyStats(force: boolean = false) {
    if (!this.onStatsChange) return;
    const tier = this.player ? this.player.powerTier : 'small';
    const stateKey = `${this.stats.score}_${this.stats.coins}_${this.stats.lives}_${this.stats.world}_${this.stats.timeRemaining}_${this.stats.highScore}_${this.mode}_${tier}`;
    if (!force && stateKey === this.lastNotifiedKey) return;
    this.lastNotifiedKey = stateKey;
    this.onStatsChange({ ...this.stats }, this.mode, tier);
  }

  public loadLevel(levelIdx: number) {
    this.currentLevelIdx = levelIdx;
    const builder = LEVELS[levelIdx % LEVELS.length];
    this.currentLevel = builder();
    this.stats.world = this.currentLevel.name;
    this.stats.timeRemaining = this.currentLevel.timeLimit;
    this.cameraX = 0;
    this.screenShake = 0;
    this.hitstopTimer = 0;
    this.timerAccum = 0;
    this.flagpoleState = 'none';
    this.flagY = 3 * TILE_SIZE;

    const isSuper = this.player ? this.player.powerTier !== 'small' && !this.player.isDead : false;
    const currentTier: PowerTier = this.player && !this.player.isDead ? this.player.powerTier : 'small';

    this.player = {
      x: 3 * TILE_SIZE,
      y: (this.currentLevel.heightInTiles - 4) * TILE_SIZE,
      vx: 0,
      vy: 0,
      width: isSuper ? 26 : 22,
      height: isSuper ? 48 : 28,
      powerTier: currentTier,
      facing: 'right',
      isGrounded: true,
      isCrouching: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      invulnerableTimer: 0,
      starTimer: 0,
      runAnimTimer: 0,
      runFrame: 0,
      isSkidding: false,
      isSlidingPole: false,
      isDead: false,
      deathTimer: 0,
    };

    this.enemies = this.currentLevel.enemies.map((e, idx) => ({
      id: `enemy_${idx}`,
      type: e.type,
      x: e.tileX * TILE_SIZE,
      y: (e.tileY - 1) * TILE_SIZE + 4,
      vx: -1.25,
      vy: 0,
      width: 28,
      height: e.type === 'koopa' ? 40 : 28,
      facing: 'left',
      state: 'walk',
      animTimer: 0,
      animFrame: 0,
      stateTimer: 0,
    }));

    this.items = [];
    this.fireballs = [];
    this.particles = [];

    this.notifyStats(true);
  }

  public startNewGame(startingLevel: number = 0) {
    sound.unlock();
    this.stats.score = 0;
    this.stats.coins = 0;
    this.stats.lives = 3;
    if (this.player) {
      this.player.powerTier = 'small';
    }
    this.loadLevel(startingLevel);
    this.mode = 'PLAYING';
    this.notifyStats(true);
  }

  public restartCurrentLevel() {
    sound.unlock();
    if (this.stats.lives <= 0) {
      this.startNewGame(0);
      return;
    }
    this.loadLevel(this.currentLevelIdx);
    this.mode = 'PLAYING';
    this.notifyStats(true);
  }

  public togglePause() {
    if (this.mode === 'PLAYING') {
      this.mode = 'PAUSED';
      sound.stopStarTheme();
    } else if (this.mode === 'PAUSED') {
      this.mode = 'PLAYING';
      if (this.player.starTimer > 0) {
        sound.startStarTheme();
      }
    }
    this.notifyStats(true);
  }

  public startLoop() {
    this.lastTime = performance.now();
    const frame = (time: number) => {
      const rawDt = (time - this.lastTime) / 1000;
      const dt = Math.min(rawDt, 0.035); // Tight dt clamp for smooth physics
      this.lastTime = time;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(frame);
    };
    this.animFrameId = requestAnimationFrame(frame);
  }

  public stopLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopStarTheme();
  }

  // ----------------------------------------------------
  // UPDATE LOOP
  // ----------------------------------------------------
  private update(dt: number) {
    this.tickCount++;

    // Brief hitstop on heavy impacts
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 18);
    }

    this.updateParticles(dt);

    if (this.mode === 'TITLE') {
      this.cameraX = Math.sin(this.tickCount * 0.005) * 60 + 60;
      return;
    }

    if (this.mode !== 'PLAYING') return;

    if (this.flagpoleState !== 'none') {
      this.updateFlagpoleSequence(dt);
      return;
    }

    if (this.player.isDead) {
      this.player.deathTimer += dt;
      if (this.player.deathTimer > 0.35) {
        this.player.vy += 24 * dt;
        this.player.y += this.player.vy * 60 * dt;
      }
      if (this.player.deathTimer > 2.4) {
        this.stats.lives--;
        if (this.stats.lives <= 0) {
          this.mode = 'GAME_OVER';
          sound.playGameOver();
        } else {
          this.restartCurrentLevel();
        }
        this.notifyStats(true);
      }
      return;
    }

    // Accurate 1-second timer countdown
    this.timerAccum += dt;
    if (this.timerAccum >= 1.0) {
      this.timerAccum -= 1.0;
      this.stats.timeRemaining = Math.max(0, this.stats.timeRemaining - 1);
      if (this.stats.timeRemaining === 0) {
        this.killPlayer();
      }
      this.notifyStats();
    }

    this.updatePlayer(dt);
    this.updateFireballs(dt);
    this.updateItems(dt);
    this.updateEnemies(dt);
    this.updateBlocks(dt);

    const targetCameraX = Math.max(0, this.player.x - this.canvas.width * 0.38);
    const maxCameraX = Math.max(0, this.currentLevel.widthInTiles * TILE_SIZE - this.canvas.width);
    this.cameraX = Math.min(maxCameraX, Math.max(this.cameraX, targetCameraX));

    this.inputs.jumpPressed = false;
    this.inputs.actionPressed = false;
  }

  // ----------------------------------------------------
  // PLAYER PHYSICS & MOVEMENT
  // ----------------------------------------------------
  private updatePlayer(dt: number) {
    const p = this.player;

    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer -= dt;
    }
    if (p.starTimer > 0) {
      p.starTimer -= dt;
      if (p.starTimer <= 0) {
        sound.stopStarTheme();
      }
    }

    // Jump Buffering & Coyote Time
    if (this.inputs.jumpPressed) {
      p.jumpBufferTimer = 0.15;
    } else if (p.jumpBufferTimer > 0) {
      p.jumpBufferTimer -= dt;
    }

    if (p.isGrounded) {
      p.coyoteTimer = 0.11;
    } else if (p.coyoteTimer > 0) {
      p.coyoteTimer -= dt;
    }

    // Responsive Horizontal Movement & Acceleration
    const isRunning = this.inputs.action;
    const maxSpeed = isRunning ? 5.5 : 3.7;
    const accel = p.isGrounded ? (isRunning ? 15 : 12) : 9.5;
    const friction = p.isGrounded ? 11 : 3.0;

    p.isCrouching = this.inputs.down && !this.inputs.left && !this.inputs.right && p.isGrounded && p.powerTier !== 'small';

    if (p.isCrouching) {
      p.vx *= Math.pow(0.01, dt);
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    } else if (this.inputs.left && !this.inputs.right) {
      p.facing = 'left';
      if (p.vx > 0.6 && p.isGrounded) {
        p.isSkidding = true;
        p.vx -= accel * 2.2 * dt;
        if (this.tickCount % 5 === 0) {
          this.spawnParticle(p.x + p.width / 2, p.y + p.height, 'smoke', 4, '#ffffff');
        }
      } else {
        p.isSkidding = false;
        p.vx = Math.max(-maxSpeed, p.vx - accel * dt);
      }
    } else if (this.inputs.right && !this.inputs.left) {
      p.facing = 'right';
      if (p.vx < -0.6 && p.isGrounded) {
        p.isSkidding = true;
        p.vx += accel * 2.2 * dt;
        if (this.tickCount % 5 === 0) {
          this.spawnParticle(p.x + p.width / 2, p.y + p.height, 'smoke', 4, '#ffffff');
        }
      } else {
        p.isSkidding = false;
        p.vx = Math.min(maxSpeed, p.vx + accel * dt);
      }
    } else {
      p.isSkidding = false;
      if (Math.abs(p.vx) > 0.1) {
        const sign = Math.sign(p.vx);
        p.vx -= sign * friction * dt;
        if (Math.sign(p.vx) !== sign) p.vx = 0;
      } else {
        p.vx = 0;
      }
    }

    // Jump Execution (supports both fresh press buffer and holding jump on landing)
    const wantsToJump = p.jumpBufferTimer > 0 || (this.inputs.jump && p.isGrounded);
    if (wantsToJump && (p.isGrounded || p.coyoteTimer > 0) && !p.isCrouching) {
      const speedBonus = Math.abs(p.vx) > 4.0 ? -0.9 : 0;
      p.vy = -11.4 + speedBonus;
      p.isGrounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      this.inputs.jumpPressed = false;
      sound.playJump(p.powerTier !== 'small');
      this.spawnParticle(p.x + p.width / 2, p.y + p.height, 'smoke', 5, '#ffffff');
    }

    // Variable Jump Height when Jump key is released early
    if (!this.inputs.jump && p.vy < -3.8) {
      p.vy = -3.8;
    }

    // Crisp Mario Gravity (lighter while holding jump going up, heavier falling down)
    const gravity = p.vy < 0 && this.inputs.jump ? 22 : 34;
    p.vy = Math.min(13.5, p.vy + gravity * dt);

    // Fireball shooting
    if (this.inputs.actionPressed && p.powerTier === 'fire' && this.fireballs.length < 3) {
      this.shootFireball();
    }

    // Running Animation
    if (p.isGrounded && Math.abs(p.vx) > 0.2) {
      p.runAnimTimer += Math.abs(p.vx) * dt * 3.2;
      p.runFrame = (Math.floor(p.runAnimTimer) % 2) + 1;
    } else {
      p.runFrame = 0;
      p.runAnimTimer = 0;
    }

    this.resolvePlayerMovement(dt);

    if (p.y > this.currentLevel.heightInTiles * TILE_SIZE + 40) {
      this.killPlayer();
    }

    const flagTileX = this.currentLevel.flagpoleTileX * TILE_SIZE;
    if (p.x + p.width >= flagTileX + 8 && p.x <= flagTileX + 24 && !p.isSlidingPole) {
      this.startFlagpoleSequence();
    }
  }

  // ----------------------------------------------------
  // TILE COLLISION RESOLUTION
  // ----------------------------------------------------
  private resolvePlayerMovement(dt: number) {
    const p = this.player;
    const steps = 2;
    const subDt = dt / steps;

    for (let s = 0; s < steps; s++) {
      p.x += p.vx * 60 * subDt;
      if (p.x < this.cameraX) {
        p.x = this.cameraX;
        p.vx = 0;
      }
      this.checkHorizontalCollisions();

      p.y += p.vy * 60 * subDt;
      p.isGrounded = false;
      this.checkVerticalCollisions();
    }
  }

  private checkHorizontalCollisions() {
    const p = this.player;
    const startTileX = Math.floor(p.x / TILE_SIZE);
    const endTileX = Math.floor((p.x + p.width - 0.01) / TILE_SIZE);
    const startTileY = Math.floor((p.y + 2) / TILE_SIZE);
    const endTileY = Math.floor((p.y + p.height - 2) / TILE_SIZE);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const block = this.getBlock(tx, ty);
        if (!block || !block.solid) continue;

        if (p.vx > 0) {
          p.x = tx * TILE_SIZE - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = (tx + 1) * TILE_SIZE;
          p.vx = 0;
        }
      }
    }
  }

  private checkVerticalCollisions() {
    const p = this.player;
    const startTileX = Math.floor((p.x + 3) / TILE_SIZE);
    const endTileX = Math.floor((p.x + p.width - 3) / TILE_SIZE);
    const startTileY = Math.floor(p.y / TILE_SIZE);
    const endTileY = Math.floor((p.y + p.height) / TILE_SIZE);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const block = this.getBlock(tx, ty);
        if (!block) continue;

        // Hidden block only triggers when jumping up into it from below
        if (block.type === 'hidden' && !block.isRevealed) {
          if (p.vy < 0 && p.y <= (ty + 1) * TILE_SIZE && p.y >= ty * TILE_SIZE) {
            block.isRevealed = true;
            block.solid = true;
            this.hitBlock(tx, ty, block);
            p.y = (ty + 1) * TILE_SIZE;
            p.vy = 1.5;
            return;
          }
          continue;
        }

        if (!block.solid) continue;

        if (p.vy >= 0) {
          const blockTop = ty * TILE_SIZE;
          if (p.y + p.height >= blockTop && p.y + p.height <= blockTop + 18) {
            p.y = blockTop - p.height;
            p.vy = 0;
            p.isGrounded = true;
          }
        } else if (p.vy < 0) {
          const blockBottom = (ty + 1) * TILE_SIZE;
          if (p.y <= blockBottom && p.y >= blockBottom - 18) {
            p.y = blockBottom;
            p.vy = 1.5;
            this.hitBlock(tx, ty, block);
            return; // Only bump one block per headbutt
          }
        }
      }
    }
  }

  // ----------------------------------------------------
  // BLOCK INTERACTION & POWER-UP SPAWNING
  // ----------------------------------------------------
  private hitBlock(tx: number, ty: number, block: Block) {
    block.bumpOffset = 10;

    if (block.type === 'question' || (block.type === 'hidden' && block.isRevealed)) {
      block.type = 'spent';

      if (block.contents === 'coin' || !block.contents) {
        sound.playCoin();
        this.addScore(200, tx * TILE_SIZE + 4, ty * TILE_SIZE - 16);
        this.addCoin();
        this.spawnParticle(tx * TILE_SIZE + 10, ty * TILE_SIZE - 12, 'coin_float', 10, COLORS.COIN_GOLD);
      } else if (block.contents === 'mushroom') {
        const spawnType = this.player.powerTier === 'small' ? 'mushroom' : 'fireflower';
        this.spawnItem(tx * TILE_SIZE + 2, ty * TILE_SIZE, spawnType);
        sound.playPowerUpAppear();
      } else if (block.contents === 'fireflower') {
        this.spawnItem(tx * TILE_SIZE + 2, ty * TILE_SIZE, 'fireflower');
        sound.playPowerUpAppear();
      } else if (block.contents === 'star') {
        this.spawnItem(tx * TILE_SIZE + 2, ty * TILE_SIZE, 'star');
        sound.playPowerUpAppear();
      }
      return;
    }

    if (block.type === 'brick' || block.type === 'underground_brick') {
      if (block.contents === 'multi_coin') {
        sound.playCoin();
        this.addScore(200, tx * TILE_SIZE + 4, ty * TILE_SIZE - 16);
        this.addCoin();
        this.spawnParticle(tx * TILE_SIZE + 10, ty * TILE_SIZE - 12, 'coin_float', 10, COLORS.COIN_GOLD);
        if (block.coinsRemaining !== undefined) {
          block.coinsRemaining--;
          if (block.coinsRemaining <= 0) {
            block.type = 'spent';
          }
        }
        return;
      }

      if (this.player.powerTier !== 'small') {
        sound.playBrickBreak();
        this.screenShake = 2.5;
        block.type = 'empty';
        block.solid = false;
        this.addScore(50, tx * TILE_SIZE, ty * TILE_SIZE);
        const bx = tx * TILE_SIZE + 8;
        const by = ty * TILE_SIZE + 8;
        const brickColor =
          this.currentLevel.theme === 'underground' ? COLORS.UNDERGROUND_BRICK_MAIN : COLORS.BRICK_MAIN;
        this.spawnDebris(bx, by, -3.5, -7, brickColor);
        this.spawnDebris(bx + 16, by, 3.5, -7, brickColor);
        this.spawnDebris(bx, by + 16, -2.5, -5, brickColor);
        this.spawnDebris(bx + 16, by + 16, 2.5, -5, brickColor);
      } else {
        sound.playBump();
      }
    }
  }

  private updateBlocks(dt: number) {
    const grid = this.currentLevel.grid;
    const startTileX = Math.max(0, Math.floor(this.cameraX / TILE_SIZE) - 2);
    const endTileX = Math.min(
      this.currentLevel.widthInTiles - 1,
      Math.floor((this.cameraX + this.canvas.width) / TILE_SIZE) + 2
    );

    for (let y = 0; y < grid.length; y++) {
      const row = grid[y];
      for (let x = startTileX; x <= endTileX; x++) {
        const b = row[x];
        if (b.bumpOffset > 0) {
          b.bumpOffset = Math.max(0, b.bumpOffset - dt * 55);
        }
      }
    }
  }

  // ----------------------------------------------------
  // COLLECTIBLE ITEMS
  // ----------------------------------------------------
  private spawnItem(x: number, y: number, type: 'mushroom' | 'fireflower' | 'star' | 'coin') {
    this.items.push({
      id: `item_${this.tickCount}`,
      type,
      x,
      y,
      vx: type === 'fireflower' ? 0 : 1.9,
      vy: type === 'star' ? -6 : 0,
      width: 28,
      height: 28,
      isGrounded: false,
      animTimer: 0,
      animFrame: 0,
      isRisingFromBlock: true,
      riseTargetY: y - TILE_SIZE,
    });
  }

  private updateItems(dt: number) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];

      if (it.isRisingFromBlock) {
        it.y -= dt * 48;
        if (it.y <= it.riseTargetY) {
          it.y = it.riseTargetY;
          it.isRisingFromBlock = false;
        }
        continue;
      }

      if (it.type === 'mushroom') {
        it.vy = Math.min(10, it.vy + 26 * dt);
        it.x += it.vx * 60 * dt;
        it.y += it.vy * 60 * dt;

        const tx = Math.floor((it.vx > 0 ? it.x + it.width : it.x) / TILE_SIZE);
        const ty = Math.floor((it.y + it.height / 2) / TILE_SIZE);
        const wallBlock = this.getBlock(tx, ty);
        if (wallBlock && wallBlock.solid) {
          it.vx = -it.vx;
        }

        const footY = Math.floor((it.y + it.height) / TILE_SIZE);
        const footBlock = this.getBlock(Math.floor((it.x + 14) / TILE_SIZE), footY);
        if (footBlock && footBlock.solid) {
          it.y = footY * TILE_SIZE - it.height;
          it.vy = 0;
          it.isGrounded = true;
        }
      } else if (it.type === 'star') {
        it.vy += 22 * dt;
        it.x += it.vx * 60 * dt;
        it.y += it.vy * 60 * dt;

        const footY = Math.floor((it.y + it.height) / TILE_SIZE);
        const footBlock = this.getBlock(Math.floor((it.x + 14) / TILE_SIZE), footY);
        if (footBlock && footBlock.solid && it.vy > 0) {
          it.y = footY * TILE_SIZE - it.height;
          it.vy = -7.5;
        }

        const tx = Math.floor((it.vx > 0 ? it.x + it.width : it.x) / TILE_SIZE);
        const ty = Math.floor((it.y + it.height / 2) / TILE_SIZE);
        const wallBlock = this.getBlock(tx, ty);
        if (wallBlock && wallBlock.solid) {
          it.vx = -it.vx;
        }
      }

      if (this.checkAABB(this.player, it)) {
        this.collectItem(it);
        this.items.splice(i, 1);
      }
    }
  }

  private collectItem(it: Item) {
    if (it.type === 'mushroom') {
      sound.playPowerUpCollect();
      this.addScore(1000, it.x, it.y);
      if (this.player.powerTier === 'small') {
        this.player.powerTier = 'super';
        this.player.height = 48;
        this.player.width = 26;
        this.player.y -= 20;
      }
      this.hitstopTimer = 0.04;
    } else if (it.type === 'fireflower') {
      sound.playPowerUpCollect();
      this.addScore(1000, it.x, it.y);
      if (this.player.powerTier === 'small') {
        this.player.y -= 20;
      }
      this.player.powerTier = 'fire';
      this.player.height = 48;
      this.player.width = 26;
      this.hitstopTimer = 0.04;
    } else if (it.type === 'star') {
      sound.playPowerUpCollect();
      this.addScore(1000, it.x, it.y);
      this.player.starTimer = 12.0;
      sound.startStarTheme();
    }
    this.notifyStats();
  }

  // ----------------------------------------------------
  // FIREBALL PROJECTILES
  // ----------------------------------------------------
  private shootFireball() {
    sound.playFireball();
    const p = this.player;
    const dir = p.facing === 'right' ? 1 : -1;
    this.fireballs.push({
      id: `fb_${this.tickCount}`,
      x: dir > 0 ? p.x + p.width : p.x - 12,
      y: p.y + 18,
      vx: dir * 7.8,
      vy: 2.0,
      width: 12,
      height: 12,
      isGrounded: false,
      lifeTimer: 2.2,
    });
  }

  private updateFireballs(dt: number) {
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.lifeTimer -= dt;

      fb.vy = Math.min(8, fb.vy + 26 * dt);
      fb.x += fb.vx * 60 * dt;
      fb.y += fb.vy * 60 * dt;

      const footY = Math.floor((fb.y + fb.height) / TILE_SIZE);
      const footBlock = this.getBlock(Math.floor((fb.x + 6) / TILE_SIZE), footY);
      if (footBlock && footBlock.solid && fb.vy > 0) {
        fb.y = footY * TILE_SIZE - fb.height;
        fb.vy = -5.2;
      }

      const tx = Math.floor((fb.vx > 0 ? fb.x + fb.width : fb.x) / TILE_SIZE);
      const ty = Math.floor((fb.y + 6) / TILE_SIZE);
      const wallBlock = this.getBlock(tx, ty);
      let exploded = false;

      if (wallBlock && wallBlock.solid) {
        exploded = true;
      }

      for (let eIdx = 0; eIdx < this.enemies.length; eIdx++) {
        const enemy = this.enemies[eIdx];
        if (enemy.state === 'dead' || enemy.state === 'flattened') continue;

        if (this.checkAABB(fb, enemy)) {
          sound.playKick();
          enemy.state = 'dead';
          enemy.vy = -7;
          this.addScore(200, enemy.x, enemy.y);
          this.spawnParticle(enemy.x + 14, enemy.y + 14, 'smoke', 7, '#ff8800');
          exploded = true;
          break;
        }
      }

      if (exploded || fb.lifeTimer <= 0) {
        this.spawnParticle(fb.x + 6, fb.y + 6, 'smoke', 5, '#ff4400');
        this.fireballs.splice(i, 1);
      }
    }
  }

  // ----------------------------------------------------
  // ENEMIES & SHELL KICKING PHYSICS
  // ----------------------------------------------------
  private updateEnemies(dt: number) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.state === 'dead') {
        e.vy += 28 * dt;
        e.y += e.vy * 60 * dt;
        if (e.y > this.canvas.height + 60) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      if (e.state === 'flattened') {
        e.stateTimer += dt;
        if (e.stateTimer > 0.45) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      e.animTimer += dt * 6;
      e.animFrame = Math.floor(e.animTimer) % 2;

      if (e.x > this.cameraX + this.canvas.width + 120 || e.x < this.cameraX - 160) {
        continue;
      }

      e.vy = Math.min(12, e.vy + 26 * dt);
      e.y += e.vy * 60 * dt;

      const footY = Math.floor((e.y + e.height) / TILE_SIZE);
      const footBlock = this.getBlock(Math.floor((e.x + e.width / 2) / TILE_SIZE), footY);
      if (footBlock && footBlock.solid) {
        e.y = footY * TILE_SIZE - e.height;
        e.vy = 0;
      }

      if (e.state === 'walk') {
        e.x += e.vx * 60 * dt;
        const tx = Math.floor((e.vx > 0 ? e.x + e.width : e.x) / TILE_SIZE);
        const ty = Math.floor((e.y + e.height / 2) / TILE_SIZE);
        const wallBlock = this.getBlock(tx, ty);
        if (wallBlock && wallBlock.solid) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 'right' : 'left';
        }
      } else if (e.state === 'shell_moving') {
        e.x += e.vx * 60 * dt;
        const tx = Math.floor((e.vx > 0 ? e.x + e.width : e.x) / TILE_SIZE);
        const ty = Math.floor((e.y + e.height / 2) / TILE_SIZE);
        const wallBlock = this.getBlock(tx, ty);
        if (wallBlock && wallBlock.solid) {
          e.vx = -e.vx;
          sound.playBump();
          this.screenShake = 1.5;
        }

        for (let j = 0; j < this.enemies.length; j++) {
          const other = this.enemies[j];
          if (other === e || other.state === 'dead' || other.state === 'flattened') continue;
          if (this.checkAABB(e, other)) {
            other.state = 'dead';
            other.vy = -8;
            sound.playKick();
            this.addScore(400, other.x, other.y);
            this.spawnParticle(other.x + 14, other.y + 14, 'smoke', 7, '#ffffff');
          }
        }
      }

      if (this.checkAABB(p, e)) {
        if (p.starTimer > 0) {
          sound.playKick();
          e.state = 'dead';
          e.vy = -8;
          this.addScore(200, e.x, e.y);
          this.spawnParticle(e.x + 14, e.y + 14, 'sparkle', 8, '#ffff00');
          continue;
        }

        const isStomp = p.vy > 0 && p.y + p.height <= e.y + 22;

        if (isStomp) {
          p.vy = this.inputs.jump || p.jumpBufferTimer > 0 ? -11.2 : -7.0;
          p.jumpBufferTimer = 0;
          this.hitstopTimer = 0.03;

          if (e.type === 'goomba') {
            sound.playStomp();
            e.state = 'flattened';
            e.stateTimer = 0;
            this.addScore(100, e.x, e.y);
          } else if (e.type === 'koopa') {
            sound.playStomp();
            if (e.state === 'walk') {
              e.state = 'shell_idle';
              e.height = 28;
              e.y += 12;
              e.vx = 0;
              this.addScore(200, e.x, e.y);
            } else if (e.state === 'shell_moving') {
              e.state = 'shell_idle';
              e.vx = 0;
              this.addScore(100, e.x, e.y);
            } else if (e.state === 'shell_idle') {
              e.state = 'shell_moving';
              e.vx = p.facing === 'right' ? 8.5 : -8.5;
              sound.playKick();
            }
          }
        } else {
          if (e.type === 'koopa' && e.state === 'shell_idle') {
            sound.playKick();
            e.state = 'shell_moving';
            e.vx = p.x < e.x ? 8.5 : -8.5;
            e.x += e.vx * 2;
            this.addScore(200, e.x, e.y);
          } else if (p.invulnerableTimer <= 0) {
            this.damagePlayer();
          }
        }
      }
    }
  }

  // ----------------------------------------------------
  // DAMAGE & DEATH
  // ----------------------------------------------------
  private damagePlayer() {
    const p = this.player;
    if (p.powerTier === 'fire') {
      sound.playPipe();
      p.powerTier = 'super';
      p.invulnerableTimer = 2.0;
      this.hitstopTimer = 0.06;
      this.screenShake = 3;
    } else if (p.powerTier === 'super') {
      sound.playPipe();
      p.powerTier = 'small';
      p.height = 28;
      p.width = 22;
      p.invulnerableTimer = 2.0;
      this.hitstopTimer = 0.06;
      this.screenShake = 3;
    } else {
      this.killPlayer();
    }
    this.notifyStats();
  }

  private killPlayer() {
    if (this.player.isDead) return;
    this.player.isDead = true;
    this.player.deathTimer = 0;
    this.player.vy = -10.5;
    this.player.vx = 0;
    sound.stopStarTheme();
    sound.playDeath();
    this.screenShake = 4;
  }

  // ----------------------------------------------------
  // FLAGPOLE CELEBRATION SEQUENCE
  // ----------------------------------------------------
  private startFlagpoleSequence() {
    this.flagpoleState = 'sliding';
    this.player.isSlidingPole = true;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.x = this.currentLevel.flagpoleTileX * TILE_SIZE - 4;
    this.flagpoleTargetY = (this.currentLevel.flagpoleTileY - 1) * TILE_SIZE;
    this.castleTargetX = this.currentLevel.castleTileX * TILE_SIZE + 10;
    sound.stopStarTheme();
    sound.playFlagpole();
    this.addScore(1000, this.player.x, this.player.y);
  }

  private updateFlagpoleSequence(dt: number) {
    const p = this.player;

    if (this.flagpoleState === 'sliding') {
      p.y = Math.min(this.flagpoleTargetY, p.y + dt * 160);
      this.flagY = Math.min(this.flagpoleTargetY, this.flagY + dt * 160);

      if (p.y >= this.flagpoleTargetY) {
        this.flagpoleState = 'walking_to_castle';
        p.isSlidingPole = false;
        p.facing = 'right';
        p.x += 16;
        p.y = (this.currentLevel.heightInTiles - 2) * TILE_SIZE - p.height;
      }
    } else if (this.flagpoleState === 'walking_to_castle') {
      p.vx = 2.5;
      p.x += p.vx * 60 * dt;
      p.runAnimTimer += dt * 8;
      p.runFrame = (Math.floor(p.runAnimTimer) % 2) + 1;

      if (p.x >= this.castleTargetX) {
        this.flagpoleState = 'entered_castle';
        const bonus = this.stats.timeRemaining * 50;
        this.stats.score += bonus;
        this.stats.timeRemaining = 0;
        if (this.stats.score > this.stats.highScore) {
          this.stats.highScore = this.stats.score;
          localStorage.setItem('mario_high_score', this.stats.highScore.toString());
        }
        this.notifyStats(true);

        setTimeout(() => {
          if (this.currentLevelIdx < LEVELS.length - 1) {
            this.loadLevel(this.currentLevelIdx + 1);
            this.mode = 'PLAYING';
          } else {
            this.mode = 'STAGE_CLEAR';
          }
          this.notifyStats(true);
        }, 1000);
      }
    }
  }

  // ----------------------------------------------------
  // FAST PARTICLES & SCORE POPUPS (Swap-and-Pop, Capped)
  // ----------------------------------------------------
  private addParticleObj(p: Particle) {
    if (this.particles.length >= MAX_PARTICLES) {
      this.particles[0] = p;
    } else {
      this.particles.push(p);
    }
  }

  private spawnParticle(x: number, y: number, type: Particle['type'], size: number, color: string) {
    this.addParticleObj({
      id: '',
      x,
      y,
      vx: (Math.random() - 0.5) * 3.5,
      vy: (Math.random() - 0.5) * 3.5 - 1.8,
      type,
      size,
      color,
      rotation: 0,
      rotationSpeed: 0,
      life: 0.45,
      maxLife: 0.45,
    });
  }

  private spawnDebris(x: number, y: number, vx: number, vy: number, color: string) {
    this.addParticleObj({
      id: '',
      x,
      y,
      vx,
      vy,
      type: 'brick_debris',
      size: 10,
      color,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 12,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  private addScore(amount: number, x: number, y: number) {
    this.stats.score += amount;
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('mario_high_score', this.stats.highScore.toString());
    }
    this.addParticleObj({
      id: '',
      x,
      y,
      vx: 0,
      vy: -1.4,
      type: 'sparkle',
      size: 12,
      rotation: 0,
      rotationSpeed: 0,
      life: 0.65,
      maxLife: 0.65,
      text: `+${amount}`,
    });
    this.notifyStats();
  }

  private addCoin() {
    this.stats.coins++;
    if (this.stats.coins >= 100) {
      this.stats.coins = 0;
      this.stats.lives++;
      sound.playPowerUpCollect();
    }
    this.notifyStats();
  }

  private updateParticles(dt: number) {
    let i = 0;
    while (i < this.particles.length) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        // O(1) swap-and-pop removal
        const last = this.particles.pop()!;
        if (i < this.particles.length) {
          this.particles[i] = last;
        }
        continue;
      }

      if (p.type === 'brick_debris') {
        p.vy += 24 * dt;
      }
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      i++;
    }
  }

  // ----------------------------------------------------
  // HELPERS
  // ----------------------------------------------------
  private getBlock(tx: number, ty: number): Block | null {
    if (ty < 0 || ty >= this.currentLevel.heightInTiles) return null;
    if (tx < 0 || tx >= this.currentLevel.widthInTiles) return null;
    return this.currentLevel.grid[ty][tx];
  }

  private checkAABB(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // ----------------------------------------------------
  // RENDER PIPELINE
  // ----------------------------------------------------
  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const camX = this.cameraX | 0;

    ctx.save();

    if (this.screenShake > 0) {
      const shakeX = ((Math.random() - 0.5) * this.screenShake * 2) | 0;
      const shakeY = ((Math.random() - 0.5) * this.screenShake * 2) | 0;
      ctx.translate(shakeX, shakeY);
    }

    ctx.fillStyle = this.currentLevel.bgColor;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-camX, 0);

    // Scenery culled to visible camera bounds
    if (this.currentLevel.theme !== 'underground') {
      if (40 + 120 >= camX && 40 <= camX + w) drawHill(ctx, 40, h - 180, 80);
      if (420 + 120 >= camX && 420 <= camX + w) drawHill(ctx, 420, h - 210, 110);
      if (800 + 120 >= camX && 800 <= camX + w) drawHill(ctx, 800, h - 190, 90);
      if (1300 + 120 >= camX && 1300 <= camX + w) drawHill(ctx, 1300, h - 200, 100);

      if (160 + 48 >= camX && 160 <= camX + w) drawBush(ctx, 160, h - 85);
      if (560 + 48 >= camX && 560 <= camX + w) drawBush(ctx, 560, h - 85);
      if (940 + 48 >= camX && 940 <= camX + w) drawBush(ctx, 940, h - 85);

      if (80 + 112 >= camX && 80 <= camX + w) drawCloud(ctx, 80, 50, 'large');
      if (360 + 64 >= camX && 360 <= camX + w) drawCloud(ctx, 360, 90, 'small');
      if (620 + 112 >= camX && 620 <= camX + w) drawCloud(ctx, 620, 40, 'large');
      if (980 + 64 >= camX && 980 <= camX + w) drawCloud(ctx, 980, 70, 'small');
      if (1260 + 112 >= camX && 1260 <= camX + w) drawCloud(ctx, 1260, 50, 'large');
    }

    const startTileX = Math.max(0, Math.floor(camX / TILE_SIZE));
    const endTileX = Math.min(
      this.currentLevel.widthInTiles - 1,
      Math.floor((camX + w) / TILE_SIZE) + 1
    );

    const grid = this.currentLevel.grid;
    for (let y = 0; y < grid.length; y++) {
      const row = grid[y];
      for (let x = startTileX; x <= endTileX; x++) {
        const block = row[x];
        if (block.type === 'empty') continue;
        if (block.type === 'hidden' && !block.isRevealed) continue;

        drawTile(
          ctx,
          block.type,
          x * TILE_SIZE,
          y * TILE_SIZE,
          this.tickCount,
          this.currentLevel.theme,
          block.bumpOffset
        );
      }
    }

    if (this.currentLevel.flagpoleTileX >= startTileX && this.currentLevel.flagpoleTileX <= endTileX) {
      const fx = this.currentLevel.flagpoleTileX * TILE_SIZE - 20;
      ctx.fillStyle = '#00a800';
      ctx.beginPath();
      ctx.moveTo(fx, this.flagY);
      ctx.lineTo(fx + 20, this.flagY + 10);
      ctx.lineTo(fx, this.flagY + 20);
      ctx.closePath();
      ctx.fill();
    }

    for (let i = 0; i < this.items.length; i++) {
      drawItem(ctx, this.items[i], this.tickCount);
    }

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.x + e.width >= camX && e.x <= camX + w) {
        drawEnemy(ctx, e);
      }
    }

    for (let i = 0; i < this.fireballs.length; i++) {
      drawFireball(ctx, this.fireballs[i], this.tickCount);
    }

    if (this.flagpoleState !== 'entered_castle') {
      drawPlayer(ctx, this.player, this.tickCount);
    }

    // Fast Particle Rendering (no per-particle save/restore/rotate/strokeText overhead)
    ctx.font = '10px "Press Start 2P", monospace';
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const px = p.x | 0;
      const py = p.y | 0;

      if (p.text) {
        ctx.fillStyle = '#000000';
        ctx.fillText(p.text, px + 1, py + 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.text, px, py);
      } else if (p.type === 'brick_debris') {
        ctx.fillStyle = p.color || COLORS.BRICK_MAIN;
        ctx.fillRect(px - 5, py - 5, 10, 10);
      } else if (p.type === 'coin_float') {
        ctx.fillStyle = COLORS.COIN_GOLD;
        ctx.fillRect(px - 5, py - 9, 10, 18);
      } else {
        ctx.fillStyle = p.color || '#ffffff';
        ctx.fillRect(px - (p.size >> 1), py - (p.size >> 1), p.size, p.size);
      }
    }

    ctx.restore();
    ctx.restore();
  }
}
