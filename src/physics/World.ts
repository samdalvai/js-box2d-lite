import Vec2 from '../math/Vec2';
import { Arbiter, ArbiterKey } from './Arbiter';
import Body from './Body';
import Joint from './Joint';

export default class World {
    bodies: Body[] = [];
    joints: Joint[] = [];

    arbiters: Map<number, Arbiter> = new Map();

    gravity: Vec2;
    iterations: number;

    static accumulateImpulses = true;
    static warmStarting = true;
    static positionCorrection = true;
    static debugContacts = false;

    numChecks = 0;

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
                    this.numChecks++;

                    const newArb = new Arbiter(bi, bj);
                    const key = ArbiterKey.getKey(bi, bj);

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
    };

    step = (dt: number) => {
        const invDt = dt > 0.0 ? 1.0 / dt : 0.0;

        // Determine overlapping bodies and update contact points.
        this.broadPhase();
        console.log('Num checks: ', this.numChecks);
        this.numChecks = 0;

        // Integrate forces.
        for (let i = 0; i < this.bodies.length; i++) {
            const b = this.bodies[i];

            if (b.invMass === 0.0) {
                continue;
            }

            b.velocity.add(Vec2.scale(dt, Vec2.add(this.gravity, Vec2.scale(b.invMass, b.force))));
            b.angularVelocity += dt * b.invI * b.torque;
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
            const b = this.bodies[i];

            b.position.add(Vec2.scale(dt, b.velocity));
            b.rotation += dt * b.angularVelocity;

            b.force.set(0, 0);
            b.torque = 0.0;
        }
    };
}
