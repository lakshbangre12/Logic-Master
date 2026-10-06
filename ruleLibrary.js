// ============================================================
// LOGICMASTER — INFERENCE RULE LIBRARY
// ============================================================
//
// This file contains information about the inference rules
// supported by LogicMaster.
//
// Member 3 creates and maintains this rule library.
// Member 4 can use this information for the Proof Assistant.
// Member 5 can use this information for the UI.
//
// ============================================================


const RULES = {

    // ========================================================
    // MODUS PONENS
    // ========================================================

    modusPonens: {

        id: "modus-ponens",

        name: "Modus Ponens",

        shortName: "MP",

        category: "Direct Inference",

        premises: [
            "P → Q",
            "P"
        ],

        conclusion: "Q",

        pattern: "P → Q, P ⊢ Q",

        explanation:
            "If P implies Q and P is true, then Q must also be true.",

        steps: [
            "Given P → Q",
            "Given P",
            "Therefore Q by Modus Ponens"
        ],

        example: {
            premises: [
                "If it rains, the ground is wet.",
                "It is raining."
            ],
            conclusion:
                "The ground is wet."
        }
    },


    // ========================================================
    // MODUS TOLLENS
    // ========================================================

    modusTollens: {

        id: "modus-tollens",

        name: "Modus Tollens",

        shortName: "MT",

        category: "Indirect Inference",

        premises: [
            "P → Q",
            "¬Q"
        ],

        conclusion: "¬P",

        pattern: "P → Q, ¬Q ⊢ ¬P",

        explanation:
            "If P implies Q and Q is false, then P must also be false.",

        steps: [
            "Given P → Q",
            "Given ¬Q",
            "Therefore ¬P by Modus Tollens"
        ],

        example: {
            premises: [
                "If it rains, the ground is wet.",
                "The ground is not wet."
            ],
            conclusion:
                "It is not raining."
        }
    },


    // ========================================================
    // HYPOTHETICAL SYLLOGISM
    // ========================================================

    hypotheticalSyllogism: {

        id: "hypothetical-syllogism",

        name: "Hypothetical Syllogism",

        shortName: "HS",

        category: "Chain Inference",

        premises: [
            "P → Q",
            "Q → R"
        ],

        conclusion: "P → R",

        pattern: "P → Q, Q → R ⊢ P → R",

        explanation:
            "If P implies Q and Q implies R, then P implies R.",

        steps: [
            "Given P → Q",
            "Given Q → R",
            "Therefore P → R by Hypothetical Syllogism"
        ],

        example: {
            premises: [
                "If I study, I understand the topic.",
                "If I understand the topic, I can solve the problem."
            ],
            conclusion:
                "If I study, I can solve the problem."
        }
    },


    // ========================================================
    // DISJUNCTIVE SYLLOGISM
    // ========================================================

    disjunctiveSyllogism: {

        id: "disjunctive-syllogism",

        name: "Disjunctive Syllogism",

        shortName: "DS",

        category: "Disjunctive Inference",

        premises: [
            "P ∨ Q",
            "¬P"
        ],

        conclusion: "Q",

        pattern: "P ∨ Q, ¬P ⊢ Q",

        explanation:
            "If either P or Q is true and P is false, then Q must be true.",

        steps: [
            "Given P ∨ Q",
            "Given ¬P",
            "Therefore Q by Disjunctive Syllogism"
        ],

        example: {
            premises: [
                "Either I will study or I will play.",
                "I will not study."
            ],
            conclusion:
                "I will play."
        }
    },


    // ========================================================
    // SIMPLIFICATION
    // ========================================================

    simplification: {

        id: "simplification",

        name: "Simplification",

        shortName: "S",

        category: "Conjunctive Inference",

        premises: [
            "P ∧ Q"
        ],

        conclusion: "P",

        pattern: "P ∧ Q ⊢ P",

        explanation:
            "If both P and Q are true, then P alone is also true.",

        steps: [
            "Given P ∧ Q",
            "Therefore P by Simplification"
        ],

        example: {
            premises: [
                "I studied Mathematics and Physics."
            ],
            conclusion:
                "I studied Mathematics."
        }
    },


    // ========================================================
    // CONJUNCTION
    // ========================================================

    conjunction: {

        id: "conjunction",

        name: "Conjunction",

        shortName: "CONJ",

        category: "Conjunctive Inference",

        premises: [
            "P",
            "Q"
        ],

        conclusion: "P ∧ Q",

        pattern: "P, Q ⊢ P ∧ Q",

        explanation:
            "If P and Q are both true, they can be combined using AND.",

        steps: [
            "Given P",
            "Given Q",
            "Therefore P ∧ Q by Conjunction"
        ],

        example: {
            premises: [
                "I studied Mathematics.",
                "I studied Physics."
            ],
            conclusion:
                "I studied Mathematics and Physics."
        }
    },


    // ========================================================
    // ADDITION
    // ========================================================

    addition: {

        id: "addition",

        name: "Addition",

        shortName: "ADD",

        category: "Disjunctive Inference",

        premises: [
            "P"
        ],

        conclusion: "P ∨ Q",

        pattern: "P ⊢ P ∨ Q",

        explanation:
            "If P is true, then P OR any proposition Q is also true.",

        steps: [
            "Given P",
            "Therefore P ∨ Q by Addition"
        ],

        example: {
            premises: [
                "It is raining."
            ],
            conclusion:
                "It is raining or it is sunny."
        }
    }

};


// ============================================================
// GET ALL RULES
// ============================================================

function getAllRules() {
    return Object.values(RULES);
}


// ============================================================
// GET ONE RULE BY ID
// ============================================================

function getRuleById(id) {

    return getAllRules().find(
        rule => rule.id === id
    ) || null;
}


// ============================================================
// GET ONE RULE BY NAME
// ============================================================

function getRuleByName(name) {

    return getAllRules().find(
        rule =>
            rule.name.toLowerCase() === name.toLowerCase()
    ) || null;
}


// ============================================================
// GET RULE NAMES
// ============================================================

function getRuleNames() {

    return getAllRules().map(
        rule => rule.name
    );
}


// ============================================================
// GET RULES BY CATEGORY
// ============================================================

function getRulesByCategory(category) {

    return getAllRules().filter(
        rule =>
            rule.category.toLowerCase() === category.toLowerCase()
    );
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    RULES,
    getAllRules,
    getRuleById,
    getRuleByName,
    getRuleNames,
    getRulesByCategory
};