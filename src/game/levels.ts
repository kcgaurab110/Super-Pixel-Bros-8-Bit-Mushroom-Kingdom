import { Block, LevelData } from './types';

export const LEVEL_HEIGHT_TILES = 14;

function createEmptyGrid(width: number, height: number): Block[][] {
  const grid: Block[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Block[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        type: 'empty',
        bumpOffset: 0,
        isRevealed: false,
        solid: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * World 1-1: Sunny Meadows
 */
export function buildLevel1(): LevelData {
  const width = 110;
  const height = LEVEL_HEIGHT_TILES;
  const grid = createEmptyGrid(width, height);

  // 1. Ground floor (rows 12 and 13) with intentional pits
  for (let x = 0; x < width; x++) {
    // Pits at x=44..46 and x=68..70
    if ((x >= 44 && x <= 46) || (x >= 68 && x <= 70)) {
      continue;
    }
    grid[12][x] = { type: 'ground', bumpOffset: 0, isRevealed: true, solid: true };
    grid[13][x] = { type: 'ground', bumpOffset: 0, isRevealed: true, solid: true };
  }

  // 2. Early Question & Brick formation (x=12..18, y=8)
  grid[8][12] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][14] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][15] = { type: 'question', contents: 'mushroom', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][16] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][17] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][18] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };

  // Hidden 1-UP / Coin Block between blocks at x=13, y=8! (Starts invisible!)
  grid[8][13] = { type: 'hidden', contents: 'coin', bumpOffset: 0, isRevealed: false, solid: false };

  // High Question Block (x=15, y=4)
  grid[4][15] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };

  // 3. Pipes
  // Pipe 1 (x=22..23, height 2)
  grid[10][22] = { type: 'pipe_tl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[10][23] = { type: 'pipe_tr', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][22] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][23] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };

  // Pipe 2 (x=29..30, height 3)
  grid[9][29] = { type: 'pipe_tl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[9][30] = { type: 'pipe_tr', bumpOffset: 0, isRevealed: true, solid: true };
  grid[10][29] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[10][30] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][29] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][30] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };

  // Hidden block near Pipe 2 (x=33, y=8)
  grid[8][33] = { type: 'hidden', contents: 'star', bumpOffset: 0, isRevealed: false, solid: false };

  // Pipe 3 (x=38..39, height 4)
  grid[8][38] = { type: 'pipe_tl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][39] = { type: 'pipe_tr', bumpOffset: 0, isRevealed: true, solid: true };
  grid[9][38] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[9][39] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };
  grid[10][38] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[10][39] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][38] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][39] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };

  // 4. Midfield Multi-tier Bricks & Power-up Question (x=50..62)
  grid[8][50] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][51] = { type: 'question', contents: 'fireflower', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][52] = { type: 'brick', contents: 'multi_coin', coinsRemaining: 6, bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][53] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };

  // Higher row
  grid[4][54] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };
  grid[4][55] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };
  grid[4][56] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };
  grid[4][57] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };

  // Second hidden block cache (x=60, y=7)
  grid[7][60] = { type: 'hidden', contents: 'coin', bumpOffset: 0, isRevealed: false, solid: false };

  // 5. Pyramid Steps leading to Flagpole (x=76..86)
  // Ascending pyramid
  for (let step = 0; step < 6; step++) {
    for (let py = 11 - step; py <= 11; py++) {
      grid[py][76 + step] = { type: 'brick', bumpOffset: 0, isRevealed: true, solid: true };
    }
  }

  // Descending staircase
  for (let step = 0; step < 6; step++) {
    for (let py = 11 - (5 - step); py <= 11; py++) {
      grid[py][83 + step] = { type: 'brick', bumpOffset: 0, isRevealed: true, solid: true };
    }
  }

  // 6. Flagpole (x=93)
  grid[2][93] = { type: 'flagpole_top', bumpOffset: 0, isRevealed: true, solid: false };
  for (let y = 3; y <= 10; y++) {
    grid[y][93] = { type: 'flagpole_pole', bumpOffset: 0, isRevealed: true, solid: false };
  }
  grid[11][93] = { type: 'flagpole_base', bumpOffset: 0, isRevealed: true, solid: true };

  // 7. Victory Castle (x=99..104)
  for (let cx = 99; cx <= 104; cx++) {
    for (let cy = 8; cy <= 11; cy++) {
      grid[cy][cx] = { type: 'castle_wall', bumpOffset: 0, isRevealed: true, solid: true };
    }
    grid[7][cx] = { type: 'castle_roof', bumpOffset: 0, isRevealed: true, solid: true };
  }
  grid[10][101] = { type: 'castle_door', bumpOffset: 0, isRevealed: true, solid: false };
  grid[11][101] = { type: 'castle_door', bumpOffset: 0, isRevealed: true, solid: false };

  return {
    id: 'world-1-1',
    name: 'WORLD 1-1',
    theme: 'overworld',
    bgColor: '#5c94fc',
    widthInTiles: width,
    heightInTiles: height,
    timeLimit: 300,
    grid,
    enemies: [
      { type: 'goomba', tileX: 16, tileY: 11 },
      { type: 'goomba', tileX: 25, tileY: 11 },
      { type: 'goomba', tileX: 34, tileY: 11 },
      { type: 'koopa', tileX: 42, tileY: 11 },
      { type: 'goomba', tileX: 52, tileY: 11 },
      { type: 'goomba', tileX: 55, tileY: 11 },
      { type: 'koopa', tileX: 63, tileY: 11 },
      { type: 'goomba', tileX: 72, tileY: 11 },
    ],
    flagpoleTileX: 93,
    flagpoleTileY: 11,
    castleTileX: 101,
    castleTileY: 11,
  };
}

/**
 * World 1-2: Underground Cavern
 */
export function buildLevel2(): LevelData {
  const width = 115;
  const height = LEVEL_HEIGHT_TILES;
  const grid = createEmptyGrid(width, height);

  // Ceiling row across entire cavern (row 0 and 1)
  for (let x = 0; x < width; x++) {
    grid[0][x] = { type: 'underground_brick', bumpOffset: 0, isRevealed: true, solid: true };
    grid[1][x] = { type: 'underground_brick', bumpOffset: 0, isRevealed: true, solid: true };
  }

  // Floor (rows 12 and 13)
  for (let x = 0; x < width; x++) {
    // Pits at x=36..38 and x=66..68
    if ((x >= 36 && x <= 38) || (x >= 66 && x <= 68)) continue;
    grid[12][x] = { type: 'underground_ground', bumpOffset: 0, isRevealed: true, solid: true };
    grid[13][x] = { type: 'underground_ground', bumpOffset: 0, isRevealed: true, solid: true };
  }

  // Entry pipe coming from ceiling (x=3..4)
  grid[2][3] = { type: 'pipe_tl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[2][4] = { type: 'pipe_tr', bumpOffset: 0, isRevealed: true, solid: true };
  grid[3][3] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[3][4] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };

  // Secret ceiling runner row at y=3 with a gap to jump onto at x=8
  for (let x = 10; x <= 35; x++) {
    grid[3][x] = { type: 'underground_brick', bumpOffset: 0, isRevealed: true, solid: true };
  }
  // Secret coins on top of runner (y=2)
  for (let x = 12; x <= 22; x += 2) {
    grid[2][x] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };
  }

  // Lower Cavern Question / Brick blocks
  grid[8][14] = { type: 'underground_brick', contents: 'mushroom', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][16] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][18] = { type: 'underground_brick', contents: 'multi_coin', coinsRemaining: 8, bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][20] = { type: 'question', contents: 'fireflower', bumpOffset: 0, isRevealed: true, solid: true };

  // Hidden 1-UP Block in underground (x=24, y=7)
  grid[7][24] = { type: 'hidden', contents: 'star', bumpOffset: 0, isRevealed: false, solid: false };

  // Underground Obstacle Pipes
  grid[10][32] = { type: 'pipe_tl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[10][33] = { type: 'pipe_tr', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][32] = { type: 'pipe_bl', bumpOffset: 0, isRevealed: true, solid: true };
  grid[11][33] = { type: 'pipe_br', bumpOffset: 0, isRevealed: true, solid: true };

  // Stepping stone platforms across pit 1
  grid[9][42] = { type: 'wood_platform', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][46] = { type: 'wood_platform', bumpOffset: 0, isRevealed: true, solid: true };
  grid[7][50] = { type: 'wood_platform', bumpOffset: 0, isRevealed: true, solid: true };

  // Second cache of brick blocks & hidden blocks (x=54..62)
  for (let bx = 54; bx <= 62; bx++) {
    grid[8][bx] = { type: 'underground_brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };
  }
  grid[8][56] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][60] = { type: 'question', contents: 'mushroom', bumpOffset: 0, isRevealed: true, solid: true };
  grid[5][58] = { type: 'hidden', contents: 'coin', bumpOffset: 0, isRevealed: false, solid: false };

  // Pipe staircase out of cavern
  for (let step = 0; step < 5; step++) {
    for (let py = 11 - step; py <= 11; py++) {
      grid[py][74 + step] = { type: 'underground_brick', bumpOffset: 0, isRevealed: true, solid: true };
    }
  }

  // Open sky section for Exit Flagpole (x=85..114)
  // Clear ceiling from x=82 onwards
  for (let x = 82; x < width; x++) {
    grid[0][x] = { type: 'empty', bumpOffset: 0, isRevealed: false, solid: false };
    grid[1][x] = { type: 'empty', bumpOffset: 0, isRevealed: false, solid: false };
  }

  // Flagpole (x=98)
  grid[2][98] = { type: 'flagpole_top', bumpOffset: 0, isRevealed: true, solid: false };
  for (let y = 3; y <= 10; y++) {
    grid[y][98] = { type: 'flagpole_pole', bumpOffset: 0, isRevealed: true, solid: false };
  }
  grid[11][98] = { type: 'flagpole_base', bumpOffset: 0, isRevealed: true, solid: true };

  // Castle (x=104..109)
  for (let cx = 104; cx <= 109; cx++) {
    for (let cy = 8; cy <= 11; cy++) {
      grid[cy][cx] = { type: 'castle_wall', bumpOffset: 0, isRevealed: true, solid: true };
    }
    grid[7][cx] = { type: 'castle_roof', bumpOffset: 0, isRevealed: true, solid: true };
  }
  grid[10][106] = { type: 'castle_door', bumpOffset: 0, isRevealed: true, solid: false };
  grid[11][106] = { type: 'castle_door', bumpOffset: 0, isRevealed: true, solid: false };

  return {
    id: 'world-1-2',
    name: 'WORLD 1-2',
    theme: 'underground',
    bgColor: '#080814',
    widthInTiles: width,
    heightInTiles: height,
    timeLimit: 300,
    grid,
    enemies: [
      { type: 'goomba', tileX: 18, tileY: 11 },
      { type: 'koopa', tileX: 25, tileY: 11 },
      { type: 'goomba', tileX: 30, tileY: 11 },
      { type: 'koopa', tileX: 47, tileY: 7 },
      { type: 'goomba', tileX: 56, tileY: 11 },
      { type: 'goomba', tileX: 59, tileY: 11 },
      { type: 'koopa', tileX: 72, tileY: 11 },
    ],
    flagpoleTileX: 98,
    flagpoleTileY: 11,
    castleTileX: 106,
    castleTileY: 11,
  };
}

/**
 * World 1-3: Highland Canopy & Castle
 */
export function buildLevel3(): LevelData {
  const width = 120;
  const height = LEVEL_HEIGHT_TILES;
  const grid = createEmptyGrid(width, height);

  // Base ground starting zone only (x=0..16) and end zone (x=96..119)
  for (let x = 0; x <= 16; x++) {
    grid[12][x] = { type: 'ground', bumpOffset: 0, isRevealed: true, solid: true };
    grid[13][x] = { type: 'ground', bumpOffset: 0, isRevealed: true, solid: true };
  }
  for (let x = 96; x < width; x++) {
    grid[12][x] = { type: 'ground', bumpOffset: 0, isRevealed: true, solid: true };
    grid[13][x] = { type: 'ground', bumpOffset: 0, isRevealed: true, solid: true };
  }

  // Giant Mushroom Canopies & Floating Wood Platforms
  // Mushroom 1 (x=20..24, cap at y=8)
  grid[8][20] = { type: 'mushroom_cap_l', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][21] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][22] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][23] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][24] = { type: 'mushroom_cap_r', bumpOffset: 0, isRevealed: true, solid: true };
  for (let my = 9; my <= 13; my++) {
    grid[my][22] = { type: 'mushroom_stem', bumpOffset: 0, isRevealed: true, solid: false };
  }
  grid[5][22] = { type: 'question', contents: 'mushroom', bumpOffset: 0, isRevealed: true, solid: true };

  // Floating wood bridges
  for (let x = 28; x <= 33; x++) {
    grid[7][x] = { type: 'wood_platform', bumpOffset: 0, isRevealed: true, solid: true };
  }
  grid[4][30] = { type: 'question', contents: 'fireflower', bumpOffset: 0, isRevealed: true, solid: true };
  grid[4][31] = { type: 'hidden', contents: 'star', bumpOffset: 0, isRevealed: false, solid: false };

  // Mushroom 2 (x=38..43, cap at y=6)
  grid[6][38] = { type: 'mushroom_cap_l', bumpOffset: 0, isRevealed: true, solid: true };
  grid[6][39] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[6][40] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[6][41] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[6][42] = { type: 'mushroom_cap_r', bumpOffset: 0, isRevealed: true, solid: true };
  for (let my = 7; my <= 13; my++) {
    grid[my][40] = { type: 'mushroom_stem', bumpOffset: 0, isRevealed: true, solid: false };
  }

  // Floating platforms (x=48..54)
  for (let x = 48; x <= 53; x++) {
    grid[8][x] = { type: 'brick', contents: undefined, bumpOffset: 0, isRevealed: true, solid: true };
  }
  grid[8][50] = { type: 'question', contents: 'coin', bumpOffset: 0, isRevealed: true, solid: true };
  grid[8][52] = { type: 'brick', contents: 'multi_coin', coinsRemaining: 10, bumpOffset: 0, isRevealed: true, solid: true };

  // Mushroom 3 (x=58..63, cap at y=5)
  grid[5][58] = { type: 'mushroom_cap_l', bumpOffset: 0, isRevealed: true, solid: true };
  grid[5][59] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[5][60] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[5][61] = { type: 'mushroom_cap_m', bumpOffset: 0, isRevealed: true, solid: true };
  grid[5][62] = { type: 'mushroom_cap_r', bumpOffset: 0, isRevealed: true, solid: true };
  for (let my = 6; my <= 13; my++) {
    grid[my][60] = { type: 'mushroom_stem', bumpOffset: 0, isRevealed: true, solid: false };
  }

  // Stepping bricks (x=68..80)
  for (let x = 68; x <= 72; x++) {
    grid[7][x] = { type: 'wood_platform', bumpOffset: 0, isRevealed: true, solid: true };
  }
  for (let x = 76; x <= 82; x++) {
    grid[6][x] = { type: 'wood_platform', bumpOffset: 0, isRevealed: true, solid: true };
  }
  grid[3][78] = { type: 'hidden', contents: 'coin', bumpOffset: 0, isRevealed: false, solid: false };

  // Grand Staircase to Flagpole (x=88..96)
  for (let step = 0; step < 7; step++) {
    for (let py = 11 - step; py <= 11; py++) {
      grid[py][88 + step] = { type: 'brick', bumpOffset: 0, isRevealed: true, solid: true };
    }
  }

  // Flagpole (x=103)
  grid[2][103] = { type: 'flagpole_top', bumpOffset: 0, isRevealed: true, solid: false };
  for (let y = 3; y <= 10; y++) {
    grid[y][103] = { type: 'flagpole_pole', bumpOffset: 0, isRevealed: true, solid: false };
  }
  grid[11][103] = { type: 'flagpole_base', bumpOffset: 0, isRevealed: true, solid: true };

  // Grand Castle (x=109..116)
  for (let cx = 109; cx <= 116; cx++) {
    for (let cy = 7; cy <= 11; cy++) {
      grid[cy][cx] = { type: 'castle_wall', bumpOffset: 0, isRevealed: true, solid: true };
    }
    grid[6][cx] = { type: 'castle_roof', bumpOffset: 0, isRevealed: true, solid: true };
  }
  grid[10][112] = { type: 'castle_door', bumpOffset: 0, isRevealed: true, solid: false };
  grid[11][112] = { type: 'castle_door', bumpOffset: 0, isRevealed: true, solid: false };

  return {
    id: 'world-1-3',
    name: 'WORLD 1-3',
    theme: 'highland',
    bgColor: '#5c94fc',
    widthInTiles: width,
    heightInTiles: height,
    timeLimit: 300,
    grid,
    enemies: [
      { type: 'koopa', tileX: 12, tileY: 11 },
      { type: 'goomba', tileX: 21, tileY: 7 },
      { type: 'koopa', tileX: 31, tileY: 6 },
      { type: 'koopa', tileX: 41, tileY: 5 },
      { type: 'goomba', tileX: 50, tileY: 7 },
      { type: 'koopa', tileX: 60, tileY: 4 },
      { type: 'goomba', tileX: 79, tileY: 5 },
      { type: 'koopa', tileX: 99, tileY: 11 },
    ],
    flagpoleTileX: 103,
    flagpoleTileY: 11,
    castleTileX: 112,
    castleTileY: 11,
  };
}

export const LEVELS = [buildLevel1, buildLevel2, buildLevel3];
