class Chime {
    constructor(x, y, r, freq, label, dampening = 1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.freq = freq;
        this.lastPlayed = Date.now();
        this.dampening = dampening;
        this.img = loadImage('img/chime.png');

        let options = {
            friction: 0,
            restitution: 1,
            isStatic: true,
            label: label
        }

        this.body = Bodies.circle(this.x, this.y, this.r / 2, options);
        Composite.add(world, this.body);
    }

    // draw() {
    //     let pos = this.body.position;
    //     push();
    //     translate(pos.x, pos.y);
    //     strokeWeight(1);
    //     stroke(0);
    //     fill(0);
    //     ellipse(0, 0, this.r);
    //     pop();
    // }

    draw() {
        let pos = this.body.position;
        push();
        translate(pos.x, pos.y);
        imageMode(CENTER);
        image(this.img, 0, 0, this.r, this.r);
        pop();
    }

    // Play string pluck at given frequency
    play(octave = 1) {
        // Initialize audioContext if it doesn't exist
        const delaySamples = Math.round(audioContext.sampleRate / (this.freq * octave));
        const delayBuffer = new Float32Array(delaySamples);
        let dbIndex = 0;

        // 7s output buffer
        const bufferSize = audioContext.sampleRate * 7;
        const outputBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = outputBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const variationInSamples = Math.round((Math.random() * 10 - 5) * audioContext.sampleRate / 1000); // ±5ms in samples
            const noiseBurst = Math.max(0, (audioContext.sampleRate / 100) + variationInSamples); // Ensure non-negative
            // 0.5 is volume
            const sample = (i < noiseBurst) ? Math.random() * 2 * 0.5 - 0.5 : 0;

            // Apply lowpass by averaging adjacent delay line samples
            delayBuffer[dbIndex] = sample + 0.997 * (delayBuffer[dbIndex] + delayBuffer[(dbIndex + this.dampening) % delaySamples]) / 2;

            // 8 bit
            // delayBuffer[dbIndex] = sample + 0.997 * (delayBuffer[dbIndex] + delayBuffer[(dbIndex) % delaySamples]) / 2; 
            output[i] = delayBuffer[dbIndex];

            // Loop delay buffer
            if (++dbIndex >= delaySamples) {
                dbIndex = 0;
            }
        }

        // Signal routing
        const source = audioContext.createBufferSource();
        const filter = audioContext.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, audioContext.currentTime);
        source.buffer = outputBuffer;

        source.connect(filter);
        filter.connect(audioContext.destination);

        source.start();
        source.onended = () => {
            source.disconnect();
        }
    }

    remove() {
        Composite.remove(world, this.body);
    }
}