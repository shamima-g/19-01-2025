# Story: View Instruments Grid

**Epic:** Epic 4: Instrument Static Data Management
**Story:** 1 of 9

## User Story

**As a** data steward
**I want** to view all instruments in a searchable, sortable grid
**So that** I can quickly find and navigate to specific instruments for review or updates

## Acceptance Tests

### Happy Path
- [x] Given I navigate to Instrument Static page, when the page loads, then I see a grid with columns: ISIN, Name, Asset Class, Currency, Status
- [x] Given I am on the instruments grid, when I click a column header, then the grid sorts by that column
- [x] Given I am on the instruments grid, when I type in the search box, then the grid filters to matching instruments
- [x] Given I am on the instruments grid, when I click an instrument row, then I see the instrument detail view

### Edge Cases
- [x] Given no instruments exist, when I load the page, then I see "No instruments found" message
- [x] Given the grid has 100+ instruments, when I scroll down, then pagination or virtual scrolling loads more rows

### Error Handling
- [x] Given the API fails, when I load the page, then I see "Failed to load instruments. Please try again."

## Implementation Notes
- API: GET /v1/instruments
- Grid should support multi-column sort and text search across all visible columns
- Include column visibility toggle (Status, Check columns collapsible)
- Export to Excel button for filtered results
