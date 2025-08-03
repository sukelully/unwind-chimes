import { Clapper } from './Clapper';
import { PluckBufferFactory } from '@/utils/PluckBufferFactory';

export class Chime extends Clapper {
  freq: number;
  audioContext: AudioContext;
  isPlaying: boolean = false;
  isColliding: boolean = false;
  collisionCooldown: number = 0;
  currentOscillator: OscillatorNode | null = null;
  currentGain: GainNode | null = null;
  bufferCache: Map<string, AudioBuffer> = new Map();

  constructor(
    x: number,
    y: number,
    color: string,
    r: number,
    freq: number,
    audioContext: AudioContext
  ) {
    super(x, y, color, r);
    this.freq = freq;
    this.audioContext = audioContext;
  }

  // Update chime position
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

    // Handle collisions
    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }

    if (this.collisionCooldown === 0) {
      this.isColliding = false;
    }
  }

  playPluckChime(level: number = 0.5): void {
    const buffer = PluckBufferFactory.getBuffer(this.freq, this.audioContext);

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
    gain.gain.setValueAtTime(level, this.audioContext.currentTime + 0.00001);

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    source.start();
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
    };

    this.saturateColor();
  }

  // Play note at set frequency with a simple type of synthesis
  playSimpleChime(
    level: number = 0.5,
    duration: number = 5,
    wave: OscillatorType = 'triangle'
  ): void {
    // Stop any currently playing chime
    this.stopCurrentChime();

    const osc: OscillatorNode = this.audioContext.createOscillator();
    const gain: GainNode = this.audioContext.createGain();

    // Store references to current nodes
    this.currentOscillator = osc;
    this.currentGain = gain;
    this.isPlaying = true;

    osc.type = wave;
    osc.frequency.value = this.freq;

    // Envelope
    gain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(level, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    this.saturateColor();

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);

    // Clear references when the oscillator ends
    osc.onended = () => {
      if (this.currentOscillator === osc) {
        this.currentOscillator = null;
        this.currentGain = null;
        this.isPlaying = false;
      }
    };
  }

  // Stop the current chime if one is playing
  stopCurrentChime(): void {
    if (this.currentOscillator && this.currentGain) {
      try {
        // Smooth out clicks and pops
        const currentGainValue = this.currentGain.gain.value;
        this.currentGain.gain.cancelScheduledValues(this.audioContext.currentTime);
        this.currentGain.gain.setValueAtTime(currentGainValue, this.audioContext.currentTime);
        this.currentGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);

        this.currentOscillator.stop(this.audioContext.currentTime + 0.05);
        // eslint-disable-next-line
      } catch (e) {
        // Oscillator might already be stopped
      }

      this.currentOscillator = null;
      this.currentGain = null;
      this.isPlaying = false;
    }
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
