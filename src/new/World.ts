import { Body } from './Body';
import Contact from './Contact';
import Joint from './Joint';

export default class World {
    gravity: number;
    iterations: number;
    timeStep: number;
    invDT: number;
    friction: number;
    allowedPenetration: number;
    biasFactor: number;
    relativeTol: number;
    absoluteTol: number;
    bodies: Body[];
    joints: Joint[];
    contacts: Contact[];
    numContacts: number;
    maxContacts: number;
    ie: number[];
    c1: number[];
    c2: number[];
    bodyCount: number;
    jointsCount: number;
    ctx: CanvasRenderingContext2D;

    constructor(setup: any) {
        this.gravity = setup.gravity || 50;
        this.iterations = setup.iterations || 10;
        this.timeStep = setup.timeStep || 1 / 30;
        this.invDT = 1 / this.timeStep;
        this.friction = setup.friction || 0.2;
        this.allowedPenetration = setup.allowedPenetration || 0.01;
        this.biasFactor = setup.biasFactor || 0.2;
        this.relativeTol = setup.relativeTol || 0.95;
        this.absoluteTol = setup.absoluteTol || 0.01;
        this.bodies = [];
        this.joints = [];
        this.contacts = [];
        this.numContacts = 0;
        this.maxContacts = 0;
        this.ie = [0.0, 0.0, 0.0, 0.0];
        this.c1 = [0.0, 0.0, 0.0, 0.0];
        this.c2 = [0.0, 0.0, 0.0, 0.0];
        this.bodyCount = 0;
        this.jointsCount = 0;
        this.ctx = setup.ctx;
    }

    addBody(setup: any) {
        const body = new Body(this, setup, this.ctx);
        this.bodies.push(body);
        this.bodyCount = this.bodies.length;
        return body;
    }

    addJoint(setup: any) {
        const joint = new Joint(this, setup, this.ctx);
        this.joints.push(joint);
        this.jointsCount = this.joints.length;
        return joint;
    }

    step() {
        let i, j, bi, bj, dx, dy, d;

        // O(n^2) broad-phase
        this.numContacts = 0;

        for (i = 0; i < this.bodyCount; ++i) {
            bi = this.bodies[i];

            for (j = i + 1; j < this.bodyCount; ++j) {
                bj = this.bodies[j];

                if (bi.invMass || bj.invMass) {
                    // circle vs circle collision
                    dx = bj.position.x - bi.position.x;
                    dy = bj.position.y - bi.position.y;
                    d = bi.rd + bj.rd;

                    if (dx * dx + dy * dy < d * d) {
                        // OBB collision and update contact points
                        this.collide(bi, bj, dx, dy);
                    }
                }
            }
        }

        // Perform joints pre-steps
        for (i = 0; i < this.jointsCount; ++i) {
            this.joints[i].preStep();
        }

        // Perform iterations
        for (j = 0; j < this.iterations; ++j) {
            for (i = 0; i < this.numContacts; ++i) {
                this.contacts[i].applyImpulse();
            }
            for (i = 0; i < this.jointsCount; ++i) {
                this.joints[i].applyImpulse();
            }
        }

        // integrate velocities
        for (i = 0; i < this.bodyCount; ++i) {
            this.bodies[i].integrate();
        }

        // draw joints
        for (i = 0; i < this.jointsCount; ++i) {
            this.joints[i].draw();
        }

        // draw bodies
        for (i = 0; i < this.bodyCount; ++i) {
            this.bodies[i].draw();
        }

        // draw contacts
        for (i = 0; i < this.numContacts; i++) {
            //this.contacts[i].draw();
        }
    }

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

    // The normal points from A to B
    collide(bA: Body, bB: Body, dpx: number, dpy: number) {
        // Setup

        const dax = bA.cos * dpx + bA.sin * dpy;
        const day = -bA.sin * dpx + bA.cos * dpy;
        const dbx = bB.cos * dpx + bB.sin * dpy;
        const dby = -bB.sin * dpx + bB.cos * dpy;

        const m00 = Math.abs(bA.cos * bB.cos + bA.sin * bB.sin);
        const m01 = Math.abs(-bA.sin * bB.cos + bA.cos * bB.sin);
        const m10 = Math.abs(-bA.cos * bB.sin + bA.sin * bB.cos);
        const m11 = Math.abs(bA.sin * bB.sin + bA.cos * bB.cos);

        // Box A faces
        const fAx = Math.abs(dax) - bA.hw - (m00 * bB.hw + m10 * bB.hh);
        const fAy = Math.abs(day) - bA.hh - (m01 * bB.hw + m11 * bB.hh);
        if (fAx > 0.0 || fAy > 0.0) return;

        // Box B faces
        const fBx = Math.abs(dbx) - bB.hw - (m00 * bA.hw + m01 * bA.hh);
        const fBy = Math.abs(dby) - bB.hh - (m10 * bA.hw + m11 * bA.hh);
        if (fBx > 0.0 || fBy > 0.0) return;

        // Find best axis
        let nx, ny;

        // Box A faces
        let axis = 0;
        let separation = fAx;
        if (dax > 0.0) {
            nx = bA.cos;
            ny = bA.sin;
        } else {
            nx = -bA.cos;
            ny = -bA.sin;
        }

        if (fAy > this.relativeTol * separation + this.absoluteTol * bA.hh) {
            axis = 1;
            separation = fAy;
            if (day > 0.0) {
                nx = -bA.sin;
                ny = bA.cos;
            } else {
                nx = bA.sin;
                ny = -bA.cos;
            }
        }

        // Box B faces
        if (fBx > this.relativeTol * separation + this.absoluteTol * bB.hw) {
            axis = 2;
            separation = fBx;
            if (dbx > 0.0) {
                nx = bB.cos;
                ny = bB.sin;
            } else {
                nx = -bB.cos;
                ny = -bB.sin;
            }
        }

        if (fBy > this.relativeTol * separation + this.absoluteTol * bB.hh) {
            axis = 3;
            separation = fBy;
            if (dby > 0.0) {
                nx = -bB.sin;
                ny = bB.cos;
            } else {
                nx = bB.sin;
                ny = -bB.cos;
            }
        }

        // Setup clipping plane data based on the separating axis
        let fnx, fny, snx, sny;
        let front, negSide, posSide, side;

        switch (axis) {
            case 0:
                fnx = nx;
                fny = ny;
                front = bA.position.x * fnx + bA.position.y * fny + bA.hw;
                snx = -bA.sin;
                sny = bA.cos;
                side = bA.position.x * snx + bA.position.y * sny;
                negSide = -side + bA.hh;
                posSide = side + bA.hh;
                this.computeIncidentEdge(this.ie, bB, fnx, fny);
                break;
            case 1:
                fnx = nx;
                fny = ny;
                front = bA.position.x * fnx + bA.position.y * fny + bA.hh;
                snx = bA.cos;
                sny = bA.sin;
                side = bA.position.x * snx + bA.position.y * sny;
                negSide = -side + bA.hw;
                posSide = side + bA.hw;
                this.computeIncidentEdge(this.ie, bB, fnx, fny);
                break;
            case 2:
                fnx = -nx;
                fny = -ny;
                front = bB.position.x * fnx + bB.position.y * fny + bB.hw;
                snx = -bB.sin;
                sny = bB.cos;
                side = bB.position.x * snx + bB.position.y * sny;
                negSide = -side + bB.hh;
                posSide = side + bB.hh;
                this.computeIncidentEdge(this.ie, bA, fnx, fny);
                break;
            case 3:
                fnx = -nx;
                fny = -ny;
                front = bB.position.x * fnx + bB.position.y * fny + bB.hh;
                snx = bB.cos;
                sny = bB.sin;
                side = bB.position.x * snx + bB.position.y * sny;
                negSide = -side + bB.hw;
                posSide = side + bB.hw;
                this.computeIncidentEdge(this.ie, bA, fnx, fny);
                break;
        }

        // clip other face with 5 box planes (1 face plane, 4 edge planes)
        if (snx === undefined || sny === undefined || negSide === undefined || posSide === undefined) {
            throw new Error('Some values are undefined in collide method');
        }

        // Clip to box side 1
        if (this.clipSegmentToLine(this.c1, this.ie, -snx, -sny, negSide) < 2) return;

        // Clip to negative box side 1
        if (this.clipSegmentToLine(this.c2, this.c1, snx, sny, posSide) < 2) return;

        // Now clipPoints2 contains the clipping points.
        // Due to roundoff, it is possible that clipping removes all points.

        let i, cpx, cpy, ct;
        const friction = Math.sqrt(bA.friction * bB.friction);

        if (fnx === undefined || fny === undefined || front === undefined) {
            throw new Error('Some values are undefined in collide method');
        }

        for (i = 0; i < 2; ++i) {
            cpx = this.c2[i * 2];
            cpy = this.c2[i * 2 + 1];
            separation = fnx * cpx + fny * cpy - front;

            if (separation < 0) {
                if (this.numContacts < this.maxContacts) {
                    // reuse existing contact
                    ct = this.contacts[this.numContacts];
                } else {
                    // create new contact
                    ct = new Contact(this, this.ctx);
                    this.contacts.push(ct);
                    this.maxContacts++;
                }

                // update contact and pre-step
                ct.update(bA, bB, separation, nx, ny, friction, cpx - fnx * separation, cpy - fny * separation);

                this.numContacts++;
            }
        }
    }

    clipSegmentToLine(vO: number[], vI: number[], nx: number, ny: number, offset: number) {
        // Start with no output points
        let numOut = 0;

        // Calculate the distance of end points to the line
        const distance0 = nx * vI[0] + ny * vI[1] - offset;
        const distance1 = nx * vI[2] + ny * vI[3] - offset;

        // If the points are behind the plane
        if (distance0 <= 0.0) {
            vO[numOut * 2] = vI[0];
            vO[numOut * 2 + 1] = vI[1];
            numOut++;
        }
        if (distance1 <= 0.0) {
            vO[numOut * 2] = vI[2];
            vO[numOut * 2 + 1] = vI[3];
            numOut++;
        }

        // If the points are on different sides of the plane
        if (distance0 * distance1 < 0.0) {
            // Find intersection point of edge and plane
            const interp = distance0 / (distance0 - distance1);
            vO[numOut * 2] = vI[0] + interp * (vI[2] - vI[0]);
            vO[numOut * 2 + 1] = vI[1] + interp * (vI[3] - vI[1]);
            ++numOut;
        }

        return numOut;
    }

    computeIncidentEdge(ie: number[], b: Body, nx: number, ny: number) {
        // The normal is from the reference box. Convert it
        // to the incident boxe's frame and flip sign.

        const nrx = -(b.cos * nx + b.sin * ny);
        const nry = -(-b.sin * nx + b.cos * ny);

        if (Math.abs(nrx) > Math.abs(nry)) {
            if (nrx > 0.0) {
                ie[0] = b.hw;
                ie[1] = -b.hh;
                ie[2] = b.hw;
                ie[3] = b.hh;
            } else {
                ie[0] = -b.hw;
                ie[1] = b.hh;
                ie[2] = -b.hw;
                ie[3] = -b.hh;
            }
        } else {
            if (nry > 0.0) {
                ie[0] = b.hw;
                ie[1] = b.hh;
                ie[2] = -b.hw;
                ie[3] = b.hh;
            } else {
                ie[0] = -b.hw;
                ie[1] = -b.hh;
                ie[2] = b.hw;
                ie[3] = -b.hh;
            }
        }

        let x, y;

        x = ie[0];
        y = ie[1];

        ie[0] = b.position.x + b.cos * x - b.sin * y;
        ie[1] = b.position.y + b.sin * x + b.cos * y;

        x = ie[2];
        y = ie[3];

        ie[2] = b.position.x + b.cos * x - b.sin * y;
        ie[3] = b.position.y + b.sin * x + b.cos * y;
    }
}
