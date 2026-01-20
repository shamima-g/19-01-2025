# Story: View Instrument History

**Epic:** Epic 4: Instrument Static Data Management
**Story:** 6 of 9

## User Story

**As a** portfolio analyst
**I want** to view historical snapshots of an instrument
**So that** I can compare values over time

## Acceptance Tests

### Happy Path
- [x] Given I select an instrument, when I click "History", then I see a table with Date, Name, Asset Class, Currency, Status columns
- [x] Given I view history, when I see multiple snapshots, then they are sorted by date descending
- [x] Given I select two snapshots, when I click "Compare", then I see a side-by-side diff view

### Edge Cases
- [x] Given an instrument has no historical snapshots, when I view history, then I see "No historical data available"

### Error Handling
- [x] Given the API fails, when I load history, then I see "Failed to load history. Please try again."

## Implementation Notes
- API: GET /v1/instruments/{id}/history
- History snapshots created on each update
- Compare view highlights changed fields
