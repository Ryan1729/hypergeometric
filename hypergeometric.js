var Hypergeometric = (function () {
    "use strict";

    /** @typedef {number} Integer */

    /** @type {(n: Integer) => Integer} */
    const factorial = (n) => {
        let output = 1;
        for (let mul = 2; mul <= n; mul += 1) {
            output *= mul;
        }
        return output
    }

    // n choose k
    /** @type {(n: Integer, k: Integer) => Integer} */
    const choose = (n, k) => factorial(n)/(factorial(k) * factorial(n - k));

    /*
     * Probability Mass Function
     * N is the population size,
     * K is the number of success states in the population,
     * n is the number of draws (i.e. quantity drawn in each trial),
     * k is the number of observed successes,
     */
    /** @type {(n: Hours, divisor: Integer) => string} */
    const pmf = (N, K, n, k) => (choose(K, k) * choose(N - K, n - k)) / choose(N, n);

    return {
        choose,
        factorial,
        pmf
    };
}())
