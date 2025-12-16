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

    M: Mat22;

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

        // this.m00 = 0.0;
        // this.m01 = 0.0;
        // this.m11 = 0.0;
        this.M = new Mat22();

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

        this.M.col1.x = det * Km11; // m00
        this.M.col1.y = -det * Km01; // m10, explicit symmetry with m01
        this.M.col2.x = -det * Km01; // m01
        this.M.col2.y = det * Km00; // m11

        this.bias.x = (this.body2.position.x + this.r2.x - (this.body1.position.x + this.r1.x)) * this.biasFactor;
        this.bias.y = (this.body2.position.y + this.r2.y - (this.body1.position.y + this.r1.y)) * this.biasFactor;

        // Apply accumulated impulse.
        this.body1.velocity.sub(Vec2.scale(this.body1.invMass, this.P));
        this.body1.angularVelocity -= this.body1.invI * Vec2.cross(this.r1, this.P);

        this.body2.velocity.add(Vec2.scale(this.body2.invMass, this.P));
        this.body2.angularVelocity += this.body2.invI * Vec2.cross(this.r2, this.P);
    }

    applyImpulse() {
        const vel1 = Vec2.add(this.body1.velocity, Vec2.cross(this.body1.angularVelocity, this.r1));
        const vel2 = Vec2.add(this.body2.velocity, Vec2.cross(this.body2.angularVelocity, this.r2));
        const rv = Vec2.sub(vel2, vel1);

        // b = bias - vRel - P * softness
        const b = Vec2.sub(Vec2.sub(this.bias, rv), Vec2.scale(this.P, this.softness));

        const ix = this.M.col1.x * b.x + this.M.col2.x * b.y;
        const iy = this.M.col1.y * b.x + this.M.col2.y * b.y;

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
