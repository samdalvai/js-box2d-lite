import Vec2 from '../../src/math/Vec2';
import Body from '../../src/physics/Body';

describe('Body', () => {
    test('constructor initializes default values', () => {
        const body = new Body();

        expect(body.position.x).toBe(0);
        expect(body.position.y).toBe(0);
        expect(body.rotation).toBe(0);
        expect(body.velocity.x).toBe(0);
        expect(body.velocity.y).toBe(0);
        expect(body.angularVelocity).toBe(0);
        expect(body.force.x).toBe(0);
        expect(body.force.y).toBe(0);
        expect(body.torque).toBe(0);
        expect(body.friction).toBe(0.2);

        expect(body.width.x).toBe(0);
        expect(body.width.y).toBe(0);

        expect(body.mass).toBe(Number.MAX_VALUE);
        expect(body.invMass).toBe(0);
        expect(body.I).toBe(Number.MAX_VALUE);
        expect(body.invI).toBe(0);
    });

    test('body id is correctly increased when new body is created', () => {
        const body1 = new Body();
        const body2 = new Body();

        expect(body1.id).toBe(1);
        expect(body2.id).toBe(2);
    });

    test('set() updates width, mass, and computes inertia when mass is finite', () => {
        const body = new Body();
        const w = new Vec2(2, 3);
        const m = 12;

        body.set(w, m);

        // Position, velocity, force reset
        expect(body.position.x).toBe(0);
        expect(body.position.y).toBe(0);
        expect(body.velocity.x).toBe(0);
        expect(body.velocity.y).toBe(0);
        expect(body.force.x).toBe(0);
        expect(body.force.y).toBe(0);

        // Rotation and angular velocity reset
        expect(body.rotation).toBe(0);
        expect(body.angularVelocity).toBe(0);

        // Width and mass set
        expect(body.width).toBe(w);
        expect(body.mass).toBe(m);

        // Inverse mass
        expect(body.invMass).toBeCloseTo(1 / m);

        // Inertia I = mass * (width.x^2 + width.y^2)/12
        const expectedI = (m * (w.x * w.x + w.y * w.y)) / 12;
        expect(body.I).toBeCloseTo(expectedI);
        expect(body.invI).toBeCloseTo(1 / expectedI);
    });

    test('set() handles infinite mass correctly', () => {
        const body = new Body();
        const w = new Vec2(2, 3);
        const m = Number.MAX_VALUE;

        body.set(w, m);

        expect(body.mass).toBe(m);
        expect(body.invMass).toBe(0);
        expect(body.I).toBe(Number.MAX_VALUE);
        expect(body.invI).toBe(0);
    });

    test('addForce() accumulates forces', () => {
        const body = new Body();
        const f1 = new Vec2(1, 2);
        const f2 = new Vec2(-3, 4);

        body.addForce(f1);
        expect(body.force.x).toBe(f1.x);
        expect(body.force.y).toBe(f1.y);

        body.addForce(f2);
        expect(body.force.x).toBe(f1.x + f2.x);
        expect(body.force.y).toBe(f1.y + f2.y);
    });
});
