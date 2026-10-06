// truthTable.test.js
// Run with: node truthTable.test.js   (or: npm run test:truthtable)
const assert = require('assert');
const { parse } = require('./parser');
const {
  evaluate,
  generateAssignments,
  getSubExpressions,
  classify,
  generateTruthTable,
  classifyExpression,
  tableToText,
  MAX_VARIABLES,
} = require('./truthTable');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}\n      ${e.message}`);
  }
}

const table = (text) => {
  const t = generateTruthTable(text);
  assert.strictEqual(t.ok, true, `expected "${text}" to work, got: ${t.error && t.error.message}`);
  return t;
};
const finalColumn = (text) => table(text).rows.map((r) => (r.result ? 'T' : 'F')).join('');
const kind = (text) => table(text).classification;

console.log('\nEvaluation (basic connectives)');
const ev = (text, a) => evaluate(parse(text).ast, a);
test('NOT', () => { assert.strictEqual(ev('NOT P', { P: true }), false); assert.strictEqual(ev('NOT P', { P: false }), true); });
test('AND', () => {
  assert.strictEqual(ev('P AND Q', { P: true, Q: true }), true);
  assert.strictEqual(ev('P AND Q', { P: true, Q: false }), false);
});
test('OR', () => {
  assert.strictEqual(ev('P OR Q', { P: false, Q: false }), false);
  assert.strictEqual(ev('P OR Q', { P: false, Q: true }), true);
});
test('IMPLIES only false for T -> F', () => {
  assert.strictEqual(ev('P -> Q', { P: true, Q: false }), false);
  assert.strictEqual(ev('P -> Q', { P: true, Q: true }), true);
  assert.strictEqual(ev('P -> Q', { P: false, Q: true }), true);
  assert.strictEqual(ev('P -> Q', { P: false, Q: false }), true);
});
test('IFF true when both sides match', () => {
  assert.strictEqual(ev('P <-> Q', { P: true, Q: true }), true);
  assert.strictEqual(ev('P <-> Q', { P: false, Q: false }), true);
  assert.strictEqual(ev('P <-> Q', { P: true, Q: false }), false);
});
test('missing variable value throws a clear error', () => {
  assert.throws(() => ev('P AND Q', { P: true }), /No truth value/);
});

console.log('\nRow generation (2^n)');
test('0 variables gives 1 row', () => assert.strictEqual(generateAssignments([]).length, 1));
test('1 variable gives 2 rows', () => assert.strictEqual(generateAssignments(['P']).length, 2));
test('2 variables give 4 rows', () => assert.strictEqual(generateAssignments(['P', 'Q']).length, 4));
test('3 variables give 8 rows', () => assert.strictEqual(generateAssignments(['P', 'Q', 'R']).length, 8));
test('4 variables give 16 rows', () => assert.strictEqual(generateAssignments(['P', 'Q', 'R', 'S']).length, 16));
test('order starts all-TRUE and ends all-FALSE', () => {
  const rows = generateAssignments(['P', 'Q']);
  assert.deepStrictEqual(rows[0], { P: true, Q: true });
  assert.deepStrictEqual(rows[1], { P: true, Q: false });
  assert.deepStrictEqual(rows[2], { P: false, Q: true });
  assert.deepStrictEqual(rows[3], { P: false, Q: false });
});
test('all rows are distinct', () => {
  const rows = generateAssignments(['P', 'Q', 'R']);
  assert.strictEqual(new Set(rows.map((r) => JSON.stringify(r))).size, 8);
});

console.log('\nFinal columns (TT, TF, FT, FF order)');
test('P AND Q  -> TFFF', () => assert.strictEqual(finalColumn('P AND Q'), 'TFFF'));
test('P OR Q   -> TTTF', () => assert.strictEqual(finalColumn('P OR Q'), 'TTTF'));
test('P -> Q   -> TFTT', () => assert.strictEqual(finalColumn('P -> Q'), 'TFTT'));
test('P <-> Q  -> TFFT', () => assert.strictEqual(finalColumn('P <-> Q'), 'TFFT'));
test('NOT P    -> FT', () => assert.strictEqual(finalColumn('NOT P'), 'FT'));

console.log('\nClassification (required examples)');
test('P OR NOT P is a tautology', () => assert.strictEqual(kind('P OR NOT P'), 'tautology'));
test('P AND NOT P is a contradiction', () => assert.strictEqual(kind('P AND NOT P'), 'contradiction'));
test('P AND Q is a contingency', () => assert.strictEqual(kind('P AND Q'), 'contingency'));
test('P -> Q is a contingency', () => assert.strictEqual(kind('P -> Q'), 'contingency'));
test('P <-> Q is a contingency', () => assert.strictEqual(kind('P <-> Q'), 'contingency'));
test('P <-> P is a tautology', () => assert.strictEqual(kind('P <-> P'), 'tautology'));
test('single variable P is a contingency', () => assert.strictEqual(kind('P'), 'contingency'));

console.log('\nClassification (well-known laws)');
test('(P -> Q) <-> (NOT Q -> NOT P) contrapositive is a tautology', () =>
  assert.strictEqual(kind('(P -> Q) <-> (NOT Q -> NOT P)'), 'tautology'));
test("De Morgan: NOT (P AND Q) <-> (NOT P OR NOT Q)", () =>
  assert.strictEqual(kind('NOT (P AND Q) <-> (NOT P OR NOT Q)'), 'tautology'));
test('Modus Ponens form: ((P -> Q) AND P) -> Q', () =>
  assert.strictEqual(kind('((P -> Q) AND P) -> Q'), 'tautology'));
test('Hypothetical syllogism as one formula', () =>
  assert.strictEqual(kind('((P -> Q) AND (Q -> R)) -> (P -> R)'), 'tautology'));
test('Affirming the consequent is NOT a tautology', () =>
  assert.strictEqual(kind('((P -> Q) AND Q) -> P'), 'contingency'));
test('(P OR Q) AND (NOT P) AND (NOT Q) is a contradiction', () =>
  assert.strictEqual(kind('(P OR Q) AND (NOT P) AND (NOT Q)'), 'contradiction'));

console.log('\nNested expressions and edge cases');
test('deeply nested brackets', () =>
  assert.strictEqual(kind('((((P AND (Q OR (R AND (S OR NOT P)))))))'), 'contingency'));
test('deep nesting tautology', () =>
  assert.strictEqual(kind('(((P OR (NOT P))))'), 'tautology'));
test('repeated variables count once (P AND P has 2 rows)', () => {
  const t = table('P AND P');
  assert.deepStrictEqual(t.variables, ['P']);
  assert.strictEqual(t.rows.length, 2);
});
test('repeated variable in a larger formula (P OR (P AND Q)) has 4 rows', () => {
  const t = table('P OR (P AND Q)');
  assert.strictEqual(t.rows.length, 4);
  assert.strictEqual(finalColumn('P OR (P AND Q)'), 'TTFF'); // absorption: same as P
});
test('4 variables produce 16 rows', () => assert.strictEqual(table('P AND Q AND R AND S').rows.length, 16));
test('row count is always 2^n', () => {
  for (const text of ['P', 'P AND Q', 'P AND Q OR R', '(P -> Q) AND (R -> S)']) {
    const t = table(text);
    assert.strictEqual(t.rows.length, 2 ** t.variables.length);
  }
});
test('arbitrary variable names work', () => {
  const t = table('rain -> wet');
  assert.deepStrictEqual(t.variables, ['rain', 'wet']);
  assert.strictEqual(t.classification, 'contingency');
});
test('symbol aliases work (~P | P)', () => assert.strictEqual(kind('~P | P'), 'tautology'));
test('10 variables are accepted', () => {
  const names = 'ABCDEFGHIJ'.split('');
  const t = table(names.join(' AND '));
  assert.strictEqual(t.rows.length, 1024);
  assert.strictEqual(t.summary.trueCount, 1);
});

console.log('\nIntermediate columns');
const labels = (text) => table(text).columns.map((c) => c.label);
test('(P AND Q) -> R shows P AND Q first, whole expression last', () =>
  assert.deepStrictEqual(labels('(P AND Q) -> R'), ['P AND Q', '(P AND Q) -> R']));
test('NOT appears as its own column', () =>
  assert.deepStrictEqual(labels('P OR NOT P'), ['NOT P', 'P OR NOT P']));
test('repeated sub-expression appears only once', () =>
  assert.deepStrictEqual(labels('(P AND Q) OR (P AND Q)'), ['P AND Q', '(P AND Q) OR (P AND Q)']));
test('single variable still gets a result column', () => assert.deepStrictEqual(labels('P'), ['P']));
test('last column always matches row.result', () => {
  const t = table('((P -> Q) AND P) -> Q');
  const lastKey = t.columns[t.columns.length - 1].key;
  assert.ok(t.rows.every((r) => r.values[lastKey] === r.result));
});
test('intermediate values are correct for (P AND Q) -> R', () => {
  const t = table('(P AND Q) -> R');
  const andKey = t.columns[0].key;
  const andCol = t.rows.map((r) => (r.values[andKey] ? 'T' : 'F')).join('');
  assert.strictEqual(andCol, 'TTFFFFFF');
});
test('getSubExpressions works on a raw AST', () => {
  const cols = getSubExpressions(parse('NOT (P OR Q)').ast);
  assert.deepStrictEqual(cols.map((c) => c.label), ['P OR Q', 'NOT (P OR Q)']);
});

console.log('\nSummary counts and explanation');
test('P AND Q has 1 true and 3 false rows', () => {
  const s = table('P AND Q').summary;
  assert.deepStrictEqual(s, { rowCount: 4, trueCount: 1, falseCount: 3 });
});
test('every classification has an explanation', () => {
  for (const text of ['P OR NOT P', 'P AND NOT P', 'P AND Q']) {
    assert.ok(table(text).explanation.length > 10);
  }
});
test('classifyExpression returns the same label', () =>
  assert.strictEqual(classifyExpression('P OR NOT P').classification, 'tautology'));

console.log('\nclassify() on raw results');
test('all true', () => assert.strictEqual(classify([true, true]), 'tautology'));
test('all false', () => assert.strictEqual(classify([false, false, false]), 'contradiction'));
test('mixed', () => assert.strictEqual(classify([true, false]), 'contingency'));
test('empty list throws', () => assert.throws(() => classify([])));

console.log('\nInvalid input never crashes');
const isBad = (text) => {
  const r = generateTruthTable(text);
  assert.strictEqual(r.ok, false);
  assert.ok(r.error && r.error.message);
};
test('empty string', () => isBad(''));
test('missing operand (P AND)', () => isBad('P AND'));
test('unbalanced brackets', () => isBad('(P AND Q'));
test('illegal character', () => isBad('P # Q'));
test('non-string input', () => isBad(null));
test('too many variables is rejected cleanly', () => {
  const names = 'ABCDEFGHIJK'.split(''); // 11 variables
  const r = generateTruthTable(names.join(' AND '));
  assert.strictEqual(r.ok, false);
  assert.ok(/Too many variables/.test(r.error.message));
  assert.strictEqual(MAX_VARIABLES, 10);
});
test('classifyExpression passes errors through', () =>
  assert.strictEqual(classifyExpression('P AND').ok, false));

console.log('\nText rendering');
test('tableToText shows headers and classification', () => {
  const out = tableToText(table('P -> Q'));
  assert.ok(out.includes('P | Q | P -> Q'));
  assert.ok(out.includes('CONTINGENCY'));
});
test('tableToText handles errors', () => assert.ok(tableToText(generateTruthTable('P AND')).startsWith('Error')));

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
