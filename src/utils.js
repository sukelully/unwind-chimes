const GRID_SIZE = 50;
let buttonHighlight = '#252525';
let buttonHighlightText = 'white';
let stringPos1, stringPos2;
let mouseCount = 0;
const speedSlider = document.createElement('input');
const audioContext = new (window.AudioContext || window.webkitAudioContext)({
    latencyHint: 'interactive',
    sampleRate: 44100,
    bufferSize: 4096
});
let source;
let octave = 1;

// Chord frequencies objects
cMaj = {
    first: 261.63,
    third: 329.63,
    fifth: 392,
    seventh: 493.88,
    extended: 587.33
}

dMin = {
    first: 293.66,
    third: 349.23,
    fifth: 440,
    seventh: 523.25,
    extended: 659.25
}

fMaj = {
    first: 349.23,
    third: 440,
    fifth: 523.25,
    seventh: 659.25,
    extended: 783.99
}

gMaj = {
    first: 392,
    third: 493.88,
    fifth: 587.33,
    seventh: 698.46,
    extended: 783.99
}

aMin = {
    first: 440,
    third: 523.25,
    fifth: 659.25,
    seventh: 783.99,
    extended: 987.77
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('info-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Show the modal when the page loads
    modal.classList.add('show');

    // Close the modal when the button is clicked
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
});

// Sets up the UI with buttons for different actions
function setupUI() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls-container';

    const buttons = [
        { id: 'clear-marbles-btn', text: 'Clear Marbles', handler: clearMarbles },
        // { id: 'stop-sound-btn', text: 'Stop Chimes', handler: stopChimes }
    ];

    speedSlider.type = 'range';
    speedSlider.id = 'dampening-slider';
    speedSlider.min = '0.5';
    speedSlider.max = '5';
    speedSlider.value = '2.5'
    speedSlider.step = '0.1';

    buttons.forEach(({ id, text, handler }) => {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = text;

        btn.addEventListener('click', handler);
        controlsContainer.appendChild(btn);
        controlsContainer.appendChild(speedSlider);
    });

    body.appendChild(controlsContainer);
}

// Creates a line between two points and adds it to the specified array
function createLineBetweenPoints(arr, pos1, pos2, thickness = 5) {
    const midX = (pos2.x + pos1.x) / 2;
    const midY = (pos2.y + pos1.y) / 2;

    let opp = pos2.y - pos1.y;
    let adj = pos2.x - pos1.x;

    if (adj < 0) opp *= -1;

    const hyp = Math.hypot(opp, adj);
    const rotation = Math.asin(opp / hyp);

    arr.push(new Boundary(midX, midY, hyp, thickness, rotation));
}

function createChimes(first, third, fifth, seventh, extended) {
    clearChimes();

    // NEEDS FIXING
    // Mobile mode
    if (screen.width > 640) {
        chimes.push(new Chime(width / 2, height / 2, width / 4, first, 'chime-1'));  // Center
        chimes.push(new Chime(width, 0, width / 4, third, 'chime-2'));                // Top right
        chimes.push(new Chime(width, height, width / 4, fifth, 'chime-3'));           // Bottom right
        chimes.push(new Chime(0, height, width / 4, seventh, 'chime-4'));             // Bottom left
        chimes.push(new Chime(0, 0, width / 4, extended, 'chime-5'));                 // Top left
    } else {
        chimes.push(new Chime(width / 2, height / 2, 75, first, 'chime-1'));      // Center
        chimes.push(new Chime(width, 0, 100, third, 'chime-2'));                    // Top right
        chimes.push(new Chime(width, height, 100, fifth, 'chime-3'));               // Bottom right
        chimes.push(new Chime(0, height, 100, seventh, 'chime-4'));                 // Bottom left
        chimes.push(new Chime(0, 0, 100, extended, 'chime-5'));                     // Top left
    }
}

function changeChimesFreq(first, third, fifth, seventh, extended) {
    chimes[0].setFreq(first);
    chimes[1].setFreq(third);
    chimes[2].setFreq(fifth);
    chimes[3].setFreq(seventh);
    chimes[4].setFreq(extended);
}

// Generates borders around the canvas
function createBorders() {
    const thickness = 50;
    borders.push(new Boundary(width / 2, -thickness / 2, width, thickness));
    borders.push(new Boundary(-thickness / 2, height / 2, thickness, height));
    borders.push(new Boundary(width / 2, height + thickness / 2, width, thickness));
    borders.push(new Boundary(width + thickness / 2, height / 2, thickness, height));
}

// Checks if coordinates are within the canvas, accounting for rounded corners
function isWithinCanvas(x, y, radius) {
    if (x >= 0 && x <= width && y >= radius && y <= height - radius) return true;
    if (x >= radius && x <= width - radius && y >= 0 && y <= height) return true;

    const corners = [
        { cx: radius, cy: radius },                     // Top-left
        { cx: width - radius, cy: radius },             // Top-right
        { cx: radius, cy: height - radius },            // Bottom-left
        { cx: width - radius, cy: height - radius }     // Bottom-right
    ];

    return corners.some(({ cx, cy }) => (x - cx) ** 2 + (y - cy) ** 2 < radius ** 2);
}

// Toggles between marble and string placement modes
function setMode(marblesActive) {
    mode.marbles = marblesActive;
    mode.strings = !marblesActive;
}

function drawCanvas() {
    const controlsHeight = document.getElementById('controls-container')?.offsetHeight || 0;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (viewportWidth > viewportHeight) {
        const screenHeight = viewportHeight - controlsHeight;
        createCanvas(screenHeight, screenHeight);
    } else {
        const screenWidth = viewportWidth;
        const screenHeight = viewportHeight - controlsHeight - 50;
        createCanvas(screenWidth, screenHeight);
    }
}

function clearBorders() {
    borders.forEach(border => border.remove());
    borders = [];
}

function clearChimes() {
    chimes.forEach(chime => chime.remove());
    chimes = [];
}

function clearMarbles() {
    marbles.forEach(marble => marble.remove());
    marbles = [];
}

function setMarbleSpeed(speed) {
    marbles.forEach(marble => {
        marble.setSpeed(speed);
    });
    bassMarble.setSpeed(speed);
}

speedSlider.addEventListener('input', () => setMarbleSpeed(speedSlider.value));