export default class Joint {
    constructor(world, setup, ctx) {
        this.bA = setup.b1;
        this.bB = setup.b2;

        let c, s, x, y;

        c = this.bA.cos;
        s = this.bA.sin;
        x = setup.ax - this.bA.px;
        y = setup.ay - this.bA.py;
        this.a1x = c * x + s * y;
        this.a1y = -s * x + c * y;

        c = this.bB.cos;
        s = this.bB.sin;
        x = setup.ax - this.bB.px;
        y = setup.ay - this.bB.py;
        this.a2x = c * x + s * y;
        this.a2y = -s * x + c * y;

        this.m00 = 0.0;
        this.m01 = 0.0;
        this.m11 = 0.0;
        this.r1x = 0.0;
        this.r1y = 0.0;
        this.r2x = 0.0;
        this.r2y = 0.0;
        this.bsx = 0.0;
        this.bsy = 0.0;
        this.aix = 0.0; // accumulated impulse
        this.aiy = 0.0;
        let bias = setup.biasFactor ? setup.biasFactor : world.biasFactor;
        this.biasFactor = -bias * world.invDT;
        this.softness = setup.softness || 0.0;
        this.iM = this.bA.iM + this.bB.iM + this.softness;
        this.color = setup.color || '#888';
        this.ctx = ctx;
    }

    preStep() {
        // Pre-compute anchors, mass matrix, and bias.
        this.r1x = this.bA.cos * this.a1x - this.bA.sin * this.a1y;
        this.r1y = this.bA.sin * this.a1x + this.bA.cos * this.a1y;
        this.r2x = this.bB.cos * this.a2x - this.bB.sin * this.a2y;
        this.r2y = this.bB.sin * this.a2x + this.bB.cos * this.a2y;

        let Km00 = this.iM + this.bA.iI * this.r1y * this.r1y + this.bB.iI * this.r2y * this.r2y;
        let Km01 = -this.bA.iI * this.r1x * this.r1y + -this.bB.iI * this.r2x * this.r2y;
        let Km11 = this.iM + this.bA.iI * this.r1x * this.r1x + this.bB.iI * this.r2x * this.r2x;

        let det = 1.0 / (Km00 * Km11 - Km01 * Km01);

        this.m00 = det * Km11;
        this.m01 = -det * Km01;
        this.m11 = det * Km00;

        this.bsx = (this.bB.px + this.r2x - (this.bA.px + this.r1x)) * this.biasFactor;
        this.bsy = (this.bB.py + this.r2y - (this.bA.py + this.r1y)) * this.biasFactor;

        // Apply accumulated impulse.
        this.bA.vx -= this.aix * this.bA.iM;
        this.bA.vy -= this.aiy * this.bA.iM;
        this.bA.va -= this.bA.iI * (this.r1x * this.aiy - this.r1y * this.aix);

        this.bB.vx += this.aix * this.bB.iM;
        this.bB.vy += this.aiy * this.bB.iM;
        this.bB.va += this.bB.iI * (this.r2x * this.aiy - this.r2y * this.aix);
    }

    applyImpulse() {
        let bx =
            this.bsx -
            (this.bB.vx + -this.bB.va * this.r2y - this.bA.vx - -this.bA.va * this.r1y) -
            this.aix * this.softness;
        let by =
            this.bsy -
            (this.bB.vy + this.bB.va * this.r2x - this.bA.vy - this.bA.va * this.r1x) -
            this.aiy * this.softness;

        let ix = this.m00 * bx + this.m01 * by;
        let iy = this.m01 * bx + this.m11 * by;

        this.bA.vx -= ix * this.bA.iM;
        this.bA.vy -= iy * this.bA.iM;
        this.bA.va -= this.bA.iI * (this.r1x * iy - this.r1y * ix);

        this.bB.vx += ix * this.bB.iM;
        this.bB.vy += iy * this.bB.iM;
        this.bB.va += this.bB.iI * (this.r2x * iy - this.r2y * ix);

        this.aix += ix;
        this.aiy += iy;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.setLineDash([2, 2]);
        this.ctx.moveTo(this.bA.px, this.bA.py);
        this.ctx.lineTo(this.bA.px + this.r1x, this.bA.py + this.r1y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}
