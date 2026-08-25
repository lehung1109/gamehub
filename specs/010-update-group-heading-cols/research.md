# Phase 0: Research

## Unknowns Resolved

- **Component Identification**: The spec refers to the `group-heading-present` component. Research shows this refers to the section in `src/components/tenses/TenseHubMap.tsx` labeled with `aria-labelledby="group-heading-present"`. The grid layout is defined within a `map` loop for all tense groups.
  - Decision: Modify the grid layout classes in `TenseHubMap.tsx`.
  - Rationale: The `TenseHubMap.tsx` iterates over `TENSE_GROUPS` and renders a responsive grid for the cards. The current grid classes are `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`. Removing `xl:grid-cols-5` and `2xl:grid-cols-6` will effectively cap the columns at 4 for all desktop viewports (`lg` and above).
  - Alternatives considered: Conditionally applying max 4 columns only to the "present" group. Rejected because consistency across tense groups is a better UX and the same readability issue exists for other groups with more than 4 items.

- **Responsive Constraints**: How to restrict to 4 columns on desktop?
  - Decision: Change the grid class string from `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6` to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`.
  - Rationale: Tailwind CSS is mobile-first. By defining `lg:grid-cols-4` and providing no overrides for larger breakpoints, it will use 4 columns for `lg`, `xl`, and `2xl` viewports.
