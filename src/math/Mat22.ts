import Vec2 from './Vec2';

export default class Mat22 {
    col1: Vec2;
    col2: Vec2;

    constructor(col1 = new Vec2(), col2 = new Vec2()) {
        this.col1 = col1;
        this.col2 = col2;
    }

    /** Constructor overloading for angular matrix */
    fromAngle = (angle: number): Mat22 => {
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        const col1 = new Vec2(c, s);
        const col2 = new Vec2(-s, c);

        return new Mat22(col1, col2);
    };

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
