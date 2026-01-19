# Screen: Monthly Process Logs

## Purpose

View workflow and approval logs for a specific monthly report batch. Shows approval history, rejection history, and job execution logs.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Monitoring > Monthly Process Logs                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Monthly Process Logs                                                            |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Report Date: [Jan 2025 v]                                [Export All Logs]     |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Workflow Summary                                                             │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Batch ID: RPT-2025-01                                                       │ |
|  │  Created: 2025-01-15 10:30 by John Doe                                      │ |
|  │  Current Status: ✓ L3 Approved - Finalized                                  │ |
|  │  Final Approval: 2025-01-16 14:22 by Sarah Executive                        │ |
|  │  Duration: 1 day, 3 hours, 52 minutes                                       │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [Workflow Logs]  [Approval Logs]  [Job Execution Logs]                         |
|  ────────────────                                                                 |
|                                                                                   |
|  ┌─ Workflow Logs Tab (Active) ────────────────────────────────────────────────┐|
|  │                                                                              │|
|  │  [Search by action or user...]                      [Filter by Type v]      │|
|  │                                                                              │|
|  │  ┌──────────┬──────────┬────────────────┬────────────┬──────────────────┐   │|
|  │  | Date/    | User     | Action         | Details    | Status           |   │|
|  │  | Time     |          |                |            |                  |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-16    | Sarah    | L3 Approval    | Final sign-| ✓ Approved       |   │|
|  │  | 14:22    | Exec.    |                | off for    |                  |   │|
|  │  |          |          |                | Jan 2025   |                  |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-16    | Mike     | L2 Approval    | Portfolio  | ✓ Approved       |   │|
|  │  | 09:15    | Reviewer |                | metrics    |                  |   │|
|  │  |          |          |                | verified   |                  |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | Jane     | L1 Approval    | Data conf. | ✓ Approved       |   │|
|  │  | 17:32    | Approver |                | complete   |                  |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | John Doe | Data Confirm.  | All 3 tabs | ✓ Confirmed      |   │|
|  │  | 16:45    |          | Completed      | checked    |                  |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | John Doe | Other Files    | Bloomberg, | ✓ Complete       |   │|
|  │  | 15:10    |          | Import Complete| Custodian  |                  |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | Auto     | Bloomberg File | Market     | ✓ Imported       |   │|
|  │  | 13:45    | Import   | Imported       | Prices     | (15,247 rows)    |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | John Doe | Portfolio File | PF-001     | ✓ Complete       |   │|
|  │  | 14:32    |          | Import Complete| (7 of 7)   |                  |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | John Doe | Holdings File  | holdings_  | ✓ Imported       |   │|
|  │  | 10:22    |          | Imported       | jan25.csv  | (3,421 rows)     |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | John Doe | Instrument     | inst_jan25 | ✓ Imported       |   │|
|  │  | 10:15    |          | Static Imported| .csv       | (1,247 rows)     |   │|
|  │  ├──────────┼──────────┼────────────────┼────────────┼──────────────────┤   │|
|  │  | 01-15    | John Doe | Batch Created  | Jan 2025   | ✓ Created        |   │|
|  │  | 10:30    |          |                | monthly    |                  |   │|
|  │  |          |          |                | report     |                  |   │|
|  │  └──────────┴──────────┴────────────────┴────────────┴──────────────────┘   │|
|  │                                                                              │|
|  │  Showing 1-25 of 87 log entries     [< Prev]  [1][2][3][4]  [Next >]       │|
|  │                                                                              │|
|  └──────────────────────────────────────────────────────────────────────────────┘|
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

APPROVAL LOGS TAB:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Workflow Logs]  [Approval Logs]  [Job Execution Logs]                         |
|                   ──────────────                                                  |
|                                                                                   |
|  ┌─ Approval Logs Tab (Active) ────────────────────────────────────────────────┐|
|  │                                                                              │|
|  │  Approval History for January 2025                                          │|
|  │                                                                              │|
|  │  ┌──────────┬────────┬──────────┬─────────────────┬───────────────────────┐ │|
|  │  | Date/    | Level  | Approver | Decision        | Comments              │ │|
|  │  | Time     |        |          |                 |                       │ │|
|  │  ├──────────┼────────┼──────────┼─────────────────┼───────────────────────┤ │|
|  │  | 01-16    | L3     | Sarah    | ✓ APPROVED      | Jan 2025 reports      │ │|
|  │  | 14:22    | (Final)| Exec.    |                 | approved for          │ │|
|  │  |          |        | (IP: 192 | Duration: 5m 7s | distribution. All     │ │|
|  │  |          |        | .168.1.  |                 | portfolios within     │ │|
|  │  |          |        | 105)     |                 | compliance. PF-003    │ │|
|  │  |          |        |          |                 | rebalancing to be...  │ │|
|  │  |          |        |          |                 | [View Full]           │ │|
|  │  ├──────────┼────────┼──────────┼─────────────────┼───────────────────────┤ │|
|  │  | 01-16    | L2     | Mike     | ✓ APPROVED      | PF-003 equity drift   │ │|
|  │  | 09:15    |        | Reviewer |                 | acknowledged - client │ │|
|  │  |          |        | (IP: 192 | Duration: 12m   | prefers quarterly...  │ │|
|  │  |          |        | .168.1.  | 22s             | [View Full]           │ │|
|  │  |          |        | 102)     |                 |                       │ │|
|  │  ├──────────┼────────┼──────────┼─────────────────┼───────────────────────┤ │|
|  │  | 01-15    | L1     | Jane     | ✓ APPROVED      | (No comments)         │ │|
|  │  | 17:32    |        | Approver |                 |                       │ │|
|  │  |          |        | (IP: 192 | Duration: 8m    |                       │ │|
|  │  |          |        | .168.1.  | 45s             |                       │ │|
|  │  |          |        | 100)     |                 |                       │ │|
|  │  └──────────┴────────┴──────────┴─────────────────┴───────────────────────┘ │|
|  │                                                                              │|
|  │  Total Approval Time: 26 minutes 14 seconds                                 │|
|  │                                                                              │|
|  │  [Export Approval History]                                                  │|
|  │                                                                              │|
|  └──────────────────────────────────────────────────────────────────────────────┘|
|                                                                                   |
+-----------------------------------------------------------------------------------+

JOB EXECUTION LOGS TAB:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Workflow Logs]  [Approval Logs]  [Job Execution Logs]                         |
|                                    ────────────────────                           |
|                                                                                   |
|  ┌─ Job Execution Logs Tab (Active) ───────────────────────────────────────────┐|
|  │                                                                              │|
|  │  Background Job Execution History                                           │|
|  │                                                                              │|
|  │  [Search by job name...]                         [Filter by Status v]       │|
|  │                                                                              │|
|  │  ┌──────────┬───────────────┬──────────┬─────────┬──────────┬────────────┐  │|
|  │  | Date/    | Job Name      | Status   | Duratio | Rows     | Details    │  │|
|  │  | Time     |               |          | n       | Processe |            │  │|
|  │  |          |               |          |         | d        |            │  │|
|  │  ├──────────┼───────────────┼──────────┼─────────┼──────────┼────────────┤  │|
|  │  | 01-15    | Import        | ✓ Succes | 2m 15s  | 15,247   | Bloomberg  │  │|
|  │  | 13:45    | Bloomberg     | s        |         |          | prices     │  │|
|  │  |          | Market Prices |          |         |          | imported   │  │|
|  │  |          |               |          |         |          | [View Log] │  │|
|  │  ├──────────┼───────────────┼──────────┼─────────┼──────────┼────────────┤  │|
|  │  | 01-15    | Validate      | ✓ Succes | 45s     | 3,421    | 0 errors   │  │|
|  │  | 10:23    | Holdings File | s        |         |          | found      │  │|
|  │  |          |               |          |         |          | [View Log] │  │|
|  │  ├──────────┼───────────────┼──────────┼─────────┼──────────┼────────────┤  │|
|  │  | 01-15    | Import        | ✓ Succes | 1m 32s  | 3,421    | Holdings   │  │|
|  │  | 10:22    | Holdings File | s        |         |          | imported   │  │|
|  │  |          |               |          |         |          | [View Log] │  │|
|  │  ├──────────┼───────────────┼──────────┼─────────┼──────────┼────────────┤  │|
|  │  | 01-15    | Validate      | ⚠️ Warni | 32s     | 1,247    | 23 missing │  │|
|  │  | 10:16    | Instrument    | ngs      |         |          | ISINs      │  │|
|  │  |          | Static        |          |         |          | [View Log] │  │|
|  │  ├──────────┼───────────────┼──────────┼─────────┼──────────┼────────────┤  │|
|  │  | 01-15    | Import        | ✓ Succes | 58s     | 1,247    | Instrument │  │|
|  │  | 10:15    | Instrument    | s        |         |          | static     │  │|
|  │  |          | Static        |          |         |          | imported   │  │|
|  │  |          |               |          |         |          | [View Log] │  │|
|  │  ├──────────┼───────────────┼──────────┼─────────┼──────────┼────────────┤  │|
|  │  | 01-15    | SFTP Auto     | ❌ Faile | Timeout | 0        | Connection │  │|
|  │  | 10:05    | Import        | d        |         |          | timeout    │  │|
|  │  |          |               |          |         |          | [View Log] │  │|
|  │  |          |               |          |         |          | [View Err] │  │|
|  │  └──────────┴───────────────┴──────────┴─────────┴──────────┴────────────┘  │|
|  │                                                                              │|
|  │  Showing 1-15 of 42 jobs            [< Prev]  [1][2][3]  [Next >]          │|
|  │                                                                              │|
|  └──────────────────────────────────────────────────────────────────────────────┘|
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Report Date Filter | Dropdown | Select which monthly batch to view logs for |
| Export All Logs | Button | Downloads combined log file (CSV or PDF) |
| Workflow Summary | Card | High-level batch information |
| Workflow Logs Tab | Tab | Shows all workflow actions (imports, confirmations, approvals) |
| Approval Logs Tab | Tab | Shows detailed approval history with comments |
| Job Execution Logs Tab | Tab | Shows background job execution details |
| Search Input | Text Input | Filter logs by action, user, or job name |
| Filter by Type/Status | Dropdown | Filter by log type or job status |
| View Full | Link | Opens modal with full comment text |
| View Log | Link | Opens detailed job log in modal |
| View Error | Link | Opens error details in modal |
| Export Approval History | Button | Downloads approval history as PDF |

## Workflow Logs Tab

Shows chronological log of all workflow actions:

**Columns:**
- **Date/Time:** When the action occurred
- **User:** Who performed the action (or "Auto Import" for automated jobs)
- **Action:** What happened (File Imported, Data Confirmation, Approval, etc.)
- **Details:** Additional context (file name, portfolio, etc.)
- **Status:** ✓ Success, ⚠️ Warning, ❌ Failed

**Typical Actions Logged:**
- Batch Created
- File Imported (per file type)
- File Validation
- Data Confirmation Completed
- L1/L2/L3 Approval
- Rejection (at any level)
- Post-L3 Rejection
- Report Generation

## Approval Logs Tab

Shows detailed approval history:

**Columns:**
- **Date/Time:** When approval decision was made
- **Level:** L1, L2, or L3 (Final)
- **Approver:** Name and IP address
- **Decision:** ✓ APPROVED or ❌ REJECTED
- **Duration:** Time spent on approval screen before decision
- **Comments:** Approval/rejection comments (truncated, click "View Full" for complete text)

**Additional Info:**
- Total approval time (sum of all approval durations)
- IP addresses for audit trail
- Duration tracking (how long each approver spent reviewing)

## Job Execution Logs Tab

Shows background job execution details:

**Columns:**
- **Date/Time:** When job started
- **Job Name:** Name of background job
- **Status:** ✓ Success, ⚠️ Warnings, ❌ Failed
- **Duration:** How long the job took
- **Rows Processed:** Number of records processed
- **Details:** Job-specific details or error message

**Common Jobs:**
- Import [File Type] File
- Validate [File Type]
- SFTP Auto Import
- Credit Rating Decision Flow
- Performance Calculation
- Report Generation

## User Actions

- **Select report date**: Choose from dropdown → loads logs for that batch
- **Export all logs**: Click button → downloads combined CSV/PDF with all tabs
- **Switch tabs**: Click tab to view different log types
- **Search logs**: Type in search box → filters results in real-time
- **Filter logs**: Select from dropdown → shows only matching logs
- **View full comment**: Click "View Full" → modal with complete comment text
- **View job log**: Click "View Log" → modal with detailed job execution log
- **View error**: Click "View Error" → modal with error details and stack trace
- **Export approval history**: Click button → downloads approval log as PDF
- **Navigate pages**: Use pagination to view older logs

## Log Retention

- Workflow logs: Retained for 7 years (regulatory requirement)
- Approval logs: Retained permanently (audit trail)
- Job execution logs: Retained for 2 years

## Access Control

- All users can view logs for batches they have access to
- Sensitive fields (IP addresses, full comments) visible only to audit/compliance roles
- Job execution logs visible only to operations/IT roles

## Navigation

- **From:**
  - Start Page (Screen 1) - via "View Logs" button
  - Monthly Process Workflow View (Screen 18) - via "View Logs" link
  - Main Dashboard - via Monitoring menu
- **To:**
  - Job Log Modal (detailed log viewer)
  - Error Details Modal
  - Full Comment Modal

## Notes

- Logs are read-only (cannot be edited or deleted)
- Logs are automatically generated by system - no manual entry
- Post-L3 rejections are flagged with "CRITICAL ACTION" marker
- Duration tracking helps identify bottlenecks in approval process
- Job execution logs useful for troubleshooting import issues
- Export function creates audit-ready PDF reports
