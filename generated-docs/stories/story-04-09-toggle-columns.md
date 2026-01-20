# Story: Toggle Grid Columns

**Epic:** Epic 4: Instrument Static Data Management
**Story:** 9 of 9

## User Story

**As a** user viewing the instruments grid
**I want** to show/hide columns
**So that** I can focus on the data relevant to my current task

## Acceptance Tests

### Happy Path
- [x] Given I am on the instruments grid, when I click "Columns", then I see a list of all columns with checkboxes
- [x] Given I uncheck "Status", when I apply, then the Status column is hidden
- [x] Given I hide columns, when I refresh the page, then my column preferences are remembered

### Edge Cases
- [x] Given I hide all columns, when I apply, then I see "At least one column must be visible" error

### Error Handling
- [x] Given I close the columns menu without applying, when I reopen it, then I see my previous settings

## Implementation Notes
- Store column preferences in localStorage
- Default visible columns: ISIN, Name, Asset Class, Currency
- Optional columns: Status, Check, Issuer, Maturity Date
- Include "Summary" vs "All Columns" toggle
