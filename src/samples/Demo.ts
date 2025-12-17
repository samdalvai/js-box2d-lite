import Utils from '../math/Utils';
import Vec2 from '../math/Vec2';
import Body from '../physics/Body';
import Joint from '../physics/Joint';
import World from '../physics/World';

export default class Demo {
    static demoStrings = [
        'Demo 1: A Single Box',
        'Demo 2: Simple Pendulum',
        'Demo 3: Varying Friction Coefficients',
        'Demo 4: Randomized Stacking',
        'Demo 5: Pyramid Stacking',
        'Demo 6: A Teeter',
        'Demo 7: A Suspension Bridge',
        'Demo 8: Dominos',
        'Demo 9: Multi-pendulum',
    ];

    static demo1 = (world: World) => {
        // Demo1: Single box
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.position.set(0, -0.8 * floor.width.y);
        world.add(floor);

        const box1 = new Body();
        box1.set(new Vec2(1, 1), 200);
        box1.position.set(0, 1);
        world.add(box1);
    };

    static demo2 = (world: World) => {
        // Demo 2: A simple pendulum
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        const box = new Body();
        box.set(new Vec2(1, 1), 100);
        box.friction = 0.2;
        box.position.set(9, 5);
        box.rotation = 0;
        world.add(box);

        const j = new Joint();
        j.set(floor, box, new Vec2(0, 5));
        world.add(j);
    };

    static demo3 = (world: World) => {
        // Demo 3: Varying friction coefficients
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        const slide1 = new Body();
        slide1.set(new Vec2(13.0, 0.25), Infinity);
        slide1.position.set(-2.0, 5);
        slide1.rotation = -0.25;
        world.add(slide1);

        const block1 = new Body();
        block1.set(new Vec2(0.25, 1.0), Infinity);
        block1.position.set(5.25, 3.5);
        world.add(block1);

        const slide2 = new Body();
        slide2.set(new Vec2(13.0, 0.25), Infinity);
        slide2.position.set(2.0, 1);
        slide2.rotation = 0.25;
        world.add(slide2);

        const block2 = new Body();
        block2.set(new Vec2(0.25, 1.0), Infinity);
        block2.position.set(-5.25, -0.5);
        world.add(block2);

        const slide3 = new Body();
        slide3.set(new Vec2(13.0, 0.25), Infinity);
        slide3.position.set(-2.0, -3);
        slide3.rotation = -0.25;
        world.add(slide3);

        const friction = [0.75, 0.5, 0.35, 0.1, 0.0];
        for (let i = 0; i < friction.length; i++) {
            const b = new Body();
            b.set(new Vec2(0.5, 0.5), 25.0);
            b.friction = friction[i];
            b.position.set(-7.5 + 2.0 * i, 8.0);
            world.add(b);
        }
    };

    static demo4 = (world: World) => {
        // Demo 4: A vertical stack
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        for (let i = 0; i < 10; i++) {
            const box = new Body();
            box.set(new Vec2(1, 1), 1);
            box.friction = 0.2;
            const x = Utils.random(-0.1, 0.1);
            box.position.set(x, -5 + 1.05 * i);
            world.add(box);
        }
    };

    static demo5 = (world: World) => {
        // Demo 5: A pyramid
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        const x = new Vec2(-6.0, -4);

        for (let i = 0; i < 12; i++) {
            const y = x.clone();

            for (let j = i; j < 12; j++) {
                const b = new Body();
                b.set(new Vec2(1.0, 1.0), 10.0);
                b.friction = 0.2;
                b.position.set(y.x, y.y);
                world.add(b);

                y.add(new Vec2(1.125, 0.0));
            }

            x.add(new Vec2(0.5625, 2.0));
        }
    };

    static demo6 = (world: World) => {
        // Demo 6: A teeter
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        const teeter = new Body();
        teeter.set(new Vec2(12.0, 0.25), 100.0);
        teeter.position.set(0.0, -5);
        world.add(teeter);

        const small1 = new Body();
        small1.set(new Vec2(0.5, 0.5), 25.0);
        small1.position.set(-5.0, -4);
        world.add(small1);

        const small2 = new Body();
        small2.set(new Vec2(0.5, 0.5), 25.0);
        small2.position.set(-5.5, -4);
        world.add(small2);

        const bigBox = new Body();
        bigBox.set(new Vec2(1.0, 1.0), 200.0);
        bigBox.position.set(5.5, 5.0);
        world.add(bigBox);

        const j = new Joint();
        j.set(floor, teeter, new Vec2(0.0, -5));
        world.add(j);
    };

    static demo7 = (world: World) => {
        // Demo 7: A suspension bridge
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        const numPlanks = 15;
        const mass = 50;

        for (let i = 0; i < numPlanks; ++i) {
            const b = new Body();
            b.set(new Vec2(1.0, 0.25), mass);
            b.friction = 0.2;
            b.position.set(-8.5 + 1.25 * i, 1.0);
            world.add(b);
        }

        // Tuning
        const frequencyHz = 2.0;
        const dampingRatio = 0.7;

        // frequency in radians
        const omega = 2.0 * Math.PI * frequencyHz;

        // damping coefficient
        const d = 2.0 * mass * dampingRatio * omega;

        // spring stifness
        const k = mass * omega * omega;

        // magic formulas
        const timeStep = 1 / 50;
        const softness = 1.0 / (d + timeStep * k);
        const biasFactor = (timeStep * k) / (d + timeStep * k);

        for (let i = 0; i < numPlanks; ++i) {
            const j = new Joint();
            j.set(world.bodies[i], world.bodies[i + 1], new Vec2(-9.125 + 1.25 * i, 1.0));
            j.softness = softness;
            j.biasFactor = biasFactor;

            world.add(j);
        }

        const j = new Joint();
        j.set(world.bodies[numPlanks], world.bodies[0], new Vec2(-9.125 + 1.25 * numPlanks, 1.0));
        j.softness = softness;
        j.biasFactor = biasFactor;
        world.add(j);
    };
}
