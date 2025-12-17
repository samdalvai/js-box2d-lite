export default class Canvas {
    elem: HTMLCanvasElement;
    resx: number;
    resy: number;
    left: number;
    top: number;

    ctx: CanvasRenderingContext2D;

    width: number;
    height: number;

    constructor(resx: number, resy: number) {
        this.elem = document.createElement('canvas');
        this.resx = resx;
        this.resy = resy;
        this.left = 0;
        this.top = 0;
        this.width = 0;
        this.height = 0;

        if (!this.elem) {
            throw new Error('Could not initialize canvas element');
        }

        const ctx = this.elem.getContext('2d');

        if (!ctx) {
            throw new Error('Could not initialize context element');
        }

        this.ctx = ctx;
        document.body.appendChild(this.elem);
        this.resize();
        window.addEventListener('resize', () => this.resize(), false);

        if (!this.ctx.setLineDash) {
            this.ctx.setLineDash = function () {};
        }
    }

    resize() {
        let o = this.elem;
        this.width = this.elem.width = this.resx;
        this.height = this.elem.height = this.resy;
        for (this.left = 0, this.top = 0; o != null; o = o.offsetParent as HTMLCanvasElement) {
            this.left += o.offsetLeft;
            this.top += o.offsetTop;
        }
    }
}
