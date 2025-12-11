import Mat22 from '../math/Mat22';
import Vec2 from '../math/Vec2';
import Body from './Body';

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
        //
    };

    applyImpulse = (): void => {
        if (!this.body1 || !this.body2) {
            throw new Error('One or more bodies not initialized in Joint');
        }

        // Linear velocity of the center of mass of body 1 and 2.
        const lv1 = Vec2.sub(this.body1.velocity, Vec2.cross(this.body1.angularVelocity, this.r1));
        const lv2 = Vec2.add(this.body2.velocity, Vec2.cross(this.body2.angularVelocity, this.r2));

        // Relative velocity at contact
        const dv = Vec2.sub(lv2, lv1);

        const impulse = Mat22.multiply(this.M, Vec2.sub(Vec2.sub(this.bias, dv), Vec2.scale(this.softness, this.P)));

        this.body1.velocity.sub(Vec2.scale(this.body1.invMass, impulse));
        this.body1.angularVelocity -= this.body1.invI * Vec2.cross(this.r1, impulse);

        this.body2.velocity.add(Vec2.scale(this.body2.invMass, impulse));
        this.body2.angularVelocity += this.body2.invI * Vec2.cross(this.r2, impulse);

        this.P.add(impulse);
    };
}

/*

void Joint::PreStep(float inv_dt)
{
	// Pre-compute anchors, mass matrix, and bias.
	Mat22 Rot1(body1->rotation);
	Mat22 Rot2(body2->rotation);

	r1 = Rot1 * localAnchor1;
	r2 = Rot2 * localAnchor2;

	// deltaV = deltaV0 + K * impulse
	// invM = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
	//      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
	//        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
	Mat22 K1;
	K1.col1.x = body1->invMass + body2->invMass;	K1.col2.x = 0.0f;
	K1.col1.y = 0.0f;								K1.col2.y = body1->invMass + body2->invMass;

	Mat22 K2;
	K2.col1.x =  body1->invI * r1.y * r1.y;		K2.col2.x = -body1->invI * r1.x * r1.y;
	K2.col1.y = -body1->invI * r1.x * r1.y;		K2.col2.y =  body1->invI * r1.x * r1.x;

	Mat22 K3;
	K3.col1.x =  body2->invI * r2.y * r2.y;		K3.col2.x = -body2->invI * r2.x * r2.y;
	K3.col1.y = -body2->invI * r2.x * r2.y;		K3.col2.y =  body2->invI * r2.x * r2.x;

	Mat22 K = K1 + K2 + K3;
	K.col1.x += softness;
	K.col2.y += softness;

	M = K.Invert();

	Vec2 p1 = body1->position + r1;
	Vec2 p2 = body2->position + r2;
	Vec2 dp = p2 - p1;

	if (World::positionCorrection)
	{
		bias = -biasFactor * inv_dt * dp;
	}
	else
	{
		bias.Set(0.0f, 0.0f);
	}

	if (World::warmStarting)
	{
		// Apply accumulated impulse.
		body1->velocity -= body1->invMass * P;
		body1->angularVelocity -= body1->invI * Cross(r1, P);

		body2->velocity += body2->invMass * P;
		body2->angularVelocity += body2->invI * Cross(r2, P);
	}
	else
	{
		P.Set(0.0f, 0.0f);
	}
}

*/
