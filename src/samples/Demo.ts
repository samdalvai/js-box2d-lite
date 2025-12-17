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

    static demo8 = (world: World) => {
        // Demo 8: Dominos
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        // TODO: to be completed
        // b->Set(Vec2(12.0f, 0.5f), FLT_MAX);
        // b->position.Set(-1.5f, 10.0f);
        // world.Add(b);
        // ++b; ++numBodies;

        // for (int i = 0; i < 10; ++i)
        // {
        //     b->Set(Vec2(0.2f, 2.0f), 10.0f);
        //     b->position.Set(-6.0f + 1.0f * i, 11.125f);
        //     b->friction = 0.1f;
        //     world.Add(b);
        //     ++b; ++numBodies;
        // }

        // b->Set(Vec2(14.0f, 0.5f), FLT_MAX);
        // b->position.Set(1.0f, 6.0f);
        // b->rotation = 0.3f;
        // world.Add(b);
        // ++b; ++numBodies;

        // Body* b2 = b;
        // b->Set(Vec2(0.5f, 3.0f), FLT_MAX);
        // b->position.Set(-7.0f, 4.0f);
        // world.Add(b);
        // ++b; ++numBodies;

        // Body* b3 = b;
        // b->Set(Vec2(12.0f, 0.25f), 20.0f);
        // b->position.Set(-0.9f, 1.0f);
        // world.Add(b);
        // ++b; ++numBodies;

        // j->Set(b1, b3, Vec2(-2.0f, 1.0f));
        // world.Add(j);
        // ++j; ++numJoints;

        // Body* b4 = b;
        // b->Set(Vec2(0.5f, 0.5f), 10.0f);
        // b->position.Set(-10.0f, 15.0f);
        // world.Add(b);
        // ++b; ++numBodies;

        // j->Set(b2, b4, Vec2(-7.0f, 15.0f));
        // world.Add(j);
        // ++j; ++numJoints;

        // Body* b5 = b;
        // b->Set(Vec2(2.0f, 2.0f), 20.0f);
        // b->position.Set(6.0f, 2.5f);
        // b->friction = 0.1f;
        // world.Add(b);
        // ++b; ++numBodies;

        // j->Set(b1, b5, Vec2(6.0f, 2.6f));
        // world.Add(j);
        // ++j; ++numJoints;

        // Body* b6 = b;
        // b->Set(Vec2(2.0f, 0.2f), 10.0f);
        // b->position.Set(6.0f, 3.6f);
        // world.Add(b);
        // ++b; ++numBodies;

        // j->Set(b5, b6, Vec2(7.0f, 3.5f));
        // world.Add(j);
        // ++j; ++numJoints;
    };

    static demo9 = (world: World) => {
        // Demo 9: A multi-pendulum
        const floor = new Body();
        floor.set(new Vec2(100, 20), Infinity);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        // TODO: to be completed
        // Body * b1 = b;
        // ++b;
        // ++numBodies;

        // float mass = 10.0f;

        // // Tuning
        // float frequencyHz = 4.0f;
        // float dampingRatio = 0.7f;

        // // frequency in radians
        // float omega = 2.0f * k_pi * frequencyHz;

        // // damping coefficient
        // float d = 2.0f * mass * dampingRatio * omega;

        // // spring stiffness
        // float k = mass * omega * omega;

        // // magic formulas
        // float softness = 1.0f / (d + timeStep * k);
        // float biasFactor = timeStep * k / (d + timeStep * k);

        // const float y = 12.0f;

        // for (int i = 0; i < 15; ++i)
        // {
        //     Vec2 x(0.5f + i, y);
        //     b->Set(Vec2(0.75f, 0.25f), mass);
        //     b->friction = 0.2f;
        //     b->position = x;
        //     b->rotation = 0.0f;
        //     world.Add(b);

        //     j->Set(b1, b, Vec2(float(i), y));
        //     j->softness = softness;
        //     j->biasFactor = biasFactor;
        //     world.Add(j);

        //     b1 = b;
        //     ++b;
        //     ++numBodies;
        //     ++j;
        //     ++numJoints;
        // }
    };

    static demoFunctions = [
        this.demo1,
        this.demo2,
        this.demo3,
        this.demo4,
        this.demo5,
        this.demo6,
        this.demo7,
        this.demo8,
        this.demo9,
    ];
}
