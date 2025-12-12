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
}
