# Research & Technical Decisions: Reading Comprehension

## Decision: Layout Strategy for Desktop vs Mobile
- **Decision**: Use a CSS Grid/Flexbox approach. On desktop (md/lg breakpoints): Two-column layout (Text left, Questions right). On mobile (sm): Stacked layout, where the text is in a scrollable fixed-height container on top, and questions are below it.
- **Rationale**: Keeps both the passage and the current question visible simultaneously.
- **Alternatives considered**: Tabs on mobile (Text | Questions). Rejected because users constantly need to refer back to the text while answering, and switching tabs causes cognitive friction.

## Decision: Vocabulary Highlighting Implementation
- **Decision**: Parse the raw text and replace defined vocabulary words with an interactive `<Popover>` or `<Tooltip>` component from Radix UI.
- **Rationale**: Ensures accessible, reliable tooltips. The parsing logic will use string replacement or regex before rendering.
- **Alternatives considered**: Raw HTML with custom click handlers. Rejected due to accessibility and maintainability concerns.
