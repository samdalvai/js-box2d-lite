export default class Vec2 {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone = (): Vec2 => {
        return new Vec2(this.x, this.y);
    };

    set = (x: number, y: number): void => {
        this.x = x;
        this.y = y;
    };

    /** Operator - */
    negate = (): Vec2 => {
        return new Vec2(-this.x, -this.y);
    };

    /** Operator += */
    add = (v: Vec2): void => {
        this.x += v.x;
        this.y += v.y;
    };

    /** Operator -= */
    sub = (v: Vec2): void => {
        this.x -= v.x;
        this.y -= v.y;
    };

    /** Operator *= */
    scale = (a: number): void => {
        this.x *= a;
        this.y *= a;
    };

    /** Magnitude of the Vector */
    length = (): number => {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    /** Dot product between two vectors */
    static dot = (a: Vec2, b: Vec2): number => {
        return a.x * b.x + a.y * b.y;
    };

    /** Scalar 2D cross product */
    static cross(a: Vec2, b: Vec2): number;

    /** Vector in the +90° (counterclockwise) perpendicular direction scaled by a */
    static cross(a: Vec2, s: number): Vec2;

    /** Vector in the -90° (clockwise) perpendicular direction scaled by a */
    static cross(s: number, a: Vec2): Vec2;

    static cross(a: Vec2 | number, b: Vec2 | number): number | Vec2 {
        if (a instanceof Vec2 && b instanceof Vec2) {
            return a.x * b.y - a.y * b.x;
        }

        if (a instanceof Vec2 && typeof b === 'number') {
            return new Vec2(b * a.y, -b * a.x);
        }

        if (typeof a === 'number' && b instanceof Vec2) {
            return new Vec2(-a * b.y, a * b.x);
        }

        throw new Error('Invalid arguments');
    }

    /** Operator + */
    static add = (a: Vec2, b: Vec2): Vec2 => {
        return new Vec2(a.x + b.x, a.y + b.y);
    };

    /** Operator - */
    static sub = (a: Vec2, b: Vec2): Vec2 => {
        return new Vec2(a.x - b.x, a.y - b.y);
    };

    /** Operator * */
    static scale = (s: number, v: Vec2): Vec2 => {
        return new Vec2(s * v.x, s * v.y);
    };

    static abs = (a: Vec2): Vec2 => {
        return new Vec2(Math.abs(a.x), Math.abs(a.y));
    };
}
