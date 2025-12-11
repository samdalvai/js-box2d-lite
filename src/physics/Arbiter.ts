import Vec2 from '../math/Vec2';
import Body from './Body';

export type Edges = {
    inEdge1: number;
    outEdge1: number;
    inEdge2: number;
    outEdge2: number;
};

export type FeaturePair = {
    e: Edges;
    value: number;
};

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
        this.feature = {
            e: {
                inEdge1: 0,
                outEdge1: 0,
                inEdge2: 0,
                outEdge2: 0,
            },
            value: 0,
        };
    }
}

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

        // TODO: to be implementd and substituted
        this.numContacts = 0;
        //this.numContacts = Collide(contacts, body1, body2);

        this.friction = Math.sqrt(this.body1.friction * this.body2.friction);
    }

    // TODO: warmStarting needs to be removed from here
    update = (newContacts: Contact[], numNewContacts: number, warmStarting = true): void => {
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
                // TODO: to be implemented
                // if (World::warmStarting)
                if (warmStarting) {
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

    // TODO: remove positionCorrection and accumulateImpulses
    preStep = (invDt: number, positionCorrection = true, accumulateImpulses = true): void => {
        // Allowed penetration & bias factor
        const kAllowedPenetration = 0.01;
        const kBiasFactor = positionCorrection ? 0.2 : 0.0;

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

            if (accumulateImpulses) {
                // Apply accumulated impulses
                const P = Vec2.add(Vec2.scale(c.Pn, c.normal), Vec2.scale(c.Pt, tangent));

                this.body1.velocity.sub(Vec2.scale(this.body1.invMass, P));
                this.body1.angularVelocity -= this.body1.invI * Vec2.cross(r1, P);

                this.body2.velocity.add(Vec2.scale(this.body2.invMass, P));
                this.body2.angularVelocity += this.body2.invI * Vec2.cross(r2, P);
            }
        }
    };

    applyImpulse = (): void => {};
}

/*
void Arbiter::ApplyImpulse()
{
	Body* b1 = body1;
	Body* b2 = body2;

	for (int i = 0; i < numContacts; ++i)
	{
		Contact* c = contacts + i;
		c->r1 = c->position - b1->position;
		c->r2 = c->position - b2->position;

		// Relative velocity at contact
		Vec2 dv = b2->velocity + Cross(b2->angularVelocity, c->r2) - b1->velocity - Cross(b1->angularVelocity, c->r1);

		// Compute normal impulse
		float vn = Dot(dv, c->normal);

		float dPn = c->massNormal * (-vn + c->bias);

		if (World::accumulateImpulses)
		{
			// Clamp the accumulated impulse
			float Pn0 = c->Pn;
			c->Pn = Max(Pn0 + dPn, 0.0f);
			dPn = c->Pn - Pn0;
		}
		else
		{
			dPn = Max(dPn, 0.0f);
		}

		// Apply contact impulse
		Vec2 Pn = dPn * c->normal;

		b1->velocity -= b1->invMass * Pn;
		b1->angularVelocity -= b1->invI * Cross(c->r1, Pn);

		b2->velocity += b2->invMass * Pn;
		b2->angularVelocity += b2->invI * Cross(c->r2, Pn);

		// Relative velocity at contact
		dv = b2->velocity + Cross(b2->angularVelocity, c->r2) - b1->velocity - Cross(b1->angularVelocity, c->r1);

		Vec2 tangent = Cross(c->normal, 1.0f);
		float vt = Dot(dv, tangent);
		float dPt = c->massTangent * (-vt);

		if (World::accumulateImpulses)
		{
			// Compute friction impulse
			float maxPt = friction * c->Pn;

			// Clamp friction
			float oldTangentImpulse = c->Pt;
			c->Pt = Clamp(oldTangentImpulse + dPt, -maxPt, maxPt);
			dPt = c->Pt - oldTangentImpulse;
		}
		else
		{
			float maxPt = friction * dPn;
			dPt = Clamp(dPt, -maxPt, maxPt);
		}

		// Apply contact impulse
		Vec2 Pt = dPt * tangent;

		b1->velocity -= b1->invMass * Pt;
		b1->angularVelocity -= b1->invI * Cross(c->r1, Pt);

		b2->velocity += b2->invMass * Pt;
		b2->angularVelocity += b2->invI * Cross(c->r2, Pt);
	}
}


*/
