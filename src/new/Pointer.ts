import Canvas from './Canvas';

export default class Pointer {
    public x: number = 0;
    public y: number = 0;
    private canvas: Canvas;

    constructor(canvas: Canvas) {
        this.canvas = canvas;

        window.addEventListener('mousemove', this.move, false);
        this.canvas.elem.addEventListener('touchmove', this.move, false);
    }

    private move = (e: MouseEvent | TouchEvent): void => {
        let clientX: number;
        let clientY: number;

        if (e instanceof TouchEvent) {
            e.preventDefault();
            const touch = e.targetTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        this.x = ((-this.canvas.left + clientX) * this.canvas.resx) / this.canvas.elem.offsetWidth;

        this.y = ((-this.canvas.top + clientY) * this.canvas.resy) / this.canvas.elem.offsetHeight;
    };
}
