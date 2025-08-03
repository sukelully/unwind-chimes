import { Clapper } from './Clapper';
import { PluckBufferFactory } from '@/utils/PluckBufferFactory';

export class Chime extends Clapper {
  freq: number;
  audioContext: AudioContext;
  isColliding: boolean = false;
  collisionCooldown: number = 0;
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

  private createEffectsChain(
    filterFreq: number,
    delayTime: number = 0.5,
    delayFeedback: number = 0.5,
    delayLevel: number = 0.5
  ): { input: AudioNode; output: GainNode } {
    const outputGain = this.audioContext.createGain();
    outputGain.gain.setValueAtTime(1, this.audioContext.currentTime);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.audioContext.currentTime);

    const delay = this.audioContext.createDelay();
    const delayWet = this.audioContext.createGain();
    const feedbackGain = this.audioContext.createGain();
    delay.delayTime.setValueAtTime(delayTime, this.audioContext.currentTime);

    // Prevent infite feedback loop
    feedbackGain.gain.setValueAtTime(Math.min(delayFeedback, 0.95), this.audioContext.currentTime);
    delayWet.gain.setValueAtTime(delayLevel, this.audioContext.currentTime);

    // Routing
    filter.connect(delayWet);
    filter.connect(outputGain);
    delayWet.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    feedbackGain.connect(outputGain);
    outputGain.connect(this.audioContext.destination);

    return { input: filter, output: outputGain };
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

  // Play pluck chime using computed buffer
  playPluckChime(level: number = 0.5, filterFreq: number = 500): void {
    const buffer = PluckBufferFactory.getBuffer(this.freq, this.audioContext);

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(level, this.audioContext.currentTime);
    source.buffer = buffer;

    const { input } = this.createEffectsChain(filterFreq);
    source.connect(gain);
    gain.connect(input);

    source.start();
    source.onended = () => {
      source.disconnect();
    };

    this.saturateColor();
  }

  // Play note at set frequency with a simple type of synthesis
  playSimpleChime(
    level: number = 0.5,
    filterFreq: number = 500,
    duration: number = 5,
    wave: OscillatorType = 'triangle'
  ): void {
    const osc: OscillatorNode = this.audioContext.createOscillator();
    osc.type = wave;
    osc.frequency.value = this.freq;

    const { input, output } = this.createEffectsChain(filterFreq);

    // Envelope
    output.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
    output.gain.exponentialRampToValueAtTime(level, this.audioContext.currentTime + 0.01);
    output.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

    osc.connect(input);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);

    this.saturateColor();
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
