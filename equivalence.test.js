const assert = require("assert");
const { checkEquivalence } = require("./equivalence");


// Test 1: P -> Q is equivalent to !P | Q
const result1 = checkEquivalence(
    "P -> Q",
    "!P | Q"
);

assert.strictEqual(result1.ok, true);
assert.strictEqual(result1.equivalent, true);

console.log("✓ P -> Q is equivalent to !P | Q");


// Test 2: Commutative law of AND
const result2 = checkEquivalence(
    "P & Q",
    "Q & P"
);

assert.strictEqual(result2.ok, true);
assert.strictEqual(result2.equivalent, true);

console.log("✓ P & Q is equivalent to Q & P");


// Test 3: Non-equivalent expressions
const result3 = checkEquivalence(
    "P -> Q",
    "P | Q"
);

assert.strictEqual(result3.ok, true);
assert.strictEqual(result3.equivalent, false);
assert.notStrictEqual(result3.counterexample, null);

console.log("✓ Non-equivalent expressions detected");


// Test 4: Arbitrary variable names
const result4 = checkEquivalence(
    "A -> B",
    "!A | B"
);

assert.strictEqual(result4.ok, true);
assert.strictEqual(result4.equivalent, true);

console.log("✓ Arbitrary variable names work");


// Test 5: De Morgan's Law
const result5 = checkEquivalence(
    "!(P & Q)",
    "!P | !Q"
);

assert.strictEqual(result5.ok, true);
assert.strictEqual(result5.equivalent, true);

console.log("✓ De Morgan's Law verified");


// Test 6: Double negation
const result6 = checkEquivalence(
    "!!P",
    "P"
);

assert.strictEqual(result6.ok, true);
assert.strictEqual(result6.equivalent, true);

console.log("✓ Double negation verified");


// Test 7: Invalid first expression
const result7 = checkEquivalence(
    "P ->",
    "!P | Q"
);

assert.strictEqual(result7.ok, false);

console.log("✓ Invalid expression detected");


console.log("\nAll equivalence tests passed!");