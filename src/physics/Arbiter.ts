import Utils from '../math/Utils';
import Vec2 from '../math/Vec2';
import Body from './Body';
import { Collide } from './Collide';
import World from './World';

export class Edges {
    inEdge1: number;
    outEdge1: number;
    inEdge2: number;
    outEdge2: number;

    constructor() {
        this.inEdge1 = 0;
        this.outEdge1 = 0;
        this.inEdge2 = 0;
        this.outEdge2 = 0;
    }
}

export class FeaturePair {
    e: Edges;
    value: number;

    constructor(value = 0) {
        this.e = new Edges();
        this.value = value;
    }

    clone = (): FeaturePair => {
        const copy = new FeaturePair();

        copy.e.inEdge1 = this.e.inEdge1;
        copy.e.outEdge1 = this.e.outEdge1;
        copy.e.inEdge2 = this.e.inEdge2;
        copy.e.outEdge2 = this.e.outEdge2;
        copy.value = this.value;

        return copy;
    };

    flip = (): void => {
        // Swap inEdge1 <-> inEdge2
        [this.e.inEdge1, this.e.inEdge2] = [this.e.inEdge2, this.e.inEdge1];

        // Swap outEdge1 <-> outEdge2
        [this.e.outEdge1, this.e.outEdge2] = [this.e.outEdge2, this.e.outEdge1];
    };
}

export class Contact {
    position: Vec2;
    normal: Vec2;
    r1: Vec2;
    r2: Vec2;
    separation: number;
    Pn: number; // accumulated normal impulse
    Pt: number; // accumulated tangent impulse
    Pnb: number; // accumulated normal impulse for position bias
    massNormal: number;
    massTangent: number;
    bias: number;
    feature: FeaturePair;

    constructor() {
        this.position = new Vec2();
        this.normal = new Vec2();
        this.r1 = new Vec2();
        this.r2 = new Vec2();
        this.separation = 0;

        this.Pn = 0;
        this.Pt = 0;
        this.Pnb = 0;

        this.massNormal = 0;
        this.massTangent = 0;
        this.bias = 0;
        this.feature = new FeaturePair();
    }
}

// TODO: this arbiter key is inefficient, can we just use the two bodies ids
// Using a bitmask might be useful
export class ArbiterKey {
    body1: Body;
    body2: Body;

    constructor(b1: Body, b2: Body) {
        if (b1.id < b2.id) {
            this.body1 = b1;
            this.body2 = b2;
        } else {
            this.body1 = b2;
            this.body2 = b1;
        }
    }

    /** Operator < */
    static lessThen = (a1: ArbiterKey, a2: ArbiterKey): boolean => {
        if (a1.body1.id < a2.body1.id) {
            return true;
        }

        if (a1.body1.id === a2.body1.id && a1.body2.id < a2.body2.id) {
            return true;
        }

        return false;
    };
}

export class Arbiter {
    MAX_POINTS = 2;

    contacts: Contact[];
    numContacts: number;

    body1: Body;
    body2: Body;

    // Combined friction
    friction: number;

    constructor(b1: Body, b2: Body) {
        this.contacts = [new Contact(), new Contact()];

        if (b1.id < b2.id) {
            this.body1 = b1;
            this.body2 = b2;
        } else {
            this.body1 = b2;
            this.body2 = b1;
        }

        this.numContacts = Collide.checkCollision(this.contacts, this.body1, this.body2);

        this.friction = Math.sqrt(this.body1.friction * this.body2.friction);
    }

    update = (newContacts: Contact[], numNewContacts: number): void => {
        const mergedContacts = [new Contact(), new Contact()];

        for (let i = 0; i < numNewContacts; i++) {
            const cNew = newContacts[i];
            let k = -1;
            for (let j = 0; j < this.numContacts; ++j) {
                const cOld = this.contacts[j];
                if (cNew.feature.value === cOld.feature.value) {
                    k = j;
                    break;
                }
            }
            if (k > -1) {
                const cOld = this.contacts[k];
                // TODO: check if mergedContacts[i] = newContacts[i]; would be equivalent to next two lines
                mergedContacts[i] = new Contact();
                Object.assign(mergedContacts[i], newContacts[i]);
                const c = mergedContacts[i];

                if (World.warmStarting) {
                    c.Pn = cOld.Pn;
                    c.Pt = cOld.Pt;
                    c.Pnb = cOld.Pnb;
                } else {
                    c.Pn = 0.0;
                    c.Pt = 0.0;
                    c.Pnb = 0.0;
                }
            } else {
                mergedContacts[i] = newContacts[i];
            }
        }

        for (let i = 0; i < numNewContacts; i++) {
            this.contacts[i] = mergedContacts[i];
        }

        this.numContacts = numNewContacts;
    };

    preStep = (invDt: number): void => {
        // Allowed penetration & bias factor
        const kAllowedPenetration = 0.01;
        const kBiasFactor = World.positionCorrection ? 0.2 : 0.0;

        for (let i = 0; i < this.numContacts; ++i) {
            const c = this.contacts[i];

            // Relative positions
            const r1 = Vec2.sub(c.position, this.body1.position);
            const r2 = Vec2.sub(c.position, this.body2.position);

            // Normal mass computation
            const rn1 = Vec2.dot(r1, c.normal);
            const rn2 = Vec2.dot(r2, c.normal);
            let kNormal = this.body1.invMass + this.body2.invMass;
            kNormal +=
                this.body1.invI * (Vec2.dot(r1, r1) - rn1 * rn1) + this.body2.invI * (Vec2.dot(r2, r2) - rn2 * rn2);
            c.massNormal = 1.0 / kNormal;

            // Tangent mass computation
            const tangent = Vec2.cross(c.normal, 1);
            const rt1 = Vec2.dot(r1, tangent);
            const rt2 = Vec2.dot(r2, tangent);
            let kTangent = this.body1.invMass + this.body2.invMass;
            kTangent +=
                this.body1.invI * (Vec2.dot(r1, r1) - rt1 * rt1) + this.body2.invI * (Vec2.dot(r2, r2) - rt2 * rt2);
            c.massTangent = 1 / kTangent;

            // Bias computation
            c.bias = -kBiasFactor * invDt * Math.min(0, c.separation + kAllowedPenetration);

            if (World.accumulateImpulses) {
                // Apply accumulated impulses
                const P = Vec2.add(Vec2.scale(c.Pn, c.normal), Vec2.scale(c.Pt, tangent));

                this.body1.velocity.sub(Vec2.scale(this.body1.invMass, P));
                this.body1.angularVelocity -= this.body1.invI * Vec2.cross(r1, P);

                this.body2.velocity.add(Vec2.scale(this.body2.invMass, P));
                this.body2.angularVelocity += this.body2.invI * Vec2.cross(r2, P);
            }
        }
    };

    applyImpulse = (): void => {
        const b1 = this.body1;
        const b2 = this.body2;

        for (let i = 0; i < this.numContacts; ++i) {
            const c = this.contacts[i];
            c.r1 = Vec2.sub(c.position, b1.position);
            c.r2 = Vec2.sub(c.position, b2.position);

            // Linear velocity of the center of mass of body 1 and 2.
            let lv1 = Vec2.sub(b1.velocity, Vec2.cross(b1.angularVelocity, c.r1));
            let lv2 = Vec2.add(b2.velocity, Vec2.cross(b2.angularVelocity, c.r2));

            // Relative velocity at contact
            let dv = Vec2.sub(lv2, lv1);

            // Compute normal impulse
            const vn = Vec2.dot(dv, c.normal);
            let dPn = c.massNormal * (-vn + c.bias);

            if (World.accumulateImpulses) {
                // Clamp the accumulated impulse
                const Pn0 = c.Pn;
                c.Pn = Math.max(Pn0 + dPn, 0);
                dPn = c.Pn - Pn0;
            } else {
                dPn = Math.max(dPn, 0);
            }

            // Apply contact impulse
            const Pn = Vec2.scale(dPn, c.normal);

            b1.velocity.sub(Vec2.scale(b1.invMass, Pn));
            b1.angularVelocity -= b1.invI * Vec2.cross(c.r1, Pn);

            b2.velocity.add(Vec2.scale(b2.invMass, Pn));
            b2.angularVelocity += b2.invI * Vec2.cross(c.r2, Pn);

            // Linear velocity of the center of mass of body 1 and 2.
            lv1 = Vec2.sub(b1.velocity, Vec2.cross(b1.angularVelocity, c.r1));
            lv2 = Vec2.add(b2.velocity, Vec2.cross(b2.angularVelocity, c.r2));

            // Relative velocity at contact
            dv = Vec2.sub(lv2, lv1);

            const tangent = Vec2.cross(c.normal, 1);
            const vt = Vec2.dot(dv, tangent);
            let dPt = c.massTangent * -vt;

            if (World.accumulateImpulses) {
                // Compute friction impulse
                const maxPt = this.friction * c.Pn;

                // Clamp friction
                const oldTangentImpulse = c.Pt;
                c.Pt = Utils.clamp(oldTangentImpulse + dPt, -maxPt, maxPt);
                dPt = c.Pt - oldTangentImpulse;
            } else {
                const maxPt = this.friction * dPn;
                dPt = Utils.clamp(dPt, -maxPt, maxPt);
            }

            // Apply contact impulse
            const Pt = Vec2.scale(dPt, tangent);

            b1.velocity.sub(Vec2.scale(b1.invMass, Pt));
            b1.angularVelocity -= b1.invI * Vec2.cross(c.r1, Pt);

            b2.velocity.add(Vec2.scale(b2.invMass, Pt));
            b2.angularVelocity += b2.invI * Vec2.cross(c.r2, Pt);
        }
    };
}
