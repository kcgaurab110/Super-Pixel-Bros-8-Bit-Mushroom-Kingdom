import { BlockType, PowerTier } from './types';

export const TILE_SIZE = 32; // Each world tile is 32x32 pixels

// Color Palette Constants
export const COLORS = {
  MARIO_RED: '#d82800',
  MARIO_BLUE: '#0048d0',
  MARIO_SKIN: '#fcb870',
  MARIO_BROWN: '#804000',
  MARIO_WHITE: '#ffffff',

  SKY_BLUE: '#5c94fc',
  SKY_NIGHT: '#000000',
  UNDERGROUND_BG: '#080814',

  GROUND_TOP: '#00a800',
  GROUND_DIRT: '#b85400',
  GROUND_DARK: '#682000',

  UNDERGROUND_TOP: '#0078a8',
  UNDERGROUND_DIRT: '#004068',

  BRICK_MAIN: '#d85800',
  BRICK_LINE: '#000000',
  BRICK_SHADOW: '#903000',

  UNDERGROUND_BRICK_MAIN: '#008888',
  UNDERGROUND_BRICK_LINE: '#003838',
  UNDERGROUND_BRICK_SHADOW: '#005858',

  QUESTION_MAIN: '#fcb800',
  QUESTION_SHADOW: '#b87800',
  QUESTION_DOT: '#ffffff',
  QUESTION_BORDER: '#000000',

  SPENT_BLOCK: '#8c5028',
  SPENT_BORDER: '#402010',

  PIPE_LIGHT: '#80d010',
  PIPE_MID: '#00a800',
  PIPE_DARK: '#005000',
  PIPE_BORDER: '#000000',

  COIN_GOLD: '#f8b800',
  COIN_LIGHT: '#fcff00',
  COIN_SHADOW: '#b87800',

  GOOMBA_BROWN: '#b85400',
  GOOMBA_DARK: '#682000',
  GOOMBA_BEIGE: '#fcb870',
  GOOMBA_FOOT: '#402000',

  KOOPA_GREEN: '#00a800',
  KOOPA_YELLOW: '#fcb800',
  KOOPA_SHELL_DARK: '#005000',
  KOOPA_BEIGE: '#fcb870',

  STAR_COLORS: ['#ff3333', '#ffff33', '#33ff33', '#33ffff', '#ff33ff', '#ffffff'],
};

/**
 * Offscreen Tile Sprite Cache for 60fps Zero-Overhead Tilemap Rendering
 */
const tileCache = new Map<string, HTMLCanvasElement>();

function renderTileToContext(
  ctx: CanvasRenderingContext2D,
  type: BlockType,
  theme: 'overworld' | 'underground' | 'highland',
  qBlinkFrame: number
) {
  const s = TILE_SIZE;
  const x = 0;
  const drawY = 0;

  switch (type) {
    case 'ground': {
      ctx.fillStyle = COLORS.GROUND_TOP;
      ctx.fillRect(x, drawY, s, 6);
      ctx.fillStyle = COLORS.GROUND_DIRT;
      ctx.fillRect(x, drawY + 6, s, s - 6);
      ctx.fillStyle = COLORS.GROUND_DARK;
      for (let i = 0; i < s; i += 8) {
        ctx.fillRect(x + i + 2, drawY + 4, 3, 2);
      }
      ctx.fillRect(x + 4, drawY + 12, 4, 4);
      ctx.fillRect(x + 18, drawY + 20, 6, 4);
      ctx.fillRect(x + 10, drawY + 24, 4, 3);
      break;
    }

    case 'underground_ground': {
      ctx.fillStyle = COLORS.UNDERGROUND_TOP;
      ctx.fillRect(x, drawY, s, 6);
      ctx.fillStyle = COLORS.UNDERGROUND_DIRT;
      ctx.fillRect(x, drawY + 6, s, s - 6);
      ctx.fillStyle = '#00a8e8';
      ctx.fillRect(x + 4, drawY + 14, 5, 4);
      ctx.fillRect(x + 18, drawY + 22, 6, 4);
      break;
    }

    case 'brick':
    case 'underground_brick': {
      const isUnder = type === 'underground_brick' || theme === 'underground';
      const mainColor = isUnder ? COLORS.UNDERGROUND_BRICK_MAIN : COLORS.BRICK_MAIN;
      const lineColor = isUnder ? COLORS.UNDERGROUND_BRICK_LINE : COLORS.BRICK_LINE;
      const shadowColor = isUnder ? COLORS.UNDERGROUND_BRICK_SHADOW : COLORS.BRICK_SHADOW;

      ctx.fillStyle = mainColor;
      ctx.fillRect(x, drawY, s, s);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, drawY + 1, s - 2, s - 2);

      ctx.fillStyle = lineColor;
      ctx.fillRect(x, drawY + s / 2 - 1, s, 2);
      ctx.fillRect(x + s / 2 - 1, drawY, 2, s / 2);
      ctx.fillRect(x + s / 4 - 1, drawY + s / 2, 2, s / 2);
      ctx.fillRect(x + (3 * s) / 4 - 1, drawY + s / 2, 2, s / 2);

      ctx.fillStyle = shadowColor;
      ctx.fillRect(x + 2, drawY + 2, 4, 2);
      ctx.fillRect(x + s / 2 + 3, drawY + 2, 4, 2);
      ctx.fillRect(x + 3, drawY + s / 2 + 2, 3, 2);
      break;
    }

    case 'question': {
      ctx.fillStyle = COLORS.QUESTION_MAIN;
      ctx.fillRect(x, drawY, s, s);

      ctx.fillStyle = '#ffdf78';
      ctx.fillRect(x, drawY, s, 3);
      ctx.fillRect(x, drawY, 3, s);
      ctx.fillStyle = COLORS.QUESTION_SHADOW;
      ctx.fillRect(x, drawY + s - 3, s, 3);
      ctx.fillRect(x + s - 3, drawY, 3, s);

      ctx.fillStyle = COLORS.QUESTION_BORDER;
      ctx.fillRect(x + 4, drawY + 4, 2, 2);
      ctx.fillRect(x + s - 6, drawY + 4, 2, 2);
      ctx.fillRect(x + 4, drawY + s - 6, 2, 2);
      ctx.fillRect(x + s - 6, drawY + s - 6, 2, 2);

      ctx.fillStyle = qBlinkFrame === 0 ? COLORS.QUESTION_DOT : '#ffe6a0';
      ctx.fillRect(x + 10, drawY + 8, 12, 3);
      ctx.fillRect(x + 8, drawY + 9, 3, 5);
      ctx.fillRect(x + 21, drawY + 9, 3, 6);
      ctx.fillRect(x + 16, drawY + 14, 5, 4);
      ctx.fillRect(x + 14, drawY + 17, 4, 4);
      ctx.fillRect(x + 14, drawY + 23, 4, 4);

      ctx.fillStyle = COLORS.QUESTION_SHADOW;
      ctx.fillRect(x + 18, drawY + 23, 2, 4);
      break;
    }

    case 'spent': {
      ctx.fillStyle = COLORS.SPENT_BLOCK;
      ctx.fillRect(x, drawY, s, s);
      ctx.strokeStyle = COLORS.SPENT_BORDER;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, drawY + 1, s - 2, s - 2);

      ctx.fillStyle = COLORS.SPENT_BORDER;
      ctx.fillRect(x + 4, drawY + 4, 3, 3);
      ctx.fillRect(x + s - 7, drawY + 4, 3, 3);
      ctx.fillRect(x + 4, drawY + s - 7, 3, 3);
      ctx.fillRect(x + s - 7, drawY + s - 7, 3, 3);
      break;
    }

    case 'pipe_tl': {
      ctx.fillStyle = COLORS.PIPE_MID;
      ctx.fillRect(x, drawY, s, s);
      ctx.fillStyle = COLORS.PIPE_LIGHT;
      ctx.fillRect(x + 3, drawY + 3, 6, s - 3);
      ctx.fillStyle = COLORS.PIPE_BORDER;
      ctx.fillRect(x, drawY, s, 3);
      ctx.fillRect(x, drawY, 3, s);
      ctx.fillRect(x, drawY + s - 3, s, 3);
      break;
    }
    case 'pipe_tr': {
      ctx.fillStyle = COLORS.PIPE_MID;
      ctx.fillRect(x, drawY, s, s);
      ctx.fillStyle = COLORS.PIPE_DARK;
      ctx.fillRect(x + s - 8, drawY + 3, 5, s - 3);
      ctx.fillStyle = COLORS.PIPE_BORDER;
      ctx.fillRect(x, drawY, s, 3);
      ctx.fillRect(x + s - 3, drawY, 3, s);
      ctx.fillRect(x, drawY + s - 3, s, 3);
      break;
    }
    case 'pipe_bl': {
      ctx.fillStyle = COLORS.PIPE_MID;
      ctx.fillRect(x + 3, drawY, s - 3, s);
      ctx.fillStyle = COLORS.PIPE_LIGHT;
      ctx.fillRect(x + 6, drawY, 5, s);
      ctx.fillStyle = COLORS.PIPE_BORDER;
      ctx.fillRect(x + 3, drawY, 3, s);
      break;
    }
    case 'pipe_br': {
      ctx.fillStyle = COLORS.PIPE_MID;
      ctx.fillRect(x, drawY, s - 3, s);
      ctx.fillStyle = COLORS.PIPE_DARK;
      ctx.fillRect(x + s - 8, drawY, 5, s);
      ctx.fillStyle = COLORS.PIPE_BORDER;
      ctx.fillRect(x + s - 6, drawY, 3, s);
      break;
    }

    case 'flagpole_top': {
      ctx.fillStyle = '#f8b800';
      ctx.beginPath();
      ctx.arc(x + s / 2, drawY + s - 6, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + s / 2 - 2, drawY + s - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'flagpole_pole': {
      ctx.fillStyle = '#50d030';
      ctx.fillRect(x + s / 2 - 3, drawY, 6, s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + s / 2 - 2, drawY, 2, s);
      ctx.fillStyle = '#006000';
      ctx.fillRect(x + s / 2 + 1, drawY, 2, s);
      break;
    }
    case 'flagpole_base': {
      ctx.fillStyle = '#50d030';
      ctx.fillRect(x + s / 2 - 3, drawY, 6, s - 10);
      ctx.fillStyle = COLORS.BRICK_MAIN;
      ctx.fillRect(x + 4, drawY + s - 12, s - 8, 12);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 4, drawY + s - 12, s - 8, 12);
      break;
    }

    case 'castle_wall': {
      ctx.fillStyle = '#b85400';
      ctx.fillRect(x, drawY, s, s);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, drawY, s, s);
      ctx.fillStyle = '#682000';
      ctx.fillRect(x + 4, drawY + 8, 8, 4);
      ctx.fillRect(x + 18, drawY + 20, 8, 4);
      break;
    }
    case 'castle_door': {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x + s / 2, drawY + s / 2, s / 2, Math.PI, 0);
      ctx.lineTo(x + s, drawY + s);
      ctx.lineTo(x, drawY + s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'castle_roof': {
      ctx.fillStyle = '#b85400';
      ctx.fillRect(x, drawY + s / 2, s, s / 2);
      ctx.fillRect(x + 4, drawY, 10, s / 2);
      ctx.fillRect(x + s - 14, drawY, 10, s / 2);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 4, drawY, 10, s / 2);
      ctx.strokeRect(x + s - 14, drawY, 10, s / 2);
      break;
    }

    case 'wood_platform': {
      ctx.fillStyle = '#e07000';
      ctx.fillRect(x, drawY, s, 10);
      ctx.fillStyle = '#904000';
      ctx.fillRect(x, drawY + 10, s, 4);
      ctx.fillStyle = '#402000';
      for (let i = 4; i < s; i += 10) {
        ctx.fillRect(x + i, drawY + 2, 2, 6);
      }
      break;
    }
    case 'mushroom_cap_l': {
      ctx.fillStyle = '#ff4040';
      ctx.beginPath();
      ctx.arc(x + s, drawY + s, s, Math.PI, 1.5 * Math.PI);
      ctx.lineTo(x + s, drawY + s);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + s - 8, drawY + s - 8, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mushroom_cap_m': {
      ctx.fillStyle = '#ff4040';
      ctx.fillRect(x, drawY, s, s);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + s / 2, drawY + s / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mushroom_cap_r': {
      ctx.fillStyle = '#ff4040';
      ctx.beginPath();
      ctx.arc(x, drawY + s, s, 1.5 * Math.PI, 2 * Math.PI);
      ctx.lineTo(x, drawY + s);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + 8, drawY + s - 8, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mushroom_stem': {
      ctx.fillStyle = '#fcb870';
      ctx.fillRect(x + s / 2 - 6, drawY, 12, s);
      ctx.fillStyle = '#e09850';
      ctx.fillRect(x + s / 2 + 2, drawY, 4, s);
      break;
    }
    default:
      break;
  }
}

function getCachedTile(
  type: BlockType,
  theme: 'overworld' | 'underground' | 'highland',
  qBlinkFrame: number
): HTMLCanvasElement {
  const key = type === 'question' ? `q_${qBlinkFrame}` : `${type}_${theme}`;
  let cached = tileCache.get(key);
  if (!cached) {
    cached = document.createElement('canvas');
    cached.width = TILE_SIZE;
    cached.height = TILE_SIZE;
    const cctx = cached.getContext('2d');
    if (cctx) {
      renderTileToContext(cctx, type, theme, qBlinkFrame);
    }
    tileCache.set(key, cached);
  }
  return cached;
}

/**
 * Draws a tile at (x, y) using hardware-accelerated offscreen canvas blitting
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  type: BlockType,
  x: number,
  y: number,
  tick: number,
  theme: 'overworld' | 'underground' | 'highland' = 'overworld',
  bumpOffset: number = 0
) {
  if (type === 'empty') return;
  const qBlinkFrame = type === 'question' ? (Math.floor(tick / 20) % 2) : 0;
  const cached = getCachedTile(type, theme, qBlinkFrame);
  ctx.drawImage(cached, x, (y - bumpOffset) | 0);
}

/**
 * Draws the player hero character
 */
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    powerTier: PowerTier;
    facing: 'left' | 'right';
    isGrounded: boolean;
    isCrouching: boolean;
    isSkidding: boolean;
    isSlidingPole: boolean;
    runFrame: number;
    invulnerableTimer: number;
    starTimer: number;
    isDead: boolean;
  },
  tick: number
) {
  if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(player.x | 0, player.y | 0);

  if (player.facing === 'left') {
    ctx.scale(-1, 1);
    ctx.translate(-player.width, 0);
  }

  let shirtColor = COLORS.MARIO_RED;
  let overallsColor = COLORS.MARIO_BLUE;
  const skinColor = COLORS.MARIO_SKIN;
  const shoeColor = COLORS.MARIO_BROWN;

  if (player.powerTier === 'fire') {
    shirtColor = COLORS.MARIO_WHITE;
    overallsColor = COLORS.MARIO_RED;
  }

  if (player.starTimer > 0) {
    const starCycle = Math.floor(tick / 4) % COLORS.STAR_COLORS.length;
    shirtColor = COLORS.STAR_COLORS[starCycle];
    overallsColor = COLORS.STAR_COLORS[(starCycle + 2) % COLORS.STAR_COLORS.length];
  }

  const isSuper = player.powerTier !== 'small';
  const h = player.height;
  const w = player.width;

  if (player.isDead) {
    ctx.fillStyle = shirtColor;
    ctx.fillRect(2, 6, w - 4, h - 12);
    ctx.fillStyle = overallsColor;
    ctx.fillRect(4, h - 8, w - 8, 6);
    ctx.fillStyle = skinColor;
    ctx.fillRect(6, 2, 12, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 4, 3, 2);
    ctx.fillRect(14, 4, 3, 2);
    ctx.restore();
    return;
  }

  if (isSuper) {
    if (player.isCrouching) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 16, 16, 12);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(4, 28, 20, 16);
      ctx.fillStyle = skinColor;
      ctx.fillRect(8, 4, 14, 12);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 0, 18, 6);
      ctx.restore();
      return;
    }

    if (player.isSlidingPole) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(4, 0, 18, 10);
      ctx.fillStyle = skinColor;
      ctx.fillRect(6, 10, 14, 12);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(2, 22, 18, 14);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(4, 36, 16, 14);
      ctx.restore();
      return;
    }

    if (!player.isGrounded) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 0, 20, 8);
      ctx.fillRect(12, 8, 14, 4);
      ctx.fillStyle = skinColor;
      ctx.fillRect(8, 8, 14, 14);
      ctx.fillStyle = '#000000';
      ctx.fillRect(18, 12, 3, 5);
      ctx.fillRect(16, 18, 6, 4);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(2, 22, 14, 12);
      ctx.fillRect(8, 24, 14, 14);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(6, 36, 18, 10);
      ctx.fillRect(2, 44, 8, 8);
      ctx.fillRect(18, 40, 8, 10);
      ctx.fillStyle = shoeColor;
      ctx.fillRect(0, 48, 10, 6);
      ctx.fillRect(18, 48, 10, 6);
    } else if (player.isSkidding) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 2, 18, 8);
      ctx.fillStyle = skinColor;
      ctx.fillRect(8, 10, 14, 12);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(6, 26, 16, 18);
      ctx.fillStyle = shoeColor;
      ctx.fillRect(2, 46, 12, 6);
      ctx.fillRect(16, 46, 10, 6);
    } else {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 0, 18, 8);
      ctx.fillRect(12, 8, 14, 4);
      ctx.fillStyle = skinColor;
      ctx.fillRect(8, 8, 14, 14);
      ctx.fillStyle = '#000000';
      ctx.fillRect(18, 12, 3, 5);
      ctx.fillRect(16, 18, 6, 4);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(4, 22, 18, 12);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(6, 32, 16, 12);

      if (player.runFrame === 0) {
        ctx.fillRect(6, 44, 6, 6);
        ctx.fillRect(16, 44, 6, 6);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(4, 48, 8, 6);
        ctx.fillRect(16, 48, 8, 6);
      } else if (player.runFrame === 1) {
        ctx.fillRect(2, 42, 8, 8);
        ctx.fillRect(16, 42, 8, 8);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(0, 48, 10, 6);
        ctx.fillRect(18, 46, 8, 6);
      } else {
        ctx.fillRect(8, 42, 10, 8);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(4, 48, 14, 6);
      }
    }
  } else {
    if (!player.isGrounded) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 0, 14, 6);
      ctx.fillRect(12, 6, 10, 3);
      ctx.fillStyle = skinColor;
      ctx.fillRect(6, 6, 12, 10);
      ctx.fillStyle = '#000000';
      ctx.fillRect(14, 8, 3, 4);
      ctx.fillRect(12, 13, 5, 3);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(4, 16, 14, 8);
      ctx.fillStyle = shoeColor;
      ctx.fillRect(0, 24, 8, 6);
      ctx.fillRect(14, 22, 8, 6);
    } else if (player.isSkidding) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 2, 14, 6);
      ctx.fillStyle = skinColor;
      ctx.fillRect(6, 8, 12, 8);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(4, 16, 14, 8);
      ctx.fillStyle = shoeColor;
      ctx.fillRect(2, 24, 18, 6);
    } else {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, 0, 14, 6);
      ctx.fillRect(12, 6, 10, 3);
      ctx.fillStyle = skinColor;
      ctx.fillRect(6, 6, 12, 10);
      ctx.fillStyle = '#000000';
      ctx.fillRect(14, 8, 3, 4);
      ctx.fillRect(12, 13, 5, 3);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(4, 16, 14, 8);

      if (player.runFrame === 0) {
        ctx.fillStyle = shoeColor;
        ctx.fillRect(2, 24, 7, 6);
        ctx.fillRect(13, 24, 7, 6);
      } else {
        ctx.fillStyle = shoeColor;
        ctx.fillRect(0, 24, 9, 6);
        ctx.fillRect(14, 22, 8, 6);
      }
    }
  }

  ctx.restore();
}

/**
 * Draws enemies: Goomba, Koopa Troopa
 */
export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: {
    type: 'goomba' | 'koopa' | 'piranha';
    x: number;
    y: number;
    width: number;
    height: number;
    state: string;
    facing: 'left' | 'right';
    animFrame: number;
  }
) {
  ctx.save();
  ctx.translate(enemy.x | 0, enemy.y | 0);

  if (enemy.facing === 'left') {
    ctx.scale(-1, 1);
    ctx.translate(-enemy.width, 0);
  }

  const s = enemy.width;

  if (enemy.type === 'goomba') {
    if (enemy.state === 'flattened') {
      ctx.fillStyle = COLORS.GOOMBA_BROWN;
      ctx.fillRect(2, 16, s - 4, 12);
      ctx.fillStyle = COLORS.GOOMBA_DARK;
      ctx.fillRect(6, 20, 6, 4);
      ctx.fillRect(16, 20, 6, 4);
    } else {
      ctx.fillStyle = COLORS.GOOMBA_BROWN;
      ctx.beginPath();
      ctx.ellipse(s / 2, 12, s / 2 - 2, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.GOOMBA_BEIGE;
      ctx.fillRect(8, 16, s - 16, 8);

      ctx.fillStyle = '#000000';
      ctx.fillRect(6, 6, 6, 2);
      ctx.fillRect(16, 6, 6, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 8, 4, 7);
      ctx.fillRect(17, 8, 4, 7);
      ctx.fillStyle = '#000000';
      ctx.fillRect(9, 10, 2, 5);
      ctx.fillRect(17, 10, 2, 5);

      ctx.fillStyle = COLORS.GOOMBA_FOOT;
      if (enemy.animFrame === 0) {
        ctx.fillRect(2, 24, 10, 6);
        ctx.fillRect(16, 25, 8, 5);
      } else {
        ctx.fillRect(4, 25, 8, 5);
        ctx.fillRect(16, 24, 10, 6);
      }
    }
  } else if (enemy.type === 'koopa') {
    if (enemy.state === 'shell_idle' || enemy.state === 'shell_moving') {
      ctx.fillStyle = COLORS.KOOPA_GREEN;
      ctx.beginPath();
      ctx.arc(s / 2, s / 2 + 4, s / 2 - 2, Math.PI, 0);
      ctx.lineTo(s - 2, s);
      ctx.lineTo(2, s);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = COLORS.KOOPA_YELLOW;
      ctx.fillRect(2, s - 6, s - 4, 6);

      ctx.fillStyle = COLORS.KOOPA_SHELL_DARK;
      ctx.fillRect(10, 12, 10, 8);
      ctx.fillRect(12, 6, 6, 4);
    } else {
      ctx.fillStyle = COLORS.KOOPA_GREEN;
      ctx.fillRect(2, 14, 18, 18);
      ctx.fillStyle = COLORS.KOOPA_YELLOW;
      ctx.fillRect(2, 28, 18, 4);

      ctx.fillStyle = COLORS.KOOPA_YELLOW;
      ctx.fillRect(16, 6, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(22, 8, 4, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(24, 10, 2, 3);
      ctx.fillStyle = '#00a800';
      ctx.fillRect(18, 4, 8, 4);

      ctx.fillStyle = COLORS.KOOPA_YELLOW;
      if (enemy.animFrame === 0) {
        ctx.fillRect(4, 32, 8, 8);
        ctx.fillRect(16, 30, 8, 6);
      } else {
        ctx.fillRect(6, 30, 8, 6);
        ctx.fillRect(14, 32, 8, 8);
      }
    }
  }

  ctx.restore();
}

/**
 * Draws collectibles: Mushroom, Fire Flower, Starman, Spinning Coin
 */
export function drawItem(
  ctx: CanvasRenderingContext2D,
  item: {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    animFrame: number;
  },
  tick: number
) {
  ctx.save();
  ctx.translate(item.x | 0, item.y | 0);

  if (item.type === 'mushroom') {
    ctx.fillStyle = '#d82800';
    ctx.beginPath();
    ctx.arc(14, 14, 13, Math.PI, 0);
    ctx.lineTo(26, 18);
    ctx.lineTo(2, 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14, 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(2, 10, 4, 6);
    ctx.fillRect(22, 10, 4, 6);

    ctx.fillStyle = '#fcb870';
    ctx.fillRect(6, 18, 16, 9);
    ctx.fillStyle = '#000000';
    ctx.fillRect(9, 20, 2, 5);
    ctx.fillRect(17, 20, 2, 5);
  } else if (item.type === 'fireflower') {
    ctx.fillStyle = '#00a800';
    ctx.fillRect(12, 14, 4, 12);
    ctx.fillRect(6, 18, 6, 4);
    ctx.fillRect(16, 18, 6, 4);

    const petalColors = ['#fc3800', '#f8b800', '#ffffff'];
    const pColor = petalColors[Math.floor(tick / 8) % petalColors.length];
    ctx.fillStyle = pColor;
    ctx.beginPath();
    ctx.arc(14, 8, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.fillRect(11, 6, 2, 4);
    ctx.fillRect(15, 6, 2, 4);
  } else if (item.type === 'star') {
    const sColor = COLORS.STAR_COLORS[Math.floor(tick / 4) % COLORS.STAR_COLORS.length];
    ctx.fillStyle = sColor;

    ctx.beginPath();
    const points = 5;
    const outerRadius = 13;
    const innerRadius = 6;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const sx = 14 + Math.cos(angle) * radius;
      const sy = 14 + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.fillRect(11, 10, 2, 4);
    ctx.fillRect(15, 10, 2, 4);
  } else if (item.type === 'coin') {
    const frame = Math.floor(tick / 6) % 4;
    const widths = [16, 12, 6, 12];
    const cw = widths[frame];
    const cx = (28 - cw) / 2;

    ctx.fillStyle = COLORS.COIN_GOLD;
    ctx.fillRect(cx, 4, cw, 20);

    ctx.fillStyle = COLORS.COIN_LIGHT;
    ctx.fillRect(cx + 2, 6, Math.max(2, cw - 4), 16);

    ctx.fillStyle = COLORS.COIN_SHADOW;
    ctx.fillRect(cx + cw / 2 - 1, 8, 2, 12);
  }

  ctx.restore();
}

/**
 * Draws Fireball projectile
 */
export function drawFireball(ctx: CanvasRenderingContext2D, fb: { x: number; y: number }, tick: number) {
  const x = fb.x | 0;
  const y = fb.y | 0;
  const colors = ['#ff3300', '#ff9900', '#ffffff'];
  const c = colors[Math.floor(tick / 4) % colors.length];

  ctx.fillStyle = c;
  ctx.fillRect(x, y, 12, 12);
  ctx.fillStyle = '#ffff66';
  ctx.fillRect(x + 3, y + 3, 6, 6);
}

/**
 * Draws decorative background scenery (Clouds, Hills, Bushes)
 */
export function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: 'small' | 'large' = 'small') {
  ctx.fillStyle = '#ffffff';
  if (size === 'small') {
    ctx.fillRect(x + 16, y, 32, 16);
    ctx.fillRect(x, y + 8, 64, 16);
  } else {
    ctx.fillRect(x + 24, y, 64, 20);
    ctx.fillRect(x, y + 10, 112, 22);
  }
  ctx.fillStyle = '#d0e0fc';
  ctx.fillRect(x + 8, y + 20, size === 'small' ? 48 : 96, 4);
}

export function drawHill(ctx: CanvasRenderingContext2D, x: number, y: number, height: number = 70) {
  ctx.fillStyle = '#00a800';
  ctx.beginPath();
  ctx.ellipse(x + 60, y + height, 60, height, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#007800';
  ctx.beginPath();
  ctx.ellipse(x + 60, y + height, 50, height - 10, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#004800';
  ctx.fillRect(x + 40, y + 30, 4, 8);
  ctx.fillRect(x + 75, y + 25, 4, 8);
  ctx.fillRect(x + 55, y + 45, 4, 8);
}

export function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#80d010';
  ctx.fillRect(x + 10, y, 28, 18);
  ctx.fillRect(x, y + 6, 48, 14);
  ctx.fillStyle = '#00a800';
  ctx.fillRect(x + 6, y + 12, 36, 6);
}
