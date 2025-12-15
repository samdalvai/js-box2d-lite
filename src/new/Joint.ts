import { Body } from './Body';
import World from './World';

export default class Joint {
    bA: Body;
    bB: Body;

    a1x: number;
    a1y: number;

    a2x: number;
    a2y: number;

    m00: number;
    m01: number;
    m11: number;
    r1x: number;
    r1y: number;
    r2x: number;
    r2y: number;
    bsx: number;
    bsy: number;
    aix: number;
    aiy: number;
    biasFactor: number;
    softness: number;
    iM: number;
    color: string;
    ctx: CanvasRenderingContext2D;

    constructor(world: World, setup: any, ctx: CanvasRenderingContext2D) {
        this.bA = setup.b1;
        this.bB = setup.b2;

        let c, s, x, y;

        c = this.bA.cos;
        s = this.bA.sin;
        x = setup.ax - this.bA.position.x;
        y = setup.ay - this.bA.position.y;
        this.a1x = c * x + s * y;
        this.a1y = -s * x + c * y;

        c = this.bB.cos;
        s = this.bB.sin;
        x = setup.ax - this.bB.position.x;
        y = setup.ay - this.bB.position.y;
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
        const bias = setup.biasFactor ? setup.biasFactor : world.biasFactor;
        this.biasFactor = -bias * world.invDT;
        this.softness = setup.softness || 0.0;
        this.iM = this.bA.invMass + this.bB.invMass + this.softness;
        this.color = setup.color || '#888';
        this.ctx = ctx;
    }

    preStep() {
        // Pre-compute anchors, mass matrix, and bias.
        this.r1x = this.bA.cos * this.a1x - this.bA.sin * this.a1y;
        this.r1y = this.bA.sin * this.a1x + this.bA.cos * this.a1y;
        this.r2x = this.bB.cos * this.a2x - this.bB.sin * this.a2y;
        this.r2y = this.bB.sin * this.a2x + this.bB.cos * this.a2y;

        const Km00 = this.iM + this.bA.invI * this.r1y * this.r1y + this.bB.invI * this.r2y * this.r2y;
        const Km01 = -this.bA.invI * this.r1x * this.r1y + -this.bB.invI * this.r2x * this.r2y;
        const Km11 = this.iM + this.bA.invI * this.r1x * this.r1x + this.bB.invI * this.r2x * this.r2x;

        const det = 1.0 / (Km00 * Km11 - Km01 * Km01);

        this.m00 = det * Km11;
        this.m01 = -det * Km01;
        this.m11 = det * Km00;

        this.bsx = (this.bB.position.x + this.r2x - (this.bA.position.x + this.r1x)) * this.biasFactor;
        this.bsy = (this.bB.position.y + this.r2y - (this.bA.position.y + this.r1y)) * this.biasFactor;

        // Apply accumulated impulse.
        this.bA.velocity.x -= this.aix * this.bA.invMass;
        this.bA.velocity.y -= this.aiy * this.bA.invMass;
        this.bA.angularVelocity -= this.bA.invI * (this.r1x * this.aiy - this.r1y * this.aix);

        this.bB.velocity.x += this.aix * this.bB.invMass;
        this.bB.velocity.y += this.aiy * this.bB.invMass;
        this.bB.angularVelocity += this.bB.invI * (this.r2x * this.aiy - this.r2y * this.aix);
    }

    applyImpulse() {
        const bx =
            this.bsx -
            (this.bB.velocity.x + -this.bB.angularVelocity * this.r2y - this.bA.velocity.x - -this.bA.angularVelocity * this.r1y) -
            this.aix * this.softness;
        const by =
            this.bsy -
            (this.bB.velocity.y + this.bB.angularVelocity * this.r2x - this.bA.velocity.y - this.bA.angularVelocity * this.r1x) -
            this.aiy * this.softness;

        const ix = this.m00 * bx + this.m01 * by;
        const iy = this.m01 * bx + this.m11 * by;

        this.bA.velocity.x -= ix * this.bA.invMass;
        this.bA.velocity.y -= iy * this.bA.invMass;
        this.bA.angularVelocity -= this.bA.invI * (this.r1x * iy - this.r1y * ix);

        this.bB.velocity.x += ix * this.bB.invMass;
        this.bB.velocity.y += iy * this.bB.invMass;
        this.bB.angularVelocity += this.bB.invI * (this.r2x * iy - this.r2y * ix);

        this.aix += ix;
        this.aiy += iy;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.setLineDash([2, 2]);
        this.ctx.moveTo(this.bA.position.x, this.bA.position.y);
        this.ctx.lineTo(this.bA.position.x + this.r1x, this.bA.position.y + this.r1y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}
