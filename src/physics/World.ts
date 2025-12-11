import Vec2 from '../math/Vec2';
import { Arbiter, ArbiterKey } from './Arbiter';
import Body from './Body';
import Joint from './Joint';

export default class World {
    bodies: Body[] = [];
    joints: Joint[] = [];
    arbiters: Map<ArbiterKey, Arbiter> = new Map();

    gravity: Vec2;
    iterations: number;

    static accumulateImpulses = true;
    static warmStarting = true;
    static positionCorrection = true;

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

                if (bi.invMass === 0 && bj.invMass === 0) {
                    continue;
                }

                const newArb = new Arbiter(bi, bj);
                const key = new ArbiterKey(bi, bj);

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
    };

    step = (dt: number) => {
        //
    };
}

/*


void World::BroadPhase()
{
	// O(n^2) broad-phase
	for (int i = 0; i < (int)bodies.size(); ++i)
	{
		Body* bi = bodies[i];

		for (int j = i + 1; j < (int)bodies.size(); ++j)
		{
			Body* bj = bodies[j];

			if (bi->invMass == 0.0f && bj->invMass == 0.0f)
				continue;

			Arbiter newArb(bi, bj);
			ArbiterKey key(bi, bj);

			if (newArb.numContacts > 0)
			{
				ArbIter iter = arbiters.find(key);
				if (iter == arbiters.end())
				{
					arbiters.insert(ArbPair(key, newArb));
				}
				else
				{
					iter->second.Update(newArb.contacts, newArb.numContacts);
				}
			}
			else
			{
				arbiters.erase(key);
			}
		}
	}
}

void World::Step(float dt)
{
	float inv_dt = dt > 0.0f ? 1.0f / dt : 0.0f;

	// Determine overlapping bodies and update contact points.
	BroadPhase();

	// Integrate forces.
	for (int i = 0; i < (int)bodies.size(); ++i)
	{
		Body* b = bodies[i];

		if (b->invMass == 0.0f)
			continue;

		b->velocity += dt * (gravity + b->invMass * b->force);
		b->angularVelocity += dt * b->invI * b->torque;
	}

	// Perform pre-steps.
	for (ArbIter arb = arbiters.begin(); arb != arbiters.end(); ++arb)
	{
		arb->second.PreStep(inv_dt);
	}

	for (int i = 0; i < (int)joints.size(); ++i)
	{
		joints[i]->PreStep(inv_dt);	
	}

	// Perform iterations
	for (int i = 0; i < iterations; ++i)
	{
		for (ArbIter arb = arbiters.begin(); arb != arbiters.end(); ++arb)
		{
			arb->second.ApplyImpulse();
		}

		for (int j = 0; j < (int)joints.size(); ++j)
		{
			joints[j]->ApplyImpulse();
		}
	}

	// Integrate Velocities
	for (int i = 0; i < (int)bodies.size(); ++i)
	{
		Body* b = bodies[i];

		b->position += dt * b->velocity;
		b->rotation += dt * b->angularVelocity;

		b->force.Set(0.0f, 0.0f);
		b->torque = 0.0f;
	}
}


*/
