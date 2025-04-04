class Chime {
    constructor(x, y, r, freq, chime) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.freq = freq;

        let options = {
            friction: 0,
            restitution: 1,
            isStatic: true,
            label: chime
        }

        this.body = Bodies.circle(this.x, this.y, this.r / 2, options);
        Composite.add(world, this.body);
    }

    draw() {
        let pos = this.body.position;
        push();
        translate(pos.x, pos.y);
        strokeWeight(1);
        stroke(0);
        fill(0);
        ellipse(0, 0, this.r);
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
            const noiseBurst = audioContext.sampleRate / 100;
            // 0.2 is volume
            const sample = (i < noiseBurst) ? Math.random() * 2 * 0.2 - 0.2 : 0;

            // Apply lowpass by averaging adjacent delay line samples
            delayBuffer[dbIndex] = sample + 0.997 * (delayBuffer[dbIndex] + delayBuffer[(dbIndex + 1) % delaySamples]) / 2;
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