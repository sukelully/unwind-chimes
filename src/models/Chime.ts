import { Clapper } from './Clapper';

export class Chime extends Clapper {
  freq: number;
  isColliding: boolean = false;
  collisionCooldown: number = 0;
  bounceForce: number = 0.5;
  private audioContext: AudioContext;
  private effectsChain: { input: AudioNode; output: GainNode } | null = null;

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

  setEffectsChain(effectsChain: { input: AudioNode; output: GainNode }): void {
    this.effectsChain = effectsChain;
  }

  // Play note at set frequency with a simple type of synthesis
  playChime(level: number = 0.5, wave: OscillatorType = 'triangle', duration: number = 10): void {
    const osc: OscillatorNode = this.audioContext.createOscillator();
    osc.type = wave;
    osc.frequency.value = this.freq;

    const gain = this.audioContext.createGain();

    // Envelope
    gain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(level, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

    osc.connect(gain);

    // Use shared effects chain if available, otherwise connect directly to destination
    if (this.effectsChain) {
      gain.connect(this.effectsChain.input);
    } else {
      gain.connect(this.audioContext.destination);
    }

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);

    this.saturateColor();
  }

  // Saturate chime color briefly
  private saturateColor(): void {
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
