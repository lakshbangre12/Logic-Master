// truthTable.js
// Member 2: truth-table generation and classification (tautology / contradiction / contingency).
//
// Uses Member 1's parser (parser.js). Public API:
//   evaluate(ast, assignment)      -> boolean   (assignment e.g. { P: true, Q: false })
//   generateAssignments(vars)      -> array of 2^n assignments (all-TRUE row first, all-FALSE row last)
//   getSubExpressions(ast)         -> intermediate columns [{ key, label, ast }], root expression last
//   classify(results)              -> 'tautology' | 'contradiction' | 'contingency'
//   generateTruthTable(text)       -> { ok: true, expression, variables, columns, rows, classification, summary }
//                                     | { ok: false, error: { message, position } }
//   classifyExpression(text)       -> { ok: true, classification, ... } | { ok: false, error }
//   tableToText(table)             -> plain-text table (for console/debugging)

'use strict';

const parser = (typeof require !== 'undefined')
  ? require('./parser')
  : (typeof window !== 'undefined' ? window.LogicParser : null);

const { parse, astToString } = parser;

// 2^n rows grows fast; 10 variables = 1024 rows is plenty for a classroom app.
const MAX_VARIABLES = 10;

// ---------- 1. EVALUATION ----------
// Recursively computes the truth value of an AST for one assignment.
function evaluate(node, assignment) {
  switch (node.type) {
    case 'VAR':
      if (!Object.prototype.hasOwnProperty.call(assignment, node.name)) {
        throw new Error(`No truth value given for variable "${node.name}".`);
      }
      return assignment[node.name];
    case 'NOT':
      return !evaluate(node.operand, assignment);
    case 'AND':
      return evaluate(node.left, assignment) && evaluate(node.right, assignment);
    case 'OR':
      return evaluate(node.left, assignment) || evaluate(node.right, assignment);
    case 'IMPLIES':
      // P -> Q is false only when P is true and Q is false
      return !evaluate(node.left, assignment) || evaluate(node.right, assignment);
    case 'IFF':
      return evaluate(node.left, assignment) === evaluate(node.right, assignment);
    default:
      throw new Error(`Unknown node type "${node.type}".`);
  }
}

// ---------- 2. ASSIGNMENTS (2^n rows) ----------
// Row i uses the bits of i: a variable is TRUE when its bit is 0, so the table
// starts at all-TRUE and ends at all-FALSE (the usual textbook order):
//   P Q
//   T T
//   T F
//   F T
//   F F
function generateAssignments(variables) {
  const n = variables.length;
  const total = 2 ** n;
  const rows = [];
  for (let i = 0; i < total; i++) {
    const assignment = {};
    variables.forEach((name, idx) => {
      const bit = (i >> (n - 1 - idx)) & 1; // leftmost variable = most significant bit
      assignment[name] = bit === 0;
    });
    rows.push(assignment);
  }
  return rows;
}

// ---------- 3. INTERMEDIATE COLUMNS ----------
// Strip one pair of outer brackets from a display string: "(P AND Q)" -> "P AND Q"
function stripOuter(str) {
  if (str[0] !== '(' || str[str.length - 1] !== ')') return str;
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    if (depth === 0 && i < str.length - 1) return str; // first bracket closes early
  }
  return str.slice(1, -1);
}

// Post-order walk so smaller parts come before the larger parts that use them.
// Variables are skipped (they are already input columns); duplicates appear once.
// The last column is always the whole expression.
function getSubExpressions(ast) {
  // A lone variable (e.g. "P") has no sub-expressions, but the table still needs a
  // result column, so the root is returned as the one and only column.
  if (ast.type === 'VAR') {
    return [{ key: ast.name, label: ast.name, ast }];
  }

  const seen = new Set();
  const columns = [];

  (function walk(node) {
    if (node.type === 'VAR') return;
    if (node.type === 'NOT') walk(node.operand);
    else { walk(node.left); walk(node.right); }

    const key = astToString(node);
    if (!seen.has(key)) {
      seen.add(key);
      columns.push({ key, label: stripOuter(key), ast: node });
    }
  })(ast);

  return columns;
}

// ---------- 4. CLASSIFICATION ----------
// Looks only at the final column.
//   all TRUE  -> tautology
//   all FALSE -> contradiction
//   mixed     -> contingency
function classify(results) {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Cannot classify an empty list of results.');
  }
  const trues = results.filter(Boolean).length;
  if (trues === results.length) return 'tautology';
  if (trues === 0) return 'contradiction';
  return 'contingency';
}

const EXPLANATIONS = {
  tautology: 'The final column is TRUE in every row, so the expression is always true.',
  contradiction: 'The final column is FALSE in every row, so the expression is always false.',
  contingency: 'The final column has both TRUE and FALSE, so the truth value depends on the variables.',
};

// ---------- 5. MAIN ENTRY: text -> full truth table ----------
function generateTruthTable(text) {
  const parsed = parse(text);
  if (!parsed.ok) return parsed; // pass Member 1's error straight through

  const { ast, variables } = parsed;

  if (variables.length > MAX_VARIABLES) {
    return {
      ok: false,
      error: {
        message: `Too many variables (${variables.length}). The limit is ${MAX_VARIABLES} (2^${MAX_VARIABLES} = ${2 ** MAX_VARIABLES} rows).`,
        position: 0,
      },
    };
  }

  const columns = getSubExpressions(ast);
  const rootKey = astToString(ast);
  const rows = generateAssignments(variables).map((assignment) => {
    const values = {};
    for (const col of columns) values[col.key] = evaluate(col.ast, assignment);
    return {
      assignment,
      values,
      result: evaluate(ast, assignment),
    };
  });

  const results = rows.map((r) => r.result);
  const classification = classify(results);
  const trueCount = results.filter(Boolean).length;

  return {
    ok: true,
    expression: stripOuter(rootKey),
    ast,
    variables,
    columns, // intermediate columns; the whole expression is always the LAST column
    rootKey,
    rows,
    classification,
    explanation: EXPLANATIONS[classification],
    summary: {
      rowCount: rows.length,
      trueCount,
      falseCount: rows.length - trueCount,
    },
  };
}

// Convenience wrapper when only the label is needed (e.g. for challenge checking).
function classifyExpression(text) {
  const table = generateTruthTable(text);
  if (!table.ok) return table;
  return {
    ok: true,
    classification: table.classification,
    explanation: table.explanation,
    summary: table.summary,
  };
}

// ---------- 6. PLAIN-TEXT RENDERING (debugging / demo) ----------
function tableToText(table) {
  if (!table.ok) return `Error: ${table.error.message}`;

  const headers = [...table.variables, ...table.columns.map((c) => c.label)];
  const fmt = (b) => (b ? 'T' : 'F');

  const body = table.rows.map((row) => [
    ...table.variables.map((v) => fmt(row.assignment[v])),
    ...table.columns.map((c) => fmt(row.values[c.key])),
  ]);

  const widths = headers.map((h, i) => Math.max(h.length, ...body.map((r) => r[i].length)));
  const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join(' | ');
  const sep = widths.map((w) => '-'.repeat(w)).join('-+-');

  return [
    line(headers),
    sep,
    ...body.map(line),
    '',
    `Classification: ${table.classification.toUpperCase()}`,
  ].join('\n');
}

// ---------- Exports (Node and browser) ----------
const api = {
  evaluate,
  generateAssignments,
  getSubExpressions,
  classify,
  generateTruthTable,
  classifyExpression,
  tableToText,
  MAX_VARIABLES,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.LogicTruthTable = api;
}
