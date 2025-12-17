/*
 * Ported to JavaScript from Box2D Lite
 * Original work Copyright (c) 2006-2007 Erin Catto
 * http://www.gphysics.com
 *
 * See LICENSE file for full license text.
 */
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
