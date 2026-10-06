// parser.test.js
// Run with: node parser.test.js   (or: npm test)
const assert = require('assert');
const { parse, astToString } = require('./parser');

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

// parse and return the fully bracketed string
const show = (text) => {
  const r = parse(text);
  assert.strictEqual(r.ok, true, `expected "${text}" to parse, got: ${r.error && r.error.message}`);
  return astToString(r.ast);
};

// expect a parse failure (optionally with a word in the message)
const bad = (text, fragment) => {
  const r = parse(text);
  assert.strictEqual(r.ok, false, `expected "${text}" to fail`);
  assert.ok(r.error && r.error.message, 'error should have a message');
  if (fragment) {
    assert.ok(
      r.error.message.toLowerCase().includes(fragment.toLowerCase()),
      `error "${r.error.message}" should mention "${fragment}"`
    );
  }
};

console.log('\nValid expressions');
test('single variable', () => assert.strictEqual(show('P'), 'P'));
test('AND', () => assert.strictEqual(show('P AND Q'), '(P AND Q)'));
test('OR', () => assert.strictEqual(show('P OR Q'), '(P OR Q)'));
test('NOT', () => assert.strictEqual(show('NOT P'), 'NOT P'));
test('implication', () => assert.strictEqual(show('P -> Q'), '(P -> Q)'));
test('biconditional', () => assert.strictEqual(show('P <-> Q'), '(P <-> Q)'));
test('symbol aliases', () => assert.strictEqual(show('~P & Q | R'), '((NOT P AND Q) OR R)'));
test('extra whitespace', () => assert.strictEqual(show('  P    AND   Q '), '(P AND Q)'));
test('arbitrary variables R and S', () => assert.strictEqual(show('R OR S'), '(R OR S)'));
test('multi-letter variable', () => assert.strictEqual(show('rain -> wet'), '(rain -> wet)'));
test('double negation', () => assert.strictEqual(show('NOT NOT P'), 'NOT NOT P'));
test('brackets', () => assert.strictEqual(show('(P)'), 'P'));

console.log('\nPrecedence and associativity');
test('NOT binds tighter than AND', () => assert.strictEqual(show('NOT P AND Q'), '(NOT P AND Q)'));
test('AND binds tighter than OR', () => assert.strictEqual(show('P OR Q AND R'), '(P OR (Q AND R))'));
test('OR binds tighter than ->', () => assert.strictEqual(show('P -> Q OR R'), '(P -> (Q OR R))'));
test('-> binds tighter than <->', () => assert.strictEqual(show('P <-> Q -> R'), '(P <-> (Q -> R))'));
test('-> is right associative', () => assert.strictEqual(show('P -> Q -> R'), '(P -> (Q -> R))'));
test('AND is left associative', () => assert.strictEqual(show('P AND Q AND R'), '((P AND Q) AND R)'));
test('brackets override precedence', () => assert.strictEqual(show('(P OR Q) AND R'), '((P OR Q) AND R)'));
test('nested brackets', () => assert.strictEqual(show('NOT (P AND (Q OR R))'), 'NOT (P AND (Q OR R))'));

console.log('\nVariable collection');
test('collects sorted unique variables', () => {
  const r = parse('S AND P OR Q AND P');
  assert.deepStrictEqual(r.variables, ['P', 'Q', 'S']);
});

console.log('\nInvalid expressions (must not crash)');
test('empty string', () => bad('', 'empty'));
test('only whitespace', () => bad('   ', 'empty'));
test('missing right operand', () => bad('P AND', 'right operand'));
test('missing left operand', () => bad('AND P', 'left operand'));
test('two operators in a row', () => bad('P AND OR Q'));
test('missing operator between variables', () => bad('P Q', 'operator'));
test('unclosed bracket', () => bad('(P AND Q', 'never closed'));
test('unmatched closing bracket', () => bad('P AND Q)', 'no matching'));
test('empty brackets', () => bad('()', 'empty'));
test('operator before closing bracket', () => bad('(P AND)', 'right-hand'));
test('NOT without operand', () => bad('P AND NOT', 'operand'));
test('illegal character', () => bad('P # Q', 'unexpected character'));
test('lowercase keyword rejected', () => bad('P and Q', 'capitals'));
test('dangling implication', () => bad('P ->', 'right operand'));
test('broken arrow', () => bad('P - > Q'));
test('operand then NOT', () => bad('P NOT Q'));

console.log('\nRobustness');
test('non-string input does not throw', () => {
  assert.strictEqual(parse(null).ok, false);
  assert.strictEqual(parse(undefined).ok, false);
  assert.strictEqual(parse(42).ok, false);
});
test('deeply nested brackets still return a result', () => {
  const r = parse('('.repeat(500) + 'P' + ')'.repeat(500));
  assert.ok(typeof r.ok === 'boolean');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
