/**
 * Box2D Lite in JavaScript (ES2015).
 *
 * Adapted by Gerard Ferrandez https://codepen.io/ge1doot/
 *
 * Original Code Copyright:
 *-------------------------------------------------------------
 * Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
 *
 * Permission to use, copy, modify, distribute and sell this software
 * and its documentation for any purpose is hereby granted without fee,
 * provided that the above copyright notice appear in all copies.
 * Erin Catto makes no representations about the suitability
 * of this software for any purpose.
 * It is provided "as is" without express or implied warranty.
 */

class Contact {
    constructor(world) {
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

class Body {
    constructor(world, setup) {
        let w = setup.w || 1.0;
        let h = setup.h || 1.0;

        this.px = setup.x || 0.0;
        this.py = setup.y || 0.0;
        this.vx = setup.vx || 0.0;
        this.vy = setup.vy || 0.0;
        this.hw = w * 0.5;
        this.hh = h * 0.5;
        this.rd = Math.sqrt(this.hw * this.hw + this.hh * this.hh);
        this.va = setup.angularVelocity || 0.0;
        this.ra = setup.rotation || 0.0;

        this.cos = Math.cos(this.ra);
        this.sin = Math.sin(this.ra);

        this.friction = setup.friction === undefined ? world.friction : setup.friction;
        let mass = setup.mass || Infinity;
        this.color = setup.color || '#FFF';
        this.visible = setup.visible === undefined ? true : setup.visible;

        if (mass < Infinity) {
            this.iM = 1.0 / mass;
            this.iI = 1.0 / ((mass * (w * w + h * h)) / 12);
        } else {
            this.iM = 0.0;
            this.iI = 0.0;
        }

        this.dt = world.timeStep;
        this.gravity = setup.gravity || world.gravity;
        this.ctx = ctx;
    }

    integrate() {
        if (this.iM) {
            this.px += this.vx * this.dt;
            this.py += this.vy * this.dt;
            this.ra += this.va * this.dt;
            this.vy += this.gravity * this.dt;

            this.cos = Math.cos(this.ra);
            this.sin = Math.sin(this.ra);
        }
    }

    draw() {
        if (this.visible) {
            let chw = this.cos * this.hw;
            let shw = this.sin * this.hw;
            let chh = this.cos * this.hh;
            let shh = this.sin * this.hh;

            this.ctx.beginPath();
            this.ctx.moveTo(this.px - chw + shh, this.py - shw - chh);
            this.ctx.lineTo(this.px + chw + shh, this.py + shw - chh);
            this.ctx.lineTo(this.px + chw - shh, this.py + shw + chh);
            this.ctx.lineTo(this.px - chw - shh, this.py - shw + chh);

            this.ctx.closePath();
            this.ctx.strokeStyle = this.color;
            this.ctx.stroke();
        }
    }
}

class Joint {
    constructor(world, setup) {
        this.bA = setup.b1;
        this.bB = setup.b2;

        let c, s, x, y;

        c = this.bA.cos;
        s = this.bA.sin;
        x = setup.ax - this.bA.px;
        y = setup.ay - this.bA.py;
        this.a1x = c * x + s * y;
        this.a1y = -s * x + c * y;

        c = this.bB.cos;
        s = this.bB.sin;
        x = setup.ax - this.bB.px;
        y = setup.ay - this.bB.py;
        this.a2x = c * x + s * y;
        this.a2y = -s * x + c * y;

        this.m00 = 0.0;
        this.m01 = 0.0;
        this.m11 = 0.0;
        this.r1x = 0.0;
        this.r1y = 0.0;
        this.r2x = 0.0;
        this.r2y = 0.0;
        this.bsx = 0.0;
        this.bsy = 0.0;
        this.aix = 0.0; // accumulated impulse
        this.aiy = 0.0;
        let bias = setup.biasFactor ? setup.biasFactor : world.biasFactor;
        this.biasFactor = -bias * world.invDT;
        this.softness = setup.softness || 0.0;
        this.iM = this.bA.iM + this.bB.iM + this.softness;
        this.color = setup.color || '#888';
        this.ctx = ctx;
    }

    preStep() {
        // Pre-compute anchors, mass matrix, and bias.
        this.r1x = this.bA.cos * this.a1x - this.bA.sin * this.a1y;
        this.r1y = this.bA.sin * this.a1x + this.bA.cos * this.a1y;
        this.r2x = this.bB.cos * this.a2x - this.bB.sin * this.a2y;
        this.r2y = this.bB.sin * this.a2x + this.bB.cos * this.a2y;

        let Km00 = this.iM + this.bA.iI * this.r1y * this.r1y + this.bB.iI * this.r2y * this.r2y;
        let Km01 = -this.bA.iI * this.r1x * this.r1y + -this.bB.iI * this.r2x * this.r2y;
        let Km11 = this.iM + this.bA.iI * this.r1x * this.r1x + this.bB.iI * this.r2x * this.r2x;

        let det = 1.0 / (Km00 * Km11 - Km01 * Km01);

        this.m00 = det * Km11;
        this.m01 = -det * Km01;
        this.m11 = det * Km00;

        this.bsx = (this.bB.px + this.r2x - (this.bA.px + this.r1x)) * this.biasFactor;
        this.bsy = (this.bB.py + this.r2y - (this.bA.py + this.r1y)) * this.biasFactor;

        // Apply accumulated impulse.
        this.bA.vx -= this.aix * this.bA.iM;
        this.bA.vy -= this.aiy * this.bA.iM;
        this.bA.va -= this.bA.iI * (this.r1x * this.aiy - this.r1y * this.aix);

        this.bB.vx += this.aix * this.bB.iM;
        this.bB.vy += this.aiy * this.bB.iM;
        this.bB.va += this.bB.iI * (this.r2x * this.aiy - this.r2y * this.aix);
    }

    applyImpulse() {
        let bx =
            this.bsx -
            (this.bB.vx + -this.bB.va * this.r2y - this.bA.vx - -this.bA.va * this.r1y) -
            this.aix * this.softness;
        let by =
            this.bsy -
            (this.bB.vy + this.bB.va * this.r2x - this.bA.vy - this.bA.va * this.r1x) -
            this.aiy * this.softness;

        let ix = this.m00 * bx + this.m01 * by;
        let iy = this.m01 * bx + this.m11 * by;

        this.bA.vx -= ix * this.bA.iM;
        this.bA.vy -= iy * this.bA.iM;
        this.bA.va -= this.bA.iI * (this.r1x * iy - this.r1y * ix);

        this.bB.vx += ix * this.bB.iM;
        this.bB.vy += iy * this.bB.iM;
        this.bB.va += this.bB.iI * (this.r2x * iy - this.r2y * ix);

        this.aix += ix;
        this.aiy += iy;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.setLineDash([2, 2]);
        this.ctx.moveTo(this.bA.px, this.bA.py);
        this.ctx.lineTo(this.bA.px + this.r1x, this.bA.py + this.r1y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}

class World {
    constructor(setup) {
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
        this.abs = Math.abs;
    }

    addBody(setup) {
        let body = new Body(this, setup);
        this.bodies.push(body);
        this.bodyCount = this.bodies.length;
        return body;
    }

    addJoint(setup) {
        let joint = new Joint(this, setup);
        this.joints.push(joint);
        this.jointsCount = this.joints.length;
        return joint;
    }

    step() {
        let i, j, bi, bj, dx, dy, d, ct;

        // O(n^2) broad-phase
        this.numContacts = 0;

        for (i = 0; i < this.bodyCount; ++i) {
            bi = this.bodies[i];

            for (j = i + 1; j < this.bodyCount; ++j) {
                bj = this.bodies[j];

                if (bi.iM || bj.iM) {
                    // circle vs circle collision
                    dx = bj.px - bi.px;
                    dy = bj.py - bi.py;
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
    collide(bA, bB, dpx, dpy) {
        // Setup

        let dax = bA.cos * dpx + bA.sin * dpy;
        let day = -bA.sin * dpx + bA.cos * dpy;
        let dbx = bB.cos * dpx + bB.sin * dpy;
        let dby = -bB.sin * dpx + bB.cos * dpy;

        let m00 = this.abs(bA.cos * bB.cos + bA.sin * bB.sin);
        let m01 = this.abs(-bA.sin * bB.cos + bA.cos * bB.sin);
        let m10 = this.abs(-bA.cos * bB.sin + bA.sin * bB.cos);
        let m11 = this.abs(bA.sin * bB.sin + bA.cos * bB.cos);

        // Box A faces
        let fAx = this.abs(dax) - bA.hw - (m00 * bB.hw + m10 * bB.hh);
        let fAy = this.abs(day) - bA.hh - (m01 * bB.hw + m11 * bB.hh);
        if (fAx > 0.0 || fAy > 0.0) return;

        // Box B faces
        let fBx = this.abs(dbx) - bB.hw - (m00 * bA.hw + m01 * bA.hh);
        let fBy = this.abs(dby) - bB.hh - (m10 * bA.hw + m11 * bA.hh);
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
                front = bA.px * fnx + bA.py * fny + bA.hw;
                snx = -bA.sin;
                sny = bA.cos;
                side = bA.px * snx + bA.py * sny;
                negSide = -side + bA.hh;
                posSide = side + bA.hh;
                this.computeIncidentEdge(this.ie, bB, fnx, fny);
                break;
            case 1:
                fnx = nx;
                fny = ny;
                front = bA.px * fnx + bA.py * fny + bA.hh;
                snx = bA.cos;
                sny = bA.sin;
                side = bA.px * snx + bA.py * sny;
                negSide = -side + bA.hw;
                posSide = side + bA.hw;
                this.computeIncidentEdge(this.ie, bB, fnx, fny);
                break;
            case 2:
                fnx = -nx;
                fny = -ny;
                front = bB.px * fnx + bB.py * fny + bB.hw;
                snx = -bB.sin;
                sny = bB.cos;
                side = bB.px * snx + bB.py * sny;
                negSide = -side + bB.hh;
                posSide = side + bB.hh;
                this.computeIncidentEdge(this.ie, bA, fnx, fny);
                break;
            case 3:
                fnx = -nx;
                fny = -ny;
                front = bB.px * fnx + bB.py * fny + bB.hh;
                snx = bB.cos;
                sny = bB.sin;
                side = bB.px * snx + bB.py * sny;
                negSide = -side + bB.hw;
                posSide = side + bB.hw;
                this.computeIncidentEdge(this.ie, bA, fnx, fny);
                break;
        }

        // clip other face with 5 box planes (1 face plane, 4 edge planes)

        // Clip to box side 1
        if (this.clipSegmentToLine(this.c1, this.ie, -snx, -sny, negSide) < 2) return;

        // Clip to negative box side 1
        if (this.clipSegmentToLine(this.c2, this.c1, snx, sny, posSide) < 2) return;

        // Now clipPoints2 contains the clipping points.
        // Due to roundoff, it is possible that clipping removes all points.

        let i, cpx, cpy, ct;
        let friction = Math.sqrt(bA.friction * bB.friction);

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
                    ct = new Contact(this);
                    this.contacts.push(ct);
                    this.maxContacts++;
                }

                // update contact and pre-step
                ct.update(bA, bB, separation, nx, ny, friction, cpx - fnx * separation, cpy - fny * separation);

                this.numContacts++;
            }
        }
    }

    clipSegmentToLine(vO, vI, nx, ny, offset) {
        // Start with no output points
        let numOut = 0;

        // Calculate the distance of end points to the line
        let distance0 = nx * vI[0] + ny * vI[1] - offset;
        let distance1 = nx * vI[2] + ny * vI[3] - offset;

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
            let interp = distance0 / (distance0 - distance1);
            vO[numOut * 2] = vI[0] + interp * (vI[2] - vI[0]);
            vO[numOut * 2 + 1] = vI[1] + interp * (vI[3] - vI[1]);
            ++numOut;
        }

        return numOut;
    }

    computeIncidentEdge(ie, b, nx, ny) {
        // The normal is from the reference box. Convert it
        // to the incident boxe's frame and flip sign.

        let nrx = -(b.cos * nx + b.sin * ny);
        let nry = -(-b.sin * nx + b.cos * ny);

        if (this.abs(nrx) > this.abs(nry)) {
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

        ie[0] = b.px + b.cos * x - b.sin * y;
        ie[1] = b.py + b.sin * x + b.cos * y;

        x = ie[2];
        y = ie[3];

        ie[2] = b.px + b.cos * x - b.sin * y;
        ie[3] = b.py + b.sin * x + b.cos * y;
    }
}

class Canvas {
    constructor(resx, resy) {
        this.elem = document.createElement('canvas');
        this.resx = resx;
        this.resy = resy;
        this.left = 0;
        this.top = 0;

        this.ctx = this.elem.getContext('2d');
        document.body.appendChild(this.elem);
        this.resize();
        window.addEventListener('resize', () => this.resize(), false);

        if (!this.ctx.setLineDash) {
            this.ctx.setLineDash = function () {};
        }
    }

    resize() {
        let o = this.elem;
        this.width = this.elem.width = this.resx;
        this.height = this.elem.height = this.resy;
        for (this.left = 0, this.top = 0; o != null; o = o.offsetParent) {
            this.left += o.offsetLeft;
            this.top += o.offsetTop;
        }
    }
}

class Pointer {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;
        this.canvas = canvas;

        window.addEventListener('mousemove', e => this.move(e), false);
        canvas.elem.addEventListener('touchmove', e => this.move(e), false);
    }

    move(e) {
        let touchMode = e.targetTouches,
            pointer;
        if (touchMode) {
            e.preventDefault();
            pointer = touchMode[0];
        } else pointer = e;
        this.x = ((-this.canvas.left + pointer.clientX) * this.canvas.resx) / this.canvas.elem.offsetWidth;
        this.y = ((-this.canvas.top + pointer.clientY) * this.canvas.resy) / this.canvas.elem.offsetHeight;
    }
}

let canvas = new Canvas(1200, 600);
let ctx = canvas.ctx;
let pointer = new Pointer(canvas);

function run() {
    requestAnimationFrame(run);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1.5;
    world.step();
}

// init the world
function init() {
    let timeStep = 1 / 30;

    world = new World({
        gravity: 40,
        iterations: 20,
        timeStep: timeStep,
        friction: 0.3,
        allowedPenetration: 0.05,
        biasFactor: 0.2,
        relativeTol: 0.95,
        absoluteTol: 0.01,
    });

    // ground
    let ground = world.addBody({
        x: 600,
        y: 649,
        w: 1200,
        h: 100,
        mass: Infinity,
        friction: 3.8,
        visible: false,
    });

    // side walls
    world.addBody({
        x: -50,
        y: 0,
        w: 100,
        h: 1200,
        mass: Infinity,
        friction: 3.8,
        visible: false,
    });
    world.addBody({
        x: 1250,
        y: 0,
        w: 100,
        h: 1200,
        mass: Infinity,
        friction: 3.8,
        visible: false,
    });

    // lot of small boxes
    for (let i = 0; i < 30; i++) {
        for (let j = 0; j < 10; j++) {
            world.addBody({
                x: 350 + i * 16,
                y: -200 + j * 16,
                w: 12,
                h: 12,
                mass: 5,
                vy: -150 + j,
                color: '#f80',
            });
        }
    }

    // A suspension bridge
    let numPlanks = 15;
    let mass = 50.0;
    let frequencyHz = 0.8;
    let dampingRatio = 0.7;
    // frequency in radians
    let omega = 2.0 * Math.PI * frequencyHz;
    // damping coefficient
    let d = 2.0 * mass * dampingRatio * omega;
    // spring stifness
    let k = mass * omega * omega;
    // magic formulas
    let softness = 1.0 / (d + timeStep * k);
    let biasFactor = (timeStep * k) / (d + timeStep * k);

    let p = ground,
        b;
    for (let i = 0; i < numPlanks; ++i) {
        b = world.addBody({
            x: 250 + 50 * i,
            y: 200,
            w: 45,
            h: 12,
            mass: mass,
            friction: 1,
            color: '#888',
        });
        if (p) {
            world.addJoint({
                b1: b,
                b2: p,
                ax: -50 + 250 + 50 * i,
                ay: 200,
                softness: softness,
                biasFactor: biasFactor,
            });
        }
        p = b;
    }
    world.addJoint({
        b1: b,
        b2: ground,
        ax: 250 + 50 * numPlanks,
        ay: 200,
        softness: softness,
        biasFactor: biasFactor,
    });

    // 2 Pendulum
    for (let i = 200; i <= 1000; i += 800) {
        let bb = world.addBody({ x: i, y: 300, w: 50, h: 50, mass: 40 });
        let bc = world.addBody({ x: i, y: 400, w: 50, h: 50, mass: 40 });
        world.addJoint({ b1: bb, b2: ground, ax: i, ay: 200 });
        world.addJoint({ b1: bc, b2: bb, ax: i, ay: 300 });
        bc.vx = 100 * Math.random() - 50;
    }

    world.addBody({ x: 400, y: 0, w: 50, h: 50, mass: 100 });
    world.addBody({ x: 600, y: 0, w: 50, h: 50, mass: 100 });
    world.addBody({ x: 800, y: 0, w: 50, h: 50, mass: 100 });
}

// let's start
let world;
init();
run();

// add more box on click / touch
window.addEventListener('mousedown', e => down(e), false);
window.addEventListener('touchstart', e => down(e), false);

function down(e) {
    pointer.move(e);
    e.preventDefault();
    let bc = world.addBody({
        x: pointer.x,
        y: pointer.y,
        w: boxSize,
        h: boxSize,
        mass: mass,
        gravity: grav,
        color: color,
    });
}

// some options
let boxSize, color, grav, mass;
radio(document.getElementById('large'));

function radio(b) {
    switch (b.value) {
        case 'large':
            boxSize = 50;
            color = '#FFF';
            grav = 50;
            mass = 100;
            break;
        case 'small':
            boxSize = 12;
            color = '#f80';
            grav = 50;
            mass = 40;
            break;
        case 'antigravity':
            boxSize = 12;
            color = '#08f';
            grav = -50;
            mass = 20;
            break;
    }

    return false;
}
