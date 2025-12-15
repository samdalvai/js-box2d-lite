import Mat22 from '../math/Mat22';
import Vec2 from '../math/Vec2';
import { Body } from './Body';
import World from './World';

export default class Joint {
    body1: Body;
    body2: Body;

    localAnchor1: Vec2;
    localAnchor2: Vec2;
    r1: Vec2;
    r2: Vec2;

    m00: number;
    m01: number;
    m11: number;

    // bsx: number;
    // bsy: number;
    bias: Vec2;
    P: Vec2; // accumulated impulse

    biasFactor: number;
    softness: number;
    iM: number;

    color: string;
    ctx: CanvasRenderingContext2D;

    constructor(world: World, setup: any, ctx: CanvasRenderingContext2D) {
        this.body1 = setup.b1;
        this.body2 = setup.b2;

        let c, s, x, y;

        c = this.body1.cos;
        s = this.body1.sin;
        x = setup.ax - this.body1.position.x;
        y = setup.ay - this.body1.position.y;
        this.localAnchor1 = new Vec2(c * x + s * y, -s * x + c * y);

        c = this.body2.cos;
        s = this.body2.sin;
        x = setup.ax - this.body2.position.x;
        y = setup.ay - this.body2.position.y;
        this.localAnchor2 = new Vec2(c * x + s * y, -s * x + c * y);

        this.m00 = 0.0;
        this.m01 = 0.0;
        this.m11 = 0.0;

        this.r1 = new Vec2();
        this.r2 = new Vec2();
        this.bias = new Vec2();
        this.P = new Vec2();
        const bias = setup.biasFactor ? setup.biasFactor : world.biasFactor;
        this.biasFactor = -bias * world.invDT;
        this.softness = setup.softness || 0.0;
        this.iM = this.body1.invMass + this.body2.invMass + this.softness;
        this.color = setup.color || '#888';
        this.ctx = ctx;
    }

    preStep() {
        // Pre-compute anchors, mass matrix, and bias.
        const Rot1 = new Mat22(this.body1.rotation);
        const Rot2 = new Mat22(this.body2.rotation);

        this.r1 = Mat22.multiply(Rot1, this.localAnchor1);
        this.r2 = Mat22.multiply(Rot2, this.localAnchor2);

        const Km00 = this.iM + this.body1.invI * this.r1.y * this.r1.y + this.body2.invI * this.r2.y * this.r2.y;
        const Km01 = -this.body1.invI * this.r1.x * this.r1.y + -this.body2.invI * this.r2.x * this.r2.y;
        const Km11 = this.iM + this.body1.invI * this.r1.x * this.r1.x + this.body2.invI * this.r2.x * this.r2.x;

        const det = 1.0 / (Km00 * Km11 - Km01 * Km01);

        this.m00 = det * Km11;
        this.m01 = -det * Km01;
        this.m11 = det * Km00;

        this.bias.x = (this.body2.position.x + this.r2.x - (this.body1.position.x + this.r1.x)) * this.biasFactor;
        this.bias.y = (this.body2.position.y + this.r2.y - (this.body1.position.y + this.r1.y)) * this.biasFactor;

        // Apply accumulated impulse.
        this.body1.velocity.sub(Vec2.scale(this.body1.invMass, this.P));
        this.body1.angularVelocity -= this.body1.invI * Vec2.cross(this.r1, this.P);

        this.body2.velocity.add(Vec2.scale(this.body2.invMass, this.P));
        this.body2.angularVelocity += this.body2.invI * Vec2.cross(this.r2, this.P);
    }

    applyImpulse() {
        const bx =
            this.bias.x -
            (this.body2.velocity.x +
                -this.body2.angularVelocity * this.r2.y -
                this.body1.velocity.x -
                -this.body1.angularVelocity * this.r1.y) -
            this.P.x * this.softness;
        const by =
            this.bias.y -
            (this.body2.velocity.y +
                this.body2.angularVelocity * this.r2.x -
                this.body1.velocity.y -
                this.body1.angularVelocity * this.r1.x) -
            this.P.y * this.softness;

        const ix = this.m00 * bx + this.m01 * by;
        const iy = this.m01 * bx + this.m11 * by;

        this.body1.velocity.x -= ix * this.body1.invMass;
        this.body1.velocity.y -= iy * this.body1.invMass;
        this.body1.angularVelocity -= this.body1.invI * (this.r1.x * iy - this.r1.y * ix);

        this.body2.velocity.x += ix * this.body2.invMass;
        this.body2.velocity.y += iy * this.body2.invMass;
        this.body2.angularVelocity += this.body2.invI * (this.r2.x * iy - this.r2.y * ix);

        this.P.x += ix;
        this.P.y += iy;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.setLineDash([2, 2]);
        this.ctx.moveTo(this.body1.position.x, this.body1.position.y);
        this.ctx.lineTo(this.body1.position.x + this.r1.x, this.body1.position.y + this.r1.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}
