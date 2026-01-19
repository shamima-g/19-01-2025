# Screen: Data Confirmation

## Purpose

Guided verification screen with 3 tabs to check data completeness before approvals. Links to fix missing data jump to relevant maintenance screens.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Other Files]  Monthly Process > Data Confirmation > Jan 2025                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Data Confirmation - January 2025                                                |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Complete all checks before proceeding to approvals.                             |
|                                                                                   |
|  [File Check]  [Main Data Check]  [Other Data Check]                            |
|  ────────────                                                                     |
|                                                                                   |
|  ┌─ File Check Tab (Active) ──────────────────────────────────────────────────┐ |
|  │                                                                              │ |
|  │  File Import Completeness                                                   │ |
|  │  ───────────────────────────────────────────────────────────────────────    │ |
|  │                                                                              │ |
|  │  Portfolio Files:                                                           │ |
|  │  ─────────────────                                                           │ |
|  │                                                                              │ |
|  │  ┌────────────────────┬────────────┬────────────┬──────────────────────┐    │ |
|  │  | Portfolio          | Files      | Status     | Actions              |    │ |
|  │  |                    | Imported   |            |                      |    │ |
|  │  ├────────────────────┼────────────┼────────────┼──────────────────────┤    │ |
|  │  | PF-001             | 7 of 7     | ✓ Complete | [View Details]       |    │ |
|  │  | (Conservative      |            |            |                      |    │ |
|  │  | Growth)            |            |            |                      |    │ |
|  │  ├────────────────────┼────────────┼────────────┼──────────────────────┤    │ |
|  │  | PF-002             | 6 of 7     | ⚠️ Pending | [View Details]       |    │ |
|  │  | (Balanced          | (Missing:  |            | [Go to Portfolio     |    │ |
|  │  | Portfolio)         | Cash)      |            | Files Dashboard]     |    │ |
|  │  ├────────────────────┼────────────┼────────────┼──────────────────────┤    │ |
|  │  | PF-003             | 5 of 7     | ❌ Errors  | [View Details]       |    │ |
|  │  | (Growth            | (2 failed) |            | [Go to Portfolio     |    │ |
|  │  | Portfolio)         |            |            | Files Dashboard]     |    │ |
|  │  └────────────────────┴────────────┴────────────┴──────────────────────┘    │ |
|  │                                                                              │ |
|  │  Other Files:                                                                │ |
|  │  ─────────────                                                                │ |
|  │                                                                              │ |
|  │  ┌──────────────────────┬────────────┬──────────────────────────────────┐   │ |
|  │  | File Category        | Status     | Actions                          |   │ |
|  │  ├──────────────────────┼────────────┼──────────────────────────────────┤   │ |
|  │  | Bloomberg Files      | ✓ Complete | [View Details]                   |   │ |
|  │  | (3 of 3)             |            |                                  |   │ |
|  │  ├──────────────────────┼────────────┼──────────────────────────────────┤   │ |
|  │  | Custodian Files      | ⚠️ Pending | [View Details]                   |   │ |
|  │  | (2 of 3)             | (Missing:  | [Go to Other Files Dashboard]    |   │ |
|  │  |                      | Cash)      |                                  |   │ |
|  │  └──────────────────────┴────────────┴──────────────────────────────────┘   │ |
|  │                                                                              │ |
|  │  Overall File Check: ⚠️ Incomplete - 2 portfolios with issues                │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [← Back to Other Files]              [Refresh]  [Proceed to Main Data Check →] |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

MAIN DATA CHECK TAB:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [File Check]  [Main Data Check]  [Other Data Check]                            |
|                ─────────────────                                                  |
|                                                                                   |
|  ┌─ Main Data Check Tab (Active) ──────────────────────────────────────────────┐|
|  │                                                                              │|
|  │  Core Data Validation                                                       │|
|  │  ───────────────────────────────────────────────────────────────────────    │|
|  │                                                                              │|
|  │  ┌────────────────────────┬──────────┬──────────┬──────────────────────┐   │|
|  │  | Data Category          | Records  | Status   | Actions              |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Instrument Static      | 1,247    | ⚠️ 23    | [View Issues]        |   │|
|  │  |                        |          | Missing  | [Go to Instrument    |   │|
|  │  |                        |          | ISINs    | Static Page]         |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Holdings               | 12,456   | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Transactions           | 2,341    | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Income                 | 523      | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Cash Positions         | 8        | ⚠️ 1     | [View Issues]        |   │|
|  │  |                        |          | Missing  | [Add Cash Position]  |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Performance Data       | 8        | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Fees                   | 24       | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Credit Ratings         | 523      | ⚠️ 15    | [View Issues]        |   │|
|  │  |                        |          | Missing  | [Go to Credit Rating |   │|
|  │  |                        |          |          | Page]                |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Duration & YTM         | 342      | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Beta Values            | 856      | ✓ Valid  | [View Summary]       |   │|
|  │  └────────────────────────┴──────────┴──────────┴──────────────────────┘   │|
|  │                                                                              │|
|  │  Overall Main Data Check: ⚠️ 3 categories with missing data                  │|
|  │                                                                              │|
|  └──────────────────────────────────────────────────────────────────────────────┘|
|                                                                                   |
|  [← Back to File Check]                   [Refresh]  [Proceed to Other Data →]  |
|                                                                                   |
+-----------------------------------------------------------------------------------+

OTHER DATA CHECK TAB:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [File Check]  [Main Data Check]  [Other Data Check]                            |
|                                   ────────────────                                |
|                                                                                   |
|  ┌─ Other Data Check Tab (Active) ─────────────────────────────────────────────┐|
|  │                                                                              │|
|  │  Supplementary Data Validation                                              │|
|  │  ───────────────────────────────────────────────────────────────────────    │|
|  │                                                                              │|
|  │  ┌────────────────────────┬──────────┬──────────┬──────────────────────┐   │|
|  │  | Data Category          | Records  | Status   | Actions              |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Bloomberg Market       | 15,247   | ✓ Valid  | [View Summary]       |   │|
|  │  | Prices                 |          |          |                      |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Bloomberg FX Rates     | 32       | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Custodian Holdings     | 12,398   | ⚠️ 58    | [View Discrepancies] |   │|
|  │  | (Reconciliation)       |          | Discrep. | [Go to Reconcilia-   |   │|
|  │  |                        |          |          | tion Screen]         |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Custodian              | 2,335    | ✓ Match  | [View Summary]       |   │|
|  │  | Transactions           |          |          |                      |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Index Prices           | 87       | ✓ Valid  | [View Summary]       |   │|
|  │  ├────────────────────────┼──────────┼──────────┼──────────────────────┤   │|
|  │  | Custom Holdings        | 15       | ✓ Valid  | [View Summary]       |   │|
|  │  └────────────────────────┴──────────┴──────────┴──────────────────────┘   │|
|  │                                                                              │|
|  │  Overall Other Data Check: ⚠️ 58 custodian discrepancies to review           │|
|  │                                                                              │|
|  └──────────────────────────────────────────────────────────────────────────────┘|
|                                                                                   |
|  [← Back to Main Data]      [Refresh]  [Mark as Confirmed]  [Proceed to L1 →]  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| File Check Tab | Tab | Validates all files are imported successfully |
| Main Data Check Tab | Tab | Validates core portfolio data completeness |
| Other Data Check Tab | Tab | Validates supplementary data (Bloomberg, custodian, etc.) |
| Portfolio Name | Text | Identifies portfolio being checked |
| Files Imported | Text | Shows "X of 7" progress |
| Status Badge | Badge | ✓ Complete, ⚠️ Pending, ❌ Errors |
| View Details | Button | Shows detailed file status in modal |
| Go to [Screen] | Link | Navigates to relevant dashboard/maintenance screen |
| Data Category | Text | Name of data type being validated |
| Records | Number | Count of records in this category |
| View Issues | Button | Shows list of specific issues/missing data |
| View Summary | Button | Shows high-level summary in modal |
| Mark as Confirmed | Button | Marks data confirmation complete (enables L1 approval) |
| Proceed to L1 | Button | Navigate to Approve Level 1 (Screen 12) |

## Tab 1: File Check

Validates that all required files are imported:

**Portfolio Files:**
- Shows each portfolio with 7/7 files imported status
- Highlights missing files (e.g., "6 of 7 - Missing: Cash")
- Links to Portfolio File Dashboard (Screen 2)

**Other Files:**
- Bloomberg files (3 of 3)
- Custodian files (3 of 3)
- Links to Other Files Dashboard (Screen 4)

**Overall Status:**
- ✓ All files imported successfully
- ⚠️ X portfolios with missing/failed files
- ❌ Critical files missing - cannot proceed

## Tab 2: Main Data Check

Validates core portfolio data quality:

**Data Categories Checked:**
1. **Instrument Static** - Missing ISINs, incomplete master data
2. **Holdings** - Orphan instruments, negative quantities
3. **Transactions** - Invalid dates, missing counterparties
4. **Income** - Missing payment dates, incorrect amounts
5. **Cash Positions** - Missing cash records for portfolios
6. **Performance Data** - Missing benchmark returns
7. **Fees** - Missing fee records
8. **Credit Ratings** - Bonds without ratings
9. **Duration & YTM** - Bonds missing risk metrics
10. **Beta Values** - Equities missing beta

**For each category:**
- Record count
- Status: ✓ Valid, ⚠️ X Missing, ❌ X Errors
- View Issues button → modal with details
- Fix link → jumps to relevant maintenance screen

## Tab 3: Other Data Check

Validates supplementary data:

**Data Categories Checked:**
1. **Bloomberg Market Prices** - Coverage, missing prices
2. **Bloomberg FX Rates** - All currencies covered
3. **Custodian Holdings** - Reconciliation with portfolio holdings
4. **Custodian Transactions** - Match with portfolio transactions
5. **Index Prices** - All benchmarks have prices
6. **Custom Holdings** - Valid and complete

**Custodian Reconciliation:**
- Shows discrepancy count (e.g., "58 Discrepancies")
- Links to reconciliation screen to investigate
- Common discrepancies: quantity mismatch, price differences, missing holdings

## User Actions

- **Switch tabs**: Click tab to view different validation categories
- **View details**: Click "View Details" → modal with detailed status
- **View issues**: Click "View Issues" → modal listing specific problems
- **Fix data**: Click "Go to [Screen]" → navigates to maintenance screen
- **Refresh checks**: Click "Refresh" → re-runs all validations
- **Mark as confirmed**: Click "Mark as Confirmed" → sets data confirmation complete (required for L1)
- **Proceed to approvals**: Click "Proceed to L1" → navigates to Approve Level 1 (Screen 12)

## Validation Logic

**File Check:**
- All 7 portfolio file types must be imported per portfolio
- All required Other Files must be imported
- File status must be "Done" (not "Pending", "Processing", or "Failed")
- "Fix Data" status is acceptable (warnings only)

**Main Data Check:**
- Instrument Static: All instruments should have ISIN (warnings only for custom instruments)
- Holdings: All InstrumentCodes must exist in Instrument Static
- Credit Ratings: All bonds should have at least one rating (warnings only)
- Duration/YTM: All bonds should have duration and YTM (warnings only)
- Beta: All equities should have beta for their primary benchmark (warnings only)
- Cash/Performance/Fees: At least one record per portfolio

**Other Data Check:**
- Bloomberg prices: Coverage for all holdings
- FX Rates: All currencies in portfolios are covered
- Custodian reconciliation: Discrepancies flagged but don't block approval
- Index prices: All benchmarks used have current month-end prices

## Blocking vs. Warning Issues

| Issue Type | Severity | Behavior |
|------------|----------|----------|
| Missing required file | ❌ Blocking | "Mark as Confirmed" disabled |
| Failed file import | ❌ Blocking | "Mark as Confirmed" disabled |
| Missing ISIN | ⚠️ Warning | Can proceed with confirmation |
| Missing credit rating | ⚠️ Warning | Can proceed with confirmation |
| Custodian discrepancy | ⚠️ Warning | Flagged for review but doesn't block |
| Missing optional file | ⚠️ Warning | Can proceed with confirmation |

## Navigation

- **From:**
  - Other Files Dashboard (Screen 4) - via "Proceed to Data Confirmation" button
  - Monthly Process Workflow View (Screen 18) - via "Data Confirmation" step
- **To:**
  - Portfolio File Dashboard (Screen 2) - via "Go to Portfolio Files Dashboard" link
  - Other Files Dashboard (Screen 4) - via "Go to Other Files Dashboard" link
  - Instrument Static Page (Screen 5) - via "Go to Instrument Static Page" link
  - Credit Rating Page (Screen 6) - via "Go to Credit Rating Page" link
  - Index Prices Page (Screen 7) - via "Go to Index Prices Page" link
  - Duration & YTM Page (Screen 8) - via fix links
  - Beta Page (Screen 9) - via fix links
  - Custom Holding Capture (Screen 10) - via "Add Cash Position" or fix links
  - Approve Level 1 (Screen 12) - via "Proceed to L1" button

## Notes

- Data Confirmation is a required step before Level 1 approval
- Users can navigate away to fix issues and return - progress is saved
- "Refresh" button re-runs all validations without reloading the page
- "Mark as Confirmed" sets a flag that enables the L1 approval button
- Warning issues don't block confirmation but are logged for audit purposes
- Custodian discrepancies are common and typically investigated separately
- Each tab has an "Overall Status" summary at the bottom
