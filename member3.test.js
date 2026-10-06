const assert = require("assert");

const member3 = require("./member3");


console.log("\n========================================");
console.log("       MEMBER 3 INTEGRATION TEST");
console.log("========================================");


/*
====================================================
TEST 1 - LOGICAL EQUIVALENCE
====================================================
*/

const equivalenceResult =
    member3.checkLogicalEquivalence(
        "P -> Q",
        "!P | Q"
    );

assert.strictEqual(
    equivalenceResult.ok,
    true
);

assert.strictEqual(
    equivalenceResult.equivalent,
    true
);

console.log(
    "✓ Logical equivalence API works"
);


/*
====================================================
TEST 2 - NON-EQUIVALENT EXPRESSIONS
====================================================
*/

const nonEquivalentResult =
    member3.checkLogicalEquivalence(
        "P -> Q",
        "P | Q"
    );

assert.strictEqual(
    nonEquivalentResult.ok,
    true
);

assert.strictEqual(
    nonEquivalentResult.equivalent,
    false
);

assert.notStrictEqual(
    nonEquivalentResult.counterexample,
    null
);

console.log(
    "✓ Non-equivalent expressions detected"
);


/*
====================================================
TEST 3 - MODUS PONENS
====================================================
*/

const mpResult =
    member3.checkLogicalInference(
        [
            "P -> Q",
            "P"
        ],
        "Q"
    );

assert.strictEqual(
    mpResult.ok,
    true
);

assert.strictEqual(
    mpResult.valid,
    true
);

assert.strictEqual(
    mpResult.rule,
    "Modus Ponens"
);

console.log(
    "✓ Modus Ponens inference works"
);


/*
====================================================
TEST 4 - MODUS TOLLENS
====================================================
*/

const mtResult =
    member3.checkLogicalInference(
        [
            "P -> Q",
            "!Q"
        ],
        "!P"
    );

assert.strictEqual(
    mtResult.ok,
    true
);

assert.strictEqual(
    mtResult.valid,
    true
);

assert.strictEqual(
    mtResult.rule,
    "Modus Tollens"
);

console.log(
    "✓ Modus Tollens inference works"
);


/*
====================================================
TEST 5 - HYPOTHETICAL SYLLOGISM
====================================================
*/

const hsResult =
    member3.checkLogicalInference(
        [
            "P -> Q",
            "Q -> R"
        ],
        "P -> R"
    );

assert.strictEqual(
    hsResult.ok,
    true
);

assert.strictEqual(
    hsResult.valid,
    true
);

assert.strictEqual(
    hsResult.rule,
    "Hypothetical Syllogism"
);

console.log(
    "✓ Hypothetical Syllogism works"
);


/*
====================================================
TEST 6 - INVALID INFERENCE
====================================================
*/

const invalidResult =
    member3.checkLogicalInference(
        [
            "P -> Q",
            "Q"
        ],
        "P"
    );

assert.strictEqual(
    invalidResult.ok,
    true
);

assert.strictEqual(
    invalidResult.valid,
    false
);

console.log(
    "✓ Invalid inference detected"
);


/*
====================================================
TEST 7 - RULE INFORMATION
====================================================
*/

const rule =
    member3.getInferenceRule(
        "modus-ponens"
    );

assert.notStrictEqual(
    rule,
    null
);

assert.strictEqual(
    rule.name,
    "Modus Ponens"
);

assert.strictEqual(
    rule.shortName,
    "MP"
);

console.log(
    "✓ Rule information API works"
);


/*
====================================================
TEST 8 - ALL RULES
====================================================
*/

const rules =
    member3.getAllInferenceRules();

assert.strictEqual(
    rules.length,
    7
);

console.log(
    "✓ All inference rules accessible"
);


/*
====================================================
TEST 9 - RULE NAMES
====================================================
*/

const ruleNames =
    member3.getInferenceRuleNames();

assert.strictEqual(
    ruleNames.includes(
        "Modus Ponens"
    ),
    true
);

assert.strictEqual(
    ruleNames.includes(
        "Modus Tollens"
    ),
    true
);

console.log(
    "✓ Rule names accessible"
);


/*
====================================================
TEST 10 - RULE SEARCH
====================================================
*/

const searchedRule =
    member3.findRuleByName(
        "modus ponens"
    );

assert.notStrictEqual(
    searchedRule,
    null
);

assert.strictEqual(
    searchedRule.name,
    "Modus Ponens"
);

console.log(
    "✓ Rule search works"
);


console.log("\n========================================");
console.log("   ALL MEMBER 3 INTEGRATION TESTS PASSED!");
console.log("========================================\n");