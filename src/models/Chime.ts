import { Clapper } from './Clapper.ts';

export class Chime extends Clapper {
  freq: number;
  audioCtx: AudioContext;
  isPlaying: boolean = false;
  isColliding: boolean = false;
  collisionCooldown: number = 0;
  currentOscillator: OscillatorNode | null = null;
  currentGain: GainNode | null = null;

  constructor(
    x: number,
    y: number,
    color: string,
    r: number,
    freq: number,
    audioCtx: AudioContext
  ) {
    super(x, y, color, r);
    this.freq = freq;
    this.audioCtx = audioCtx;
  }

  update(): void {
    // Calculate spring force
    const springForceX = (this.restX - this.x) * this.springStrength;
    const springForceY = (this.restY - this.y) * this.springStrength;

    // Apply spring force and dampening
    this.velocityX += springForceX;
    this.velocityY += springForceY;
    this.velocityX *= this.damping;
    this.velocityY *= this.damping;

    // Pull back to rest position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Limit maximum displacement from rest position
    const distanceFromRest = Math.sqrt(
      Math.pow(this.x - this.restX, 2) + Math.pow(this.y - this.restY, 2)
    );

    if (distanceFromRest > this.maxDisplacement) {
      const angle = Math.atan2(this.y - this.restY, this.x - this.restX);
      this.x = this.restX + Math.cos(angle) * this.maxDisplacement;
      this.y = this.restY + Math.sin(angle) * this.maxDisplacement;
    }

    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }

    if (this.collisionCooldown === 0) {
      this.isColliding = false;
    }
  }

  // Stop the current chime if one is playing
  stopCurrentChime(): void {
    if (this.currentOscillator && this.currentGain) {
      try {
        // Smooth out clicks and pops
        const currentGainValue = this.currentGain.gain.value;
        this.currentGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.currentGain.gain.setValueAtTime(currentGainValue, this.audioCtx.currentTime);
        this.currentGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.05);

        this.currentOscillator.stop(this.audioCtx.currentTime + 0.05);
        // eslint-disable-next-line
      } catch (e) {
        // Oscillator might already be stopped
      }

      this.currentOscillator = null;
      this.currentGain = null;
      this.isPlaying = false;
    }
  }

  playSimpleChime(
    freq: number,
    level: number = 0.5,
    duration: number = 5,
    wave: OscillatorType = 'triangle'
  ): void {
    // Stop any currently playing chime
    this.stopCurrentChime();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Store references to current nodes
    this.currentOscillator = osc;
    this.currentGain = gain;
    this.isPlaying = true;

    osc.type = wave;
    osc.frequency.value = freq;

    // Envelope
    gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(level, this.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    this.saturateColor();

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);

    // Clear references when the oscillator ends
    osc.onended = () => {
      if (this.currentOscillator === osc) {
        this.currentOscillator = null;
        this.currentGain = null;
        this.isPlaying = false;
      }
    };
  }

  // Saturate chime color briefly
  saturateColor(): void {
    const origColor = this.color;
    const hslRegex = /hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\)/;
    const match = origColor.match(hslRegex);

    if (match) {
      const h = parseInt(match[1], 10);
      const s = parseInt(match[2], 10);
      const l = parseInt(match[3], 10);

      const boostedS = Math.min(s + 30, 100);
      const boostedColor = `hsl(${h}, ${boostedS}%, ${l}%)`;

      this.color = boostedColor;

      setTimeout(() => {
        this.color = origColor;
      }, 200);
    }
  }
}
