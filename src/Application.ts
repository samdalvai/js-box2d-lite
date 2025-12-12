import Graphics from './Graphics';
import InputManager, { MouseButton } from './InputManager';
import Utils from './math/Utils';
import Vec2 from './math/Vec2';
import Body from './physics/Body';
import Joint from './physics/Joint';
import World from './physics/World';

export default class Application {
    private running = false;

    // Debug related properties
    private debug = true;
    private FPS = 0;
    private lastFPSUpdate = 0;

    private world: World;
    private bomb: Body | null;

    constructor() {
        const gravity = new Vec2(0, -10);
        const iterations = 10;

        this.world = new World(gravity, iterations);
        this.bomb = null;
    }

    isRunning = (): boolean => {
        return this.running;
    };

    setRunning = (newValue: boolean): void => {
        this.running = newValue;
    };

    setup = async (): Promise<void> => {
        InputManager.initialize();
        this.running = Graphics.openWindow();

        // Demo1: Single box
        const floor = new Body();
        floor.set(new Vec2(100, 20), Number.MAX_VALUE);
        floor.position.set(0, -0.8 * floor.width.y);
        this.world.add(floor);

        const box1 = new Body();
        box1.set(new Vec2(1, 1), 200);
        box1.position.set(0, 1);
        this.world.add(box1);

        // Demo 2: A simple pendulum
        // const floor = new Body();
        // floor.set(new Vec2(100, 20), Number.MAX_VALUE);
        // floor.friction = 0.2;
        // floor.position.set(0, -0.8 * floor.width.y);
        // floor.rotation = 0;
        // this.world.add(floor);

        // const box = new Body();
        // box.set(new Vec2(1, 1), 100);
        // box.friction = 0.2;
        // box.position.set(9, 5);
        // box.rotation = 0;
        // this.world.add(box);

        // const j = new Joint();
        // j.set(floor, box, new Vec2(0, 5));
        // this.world.add(j);
    };

    input = (): void => {
        // Handle keyboard events
        while (InputManager.keyboardInputBuffer.length > 0) {
            const inputEvent = InputManager.keyboardInputBuffer.shift();

            if (!inputEvent) {
                return;
            }

            switch (inputEvent.type) {
                case 'keydown':
                    if (inputEvent.code === 'Space') {
                        // Emit bomb
                        if (!this.bomb) {
                            const bomb = new Body();
                            bomb.set(new Vec2(1, 1), 50);
                            bomb.friction = 0.2;
                            this.bomb = bomb;
                            this.bomb.color = 'rgba(102, 230, 102, 1)';
                            this.world.add(bomb);
                        }

                        this.bomb.position.set(Utils.random(-15, 10), 10);
                        this.bomb.rotation = Utils.random(-1.5, 1.5);
                        this.bomb.velocity = Vec2.scale(-1.5, this.bomb.position);
                        this.bomb.angularVelocity = Utils.random(-20, 20);
                    }
                    break;
                case 'keyup':
                    // TODO: do something
                    break;
            }
        }

        // Handle mouse move events
        while (InputManager.mouseMoveBuffer.length > 0) {
            const inputEvent = InputManager.mouseMoveBuffer.shift();

            if (!inputEvent) {
                return;
            }
        }

        // Handle mouse click events
        while (InputManager.mouseInputBuffer.length > 0) {
            const inputEvent = InputManager.mouseInputBuffer.shift();

            if (!inputEvent) {
                return;
            }

            switch (inputEvent.type) {
                case 'mousedown':
                    switch (inputEvent.button) {
                        case MouseButton.LEFT:
                            // TODO: do something
                            break;
                        case MouseButton.RIGHT:
                            // TODO: do something
                            break;
                    }
                    break;
                case 'mouseup':
                    // TODO: do something
                    break;
            }
        }
    };

    update = (deltaTime: number): void => {
        if (this.debug && (!this.lastFPSUpdate || performance.now() - this.lastFPSUpdate > 1000)) {
            this.lastFPSUpdate = performance.now();
            this.FPS = 1 / deltaTime;
        }

        this.world.step(deltaTime);
    };

    render = (): void => {
        Graphics.clearScreen();

        if (this.debug) {
            Graphics.drawText(`FPS: ${this.FPS.toFixed(2)}`, Graphics.width() - 100, 50, 25, 'arial', 'red');
        }

        for (const body of this.world.bodies) {
            Graphics.drawBody(body);
        }

        for (const joint of this.world.joints) {
            Graphics.drawJoint(joint);
        }

        for (const arbiter of this.world.arbiters.values()) {
            for (const contact of arbiter.contacts) {
                Graphics.drawContactPoint(contact, 'red');
            }
        }
    };
}
