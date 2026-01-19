# Screen: File Process Logs

## Purpose

Detailed file-level tracking showing import status, validation results, and download capability for all files in a monthly batch.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Monitoring > File Process Logs                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  File Process Logs                                                               |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Report Date: [Jan 2025 v]                                [Export File List]    |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ File Import Summary                                                          │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Total Files: 63                                                             │ |
|  │  ✓ Successfully Imported: 58                                                 │ |
|  │  ⚠️ Imported with Warnings: 3                                                │ |
|  │  ❌ Failed: 2                                                                 │ |
|  │  ⏳ Pending: 0                                                                │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [Search by file name, portfolio, or type...]      [Filter by Status v]         |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ File Process Log Grid                                                        │ |
|  │                                                                              │ |
|  │  ┌─────────────┬──────────┬────────────┬──────────┬─────────┬────────────┐  │ |
|  │  | File Name   | Portfoli | File Type  | Uploaded | Status  | Actions    │  │ |
|  │  |             | o        |            | Date/    |         |            │  │ |
|  │  |             |          |            | Time     |         |            │  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | holdings_   | PF-001   | Holdings   | 01-15    | ✓ Done  | [Download] │  │ |
|  │  | jan25.csv   | (Cons.   |            | 10:22    | (3,421  | [View Log] │  │ |
|  │  |             | Growth)  |            |          | rows)   | [Re-import]│  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | trans_jan25 | PF-001   | Transact.  | 01-15    | ⚠️ Fix  | [Download] │  │ |
|  │  | .csv        | (Cons.   |            | 10:30    | Data    | [View Log] │  │ |
|  │  | (52 errors) | Growth)  |            |          | (52 err)| [View Err] │  │ |
|  │  |             |          |            |          |         | [Re-import]│  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | inc_jan25   | PF-001   | Income     | 01-15    | ✓ Done  | [Download] │  │ |
|  │  | .csv        | (Cons.   |            | 11:05    | (125    | [View Log] │  │ |
|  │  |             | Growth)  |            |          | rows)   | [Re-import]│  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | fees_jan25  | PF-001   | Fees       | 01-15    | ❌ Fail | [Download] │  │ |
|  │  | .csv        | (Cons.   |            | 12:00    | ed      | [View Log] │  │ |
|  │  |             | Growth)  |            |          | (Upload | [View Err] │  │ |
|  │  |             |          |            |          | failed) | [Re-import]│  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | bbg_jan25   | -        | Bloomberg  | 01-15    | ✓ Done  | [Download] │  │ |
|  │  | .csv        | (All)    | Market     | 13:45    | (15,247 | [View Log] │  │ |
|  │  |             |          | Prices     |          | rows)   | [Re-import]│  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | cust_hold_  | -        | Custodian  | 01-15    | ⚠️ Done | [Download] │  │ |
|  │  | jan.xlsx    | (All)    | Holdings   | 14:15    | (58     | [View Log] │  │ |
|  │  | (58 discrp) |          |            |          | discrep)| [View Disc]│  │ |
|  │  |             |          |            |          |         | [Re-import]│  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | inst_jan25  | PF-001   | Instrument | 01-15    | ⚠️ Done | [Download] │  │ |
|  │  | .csv        | (Cons.   | Static     | 10:15    | (23 mis | [View Log] │  │ |
|  │  | (23 warns)  | Growth)  |            |          | ISINs)  | [View Warn]│  │ |
|  │  |             |          |            |          |         | [Re-import]│  │ |
|  │  ├─────────────┼──────────┼────────────┼──────────┼─────────┼────────────┤  │ |
|  │  | ...         | ...      | ...        | ...      | ...     | ...        │  │ |
|  │  └─────────────┴──────────┴────────────┴──────────┴─────────┴────────────┘  │ |
|  │                                                                              │ |
|  │  Showing 1-25 of 63 files           [< Prev]  [1][2][3]  [Next >]          │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [Export Searchable File List]                                                  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

FILE LOG MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ File Process Log: holdings_jan25.csv                        [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  File Details                                                      │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  File Name: holdings_jan25.csv                                     │       |
|     │  Portfolio: PF-001 (Conservative Growth)                           │       |
|     │  File Type: Holdings                                               │       |
|     │  File Size: 2.4 MB                                                 │       |
|     │  Uploaded: 2025-01-15 10:22:15 by John Doe                         │       |
|     │                                                                     │       |
|     │  Processing Log                                                    │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  [10:22:15] File uploaded: holdings_jan25.csv (2.4 MB)             │       |
|     │  [10:22:17] Starting validation...                                 │       |
|     │  [10:22:18] Validating file format: CSV                            │       |
|     │  [10:22:19] Validating column headers: OK (12 columns found)       │       |
|     │  [10:22:20] Validating data types: OK                              │       |
|     │  [10:22:25] Row validation: 3,421 rows checked                     │       |
|     │  [10:22:30] Cross-reference check: All instruments exist           │       |
|     │  [10:22:35] Duplicate check: No duplicates found                   │       |
|     │  [10:22:40] Validation complete: 0 errors, 0 warnings              │       |
|     │  [10:22:42] Starting import...                                     │       |
|     │  [10:22:45] Importing rows: 1000 of 3421                           │       |
|     │  [10:23:10] Importing rows: 2000 of 3421                           │       |
|     │  [10:23:35] Importing rows: 3000 of 3421                           │       |
|     │  [10:23:47] Import complete: 3,421 rows inserted                   │       |
|     │  [10:23:48] Status: ✓ Done                                         │       |
|     │                                                                     │       |
|     │  [Download Log as .txt]                             [Close]        │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+

ERROR DETAILS MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ Error Details: trans_jan25.csv                              [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  Validation Errors (52 found)                                      │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  ┌────┬─────────────────────────┬──────────────────────────────┐   │       |
|     │  | Row| Error Type              | Details                      │   │       |
|     │  ├────┼─────────────────────────┼──────────────────────────────┤   │       |
|     │  | 12 | Missing InstrumentCode  | InstrumentCode is empty      │   │       |
|     │  ├────┼─────────────────────────┼──────────────────────────────┤   │       |
|     │  | 23 | Invalid Date            | TransactionDate: "2025-13-01"│   │       |
|     │  |    |                         | (month 13 invalid)           │   │       |
|     │  ├────┼─────────────────────────┼──────────────────────────────┤   │       |
|     │  | 45 | Invalid Quantity        | Quantity: -150 (negative not │   │       |
|     │  |    |                         | allowed for Buy transaction) │   │       |
|     │  ├────┼─────────────────────────┼──────────────────────────────┤   │       |
|     │  | 67 | Instrument Not Found    | InstrumentCode "XYZ999" not  │   │       |
|     │  |    |                         | in master data               │   │       |
|     │  ├────┼─────────────────────────┼──────────────────────────────┤   │       |
|     │  | ...| ...                     | ...                          │   │       |
|     │  └────┴─────────────────────────┴──────────────────────────────┘   │       |
|     │                                                                     │       |
|     │  Showing 1-10 of 52 errors      [< Prev]  [1][2][3]...[6] [Next >]│       |
|     │                                                                     │       |
|     │  [Download Error Report (.csv)]                     [Close]        │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Report Date Filter | Dropdown | Select which monthly batch to view file logs for |
| Export File List | Button | Downloads file list with status (CSV format) |
| File Import Summary | Card | Shows counts by status (Success, Warning, Failed, Pending) |
| Search Input | Text Input | Filter files by name, portfolio, or type |
| Filter by Status | Dropdown | Filter by file status |
| File Name | Text | Name of uploaded file (with error/warning count if applicable) |
| Portfolio | Text | Portfolio identifier (or "-" for non-portfolio files) |
| File Type | Text | Category of file (Holdings, Transactions, Bloomberg, etc.) |
| Uploaded Date/Time | DateTime | When file was uploaded |
| Status | Badge | ✓ Done, ⚠️ Fix Data, ⚠️ Done (with warnings), ❌ Failed, ⏳ Pending |
| Download | Button | Downloads the original uploaded file |
| View Log | Button | Opens File Log Modal with processing details |
| View Error | Button | Opens Error Details Modal (for failed/fix data status) |
| View Warning | Button | Opens modal with warning details (for warning status) |
| View Discrepancies | Button | Opens modal with reconciliation discrepancies (for custodian files) |
| Re-import | Button | Opens File Import Popup (Screen 3) to re-upload file |

## File Import Summary

Shows high-level file statistics:
- **Total Files:** Count of all files for this batch
- **✓ Successfully Imported:** Files with no errors or warnings
- **⚠️ Imported with Warnings:** Files imported but with non-critical issues
- **❌ Failed:** Files that failed to import
- **⏳ Pending:** Files not yet uploaded

## File Process Log Grid

Shows all files for the selected batch:

**Columns:**
- **File Name:** Original filename (with error/warning count in parentheses)
- **Portfolio:** Which portfolio the file belongs to (or "-" for non-portfolio files like Bloomberg)
- **File Type:** Instrument Static, Holdings, Transactions, Income, Cash, Performance, Fees, Bloomberg Market Prices, etc.
- **Uploaded Date/Time:** When the file was uploaded
- **Status:** Current processing status with row count or error count
- **Actions:** Download, View Log, View Errors/Warnings, Re-import

## File Status Definitions

| Status | Icon | Meaning |
|--------|------|---------|
| Done | ✓ | Successfully imported with no errors or warnings |
| Done (with warnings) | ⚠️ | Imported successfully but has non-critical warnings |
| Fix Data | ⚠️ | Imported but has validation errors requiring fixes |
| Failed | ❌ | Import failed completely (file format, timeout, etc.) |
| Pending | ⏳ | File not yet uploaded |
| Processing | 🔄 | Currently being processed |

## File Log Modal

Shows detailed processing log for a file:

**File Details:**
- File name, portfolio, type, size
- Uploaded date/time and user

**Processing Log:**
- Timestamped step-by-step log of:
  - File upload
  - Validation steps (format, headers, data types, row validation, cross-reference checks, duplicate checks)
  - Validation results (error count, warning count)
  - Import steps (progress updates every 1000 rows)
  - Import results (rows inserted/updated)
  - Final status

**Actions:**
- Download log as .txt file
- Close modal

## Error Details Modal

Shows validation errors for files with "Fix Data" or "Failed" status:

**Columns:**
- **Row:** Row number in the file
- **Error Type:** Category of error (Missing Field, Invalid Date, Invalid Quantity, etc.)
- **Details:** Specific error message

**Features:**
- Paginated (shows 10 errors per page)
- Download error report as CSV for easy fixing

## User Actions

- **Select report date**: Choose from dropdown → loads files for that batch
- **Export file list**: Click button → downloads CSV with all files and statuses
- **Search files**: Type in search box → filters file list in real-time
- **Filter by status**: Select from dropdown → shows only files with that status
- **Download file**: Click "Download" → downloads original uploaded file
- **View processing log**: Click "View Log" → opens File Log Modal
- **View errors**: Click "View Error" → opens Error Details Modal
- **View warnings**: Click "View Warn" → opens modal with warning details
- **View discrepancies**: Click "View Disc" → opens reconciliation discrepancy modal
- **Re-import file**: Click "Re-import" → opens File Import Popup (Screen 3)
- **Navigate pages**: Use pagination to view all files

## Export File List

Downloads CSV with columns:
- File Name
- Portfolio
- File Type
- Uploaded Date/Time
- Uploaded By
- Status
- Row Count (or Error Count)
- File Size

Useful for:
- Auditing file imports
- Tracking which files were used for a specific month
- Sharing with external auditors

## Access Control

- All users can view file logs for batches they have access to
- "Re-import" button only visible to users with import permissions
- Processing logs may contain sensitive information (visible only to operations/IT roles)

## Navigation

- **From:**
  - Start Page (Screen 1) - via "View Files" button
  - Portfolio File Dashboard (Screen 2) - via "View Details" button
  - Monthly Process Workflow View (Screen 18) - via "File Logs" link
  - Main Dashboard - via Monitoring menu
- **To:**
  - File Log Modal
  - Error Details Modal
  - File Import Popup (Screen 3) - via "Re-import" button

## Notes

- File logs are read-only (cannot be edited)
- Original uploaded files are preserved for audit purposes
- Processing logs useful for troubleshooting import issues
- Error reports can be downloaded and shared with data providers
- Re-import functionality allows fixing and re-uploading files
- Files remain downloadable even after batch is finalized
- File retention follows regulatory requirements (typically 7 years)
