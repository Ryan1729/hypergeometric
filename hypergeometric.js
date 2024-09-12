var Hypergeometric = (function () {
    "use strict";

    /** @typedef {number} Integer */

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

        return Number(10000n * (choose(K, k) * choose(N - K, n - k)) / choose(N, n)) / 10000;
    };

    return {
        choose,
        factorial,
        pmf
    };
}())
