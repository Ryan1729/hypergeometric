"use strict";

const scriptStart = performance.now()

const fs = require('fs');

global.Hypergeometric = eval(fs.readFileSync('./hypergeometric.js')+'; Hypergeometric;')

//
// assertion framework
//

/**
 *  @param {boolean} bool
 *  @param {string} message
 */
const assert = (bool, message) => {
    if (bool) {
        return
    }

    throw new Error(message || "Assertion failed")
}
/**
 *  @param {*[]} a
 *  @param {*[]} b
 */
const arrayEqual = (a, b) => {
    if (!Array.isArray(a)) {
        throw new Error("arrayEqual was passed non-array: " + a)
    }
    if (!Array.isArray(b)) {
        throw new Error("arrayEqual was passed non-array: " + b)
    }

    if (a === b) {
        return true
    }
    if (a.length !== b.length) {
        return false
    }

    for (var i = 0; i < a.length; i += 1) {
         // TODO? make this function recursive and remove array restrictions?
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true
}

//
// test framework
//

/**
 * @typedef {() => unknown} Test
 */

/** @type {Test[]} */
let allTests = []
/** @type {(test: Test) => void} */
const it = (test) => { allTests.push(test) }
/** @type {(test: *) => void} */
const skipit = (test) => {}

//
// test helpers
//

/** `start` is expected to be less than or equal to `end`
  * @type {(start: number, end: number) => number[]}
  */
const range = (start, end) => {
    let output = []
    let i = 0
    for (let current = start; current < end; current += 1) {
        output[i] = current
        i += 1;
    }
    return output
}

const repeat = (element, count) => {
    let output = []
    let i = 0
    for (let current = 0; current < count; current += 1) {
        output[i] = element
        i += 1;
    }
    return output
}

/** @type {(n: unknown) => boolean} */
const isNormalEnoughNumber = (n) => {
    return !Number.isNaN(n) && n !== (1/0) && n !== -(1/0)
}

//
//  config/hackery
//

//(/** @type {{[key in string]: boolean}} */ (global).DEBUG_MODE = true);

// tests

const UNIQUE_DRAWS_EXPECTATIONS = [
    // classCounts, drawCount, expected
    [           [],         0,        1],
    [           [],         1,        0],
    [          [1],         1,        1],
    [       [1, 1],         1,        2],
    [       [1, 2],         1,        2],
    [       [2, 1],         1,        2],
    [       [2, 2],         2,        3], // Order should not matter, so not 4
    [       [3, 3],         2,        3],
    [       [3, 3],         3,        4],
    [    [1, 2, 3],         2,        5],
    [ range(1, 10),         2,       44],
    [ range(1, 10),         7,     4489],
    [repeat(1, 30),         5,   142506],
    [repeat(1, 30),         7,  2035800],
    [repeat(1, 30),        30,        1],
    [repeat(1, 60),         5,  5461512],
    [repeat(1, 60),         7,386206920],
];

const uniqueDrawsSlow = (classCounts, drawCount) => {
    if (drawCount <= 0) {
        return 1;
    }

    if (drawCount === 1) {
        return classCounts.length;
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

        total += uniqueDrawsSlow(afterDraw, drawCount - 1);
    }

    return total;
};

it(() => {
    for (const [classCounts, drawCount, expected] of UNIQUE_DRAWS_EXPECTATIONS) {
        const actual = Hypergeometric.uniqueDraws(classCounts, drawCount);
        console.log(classCounts, drawCount)
        assert(
            actual === expected, 
            "uniqueDraws mismatch for " + JSON.stringify([classCounts, drawCount]) + ", expected " + expected + " got " + actual
        )
        
        if (classCounts.length >= 10) { continue }
        
        const slowActual = uniqueDrawsSlow(classCounts, drawCount);
        
        assert(
            actual === slowActual, 
            "uniqueDraws/uniqueDrawsSlow mismatch for " + JSON.stringify([classCounts, drawCount]) + ", expected " + slowActual + " got " + actual
        )
    }
})

// test runner
for (const test of allTests) {
    test()
}

console.log(performance.now() - scriptStart, "ms")

