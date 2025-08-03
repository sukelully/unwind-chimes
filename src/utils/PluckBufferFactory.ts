export class PluckBufferFactory {
  private static bufferCache: Map<string, AudioBuffer> = new Map();

  static getBuffer(freq: number, audioContext: AudioContext): AudioBuffer {
    const cacheKey = `${freq}`;

    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    const delaySamples = Math.round(audioContext.sampleRate / freq);
    const delayBuffer = new Float32Array(delaySamples);
    let dbIndex = 0;

    const bufferSize = audioContext.sampleRate * 3; // 3s is usually plenty
    const outputBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = outputBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const dampening = 0.997;
      const noiseBurst = audioContext.sampleRate / 100; // ~10ms
      const sample = i < noiseBurst ? Math.random() * 1 - 0.5 : 0;

      delayBuffer[dbIndex] =
        sample +
        (dampening * (delayBuffer[dbIndex] + delayBuffer[(dbIndex + 1) % delaySamples])) / 2;

      output[i] = delayBuffer[dbIndex];
      if (++dbIndex >= delaySamples) dbIndex = 0;
    }

    this.bufferCache.set(cacheKey, outputBuffer);
    return outputBuffer;
  }
}
