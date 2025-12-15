import Utils from '../math/Utils';
import Vec2 from '../math/Vec2';
import { Body } from './Body';
import World from './World';

export default class Contact {
    position: Vec2;
    normal: Vec2;
    r1: Vec2;
    r2: Vec2;
    separation: number;
    Pn: number; // accumulated normal impulse
    Pt: number; // accumulated tangent impulse
    massNormal: number;
    massTangent: number;
    bias: number;

    body1: Body | null;
    body2: Body | null;

    rv: Vec2;

    friction: number;
    allowedPenetration: number;
    biasFactor: number;
    ctx: CanvasRenderingContext2D;

    constructor(world: World, ctx: CanvasRenderingContext2D) {
        this.body1 = null;
        this.body2 = null;

        this.position = new Vec2();
        this.normal = new Vec2();
        this.Pn = 0.0; // accumulated normal impulse
        this.Pt = 0.0; // accumulated tangent impulse

        this.r1 = new Vec2();
        this.r2 = new Vec2();
        this.rv = new Vec2();

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
        this.normal.x = nx;
        this.normal.y = ny;
        this.Pn = 0.0;
        this.Pt = 0.0;
        this.friction = friction;

        // slide contact point onto reference face (easy to cull)
        this.position.x = px;
        this.position.y = py;

        // Relative positions
        this.r1 = Vec2.sub(this.position, this.body1.position);
        this.r2 = Vec2.sub(this.position, this.body2.position);

        // Normal mass computation
        const rn1 = Vec2.dot(this.r1, this.normal);
        const rn2 = Vec2.dot(this.r2, this.normal);
        let kNormal = this.body1.invMass + this.body2.invMass;
        kNormal +=
            this.body1.invI * (Vec2.dot(this.r1, this.r1) - rn1 * rn1) +
            this.body2.invI * (Vec2.dot(this.r2, this.r2) - rn2 * rn2);
        this.massNormal = 1.0 / kNormal;

        // Tangent mass computation
        const tangent = Vec2.cross(this.normal, 1);
        const rt1 = Vec2.dot(this.r1, tangent);
        const rt2 = Vec2.dot(this.r2, tangent);
        let kTangent = this.body1.invMass + this.body2.invMass;
        kTangent +=
            this.body1.invI * (Vec2.dot(this.r1, this.r1) - rt1 * rt1) +
            this.body2.invI * (Vec2.dot(this.r2, this.r2) - rt2 * rt2);
        this.massTangent = 1 / kTangent;

        this.bias = this.biasFactor * Math.min(0.0, this.separation + this.allowedPenetration);
    }

    relativeVelocity() {
        if (!this.body1 || !this.body2) {
            throw new Error('Body(ies) not define in Contact element');
        }


        const vel1 = Vec2.add(this.body1.velocity, Vec2.cross(this.body1.angularVelocity, this.r1));
        const vel2 = Vec2.add(this.body2.velocity, Vec2.cross(this.body2.angularVelocity, this.r2));
        this.rv = Vec2.sub(vel2, vel1);
    }

    impulse(px: number, py: number) {
        if (!this.body1 || !this.body2) {
            throw new Error('Body(ies) not define in Contact element');
        }

        this.body1.velocity.x -= this.body1.invMass * px;
        this.body1.velocity.y -= this.body1.invMass * py;
        this.body1.angularVelocity -= this.body1.invI * (this.r1.x * py - this.r1.y * px);
        this.body2.velocity.x += this.body2.invMass * px;
        this.body2.velocity.y += this.body2.invMass * py;
        this.body2.angularVelocity += this.body2.invI * (this.r2.x * py - this.r2.y * px);
    }

    applyImpulse() {
        let dPn, Pn0;
        // Relative velocity at contact
        this.relativeVelocity();

        // Compute normal impulse
        dPn = this.massNormal * (-(this.rv.x * this.normal.x + this.rv.y * this.normal.y) + this.bias);

        // Clamp the accumulated impulse
        Pn0 = this.Pn;
        this.Pn = Math.max(Pn0 + dPn, 0.0);
        dPn = this.Pn - Pn0;

        // Apply contact impulse
        this.impulse(this.normal.x * dPn, this.normal.y * dPn);

        // Relative velocity at contact
        this.relativeVelocity();
        dPn = -this.massTangent * (this.rv.x * this.normal.y - this.rv.y * this.normal.x);

        // Compute friction impulse
        const maxPt = this.friction * this.Pn;

        // Clamp friction
        Pn0 = this.Pt;
        this.Pt = Utils.clamp(Pn0 + dPn, -maxPt, maxPt);
        dPn = this.Pt - Pn0;

        // Apply contact impulse
        this.impulse(this.normal.y * dPn, -this.normal.x * dPn);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#F00';
        this.ctx.fill();
    }
}
