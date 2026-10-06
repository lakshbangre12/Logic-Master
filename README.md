# LogicMaster — Member 4 Proof Assistant

## Files

- `proof.js` — main Proof Assistant engine.
- `proofChallenges.js` — progressive proof challenge data.
- `proof.test.js` — unit tests for the Proof Assistant.

## Main workflow

`premises → available statements → student step → rule verification → new statement → goal`

## Supported rules

- Modus Ponens (`MP`)
- Modus Tollens (`MT`)
- Hypothetical Syllogism (`HS`)
- Disjunctive Syllogism (`DS`)
- Simplification (`SIMP`)
- Conjunction (`CONJ`)

## Important functions

### `verifyProofStep(statements, conclusion, rule, fromLines)`

Checks whether a single student step is mathematically valid.

Example:

```js
verifyProofStep(
  ["P → Q", "P"],
  "Q",
  "MP",
  [1, 2]
);
```

### `generateProof(premises, goal)`

Automatically searches for a proof using the supported rules and returns an ordered list of steps.

### `verifyProof(premises, goal, studentSteps)`

Checks a student's complete proof one step at a time.

### `createProofSession(premises, goal)` / `addStudentStep(...)`

Useful for an interactive UI where the user submits one proof step at a time.

## Integration with Member 5

Member 5 can import the module and display the returned objects directly in the proof screen.

```js
import { createProofSession, addStudentStep, isGoalReached } from "./proof.js";

const session = createProofSession(["P → Q", "P"], "Q");
const result = addStudentStep(session, "Q", "MP", [1, 2]);

console.log(result.message);
console.log(isGoalReached(session));
```

## Integration with Member 3

The Proof Assistant accepts the same core inference-rule concepts as Member 3. If Member 3 exposes a different function signature, the integration member can use this module's returned `rule`, `valid`, `message`, `premisesUsed`, and `explanation` fields as the adapter boundary.

## Test

Because these files use ES modules, add this to `package.json`:

```json
{
  "type": "module"
}
```

Then run:

```bash
node --test proof.test.js
```
