# Screen: Approve Level 1

## Purpose

First approval stage - reviewer validates data confirmation and approves to proceed to Level 2, or rejects with reason.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Data Confirmation]  Monthly Process > Approve Level 1 > Jan 2025             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Approve Level 1 - January 2025                                                  |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Status: ⏳ Awaiting Level 1 Approval                                             |
|  Data Confirmation: ✓ Confirmed by John Doe on 2025-01-15 16:45                 |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Approval Checklist                                                           │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Before approving, verify the following:                                    │ |
|  │                                                                              │ |
|  │  [ ] All portfolio files imported successfully                              │ |
|  │  [ ] Data confirmation completed (all 3 tabs checked)                       │ |
|  │  [ ] Critical validation issues resolved                                    │ |
|  │  [ ] Holdings reconciliation reviewed (if discrepancies exist)              │ |
|  │  [ ] Performance data verified                                              │ |
|  │  [ ] Fees and income data verified                                          │ |
|  │                                                                              │ |
|  │  (Check boxes are informational - not enforced by system)                   │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Data Summary                                                                 │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Portfolios: 8                                                               │ |
|  │  Total Holdings: 12,456                                                      │ |
|  │  Total Transactions: 2,341                                                   │ |
|  │  Total AUM: $2.4B USD                                                        │ |
|  │                                                                              │ |
|  │  Outstanding Issues:                                                         │ |
|  │  • 23 instruments with missing ISINs (warning only)                          │ |
|  │  • 58 custodian reconciliation discrepancies (under review)                  │ |
|  │                                                                              │ |
|  │  [View Full Data Confirmation Report]                                       │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Comments (Optional)                                                          │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌────────────────────────────────────────────────────────────────────────┐ │ |
|  │  │ Add any notes or comments about this approval...                       │ │ |
|  │  │                                                                         │ │ |
|  │  │                                                                         │ │ |
|  │  └────────────────────────────────────────────────────────────────────────┘ │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [Reject]                                                            [Approve]   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

REJECTION MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ Reject Level 1 Approval                                     [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  Rejection Reason *                                                │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ Please provide a detailed reason for rejection:            │    │       |
|     │  │                                                             │    │       |
|     │  │ Holdings reconciliation discrepancies too large -          │    │       |
|     │  │ requires investigation before approval. 58 discrepancies   │    │       |
|     │  │ totaling $2.3M variance.                                   │    │       |
|     │  │                                                             │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  Notify: (Select users to notify of rejection)                    │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [x] John Doe (Data Confirmer)                              │    │       |
|     │  │ [x] Jane Smith (Portfolio Manager)                         │    │       |
|     │  │ [ ] Mike Johnson (Operations Lead)                         │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  Return batch to: [Data Confirmation v]                           │       |
|     │  (Options: Data Confirmation, Portfolio Files, Other Files)        │       |
|     │                                                                     │       |
|     │  * Required field                                                  │       |
|     │                                                                     │       |
|     │  [Cancel]                                        [Confirm Reject]  │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+

APPROVAL CONFIRMATION MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ Confirm Level 1 Approval                                    [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  ✓ Approve Level 1 for January 2025 Report Batch?                 │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  By approving, you confirm that:                                   │       |
|     │                                                                     │       |
|     │  • Data confirmation has been completed                            │       |
|     │  • All critical validation issues are resolved                     │       |
|     │  • The data is ready for Level 2 review                            │       |
|     │                                                                     │       |
|     │  This approval will advance the batch to Level 2.                  │       |
|     │                                                                     │       |
|     │  Your approval will be logged with:                                │       |
|     │  • User: Jane Approver                                             │       |
|     │  • Date/Time: 2025-01-15 17:32                                     │       |
|     │  • IP Address: 192.168.1.100                                       │       |
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
| Status Banner | Text | Shows current approval status and data confirmation details |
| Approval Checklist | Checklist | Informational checklist for reviewer (not enforced) |
| Data Summary | Card | High-level statistics and outstanding issues |
| View Full Report | Link | Opens Data Confirmation screen (Screen 11) in read-only mode |
| Comments | Text Area | Optional approval comments |
| Reject Button | Button | Opens rejection modal |
| Approve Button | Button | Opens approval confirmation modal |
| Rejection Reason | Text Area (required) | Detailed reason for rejection |
| Notify Users | Checkbox List | Select users to notify of rejection |
| Return Batch To | Dropdown | Select which stage to return batch to |
| Confirm Reject | Button | Submits rejection |
| Confirm Approval | Button | Submits approval |

## Approval Checklist (Informational)

The checklist serves as a reminder for reviewers:
- All portfolio files imported successfully
- Data confirmation completed (all 3 tabs checked)
- Critical validation issues resolved
- Holdings reconciliation reviewed
- Performance data verified
- Fees and income data verified

**Note:** Checkboxes are for reviewer's own tracking - not enforced by system. Approval is allowed even if boxes are unchecked.

## Data Summary

Shows high-level metrics:
- Number of portfolios
- Total holdings count
- Total transactions count
- Total AUM (Assets Under Management)
- Outstanding issues (warnings only - don't block approval)

## User Actions

- **Review data**: View summary and checklist
- **View full report**: Click "View Full Data Confirmation Report" → opens Screen 11 in read-only mode
- **Add comments**: Type optional comments in text area
- **Approve**: Click "Approve" → opens confirmation modal → click "Confirm" → approves and advances to L2
- **Reject**: Click "Reject" → opens rejection modal → enter reason → select notify users → select return stage → click "Confirm Reject" → rejects and returns batch

## Approval Flow

When "Approve" is clicked:
1. Opens confirmation modal
2. Shows approval summary and audit details
3. User clicks "Confirm"
4. System logs approval (user, date/time, IP, comments)
5. Batch status changes to "L1 Approved - Awaiting L2"
6. Success toast: "Level 1 approved successfully"
7. User is redirected to Start Page (Screen 1) or Workflow View (Screen 18)
8. Email notification sent to L2 approvers

## Rejection Flow

When "Reject" is clicked:
1. Opens rejection modal
2. User enters detailed rejection reason (required)
3. User selects users to notify (defaults to data confirmer)
4. User selects return stage (defaults to Data Confirmation)
5. User clicks "Confirm Reject"
6. System logs rejection (user, date/time, IP, reason)
7. Batch status changes to "Rejected at L1"
8. Batch returns to selected stage (Data Confirmation, Portfolio Files, or Other Files)
9. Error toast: "Level 1 rejected - batch returned to [stage]"
10. Email notification sent to selected users with rejection reason
11. User is redirected to Start Page (Screen 1)

## Validation Rules

- Data Confirmation must be marked as "Confirmed" before L1 approval is enabled
- If Data Confirmation is not complete, "Approve" button is disabled with tooltip: "Complete Data Confirmation first"
- Rejection reason must be at least 20 characters
- At least one user must be selected for rejection notification

## Access Control

- Only users with "L1 Approver" role can access this screen
- Users who performed Data Confirmation cannot approve L1 (separation of duties)
- Audit trail captures approver identity and timestamp

## Navigation

- **From:**
  - Data Confirmation (Screen 11) - via "Proceed to L1" button
  - Monthly Process Workflow View (Screen 18) - via "Approve L1" step
  - Start Page (Screen 1) - via "View Details" → "Approve L1" button
- **To:**
  - Data Confirmation (Screen 11) - via "View Full Report" link (read-only)
  - Start Page (Screen 1) - after approval/rejection
  - Monthly Process Workflow View (Screen 18) - via breadcrumb or navigation
  - Approve Level 2 (Screen 13) - automatic redirect for L2 approvers after L1 approval

## Notes

- Level 1 approval is the first gate - focuses on data completeness and accuracy
- Approval checklist is for guidance only - system allows approval even if items are unchecked
- Comments are optional but recommended for audit trail purposes
- Outstanding warning issues (missing ISINs, etc.) don't block approval
- Rejection reason is required and stored permanently for audit purposes
- Batch can be rejected back to any prior stage (Data Confirmation, Portfolio Files, Other Files)
- Email notifications include rejection reason and link back to the system
