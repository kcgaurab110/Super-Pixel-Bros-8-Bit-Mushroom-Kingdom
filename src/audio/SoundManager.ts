/**
 * High-Performance, Zero-Leak Web Audio API Chiptune Synthesizer
 * - Uses interactive latencyHint for instant (<5ms) audio sync
 * - Schedules multi-note sequences on a single OscillatorNode using AudioParam timelines
 * - Pre-allocates noise buffer once at startup (no main-thread buffer allocation during gameplay)
 * - Disconnects every node on 'ended' so the audio graph never accumulates dead nodes over long sessions
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private starInterval: number | null = null;

  // Cooldown timestamps (ms) to prevent overlapping audio spam in the same frame
  private lastPlayed: Record<string, number> = {};

  public unlock() {
    this.initContext();
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.75;
      this.masterGain.connect(this.ctx.destination);

      // Pre-build reusable noise buffer for brick shatter & percussion
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private canPlay(id: string, minGapMs: number = 25): boolean {
    if (this.isMuted) return false;
    const now = performance.now();
    const prev = this.lastPlayed[id] || 0;
    if (now - prev < minGapMs) return false;
    this.lastPlayed[id] = now;
    return true;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
    }
    if (this.isMuted) {
      this.stopStarTheme();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private createOsc(type: OscillatorType, startTime: number, stopTime: number): { osc: OscillatorNode; gain: GainNode } | null {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return null;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(startTime);
    osc.stop(stopTime);

    return { osc, gain };
  }

  // 1. Jump Sound: Snappy rising square wave
  public playJump(isSuper: boolean = false) {
    if (!this.canPlay('jump', 40)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const dur = isSuper ? 0.15 : 0.12;
    const nodes = this.createOsc('square', t, t + dur);
    if (!nodes) return;

    const { osc, gain } = nodes;
    osc.frequency.setValueAtTime(isSuper ? 160 : 180, t);
    osc.frequency.exponentialRampToValueAtTime(isSuper ? 620 : 520, t + dur);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  }

  // 2. Coin Chime: Single-oscillator two-tone bell (B5 -> E6)
  public playCoin() {
    if (!this.canPlay('coin', 30)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const nodes = this.createOsc('square', t, t + 0.34);
    if (!nodes) return;

    const { osc, gain } = nodes;
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.065);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.setValueAtTime(0.24, t + 0.065);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
  }

  // 3. Stomp Enemy: Low punchy crunch
  public playStomp() {
    if (!this.canPlay('stomp', 25)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const nodes = this.createOsc('triangle', t, t + 0.11);
    if (!nodes) return;

    const { osc, gain } = nodes;
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.11);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
  }

  // 4. Kick Shell: Snappy square pop
  public playKick() {
    if (!this.canPlay('kick', 25)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const nodes = this.createOsc('square', t, t + 0.12);
    if (!nodes) return;

    const { osc, gain } = nodes;
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(85, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  }

  // 5. Block Bump: Low solid thud
  public playBump() {
    if (!this.canPlay('bump', 40)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const nodes = this.createOsc('triangle', t, t + 0.085);
    if (!nodes) return;

    const { osc, gain } = nodes;
    osc.frequency.setValueAtTime(135, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.085);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
  }

  // 6. Brick Break: Uses pre-allocated noiseBuffer (zero main-thread allocation)
  public playBrickBreak() {
    if (!this.canPlay('brick', 30)) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain || !this.noiseBuffer) return;

    const t = ctx.currentTime;
    const dur = 0.16;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.onended = () => {
      noise.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    noise.start(t);
    noise.stop(t + dur);
  }

  // 7. Power-Up Appears: Scheduled on a SINGLE oscillator
  public playPowerUpAppear() {
    if (!this.canPlay('power_appear', 80)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    const step = 0.048;
    const totalDur = notes.length * step;
    const t = ctx.currentTime;

    const nodes = this.createOsc('square', t, t + totalDur);
    if (!nodes) return;

    const { osc, gain } = nodes;
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, t + idx * step);
    });

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);
  }

  // 8. Power-Up Collect: Scheduled on a SINGLE oscillator
  public playPowerUpCollect() {
    if (!this.canPlay('power_collect', 80)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [330, 392, 659, 523, 587, 784, 440, 523, 880, 698, 784, 1046];
    const step = 0.042;
    const totalDur = notes.length * step;
    const t = ctx.currentTime;

    const nodes = this.createOsc('square', t, t + totalDur);
    if (!nodes) return;

    const { osc, gain } = nodes;
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, t + idx * step);
    });

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);
  }

  // 9. Fireball Shoot: Quick laser blip
  public playFireball() {
    if (!this.canPlay('fireball', 40)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const nodes = this.createOsc('triangle', t, t + 0.09);
    if (!nodes) return;

    const { osc, gain } = nodes;
    osc.frequency.setValueAtTime(920, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.09);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  }

  // 10. Pipe Warp
  public playPipe() {
    if (!this.canPlay('pipe', 100)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const nodes = this.createOsc('triangle', t, t + 0.24);
    if (!nodes) return;

    const { osc, gain } = nodes;
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.24);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
  }

  // 11. Flagpole Slide & Fanfare (Pure Web Audio timeline scheduling, no setTimeout drift)
  public playFlagpole() {
    if (!this.canPlay('flagpole', 200)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const slideNodes = this.createOsc('sawtooth', t, t + 0.75);
    if (slideNodes) {
      slideNodes.osc.frequency.setValueAtTime(780, t);
      slideNodes.osc.frequency.exponentialRampToValueAtTime(130, t + 0.75);
      slideNodes.gain.gain.setValueAtTime(0.15, t);
      slideNodes.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    }

    const fanNotes = [523.25, 659.25, 783.99, 1046.5];
    const step = 0.13;
    const fanStart = t + 0.8;
    const fanDur = fanNotes.length * step + 0.1;
    const fanNodes = this.createOsc('square', fanStart, fanStart + fanDur);
    if (fanNodes) {
      fanNotes.forEach((f, i) => {
        fanNodes.osc.frequency.setValueAtTime(f, fanStart + i * step);
      });
      fanNodes.gain.gain.setValueAtTime(0.2, fanStart);
      fanNodes.gain.gain.exponentialRampToValueAtTime(0.001, fanStart + fanDur);
    }
  }

  // 12. Player Death: Single oscillator timeline
  public playDeath() {
    if (!this.canPlay('death', 200)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [500, 420, 360, 300, 250, 200, 150];
    const dur = 0.085;
    const totalDur = notes.length * dur;
    const t = ctx.currentTime;

    const nodes = this.createOsc('triangle', t, t + totalDur);
    if (!nodes) return;

    const { osc, gain } = nodes;
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, t + idx * dur);
    });

    gain.gain.setValueAtTime(0.26, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);
  }

  // 12b. Game Over: Single oscillator timeline
  public playGameOver() {
    if (!this.canPlay('gameover', 300)) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [392, 330, 261, 196];
    const dur = 0.2;
    const totalDur = notes.length * dur;
    const t = ctx.currentTime;

    const nodes = this.createOsc('square', t, t + totalDur);
    if (!nodes) return;

    const { osc, gain } = nodes;
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, t + idx * dur);
    });

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);
  }

  // 13. Starman Invincibility Looping Arpeggios
  public startStarTheme() {
    this.stopStarTheme();
    if (this.isMuted) return;
    this.initContext();

    const pattern = [440, 554, 659, 880, 659, 554];
    let noteIdx = 0;

    this.starInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const freq = pattern[noteIdx % pattern.length];
      noteIdx++;

      const t = this.ctx.currentTime;
      const nodes = this.createOsc('square', t, t + 0.085);
      if (!nodes) return;

      nodes.osc.frequency.setValueAtTime(freq, t);
      nodes.gain.gain.setValueAtTime(0.12, t);
      nodes.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
    }, 115);
  }

  public stopStarTheme() {
    if (this.starInterval !== null) {
      clearInterval(this.starInterval);
      this.starInterval = null;
    }
  }
}

export const sound = new SoundManager();
