import Mat22 from '../math/Mat22';
import Vec2 from '../math/Vec2';
import Body from './Body';
import World from './World';

export default class Joint {
    M: Mat22;
    localAnchor1: Vec2;
    localAnchor2: Vec2;
    r1: Vec2;
    r2: Vec2;
    bias: Vec2;
    P: Vec2; // accumulated impulse
    body1: Body | null;
    body2: Body | null;
    biasFactor: number;
    softness: number;

    constructor() {
        this.M = new Mat22();
        this.localAnchor1 = new Vec2();
        this.localAnchor2 = new Vec2();
        this.r1 = new Vec2();
        this.r2 = new Vec2();
        this.bias = new Vec2();

        this.body1 = null;
        this.body2 = null;

        this.biasFactor = 0.2;
        this.softness = 0;

        this.P = new Vec2();
    }

    set = (b1: Body, b2: Body, anchor: Vec2): void => {
        this.body1 = b1;
        this.body2 = b2;

        const Rot1 = new Mat22(this.body1.rotation);
        const Rot2 = new Mat22(this.body2.rotation);
        const Rot1T = Rot1.transpose();
        const Rot2T = Rot2.transpose();

        this.localAnchor1 = Mat22.multiply(Rot1T, Vec2.sub(anchor, this.body1.position));
        this.localAnchor2 = Mat22.multiply(Rot2T, Vec2.sub(anchor, this.body2.position));

        this.P.set(0, 0);

        this.softness = 0;
        this.biasFactor = 0.2;
    };

    preStep = (invDt: number): void => {
        if (!this.body1 || !this.body2) {
            throw new Error('One or more bodies not initialized in Joint');
        }

        // Pre-compute anchors, mass matrix, and bias.
        const Rot1 = new Mat22(this.body1.rotation);
        const Rot2 = new Mat22(this.body2.rotation);

        this.r1 = Mat22.multiply(Rot1, this.localAnchor1);
        this.r2 = Mat22.multiply(Rot2, this.localAnchor2);

        // deltaV = deltaV0 + K * impulse
        // invM = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
        //      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
        //        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
        const K1 = new Mat22();
        K1.col1.x = this.body1.invMass + this.body2.invMass;
        K1.col1.y = 0.0;
        K1.col2.x = 0.0;
        K1.col2.y = this.body1.invMass + this.body2.invMass;

        const K2 = new Mat22();
        K2.col1.x = this.body1.invI * this.r1.y * this.r1.y;
        K2.col1.y = -this.body1.invI * this.r1.x * this.r1.y;
        K2.col2.x = -this.body1.invI * this.r1.x * this.r1.y;
        K2.col2.y = this.body1.invI * this.r1.x * this.r1.x;

        const K3 = new Mat22();
        K3.col1.x = this.body2.invI * this.r2.y * this.r2.y;
        K3.col1.y = -this.body2.invI * this.r2.x * this.r2.y;
        K3.col2.x = -this.body2.invI * this.r2.x * this.r2.y;
        K3.col2.y = this.body2.invI * this.r2.x * this.r2.x;

        const K = Mat22.add(Mat22.add(K1, K2), K3);
        K.col1.x += this.softness;
        K.col2.y += this.softness;

        this.M = K.invert();

        const p1 = Vec2.add(this.body1.position, this.r1);
        const p2 = Vec2.add(this.body2.position, this.r2);
        const dp = Vec2.sub(p2, p1);

        if (World.positionCorrection) {
            this.bias = Vec2.scale(-this.biasFactor * invDt, dp);
        } else {
            this.bias.set(0.0, 0.0);
        }

        if (World.warmStarting) {
            // Apply accumulated impulse.
            this.body1.velocity.sub(Vec2.scale(this.body1.invMass, this.P));
            this.body1.angularVelocity -= this.body1.invI * Vec2.cross(this.r1, this.P);

            this.body2.velocity.add(Vec2.scale(this.body2.invMass, this.P));
            this.body2.angularVelocity += this.body2.invI * Vec2.cross(this.r2, this.P);
        } else {
            this.P.set(0.0, 0.0);
        }
    };

    applyImpulse = (): void => {
        if (!this.body1 || !this.body2) {
            throw new Error('One or more bodies not initialized in Joint');
        }

        // Linear velocity of the center of mass of body 1 and 2.
        // const lv1 = Vec2.sub(this.body1.velocity, Vec2.cross(this.body1.angularVelocity, this.r1));
        // const lv2 = Vec2.add(this.body2.velocity, Vec2.cross(this.body2.angularVelocity, this.r2));

        // // Relative velocity at contact
        // const dv = Vec2.sub(lv2, lv1);

        // const impulse = Mat22.multiply(this.M, Vec2.sub(Vec2.sub(this.bias, dv), Vec2.scale(this.softness, this.P)));

        // this.body1.velocity.sub(Vec2.scale(this.body1.invMass, impulse));
        // this.body1.angularVelocity -= this.body1.invI * Vec2.cross(this.r1, impulse);

        // this.body2.velocity.add(Vec2.scale(this.body2.invMass, impulse));
        // this.body2.angularVelocity += this.body2.invI * Vec2.cross(this.r2, impulse);

        // this.P.add(impulse);
        const bx =
            this.bsx -
            (this.body2.velocity.x +
                -this.body2.angularVelocity * this.r2.y -
                this.body1.velocity.x -
                -this.body1.angularVelocity * this.r1.y) -
            this.P.x * this.softness;
        const by =
            this.bsy -
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
    };
}
