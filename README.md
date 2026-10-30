# Super Pixel Bros: 8-Bit Mushroom Kingdom

An authentic, high-performance retro 8-bit side-scrolling platformer crafted in **HTML5 Canvas**, **TypeScript**, **React**, and **Tailwind CSS**.

Featuring nostalgic NES-era physics, a 4-tier power-up progression system, hidden coin blocks, breakable bricks, kickable Koopa shells, a 3-stage campaign, and a zero-latency procedural Web Audio chiptune synthesizer.

---

## Features

### 1. 60 FPS Canvas Physics & Responsive Input
- **Sub-Pixel Collision Engine**: Precise tile AABB collision detection and resolution with landing, headbutting, and side-wall stabilization.
- **Classic Mario Jump Curves**: Variable jump height (releasing jump cuts upward velocity for short hops), **150ms jump buffering**, and **110ms coyote time** for forgiving ledge leaps.
- **Momentum & Skidding**: Realistic running acceleration, top-speed sprint bonuses, directional skidding with friction decay, and dust puff particles.
- **Simultaneous Multi-Key Input**: Uses `Set<string>` hardware key state tracking so you can sprint, jump, and steer simultaneously without key-ghosting or dropped inputs.

### 2. Tiered Power-Up System
- **Small Mario**: Standard agility, bumps blocks, stomps Goombas.
- **Super Mario**: Collecting a Super Mushroom doubles sprite height, allows ducking under obstacles, and shatters brick blocks into flying angular fragments.
- **Fire Mario**: Collecting a Fire Flower enables shooting up to 3 bouncing fireballs (`X` or Fire button) to defeat enemies at a distance.
- **Starman (Invincible)**: Rainbow color-cycling palette swaps, upbeat chiptune star music, and instant contact knockouts against all enemies.
- **Damage Buffering**: Taking damage while Super or Fire reverts to Small Mario with 2 seconds of flashing invulnerability rather than instant death.

### 3. Interactive Blocks & Hidden Secrets
- **Question Mark `[?]` Blocks**: Animated spring-bump physics popping spinning coins, Super Mushrooms, Fire Flowers, or Starmen before turning into brown spent blocks.
- **Hidden Coin Blocks**: Invisible until bumped from underneath—revealing secret coins, 1-UPs, or Starmen!
- **Breakable Bricks**: Headbutting as Super/Fire Mario shatters the block into 4 physics-driven debris chunks; Small Mario bounces with a solid thud.
- **Multi-Coin Bricks**: Can be struck repeatedly up to 8 times for bonus coins before expiring.

### 4. Enemy AI & Shell Dynamics
- **Goombas**: Patrolling mushrooms that flatten into pancake sprites with a crunch sound on stomp.
- **Koopa Troopas**: Stompable into shells. Stationary shells can be kicked at high velocity (`vx = 8.5`) to ricochet off pipes and wipe out enemy chains. Shells can also be stomped mid-slide to halt them.
- **Fireball Interactions**: Direct fireball hits defeat Goombas and Koopas with smoke particles.

### 5. Multi-Stage Campaign
- **World 1-1 (Sunny Meadows)**: Classic green hills, modular pipes, question block formations, hidden 1-UPs, Goombas, and pyramid steps leading to the flagpole.
- **World 1-2 (Underground Cavern)**: Deep blue/teal subterranean aesthetic, tight corridors, secret ceiling runway to bypass enemies and collect hidden coin caches, and a warp pipe exit.
- **World 1-3 (Highland Canopy)**: Treacherous mushroom caps and floating timber platforms suspended over bottomless abysses leading to the Grand Castle Flagpole.
- **Flagpole Slide Ceremony**: Hero latches onto the pole, slides down with descending pitch, flag drops, hero hops off and marches into the castle while remaining time tallies into bonus points.

### 6. Zero-Latency Procedural 8-Bit Web Audio
- Built entirely with the browser **Web Audio API** (no external MP3/WAV network dependencies or CORS issues).
- Employs `{ latencyHint: 'interactive' }`, single-oscillator timeline frequency sweeps, and pre-allocated noise buffers.
- Synthesizes jump sweeps, two-tone coin bells (B5 $\rightarrow$ E6), enemy stomps, shell kicks, block bumps, brick shatters, fireball laser blips, power-up arpeggios, flagpole slides, death cadences, and the looping star theme.
- Includes a quick mute/unmute toggle (`M` key or UI icon).

### 7. Performance Optimizations
- **Offscreen Tile Canvas Caching**: All tile types pre-render to offscreen canvas buffers, blitting via hardware-accelerated `drawImage` calls for rock-solid 60 FPS performance.
- **Zero-GC Particle Engine**: Particle limit pooling with $O(1)$ swap-and-pop removal prevents garbage collection hitches during long play sessions.
- **Entity Viewport Culling**: Only active onscreen enemies and scenic elements are ticked and drawn.

---

## Controls

### Keyboard Controls
| Action | Key 1 | Key 2 |
| :--- | :--- | :--- |
| **Move Left** | `A` | `Left Arrow` |
| **Move Right** | `D` | `Right Arrow` |
| **Crouch / Duck** | `S` | `Down Arrow` |
| **Jump** | `Space` | `Z` / `W` / `Up Arrow` |
| **Run / Fireball** | `X` | `Shift` / `J` / `K` |
| **Pause Game** | `Escape` | `P` |
| **Toggle Sound** | `M` | HUD Button |
| **Start / Restart** | `Enter` | `Space` |

### Touch / Mobile Controls
- **Virtual D-Pad (Bottom-Left)**: Touch buttons for Left, Crouch, and Right movement.
- **Action Buttons (Bottom-Right)**: Dedicated **SPACE (JUMP)** and **X (FIRE/RUN)** buttons with full multi-touch support.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Rendering**: HTML5 Canvas 2D Context with offscreen sprite caching
- **Styling**: Tailwind CSS v4
- **Audio**: Web Audio API (Synthesized oscillators & noise filters)
- **Icons**: Lucide React
- **Build Tool**: Vite 8

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `bun`

### Installation

1. Clone or extract the repository:
   ```bash
   git clone <your-repository-url>
   cd <project-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play!

### Building for Production

To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## Project Structure

```
├── index.html                 # HTML entry point with retro pixel fonts
├── package.json               # Project dependencies and npm scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── .gitignore                 # Git ignore rules (excludes .aistudio artifacts)
└── src/
    ├── main.tsx               # React root entry point
    ├── App.tsx                # Main Game Shell, state coordinator & keyboard listeners
    ├── index.css              # Tailwind CSS styles and pixelated rendering rules
    ├── audio/
    │   └── SoundManager.ts    # Web Audio API 8-bit procedural synthesizer
    ├── game/
    │   ├── types.ts           # Entity interfaces, block types, level schemas
    │   ├── sprites.ts         # Canvas drawing routines & offscreen tile caching
    │   ├── levels.ts          # Level layouts for World 1-1, 1-2, and 1-3
    │   └── GameEngine.ts      # 60 FPS physics loop, SAT collisions, input & camera
    └── components/
        ├── HUD.tsx            # World-matched low-occlusion perimeter HUD
        ├── TitleScreen.tsx    # SVG title lockup, stage selector & high scores
        ├── PauseModal.tsx     # Pause overlay & control reference
        ├── GameOverModal.tsx  # Game over screen with instant replay loop
        ├── VictoryModal.tsx   # Campaign completion screen with final scores
        └── TouchControls.tsx  # Virtual on-screen gamepad for mobile devices
```

---

## License

Apache-2.0
