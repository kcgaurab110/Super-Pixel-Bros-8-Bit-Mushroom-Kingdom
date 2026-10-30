export type PowerTier = 'small' | 'super' | 'fire' | 'star';

export type GameMode = 'TITLE' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  powerTier: PowerTier;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isCrouching: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  invulnerableTimer: number; // Flash after being hit
  starTimer: number;         // Starman invincibility
  runAnimTimer: number;
  runFrame: number;
  isSkidding: boolean;
  isSlidingPole: boolean;
  isDead: boolean;
  deathTimer: number;
}

export type BlockType = 
  | 'empty'
  | 'ground'
  | 'underground_ground'
  | 'brick'
  | 'underground_brick'
  | 'question'
  | 'hidden'
  | 'spent'
  | 'pipe_tl'
  | 'pipe_tr'
  | 'pipe_bl'
  | 'pipe_br'
  | 'flagpole_top'
  | 'flagpole_pole'
  | 'flagpole_base'
  | 'castle_wall'
  | 'castle_door'
  | 'castle_roof'
  | 'wood_platform'
  | 'mushroom_cap_l'
  | 'mushroom_cap_m'
  | 'mushroom_cap_r'
  | 'mushroom_stem';

export interface Block {
  type: BlockType;
  contents?: 'coin' | 'multi_coin' | 'mushroom' | 'fireflower' | 'star';
  coinsRemaining?: number;
  bumpOffset: number; // upward bump spring animation
  isRevealed: boolean; // for hidden blocks
  solid: boolean;
}

export interface Enemy {
  id: string;
  type: 'goomba' | 'koopa' | 'piranha';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  state: 'walk' | 'flattened' | 'shell_idle' | 'shell_moving' | 'dead';
  animTimer: number;
  animFrame: number;
  stateTimer: number;
}

export interface Item {
  id: string;
  type: 'mushroom' | 'fireflower' | 'star' | 'coin';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  animTimer: number;
  animFrame: number;
  isRisingFromBlock: boolean;
  riseTargetY: number;
}

export interface Fireball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  lifeTimer: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'brick_debris' | 'sparkle' | 'smoke' | 'coin_float';
  color?: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface LevelData {
  id: string;
  name: string;
  theme: 'overworld' | 'underground' | 'highland';
  bgColor: string;
  widthInTiles: number;
  heightInTiles: number;
  timeLimit: number;
  grid: Block[][]; // grid[y][x]
  enemies: {
    type: 'goomba' | 'koopa' | 'piranha';
    tileX: number;
    tileY: number;
  }[];
  flagpoleTileX: number;
  flagpoleTileY: number;
  castleTileX: number;
  castleTileY: number;
  warpPipes?: {
    enterTileX: number;
    enterTileY: number;
    exitTileX: number;
    exitTileY: number;
  }[];
}

export interface GameStats {
  score: number;
  coins: number;
  lives: number;
  world: string;
  timeRemaining: number;
  highScore: number;
}
