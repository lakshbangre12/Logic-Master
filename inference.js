const { parse } = require("./parser");
const { evaluate, generateAssignments } = require("./truthTable");

const {
    getRuleById
} = require("./ruleLibrary");


// ============================================================
// AST COMPARISON
// ============================================================

function astEquals(a, b) {

    if (!a || !b) {
        return false;
    }

    if (a.type !== b.type) {
        return false;
    }

    switch (a.type) {

        case "VAR":
            return a.name === b.name;

        case "NOT":
            return astEquals(a.operand, b.operand);

        case "AND":
        case "OR":
        case "IMPLIES":
        case "IFF":
            return (
                astEquals(a.left, b.left) &&
                astEquals(a.right, b.right)
            );

        default:
            return false;
    }
}


// ============================================================
// CHECK NEGATION
// ============================================================

function isNot(node) {
    return node && node.type === "NOT";
}


// ============================================================
// MODUS PONENS
// ============================================================

function checkModusPonens(premises, conclusion) {

    if (premises.length !== 2) {
        return false;
    }

    let implication = null;
    let fact = null;

    for (const premise of premises) {

        if (premise.type === "IMPLIES") {
            implication = premise;
        }
        else {
            fact = premise;
        }
    }

    if (!implication || !fact) {
        return false;
    }

    return (
        astEquals(implication.left, fact) &&
        astEquals(implication.right, conclusion)
    );
}


// ============================================================
// MODUS TOLLENS
// ============================================================

function checkModusTollens(premises, conclusion) {

    if (premises.length !== 2) {
        return false;
    }

    let implication = null;
    let negated = null;

    for (const premise of premises) {

        if (premise.type === "IMPLIES") {
            implication = premise;
        }
        else if (isNot(premise)) {
            negated = premise;
        }
    }

    if (!implication || !negated) {
        return false;
    }

    if (!isNot(conclusion)) {
        return false;
    }

    return (
        astEquals(implication.right, negated.operand) &&
        astEquals(implication.left, conclusion.operand)
    );
}


// ============================================================
// HYPOTHETICAL SYLLOGISM
// ============================================================

function checkHypotheticalSyllogism(premises, conclusion) {

    if (premises.length !== 2) {
        return false;
    }

    const first = premises[0];
    const second = premises[1];

    if (
        first.type !== "IMPLIES" ||
        second.type !== "IMPLIES" ||
        conclusion.type !== "IMPLIES"
    ) {
        return false;
    }

    return (
        astEquals(first.right, second.left) &&
        astEquals(first.left, conclusion.left) &&
        astEquals(second.right, conclusion.right)
    );
}


// ============================================================
// DISJUNCTIVE SYLLOGISM
// ============================================================

function checkDisjunctiveSyllogism(premises, conclusion) {

    if (premises.length !== 2) {
        return false;
    }

    let disjunction = null;
    let negated = null;

    for (const premise of premises) {

        if (premise.type === "OR") {
            disjunction = premise;
        }
        else if (isNot(premise)) {
            negated = premise;
        }
    }

    if (!disjunction || !negated) {
        return false;
    }

    if (astEquals(disjunction.left, negated.operand)) {
        return astEquals(disjunction.right, conclusion);
    }

    if (astEquals(disjunction.right, negated.operand)) {
        return astEquals(disjunction.left, conclusion);
    }

    return false;
}


// ============================================================
// SIMPLIFICATION
// ============================================================

function checkSimplification(premises, conclusion) {

    if (premises.length !== 1) {
        return false;
    }

    const premise = premises[0];

    if (premise.type !== "AND") {
        return false;
    }

    return (
        astEquals(premise.left, conclusion) ||
        astEquals(premise.right, conclusion)
    );
}


// ============================================================
// CONJUNCTION
// ============================================================

function checkConjunction(premises, conclusion) {

    if (premises.length !== 2) {
        return false;
    }

    if (conclusion.type !== "AND") {
        return false;
    }

    return (
        (
            astEquals(premises[0], conclusion.left) &&
            astEquals(premises[1], conclusion.right)
        )
        ||
        (
            astEquals(premises[0], conclusion.right) &&
            astEquals(premises[1], conclusion.left)
        )
    );
}


// ============================================================
// ADDITION
// ============================================================

function checkAddition(premises, conclusion) {

    if (premises.length !== 1) {
        return false;
    }

    if (conclusion.type !== "OR") {
        return false;
    }

    return (
        astEquals(premises[0], conclusion.left) ||
        astEquals(premises[0], conclusion.right)
    );
}


// ============================================================
// TRUTH-TABLE VALIDITY CHECK
// ============================================================

function verifyByTruthTable(premiseResults, conclusionResult) {

    const variables = [
        ...new Set([
            ...premiseResults.flatMap(result => result.variables),
            ...conclusionResult.variables
        ])
    ].sort();

    const assignments = generateAssignments(variables);

    let counterexample = null;

    for (const assignment of assignments) {

        const premiseValues = premiseResults.map(result =>
            evaluate(result.ast, assignment)
        );

        const allPremisesTrue = premiseValues.every(
            value => value === true
        );

        if (allPremisesTrue) {

            const conclusionValue =
                evaluate(conclusionResult.ast, assignment);

            if (conclusionValue === false) {

                counterexample = {
                    assignment: { ...assignment },
                    premiseValues: premiseValues,
                    conclusionValue: conclusionValue
                };

                break;
            }
        }
    }

    if (counterexample === null) {

        return {
            valid: true,
            variables: variables,
            counterexample: null
        };
    }

    return {
        valid: false,
        variables: variables,
        counterexample: counterexample
    };
}


// ============================================================
// FORMAT COUNTEREXAMPLE
// ============================================================

function formatCounterexample(counterexample, variables) {

    if (!counterexample) {
        return null;
    }

    const assignmentText = variables
        .map(variable =>
            `${variable} = ${counterexample.assignment[variable] ? "True" : "False"}`
        )
        .join(", ");

    return (
        `Counterexample: ${assignmentText}. ` +
        `All premises are true, but the conclusion is false.`
    );
}


// ============================================================
// GET RULE INFORMATION FROM RULE LIBRARY
// ============================================================

function getRuleInformation(ruleId) {

    const rule = getRuleById(ruleId);

    if (!rule) {
        return null;
    }

    return {
        id: rule.id,
        name: rule.name,
        shortName: rule.shortName,
        category: rule.category,
        pattern: rule.pattern,
        premises: rule.premises,
        conclusion: rule.conclusion,
        explanation: rule.explanation,
        steps: rule.steps,
        example: rule.example
    };
}


// ============================================================
// CREATE RESULT USING RULE LIBRARY
// ============================================================

function createRuleResult(
    ruleId,
    premiseTexts,
    conclusionText
) {

    const rule = getRuleInformation(ruleId);

    if (!rule) {
        return null;
    }

    return {
        valid: true,

        rule: rule.name,

        ruleId: rule.id,

        shortName: rule.shortName,

        category: rule.category,

        premises: premiseTexts,

        conclusion: conclusionText,

        pattern: rule.pattern,

        explanation: rule.explanation,

        proofSteps: rule.steps,

        example: rule.example,

        verifiedByTruthTable: true
    };
}


// ============================================================
// MAIN INFERENCE FUNCTION
// ============================================================

function checkInference(premiseTexts, conclusionText) {

    // --------------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------------

    if (!Array.isArray(premiseTexts) || premiseTexts.length === 0) {

        return {
            valid: false,
            rule: null,
            error: "At least one premise is required."
        };
    }


    // --------------------------------------------------------
    // PARSE PREMISES
    // --------------------------------------------------------

    const premiseResults = [];

    for (const text of premiseTexts) {

        const result = parse(text);

        if (!result.ok) {

            return {
                valid: false,
                rule: null,
                error: `Invalid premise "${text}": ${result.error}`
            };
        }

        premiseResults.push(result);
    }


    // --------------------------------------------------------
    // PARSE CONCLUSION
    // --------------------------------------------------------

    const conclusionResult = parse(conclusionText);

    if (!conclusionResult.ok) {

        return {
            valid: false,
            rule: null,
            error: `Invalid conclusion: ${conclusionResult.error}`
        };
    }


    const premises = premiseResults.map(
        result => result.ast
    );

    const conclusion = conclusionResult.ast;


    // --------------------------------------------------------
    // CHECK MODUS PONENS
    // --------------------------------------------------------

    if (checkModusPonens(premises, conclusion)) {

        return createRuleResult(
            "modus-ponens",
            premiseTexts,
            conclusionText
        );
    }


    // --------------------------------------------------------
    // CHECK MODUS TOLLENS
    // --------------------------------------------------------

    if (checkModusTollens(premises, conclusion)) {

        return createRuleResult(
            "modus-tollens",
            premiseTexts,
            conclusionText
        );
    }


    // --------------------------------------------------------
    // CHECK HYPOTHETICAL SYLLOGISM
    // --------------------------------------------------------

    if (checkHypotheticalSyllogism(premises, conclusion)) {

        return createRuleResult(
            "hypothetical-syllogism",
            premiseTexts,
            conclusionText
        );
    }


    // --------------------------------------------------------
    // CHECK DISJUNCTIVE SYLLOGISM
    // --------------------------------------------------------

    if (checkDisjunctiveSyllogism(premises, conclusion)) {

        return createRuleResult(
            "disjunctive-syllogism",
            premiseTexts,
            conclusionText
        );
    }


    // --------------------------------------------------------
    // CHECK SIMPLIFICATION
    // --------------------------------------------------------

    if (checkSimplification(premises, conclusion)) {

        return createRuleResult(
            "simplification",
            premiseTexts,
            conclusionText
        );
    }


    // --------------------------------------------------------
    // CHECK CONJUNCTION
    // --------------------------------------------------------

    if (checkConjunction(premises, conclusion)) {

        return createRuleResult(
            "conjunction",
            premiseTexts,
            conclusionText
        );
    }


    // --------------------------------------------------------
    // CHECK ADDITION
    // --------------------------------------------------------

    if (checkAddition(premises, conclusion)) {

        return createRuleResult(
            "addition",
            premiseTexts,
            conclusionText
        );
    }


    // --------------------------------------------------------
    // GENERAL TRUTH-TABLE VERIFICATION
    // --------------------------------------------------------

    const verification = verifyByTruthTable(
        premiseResults,
        conclusionResult
    );


    // --------------------------------------------------------
    // VALID BUT NO NAMED RULE
    // --------------------------------------------------------

    if (verification.valid) {

        return {
            valid: true,

            rule: "General Logical Validity",

            ruleId: null,

            shortName: null,

            category: "Truth-Table Verification",

            premises: premiseTexts,

            conclusion: conclusionText,

            pattern: null,

            explanation:
                "The argument is logically valid because there is no truth assignment where all premises are true and the conclusion is false.",

            proofSteps: [],

            example: null,

            verifiedByTruthTable: true,

            variables: verification.variables,

            counterexample: null
        };
    }


    // --------------------------------------------------------
    // INVALID ARGUMENT
    // --------------------------------------------------------

    const counterexampleText =
        formatCounterexample(
            verification.counterexample,
            verification.variables
        );


    return {

        valid: false,

        rule: null,

        ruleId: null,

        shortName: null,

        category: "Invalid Inference",

        premises: premiseTexts,

        conclusion: conclusionText,

        pattern: null,

        explanation:
            "The argument is invalid because the premises can all be true while the conclusion is false.",

        proofSteps: [],

        example: null,

        verifiedByTruthTable: true,

        variables: verification.variables,

        counterexample:
            verification.counterexample,

        counterexampleText:
            counterexampleText
    };
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    checkInference,
    verifyByTruthTable,
    getRuleInformation
};