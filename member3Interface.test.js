const assert = require("assert");

const {
    runEquivalence,
    runInference,
    getRule,
    getRules,
    getRuleNames
} = require("./member3Interface");


console.log("\n========================================");
console.log("     MEMBER 3 INTERFACE TEST");
console.log("========================================");


/*
====================================================
1. EQUIVALENCE
====================================================
*/

console.log("\n[1] Equivalence");

const equivalence =
    runEquivalence(
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
    "✓ Equivalence interface works"
);


/*
====================================================
2. INFERENCE
====================================================
*/

console.log("\n[2] Inference");

const inference =
    runInference(
        [
            "P -> Q",
            "P"
        ],
        "Q"
    );

assert.strictEqual(
    inference.ok,
    true
);

assert.strictEqual(
    inference.valid,
    true
);

assert.strictEqual(
    inference.rule,
    "Modus Ponens"
);

console.log(
    "✓ Inference interface works"
);


/*
====================================================
3. RULE INFORMATION
====================================================
*/

console.log("\n[3] Rule Information");

const rule =
    getRule(
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

console.log(
    "✓ Rule information interface works"
);


/*
====================================================
4. ALL RULES
====================================================
*/

console.log("\n[4] All Rules");

const rules =
    getRules();

assert.strictEqual(
    rules.length,
    7
);

console.log(
    "✓ All rules accessible"
);


/*
====================================================
5. RULE NAMES
====================================================
*/

console.log("\n[5] Rule Names");

const ruleNames =
    getRuleNames();

assert.strictEqual(
    ruleNames.length,
    7
);

assert.ok(
    ruleNames.includes(
        "Modus Ponens"
    )
);

console.log(
    "✓ Rule names accessible"
);


/*
====================================================
FINAL
====================================================
*/

console.log("\n========================================");
console.log("   ALL MEMBER 3 INTERFACE TESTS PASSED!");
console.log("========================================\n");