/**
 * LogicMaster - Member 4 Proof Challenge Data
 * Difficulty increases from Level 1 to Level 5.
 */

export const proofChallenges = [
  {
    id: "P001",
    level: 1,
    difficulty: "Easy",
    title: "The Direct Conclusion",
    premises: ["P → Q", "P"],
    goal: "Q",
    expectedRule: "MP",
    hint: "Look for an implication and its antecedent.",
    explanation: "P → Q together with P gives Q by Modus Ponens.",
    xp: 50,
  },
  {
    id: "P002",
    level: 1,
    difficulty: "Easy",
    title: "Reverse the Consequence",
    premises: ["P → Q", "¬Q"],
    goal: "¬P",
    expectedRule: "MT",
    hint: "You know that Q is false. What does P → Q tell you about P?",
    explanation: "P → Q and ¬Q give ¬P by Modus Tollens.",
    xp: 50,
  },
  {
    id: "P003",
    level: 1,
    difficulty: "Easy",
    title: "Join the Facts",
    premises: ["P", "Q"],
    goal: "P ∧ Q",
    expectedRule: "CONJ",
    hint: "Combine both available facts using ∧.",
    explanation: "P and Q can be combined as P ∧ Q by Conjunction.",
    xp: 50,
  },
  {
    id: "P004",
    level: 1,
    difficulty: "Easy",
    title: "Take One Part",
    premises: ["P ∧ Q"],
    goal: "Q",
    expectedRule: "SIMP",
    hint: "A conjunction contains both of its components.",
    explanation: "From P ∧ Q, Q follows by Simplification.",
    xp: 50,
  },
  {
    id: "P005",
    level: 2,
    difficulty: "Medium",
    title: "Chain Reaction",
    premises: ["P → Q", "Q → R"],
    goal: "P → R",
    expectedRule: "HS",
    hint: "The conclusion of the first implication becomes the premise of the second.",
    explanation: "P → Q and Q → R combine to give P → R by Hypothetical Syllogism.",
    xp: 75,
  },
  {
    id: "P006",
    level: 2,
    difficulty: "Medium",
    title: "Either Way",
    premises: ["P ∨ Q", "¬P"],
    goal: "Q",
    expectedRule: "DS",
    hint: "One side of the disjunction is ruled out.",
    explanation: "From P ∨ Q and ¬P, Q follows by Disjunctive Syllogism.",
    xp: 75,
  },
  {
    id: "P007",
    level: 2,
    difficulty: "Medium",
    title: "Two Steps",
    premises: ["P → Q", "P", "Q → R"],
    goal: "R",
    expectedRule: "MP",
    hint: "First derive Q, then use Q with Q → R.",
    explanation: "MP gives Q from P → Q and P; another MP gives R from Q → R and Q.",
    xp: 100,
  },
  {
    id: "P008",
    level: 3,
    difficulty: "Medium-Hard",
    title: "Hidden Component",
    premises: ["P ∧ Q", "Q → R"],
    goal: "R",
    expectedRule: "SIMP + MP",
    hint: "Extract Q first, then use the implication.",
    explanation: "Simplify P ∧ Q to Q, then apply Modus Ponens to Q → R and Q.",
    xp: 125,
  },
  {
    id: "P009",
    level: 3,
    difficulty: "Medium-Hard",
    title: "Chain and Strike",
    premises: ["P → Q", "Q → R", "P"],
    goal: "R",
    expectedRule: "HS + MP",
    hint: "Connect the two implications first, then use P.",
    explanation: "HS gives P → R; MP with P then gives R.",
    xp: 125,
  },
  {
    id: "P010",
    level: 4,
    difficulty: "Hard",
    title: "Eliminate and Conclude",
    premises: ["P ∨ Q", "¬P", "Q → R"],
    goal: "R",
    expectedRule: "DS + MP",
    hint: "Remove P from the disjunction first.",
    explanation: "DS gives Q from P ∨ Q and ¬P; MP then gives R from Q → R and Q.",
    xp: 150,
  },
  {
    id: "P011",
    level: 4,
    difficulty: "Hard",
    title: "Double Negation Path",
    premises: ["P → Q", "Q → R", "¬R"],
    goal: "¬P",
    expectedRule: "MT + MT",
    hint: "Work backwards through the implications using Modus Tollens.",
    explanation: "MT on Q → R and ¬R gives ¬Q; MT on P → Q and ¬Q gives ¬P.",
    xp: 150,
  },
  {
    id: "P012",
    level: 5,
    difficulty: "Expert",
    title: "Final Logic Master",
    premises: ["P ∧ Q", "Q → R", "R → S"],
    goal: "S",
    expectedRule: "SIMP + MP + MP",
    hint: "Extract Q, derive R, then derive S.",
    explanation: "Simplify P ∧ Q to Q; MP gives R from Q → R; another MP gives S from R → S.",
    xp: 200,
  },
];

export function getChallengesByLevel(level) {
  return proofChallenges.filter(challenge => challenge.level === Number(level));
}

export function getChallengeById(id) {
  return proofChallenges.find(challenge => challenge.id === id) ?? null;
}

export function getUnlockedChallenges(level) {
  return proofChallenges.filter(challenge => challenge.level <= Number(level));
}

export default proofChallenges;
