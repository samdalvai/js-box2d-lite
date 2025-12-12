// Box vertex and edge numbering:
//
//        ^ y
//        |
//        e1
//   v2 ------ v1
//    |        |
// e2 |        | e4  --> x
//    |        |
//   v3 ------ v4
//        e3
import Mat22 from '../math/Mat22';
import Vec2 from '../math/Vec2';
import { FeaturePair } from './Arbiter';

export enum Axis {
    FACE_A_X,
    FACE_A_Y,
    FACE_B_X,
    FACE_B_Y,
}

export enum EdgeNumbers {
    NO_EDGE = 0,
    EDGE1,
    EDGE2,
    EDGE3,
    EDGE4,
}

export class ClipVertex {
    v: Vec2;
    fp: FeaturePair;

    constructor(value = 0) {
        this.v = new Vec2();
        this.fp = new FeaturePair(value);
    }

    clone = (): ClipVertex => {
        const cv = new ClipVertex();
        cv.v = this.v.clone();
        cv.fp.value = this.fp.value;

        cv.fp.e.inEdge1 = this.fp.e.inEdge1;
        cv.fp.e.outEdge1 = this.fp.e.outEdge1;
        cv.fp.e.inEdge2 = this.fp.e.inEdge2;
        cv.fp.e.outEdge2 = this.fp.e.outEdge2;

        return cv;
    };

    static clipSegmentToLine = (
        vOut: [ClipVertex, ClipVertex],
        vIn: [ClipVertex, ClipVertex],
        normal: Vec2,
        offset: number,
        clipEdge: EdgeNumbers,
    ): number => {
        // Start with no output points
        let numOut = 0;

        // Calculate the distance of end points to the line
        const distance0 = Vec2.dot(normal, vIn[0].v) - offset;
        const distance1 = Vec2.dot(normal, vIn[1].v) - offset;

        // If the points are behind the plane
        if (distance0 <= 0.0) vOut[numOut++] = vIn[0].clone();
        if (distance1 <= 0.0) vOut[numOut++] = vIn[1].clone();

        // If the points are on different sides of the plane
        if (distance0 * distance1 < 0.0) {
            // Find intersection point of edge and plane
            const interp = distance0 / (distance0 - distance1);
            vOut[numOut].v = Vec2.add(vIn[0].v, Vec2.scale(interp, Vec2.sub(vIn[1].v, vIn[0].v)));

            if (distance0 > 0.0) {
                vOut[numOut].fp = vIn[0].fp.clone();
                vOut[numOut].fp.e.inEdge1 = clipEdge;
                vOut[numOut].fp.e.inEdge2 = EdgeNumbers.NO_EDGE;
            } else {
                vOut[numOut].fp = vIn[1].fp.clone();
                vOut[numOut].fp.e.outEdge1 = clipEdge;
                vOut[numOut].fp.e.outEdge2 = EdgeNumbers.NO_EDGE;
            }
            ++numOut;
        }

        return numOut;
    };

    static computeIncidentEdge = (c: [ClipVertex, ClipVertex], h: Vec2, pos: Vec2, Rot: Mat22, normal: Vec2): void => {
        // The normal is from the reference box. Convert it
        // to the incident boxe's frame and flip sign.
        const rotT = Rot.transpose();
        const n = Vec2.scale(-1, Mat22.multiply(rotT, normal));
        const nAbs = Vec2.abs(n);

        // Choose edge based on largest normal component
        if (nAbs.x > nAbs.y) {
            if (Math.sign(n.x) > 0) {
                // +X edge
                c[0].v.set(h.x, -h.y);
                c[0].fp.e.inEdge2 = EdgeNumbers.EDGE3;
                c[0].fp.e.outEdge2 = EdgeNumbers.EDGE4;

                c[1].v.set(h.x, h.y);
                c[1].fp.e.inEdge2 = EdgeNumbers.EDGE4;
                c[1].fp.e.outEdge2 = EdgeNumbers.EDGE1;
            } else {
                // -X edge
                c[0].v.set(-h.x, h.y);
                c[0].fp.e.inEdge2 = EdgeNumbers.EDGE1;
                c[0].fp.e.outEdge2 = EdgeNumbers.EDGE2;

                c[1].v.set(-h.x, -h.y);
                c[1].fp.e.inEdge2 = EdgeNumbers.EDGE2;
                c[1].fp.e.outEdge2 = EdgeNumbers.EDGE3;
            }
        } else {
            if (Math.sign(n.y) > 0) {
                // +Y edge
                c[0].v.set(h.x, h.y);
                c[0].fp.e.inEdge2 = EdgeNumbers.EDGE4;
                c[0].fp.e.outEdge2 = EdgeNumbers.EDGE1;

                c[1].v.set(-h.x, h.y);
                c[1].fp.e.inEdge2 = EdgeNumbers.EDGE1;
                c[1].fp.e.outEdge2 = EdgeNumbers.EDGE2;
            } else {
                // -Y edge
                c[0].v.set(-h.x, -h.y);
                c[0].fp.e.inEdge2 = EdgeNumbers.EDGE2;
                c[0].fp.e.outEdge2 = EdgeNumbers.EDGE3;

                c[1].v.set(h.x, -h.y);
                c[1].fp.e.inEdge2 = EdgeNumbers.EDGE3;
                c[1].fp.e.outEdge2 = EdgeNumbers.EDGE4;
            }
        }

        // Transform to world space: v = pos + Rot * v
        c[0].v = Vec2.add(pos, Mat22.multiply(Rot, c[0].v));
        c[1].v = Vec2.add(pos, Mat22.multiply(Rot, c[1].v));
    };
}

/*

// The normal points from A to B
int Collide(Contact* contacts, Body* bodyA, Body* bodyB)
{
	// Setup
	Vec2 hA = 0.5f * bodyA->width;
	Vec2 hB = 0.5f * bodyB->width;

	Vec2 posA = bodyA->position;
	Vec2 posB = bodyB->position;

	Mat22 RotA(bodyA->rotation), RotB(bodyB->rotation);

	Mat22 RotAT = RotA.Transpose();
	Mat22 RotBT = RotB.Transpose();

	Vec2 dp = posB - posA;
	Vec2 dA = RotAT * dp;
	Vec2 dB = RotBT * dp;

	Mat22 C = RotAT * RotB;
	Mat22 absC = Abs(C);
	Mat22 absCT = absC.Transpose();

	// Box A faces
	Vec2 faceA = Abs(dA) - hA - absC * hB;
	if (faceA.x > 0.0f || faceA.y > 0.0f)
		return 0;

	// Box B faces
	Vec2 faceB = Abs(dB) - absCT * hA - hB;
	if (faceB.x > 0.0f || faceB.y > 0.0f)
		return 0;

	// Find best axis
	Axis axis;
	float separation;
	Vec2 normal;

	// Box A faces
	axis = FACE_A_X;
	separation = faceA.x;
	normal = dA.x > 0.0f ? RotA.col1 : -RotA.col1;

	const float relativeTol = 0.95f;
	const float absoluteTol = 0.01f;

	if (faceA.y > relativeTol * separation + absoluteTol * hA.y)
	{
		axis = FACE_A_Y;
		separation = faceA.y;
		normal = dA.y > 0.0f ? RotA.col2 : -RotA.col2;
	}

	// Box B faces
	if (faceB.x > relativeTol * separation + absoluteTol * hB.x)
	{
		axis = FACE_B_X;
		separation = faceB.x;
		normal = dB.x > 0.0f ? RotB.col1 : -RotB.col1;
	}

	if (faceB.y > relativeTol * separation + absoluteTol * hB.y)
	{
		axis = FACE_B_Y;
		separation = faceB.y;
		normal = dB.y > 0.0f ? RotB.col2 : -RotB.col2;
	}

	// Setup clipping plane data based on the separating axis
	Vec2 frontNormal, sideNormal;
	ClipVertex incidentEdge[2];
	float front, negSide, posSide;
	char negEdge, posEdge;

	// Compute the clipping lines and the line segment to be clipped.
	switch (axis)
	{
	case FACE_A_X:
		{
			frontNormal = normal;
			front = Dot(posA, frontNormal) + hA.x;
			sideNormal = RotA.col2;
			float side = Dot(posA, sideNormal);
			negSide = -side + hA.y;
			posSide =  side + hA.y;
			negEdge = EDGE3;
			posEdge = EDGE1;
			ComputeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
		}
		break;

	case FACE_A_Y:
		{
			frontNormal = normal;
			front = Dot(posA, frontNormal) + hA.y;
			sideNormal = RotA.col1;
			float side = Dot(posA, sideNormal);
			negSide = -side + hA.x;
			posSide =  side + hA.x;
			negEdge = EDGE2;
			posEdge = EDGE4;
			ComputeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
		}
		break;

	case FACE_B_X:
		{
			frontNormal = -normal;
			front = Dot(posB, frontNormal) + hB.x;
			sideNormal = RotB.col2;
			float side = Dot(posB, sideNormal);
			negSide = -side + hB.y;
			posSide =  side + hB.y;
			negEdge = EDGE3;
			posEdge = EDGE1;
			ComputeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
		}
		break;

	case FACE_B_Y:
		{
			frontNormal = -normal;
			front = Dot(posB, frontNormal) + hB.y;
			sideNormal = RotB.col1;
			float side = Dot(posB, sideNormal);
			negSide = -side + hB.x;
			posSide =  side + hB.x;
			negEdge = EDGE2;
			posEdge = EDGE4;
			ComputeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
		}
		break;
	}

	// clip other face with 5 box planes (1 face plane, 4 edge planes)

	ClipVertex clipPoints1[2];
	ClipVertex clipPoints2[2];
	int np;

	// Clip to box side 1
	np = ClipSegmentToLine(clipPoints1, incidentEdge, -sideNormal, negSide, negEdge);

	if (np < 2)
		return 0;

	// Clip to negative box side 1
	np = ClipSegmentToLine(clipPoints2, clipPoints1,  sideNormal, posSide, posEdge);

	if (np < 2)
		return 0;

	// Now clipPoints2 contains the clipping points.
	// Due to roundoff, it is possible that clipping removes all points.

	int numContacts = 0;
	for (int i = 0; i < 2; ++i)
	{
		float separation = Dot(frontNormal, clipPoints2[i].v) - front;

		if (separation <= 0)
		{
			contacts[numContacts].separation = separation;
			contacts[numContacts].normal = normal;
			// slide contact point onto reference face (easy to cull)
			contacts[numContacts].position = clipPoints2[i].v - separation * frontNormal;
			contacts[numContacts].feature = clipPoints2[i].fp;
			if (axis == FACE_B_X || axis == FACE_B_Y)
				Flip(contacts[numContacts].feature);
			++numContacts;
		}
	}

	return numContacts;
}

*/
