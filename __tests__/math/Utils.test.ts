import Utils from '../../src/math/Utils';

describe('Utils', () => {
    test('clamp() value below low returns low', () => {
        expect(Utils.clamp(0, 5, 10)).toBe(5);
        expect(Utils.clamp(-100, 0, 50)).toBe(0);
    });

    test('clamp() value above high returns high', () => {
        expect(Utils.clamp(20, 5, 10)).toBe(10);
        expect(Utils.clamp(999, -5, 5)).toBe(5);
    });

    test('clamp() value inside range returns unchanged', () => {
        expect(Utils.clamp(7, 5, 10)).toBe(7);
        expect(Utils.clamp(0, -5, 5)).toBe(0);
        expect(Utils.clamp(-2, -5, 5)).toBe(-2);
    });

    test('clamp() value equal to low returns low', () => {
        expect(Utils.clamp(5, 5, 10)).toBe(5);
    });

    test('clamp() value equal to high returns high', () => {
        expect(Utils.clamp(10, 5, 10)).toBe(10);
    });

    test('clamp() low equal to high returns that value', () => {
        expect(Utils.clamp(0, 3, 3)).toBe(3);
        expect(Utils.clamp(100, 3, 3)).toBe(3);
    });

    test('clamp() handles reversed bounds (low > high) by behaving like Math.min/max do naturally', () => {
        expect(Utils.clamp(5, 10, 3)).toBe(10);
        expect(Utils.clamp(100, 10, 3)).toBe(10);
        expect(Utils.clamp(-50, 10, 3)).toBe(10);
    });

    test('random() returns a random value between 0 and 1', () => {
        for (let i = 0; i < 100; i++) {
            const rand = Utils.random();
            expect(rand).toBeLessThanOrEqual(1);
            expect(rand).toBeGreaterThanOrEqual(-1);
        }
    });

    test('random() returns a random value between low and high', () => {
        for (let i = 0; i < 100; i++) {
            const rand = Utils.random(-100, 100);
            expect(rand).toBeLessThanOrEqual(100);
            expect(rand).toBeGreaterThanOrEqual(-100);
        }
    });
});
