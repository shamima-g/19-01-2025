# Screen: Monthly Process Workflow View

## Purpose

Orchestration/checklist page showing all workflow steps and current status. Provides navigation to each step in the monthly process workflow.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Start Page]  Monthly Process > Workflow View > Jan 2025                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Monthly Process Workflow - January 2025                                         |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Batch ID: RPT-2025-01                  Status: 🔄 L2 Pending                    |
|  Created: 2025-01-15 10:30 by John Doe                                          |
|  Last Updated: 2025-01-16 09:15                                                  |
|                                                                                   |
|  [View Logs]  [View Files]  [Export Workflow Report]                            |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Workflow Progress                                                            │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐  │ |
|  │  | Phase 1   | Phase 2   | Phase 3   | Phase 4   | Phase 4   | Phase 4   │  │ |
|  │  | File      | Data      | Verify    | Approve   | Approve   | Approve   │  │ |
|  │  | Imports   | Mainten.  |           | L1        | L2        | L3        │  │ |
|  │  ├───────────┼───────────┼───────────┼───────────┼───────────┼───────────┤  │ |
|  │  | ✓ Done    | ✓ Done    | ✓ Done    | ✓ Done    | 🔄 Curr   | ⏳ Pend   │  │ |
|  │  | 01-15     | 01-15     | 01-15     | 01-15     | (In Prog) | ing       │  │ |
|  │  | 14:32     | 16:20     | 16:45     | 17:32     |           |           │  │ |
|  │  └───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘  │ |
|  │                                                                              │ |
|  │  Progress: [████████████████████████████░░░░░░░] 80%                         │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Phase 1: Data Import & Collection                                           │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────┬────────────────────────────┬──────────────┬────────────────────┐  │ |
|  │  | Step | Task                       | Status       | Actions            │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 1.1  | Import Portfolio Files     | ✓ Complete   | [View Dashboard]   │  │ |
|  │  |      | (8 portfolios, 56 files)   | 01-15 14:32  | [View Files]       │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 1.2  | Import Other Files         | ✓ Complete   | [View Dashboard]   │  │ |
|  │  |      | (Bloomberg, Custodian)     | 01-15 15:10  | [View Files]       │  │ |
|  │  └──────┴────────────────────────────┴──────────────┴────────────────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Phase 2: Data Maintenance & Enrichment                                      │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────┬────────────────────────────┬──────────────┬────────────────────┐  │ |
|  │  | Step | Task                       | Status       | Actions            │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 2.1  | Update Instrument Static   | ✓ Complete   | [View Page]        │  │ |
|  │  |      | (23 missing ISINs fixed)   | 01-15 15:45  |                    │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 2.2  | Update Credit Ratings      | ✓ Complete   | [View Page]        │  │ |
|  │  |      | (15 ratings updated)       | 01-15 16:00  | [Run Decision Flow]│  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 2.3  | Update Index Prices        | ✓ Complete   | [View Page]        │  │ |
|  │  |      | (87 indices updated)       | 01-15 16:10  |                    │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 2.4  | Update Duration & YTM      | ✓ Complete   | [View Page]        │  │ |
|  │  |      | (342 bonds updated)        | 01-15 16:12  |                    │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 2.5  | Update Beta Values         | ✓ Complete   | [View Page]        │  │ |
|  │  |      | (856 equities updated)     | 01-15 16:15  |                    │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 2.6  | Add Custom Holdings        | ✓ Complete   | [View Page]        │  │ |
|  │  |      | (15 custom holdings added) | 01-15 16:20  |                    │  │ |
|  │  └──────┴────────────────────────────┴──────────────┴────────────────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Phase 3: Data Verification                                                   │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────┬────────────────────────────┬──────────────┬────────────────────┐  │ |
|  │  | Step | Task                       | Status       | Actions            │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 3.1  | Data Confirmation          | ✓ Complete   | [View Confirmation]│  │ |
|  │  |      | (All 3 tabs checked)       | 01-15 16:45  | [View Report]      │  │ |
|  │  |      |                            | by John Doe  |                    │  │ |
|  │  └──────┴────────────────────────────┴──────────────┴────────────────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Phase 4: Approvals                                                           │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────┬────────────────────────────┬──────────────┬────────────────────┐  │ |
|  │  | Step | Task                       | Status       | Actions            │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 4.1  | Approve Level 1            | ✓ Approved   | [View Approval]    │  │ |
|  │  |      | (Data quality validated)   | 01-15 17:32  | [View Comments]    │  │ |
|  │  |      |                            | Jane Approver|                    │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 4.2  | Approve Level 2            | 🔄 In Progres| [Go to L2 Approval]│  │ |
|  │  |      | (Portfolio validation)     | s            |                    │  │ |
|  │  |      |                            | Awaiting     |                    │  │ |
|  │  |      |                            | approval     |                    │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 4.3  | Approve Level 3 (Final)    | ⏳ Pending   | (Awaiting L2)      │  │ |
|  │  |      | (Executive sign-off)       |              |                    │  │ |
|  │  └──────┴────────────────────────────┴──────────────┴────────────────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Phase 5: Report Generation (Available after L3 approval)                    │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌──────┬────────────────────────────┬──────────────┬────────────────────┐  │ |
|  │  | Step | Task                       | Status       | Actions            │  │ |
|  │  ├──────┼────────────────────────────┼──────────────┼────────────────────┤  │ |
|  │  | 5.1  | Generate Reports           | ⏳ Pending   | (Awaiting L3)      │  │ |
|  │  | 5.2  | Distribute Reports         | ⏳ Pending   | (Awaiting L3)      │  │ |
|  │  └──────┴────────────────────────────┴──────────────┴────────────────────┘  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [Reject Final Reports]  (Only visible if batch is finalized)                   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

WORKFLOW REPORT (Export):

+-----------------------------------------------------------------------------------+
|  Monthly Process Workflow Report                                                 |
|  January 2025 (RPT-2025-01)                                                      |
|  Generated: 2025-01-16 10:00                                                     |
|                                                                                   |
|  Batch Status: L2 Pending                                                        |
|  Overall Progress: 80%                                                           |
|  Created: 2025-01-15 10:30 by John Doe                                          |
|  Last Updated: 2025-01-16 09:15                                                  |
|                                                                                   |
|  Phase 1: Data Import & Collection - ✓ Complete                                 |
|    1.1 Import Portfolio Files - ✓ Complete (01-15 14:32)                        |
|    1.2 Import Other Files - ✓ Complete (01-15 15:10)                            |
|                                                                                   |
|  Phase 2: Data Maintenance & Enrichment - ✓ Complete                            |
|    2.1 Update Instrument Static - ✓ Complete (01-15 15:45)                      |
|    2.2 Update Credit Ratings - ✓ Complete (01-15 16:00)                         |
|    2.3 Update Index Prices - ✓ Complete (01-15 16:10)                           |
|    2.4 Update Duration & YTM - ✓ Complete (01-15 16:12)                         |
|    2.5 Update Beta Values - ✓ Complete (01-15 16:15)                            |
|    2.6 Add Custom Holdings - ✓ Complete (01-15 16:20)                           |
|                                                                                   |
|  Phase 3: Data Verification - ✓ Complete                                        |
|    3.1 Data Confirmation - ✓ Complete (01-15 16:45 by John Doe)                 |
|                                                                                   |
|  Phase 4: Approvals - 🔄 In Progress                                             |
|    4.1 Approve Level 1 - ✓ Approved (01-15 17:32 by Jane Approver)              |
|    4.2 Approve Level 2 - 🔄 In Progress (Awaiting approval)                      |
|    4.3 Approve Level 3 (Final) - ⏳ Pending (Awaiting L2)                        |
|                                                                                   |
|  Phase 5: Report Generation - ⏳ Pending                                         |
|    5.1 Generate Reports - ⏳ Pending (Awaiting L3)                               |
|    5.2 Distribute Reports - ⏳ Pending (Awaiting L3)                             |
|                                                                                   |
|  --- End of Report ---                                                           |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Batch ID | Text | Unique identifier for this batch |
| Status Banner | Text | Current overall status with icon |
| Created | Text | When batch was created and by whom |
| Last Updated | DateTime | Most recent activity timestamp |
| View Logs | Link | Navigate to Monthly Process Logs (Screen 16) |
| View Files | Link | Navigate to File Process Logs (Screen 17) |
| Export Workflow Report | Button | Downloads workflow report as PDF or text |
| Workflow Progress | Card | Visual progress bar showing phase completion |
| Phase Sections | Collapsible Sections | One per workflow phase |
| Step | Text | Step number (e.g., 1.1, 2.3, 4.2) |
| Task | Text | Description of the task |
| Status | Badge | ✓ Complete, 🔄 In Progress, ⏳ Pending, ❌ Failed |
| Actions | Links/Buttons | Navigate to relevant screens or perform actions |
| Reject Final Reports | Link | Opens Reject Final Reports screen (Screen 15) |

## Workflow Progress Indicator

Shows high-level phase status:
- **Phase 1: File Imports** - ✓ Done, 🔄 Current, ⏳ Pending
- **Phase 2: Data Maintenance** - ✓ Done, 🔄 Current, ⏳ Pending
- **Phase 3: Verify** - ✓ Done, 🔄 Current, ⏳ Pending
- **Phase 4: Approve L1** - ✓ Done, 🔄 Current, ⏳ Pending
- **Phase 4: Approve L2** - ✓ Done, 🔄 Current, ⏳ Pending
- **Phase 4: Approve L3** - ✓ Done, 🔄 Current, ⏳ Pending

Progress bar shows overall completion percentage (calculated as completed steps / total steps × 100).

## Phase 1: Data Import & Collection

**Steps:**
- **1.1 Import Portfolio Files** - Links to Portfolio File Dashboard (Screen 2)
- **1.2 Import Other Files** - Links to Other Files Dashboard (Screen 4)

**Actions:**
- View Dashboard - Navigate to file import dashboards
- View Files - Navigate to File Process Logs (Screen 17)

## Phase 2: Data Maintenance & Enrichment

**Steps:**
- **2.1 Update Instrument Static** - Links to Instrument Static Page (Screen 5)
- **2.2 Update Credit Ratings** - Links to Credit Rating Page (Screen 6)
- **2.3 Update Index Prices** - Links to Index Prices Page (Screen 7)
- **2.4 Update Duration & YTM** - Links to Duration & YTM Page (Screen 8)
- **2.5 Update Beta Values** - Links to Beta Page (Screen 9)
- **2.6 Add Custom Holdings** - Links to Custom Holding Capture (Screen 10)

**Actions:**
- View Page - Navigate to respective maintenance screens
- Run Decision Flow - Triggers credit rating decision flow (for 2.2)

## Phase 3: Data Verification

**Steps:**
- **3.1 Data Confirmation** - Links to Data Confirmation (Screen 11)

**Actions:**
- View Confirmation - Navigate to Data Confirmation screen
- View Report - Opens data confirmation report in modal

## Phase 4: Approvals

**Steps:**
- **4.1 Approve Level 1** - Links to Approve Level 1 (Screen 12)
- **4.2 Approve Level 2** - Links to Approve Level 2 (Screen 13)
- **4.3 Approve Level 3 (Final)** - Links to Approve Level 3 (Screen 14)

**Actions:**
- View Approval - View approval details in read-only mode (if already approved)
- View Comments - View approver comments in modal
- Go to [Level] Approval - Navigate to approval screen (if pending)

## Phase 5: Report Generation

**Steps:**
- **5.1 Generate Reports** - Triggers report generation job
- **5.2 Distribute Reports** - Sends reports to clients/stakeholders

**Status:**
- Both steps are "Pending" until L3 approval is complete
- After L3 approval, steps become actionable

**Note:** This phase is outside the scope of the monthly process wireframes but is included for completeness.

## Workflow Report (Export)

When "Export Workflow Report" is clicked:
- Generates PDF or text file with:
  - Batch details (ID, status, created date, etc.)
  - All phases with step-by-step completion status
  - Timestamps for completed steps
  - Approver names for approval steps
- Useful for audits, handoffs, or status updates to stakeholders

## User Actions

- **View logs**: Click "View Logs" → navigate to Monthly Process Logs (Screen 16)
- **View files**: Click "View Files" → navigate to File Process Logs (Screen 17)
- **Export workflow report**: Click button → downloads PDF/text report
- **Navigate to phase screen**: Click action link → navigates to relevant screen
- **Run decision flow**: Click link → triggers credit rating decision flow
- **Reject final reports**: Click link → navigate to Reject Final Reports (Screen 15) (only visible if batch is finalized)

## Status Calculation Logic

**Step Status:**
- ✓ Complete - Step has been completed successfully
- 🔄 In Progress - Step is currently being worked on
- ⏳ Pending - Step is waiting for previous step(s) to complete
- ❌ Failed - Step failed (rare, usually shows as "Fix Data" instead)

**Phase Status:**
- ✓ Done - All steps in phase are complete
- 🔄 Current - At least one step is in progress
- ⏳ Pending - All steps are pending

**Overall Progress:**
- Calculated as: (Completed steps / Total steps) × 100
- Total steps = 18 (2 in Phase 1, 6 in Phase 2, 1 in Phase 3, 3 in Phase 4, 2 in Phase 5, 4 in supplementary steps)

## Navigation

- **From:**
  - Start Page (Screen 1) - via "View Details" button
  - Any phase screen - via breadcrumb or "View Workflow" link
- **To:**
  - All phase screens (2-15) - via action links
  - Monthly Process Logs (Screen 16) - via "View Logs" link
  - File Process Logs (Screen 17) - via "View Files" link
  - Start Page (Screen 1) - via breadcrumb

## Access Control

- All users with access to the batch can view this workflow screen
- Action links are only visible/clickable if user has appropriate permissions
- "Reject Final Reports" link only visible to users with rejection permission

## Notes

- This screen serves as the central hub for navigating the monthly process
- Progress bar provides at-a-glance status
- Each phase section can be collapsed/expanded to reduce scrolling
- Status updates automatically when steps are completed
- "Last Updated" timestamp refreshes on any activity in the batch
- Export function useful for sharing status with stakeholders who don't have system access
- Phase 5 (Report Generation) is shown for completeness but is outside the current wireframe scope
