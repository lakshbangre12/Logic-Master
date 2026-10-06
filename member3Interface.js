const member3 = require("./member3");


/*
====================================================
        LOGICMASTER - MEMBER 3 INTERFACE
====================================================

This file is the single interface between the
Member 3 backend and the rest of the project.

Member 5 / Member 6 can import this file and use
the functions below without directly accessing:

    equivalence.js
    inference.js
    ruleLibrary.js

====================================================
*/


/*
----------------------------------------------------
1. EQUIVALENCE CHECK
----------------------------------------------------

Input:
    expression1
    expression2

Output:
    Equivalence result
----------------------------------------------------
*/

function runEquivalence(expression1, expression2) {

    return member3.checkLogicalEquivalence(
        expression1,
        expression2
    );
}


/*
----------------------------------------------------
2. INFERENCE CHECK
----------------------------------------------------

Input:
    premises -> array of logical expressions
    conclusion -> logical expression

Output:
    Inference result
----------------------------------------------------
*/

function runInference(premises, conclusion) {

    return member3.checkLogicalInference(
        premises,
        conclusion
    );
}


/*
----------------------------------------------------
3. GET RULE INFORMATION
----------------------------------------------------
*/

function getRule(ruleId) {

    return member3.getInferenceRule(
        ruleId
    );
}


/*
----------------------------------------------------
4. GET ALL RULES
----------------------------------------------------
*/

function getRules() {

    return member3.getAllInferenceRules();
}


/*
----------------------------------------------------
5. GET RULE NAMES
----------------------------------------------------
*/

function getRuleNames() {

    return member3.getInferenceRuleNames();
}


/*
====================================================
PUBLIC INTERFACE
====================================================
*/

module.exports = {

    runEquivalence,

    runInference,

    getRule,

    getRules,

    getRuleNames

};