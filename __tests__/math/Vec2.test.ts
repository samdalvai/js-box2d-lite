import Vec2 from '../../src/math/Vec2';

describe('Vec2', () => {
    test('constructor initializes values', () => {
        const v = new Vec2(3, 4);
        expect(v.x).toBe(3);
        expect(v.y).toBe(4);
    });

    test('constructor defaults to 0,0', () => {
        const v = new Vec2();
        expect(v.x).toBe(0);
        expect(v.y).toBe(0);
    });

    test('set() sets vector values in place', () => {
        const v = new Vec2(1, 2);
        v.set(2, 3);

        expect(v.x).toBe(2);
        expect(v.y).toBe(3);
    });

    test('add() adds vector values', () => {
        const v = new Vec2(1, 2);
        v.add(new Vec2(3, 4));
        expect(v.x).toBe(4);
        expect(v.y).toBe(6);
    });

    test('sub() subtracts vector values', () => {
        const v = new Vec2(5, 5);
        v.sub(new Vec2(2, 3));
        expect(v.x).toBe(3);
        expect(v.y).toBe(2);
    });

    test('scale() multiplies vector components', () => {
        const v = new Vec2(2, 3);
        v.scale(2);
        expect(v.x).toBe(4);
        expect(v.y).toBe(6);
    });

    test('length() returns correct length', () => {
        const v = new Vec2(3, 4);
        expect(v.length()).toBe(5);
    });

    test('dot() returns dot product between two vectors', () => {
        const v1 = new Vec2(2, 2);
        const v2 = new Vec2(2, 2);

        expect(Vec2.dot(v1, v2)).toBe(8);
    });

    test('cross() returns scalar 2D cross product between two vectors', () => {
        const v1 = new Vec2(1, 1);
        const v2 = new Vec2(1, 2);

        expect(Vec2.cross(v1, v2)).toBe(1);
    });

    test('cross() returns vector in the +90° (counterclockwise) perpendicular direction scaled by a', () => {
        const v1 = new Vec2(1, 2);
        const a = 2;

        const result = Vec2.cross(v1, a);
        expect(result.x).toBe(4);
        expect(result.y).toBe(-2);
    });

    test('cross() returns vector in the -90° (clockwise) perpendicular direction scaled by a', () => {
        const v1 = new Vec2(1, 2);
        const a = 2;

        const result = Vec2.cross(a, v1);
        expect(result.x).toBe(-4);
        expect(result.y).toBe(2);
    });

    test('add() should add two vectors', () => {
        const v1 = new Vec2(2, 2);
        const v2 = new Vec2(2, 2);

        const result = Vec2.add(v1, v2);
        expect(result.x).toBe(4);
        expect(result.y).toBe(4);
    });

    test('sub() should subtract two vectors', () => {
        const v1 = new Vec2(2, 2);
        const v2 = new Vec2(1, 1);

        const result = Vec2.sub(v1, v2);
        expect(result.x).toBe(1);
        expect(result.y).toBe(1);
    });

    test('scale() should scale a vector', () => {
        const v1 = new Vec2(1, 1);

        const result = Vec2.scale(2, v1);
        expect(result.x).toBe(2);
        expect(result.y).toBe(2);
    });

    test('abs() should return the vector with positive sign', () => {
        const v1 = new Vec2(-1, -1);

        const result = Vec2.abs(v1);
        expect(result.x).toBe(1);
        expect(result.y).toBe(1);
    });
});
