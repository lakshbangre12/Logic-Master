const assert = require("assert");

const {
    checkLogicalEquivalence,
    checkLogicalInference,
    getInferenceRule,
    getAllInferenceRules
} = require("./member3");


console.log("\n========================================");
console.log("       MEMBER 3 API TEST");
console.log("========================================");


/*
====================================================
1. EQUIVALENCE API
====================================================
*/

console.log("\n[1] Testing Equivalence API...");

const equivalence =
    checkLogicalEquivalence(
        "P -> Q",
        "!P | Q"
    );

assert.strictEqual(
    equivalence.ok,
    true
);

assert.strictEqual(
    equivalence.equivalent,
    true
);

console.log(
    "✓ Equivalence API working"
);


/*
====================================================
2. NON-EQUIVALENCE + COUNTEREXAMPLE
====================================================
*/

console.log("\n[2] Testing Counterexample...");

const nonEquivalent =
    checkLogicalEquivalence(
        "P -> Q",
        "P | Q"
    );

assert.strictEqual(
    nonEquivalent.ok,
    true
);

assert.strictEqual(
    nonEquivalent.equivalent,
    false
);

assert.notStrictEqual(
    nonEquivalent.counterexample,
    null
);

console.log(
    "✓ Counterexample generated correctly"
);


/*
====================================================
3. MODUS PONENS
====================================================
*/

console.log("\n[3] Testing Modus Ponens...");

const modusPonens =
    checkLogicalInference(
        [
            "P -> Q",
            "P"
        ],
        "Q"
    );

assert.strictEqual(
    modusPonens.ok,
    true
);

assert.strictEqual(
    modusPonens.valid,
    true
);

assert.strictEqual(
    modusPonens.rule,
    "Modus Ponens"
);

console.log(
    "✓ Modus Ponens API working"
);


/*
====================================================
4. INVALID INFERENCE
====================================================
*/

console.log("\n[4] Testing Invalid Inference...");

const invalidInference =
    checkLogicalInference(
        [
            "P -> Q",
            "Q"
        ],
        "P"
    );

assert.strictEqual(
    invalidInference.ok,
    true
);

assert.strictEqual(
    invalidInference.valid,
    false
);

console.log(
    "✓ Invalid inference detected"
);


/*
====================================================
5. RULE INFORMATION
====================================================
*/

console.log("\n[5] Testing Rule Information...");

const modusPonensRule =
    getInferenceRule(
        "modus-ponens"
    );

assert.notStrictEqual(
    modusPonensRule,
    null
);

assert.strictEqual(
    modusPonensRule.name,
    "Modus Ponens"
);

assert.strictEqual(
    modusPonensRule.shortName,
    "MP"
);

console.log(
    "✓ Rule information available"
);


/*
====================================================
6. ALL RULES
====================================================
*/

console.log("\n[6] Testing Rule Library API...");

const rules =
    getAllInferenceRules();

assert.strictEqual(
    rules.length,
    7
);

console.log(
    "✓ All 7 inference rules available"
);


/*
====================================================
7. API OUTPUT STRUCTURE
====================================================
*/

console.log("\n[7] Checking API output structure...");

assert.ok(
    Object.prototype.hasOwnProperty.call(
        modusPonens,
        "valid"
    )
);

assert.ok(
    Object.prototype.hasOwnProperty.call(
        modusPonens,
        "rule"
    )
);

assert.ok(
    Object.prototype.hasOwnProperty.call(
        modusPonens,
        "ruleId"
    )
);

assert.ok(
    Object.prototype.hasOwnProperty.call(
        modusPonens,
        "proofSteps"
    )
);

assert.ok(
    Object.prototype.hasOwnProperty.call(
        modusPonens,
        "verifiedByTruthTable"
    )
);

console.log(
    "✓ API output structure verified"
);


/*
====================================================
FINAL RESULT
====================================================
*/

console.log("\n========================================");
console.log("     ALL MEMBER 3 API TESTS PASSED!");
console.log("========================================\n");