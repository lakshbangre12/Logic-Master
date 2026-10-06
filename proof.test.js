/**
 * LogicMaster - Member 4 tests
 * Run with Node's built-in test runner:
 *   node --test proof.test.js
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyProofStep,
  generateProof,
  verifyProof,
  createProofSession,
  addStudentStep,
  isGoalReached,
} from "./proof.js";
import { getChallengeById, getChallengesByLevel } from "./proofChallenges.js";

test("Modus Ponens is accepted", () => {
  const result = verifyProofStep(["P → Q", "P"], "Q", "MP", [1, 2]);
  assert.equal(result.valid, true);
});

test("Invalid affirming the consequent is rejected", () => {
  const result = verifyProofStep(["P → Q", "Q"], "P", "MP", [1, 2]);
  assert.equal(result.valid, false);
});

test("Modus Tollens is accepted", () => {
  const result = verifyProofStep(["P → Q", "¬Q"], "¬P", "MT", [1, 2]);
  assert.equal(result.valid, true);
});

test("Hypothetical Syllogism is accepted", () => {
  const result = verifyProofStep(["P → Q", "Q → R"], "P → R", "HS", [1, 2]);
  assert.equal(result.valid, true);
});

test("Disjunctive Syllogism is accepted", () => {
  const result = verifyProofStep(["P ∨ Q", "¬P"], "Q", "DS", [1, 2]);
  assert.equal(result.valid, true);
});

test("Simplification is accepted", () => {
  const result = verifyProofStep(["P ∧ Q"], "Q", "SIMP", [1]);
  assert.equal(result.valid, true);
});

test("Conjunction is accepted", () => {
  const result = verifyProofStep(["P", "Q"], "P ∧ Q", "CONJ", [1, 2]);
  assert.equal(result.valid, true);
});

test("Automatic proof derives a simple goal", () => {
  const result = generateProof(["P → Q", "P"], "Q");
  assert.equal(result.success, true);
  assert.equal(result.finalStatement, "Q");
});

test("Automatic proof handles a multi-step problem", () => {
  const result = generateProof(["P → Q", "Q → R", "P"], "R");
  assert.equal(result.success, true);
  assert.equal(result.finalStatement, "R");
});

test("Automatic proof handles simplification followed by Modus Ponens", () => {
  const result = generateProof(["P ∧ Q", "Q → R"], "R");
  assert.equal(result.success, true);
  assert.equal(result.finalStatement, "R");
});

test("Invalid proof step gives useful feedback", () => {
  const result = verifyProofStep(["P → Q", "Q"], "P", "MP", [1, 2]);
  assert.equal(result.valid, false);
  assert.match(result.message, /Incorrect Modus Ponens/);
});

test("Complete student proof is verified", () => {
  const result = verifyProof(
    ["P → Q", "Q → R", "P"],
    "R",
    [
      { statement: "Q", rule: "MP", fromLines: [1, 3] },
      { statement: "R", rule: "MP", fromLines: [2, 4] },
    ],
  );
  assert.equal(result.success, true);
});

test("Proof session tracks available statements", () => {
  const session = createProofSession(["P → Q", "P"], "Q");
  const result = addStudentStep(session, "Q", "MP", [1, 2]);
  assert.equal(result.valid, true);
  assert.equal(isGoalReached(session), true);
});

test("Challenge data is available by level and ID", () => {
  assert.equal(getChallengeById("P001").goal, "Q");
  assert.equal(getChallengesByLevel(1).length > 0, true);
});
