/*
 * Ported to JavaScript from Box2D Lite
 * Original work Copyright (c) 2006-2007 Erin Catto
 * http://www.gphysics.com
 *
 * See LICENSE file for full license text.
 */
import Mat22 from '../math/Mat22';
import Vec2 from '../math/Vec2';
import { Contact, Edges } from './Arbiter';
import Body from './Body';

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
    vertex: Vec2;
    edges: Edges;

    constructor() {
        this.vertex = new Vec2();
        this.edges = new Edges();
    }

    clone = (): ClipVertex => {
        const cv = new ClipVertex();
        cv.vertex = this.vertex.clone();

        cv.edges.inEdge1 = this.edges.inEdge1;
        cv.edges.outEdge1 = this.edges.outEdge1;
        cv.edges.inEdge2 = this.edges.inEdge2;
        cv.edges.outEdge2 = this.edges.outEdge2;

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
        const distance0 = Vec2.dot(normal, vIn[0].vertex) - offset;
        const distance1 = Vec2.dot(normal, vIn[1].vertex) - offset;

        // If the points are behind the plane
        if (distance0 <= 0.0) vOut[numOut++] = vIn[0].clone();
        if (distance1 <= 0.0) vOut[numOut++] = vIn[1].clone();

        // If the points are on different sides of the plane
        if (distance0 * distance1 < 0.0) {
            // Find intersection point of edge and plane
            const interp = distance0 / (distance0 - distance1);
            vOut[numOut].vertex = Vec2.add(vIn[0].vertex, Vec2.scale(interp, Vec2.sub(vIn[1].vertex, vIn[0].vertex)));

            if (distance0 > 0.0) {
                vOut[numOut].edges = vIn[0].edges.clone();
                vOut[numOut].edges.inEdge1 = clipEdge;
                vOut[numOut].edges.inEdge2 = EdgeNumbers.NO_EDGE;
            } else {
                vOut[numOut].edges = vIn[1].edges.clone();
                vOut[numOut].edges.outEdge1 = clipEdge;
                vOut[numOut].edges.outEdge2 = EdgeNumbers.NO_EDGE;
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
                c[0].vertex.set(h.x, -h.y);
                c[0].edges.inEdge2 = EdgeNumbers.EDGE3;
                c[0].edges.outEdge2 = EdgeNumbers.EDGE4;

                c[1].vertex.set(h.x, h.y);
                c[1].edges.inEdge2 = EdgeNumbers.EDGE4;
                c[1].edges.outEdge2 = EdgeNumbers.EDGE1;
            } else {
                // -X edge
                c[0].vertex.set(-h.x, h.y);
                c[0].edges.inEdge2 = EdgeNumbers.EDGE1;
                c[0].edges.outEdge2 = EdgeNumbers.EDGE2;

                c[1].vertex.set(-h.x, -h.y);
                c[1].edges.inEdge2 = EdgeNumbers.EDGE2;
                c[1].edges.outEdge2 = EdgeNumbers.EDGE3;
            }
        } else {
            if (Math.sign(n.y) > 0) {
                // +Y edge
                c[0].vertex.set(h.x, h.y);
                c[0].edges.inEdge2 = EdgeNumbers.EDGE4;
                c[0].edges.outEdge2 = EdgeNumbers.EDGE1;

                c[1].vertex.set(-h.x, h.y);
                c[1].edges.inEdge2 = EdgeNumbers.EDGE1;
                c[1].edges.outEdge2 = EdgeNumbers.EDGE2;
            } else {
                // -Y edge
                c[0].vertex.set(-h.x, -h.y);
                c[0].edges.inEdge2 = EdgeNumbers.EDGE2;
                c[0].edges.outEdge2 = EdgeNumbers.EDGE3;

                c[1].vertex.set(h.x, -h.y);
                c[1].edges.inEdge2 = EdgeNumbers.EDGE3;
                c[1].edges.outEdge2 = EdgeNumbers.EDGE4;
            }
        }

        // Transform to world space: v = pos + Rot * v
        c[0].vertex = Vec2.add(pos, Mat22.multiply(Rot, c[0].vertex));
        c[1].vertex = Vec2.add(pos, Mat22.multiply(Rot, c[1].vertex));
    };
}

export class Collide {
    // The normal points from A to B
    static checkCollision = (contacts: Contact[], bodyA: Body, bodyB: Body): number => {
        // Setup
        const hA = Vec2.scale(0.5, bodyA.width);
        const hB = Vec2.scale(0.5, bodyB.width);

        const posA = bodyA.position;
        const posB = bodyB.position;

        const RotA = new Mat22(bodyA.rotation);
        const RotB = new Mat22(bodyB.rotation);

        const RotAT = RotA.transpose();
        const RotBT = RotB.transpose();

        const dp = Vec2.sub(posB, posA);
        const dA = Mat22.multiply(RotAT, dp);
        const dB = Mat22.multiply(RotBT, dp);

        const C = Mat22.multiply(RotAT, RotB);
        const absC = Mat22.abs(C);
        const absCT = absC.transpose();

        // Box A faces
        const faceA = Vec2.sub(Vec2.sub(Vec2.abs(dA), hA), Mat22.multiply(absC, hB));
        if (faceA.x > 0.0 || faceA.y > 0.0) {
            return 0;
        }
        //	Vec2 faceB = Abs(dB) - absCT * hA - hB;
        // Box B faces
        const faceB = Vec2.sub(Vec2.sub(Vec2.abs(dB), Mat22.multiply(absCT, hA)), hB);
        if (faceB.x > 0.0 || faceB.y > 0.0) {
            return 0;
        }

        // Find best axis

        // Box A faces
        let axis = Axis.FACE_A_X;
        let separation = faceA.x;
        let normal = dA.x > 0.0 ? RotA.col1 : Vec2.scale(-1, RotA.col1);

        const relativeTol = 0.95;
        const absoluteTol = 0.01;

        if (faceA.y > relativeTol * separation + absoluteTol * hA.y) {
            axis = Axis.FACE_A_Y;
            separation = faceA.y;
            normal = dA.y > 0.0 ? RotA.col2 : Vec2.scale(-1, RotA.col2);
        }

        // Box B faces
        if (faceB.x > relativeTol * separation + absoluteTol * hB.x) {
            axis = Axis.FACE_B_X;
            separation = faceB.x;
            normal = dB.x > 0.0 ? RotB.col1 : Vec2.scale(-1, RotB.col1);
        }

        if (faceB.y > relativeTol * separation + absoluteTol * hB.y) {
            axis = Axis.FACE_B_Y;
            separation = faceB.y;
            normal = dB.y > 0.0 ? RotB.col2 : Vec2.scale(-1, RotB.col2);
        }

        // Setup clipping plane data based on the separating axis
        let frontNormal = new Vec2();
        let sideNormal = new Vec2();
        const incidentEdge: [ClipVertex, ClipVertex] = [new ClipVertex(), new ClipVertex()];
        let front = 0;
        let negSide = 0;
        let posSide = 0;
        let negEdge: EdgeNumbers = 0;
        let posEdge: EdgeNumbers = 0;

        // Compute the clipping lines and the line segment to be clipped.
        switch (axis) {
            case Axis.FACE_A_X:
                {
                    frontNormal = normal;
                    front = Vec2.dot(posA, frontNormal) + hA.x;
                    sideNormal = RotA.col2;
                    const side = Vec2.dot(posA, sideNormal);
                    negSide = -side + hA.y;
                    posSide = side + hA.y;
                    negEdge = EdgeNumbers.EDGE3;
                    posEdge = EdgeNumbers.EDGE1;
                    ClipVertex.computeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
                }
                break;
            case Axis.FACE_A_Y:
                {
                    frontNormal = normal;
                    front = Vec2.dot(posA, frontNormal) + hA.y;
                    sideNormal = RotA.col1;
                    const side = Vec2.dot(posA, sideNormal);
                    negSide = -side + hA.x;
                    posSide = side + hA.x;
                    negEdge = EdgeNumbers.EDGE2;
                    posEdge = EdgeNumbers.EDGE4;
                    ClipVertex.computeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
                }
                break;
            case Axis.FACE_B_X:
                {
                    frontNormal = Vec2.scale(-1, normal);
                    front = Vec2.dot(posB, frontNormal) + hB.x;
                    sideNormal = RotB.col2;
                    const side = Vec2.dot(posB, sideNormal);
                    negSide = -side + hB.y;
                    posSide = side + hB.y;
                    negEdge = EdgeNumbers.EDGE3;
                    posEdge = EdgeNumbers.EDGE1;
                    ClipVertex.computeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
                }
                break;
            case Axis.FACE_B_Y:
                {
                    frontNormal = Vec2.scale(-1, normal);
                    front = Vec2.dot(posB, frontNormal) + hB.y;
                    sideNormal = RotB.col1;
                    const side = Vec2.dot(posB, sideNormal);
                    negSide = -side + hB.x;
                    posSide = side + hB.x;
                    negEdge = EdgeNumbers.EDGE2;
                    posEdge = EdgeNumbers.EDGE4;
                    ClipVertex.computeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
                }
                break;
        }

        // clip other face with 5 box planes (1 face plane, 4 edge planes)

        const clipPoints1: [ClipVertex, ClipVertex] = [new ClipVertex(), new ClipVertex()];
        const clipPoints2: [ClipVertex, ClipVertex] = [new ClipVertex(), new ClipVertex()];
        let np = 0;

        // Clip to box side 1
        np = ClipVertex.clipSegmentToLine(clipPoints1, incidentEdge, Vec2.scale(-1, sideNormal), negSide, negEdge);

        if (np < 2) {
            return 0;
        }

        // Clip to negative box side 1
        np = ClipVertex.clipSegmentToLine(clipPoints2, clipPoints1, sideNormal, posSide, posEdge);

        if (np < 2) {
            return 0;
        }

        // Now clipPoints2 contains the clipping points.
        // Due to roundoff, it is possible that clipping removes all points.

        let numContacts = 0;
        for (let i = 0; i < 2; i++) {
            const separation = Vec2.dot(frontNormal, clipPoints2[i].vertex) - front;

            if (separation <= 0) {
                if (numContacts + 1 > contacts.length) {
                    const ct = new Contact();
                    contacts.push(ct);
                }

                contacts[numContacts].separation = separation;
                contacts[numContacts].normal = normal;

                // slide contact point onto reference face (easy to cull)
                contacts[numContacts].position = Vec2.sub(clipPoints2[i].vertex, Vec2.scale(separation, frontNormal));
                contacts[numContacts].edges = clipPoints2[i].edges;

                if (axis === Axis.FACE_B_X || axis === Axis.FACE_B_Y) {
                    contacts[numContacts].edges.flip();
                }

                ++numContacts;
            }
        }

        return numContacts;
    };
}
