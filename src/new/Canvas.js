export default class Canvas {
    constructor(resx, resy) {
        this.elem = document.createElement('canvas');
        this.resx = resx;
        this.resy = resy;
        this.left = 0;
        this.top = 0;

        this.ctx = this.elem.getContext('2d');
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
        for (this.left = 0, this.top = 0; o != null; o = o.offsetParent) {
            this.left += o.offsetLeft;
            this.top += o.offsetTop;
        }
    }
}