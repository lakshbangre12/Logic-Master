// parser.js
// Member 1: tokenizer, validator and parser for propositional logic.
//
// Public API (agreed with Member 2):
//   parse(text)      -> { ok: true, ast, variables } | { ok: false, error: { message, position } }
//   tokenize(text)   -> { ok: true, tokens } | { ok: false, error }
//   validate(tokens) -> { ok: true } | { ok: false, error }
//   astToString(ast) -> fully bracketed string (useful for debugging/display)
//   collectVariables(ast) -> sorted list of unique variable names
//
// AST node shapes (the internal representation Members 2 and 3 call):
//   { type: 'VAR',     name: 'P' }
//   { type: 'NOT',     operand: node }
//   { type: 'AND',     left: node, right: node }
//   { type: 'OR',      left: node, right: node }
//   { type: 'IMPLIES', left: node, right: node }
//   { type: 'IFF',     left: node, right: node }
//
// Precedence (highest to lowest): NOT, AND, OR, ->, <->
// "->" is right-associative; AND, OR and <-> are left-associative.

'use strict';

// ---------- Token types ----------
const T = {
  VAR: 'VAR',
  NOT: 'NOT',
  AND: 'AND',
  OR: 'OR',
  IMPLIES: 'IMPLIES',
  IFF: 'IFF',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
};

const BINARY_OPS = new Set([T.AND, T.OR, T.IMPLIES, T.IFF]);

// Words that are operators and cannot be used as variable names
const KEYWORDS = {
  NOT: T.NOT,
  AND: T.AND,
  OR: T.OR,
};

// ---------- Helper to build error objects ----------
function fail(message, position) {
  return { ok: false, error: { message, position } };
}

function describe(type) {
  return { AND: 'AND', OR: 'OR', IMPLIES: '->', IFF: '<->', NOT: 'NOT' }[type] || type;
}

// ---------- 1. TOKENIZER ----------
// Converts text into a list of tokens. Never throws.
function tokenize(input) {
  if (typeof input !== 'string') {
    return fail('Input must be a string.', 0);
  }

  const tokens = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // brackets
    if (ch === '(') { tokens.push({ type: T.LPAREN, pos: i }); i++; continue; }
    if (ch === ')') { tokens.push({ type: T.RPAREN, pos: i }); i++; continue; }

    // multi-character symbols: check "<->" before "->"
    if (input.startsWith('<->', i)) {
      tokens.push({ type: T.IFF, pos: i });
      i += 3;
      continue;
    }
    if (input.startsWith('->', i)) {
      tokens.push({ type: T.IMPLIES, pos: i });
      i += 2;
      continue;
    }

    // single-character symbol aliases
    if (ch === '~' || ch === '!') { tokens.push({ type: T.NOT, pos: i }); i++; continue; }
    if (ch === '&' || ch === '^') { tokens.push({ type: T.AND, pos: i }); i++; continue; }
    if (ch === '|') { tokens.push({ type: T.OR, pos: i }); i++; continue; }

    // words: keywords (AND/OR/NOT) or variable names
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) j++;
      const word = input.slice(i, j);
      const upper = word.toUpperCase();

      if (Object.prototype.hasOwnProperty.call(KEYWORDS, upper) && word === upper) {
        tokens.push({ type: KEYWORDS[upper], pos: i });
      } else if (word === 'v') {
        // a lone lowercase 'v' is accepted as the OR symbol
        tokens.push({ type: T.OR, pos: i });
      } else if (Object.prototype.hasOwnProperty.call(KEYWORDS, upper)) {
        // e.g. "and", "Not": reject so it is not silently treated as a variable
        return fail(`Operator "${word}" must be written in capitals (${upper}).`, i);
      } else {
        tokens.push({ type: T.VAR, name: word, pos: i });
      }
      i = j;
      continue;
    }

    // anything else is illegal
    return fail(`Unexpected character "${ch}".`, i);
  }

  return { ok: true, tokens };
}

// ---------- 2. VALIDATOR ----------
// Checks the token list BEFORE parsing/evaluation:
//  - expression not empty
//  - brackets balanced and not empty
//  - every operator has its operands
//  - no two operands in a row
function validate(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return fail('Expression is empty.', 0);
  }

  // bracket balance
  let depth = 0;
  for (const tok of tokens) {
    if (tok.type === T.LPAREN) depth++;
    if (tok.type === T.RPAREN) {
      depth--;
      if (depth < 0) return fail('Closing bracket ")" has no matching "(".', tok.pos);
    }
  }
  if (depth > 0) {
    const lastOpen = [...tokens].reverse().find((t) => t.type === T.LPAREN);
    return fail('Opening bracket "(" is never closed.', lastOpen.pos);
  }

  // check each token against its neighbours
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;
    const next = i < tokens.length - 1 ? tokens[i + 1] : null;

    // does the previous token end an operand? (a variable or a closing bracket)
    const prevEndsOperand = prev && (prev.type === T.VAR || prev.type === T.RPAREN);

    switch (tok.type) {
      case T.VAR:
      case T.LPAREN:
        if (prevEndsOperand) {
          return fail('Missing operator between operands.', tok.pos);
        }
        if (tok.type === T.LPAREN && next && next.type === T.RPAREN) {
          return fail('Empty brackets "()".', tok.pos);
        }
        break;

      case T.NOT:
        if (prevEndsOperand) {
          return fail('NOT cannot follow an operand; put an operator before it.', tok.pos);
        }
        if (!next) return fail('NOT is missing its operand.', tok.pos);
        break;

      case T.RPAREN:
        if (prev && (BINARY_OPS.has(prev.type) || prev.type === T.NOT)) {
          return fail('Operator is missing its right-hand operand before ")".', tok.pos);
        }
        break;

      default:
        // binary operators
        if (BINARY_OPS.has(tok.type)) {
          if (!prevEndsOperand) {
            return fail(`Operator "${describe(tok.type)}" is missing its left operand.`, tok.pos);
          }
          if (!next) {
            return fail(`Operator "${describe(tok.type)}" is missing its right operand.`, tok.pos);
          }
        }
    }
  }

  return { ok: true };
}

// ---------- 3. PARSER (recursive descent) ----------
// Grammar:
//   bicond  := implies ( "<->" implies )*
//   implies := or ( "->" implies )?
//   or      := and ( "OR" and )*
//   and     := not ( "AND" not )*
//   not     := "NOT" not | primary
//   primary := VARIABLE | "(" bicond ")"
function buildAst(tokens) {
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseIff() {
    let left = parseImplies();
    while (peek() && peek().type === T.IFF) {
      consume();
      const right = parseImplies();
      left = { type: 'IFF', left, right };
    }
    return left;
  }

  function parseImplies() {
    const left = parseOr();
    if (peek() && peek().type === T.IMPLIES) {
      consume();
      const right = parseImplies(); // right-associative
      return { type: 'IMPLIES', left, right };
    }
    return left;
  }

  function parseOr() {
    let left = parseAnd();
    while (peek() && peek().type === T.OR) {
      consume();
      const right = parseAnd();
      left = { type: 'OR', left, right };
    }
    return left;
  }

  function parseAnd() {
    let left = parseNot();
    while (peek() && peek().type === T.AND) {
      consume();
      const right = parseNot();
      left = { type: 'AND', left, right };
    }
    return left;
  }

  function parseNot() {
    if (peek() && peek().type === T.NOT) {
      consume();
      return { type: 'NOT', operand: parseNot() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = consume();
    if (!tok) throw new Error('Unexpected end of expression.');
    if (tok.type === T.VAR) return { type: 'VAR', name: tok.name };
    if (tok.type === T.LPAREN) {
      const inner = parseIff();
      const close = consume();
      if (!close || close.type !== T.RPAREN) {
        throw new Error('Expected ")".');
      }
      return inner;
    }
    throw new Error(`Unexpected token "${describe(tok.type)}".`);
  }

  const ast = parseIff();
  if (pos < tokens.length) {
    throw new Error('Unexpected extra tokens after expression.');
  }
  return ast;
}

// ---------- Utilities for Members 2 and 3 ----------

// Sorted list of unique variable names, e.g. ['P', 'Q', 'R']
function collectVariables(ast) {
  const set = new Set();
  (function walk(node) {
    if (node.type === 'VAR') set.add(node.name);
    else if (node.type === 'NOT') walk(node.operand);
    else { walk(node.left); walk(node.right); }
  })(ast);
  return [...set].sort();
}

// Fully bracketed readable form, e.g. "((P AND Q) -> R)"
function astToString(node) {
  switch (node.type) {
    case 'VAR': return node.name;
    case 'NOT': return `NOT ${astToString(node.operand)}`;
    case 'AND': return `(${astToString(node.left)} AND ${astToString(node.right)})`;
    case 'OR': return `(${astToString(node.left)} OR ${astToString(node.right)})`;
    case 'IMPLIES': return `(${astToString(node.left)} -> ${astToString(node.right)})`;
    case 'IFF': return `(${astToString(node.left)} <-> ${astToString(node.right)})`;
    default: return '?';
  }
}

// ---------- MAIN ENTRY POINT ----------
// Never throws. Always returns an object with an `ok` field.
function parse(text) {
  try {
    const tokenResult = tokenize(text);
    if (!tokenResult.ok) return tokenResult;

    const validation = validate(tokenResult.tokens);
    if (!validation.ok) return validation;

    const ast = buildAst(tokenResult.tokens);
    return { ok: true, ast, variables: collectVariables(ast) };
  } catch (err) {
    return fail(err.message || 'Could not parse expression.', 0);
  }
}

// ---------- Exports (works in Node and in the browser) ----------
const api = { parse, tokenize, validate, astToString, collectVariables, TOKEN_TYPES: T };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.LogicParser = api;
}
