import Graphics from './Graphics';
import InputManager, { MouseButton } from './InputManager';
import Utils from './math/Utils';
import Vec2 from './math/Vec2';
import Body from './physics/Body';
import World from './physics/World';
import Demo from './samples/Demo';

export default class Application {
    private running = false;

    // Debug related properties
    private debug = true;
    private FPS = 0;
    private lastFPSUpdate = 0;

    private world: World;
    private bomb: Body | null;
    private demoIndex: number;

    constructor() {
        const gravity = new Vec2(0, -10);
        const iterations = 10;

        this.world = new World(gravity, iterations);
        this.bomb = null;
        this.demoIndex = 0;
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

        Demo.demo1(this.world);
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
                    if (inputEvent.code === 'KeyA') {
                        World.accumulateImpulses = !World.accumulateImpulses;
                    }

                    if (inputEvent.code === 'KeyP') {
                        World.positionCorrection = !World.positionCorrection;
                    }

                    if (inputEvent.code === 'KeyW') {
                        World.warmStarting = !World.warmStarting;
                    }

                    if (inputEvent.code === 'KeyD') {
                        World.debugContacts = !World.debugContacts;
                    }

                    if (inputEvent.code === 'Digit1') {
                        this.demoIndex = 0;
                        this.world.clear();
                        this.bomb = null;
                        Demo.demo1(this.world);
                    }

                    if (inputEvent.code === 'Digit2') {
                        this.demoIndex = 1;
                        this.world.clear();
                        this.bomb = null;
                        Demo.demo2(this.world);
                    }

                    // ...

                    if (inputEvent.code === 'Digit4') {
                        this.demoIndex = 3;
                        this.world.clear();
                        this.bomb = null;
                        Demo.demo4(this.world);
                    }

                    // ....

                    if (inputEvent.code === 'Digit7') {
                        this.demoIndex = 6;
                        this.world.clear();
                        this.bomb = null;
                        Demo.demo7(this.world);
                    }

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
                        this.bomb.velocity = Vec2.scale(-1.75, this.bomb.position);
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
            Graphics.drawText(
                `${Demo.demoStrings[this.demoIndex]} (FPS: ${this.FPS.toFixed(2)})`,
                50,
                50,
                18,
                'arial',
                'orange',
            );
            Graphics.drawText(
                `(A)ccumulation ${World.accumulateImpulses ? 'ON' : 'OFF'}`,
                50,
                75,
                18,
                'arial',
                'orange',
            );

            Graphics.drawText(
                `(P)osition Correction ${World.positionCorrection ? 'ON' : 'OFF'}`,
                50,
                100,
                18,
                'arial',
                'orange',
            );

            Graphics.drawText(`(W)arm Starting ${World.warmStarting ? 'ON' : 'OFF'}`, 50, 125, 18, 'arial', 'orange');

            Graphics.drawText(
                `(D)raw contact points ${World.debugContacts ? 'ON' : 'OFF'}`,
                50,
                150,
                18,
                'arial',
                'orange',
            );
        }

        for (const body of this.world.bodies) {
            Graphics.drawBody(body);
        }

        for (const joint of this.world.joints) {
            Graphics.drawJoint(joint);
        }

        if (World.debugContacts) {
            for (const arbiter of this.world.arbiters.values()) {
                for (const contact of arbiter.contacts) {
                    Graphics.drawContactPoint(contact, 'red');
                }
            }
        }
    };
}
