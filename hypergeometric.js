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

    return {
        PMF_DIGITS,
        choose,
        factorial,
        pmf
    };
}())
