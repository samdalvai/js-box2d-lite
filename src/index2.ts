import Application from './Application';

const run = async () => {
    const app = new Application();
    await app.setup();

    console.log('Setup finished, starting loop');

    let timePreviousFrame = performance.now();

    document.addEventListener('visibilitychange', () => {
        app.setRunning(!document.hidden);
        if (!document.hidden) {
            // Reset previous frame time to avoid a huge deltaTime spike
            timePreviousFrame = performance.now();
        }
    });

    const loop = (now: number) => {
        const deltaTime = (now - timePreviousFrame) / 1000;
        timePreviousFrame = now;

        if (app.isRunning()) {
            app.input();
            app.update(deltaTime);
            app.render();
        }

        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
};

run();
