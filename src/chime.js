let chimeImage;

function preload() {
    chimeImage = loadImage('img/chime.png');
}

class Chime {
    constructor(x, y, r, freq, label, dampening = 1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.freq = freq;
        this.lastPlayed = Date.now();
        this.dampening = dampening;
        this.img = chimeImage;
        this.bufferCache = new Map(); // Cache for generated audio buffers

        const options = {
            friction: 0,
            restitution: 1,
            isStatic: true,
            label: label
        };

        this.body = Bodies.circle(this.x, this.y, this.r / 2, options);
        Composite.add(world, this.body);
    }

    draw() {
        const pos = this.body.position;
        push();
        translate(pos.x, pos.y);
        imageMode(CENTER);
        image(this.img, 0, 0, this.r, this.r);
        pop();
    }

    generateBuffer(octave = 1) {
        const cacheKey = `${this.freq}_${octave}`;
        if (this.bufferCache.has(cacheKey)) {
            return this.bufferCache.get(cacheKey);
        }

        const sampleRate = audioContext.sampleRate;
        const delaySamples = Math.round(sampleRate / (this.freq * octave));
        const delayBuffer = new Float32Array(delaySamples);
        let dbIndex = 0;

        const bufferLengthSeconds = 7;
        const bufferSize = sampleRate * bufferLengthSeconds;
        const outputBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        const output = outputBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const variationInSamples = Math.round((Math.random() * 10 - 5) * sampleRate / 1000); // ±5ms
            const noiseBurst = Math.max(0, (sampleRate / 100) + variationInSamples);
            const sample = (i < noiseBurst) ? Math.random() * 1.0 - 0.5 : 0;

            delayBuffer[dbIndex] = sample + 0.997 * (delayBuffer[dbIndex] + delayBuffer[(dbIndex + this.dampening) % delaySamples]) / 2;
            output[i] = delayBuffer[dbIndex];

            if (++dbIndex >= delaySamples) dbIndex = 0;
        }

        this.bufferCache.set(cacheKey, outputBuffer);
        return outputBuffer;
    }

    play(octave = 1) {
        const buffer = this.generateBuffer(octave);

        const source = audioContext.createBufferSource();
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, audioContext.currentTime);

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(audioContext.destination);

        source.start();
        source.onended = () => {
            source.disconnect();
            filter.disconnect();
        };
    }

    setFreq(freq) {
        this.freq = freq;
        this.bufferCache.clear(); // Clear cache since frequency has changed
    }

    remove() {
        Composite.remove(world, this.body);
    }
}
