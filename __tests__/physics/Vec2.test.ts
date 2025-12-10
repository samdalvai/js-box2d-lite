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
});
