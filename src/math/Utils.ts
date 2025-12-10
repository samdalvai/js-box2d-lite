export default class Utils {
    static clamp = (value: number, low: number, high: number): number => {
        return Math.max(low, Math.min(value, high));
    };

    /** Random number in range [-1,1] */
    static random(): number;

    /** Random number in range [low,high] */
    static random(low: number, high: number): number;

    static random(low?: number, high?: number): number {
        if (low === undefined && high === undefined) {
            return Math.random() * 2 - 1;
        }

        if (low !== undefined && high !== undefined) {
            return Math.random() * (high - low) + low;
        }

        throw new Error('Invalid arguments');
    }
}

/*

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
