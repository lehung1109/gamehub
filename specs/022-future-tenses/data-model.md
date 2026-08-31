# Data Model: Future Tenses

The data model for this feature perfectly matches the existing `TenseData` model in the application.

## Tense JSON Schema

Each future tense file (`future-*.json`) must have the following root structure:

```json
{
  "metadata": {
    "id": "future-simple",
    "slug": "future-simple",
    "name": "Future Simple",
    "vietnameseName": "Thì Tương Lai Đơn",
    "group": "future",
    "status": "active",
    "level": "String (e.g. A1-A2 (Beginner))",
    "badge": "String (Optional)",
    "description": "String",
    "estimatedMinutes": 10,
    "challengeCount": 10
  },
  "quickRules": [
    {
      "id": "String",
      "category": "String",
      "titleVi": "String",
      "titleEn": "String",
      "summaryVi": "String",
      "formulas": [
        {
          "label": "Khẳng định (+)",
          "structure": "String",
          "example": "String",
          "vietnameseTranslation": "String"
        }
      ],
      "workplaceTips": [ "String" ],
      "rulesList": [
        {
          "ruleVi": "String",
          "condition": "String",
          "examples": [
             { "en": "String", "vi": "String" }
          ]
        }
      ]
    }
  ],
  "challenges": {
    "conjugation": [ ... ],
    "multiple_choice": [ ... ],
    "fill_in_the_blanks": [ ... ]
  }
}
```

The `index.json` entry structure remains unchanged, only `status` transitions from `"coming_soon"` to `"active"`.
