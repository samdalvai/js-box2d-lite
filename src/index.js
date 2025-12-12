import Canvas from './new/Canvas';
import Pointer from './new/Pointer';
import World from './new/World';

let canvas = new Canvas(1200, 600);
let ctx = canvas.ctx;
let pointer = new Pointer(canvas);

function run() {
    requestAnimationFrame(run);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1.5;
    world.step();
}

// init the world
function init() {
    let timeStep = 1 / 30;

    world = new World({
        gravity: 40,
        iterations: 20,
        timeStep: timeStep,
        friction: 0.3,
        allowedPenetration: 0.05,
        biasFactor: 0.2,
        relativeTol: 0.95,
        absoluteTol: 0.01,
        ctx: ctx,
    });

    // ground
    let ground = world.addBody({
        x: 600,
        y: 649,
        w: 1200,
        h: 100,
        mass: Infinity,
        friction: 3.8,
        visible: false,
    });

    // side walls
    world.addBody({
        x: -50,
        y: 0,
        w: 100,
        h: 1200,
        mass: Infinity,
        friction: 3.8,
        visible: false,
    });
    world.addBody({
        x: 1250,
        y: 0,
        w: 100,
        h: 1200,
        mass: Infinity,
        friction: 3.8,
        visible: false,
    });

    // lot of small boxes
    for (let i = 0; i < 30; i++) {
        for (let j = 0; j < 10; j++) {
            world.addBody({
                x: 350 + i * 16,
                y: -200 + j * 16,
                w: 12,
                h: 12,
                mass: 5,
                vy: -150 + j,
                color: '#f80',
            });
        }
    }

    // A suspension bridge
    let numPlanks = 15;
    let mass = 50.0;
    let frequencyHz = 0.8;
    let dampingRatio = 0.7;
    // frequency in radians
    let omega = 2.0 * Math.PI * frequencyHz;
    // damping coefficient
    let d = 2.0 * mass * dampingRatio * omega;
    // spring stifness
    let k = mass * omega * omega;
    // magic formulas
    let softness = 1.0 / (d + timeStep * k);
    let biasFactor = (timeStep * k) / (d + timeStep * k);

    let p = ground,
        b;
    for (let i = 0; i < numPlanks; ++i) {
        b = world.addBody({
            x: 250 + 50 * i,
            y: 200,
            w: 45,
            h: 12,
            mass: mass,
            friction: 1,
            color: '#888',
        });
        if (p) {
            world.addJoint({
                b1: b,
                b2: p,
                ax: -50 + 250 + 50 * i,
                ay: 200,
                softness: softness,
                biasFactor: biasFactor,
            });
        }
        p = b;
    }
    world.addJoint({
        b1: b,
        b2: ground,
        ax: 250 + 50 * numPlanks,
        ay: 200,
        softness: softness,
        biasFactor: biasFactor,
    });

    // 2 Pendulum
    for (let i = 200; i <= 1000; i += 800) {
        let bb = world.addBody({ x: i, y: 300, w: 50, h: 50, mass: 40 });
        let bc = world.addBody({ x: i, y: 400, w: 50, h: 50, mass: 40 });
        world.addJoint({ b1: bb, b2: ground, ax: i, ay: 200 });
        world.addJoint({ b1: bc, b2: bb, ax: i, ay: 300 });
        bc.vx = 100 * Math.random() - 50;
    }

    world.addBody({ x: 400, y: 0, w: 50, h: 50, mass: 100 });
    world.addBody({ x: 600, y: 0, w: 50, h: 50, mass: 100 });
    world.addBody({ x: 800, y: 0, w: 50, h: 50, mass: 100 });
}

// let's start
let world;
init();
run();

// add more box on click / touch
window.addEventListener('mousedown', e => down(e), false);
window.addEventListener('touchstart', e => down(e), false);

function down(e) {
    pointer.move(e);
    e.preventDefault();
    world.addBody({
        x: pointer.x,
        y: pointer.y,
        w: boxSize,
        h: boxSize,
        mass: mass,
        gravity: grav,
        color: color,
    });
}

// some options
let boxSize, color, grav, mass;
radio(document.getElementById('large'));

function radio(b) {
    switch (b.value) {
        case 'large':
            boxSize = 50;
            color = '#FFF';
            grav = 50;
            mass = 100;
            break;
        case 'small':
            boxSize = 12;
            color = '#f80';
            grav = 50;
            mass = 40;
            break;
        case 'antigravity':
            boxSize = 12;
            color = '#08f';
            grav = -50;
            mass = 20;
            break;
    }

    return false;
}

window.radio = radio;
