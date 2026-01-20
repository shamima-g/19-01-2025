# Story: View Instrument Audit Trail

**Epic:** Epic 4: Instrument Static Data Management
**Story:** 5 of 9

## User Story

**As a** compliance officer
**I want** to view the full audit trail for an instrument
**So that** I can see who changed what and when for governance purposes

## Acceptance Tests

### Happy Path
- [x] Given I select an instrument, when I click "Audit Trail", then I see a chronological list of all changes
- [x] Given I view the audit trail, when I see a change record, then I see: Date, User, Field Changed, Old Value, New Value
- [x] Given I view the audit trail, when I click "Export", then I download an Excel file of the audit history

### Edge Cases
- [x] Given an instrument has no changes, when I view audit trail, then I see "No changes recorded" message
- [ ] Given audit trail has 100+ entries, when I scroll, then pagination loads older records

### Error Handling
- [x] Given the API fails, when I load audit trail, then I see "Failed to load audit trail. Please try again."

## Implementation Notes
- API: GET /v1/instruments/{id}/audit-trail
- Sort by timestamp descending (newest first)
- Include filter by date range and user
- Audit records are immutable (read-only)
