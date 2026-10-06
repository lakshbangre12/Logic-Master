const { parse } = require("./parser");
const { evaluate, generateAssignments } = require("./truthTable");

function checkEquivalence(expression1, expression2) {

    // Parse the first expression
    const result1 = parse(expression1);

    if (!result1.ok) {
        return {
            ok: false,
            error: `Expression 1 is invalid: ${result1.error}`
        };
    }

    // Parse the second expression
    const result2 = parse(expression2);

    if (!result2.ok) {
        return {
            ok: false,
            error: `Expression 2 is invalid: ${result2.error}`
        };
    }

    // Collect variables from both expressions
    const variables = [
        ...new Set([
            ...result1.variables,
            ...result2.variables
        ])
    ].sort();

    // Generate all possible truth-value assignments
    const assignments = generateAssignments(variables);

    const values1 = [];
    const values2 = [];

    let counterexample = null;

    // Evaluate both expressions for every assignment
    for (const assignment of assignments) {

        const value1 = evaluate(result1.ast, assignment);
        const value2 = evaluate(result2.ast, assignment);

        values1.push(value1);
        values2.push(value2);

        // If the values differ, the expressions are not equivalent
        if (value1 !== value2 && counterexample === null) {
            counterexample = {
                assignment: { ...assignment },
                expression1Value: value1,
                expression2Value: value2
            };
        }
    }

    // If there is no counterexample, the expressions are equivalent
    const equivalent = counterexample === null;

    return {
        ok: true,
        equivalent: equivalent,
        expression1: expression1,
        expression2: expression2,
        variables: variables,
        assignments: assignments,
        values1: values1,
        values2: values2,
        counterexample: counterexample
    };
}


// Export the function so other files can use it
module.exports = {
    checkEquivalence
};