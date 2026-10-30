# Super Jump Adventure: 8-Bit Side-Scrolling Platformer

An authentic, retro 8-bit side-scrolling platformer engine crafted in HTML5 Canvas, JavaScript, and Tailwind CSS. Players guide our pixel hero through vibrant Mushroom Kingdom stages filled with question mark blocks, hidden coin caches, tiered power-ups, stompable Goombas, kickable Koopa shells, secret pipes, and iconic flagpole finishes.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction and core mechanics have been aligned based on your clarifying preferences:
> - **Aesthetic Direction**: Classic retro 8-bit Mushroom Kingdom style with hand-crafted pixel-art palettes, authentic blue skies, fluffy clouds, green hills, brick masonry, and subterranean caverns.
> - **Power-Up Tier System**: Small (1 hit point) $\rightarrow$ Super (Mushroom grow, brick breaker) $\rightarrow$ Fire Flower (Fireball projectile attack) $\rightarrow$ Starman (Temporary invincibility, rainbow flashing, high-speed collision kills).
> - **Stage Structure**: 3-stage campaign (World 1-1: Sunny Grasslands & Pipes, World 1-2: Underground Brick Caverns & Hidden Caches, World 1-3: Treetop Canopy & Castle Flagpole) with level transitions and high score tracking.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a full-viewport, 60 FPS platforming experience featuring tight physics (coyote time, jump buffering, variable jump height, momentum acceleration and skid), interactive block mechanics (bump animation, hidden invisible blocks, coin multipliers, shattering brick particles), enemy behaviors (Goombas, Koopas with kickable shell chain reactions), power-up evolutions, and flagpole sliding cinematics.
- **Target Audience / Persona**: Retro gaming enthusiasts and arcade lovers seeking responsive, nostalgic NES-era platforming directly in the browser with zero lag.
- **Key Value**: Recreates authentic Nintendo-era platforming physics and game feel (procedural Web Audio sound effects, screen shake, hitstop, squash-and-stretch) entirely with native HTML5 Canvas without bulky external game engine overhead.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Title Screen**: Atmospheric live title panorama showcasing pixel clouds and animated hero sprite. Bespoke retro logo lockup, high score ticker, level select preview, control hint bar (`WASD / Arrow Keys · Space/Z Jump · X Run/Fireball`), and a prominent **Start Game** CTA.
2. **Active Gameplay View**:
   - Ultra-low occlusion HUD (<12% of screen): Score (`000000`), Coins (`🪙 ×00`), World (`WORLD 1-1`), Time (`300`), Lives (`❤️ ×3`), and Power-Up badge with `tabular-nums`.
   - Smooth horizontal camera scrolling following the player, clamping at stage boundaries.
   - Dynamic block collisions: Hitting `?` blocks pops coins or mushrooms; bumping hidden blocks reveals invisible coin blocks; breaking bricks as Super/Fire Mario spawns 4 flying debris chunks.
   - Power-Up collection: Mushroom transforms small hero into large hero with growth animation and pause hitstop; Fire Flower equips fireball shooting (`X` key); Starman triggers invincibility theme and color cycle.
   - Touch overlay controls automatically displayed on touch-enabled mobile devices.
3. **Pause & Modal Overlays**:
   - Quick `Esc` or `P` key triggers a clean, world-matched pause modal with Resume, Restart Level, Sound Volume Toggle, and Controls reference.
4. **Victory / Flagpole Ceremony**: Grabbing the flagpole initiates the hero sliding down, lowering the flag, walking to the castle gate, and displaying bonus points tallied from remaining timer seconds.
5. **Game Over & Stage Complete Screens**: Nostalgic tally screens with instant replay loops and persistent high score storage via `localStorage`.

### Visual Identity & Theme
- **Color Palette**:
  - Sky Blue: `#5c94fc` (Daytime World 1-1 & 1-3)
  - Cavern Dark: `#000000` / Deep Navy `#0c1024` (World 1-2 Underground)
  - Ground & Pipe Green: `#00a800` and `#005000` with `#b8f818` highlight
  - Brick Terracotta: `#d85800` and `#b03800`
  - Coin & Star Gold: `#f8b800` and `#fcff00`
  - Hero Palette: Red `#d82800` & Blue `#0048d0` (Small/Super), White & Red (Fire Flower)
- **Typography & UI Styling**:
  - Font: Clean retro pixel aesthetic (`'Press Start 2P', monospace` or pixelated system monospace with crisp rendering).
  - High-contrast, unboxed perimeter HUD with `tabular-nums` formatting.
  - Zero decorative clutter; no generic pills or artificial UI slop.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native HTML5 Canvas 2D Context vs Heavy 3rd-Party Engines (Phaser/Pixi)**
  - *Chosen Approach*: Pure Canvas 2D API with custom tile-based spatial grid and SAT/AABB physics solver.
  - *Why*: Ultra-lightweight, 0 dependency bloat, instant boot times, hermetic rendering, precise sub-pixel collision tuning for classic Mario jump curves.
  - *Alternatives Considered*: Phaser was considered, but carries hundreds of kilobytes of boilerplate and complex React DOM wrapper sync issues.
- **Decision 2: Procedural Web Audio Synth vs External MP3/WAV Audio Files**
  - *Chosen Approach*: Pure synthesized Web Audio oscillators (`square`, `triangle`, `noise`) crafting authentic 8-bit chimes for jump, coin pickup, power-up jingle, stomp crunch, fireball pop, and death tune.
  - *Why*: Guarantees zero 404 network asset failures, zero CORS blocking, instant zero-latency playback, and authentic chiptune frequencies.
- **Decision 3: Multi-Stage Progression vs Procedural Endless Mode**
  - *Chosen Approach*: Hand-crafted 3-level campaign (Overworld, Underground, Highland Castle) with distinct tile layouts, secret coin routes, hidden blocks, warp pipes, and flagpoles.
  - *Why*: True Mario level design relies on intentional rhythm, pacing, risk-reward hidden caches, and deliberate platform spacing.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       React Root App                        │
│   (Game Shell, Title Screen, Pause Modal, Victory Screens)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mounts & Controls State
┌──────────────────────────────▼──────────────────────────────┐
│                  PlatformerCanvas Container                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Canvas Render Engine (60 FPS)            │  │
│  │  - Tilemap Layer (Sky, Clouds, Hills, Pipes, Bricks)  │  │
│  │  - Entity Layer (Player, Goombas, Koopas, Fireballs)   │  │
│  │  - Particle Layer (Coin sparkles, Brick fragments)    │  │
│  │  - Floating Combat Text (Points: 100, 200, 1000, 1UP) │  │
│  └───────────────────────────▲───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Ticked by
┌──────────────────────────────┴──────────────────────────────┐
│                    GameEngine Core Loop                     │
│  ┌───────────────────────┐      ┌────────────────────────┐  │
│  │    Physics & SAT      │      │     Web Audio Chiptune │  │
│  │  - Jump Buffering     │      │  - Jump square wave    │  │
│  │  - Coyote Time        │      │  - Coin bell chime     │  │
│  │  - Tile AABB resolver │      │  - Stomp noise burst   │  │
│  │  - Shell recoil       │      │  - Powerup fanfare     │  │
│  └───────────────────────┘      └────────────────────────┘  │
│  ┌───────────────────────┐      ┌────────────────────────┐  │
│  │   Level Map Store     │      │   Input Controller     │  │
│  │  - World 1-1 / 1-2 /  │      │  - Keyboard (WASD/Arr) │  │
│  │    1-3 tile blueprints│      │  - Touch Virtual Pad   │  │
│  └───────────────────────┘      └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Model & State
```typescript
interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  powerTier: 'small' | 'super' | 'fire' | 'star';
  invincibilityTimer: number; // for star and hit invulnerability
  facing: 'left' | 'right';
  isGrounded: boolean;
  isCrouching: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  lives: number;
  coins: number;
  score: number;
}

interface TileBlock {
  type: 'brick' | 'question' | 'hidden' | 'empty' | 'pipe' | 'ground' | 'flagpole';
  contents?: 'coin' | 'mushroom' | 'fireflower' | 'star' | 'multi_coin';
  coinsRemaining?: number;
  bumpOffset: number;
  isBumped: boolean;
  solid: boolean;
}

interface Enemy {
  id: string;
  type: 'goomba' | 'koopa' | 'piranha';
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: 'walk' | 'flattened' | 'shell_idle' | 'shell_moving' | 'falling';
}
```

### Interactive Component & State Mapping
- **Input System**: Event listeners for `keydown` / `keyup` recording continuous `keysHeld` and discrete `justPressed` buffers. Includes window `blur` auto-clear to prevent stuck keys.
- **Block Interaction System**:
  - Hitting `?` block from below triggers `bumpOffset` spring physics, spawns bouncing coin with float-up score `200` or slides out a Super Mushroom / Fire Flower.
  - Hidden blocks start invisible with zero collision from sides/top, but turn solid and reveal when head-bumped from below!
  - Breakable bricks shatter into 4 angular fragments when hit by Super/Fire Mario, or bump up and bounce player if Small Mario.
- **Power-Up State Machine**:
  - Small $\rightarrow$ Mushroom $\rightarrow$ Super (32px tall, can break bricks)
  - Super $\rightarrow$ Fire Flower $\rightarrow$ Fire (shoots bouncing fireballs that defeat Goombas and Koopas)
  - Any $\rightarrow$ Starman $\rightarrow$ Rainbow flash, invincibility music, instant enemy wipe on contact.
  - Damage while Super/Fire: Shrinks back to Small with 2-second flash invulnerability rather than instant death.
- **Audio Synthesizer**: Browser `AudioContext` managing volume gain, mute toggle, and procedural waveforms for coin, jump, stomp, bump, power-up, and game over.
