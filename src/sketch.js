// Import Matter.js modules
const { Engine, World, Bodies, Body, Composite } = Matter;

const marbleCategory = 0x0001;
const bassMarbleCategory = 0x0002;
const worldCategory = 0x0003;

// DOM and global variables
const body = document.querySelector('body');
const marbleLimit = 7;
let engine, world;
let marbles = [], borders = [], grid = [], chimes = [];
let isDragging = false;
let bassMarble;
let dragStart = null;

// Mode toggles for placing marbles or creating strings
const mode = { marbles: true};

// Call drawCanvas in setup and on resize
function setup() {
    setupUI();
    drawCanvas();

    // Initialize Matter.js engine and world
    engine = Engine.create();
    engine.gravity.y = 0
    world = engine.world;

    // Generate borders and add initial objects
    createBorders();
    createChimes();

    // Create bass marble
    bassMarble = new BassMarble(width / 2, height / 2 + 200, 50);

    // Add collision event listener
    Matter.Events.on(engine, 'collisionStart', handleCollision);
    redrawCanvas();   // Resize canvas 
}

// Main draw loop
function draw() {
    clear();
    background(255);
    // frameRate(30);
    Engine.update(engine);

    if (mode.grid) grid.forEach(gridLine => gridLine.draw());
    // borders.forEach(border => border.draw());
    chimes.forEach(chime => chime.draw());
    bassMarble.draw();
    marbles.forEach(marble => {
        marble.draw();
    });
}

// Handles collisions between marbles and strings
function handleCollision(event) {
    const pairs = event.pairs;

    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        // Check if one body is a marble and the other is a string
        const isMarbleAndChime =
            (bodyA.label === 'marble' && bodyB.label.startsWith('chime')) ||
            (bodyA.label.startsWith('chime') && bodyB.label === 'marble');

        const isBassMarbleAndChime =
            (bodyA.label === 'bass-marble' && bodyB.label.startsWith('chime')) ||
            (bodyA.label.startsWith('chime') && bodyB.label === 'bass-marble');

        if (isMarbleAndChime) {
            const chimeBody = bodyA.label.startsWith('chime') ? bodyA : bodyB;

            // Find the corresponding String instance and play sound
            const chimeInstance = chimes.find(chime => chime.body === chimeBody);
            if (chimeInstance) {
                chimeInstance.play();
            }
        }

        if (isBassMarbleAndChime) {
            const chimeBody = bodyA.label.startsWith('chime') ? bodyA : bodyB;
            const chimeInstance = chimes.find(chime => chime.body === chimeBody);

            // Switch chime notes and play root note
            if (chimeInstance) {
                switch (chimeInstance.body.label) {
                    case 'chime-1':
                        createChimes(cMaj.first, cMaj.third, cMaj.fifth, cMaj.seventh, cMaj.extended);
                        chimes[0].play(1 / 2);
                        break;
                    case 'chime-2':
                        createChimes(dMin.first, dMin.third, dMin.fifth, dMin.seventh, dMin.extended);
                        chimes[0].play(1 / 2);
                        break;
                    case 'chime-3':
                        createChimes(fMaj.first, fMaj.third, fMaj.fifth, fMaj.seventh, fMaj.extended);
                        chimes[0].play(1 / 2);
                        break;
                    case 'chime-4':
                        createChimes(gMaj.first, gMaj.third, gMaj.fifth, gMaj.seventh, gMaj.extended);
                        chimes[0].play(1 / 2);
                        break;
                    case 'chime-5':
                        createChimes(aMin.first, aMin.third, aMin.fifth, aMin.seventh, aMin.extended);
                        chimes[0].play(1 / 2);
                        break;
                    default:
                        break;
                }
            }
        }
    });
}

function mousePressed() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return;
    } else {
        // Limit mouse presses to canvas area
        if (mouseX < 0 || mouseY < 0 || mouseX >= width || mouseY >= height) return;

        // Place marbles
        if (mode.marbles) {
            if (marbles.length >= marbleLimit) {
                return;
            } else {
                marbles.push(new Marble(mouseX, mouseY, 30, 2.5));
            }
        }
    }
}

function touchStarted() {
    // Place marbles
    if (mode.marbles) {

        // Place marbles
        if (mode.marbles) {
            if (marbles.length >= marbleLimit) {
                return;
            } else {
                marbles.push(new Marble(mouseX, mouseY, 30, 2.5));
            }
        }
    }
}

function redrawCanvas() {
    bassMarble.remove();
    if (width > 640) {
        bassMarble = new BassMarble(width / 2, height / 2 + 200, 50, 2.5);
    } else {
        bassMarble = new BassMarble(width / 2, height / 2 + 200, 30, 2.5);
    }
    clearBorders();
    clearChimes();
    drawCanvas();
    createBorders();
    createChimes(cMaj.first, cMaj.third, cMaj.fifth, cMaj.seventh, cMaj.extended);
}

window.addEventListener('resize', redrawCanvas);