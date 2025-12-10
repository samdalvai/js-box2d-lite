import Vec2 from './Vec2';

export default class Mat22 {
    col1: Vec2;
    col2: Vec2;

    constructor();
    constructor(col1: Vec2, col2: Vec2);
    constructor(angle: number);

    constructor(a?: Vec2 | number, b?: Vec2) {
        if (!a && !b) {
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

        const B = new Mat22();
        let det = a * d - b * c;

        if (det === 0) {
            throw new Error('Determinant in 2x2 matrix cannot be 0');
        }

        det = 1 / det;

        B.col1.x = det * d;
        B.col1.y = -det * c;
        B.col2.x = -det * b;
        B.col2.y = det * a;

        return B;
    };

    /** Operator * for matrix-vector multiplication */
    static multiply = (A: Mat22, v: Vec2): Vec2 => {
        return new Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
    };
}

/*

inline Mat22 operator + (const Mat22& A, const Mat22& B)
{
	return Mat22(A.col1 + B.col1, A.col2 + B.col2);
}

inline Mat22 operator * (const Mat22& A, const Mat22& B)
{
	return Mat22(A * B.col1, A * B.col2);
}

inline Mat22 Abs(const Mat22& A)
{
	return Mat22(Abs(A.col1), Abs(A.col2));
}
*/
