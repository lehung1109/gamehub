# Data Model: Complete Past Tenses

## Entities

### Tense JSON File

Each of the four past tense files (`past-simple.json`, `past-continuous.json`, `past-perfect.json`, `past-perfect-continuous.json`) will follow this structure:

- **`metadata`**: Information about the tense (e.g., id, title, description).
- **`quickRules`**: Array of rules and examples explaining the tense.
- **`challenges`**: Array of precisely 80 challenge items, distributed as:
  - 20 `conjugation` challenges
  - 20 `errorHunting` challenges
  - 20 `sentenceBuilding` challenges
  - 20 `devOpsChallenge` challenges

**Validation Rules**:
- The JSON structure must strictly conform to the existing tense schema used in the application.
- All properties (arrays, objects) must be present and correctly typed to avoid runtime errors (rigorous pre-flight validation required).
- Content must reflect an IT/Workplace context.

### Tense Manifest (`index.json`)

The `src/data/tenses/index.json` file tracks all tenses.

- **`tenses`**: Array of tense metadata objects.
  - For the four past tenses (`past-simple`, `past-continuous`, `past-perfect`, `past-perfect-continuous`), the `status` field must be updated from `"coming_soon"` (or similar) to `"active"`.
