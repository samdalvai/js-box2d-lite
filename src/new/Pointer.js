export default class Pointer {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;
        this.canvas = canvas;

        window.addEventListener('mousemove', e => this.move(e), false);
        canvas.elem.addEventListener('touchmove', e => this.move(e), false);
    }

    move(e) {
        let touchMode = e.targetTouches,
            pointer;
        if (touchMode) {
            e.preventDefault();
            pointer = touchMode[0];
        } else pointer = e;
        this.x = ((-this.canvas.left + pointer.clientX) * this.canvas.resx) / this.canvas.elem.offsetWidth;
        this.y = ((-this.canvas.top + pointer.clientY) * this.canvas.resy) / this.canvas.elem.offsetHeight;
    }
}
