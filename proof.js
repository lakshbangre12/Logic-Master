/**
 * LogicMaster - Member 4: Proof Assistant
 *
 * Responsibilities:
 * - Premise -> available statements -> goal workflow
 * - Verify individual proof steps
 * - Generate automatic step-by-step proofs
 * - Explain each rule application
 * - Provide feedback for incorrect steps
 *
 * The module is intentionally UI-independent so Member 5 can call it from
 * game.js / the proof screen.
 */

const RULES = {
  MP: {
    name: "Modus Ponens",
    description: "From P → Q and P, conclude Q.",
  },
  MT: {
    name: "Modus Tollens",
    description: "From P → Q and ¬Q, conclude ¬P.",
  },
  HS: {
    name: "Hypothetical Syllogism",
    description: "From P → Q and Q → R, conclude P → R.",
  },
  DS: {
    name: "Disjunctive Syllogism",
    description: "From P ∨ Q and ¬P, conclude Q (or vice versa).",
  },
  SIMP: {
    name: "Simplification",
    description: "From P ∧ Q, conclude P or Q.",
  },
  CONJ: {
    name: "Conjunction",
    description: "From P and Q, conclude P ∧ Q.",
  },
};

function normalize(s) {
  return String(s ?? "")
    .trim()
    .replace(/[¬!~]/g, "¬")
    .replace(/\band\b/gi, "∧")
    .replace(/\bor\b/gi, "∨")
    .replace(/\bnot\b/gi, "¬")
    .replace(/<[-=]*>/g, "↔")
    .replace(/->|=>/g, "→")
    .replace(/\s+/g, " ");
}

function stripOuterParentheses(s) {
  let value = normalize(s);
  while (value.startsWith("(") && value.endsWith(")")) {
    let depth = 0;
    let enclosesAll = true;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "(") depth++;
      else if (value[i] === ")") depth--;
      if (depth === 0 && i < value.length - 1) {
        enclosesAll = false;
        break;
      }
    }
    if (!enclosesAll) break;
    value = value.slice(1, -1).trim();
  }
  return value;
}

function splitTopLevel(s, operator) {
  const value = normalize(s);
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(") depth++;
    else if (value[i] === ")") depth--;
    else if (depth === 0 && value.startsWith(operator, i)) {
      return [value.slice(0, i).trim(), value.slice(i + operator.length).trim()];
    }
  }
  return null;
}

function parseImplication(s) {
  const value = stripOuterParentheses(s);
  const parts = splitTopLevel(value, "→");
  return parts ? { left: parts[0], right: parts[1] } : null;
}

function parseConjunction(s) {
  const value = stripOuterParentheses(s);
  const parts = splitTopLevel(value, "∧");
  return parts ? { left: parts[0], right: parts[1] } : null;
}

function parseDisjunction(s) {
  const value = stripOuterParentheses(s);
  const parts = splitTopLevel(value, "∨");
  return parts ? { left: parts[0], right: parts[1] } : null;
}

function negate(s) {
  const value = stripOuterParentheses(s);
  return value.startsWith("¬") ? value.slice(1).trim() : `¬${value}`;
}

function sameStatement(a, b) {
  return normalize(a) === normalize(b);
}

function makeResult(valid, rule, message, details = {}) {
  return {
    valid,
    rule: rule ? rule.toUpperCase() : null,
    ruleName: rule ? RULES[rule.toUpperCase()]?.name ?? rule : null,
    message,
    ...details,
  };
}

/**
 * Verify one requested proof step against the currently available statements.
 *
 * @param {string[]} statements Statements already available in the proof.
 * @param {string} conclusion The statement the student wants to derive.
 * @param {string} rule Rule name/code: MP, MT, HS, DS, SIMP, CONJ.
 * @param {number[]} [fromLines] Optional 1-based line numbers used by the student.
 */
export function verifyProofStep(statements, conclusion, rule, fromLines = []) {
  const available = statements.map(normalize).filter(Boolean);
  const target = normalize(conclusion);
  const ruleCode = String(rule ?? "").trim().toUpperCase();

  if (!target) {
    return makeResult(false, ruleCode, "No conclusion was entered.");
  }

  if (!RULES[ruleCode]) {
    return makeResult(false, ruleCode, `Unknown rule '${rule}'.`);
  }

  const lines = Array.isArray(fromLines)
    ? fromLines.map(Number).filter(Number.isInteger)
    : [];

  if (ruleCode === "MP") return verifyMP(available, target, lines);
  if (ruleCode === "MT") return verifyMT(available, target, lines);
  if (ruleCode === "HS") return verifyHS(available, target, lines);
  if (ruleCode === "DS") return verifyDS(available, target, lines);
  if (ruleCode === "SIMP") return verifySimp(available, target, lines);
  if (ruleCode === "CONJ") return verifyConj(available, target, lines);

  return makeResult(false, ruleCode, "Rule is not implemented.");
}

function referenced(available, lines, count = 2) {
  if (lines.length !== count) {
    return { ok: false, result: `This rule requires exactly ${count} referenced line(s).` };
  }
  const selected = lines.map(n => available[n - 1]);
  if (selected.some(x => x === undefined)) {
    return { ok: false, result: "One or more referenced line numbers do not exist." };
  }
  return { ok: true, selected };
}

function verifyMP(available, target, lines) {
  const refs = referenced(available, lines);
  if (!refs.ok) return makeResult(false, "MP", refs.result);
  const [a, b] = refs.selected;
  const implication = parseImplication(a);
  const implication2 = parseImplication(b);

  const matches = implication && sameStatement(implication.left, b) && sameStatement(implication.right, target);
  const matchesReverse = implication2 && sameStatement(implication2.left, a) && sameStatement(implication2.right, target);

  if (matches || matchesReverse) {
    return makeResult(true, "MP", `Correct: ${a} and ${b} allow ${target} by Modus Ponens.`, {
      premisesUsed: lines,
      explanation: "An implication P → Q is available and its antecedent P is true/available, so Q follows.",
    });
  }

  return makeResult(false, "MP", "Incorrect Modus Ponens application. You need P → Q and P to derive Q.", {
    premisesUsed: lines,
  });
}

function verifyMT(available, target, lines) {
  const refs = referenced(available, lines);
  if (!refs.ok) return makeResult(false, "MT", refs.result);
  const [a, b] = refs.selected;
  const candidates = [[a, b], [b, a]];

  for (const [implicationText, negatedText] of candidates) {
    const implication = parseImplication(implicationText);
    if (!implication) continue;
    if (sameStatement(negate(implication.right), negatedText) && sameStatement(negate(implication.left), target)) {
      return makeResult(true, "MT", `Correct: ${implicationText} and ${negatedText} give ${target} by Modus Tollens.`, {
        premisesUsed: lines,
        explanation: "From P → Q and ¬Q, conclude ¬P.",
      });
    }
  }

  return makeResult(false, "MT", "Incorrect Modus Tollens application. You need P → Q and ¬Q to derive ¬P.", {
    premisesUsed: lines,
  });
}

function verifyHS(available, target, lines) {
  const refs = referenced(available, lines);
  if (!refs.ok) return makeResult(false, "HS", refs.result);
  const [a, b] = refs.selected;
  const ia = parseImplication(a);
  const ib = parseImplication(b);

  if (ia && ib && sameStatement(ia.right, ib.left)) {
    const expected = `${ia.left}→${ib.right}`;
    const expectedAlt = `${ia.left} → ${ib.right}`;
    if (sameStatement(target, expected) || sameStatement(target, expectedAlt)) {
      return makeResult(true, "HS", `Correct: the two implications form a chain from ${ia.left} to ${ib.right}.`, {
        premisesUsed: lines,
        explanation: `From ${a} and ${b}, the middle statement ${ia.right} cancels, giving ${target}.`,
      });
    }
  }

  if (ia && ib && sameStatement(ib.right, ia.left)) {
    const expected = `${ib.left}→${ia.right}`;
    if (sameStatement(target, expected)) {
      return makeResult(true, "HS", `Correct: the two implications form a chain to ${ia.right}.`, {
        premisesUsed: lines,
        explanation: `From ${b} and ${a}, the intermediate statement connects the two implications.`,
      });
    }
  }

  return makeResult(false, "HS", "Incorrect Hypothetical Syllogism. The consequent of one implication must match the antecedent of the other.", {
    premisesUsed: lines,
  });
}

function verifyDS(available, target, lines) {
  const refs = referenced(available, lines);
  if (!refs.ok) return makeResult(false, "DS", refs.result);
  const [a, b] = refs.selected;
  const disjunction = parseDisjunction(a);
  if (!disjunction) return makeResult(false, "DS", "One referenced statement must be a disjunction P ∨ Q.", { premisesUsed: lines });

  if (sameStatement(b, negate(disjunction.left)) && sameStatement(target, disjunction.right)) {
    return makeResult(true, "DS", `Correct: ${a} and ${b} give ${target} by Disjunctive Syllogism.`, {
      premisesUsed: lines,
      explanation: `Since ${disjunction.left} is false, ${disjunction.right} must hold.`,
    });
  }
  if (sameStatement(b, negate(disjunction.right)) && sameStatement(target, disjunction.left)) {
    return makeResult(true, "DS", `Correct: ${a} and ${b} give ${target} by Disjunctive Syllogism.`, {
      premisesUsed: lines,
      explanation: `Since ${disjunction.right} is false, ${disjunction.left} must hold.`,
    });
  }

  return makeResult(false, "DS", "Incorrect Disjunctive Syllogism. From P ∨ Q and ¬P, derive Q; or from P ∨ Q and ¬Q, derive P.", {
    premisesUsed: lines,
  });
}

function verifySimp(available, target, lines) {
  const refs = referenced(available, lines, 1);
  if (!refs.ok) return makeResult(false, "SIMP", refs.result);
  const [a] = refs.selected;
  const conjunction = parseConjunction(a);
  if (!conjunction) return makeResult(false, "SIMP", "The referenced statement must have the form P ∧ Q.", { premisesUsed: lines });

  if (sameStatement(target, conjunction.left) || sameStatement(target, conjunction.right)) {
    return makeResult(true, "SIMP", `Correct: ${target} is one part of ${a}.`, {
      premisesUsed: lines,
      explanation: "A conjunction P ∧ Q implies each of its individual components.",
    });
  }

  return makeResult(false, "SIMP", `Incorrect Simplification. ${a} only allows its left or right component to be derived.`, {
    premisesUsed: lines,
  });
}

function verifyConj(available, target, lines) {
  const refs = referenced(available, lines);
  if (!refs.ok) return makeResult(false, "CONJ", refs.result);
  const [a, b] = refs.selected;
  const conjunction = parseConjunction(target);
  if (!conjunction) return makeResult(false, "CONJ", "The conclusion must have the form P ∧ Q.", { premisesUsed: lines });

  const direct = sameStatement(conjunction.left, a) && sameStatement(conjunction.right, b);
  const reversed = sameStatement(conjunction.left, b) && sameStatement(conjunction.right, a);
  if (direct || reversed) {
    return makeResult(true, "CONJ", `Correct: ${a} and ${b} combine to form ${target}.`, {
      premisesUsed: lines,
      explanation: "When both P and Q are available, conjunction gives P ∧ Q.",
    });
  }

  return makeResult(false, "CONJ", "Incorrect Conjunction. The conclusion must combine the two referenced statements with ∧.", {
    premisesUsed: lines,
  });
}

/**
 * Try to automatically derive a goal using the supported rules.
 * This is a forward-chaining proof search and is intentionally bounded.
 */
export function generateProof(premises, goal, options = {}) {
  const maxSteps = options.maxSteps ?? 20;
  const initial = [...new Set((premises ?? []).map(normalize).filter(Boolean))];
  const target = normalize(goal);

  if (!target) {
    return { success: false, goal: target, steps: [], message: "No goal was provided." };
  }

  if (initial.some(s => sameStatement(s, target))) {
    return {
      success: true,
      goal: target,
      steps: [{ line: initial.findIndex(s => sameStatement(s, target)) + 1, statement: target, rule: "PREMISE", ruleName: "Given Premise", fromLines: [], explanation: "The goal is already one of the given premises." }],
      finalStatement: target,
      message: "Goal is directly available as a premise.",
    };
  }

  const statements = [...initial];
  const steps = initial.map((statement, i) => ({
    line: i + 1,
    statement,
    rule: "PREMISE",
    ruleName: "Given Premise",
    fromLines: [],
    explanation: "Given in the problem statement.",
  }));

  const seen = new Set(statements);

  function add(statement, rule, fromLines, explanation) {
    const value = normalize(statement);
    if (!value || seen.has(value) || statements.length >= maxSteps + initial.length) return false;
    seen.add(value);
    statements.push(value);
    steps.push({
      line: statements.length,
      statement: value,
      rule,
      ruleName: RULES[rule]?.name ?? rule,
      fromLines,
      explanation,
    });
    return true;
  }

  for (let iteration = 0; iteration < maxSteps; iteration++) {
    const before = statements.length;

    // Modus Ponens and Modus Tollens.
    for (let i = 0; i < statements.length; i++) {
      const implication = parseImplication(statements[i]);
      if (!implication) continue;

      for (let j = 0; j < statements.length; j++) {
        if (i === j) continue;
        if (sameStatement(statements[j], implication.left)) {
          add(implication.right, "MP", [i + 1, j + 1], `From ${statements[i]} and ${statements[j]}, apply Modus Ponens to derive ${implication.right}.`);
        }
        if (sameStatement(statements[j], negate(implication.right))) {
          add(negate(implication.left), "MT", [i + 1, j + 1], `From ${statements[i]} and ${statements[j]}, apply Modus Tollens to derive ${negate(implication.left)}.`);
        }
      }
    }

    // Hypothetical syllogism.
    for (let i = 0; i < statements.length; i++) {
      const a = parseImplication(statements[i]);
      if (!a) continue;
      for (let j = 0; j < statements.length; j++) {
        if (i === j) continue;
        const b = parseImplication(statements[j]);
        if (!b) continue;
        if (sameStatement(a.right, b.left)) {
          add(`${a.left}→${b.right}`, "HS", [i + 1, j + 1], `Chain ${statements[i]} and ${statements[j]} to derive ${a.left} → ${b.right}.`);
        }
      }
    }

    // Disjunctive syllogism.
    for (let i = 0; i < statements.length; i++) {
      const disjunction = parseDisjunction(statements[i]);
      if (!disjunction) continue;
      for (let j = 0; j < statements.length; j++) {
        if (i === j) continue;
        if (sameStatement(statements[j], negate(disjunction.left))) {
          add(disjunction.right, "DS", [i + 1, j + 1], `From ${statements[i]} and ${statements[j]}, eliminate ${disjunction.left} and derive ${disjunction.right}.`);
        }
        if (sameStatement(statements[j], negate(disjunction.right))) {
          add(disjunction.left, "DS", [i + 1, j + 1], `From ${statements[i]} and ${statements[j]}, eliminate ${disjunction.right} and derive ${disjunction.left}.`);
        }
      }
    }

    // Simplification.
    for (let i = 0; i < statements.length; i++) {
      const conjunction = parseConjunction(statements[i]);
      if (!conjunction) continue;
      add(conjunction.left, "SIMP", [i + 1], `From ${statements[i]}, take the left component ${conjunction.left}.`);
      add(conjunction.right, "SIMP", [i + 1], `From ${statements[i]}, take the right component ${conjunction.right}.`);
    }

    // Conjunction for small statement sets.
    const snapshotLength = statements.length;
    for (let i = 0; i < snapshotLength; i++) {
      for (let j = i + 1; j < snapshotLength; j++) {
        add(`${statements[i]}∧${statements[j]}`, "CONJ", [i + 1, j + 1], `Combine ${statements[i]} and ${statements[j]} using Conjunction.`);
      }
    }

    const goalIndex = statements.findIndex(s => sameStatement(s, target));
    if (goalIndex !== -1) {
      return {
        success: true,
        goal: target,
        steps,
        finalStatement: target,
        goalLine: goalIndex + 1,
        message: "Goal successfully derived.",
      };
    }

    if (statements.length === before) break;
  }

  return {
    success: false,
    goal: target,
    steps,
    finalStatement: statements.at(-1) ?? null,
    message: "No proof was found using the supported rules within the search limit.",
  };
}

/**
 * Verify a complete student-submitted proof.
 * Each step: { statement, rule, fromLines }
 */
export function verifyProof(premises, goal, studentSteps) {
  const available = (premises ?? []).map(normalize).filter(Boolean);
  const normalizedGoal = normalize(goal);
  const checkedSteps = available.map((statement, index) => ({
    line: index + 1,
    statement,
    rule: "PREMISE",
    valid: true,
    explanation: "Given premise.",
  }));

  for (const step of studentSteps ?? []) {
    const result = verifyProofStep(available, step.statement, step.rule, step.fromLines);
    const line = available.length + checkedSteps.length - available.length + 1;
    const entry = {
      line: checkedSteps.length + 1,
      statement: normalize(step.statement),
      rule: String(step.rule ?? "").toUpperCase(),
      fromLines: step.fromLines ?? [],
      valid: result.valid,
      message: result.message,
      explanation: result.explanation ?? result.message,
    };
    checkedSteps.push(entry);
    if (!result.valid) {
      return {
        success: false,
        goal: normalizedGoal,
        steps: checkedSteps,
        message: `Proof stopped at step ${entry.line}: ${result.message}`,
      };
    }
    available.push(normalize(step.statement));
  }

  const goalReached = available.some(s => sameStatement(s, normalizedGoal));
  return {
    success: goalReached,
    goal: normalizedGoal,
    steps: checkedSteps,
    message: goalReached ? "Correct proof: the goal has been derived." : "The submitted steps are valid so far, but the goal has not been derived yet.",
  };
}

export function getRuleReference() {
  return Object.entries(RULES).map(([code, rule]) => ({ code, ...rule }));
}

export function createProofSession(premises, goal) {
  return {
    premises: (premises ?? []).map(normalize).filter(Boolean),
    goal: normalize(goal),
    steps: [],
    availableStatements: (premises ?? []).map(normalize).filter(Boolean),
  };
}

export function addStudentStep(session, statement, rule, fromLines = []) {
  const result = verifyProofStep(session.availableStatements, statement, rule, fromLines);
  if (result.valid) {
    session.availableStatements.push(normalize(statement));
    session.steps.push({
      statement: normalize(statement),
      rule: String(rule).toUpperCase(),
      fromLines,
      result,
    });
  }
  return result;
}

export function isGoalReached(session) {
  return session.availableStatements.some(s => sameStatement(s, session.goal));
}

export const ProofAssistant = {
  RULES,
  verifyProofStep,
  generateProof,
  verifyProof,
  getRuleReference,
  createProofSession,
  addStudentStep,
  isGoalReached,
};

export default ProofAssistant;
