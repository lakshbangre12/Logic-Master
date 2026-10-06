const assert = require("assert");

const {
    checkInference,
    getRuleInformation
} = require("./inference");


// ============================================================
// TEST 1 — MODUS PONENS
// ============================================================

const test1 = checkInference(
    ["P -> Q", "P"],
    "Q"
);

assert.strictEqual(test1.valid, true);
assert.strictEqual(test1.rule, "Modus Ponens");
assert.strictEqual(test1.ruleId, "modus-ponens");
assert.strictEqual(test1.shortName, "MP");
assert.ok(test1.pattern);
assert.ok(test1.explanation);
assert.ok(test1.proofSteps);
assert.ok(test1.example);

console.log("✓ Modus Ponens");
console.log("  Rule:", test1.rule);
console.log("  Pattern:", test1.pattern);
console.log("  Explanation:", test1.explanation);


// ============================================================
// TEST 2 — MODUS TOLLENS
// ============================================================

const test2 = checkInference(
    ["P -> Q", "!Q"],
    "!P"
);

assert.strictEqual(test2.valid, true);
assert.strictEqual(test2.rule, "Modus Tollens");
assert.strictEqual(test2.ruleId, "modus-tollens");

console.log("✓ Modus Tollens");


// ============================================================
// TEST 3 — HYPOTHETICAL SYLLOGISM
// ============================================================

const test3 = checkInference(
    ["P -> Q", "Q -> R"],
    "P -> R"
);

assert.strictEqual(test3.valid, true);
assert.strictEqual(test3.rule, "Hypothetical Syllogism");
assert.strictEqual(test3.ruleId, "hypothetical-syllogism");

console.log("✓ Hypothetical Syllogism");


// ============================================================
// TEST 4 — DISJUNCTIVE SYLLOGISM
// ============================================================

const test4 = checkInference(
    ["P | Q", "!P"],
    "Q"
);

assert.strictEqual(test4.valid, true);
assert.strictEqual(test4.rule, "Disjunctive Syllogism");
assert.strictEqual(test4.ruleId, "disjunctive-syllogism");

console.log("✓ Disjunctive Syllogism");


// ============================================================
// TEST 5 — SIMPLIFICATION
// ============================================================

const test5 = checkInference(
    ["P & Q"],
    "P"
);

assert.strictEqual(test5.valid, true);
assert.strictEqual(test5.rule, "Simplification");
assert.strictEqual(test5.ruleId, "simplification");

console.log("✓ Simplification");


// ============================================================
// TEST 6 — CONJUNCTION
// ============================================================

const test6 = checkInference(
    ["P", "Q"],
    "P & Q"
);

assert.strictEqual(test6.valid, true);
assert.strictEqual(test6.rule, "Conjunction");
assert.strictEqual(test6.ruleId, "conjunction");

console.log("✓ Conjunction");


// ============================================================
// TEST 7 — ADDITION
// ============================================================

const test7 = checkInference(
    ["P"],
    "P | Q"
);

assert.strictEqual(test7.valid, true);
assert.strictEqual(test7.rule, "Addition");
assert.strictEqual(test7.ruleId, "addition");

console.log("✓ Addition");


// ============================================================
// TEST 8 — GENERAL LOGICAL VALIDITY
// ============================================================

const test8 = checkInference(
    ["P -> Q", "Q -> R", "P"],
    "R"
);

assert.strictEqual(test8.valid, true);
assert.strictEqual(
    test8.rule,
    "General Logical Validity"
);

assert.strictEqual(
    test8.verifiedByTruthTable,
    true
);

console.log("✓ General logical validity");


// ============================================================
// TEST 9 — INVALID ARGUMENT
// ============================================================

const test9 = checkInference(
    ["P -> Q", "Q"],
    "P"
);

assert.strictEqual(test9.valid, false);
assert.strictEqual(test9.rule, null);
assert.ok(test9.counterexample);
assert.ok(test9.counterexampleText);

console.log("✓ Invalid argument detected");
console.log("  ", test9.counterexampleText);


// ============================================================
// TEST 10 — GET RULE INFORMATION
// ============================================================

const ruleInfo =
    getRuleInformation("modus-ponens");

assert.ok(ruleInfo);
assert.strictEqual(
    ruleInfo.name,
    "Modus Ponens"
);

assert.strictEqual(
    ruleInfo.shortName,
    "MP"
);

console.log("✓ Rule information retrieved");


// ============================================================
// TEST 11 — ARBITRARY VARIABLES
// ============================================================

const test11 = checkInference(
    ["A -> B", "A"],
    "B"
);

assert.strictEqual(test11.valid, true);
assert.strictEqual(test11.rule, "Modus Ponens");

console.log("✓ Arbitrary variables work");


// ============================================================
// TEST 12 — COMPLEX EXPRESSIONS
// ============================================================

const test12 = checkInference(
    ["(P & Q) -> R", "P & Q"],
    "R"
);

assert.strictEqual(test12.valid, true);
assert.strictEqual(test12.rule, "Modus Ponens");

console.log("✓ Complex expressions work");


// ============================================================
// TEST 13 — INVALID PREMISE
// ============================================================

const test13 = checkInference(
    ["P ->"],
    "Q"
);

assert.strictEqual(test13.valid, false);
assert.ok(test13.error);

console.log("✓ Invalid premise detected");


// ============================================================
// TEST 14 — INVALID CONCLUSION
// ============================================================

const test14 = checkInference(
    ["P -> Q", "P"],
    "Q ->"
);

assert.strictEqual(test14.valid, false);
assert.ok(test14.error);

console.log("✓ Invalid conclusion detected");


// ============================================================
// FINAL RESULT
// ============================================================

console.log("");
console.log("========================================");
console.log("All integrated inference tests passed!");
console.log("========================================");