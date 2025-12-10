import Mat22 from '../../src/math/Mat22';
import Vec2 from '../../src/math/Vec2';

describe('Mat22', () => {
    test('constructor defaults to 0,0 vectors', () => {
        const m = new Mat22();

        expect(m.col1.x).toBe(0);
        expect(m.col1.y).toBe(0);
        expect(m.col2.x).toBe(0);
        expect(m.col2.y).toBe(0);
    });

    test('constructor initializes columns correctly', () => {
        const v1 = new Vec2(1, 2);
        const v2 = new Vec2(3, 4);

        const m = new Mat22(v1, v2);

        expect(m.col1.x).toBe(1);
        expect(m.col1.y).toBe(2);
        expect(m.col2.x).toBe(3);
        expect(m.col2.y).toBe(4);
    });

    test('constructor creates correct rotation matrix', () => {
        const angle = Math.PI / 4; // 45 degrees
        const m = new Mat22(angle);

        const c = Math.cos(angle);
        const s = Math.sin(angle);

        expect(m.col1.x).toBeCloseTo(c);
        expect(m.col1.y).toBeCloseTo(s);
        expect(m.col2.x).toBeCloseTo(-s);
        expect(m.col2.y).toBeCloseTo(c);
    });

    test('constructor creates correct rotation matrix if rotation is 0', () => {
        const angle = 0;
        const m = new Mat22(angle);

        expect(m.col1.x).toBe(1);
        expect(m.col1.y).toBe(0);
        expect(m.col2.x).toBe(-0);
        expect(m.col2.y).toBe(1);
    });

    test('transpose swaps rows and columns', () => {
        const m = new Mat22(
            new Vec2(1, 2), // col1
            new Vec2(3, 4), // col2
        );

        const t = m.transpose();

        expect(t.col1.x).toBe(1);
        expect(t.col1.y).toBe(3);
        expect(t.col2.x).toBe(2);
        expect(t.col2.y).toBe(4);
    });

    test('invert computes correct inverse of a 2x2 matrix', () => {
        // Matrix:
        // [ a b ] = [ 4  7 ]
        // [ c d ]   [ 2  6 ]
        //
        // Inverse is:
        // 1/det * [  d -b ]
        //          [ -c  a ]
        //
        // det = 4*6 - 7*2 = 24 - 14 = 10

        const m = new Mat22(new Vec2(4, 2), new Vec2(7, 6));

        const inv = m.invert();

        expect(inv.col1.x).toBeCloseTo(6 / 10);
        expect(inv.col1.y).toBeCloseTo(-2 / 10);
        expect(inv.col2.x).toBeCloseTo(-7 / 10);
        expect(inv.col2.y).toBeCloseTo(4 / 10);
    });

    test('invert throws when determinant is zero', () => {
        // Matrix with det = 0:
        // [ 1 2 ]
        // [ 2 4 ]
        const m = new Mat22(new Vec2(1, 2), new Vec2(2, 4));

        expect(() => m.invert()).toThrow('Determinant in 2x2 matrix cannot be 0');
    });

    test('add() should add 2 2x2 matrices', () => {
        const a1 = new Mat22(new Vec2(2, 1), new Vec2(3, 4));
        const a2 = new Mat22(new Vec2(2, 1), new Vec2(3, 4));

        const result = Mat22.add(a1, a2);
        expect(result.col1.x).toBe(4);
        expect(result.col1.y).toBe(2);
        expect(result.col2.x).toBe(6);
        expect(result.col2.y).toBe(8);
    });

    test('multiply() should multiply a 2x2 matrix by a vector and return a 2x1 vector', () => {
        const a1 = new Mat22(new Vec2(2, 1), new Vec2(3, 4));
        const v1 = new Vec2(5, 6);

        const result = Mat22.multiply(a1, v1);
        expect(result.x).toBe(28);
        expect(result.y).toBe(29);
    });

    test('multiply() should multiply 2 2x2 matrices and return a 2x2 matrix', () => {
        const a1 = new Mat22(new Vec2(1, 3), new Vec2(2, 4));
        const a2 = new Mat22(new Vec2(5, 7), new Vec2(6, 8));

        const result = Mat22.multiply(a1, a2);
        expect(result.col1.x).toBe(19);
        expect(result.col1.y).toBe(43);
        expect(result.col2.x).toBe(22);
        expect(result.col2.y).toBe(50);
    });

    test('abs() should return the matrix with positive sign', () => {
        const a1 = new Mat22(new Vec2(-1, -3), new Vec2(-2, -4));

        const result = Mat22.abs(a1);
        expect(result.col1.x).toBe(1);
        expect(result.col1.y).toBe(3);
        expect(result.col2.x).toBe(2);
        expect(result.col2.y).toBe(4);
    });
});
