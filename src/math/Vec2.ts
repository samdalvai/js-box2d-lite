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

    static dot = (a: Vec2, b: Vec2): number => {
        return a.x * b.x + a.y * b.y;
    };

    /** Scalar 2D cross product */
    static cross = (a: Vec2, b: Vec2): number => {
        return a.x * b.y - a.y * b.x;
    };
}

/*
// Vector perpendicular to a, scaled
// This is the vector in the +90° (counterclockwise) perpendicular direction.
inline float Cross(const Vec2& a, const Vec2& b)
{
	return a.x * b.y - a.y * b.x;
}

// Vector perpendicular to a, scaled in the opposite direction
// This is the vector in the –90° (clockwise) perpendicular direction.
inline Vec2 Cross(const Vec2& a, float s)
{
	return Vec2(s * a.y, -s * a.x);
}

inline Vec2 Cross(float s, const Vec2& a)
{
	return Vec2(-s * a.y, s * a.x);
}

inline Vec2 operator * (const Mat22& A, const Vec2& v)
{
	return Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
}

inline Vec2 operator + (const Vec2& a, const Vec2& b)
{
	return Vec2(a.x + b.x, a.y + b.y);
}

inline Vec2 operator - (const Vec2& a, const Vec2& b)
{
	return Vec2(a.x - b.x, a.y - b.y);
}

inline Vec2 operator * (float s, const Vec2& v)
{
	return Vec2(s * v.x, s * v.y);
}
*/
