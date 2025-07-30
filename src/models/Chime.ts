import { Clapper } from './Clapper.ts';

export class Chime extends Clapper {
  freq: number;
  audioCtx: AudioContext;
  isColliding: boolean = false;
  collisionCooldown: number = 0;

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

  playSimpleChime(freq: number, duration: number = 1): void {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    // Envelope
    gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }
}
