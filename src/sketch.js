// Import Matter.js modules
const { Engine, World, Bodies, Body, Composite } = Matter;

const marbleCategory = 0x0001;
const bassMarbleCategory = 0x0002;
const worldCategory = 0x0003;

// DOM and global variables
const body = document.querySelector('body');
const marbleLimit = 7;
const marbleCollisionTimes = new Map();
let engine, world;
let marbles = [], borders = [], chimes = [];
let isDragging = false;
let bassMarble;
let lastBassMarbleCollision = 0;
let dragStart = null;

// Mode toggles for placing marbles or creating strings
const mode = { marbles: true };

// Chord mapping
const chordMap = {
    'chime-1': cMaj,
    'chime-2': dMin,
    'chime-3': fMaj,
    'chime-4': gMaj,
    'chime-5': aMin,
};

function setup() {
    setupUI();
    drawCanvas();

    engine = Engine.create();
    engine.gravity.y = 0;
    world = engine.world;

    createBorders();
    createChimes();

    bassMarble = new BassMarble(width / 2, height / 2 + 200, 50);
    redrawCanvas();
}

function draw() {
    clear();
    background(255);
    Engine.update(engine);

    chimes.forEach(chime => chime.draw());
    detectBassMarbleCollision();
    bassMarble.draw();
    marbles.forEach(marble => {
        detectMarbleCollision(marble);
        marble.draw();
    });
}

function checkAndPlayChimeCollision(body, lastCollisionTimeRef, cooldown = 500, isBass = false) {
    const now = Date.now();
    if (now - lastCollisionTimeRef.value < cooldown) return;

    chimes.forEach(chime => {
        if (Matter.Collision.collides(body, chime.body)) {
            lastCollisionTimeRef.value = now;
            if (isBass) {
                handleChordChange(chime);
                chime.play(1 / 2);
            } else {
                chime.play();
            }
        }
    });
}

function detectMarbleCollision(marble) {
    checkAndPlayChimeCollision(marble.body, {
        value: marbleCollisionTimes.get(marble) || 0,
        set value(val) { marbleCollisionTimes.set(marble, val); }
    });
}

function detectBassMarbleCollision() {
    checkAndPlayChimeCollision(bassMarble.body, {
        get value() { return lastBassMarbleCollision; },
        set value(val) { lastBassMarbleCollision = val; }
    }, 500, true);
}

function handleChordChange(chime) {
    const chord = chordMap[chime.body.label];
    
    if (chord) {
        changeChimesFreq(chord.first, chord.third, chord.fifth, chord.seventh, chord.extended);
    }
}

function tryPlaceMarble(x, y) {
    if (!mode.marbles || marbles.length >= marbleLimit) return;
    const size = width > 640 ? 30 : 15;
    marbles.push(new Marble(x, y, size, speedSlider.value));
}

function mousePressed() {
    if (isTouchDevice()) return;
    if (mouseX < 0 || mouseY < 0 || mouseX >= width || mouseY >= height) return;
    tryPlaceMarble(mouseX, mouseY);
}

function touchStarted() {
    tryPlaceMarble(mouseX, mouseY);
}

function isTouchDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function redrawCanvas() {
    bassMarble.remove();
    const size = width > 640 ? 50 : 25;
    bassMarble = new BassMarble(width / 2, height / 2 + 200, size, 2.5);
    clearBorders();
    clearChimes();
    drawCanvas();
    createBorders();
    createChimes(cMaj.first, cMaj.third, cMaj.fifth, cMaj.seventh, cMaj.extended);
}

window.addEventListener('resize', redrawCanvas);
