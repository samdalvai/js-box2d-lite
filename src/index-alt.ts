import Vec2 from './math/Vec2';
import Canvas from './alt/Canvas';
import Pointer from './alt/Pointer';
import World from './alt/World';

const canvas = new Canvas(1200, 600);
const ctx = canvas.ctx;
const pointer = new Pointer(canvas);

function run() {
    let timePreviousFrame = performance.now();

    const loop = (now: number) => {
        // TODO: to be used somehow?
        const deltaTime = (now - timePreviousFrame) / 1000;
        timePreviousFrame = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1.5;
        // TODO: use detlatime for stepping function and eveerywhere it's used?
        world.step();

        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
}

// init the world
function init() {
    const timeStep = 1 / 30;

    world = new World({
        gravity: new Vec2(0, 50),
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
    const ground = world.addBody({
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
    const numPlanks = 15;
    const mass = 50.0;
    const frequencyHz = 0.8;
    const dampingRatio = 0.7;
    // frequency in radians
    const omega = 2.0 * Math.PI * frequencyHz;
    // damping coefficient
    const d = 2.0 * mass * dampingRatio * omega;
    // spring stifness
    const k = mass * omega * omega;
    // magic formulas
    const softness = 1.0 / (d + timeStep * k);
    const biasFactor = (timeStep * k) / (d + timeStep * k);

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
        const bb = world.addBody({ x: i, y: 300, w: 50, h: 50, mass: 40 });
        const bc = world.addBody({ x: i, y: 400, w: 50, h: 50, mass: 40 });
        world.addJoint({ b1: bb, b2: ground, ax: i, ay: 200 });
        world.addJoint({ b1: bc, b2: bb, ax: i, ay: 300 });
        bc.velocity.x = 100 * Math.random() - 50;
    }

    world.addBody({ x: 400, y: 0, w: 50, h: 50, mass: 100 });
    world.addBody({ x: 600, y: 0, w: 50, h: 50, mass: 100 });
    world.addBody({ x: 800, y: 0, w: 50, h: 50, mass: 100 });
}

// let's start
let world: World;
init();
run();

// add more box on click / touch
window.addEventListener('mousedown', e => down(e), false);
window.addEventListener('touchstart', e => down(e), false);

function down(e: MouseEvent | TouchEvent) {
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
let boxSize: number;
let color: string;
let grav: Vec2;
let mass: number;

radio(document.getElementById('large'));

function radio(b: any) {
    switch (b.value) {
        case 'large':
            boxSize = 50;
            color = '#FFF';
            grav = new Vec2(0, 50),
            mass = 100;
            break;
        case 'small':
            boxSize = 12;
            color = '#f80';
            grav = new Vec2(0, 50),
            mass = 40;
            break;
        case 'antigravity':
            boxSize = 12;
            color = '#08f';
            grav = new Vec2(0, -50),
            mass = 20;
            break;
    }

    return false;
}

declare global {
    interface Window {
        radio: (b: HTMLInputElement) => boolean;
    }
}

window.radio = radio;
