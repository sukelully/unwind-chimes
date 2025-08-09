import { Clapper } from './Clapper';

export class Chime extends Clapper {
  freq: number;
  isColliding: boolean = false;
  collisionCooldown: number = 0;
  bounceForce: number = 0.5;
  private audioContext: AudioContext;
  private effectsChain: { input: AudioNode; output: GainNode } | null = null;
  private colorAnimationId: number | null = null;
  private colorAnimationStart: number = 0;
  private originalColor: string = '';
  private targetColor: string = '';

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

  // Briefly saturate color of chime
  private saturateColor(): void {
    // Cancel any existing animation
    if (this.colorAnimationId !== null) {
      cancelAnimationFrame(this.colorAnimationId);
    }

    const origColor = this.color;
    const hslRegex = /hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\)/;
    const match = origColor.match(hslRegex);

    if (match) {
      const h = parseInt(match[1], 10);
      const s = parseInt(match[2], 10);
      const l = parseInt(match[3], 10);

      const boostedS = Math.min(s + 30, 100);
      const boostedColor = `hsl(${h}, ${boostedS}%, ${l}%)`;

      // Set up animation variables
      this.originalColor = origColor;
      this.targetColor = boostedColor;
      this.colorAnimationStart = Date.now();

      // Immediately set to saturated color
      this.color = boostedColor;

      // Start fade animation after a brief delay
      setTimeout(() => {
        this.animateColorFade();
      }, 100);
    }
  }

  private animateColorFade(): void {
    const elapsed = Date.now() - this.colorAnimationStart;
    const duration = 1000; // 1 second fade duration

    if (elapsed < duration) {
      // Calculate progress (0 to 1)
      const progress = elapsed / duration;

      // Apply easing (ease-out curve for smoother animation)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate between colors
      const interpolatedColor = this.interpolateHSLColors(
        this.targetColor,
        this.originalColor,
        easedProgress
      );

      this.color = interpolatedColor;

      // Continue animation
      this.colorAnimationId = requestAnimationFrame(() => this.animateColorFade());
    } else {
      // Animation complete
      this.color = this.originalColor;
      this.colorAnimationId = null;
    }
  }

  private interpolateHSLColors(color1: string, color2: string, t: number): string {
    const hslRegex = /hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\)/;

    const match1 = color1.match(hslRegex);
    const match2 = color2.match(hslRegex);

    if (!match1 || !match2) return color1;

    const h1 = parseInt(match1[1], 10);
    const s1 = parseInt(match1[2], 10);
    const l1 = parseInt(match1[3], 10);

    const h2 = parseInt(match2[1], 10);
    const s2 = parseInt(match2[2], 10);
    const l2 = parseInt(match2[3], 10);

    // Interpolate each component
    const h = Math.round(h1 + (h2 - h1) * t);
    const s = Math.round(s1 + (s2 - s1) * t);
    const l = Math.round(l1 + (l2 - l1) * t);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}
