import { Clapper } from './Clapper.ts';

export class Chime extends Clapper {
  freq: number;
  audioCtx: AudioContext;

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
