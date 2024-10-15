var Hypergeometric = (function () {
    "use strict";

    /** @typedef {number} Integer */

    const PMF_DIGITS = 5;
    const PMF_SCALE_DOWN = Math.pow(10, PMF_DIGITS);
    const PMF_SCALE_UP = BigInt(PMF_SCALE_DOWN);


    /** @type {(n: Integer) => Bigint} */
    const factorial = (n) => {
        let output = 1n;
        for (let mul = 2n; mul <= n; mul += 1n) {
            output *= mul;
        }
        return output
    }

    // n choose k
    /** @type {(n: Integer, k: Integer) => Bigint} */
    const choose = (n, k) => factorial(n)/(factorial(k) * factorial(n - k));

    /*
     * Probability Mass Function
     * N is the population size,
     * K is the number of success states in the population,
     * n is the number of draws (i.e. quantity drawn in each trial),
     * k is the number of observed successes,
     */
    /** @type {(N: Integer, K: Integer, n: Integer, k: Integer) => number} */
    const pmf = (N, K, n, k) => {
        if (k > N || k > K) { return 0 }

        return Number(PMF_SCALE_UP * (choose(K, k) * choose(N - K, n - k)) / choose(N, n)) / PMF_SCALE_DOWN;
    };

    // https://stackoverflow.com/a/6422061
    function multiply_uint32(a, b) {
        var ah = (a >> 16) & 0xffff, al = a & 0xffff;
        var bh = (b >> 16) & 0xffff, bl = b & 0xffff;
        var high = ((ah * bl) + (al * bh)) & 0xffff;
        return ((high << 16)>>>0) + (al * bl);
    }

    const calculateSlotSizeInBits = (classCounts, drawCount) => {
        const maxToStore = classCounts.reduce((a, b) => Math.max(a, b), Math.max(drawCount, 1));

        // LUT based log base 2
        // https://stackoverflow.com/a/11398748
        const tab32 = [
             0,  9,  1, 10, 13, 21,  2, 29,
            11, 14, 16, 18, 22, 25,  3, 30,
             8, 12, 20, 28, 15, 17, 24,  7,
            19, 27, 23,  6, 26,  5,  4, 31
        ];

        let value = maxToStore;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;

        const logBase2 = tab32[multiply_uint32(value, 0x07C4ACDD) >>> 27];

        return logBase2 + 1;
    }

    const uniqueDraws = (classCounts, drawCount) => {
        const slotSizeInBits = calculateSlotSizeInBits(classCounts, drawCount);

        return uniqueDrawsHelper(classCounts, drawCount, new Map(), slotSizeInBits);
    }

    const uniqueDrawsHelper = (classCounts, drawCount, uniqueDrawsMemo, slotSizeInBits) => {
        if (drawCount <= 0) {
            return 1;
        }

        if (drawCount === 1) {
            return classCounts.length;
        }

        const key = toKey(classCounts, drawCount, slotSizeInBits);

        const memoized = uniqueDrawsMemo.get(key);

        if (memoized !== undefined) {
            return memoized;
        }

        let total = 0;
        for (let i = 0; i < classCounts.length; i += 1) {
            const afterDraw = []
            for (let j = i; j < classCounts.length; j += 1) {
                let count = classCounts[j];

                if (i === j) {
                    count -= 1;
                }

                if (count > 0) {
                    afterDraw.push(count);
                }
            }

            total += uniqueDrawsHelper(afterDraw, drawCount - 1, uniqueDrawsMemo, slotSizeInBits);
        }

        uniqueDrawsMemo.set(key, total);

        return total;
    };

    const toKey = (classCounts, drawCount, slotSizeInBits) => {
        // BigInt based keys that place the numbers on slots large enough to fit the max value of the given array.
        // Pass down the slot size in bits to accomodate that
        // [..., a[2], a[1], a[0], drawCount, slot size in bits]
        let key = 0n;

        const shift = BigInt(slotSizeInBits);

        for (let i = classCounts.length - 1; i >= 0; i -= 1) {
            key |= BigInt(classCounts[i]);
            key <<= shift;
        }

        key |= BigInt(drawCount);
        key <<= shift;

        key |= shift;

        return key;

        //~ //return JSON.stringify([classCounts, drawCount, slotSizeInBits]);
    }

    return {
        PMF_DIGITS,
        choose,
        factorial,
        pmf,
        uniqueDraws,
        calculateSlotSizeInBits
    };
}())
