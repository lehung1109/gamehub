# Feature Specification: Update Group Heading Columns

**Feature Branch**: `[010-update-group-heading-cols]`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "\"group-heading-present\" đang có cols khá lớn ở desktop, dẫn tới col width khá bé, để 4 ở desktop là hợp lý"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop Layout Optimization (Priority: P1)

As a user on a desktop device, I want the "group-heading-present" component to display with a maximum of 4 columns so that the content within each column is wide enough to be easily readable.

**Why this priority**: Core UI fix to improve readability and usability on large screens.

**Independent Test**: Can be fully tested by viewing the "group-heading-present" component on a desktop viewport and verifying it uses a 4-column layout.

**Acceptance Scenarios**:

1. **Given** a user is viewing the application on a desktop screen (e.g., width >= 1024px), **When** the "group-heading-present" component is rendered, **Then** it should display items in exactly 4 columns.
2. **Given** a user is viewing the application on a smaller screen (tablet/mobile), **When** the component is rendered, **Then** it should gracefully scale down to fewer columns (e.g., 2 or 1) as appropriate for the device width.

---

### Edge Cases

- What happens when the number of items is less than 4? (It should still align correctly without breaking the grid).
- How does the layout handle extremely long text in one of the columns? (It should wrap text appropriately without breaking the column width).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `group-heading-present` component MUST use a responsive grid layout.
- **FR-002**: On desktop viewports (e.g., `lg` breakpoint, typically >= 1024px), the component MUST constrain its layout to exactly 4 columns.
- **FR-003**: The component MUST preserve its existing responsive layout behavior for mobile and tablet viewports.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visual verification confirms the component displays exactly 4 columns on desktop screens.
- **SC-002**: The column width is increased sufficiently to improve text readability on desktop.
- **SC-003**: Existing layout remains unbroken on mobile and tablet devices.

## Assumptions

- The `group-heading-present` component currently uses a responsive grid layout system.
- The fix only involves updating the responsive layout configuration for this specific component.
- Standard desktop breakpoints (e.g., >= 1024px) are used in the project to target desktop screens.
