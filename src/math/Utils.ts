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

This is not needed, probable implementation would be

type Edges = {
  inEdge1: number;
  outEdge1: number;
  inEdge2: number;
  outEdge2: number;
};

type FeaturePair = {
  e: Edges;
  value?: number; // optional, could be computed separately
};

function flip(fp: FeaturePair): void {
  // Swap inEdge1 <-> inEdge2
  [fp.e.inEdge1, fp.e.inEdge2] = [fp.e.inEdge2, fp.e.inEdge1];

  // Swap outEdge1 <-> outEdge2
  [fp.e.outEdge1, fp.e.outEdge2] = [fp.e.outEdge2, fp.e.outEdge1];
}

See Collide.cpp and Arbiter.h

No swap should be needed

template<typename T> inline void Swap(T& a, T& b)
{
	T tmp = a;
	a = b;
	b = tmp;
}

*/
