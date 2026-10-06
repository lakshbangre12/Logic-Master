const assert = require("assert");

const {
    RULES,
    getAllRules,
    getRuleById,
    getRuleByName,
    getRuleNames,
    getRulesByCategory
} = require("./ruleLibrary");


// ============================================================
// TEST 1 — RULE LIBRARY EXISTS
// ============================================================

assert.ok(RULES);

console.log("✓ Rule library loaded");


// ============================================================
// TEST 2 — CHECK NUMBER OF RULES
// ============================================================

const rules = getAllRules();

assert.strictEqual(rules.length, 7);

console.log("✓ 7 inference rules available");


// ============================================================
// TEST 3 — CHECK RULE NAMES
// ============================================================

const names = getRuleNames();

assert.ok(names.includes("Modus Ponens"));
assert.ok(names.includes("Modus Tollens"));
assert.ok(names.includes("Hypothetical Syllogism"));
assert.ok(names.includes("Disjunctive Syllogism"));
assert.ok(names.includes("Simplification"));
assert.ok(names.includes("Conjunction"));
assert.ok(names.includes("Addition"));

console.log("✓ All rule names available");


// ============================================================
// TEST 4 — GET RULE BY ID
// ============================================================

const mp = getRuleById("modus-ponens");

assert.ok(mp);
assert.strictEqual(mp.name, "Modus Ponens");
assert.strictEqual(mp.shortName, "MP");

console.log("✓ Rule can be found by ID");


// ============================================================
// TEST 5 — GET RULE BY NAME
// ============================================================

const mt = getRuleByName("Modus Tollens");

assert.ok(mt);
assert.strictEqual(mt.id, "modus-tollens");

console.log("✓ Rule can be found by name");


// ============================================================
// TEST 6 — CASE-INSENSITIVE NAME SEARCH
// ============================================================

const hs = getRuleByName("hypothetical syllogism");

assert.ok(hs);
assert.strictEqual(hs.name, "Hypothetical Syllogism");

console.log("✓ Case-insensitive rule search works");


// ============================================================
// TEST 7 — CHECK RULE STRUCTURE
// ============================================================

for (const rule of rules) {

    assert.ok(rule.id);
    assert.ok(rule.name);
    assert.ok(rule.shortName);
    assert.ok(rule.category);
    assert.ok(rule.premises);
    assert.ok(rule.conclusion);
    assert.ok(rule.pattern);
    assert.ok(rule.explanation);
    assert.ok(rule.steps);
    assert.ok(rule.example);
}

console.log("✓ All rules have complete information");


// ============================================================
// TEST 8 — CHECK MODUS PONENS DATA
// ============================================================

assert.deepStrictEqual(
    mp.premises,
    ["P → Q", "P"]
);

assert.strictEqual(
    mp.conclusion,
    "Q"
);

console.log("✓ Modus Ponens structure verified");


// ============================================================
// TEST 9 — CATEGORY SEARCH
// ============================================================

const conjunctiveRules =
    getRulesByCategory("Conjunctive Inference");

assert.strictEqual(conjunctiveRules.length, 2);

console.log("✓ Category filtering works");


// ============================================================
// TEST 10 — INVALID RULE ID
// ============================================================

const invalidRule =
    getRuleById("does-not-exist");

assert.strictEqual(invalidRule, null);

console.log("✓ Invalid rule ID handled correctly");


// ============================================================
// FINAL RESULT
// ============================================================

console.log("");
console.log("========================================");
console.log("All rule library tests passed!");
console.log("========================================");