export default class Contact {
    constructor(world, ctx) {
        this.bA = null;
        this.bB = null;

        this.px = 0.0;
        this.py = 0.0;
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
        this.min = Math.min;
        this.max = Math.max;
        this.abs = Math.abs;
        this.ctx = ctx;
    }

    update(bA, bB, separation, nx, ny, friction, px, py) {
        this.bA = bA;
        this.bB = bB;
        this.separation = separation;
        this.nx = nx;
        this.ny = ny;
        this.Pn = 0.0;
        this.Pt = 0.0;
        this.friction = friction;

        // slide contact point onto reference face (easy to cull)
        this.px = px;
        this.py = py;

        this.r1x = this.px - this.bA.px;
        this.r1y = this.py - this.bA.py;
        this.r2x = this.px - this.bB.px;
        this.r2y = this.py - this.bB.py;

        // Precompute normal mass, tangent mass, and bias.
        let rn1 = this.r1x * this.nx + this.r1y * this.ny;
        let rn2 = this.r2x * this.nx + this.r2y * this.ny;
        this.massNormal =
            1.0 /
            (this.bA.iM +
                this.bB.iM +
                this.bA.iI * (this.r1x * this.r1x + this.r1y * this.r1y - rn1 * rn1) +
                this.bB.iI * (this.r2x * this.r2x + this.r2y * this.r2y - rn2 * rn2));
        let rt1 = this.r1x * this.ny - this.r1y * this.nx;
        let rt2 = this.r2x * this.ny - this.r2y * this.nx;
        this.massTangent =
            1.0 /
            (this.bA.iM +
                this.bB.iM +
                this.bA.iI * (this.r1x * this.r1x + this.r1y * this.r1y - rt1 * rt1) +
                this.bB.iI * (this.r2x * this.r2x + this.r2y * this.r2y - rt2 * rt2));
        this.bias = this.biasFactor * this.min(0.0, this.separation + this.allowedPenetration);
    }

    relativeVelocity() {
        this.rvx = this.bB.vx + -this.bB.va * this.r2y - this.bA.vx - -this.bA.va * this.r1y;
        this.rvy = this.bB.vy + this.bB.va * this.r2x - this.bA.vy - this.bA.va * this.r1x;
    }

    impulse(px, py) {
        this.bA.vx -= this.bA.iM * px;
        this.bA.vy -= this.bA.iM * py;
        this.bA.va -= this.bA.iI * (this.r1x * py - this.r1y * px);
        this.bB.vx += this.bB.iM * px;
        this.bB.vy += this.bB.iM * py;
        this.bB.va += this.bB.iI * (this.r2x * py - this.r2y * px);
    }

    applyImpulse() {
        let dPn, Pn0, maxPt;
        // Relative velocity at contact
        this.relativeVelocity();
        // Compute normal impulse
        dPn = this.massNormal * (-(this.rvx * this.nx + this.rvy * this.ny) + this.bias);
        // Clamp the accumulated impulse
        Pn0 = this.Pn;
        this.Pn = this.max(Pn0 + dPn, 0.0);
        dPn = this.Pn - Pn0;
        // Apply contact impulse
        this.impulse(this.nx * dPn, this.ny * dPn);
        // Relative velocity at contact
        this.relativeVelocity();
        dPn = -this.massTangent * (this.rvx * this.ny - this.rvy * this.nx);
        // Compute friction impulse
        maxPt = this.friction * this.Pn;
        // Clamp friction
        Pn0 = this.Pt;
        this.Pt = this.max(-maxPt, this.min(Pn0 + dPn, maxPt));
        dPn = this.Pt - Pn0;
        // Apply contact impulse
        this.impulse(this.ny * dPn, -this.nx * dPn);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.px, this.py, 1.5, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#F00';
        this.ctx.fill();
    }
}
