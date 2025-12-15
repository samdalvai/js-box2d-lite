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
        floor.set(new Vec2(100, 20), Number.MAX_VALUE);
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
        floor.set(new Vec2(100, 20), Number.MAX_VALUE);
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

    static demo4 = (world: World) => {
        // Demo 4: A vertical stack
        const floor = new Body();
        floor.set(new Vec2(100, 20), Number.MAX_VALUE);
        floor.friction = 0.2;
        floor.position.set(0, -0.8 * floor.width.y);
        floor.rotation = 0;
        world.add(floor);

        for (let i = 0; i < 10; i++) {
            const box = new Body();
            box.set(new Vec2(1, 1), 1);
            box.friction = 0.2;
            const x = Utils.random(-0.1, 0.1);
            box.position.set(x, -4 + 1.05 * i);
            world.add(box);
        }
    };

    static demo7 = (world: World) => {
        // Demo 7: A suspension bridge
        const floor = new Body();
        floor.set(new Vec2(100, 20), Number.MAX_VALUE);
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

/*
b.Set(Vec2(100.0, 20.0), FLT_MAX);
	b.friction = 0.2f;
	b.position.Set(0.0, -0.5f * b.width.y);
	b.rotation = 0.0;
	world.Add(b);
	++b; ++numBodies;

	const int numPlanks = 15;
	const mass = 50.0;

	for (int i = 0; i < numPlanks; ++i)
	{
		b.Set(Vec2(1.0, 0.25f), mass);
		b.friction = 0.2f;
		b.position.Set(-8.5f + 1.25f * i, 5.0);
		world.Add(b);
		++b; ++numBodies;
	}

	// Tuning
	const frequencyHz = 2.0;
	const dampingRatio = 0.7f;

	// frequency in radians
	const omega = 2.0 * k_pi * frequencyHz;

	// damping coefficient
	const d = 2.0 * mass * dampingRatio * omega;

	// spring stifness
	const k = mass * omega * omega;

	// magic formulas
	const softness = 1.0 / (d + timeStep * k);
	const biasFactor = timeStep * k / (d + timeStep * k);

	for (int i = 0; i < numPlanks; ++i)
	{
		j.Set(bodies+i, bodies+i+1, Vec2(-9.125f + 1.25f * i, 5.0));
		j.softness = softness;
		j.biasFactor = biasFactor;

		world.Add(j);
		++j; ++numJoints;
	}

	j.Set(bodies + numPlanks, bodies, Vec2(-9.125f + 1.25f * numPlanks, 5.0));
	j.softness = softness;
	j.biasFactor = biasFactor;
	world.Add(j);
	++j; ++numJoints;*/
