import Graphics from './Graphics';
import InputManager, { MouseButton } from './InputManager';
import Vec2 from './math/Vec2';
import Body from './physics/Body';
import World from './physics/World';

export default class Application {
    private running = false;

    // Debug related properties
    private debug = true;
    private FPS = 0;
    private lastFPSUpdate = 0;

    // TODO: the original simulation uses real Y coordinates, so gravity is negative
    // private world: World = new World(new Vec2(0, -9.8), 10);
    private world: World = new World(new Vec2(0, 9.8), 10);

    constructor() {}

    isRunning = (): boolean => {
        return this.running;
    };

    setRunning = (newValue: boolean): void => {
        this.running = newValue;
    };

    setup = async (): Promise<void> => {
        InputManager.initialize();
        this.running = Graphics.openWindow();

        const floor = new Body();
        floor.set(new Vec2(Graphics.width() + 100, 200), Number.MAX_VALUE);
        floor.position.set(Graphics.width() / 2, Graphics.height() - 50);
        this.world.add(floor);

        const box = new Body();
        box.set(new Vec2(60, 60), 200);
        box.position.set(Graphics.width() / 2, Graphics.height() - 400);
        this.world.add(box);
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
                    // TODO: do something
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

            // TODO: do something
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

            // Graphics.drawRect(body.position.x, body.position.y, body.width.x, body.width.y, 'white');
        }
    };
}
