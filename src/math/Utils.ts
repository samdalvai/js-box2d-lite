import Vec2 from './Vec2';

// TODO: put as static helper methods to Vec2 or Mat22
export default class Utils {
    static dot = (a: Vec2, b: Vec2): number => {
        return a.x * b.x + a.y * b.y;
    };

    static cross = (a: Vec2, b: Vec2): number => {
        return a.x * b.y - a.y * b.x;
    };
}

/*

// TODO: create a better name
inline float Cross(const Vec2& a, const Vec2& b)
{
	return a.x * b.y - a.y * b.x;
}

// TODO: create a better name
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

inline Mat22 operator + (const Mat22& A, const Mat22& B)
{
	return Mat22(A.col1 + B.col1, A.col2 + B.col2);
}

inline Mat22 operator * (const Mat22& A, const Mat22& B)
{
	return Mat22(A * B.col1, A * B.col2);
}

inline float Abs(float a)
{
	return a > 0.0f ? a : -a;
}

inline Vec2 Abs(const Vec2& a)
{
	return Vec2(fabsf(a.x), fabsf(a.y));
}

inline Mat22 Abs(const Mat22& A)
{
	return Mat22(Abs(A.col1), Abs(A.col2));
}

inline float Sign(float x)
{
	return x < 0.0f ? -1.0f : 1.0f;
}

inline float Min(float a, float b)
{
	return a < b ? a : b;
}

inline float Max(float a, float b)
{
	return a > b ? a : b;
}

inline float Clamp(float a, float low, float high)
{
	return Max(low, Min(a, high));
}

template<typename T> inline void Swap(T& a, T& b)
{
	T tmp = a;
	a = b;
	b = tmp;
}

// Random number in range [-1,1]
inline float Random()
{
	float r = (float)rand();
	r /= RAND_MAX;
	r = 2.0f * r - 1.0f;
	return r;
}

inline float Random(float lo, float hi)
{
	float r = (float)rand();
	r /= RAND_MAX;
	r = (hi - lo) * r + lo;
	return r;
}
*/
