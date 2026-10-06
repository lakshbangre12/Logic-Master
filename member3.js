const {
    checkEquivalence
} = require("./equivalence");

const {
    checkInference,
    getRuleInformation
} = require("./inference");

const {
    getAllRules,
    getRuleById,
    getRuleByName,
    getRuleNames,
    getRulesByCategory
} = require("./ruleLibrary");


// 1. Logical Equivalence
function checkLogicalEquivalence(expression1, expression2) {
    return checkEquivalence(expression1, expression2);
}


// 2. Logical Inference
function checkLogicalInference(premises, conclusion) {

    const result = checkInference(premises, conclusion);

    // Normalize the output for the integration API.
    // Validity and successful processing are different.
    const ok = typeof result.valid === "boolean";

    return {
        ...result,
        ok: ok
    };
}


// 3. Rule Information
function getInferenceRule(ruleId) {
    return getRuleInformation(ruleId);
}


// 4. All Inference Rules
function getAllInferenceRules() {
    return getAllRules();
}


// 5. Find Rule by ID
function findRuleById(ruleId) {
    return getRuleById(ruleId);
}


// 6. Find Rule by Name
function findRuleByName(ruleName) {
    return getRuleByName(ruleName);
}


// 7. All Rule Names
function getInferenceRuleNames() {
    return getRuleNames();
}


// 8. Rules by Category
function getInferenceRulesByCategory(category) {
    return getRulesByCategory(category);
}


// Public API
module.exports = {
    checkLogicalEquivalence,
    checkLogicalInference,
    getInferenceRule,
    getAllInferenceRules,
    findRuleById,
    findRuleByName,
    getInferenceRuleNames,
    getInferenceRulesByCategory
};