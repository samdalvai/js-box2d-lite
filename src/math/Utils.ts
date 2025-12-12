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
