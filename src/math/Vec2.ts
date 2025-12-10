export default class Vec2 {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

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

    length = (): number => {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
}
