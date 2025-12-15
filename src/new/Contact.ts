import Vec2 from '../math/Vec2';
import { Body } from './Body';
import World from './World';

export default class Contact {
    body1: Body | null;
    body2: Body | null;

    position: Vec2;
    nx: number;
    ny: number;
    Pn: number; // accumulated normal impulse
    Pt: number; // accumulated tangent impulse

    r1x: number;
    r1y: number;
    r2x: number;
    r2y: number;
    rvx: number;
    rvy: number;

    separation: number;
    massNormal: number;
    massTangent: number;
    bias: number;
    friction: number;
    allowedPenetration;
    biasFactor;
    ctx: CanvasRenderingContext2D;

    constructor(world: World, ctx: CanvasRenderingContext2D) {
        this.body1 = null;
        this.body2 = null;

        // this.px = 0.0;
        // this.py = 0.0;
        this.position = new Vec2();
        this.nx = 0.0;
        this.ny = 0.0;
        this.Pn = 0.0; // accumulated normal impulse
        this.Pt = 0.0; // accumulated tangent impulse

        this.r1x = 0.0;
        this.r1y = 0.0;
        this.r2x = 0.0;
        this.r2y = 0.0;
        this.rvx = 0.0;
        this.rvy = 0.0;

        this.separation = 0.0;
        this.massNormal = 0.0;
        this.massTangent = 0.0;
        this.bias = 0.0;
        this.friction = 0.0;
        this.allowedPenetration = world.allowedPenetration;
        this.biasFactor = -world.biasFactor * world.invDT;
        this.ctx = ctx;
    }

    update(bA: Body, bB: Body, separation: number, nx: number, ny: number, friction: number, px: number, py: number) {
        this.body1 = bA;
        this.body2 = bB;
        this.separation = separation;
        this.nx = nx;
        this.ny = ny;
        this.Pn = 0.0;
        this.Pt = 0.0;
        this.friction = friction;

        // slide contact point onto reference face (easy to cull)
        this.position.x = px;
        this.position.y = py;

        this.r1x = this.position.x - this.body1.position.x;
        this.r1y = this.position.y - this.body1.position.y;
        this.r2x = this.position.x - this.body2.position.x;
        this.r2y = this.position.y - this.body2.position.y;

        // Precompute normal mass, tangent mass, and bias.
        const rn1 = this.r1x * this.nx + this.r1y * this.ny;
        const rn2 = this.r2x * this.nx + this.r2y * this.ny;
        this.massNormal =
            1.0 /
            (this.body1.invMass +
                this.body2.invMass +
                this.body1.invI * (this.r1x * this.r1x + this.r1y * this.r1y - rn1 * rn1) +
                this.body2.invI * (this.r2x * this.r2x + this.r2y * this.r2y - rn2 * rn2));
        const rt1 = this.r1x * this.ny - this.r1y * this.nx;
        const rt2 = this.r2x * this.ny - this.r2y * this.nx;
        this.massTangent =
            1.0 /
            (this.body1.invMass +
                this.body2.invMass +
                this.body1.invI * (this.r1x * this.r1x + this.r1y * this.r1y - rt1 * rt1) +
                this.body2.invI * (this.r2x * this.r2x + this.r2y * this.r2y - rt2 * rt2));
        this.bias = this.biasFactor * Math.min(0.0, this.separation + this.allowedPenetration);
    }

    relativeVelocity() {
        if (!this.body1 || !this.body2) {
            throw new Error('Body(ies) not define in Contact element');
        }

        this.rvx =
            this.body2.velocity.x +
            -this.body2.angularVelocity * this.r2y -
            this.body1.velocity.x -
            -this.body1.angularVelocity * this.r1y;
        this.rvy =
            this.body2.velocity.y +
            this.body2.angularVelocity * this.r2x -
            this.body1.velocity.y -
            this.body1.angularVelocity * this.r1x;
    }

    impulse(px: number, py: number) {
        if (!this.body1 || !this.body2) {
            throw new Error('Body(ies) not define in Contact element');
        }

        this.body1.velocity.x -= this.body1.invMass * px;
        this.body1.velocity.y -= this.body1.invMass * py;
        this.body1.angularVelocity -= this.body1.invI * (this.r1x * py - this.r1y * px);
        this.body2.velocity.x += this.body2.invMass * px;
        this.body2.velocity.y += this.body2.invMass * py;
        this.body2.angularVelocity += this.body2.invI * (this.r2x * py - this.r2y * px);
    }

    applyImpulse() {
        let dPn, Pn0;
        // Relative velocity at contact
        this.relativeVelocity();
        // Compute normal impulse
        dPn = this.massNormal * (-(this.rvx * this.nx + this.rvy * this.ny) + this.bias);
        // Clamp the accumulated impulse
        Pn0 = this.Pn;
        this.Pn = Math.max(Pn0 + dPn, 0.0);
        dPn = this.Pn - Pn0;
        // Apply contact impulse
        this.impulse(this.nx * dPn, this.ny * dPn);
        // Relative velocity at contact
        this.relativeVelocity();
        dPn = -this.massTangent * (this.rvx * this.ny - this.rvy * this.nx);
        // Compute friction impulse
        const maxPt = this.friction * this.Pn;
        // Clamp friction
        Pn0 = this.Pt;
        this.Pt = Math.max(-maxPt, Math.min(Pn0 + dPn, maxPt));
        dPn = this.Pt - Pn0;
        // Apply contact impulse
        this.impulse(this.ny * dPn, -this.nx * dPn);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#F00';
        this.ctx.fill();
    }
}
