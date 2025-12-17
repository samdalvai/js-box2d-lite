/*
 * Ported to JavaScript from Box2D Lite
 * Original work Copyright (c) 2006-2007 Erin Catto
 * http://www.gphysics.com
 *
 * See LICENSE file for full license text.
 */
import Vec2 from '../math/Vec2';
import { Arbiter, ArbiterKey } from './Arbiter';
import Body from './Body';
import Joint from './Joint';

export default class World {
    bodies: Body[] = [];
    joints: Joint[] = [];

    arbiters: Map<number, Arbiter> = new Map();
    activeKeys = new Set<number>();

    gravity: Vec2;
    iterations: number;

    static accumulateImpulses = true;
    static warmStarting = true;
    static positionCorrection = true;
    static debugContacts = false;

    constructor(gravity: Vec2, iterations: number) {
        this.gravity = gravity;
        this.iterations = iterations;
    }

    add(body: Body): void;
    add(joint: Joint): void;

    add(element: Body | Joint): void {
        if (element instanceof Body) {
            this.bodies.push(element);
        } else if (element instanceof Joint) {
            this.joints.push(element);
        } else {
            throw new Error('Invalid argument');
        }
    }

    clear = (): void => {
        this.bodies.length = 0;
        this.joints.length = 0;
        this.arbiters.clear();
    };

    broadPhase = () => {
        // O(n^2) broad-phase
        for (let i = 0; i < this.bodies.length; i++) {
            const bi = this.bodies[i];

            for (let j = i + 1; j < this.bodies.length; j++) {
                const bj = this.bodies[j];

                if (bi.invMass || bj.invMass) {
                    const ab = Vec2.sub(bj.position, bi.position);
                    const radiusSum = bi.radius + bj.radius;

                    // Broad check radius of bodies, if boxes are farther apart than the sum of their
                    // radius they cannot be colliding
                    if (ab.lengthSquared() > radiusSum * radiusSum) {
                        continue;
                    }

                    const newArb = new Arbiter(bi, bj);
                    const key = ArbiterKey.getKey(bi, bj);
                    this.activeKeys.add(key);

                    if (newArb.numContacts > 0) {
                        if (!this.arbiters.has(key)) {
                            this.arbiters.set(key, newArb);
                        } else {
                            this.arbiters.get(key)!.update(newArb.contacts, newArb.numContacts);
                        }
                    } else {
                        this.arbiters.delete(key);
                    }
                }
            }
        }

        // Remove stale arbiters
        for (const key of this.arbiters.keys()) {
            if (!this.activeKeys.has(key)) {
                this.arbiters.delete(key);
            }
        }

        this.activeKeys.clear();
    };

    step = (deltaTime: number) => {
        const invDt = deltaTime > 0.0 ? 1.0 / deltaTime : 0.0;

        // Determine overlapping bodies and update contact points.
        this.broadPhase();

        // Integrate forces.
        for (let i = 0; i < this.bodies.length; i++) {
            const b = this.bodies[i];

            if (b.invMass === 0.0) {
                continue;
            }

            b.velocity.add(Vec2.scale(deltaTime, Vec2.add(this.gravity, Vec2.scale(b.invMass, b.force))));
            b.angularVelocity += deltaTime * b.invI * b.torque;
        }

        // Perform pre-steps.
        for (const arbiter of this.arbiters.values()) {
            arbiter.preStep(invDt);
        }

        for (const joint of this.joints) {
            joint.preStep(invDt);
        }

        // Perform iterations
        for (let i = 0; i < this.iterations; i++) {
            for (const arbiter of this.arbiters.values()) {
                arbiter.applyImpulse();
            }

            for (const joint of this.joints) {
                joint.applyImpulse();
            }
        }

        // Integrate Velocities
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].integrate(deltaTime);
        }
    };
}
