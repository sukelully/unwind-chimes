export default function Chime() {
  const audioCtx: AudioContext = new AudioContext();
  const bufferCache = new Map<string, AudioBuffer>();

  function generatePluckBuffer(freq: number, octave: number = 1): AudioBuffer {
    const cacheKey: string = `${freq}_${octave}`;
    if (bufferCache.has(cacheKey)) {
      return bufferCache.get(cacheKey)!;
    }

    const delaySamples: number = Math.round(audioCtx.sampleRate / (freq * octave));
    const delayBuffer = new Float32Array(delaySamples);
    let dbIndex = 0;

    const bufferSize = audioCtx.sampleRate * 7; // 7 second buffer
    const outputBuffer: AudioBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output: Float32Array = outputBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const variation = Math.round(((Math.random() * 10 - 5) * audioCtx.sampleRate) / 1000); // ±5ms noise burst
      const dampening = 0.997;
      const noiseBurst = Math.max(0, audioCtx.sampleRate / 100 + variation);
      const sample = i < noiseBurst ? Math.random() * 1 - 0.5 : 0; // Produce random noise during burst timeframe otherwise 0

      delayBuffer[dbIndex] =
        // Average adjacent samples (lowpass filter) and dampen result
        sample +
        (dampening * (delayBuffer[dbIndex] + delayBuffer[(dbIndex + 1) % delaySamples])) / 2;
      output[i] = delayBuffer[dbIndex];

      if (++dbIndex >= delaySamples) dbIndex = 0;
    }

    bufferCache.set(cacheKey, outputBuffer);
    return outputBuffer;
  }

  function playPluckChime(freq: number, octave: number = 1): void {
    const buffer: AudioBuffer = generatePluckBuffer(freq, octave);

    const source: AudioBufferSourceNode = audioCtx.createBufferSource();
    const filter: BiquadFilterNode = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, audioCtx.currentTime);

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(audioCtx.destination);

    source.start();
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
    };
  }

  function playSimpleChime(freq: number, duration: number = 1): void {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    // Envelope
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function handleSimpleClick(): void {
    playSimpleChime(440);
  }

  function handlePluckClick(): void {
    playPluckChime(440);
  }

  return (
    <>
      <button className="btn" onClick={handleSimpleClick}>
        Play chime
      </button>
      <button className="btn" onClick={handlePluckClick}>
        Pluck string
      </button>
    </>
  );
}
