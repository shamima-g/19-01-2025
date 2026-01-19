# Screen: Other Files Dashboard

## Purpose

Shows import status for Bloomberg and Custodian files (not portfolio-specific). Users can upload and re-import these supplementary data files.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Portfolio Files]  Monthly Process > Other Files > Jan 2025                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Other Files Dashboard - January 2025                                            |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Status: 🔄 In Progress          Last Updated: 2025-01-15 15:10                  |
|                                                                                   |
|  [← Back to Portfolio Files]  [Refresh Status]  [Proceed to Data Confirmation →]|
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Bloomberg Files                                                              │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────────────────┬──────────┬─────────────────┬────────────┬──────────┐  │ |
|  │  | File Description | Status   | File Name       | Imported   | Actions  |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Bloomberg        | ✓ Done   | bbg_jan25.csv   | 01-15      | [Re-    |  │ |
|  │  | Market Prices    |          | (15,247 rows)   | 13:45      | import]  |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Bloomberg        | ✓ Done   | bbg_fx_jan25.csv| 01-15      | [Re-    |  │ |
|  │  | FX Rates         |          | (32 rows)       | 13:50      | import]  |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Bloomberg        | ⏳ Pend  | -               | -          | [Upload] |  │ |
|  │  | Credit Ratings   | ing      |                 |            |          |  │ |
|  │  └──────────────────┴──────────┴─────────────────┴────────────┴──────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Custodian Files                                                              │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────────────────┬──────────┬─────────────────┬────────────┬──────────┐  │ |
|  │  | File Description | Status   | File Name       | Imported   | Actions  |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Custodian        | ✓ Done   | cust_hold_jan.  | 01-15      | [Re-    |  │ |
|  │  | Holdings Report  |          | xlsx (8,432 row)| 14:15      | import]  |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Custodian        | ⚠️ Fix   | cust_trans_jan. | 01-15      | [Re-    |  │ |
|  │  | Transactions     | Data     | xlsx (14 errors)| 14:22      | import]  |  │ |
|  │  |                  |          |                 |            | [View   |  │ |
|  │  |                  |          |                 |            | Errors]  |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Custodian        | ❌ Fail  | cust_cash_jan.  | 01-15      | [Re-    |  │ |
|  │  | Cash Balances    | ed       | xlsx (Timeout)  | 15:00      | import]  |  │ |
|  │  |                  |          |                 |            | [View   |  │ |
|  │  |                  |          |                 |            | Error]   |  │ |
|  │  └──────────────────┴──────────┴─────────────────┴────────────┴──────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Additional Data Files (Optional)                                             │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────────────────┬──────────┬─────────────────┬────────────┬──────────┐  │ |
|  │  | File Description | Status   | File Name       | Imported   | Actions  |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Index Prices     | ⏳ Pend  | -               | -          | [Upload] |  │ |
|  │  | (Manual)         | ing      |                 |            |          |  │ |
|  │  ├──────────────────┼──────────┼─────────────────┼────────────┼──────────┤  │ |
|  │  | Credit Ratings   | ⏳ Pend  | -               | -          | [Upload] |  │ |
|  │  | (Manual)         | ing      |                 |            |          |  │ |
|  │  └──────────────────┴──────────┴─────────────────┴────────────┴──────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [← Back to Portfolio Files]  [Refresh Status]  [Proceed to Data Confirmation →]|
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Bloomberg Files Section | Container | Group of Bloomberg data files |
| Custodian Files Section | Container | Group of custodian data files |
| Additional Data Section | Container | Optional supplementary files |
| File Description | Text | Human-readable file category name |
| Status Icon | Badge | Visual indicator: ✓ Done, 🔄 Processing, ⏳ Pending, ⚠️ FixData, ❌ Failed |
| File Name | Text | Name of uploaded file with row count or error message |
| Imported | DateTime | Date/time of upload |
| Upload Button | Button | Opens File Import Popup (Screen 3) |
| Re-import Button | Button | Opens File Import Popup (Screen 3) with replace mode |
| View Errors Button | Button | Shows validation errors in modal |
| View Error Button | Button | Shows import failure details in modal |
| Refresh Status | Button | Polls backend for latest import status |
| Back to Portfolio Files | Button | Navigate to Portfolio File Dashboard (Screen 2) |
| Proceed to Data Confirmation | Button | Navigate to Data Confirmation (Screen 11) |

## User Actions

- **Upload file**: Click "Upload" → opens File Import Popup (Screen 3)
- **Re-import file**: Click "Re-import" → opens File Import Popup (Screen 3) in replace mode
- **View validation errors**: Click "View Errors" → shows error details in modal
- **View import error**: Click "View Error" → shows failure reason in modal
- **Refresh status**: Click "Refresh Status" → updates all status indicators
- **Navigate back**: Click "Back to Portfolio Files" → returns to Screen 2
- **Proceed to next step**: Click "Proceed to Data Confirmation" → navigates to Screen 11

## File Categories

### Bloomberg Files

| File | Required | Description |
|------|----------|-------------|
| Market Prices | Yes | Daily closing prices for all instruments |
| FX Rates | Yes | Foreign exchange rates for currency conversion |
| Credit Ratings | Optional | Bloomberg credit rating data |

### Custodian Files

| File | Required | Description |
|------|----------|-------------|
| Holdings Report | Yes | Custodian's record of holdings for reconciliation |
| Transactions | Yes | Custodian's transaction records for verification |
| Cash Balances | Yes | Custodian's cash position report |

### Additional Data Files

| File | Required | Description |
|------|----------|-------------|
| Index Prices (Manual) | Optional | Manually uploaded index pricing if not from Bloomberg |
| Credit Ratings (Manual) | Optional | Manually uploaded ratings if not from Bloomberg |

## Status Definitions

| Status | Icon | Meaning |
|--------|------|---------|
| Done | ✓ | File imported and validated successfully |
| Processing | 🔄 | File upload in progress or validation running |
| Pending | ⏳ | File not yet uploaded |
| Fix Data | ⚠️ | File has validation errors - requires fixing |
| Failed | ❌ | File upload or import failed |

## Navigation

- **From:**
  - Portfolio File Dashboard (Screen 2) - via "Proceed to Other Files" button
- **To:**
  - Portfolio File Dashboard (Screen 2) - via "Back to Portfolio Files" button
  - File Import Popup (Screen 3) - via Upload/Re-import buttons
  - Data Confirmation (Screen 11) - via "Proceed to Data Confirmation" button

## Notes

- Bloomberg and Custodian sections are always visible
- Additional Data section only shows if project is configured to use manual data uploads
- Status updates automatically every 30 seconds if any file is "Processing"
- Some files are marked as "Required" - user cannot proceed to Data Confirmation if required files are missing
- File categories are configured in system settings (not editable by end users)
- This screen uses the same File Import Popup (Screen 3) as Portfolio Files Dashboard
