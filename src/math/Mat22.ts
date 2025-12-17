/*
 * Ported to JavaScript from Box2D Lite
 * Original work Copyright (c) 2006-2007 Erin Catto
 * http://www.gphysics.com
 *
 * See LICENSE file for full license text.
 */
import Vec2 from './Vec2';

export default class Mat22 {
    col1: Vec2;
    col2: Vec2;

    constructor();
    constructor(col1: Vec2, col2: Vec2);
    constructor(angle: number);

    constructor(a?: Vec2 | number, b?: Vec2) {
        if (a === undefined && !b) {
            this.col1 = new Vec2();
            this.col2 = new Vec2();
        } else if (typeof a === 'number' && !b) {
            const c = Math.cos(a);
            const s = Math.sin(a);

            this.col1 = new Vec2(c, s);
            this.col2 = new Vec2(-s, c);
        } else if (a instanceof Vec2 && b instanceof Vec2) {
            this.col1 = a;
            this.col2 = b;
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    transpose = (): Mat22 => {
        return new Mat22(new Vec2(this.col1.x, this.col2.x), new Vec2(this.col1.y, this.col2.y));
    };

    invert = (): Mat22 => {
        const a = this.col1.x;
        const b = this.col2.x;
        const c = this.col1.y;
        const d = this.col2.y;

        const m = new Mat22();
        let det = a * d - b * c;

        if (det === 0) {
            throw new Error('Determinant in 2x2 matrix cannot be 0');
        }

        det = 1 / det;

        m.col1.x = det * d;
        m.col1.y = -det * c;
        m.col2.x = -det * b;
        m.col2.y = det * a;

        return m;
    };

    /** Operator + */
    static add = (a: Mat22, b: Mat22): Mat22 => {
        return new Mat22(Vec2.add(a.col1, b.col1), Vec2.add(a.col2, b.col2));
    };

    /** Operator * for matrix-vector multiplication */
    static multiply(a: Mat22, v: Vec2): Vec2;

    /** Operator * for matrix-matrix multiplication */
    static multiply(a: Mat22, b: Mat22): Mat22;

    static multiply(a: Mat22, b: Mat22 | Vec2): Vec2 | Mat22 {
        if (a instanceof Mat22 && b instanceof Mat22) {
            return new Mat22(Mat22.multiply(a, b.col1), Mat22.multiply(a, b.col2));
        }

        if (a instanceof Mat22 && b instanceof Vec2) {
            return new Vec2(a.col1.x * b.x + a.col2.x * b.y, a.col1.y * b.x + a.col2.y * b.y);
        }

        throw new Error('Invalid arguments');
    }

    static abs = (a: Mat22): Mat22 => {
        return new Mat22(Vec2.abs(a.col1), Vec2.abs(a.col2));
    };
}
