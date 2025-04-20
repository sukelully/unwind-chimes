const GRID_SIZE = 50;
let buttonHighlight = '#252525';
let buttonHighlightText = 'white';
let stringPos1, stringPos2;
let mouseCount = 0;
const dampeningSlider = document.createElement('input');
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
    fifth:  440,
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

// Sets up the UI with buttons for different actions
function setupUI() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls-container';

    const buttons = [
        { id: 'place-marble-btn', text: 'Place Marble', handler: () => setMode(true) },
        { id: 'clear-marbles-btn', text: 'Clear Marbles', handler: clearMarbles },
        // { id: 'stop-sound-btn', text: 'Stop Chimes', handler: stopChimes }
    ];

    dampeningSlider.type = 'range';
    dampeningSlider.id = 'dampening-slider';
    dampeningSlider.min = '0.5';
    dampeningSlider.max = '5';
    dampeningSlider.value = '1';
    dampeningSlider.step = '0.1';

    buttons.forEach(({ id, text, handler }) => {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = text;

        // Highlight the "Place Marble" button by default
        if (id === 'place-marble-btn') applyButtonHighlight(btn, true);

        btn.addEventListener('click', handler);
        controlsContainer.appendChild(btn);
        controlsContainer.appendChild(dampeningSlider);
    });

    body.appendChild(controlsContainer);
}

function stopChimes() {
    console.log("test");
}

function smoothVelocity(velocity) {
    return 0.9995 - 0.1 * Math.exp(-0.35 * velocity);
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
    
    // Mobile mode
    if (screen.width > 640) {
        chimes.push(new Chime(width/2, height/2, width/4, first, 'chime-1'));  // Center
        chimes.push(new Chime(width, 0, width/4, third, 'chime-2'));                // Top right
        chimes.push(new Chime(width, height, width/4, fifth, 'chime-3'));           // Bottom right
        chimes.push(new Chime(0, height, width/4, seventh, 'chime-4'));             // Bottom left
        chimes.push(new Chime(0, 0, width/4, extended, 'chime-5'));                 // Top left
    } else {
        chimes.push(new Chime(width/2, height/2, 100, first, 'chime-1'));      // Center
        chimes.push(new Chime(width, 0, 150, third, 'chime-2'));                    // Top right
        chimes.push(new Chime(width, height, 150, fifth, 'chime-3'));               // Bottom right
        chimes.push(new Chime(0, height, 150, seventh, 'chime-4'));                 // Bottom left
        chimes.push(new Chime(0, 0, 150, extended, 'chime-5'));                     // Top left
    }
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

    applyButtonHighlight(document.getElementById('place-marble-btn'), marblesActive);
    applyButtonHighlight(document.getElementById('create-string-btn'), !marblesActive);
}

// Highlights the active button
function applyButtonHighlight(button, isActive) {
    button.style.background = isActive ? buttonHighlight : '#efefef';
    button.style.color = isActive ? buttonHighlightText : 'black';
}

function drawCanvas() {
    const screenWidth = screen.width - screen.width / 3;
    const screenHeight = screen.height - screen.height / 3;

    const controlsContainer = document.getElementById('controls-container');
    const adjustedHeight = Math.floor((screenHeight - controlsContainer.offsetHeight) / 10) * 10;

    const isLandscape = screen.width > screen.height;
    const isLargeScreen = screen.width > 640;

    if (isLandscape) {
        createCanvas(isLargeScreen ? screenHeight : screenWidth, isLargeScreen ? screenHeight : adjustedHeight);
        // createCanvas(screenHeight, screenHeight);
        // createCanvas(screenHeight, screenHeight);
        console.log('landscape');
    } else {
        createCanvas(screenWidth, isLargeScreen ? screenWidth : adjustedHeight);
        console.log('portrait');
    }

    const canvasControlsWidth = (body.offsetWidth > body.offsetHeight)
        ? width + 200
        : width + controlsContainer.offsetWidth;

    if (canvasControlsWidth > screen.width) {
        applyColumnLayout(controlsContainer, isLargeScreen, adjustedHeight);
    } else {
        applyRowLayout(controlsContainer);
    }
}

function applyColumnLayout(controlsContainer, isLargeScreen, adjustedHeight) {
    body.style.flexDirection = 'column';
    body.style.gap = '1em';
    controlsContainer.style.flexDirection = 'row';
    controlsContainer.style.flexWrap = 'wrap';
    controlsContainer.style.justifyContent = 'center';

    if (isLargeScreen) {
        createCanvas(adjustedHeight, adjustedHeight);
    } else {
        createCanvas(width, adjustedHeight - 100);
    }
}

function applyRowLayout(controlsContainer) {
    body.style.flexDirection = 'row';
    body.style.gap = '3em';
    controlsContainer.style.flexDirection = 'column';
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