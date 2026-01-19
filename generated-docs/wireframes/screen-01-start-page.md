# Screen: Start Page

## Purpose

Landing page for initiating a new monthly reporting batch or viewing existing batches with their status.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Monthly Process > Start                                          |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Monthly Process - Start New Report Batch                                        |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Report Batches]  [New Report Batch]                                            |
|  ──────────────────                                                               |
|                                                                                   |
|  ┌─ Report Batches Tab (Active) ─────────────────────────────────────────────┐  |
|  │                                                                             │  |
|  │  [Search by Report Date...]                           [Export CSV]         │  |
|  │                                                                             │  |
|  │  +--------+---------------+----------+------------+-------------------+    │  |
|  │  | Report | Created Date  | Status   | Created By | Actions           |    │  |
|  │  | Date   |               |          |            |                   |    │  |
|  │  +--------+---------------+----------+------------+-------------------+    │  |
|  │  | Jan    | 2025-01-15    | ✓ L3     | John Doe   | [View Details]    |    │  |
|  │  | 2025   | 10:30         | Approved |            | [View Logs]       |    │  |
|  │  +--------+---------------+----------+------------+-------------------+    │  |
|  │  | Dec    | 2024-12-16    | 🔄 L2    | Jane Smith | [View Details]    |    │  |
|  │  | 2024   | 14:22         | Pending  |            | [View Logs]       |    │  |
|  │  +--------+---------------+----------+------------+-------------------+    │  |
|  │  | Nov    | 2024-11-17    | ⚠️ Data  | John Doe   | [View Details]    |    │  |
|  │  | 2024   | 09:15         | Check    |            | [Fix Issues]      |    │  |
|  │  +--------+---------------+----------+------------+-------------------+    │  |
|  │  | Oct    | 2024-10-18    | ❌ Rej   | Jane Smith | [View Details]    |    │  |
|  │  | 2024   | 11:00         | ected    |            | [View Reason]     |    │  |
|  │  +--------+---------------+----------+------------+-------------------+    │  |
|  │                                                                             │  |
|  │  Showing 1-10 of 24          [< Prev]  [1] [2] [3]  [Next >]               │  |
|  │                                                                             │  |
|  └─────────────────────────────────────────────────────────────────────────────┘  |
|                                                                                   |
|  ┌─ New Report Batch Tab (Inactive) ──────────────────────────────────────────┐  |
|  │  (Hidden - click tab to activate)                                           │  |
|  └─────────────────────────────────────────────────────────────────────────────┘  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Report Batches Tab | Tab | Shows list of existing report batches with status |
| New Report Batch Tab | Tab | Form to create a new monthly report batch |
| Search Input | Text Input | Filter batches by report date (MMM YYYY) |
| Export CSV | Button | Export batch list to CSV |
| Report Date | Text | Month/Year identifier (e.g., "Jan 2025") |
| Status | Badge | Visual indicator: ✓ L3 Approved, 🔄 L2 Pending, ⚠️ Data Check, ❌ Rejected |
| View Details | Button | Navigate to batch workflow view |
| View Logs | Button | Navigate to Monthly Process Logs for this batch |
| Fix Issues | Button | Navigate to Data Confirmation screen |
| View Reason | Button | Show rejection reason modal |
| Pagination | Navigation | Navigate through batch history |

## User Actions

- **Switch to New Report Batch tab**: Click tab to show creation form
- **Search batches**: Type report date to filter list
- **View batch details**: Click "View Details" → navigates to Monthly Process Workflow View (Screen 18)
- **View logs**: Click "View Logs" → navigates to Monthly Process Logs (Screen 16)
- **Fix data issues**: Click "Fix Issues" → navigates to Data Confirmation (Screen 11)
- **View rejection reason**: Click "View Reason" → opens modal with rejection text
- **Export data**: Click "Export CSV" → downloads batch list

## Navigation

- **From:** Main Dashboard or Top Navigation Menu
- **To:**
  - Monthly Process Workflow View (Screen 18) - via "View Details"
  - Monthly Process Logs (Screen 16) - via "View Logs"
  - Data Confirmation (Screen 11) - via "Fix Issues"
  - New Report Batch Tab (same screen) - via tab click

## Status Legend

| Status | Icon | Meaning |
|--------|------|---------|
| L3 Approved | ✓ | All 3 approval levels complete - batch finalized |
| L2 Pending | 🔄 | Awaiting Level 2 approval |
| L1 Pending | 🔄 | Awaiting Level 1 approval |
| Data Check | ⚠️ | Requires data verification/fixes |
| Rejected | ❌ | Rejected at some approval level or post-L3 |
| In Progress | 🔄 | Files being imported/processed |

## Notes

- Report Batches tab is the default active view
- New Report Batch tab content is shown in Screen 01b
- Batches are sorted by Report Date descending (newest first)
- Status colors: Green (✓), Yellow (⚠️), Red (❌), Blue (🔄)
