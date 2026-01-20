# Story: View Instrument Popup Details

**Epic:** Epic 4: Instrument Static Data Management
**Story:** 8 of 9

## User Story

**As a** user reviewing data
**I want** to view instrument details in a quick popup
**So that** I can see key information without navigating away from the current page

## Acceptance Tests

### Happy Path
- [x] Given I hover over an ISIN, when I click the info icon, then I see a popup with instrument details
- [x] Given I view the popup, when I see the details, then I see: Name, Asset Class, Currency, Issuer, Maturity Date, Status
- [ ] Given I view the popup, when I click "View Full Details", then I navigate to the instrument detail page

### Edge Cases
- [x] Given I click outside the popup, when I click, then the popup closes

### Error Handling
- [ ] Given the API fails, when I open popup, then I see "Failed to load details" in the popup

## Implementation Notes
- API: GET /v1/instruments/{id} (reuse detail endpoint)
- Popup should be modal overlay with close button
- Include "Edit" button if user has permissions
