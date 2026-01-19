# Screen: Approve Level 3

## Purpose

Final approval stage - executive-level sign-off to finalize the monthly report batch. Once approved, reports can be generated and distributed.

## Pattern

This screen follows the same pattern as **Approve Level 1 & 2** with executive-level checklist and final summary.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Approve L2]  Monthly Process > Approve Level 3 > Jan 2025                    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Approve Level 3 (Final Approval) - January 2025                                |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Status: ⏳ Awaiting Level 3 (Final) Approval                                     |
|  Level 1 Approval: ✓ Approved by Jane Approver on 2025-01-15 17:32              |
|  Level 2 Approval: ✓ Approved by Mike Reviewer on 2025-01-16 09:15              |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Final Approval Checklist                                                     │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Before final approval, verify the following:                               │ |
|  │                                                                              │ |
|  │  [ ] Data quality validated (Level 1 approved)                              │ |
|  │  [ ] Portfolio performance verified (Level 2 approved)                       │ |
|  │  [ ] All compliance checks reviewed and documented                          │ |
|  │  [ ] Outstanding issues acknowledged and approved for sign-off              │ |
|  │  [ ] Client-facing reports reviewed (if applicable)                         │ |
|  │  [ ] Risk metrics within acceptable thresholds                              │ |
|  │  [ ] Ready to generate and distribute final reports                         │ |
|  │                                                                              │ |
|  │  (Check boxes are informational - not enforced by system)                   │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Executive Summary                                                            │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Report Period: January 2025                                                │ |
|  │  Report Date: January 31, 2025                                              │ |
|  │                                                                              │ |
|  │  Portfolios: 8                                                               │ |
|  │  Total AUM: $2.4B USD                                                        │ |
|  │  Month-to-Date Return: +1.87% (weighted average)                            │ |
|  │                                                                              │ |
|  │  ┌──────────────────────────────────────────────────────────────────────┐   │ |
|  │  │ Portfolio Performance Summary                                        │   │ |
|  │  │ ─────────────────────────────────────────────────────────────────    │   │ |
|  │  │                                                                      │   │ |
|  │  │ • Best Performer: PF-003 (+3.12% vs benchmark +2.45%)               │   │ |
|  │  │ • Underperformer: PF-001 (+1.23% vs benchmark +1.85%)               │   │ |
|  │  │ • All portfolios within risk tolerance                              │   │ |
|  │  │ • 1 portfolio flagged for rebalancing (acknowledged in L2)          │   │ |
|  │  │                                                                      │   │ |
|  │  └──────────────────────────────────────────────────────────────────────┘   │ |
|  │                                                                              │ |
|  │  ┌──────────────────────────────────────────────────────────────────────┐   │ |
|  │  │ Data Quality Summary                                                 │   │ |
|  │  │ ─────────────────────────────────────────────────────────────────    │   │ |
|  │  │                                                                      │   │ |
|  │  │ • All required files imported: ✓ Yes                                │   │ |
|  │  │ • Data confirmation completed: ✓ Yes (John Doe, 01-15 16:45)        │   │ |
|  │  │ • Critical validation issues: ✓ None                                │   │ |
|  │  │ • Warning issues: 23 missing ISINs, 58 custodian discrepancies      │   │ |
|  │  │   (reviewed and accepted in L1/L2)                                  │   │ |
|  │  │                                                                      │   │ |
|  │  └──────────────────────────────────────────────────────────────────────┘   │ |
|  │                                                                              │ |
|  │  [View Full Approval History]  [View Portfolio Reports]                    │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Comments (Optional)                                                          │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌────────────────────────────────────────────────────────────────────────┐ │ |
|  │  │ January 2025 monthly reports approved for distribution. All           │ │ |
|  │  │ portfolios within compliance. PF-003 rebalancing to be addressed     │ │ |
|  │  │ in Q1 2025 cycle.                                                     │ │ |
|  │  └────────────────────────────────────────────────────────────────────────┘ │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [Reject]                                                            [Approve]   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

FINAL APPROVAL CONFIRMATION MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ Confirm Level 3 (Final) Approval                           [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  ✓ Finalize January 2025 Report Batch?                            │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  ⚠️ This is the FINAL approval. By approving, you confirm:         │       |
|     │                                                                     │       |
|     │  • All data has been validated and approved at L1 and L2           │       |
|     │  • Portfolio performance and compliance are acceptable             │       |
|     │  • Outstanding issues have been reviewed and documented            │       |
|     │  • Reports are ready for generation and distribution               │       |
|     │                                                                     │       |
|     │  After approval:                                                    │       |
|     │  • Batch status will be set to "L3 Approved - Finalized"           │       |
|     │  • Reports can be generated and distributed to clients             │       |
|     │  • The batch can only be rejected via "Reject Final Reports"       │       |
|     │                                                                     │       |
|     │  Your approval will be logged with:                                │       |
|     │  • User: Sarah Executive                                           │       |
|     │  • Date/Time: 2025-01-16 14:22                                     │       |
|     │  • IP Address: 192.168.1.105                                       │       |
|     │                                                                     │       |
|     │  [Cancel]                                            [Confirm]      │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Status Banner | Text | Shows current status and L1/L2 approval details |
| Final Approval Checklist | Checklist | Executive-level checklist for final sign-off (not enforced) |
| Executive Summary | Card | High-level report summary with key metrics |
| Portfolio Performance Summary | Section | Best/worst performers and key highlights |
| Data Quality Summary | Section | Data validation status and outstanding issues |
| View Full Approval History | Link | Opens modal showing all approval steps and comments |
| View Portfolio Reports | Link | Opens portfolio reports in new tab/modal |
| Comments | Text Area | Optional approval comments (recommended for L3) |
| Reject Button | Button | Opens rejection modal (same pattern as L1/L2) |
| Approve Button | Button | Opens final approval confirmation modal |

## Final Approval Checklist

Level 3 checklist focuses on executive-level validation:
- Data quality validated (Level 1 approved)
- Portfolio performance verified (Level 2 approved)
- All compliance checks reviewed and documented
- Outstanding issues acknowledged and approved for sign-off
- Client-facing reports reviewed (if applicable)
- Risk metrics within acceptable thresholds
- Ready to generate and distribute final reports

**Note:** Checkboxes are informational - not enforced.

## Executive Summary

Shows high-level report summary:

**Report Details:**
- Report Period (Month/Year)
- Report Date (as-of date)
- Number of portfolios
- Total AUM
- Weighted average return

**Portfolio Performance Summary:**
- Best performer (with return vs benchmark)
- Underperformer (with return vs benchmark)
- Risk status summary
- Compliance issues summary

**Data Quality Summary:**
- All files imported status
- Data confirmation completed (by whom, when)
- Critical validation issues status
- Warning issues summary (acknowledged in L1/L2)

## User Actions

- **Review executive summary**: View high-level metrics and summaries
- **View approval history**: Click link → modal showing all approval steps, approvers, comments
- **View portfolio reports**: Click link → opens portfolio performance reports
- **Add comments**: Type approval comments (recommended for L3 to document final sign-off)
- **Approve (Final)**: Click "Approve" → opens confirmation modal → click "Confirm" → finalizes batch
- **Reject**: Click "Reject" → opens rejection modal → enter reason → select notify users → select return stage → rejects and returns batch

## Final Approval Flow

When "Approve" is clicked:
1. Opens final approval confirmation modal with prominent warning
2. User reviews final approval summary
3. User clicks "Confirm"
4. System logs approval (user, date/time, IP, comments)
5. Batch status changes to "L3 Approved - Finalized"
6. Success toast: "Final approval complete - batch finalized"
7. User is redirected to Start Page or Workflow View
8. Email notification sent to report generation team and stakeholders
9. Batch is locked - can only be modified via "Reject Final Reports" (Screen 15)

## Rejection Flow

Same as Level 1 & 2:
- Rejection reason required
- Select users to notify
- Select return stage (Data Confirmation, L1, L2, or earlier)
- Batch status changes to "Rejected at L3"
- Email notifications sent with rejection reason
- Batch returns to selected stage for rework

## Validation Rules

- Level 2 approval must be complete before L3 approval is enabled
- If L2 is not approved, "Approve" button is disabled with tooltip: "Level 2 approval required first"
- Rejection reason must be at least 20 characters
- At least one user must be selected for rejection notification
- Comments are strongly recommended (warning tooltip if empty)

## Access Control

- Only users with "L3 Approver" role (executive/senior management) can access this screen
- Users who performed L1 or L2 approval can still perform L3 (no strict separation at L3)
- Audit trail captures approver identity and timestamp with special "FINAL APPROVAL" flag

## Navigation

- **From:**
  - Approve Level 2 (Screen 13) - automatic redirect after L2 approval (for L3 approvers)
  - Monthly Process Workflow View (Screen 18) - via "Approve L3" step
  - Start Page (Screen 1) - via "View Details" → "Approve L3" button
- **To:**
  - Approval History Modal (same screen)
  - Portfolio Reports (external link or separate page)
  - Start Page (Screen 1) - after approval/rejection
  - Monthly Process Workflow View (Screen 18) - via breadcrumb or navigation

## Post-Approval Actions

After L3 approval is complete, the batch is finalized and:
- Report generation can proceed
- Client-facing reports can be distributed
- Monthly process is considered complete
- Batch can only be reopened via "Reject Final Reports" (Screen 15)

## Differences from Level 1 & 2

| Aspect | Level 1 | Level 2 | Level 3 |
|--------|---------|---------|---------|
| **Focus** | Data completeness | Portfolio performance | Executive sign-off |
| **Approver** | Data/ops team | Portfolio managers | Executives/senior mgmt |
| **Checklist** | File imports, data validation | Performance, risk, compliance | Final approval readiness |
| **Summary** | Data statistics | Per-portfolio metrics | Executive-level summary |
| **Comments** | Optional | Optional | Strongly recommended |
| **After Approval** | Proceeds to L2 | Proceeds to L3 | Batch finalized |

## Notes

- Level 3 is the final approval - no further approval stages
- Executive summary consolidates key information from L1 and L2
- Comments field is strongly recommended for L3 to document final sign-off decision
- After L3 approval, batch is locked and can only be modified via "Reject Final Reports"
- Approval history link shows complete audit trail (L1, L2, L3 with all approvers and comments)
- Final approval confirmation modal has prominent warning about finalization
- Email notifications go to broader stakeholder list (report generation, compliance, clients)
