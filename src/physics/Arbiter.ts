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
    value?: number;
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

    update = (contacts: Contact[], numContacts: number): void => {};

    preStep = (invDt: number): void => {};

    applyImpulse = (): void => {};
}

/*

void Arbiter::Update(Contact* newContacts, int numNewContacts)
{
	Contact mergedContacts[2];

	for (int i = 0; i < numNewContacts; ++i)
	{
		Contact* cNew = newContacts + i;
		int k = -1;
		for (int j = 0; j < numContacts; ++j)
		{
			Contact* cOld = contacts + j;
			if (cNew->feature.value == cOld->feature.value)
			{
				k = j;
				break;
			}
		}

		if (k > -1)
		{
			Contact* c = mergedContacts + i;
			Contact* cOld = contacts + k;
			*c = *cNew;
			if (World::warmStarting)
			{
				c->Pn = cOld->Pn;
				c->Pt = cOld->Pt;
				c->Pnb = cOld->Pnb;
			}
			else
			{
				c->Pn = 0.0f;
				c->Pt = 0.0f;
				c->Pnb = 0.0f;
			}
		}
		else
		{
			mergedContacts[i] = newContacts[i];
		}
	}

	for (int i = 0; i < numNewContacts; ++i)
		contacts[i] = mergedContacts[i];

	numContacts = numNewContacts;
}


void Arbiter::PreStep(float inv_dt)
{
	const float k_allowedPenetration = 0.01f;
	float k_biasFactor = World::positionCorrection ? 0.2f : 0.0f;

	for (int i = 0; i < numContacts; ++i)
	{
		Contact* c = contacts + i;

		Vec2 r1 = c->position - body1->position;
		Vec2 r2 = c->position - body2->position;

		// Precompute normal mass, tangent mass, and bias.
		float rn1 = Dot(r1, c->normal);
		float rn2 = Dot(r2, c->normal);
		float kNormal = body1->invMass + body2->invMass;
		kNormal += body1->invI * (Dot(r1, r1) - rn1 * rn1) + body2->invI * (Dot(r2, r2) - rn2 * rn2);
		c->massNormal = 1.0f / kNormal;

		Vec2 tangent = Cross(c->normal, 1.0f);
		float rt1 = Dot(r1, tangent);
		float rt2 = Dot(r2, tangent);
		float kTangent = body1->invMass + body2->invMass;
		kTangent += body1->invI * (Dot(r1, r1) - rt1 * rt1) + body2->invI * (Dot(r2, r2) - rt2 * rt2);
		c->massTangent = 1.0f /  kTangent;

		c->bias = -k_biasFactor * inv_dt * Min(0.0f, c->separation + k_allowedPenetration);

		if (World::accumulateImpulses)
		{
			// Apply normal + friction impulse
			Vec2 P = c->Pn * c->normal + c->Pt * tangent;

			body1->velocity -= body1->invMass * P;
			body1->angularVelocity -= body1->invI * Cross(r1, P);

			body2->velocity += body2->invMass * P;
			body2->angularVelocity += body2->invI * Cross(r2, P);
		}
	}
}

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
