# Screen: Reject Final Reports

## Purpose

Post-L3 rejection capability - allows authorized users to reopen a finalized batch if critical issues are discovered after final approval.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Monthly Process > Reject Final Reports > Jan 2025                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Reject Final Reports - January 2025                                             |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  ⚠️ WARNING: This batch has been FINALIZED (L3 approved)                         |
|                                                                                   |
|  Status: ✓ L3 Approved - Finalized                                               |
|  Final Approval: ✓ Approved by Sarah Executive on 2025-01-16 14:22              |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Rejection Warning                                                            │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ⚠️ Use this function ONLY if critical issues are discovered after final     │ |
|  │  approval that require immediate correction.                                 │ |
|  │                                                                              │ |
|  │  This action will:                                                           │ |
|  │  • Reopen the batch for editing                                              │ |
|  │  • Reset approval status to the selected stage                               │ |
|  │  • Require re-approval through all subsequent levels                         │ |
|  │  • Notify all stakeholders of the rejection                                  │ |
|  │  • Create a permanent audit trail entry                                      │ |
|  │                                                                              │ |
|  │  Common reasons for post-L3 rejection:                                       │ |
|  │  • Critical data error discovered (e.g., incorrect performance calc)         │ |
|  │  • Material compliance breach identified                                     │ |
|  │  • Client-reported discrepancy requiring correction                          │ |
|  │  • Regulatory reporting error                                                │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Batch Summary                                                                │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Report Period: January 2025                                                │ |
|  │  Final Approval Date: 2025-01-16 14:22                                      │ |
|  │  Final Approver: Sarah Executive                                            │ |
|  │  Portfolios: 8                                                               │ |
|  │  Total AUM: $2.4B USD                                                        │ |
|  │                                                                              │ |
|  │  Approval History:                                                           │ |
|  │  • L1 Approved: Jane Approver (2025-01-15 17:32)                            │ |
|  │  • L2 Approved: Mike Reviewer (2025-01-16 09:15)                            │ |
|  │  • L3 Approved: Sarah Executive (2025-01-16 14:22)                          │ |
|  │                                                                              │ |
|  │  [View Full Approval History]                                               │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Rejection Details                                                            │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Rejection Reason * (Detailed explanation required)                         │ |
|  │  ┌────────────────────────────────────────────────────────────────────────┐ │ |
|  │  │ Critical error discovered in PF-003 performance calculation. The       │ │ |
|  │  │ reported MTD return of +3.12% is incorrect due to a transaction       │ │ |
|  │  │ being recorded twice. Correct return should be +2.48%. Requires       │ │ |
|  │  │ transaction file re-import and performance recalculation.             │ │ |
|  │  │                                                                         │ │ |
|  │  │ Client has been notified and expects corrected report by COB.         │ │ |
|  │  └────────────────────────────────────────────────────────────────────────┘ │ |
|  │                                                                              │ |
|  │  Notify Stakeholders: (Select users to notify)                              │ |
|  │  ┌────────────────────────────────────────────────────────────────────────┐ │ |
|  │  │ [x] Sarah Executive (Final Approver)                                   │ │ |
|  │  │ [x] Mike Reviewer (L2 Approver)                                        │ │ |
|  │  │ [x] Jane Approver (L1 Approver)                                        │ │ |
|  │  │ [x] John Doe (Data Confirmer)                                          │ │ |
|  │  │ [x] Report Generation Team                                             │ │ |
|  │  │ [ ] Compliance Team                                                    │ │ |
|  │  │ [ ] Executive Management                                               │ │ |
|  │  └────────────────────────────────────────────────────────────────────────┘ │ |
|  │                                                                              │ |
|  │  Return Batch To: *                                                         │ |
|  │  ┌────────────────────────────────────────────────────────────────────────┐ │ |
|  │  │ [Portfolio Files v]                                                    │ │ |
|  │  └────────────────────────────────────────────────────────────────────────┘ │ |
|  │  (Options: Portfolio Files, Other Files, Data Confirmation, L1, L2)        │ |
|  │                                                                              │ |
|  │  Re-approval Required:                                                      │ |
|  │  • If returned to Portfolio Files: Requires Data Conf. → L1 → L2 → L3      │ |
|  │  • If returned to Data Confirmation: Requires L1 → L2 → L3                  │ |
|  │  • If returned to L1: Requires L1 → L2 → L3                                 │ |
|  │  • If returned to L2: Requires L2 → L3                                      │ |
|  │                                                                              │ |
|  │  * Required fields                                                          │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  [Cancel]                                                    [Reject Final Batch]|
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

REJECTION CONFIRMATION MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ ⚠️ Confirm Rejection of Finalized Batch                     [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  ⚠️ YOU ARE ABOUT TO REJECT A FINALIZED BATCH                      │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  Batch: January 2025                                               │       |
|     │  Current Status: L3 Approved - Finalized                           │       |
|     │  Final Approver: Sarah Executive (2025-01-16 14:22)                │       |
|     │                                                                     │       |
|     │  This action will:                                                  │       |
|     │  • Reopen the batch for editing                                    │       |
|     │  • Reset status to "Portfolio Files" stage                         │       |
|     │  • Require re-approval through Data Conf. → L1 → L2 → L3           │       |
|     │  • Notify 5 selected stakeholders                                  │       |
|     │  • Create permanent audit trail entry (CRITICAL ACTION)            │       |
|     │                                                                     │       |
|     │  Rejection Reason (first 100 chars):                               │       |
|     │  "Critical error discovered in PF-003 performance calculation..."  │       |
|     │                                                                     │       |
|     │  This action is IRREVERSIBLE and will be PERMANENTLY LOGGED.       │       |
|     │                                                                     │       |
|     │  Your rejection will be logged with:                               │       |
|     │  • User: Compliance Officer                                        │       |
|     │  • Date/Time: 2025-01-17 08:45                                     │       |
|     │  • IP Address: 192.168.1.110                                       │       |
|     │  • Reason: [full reason text]                                      │       |
|     │                                                                     │       |
|     │  [Cancel]                                       [Confirm Rejection]│       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Warning Banner | Alert | Prominent warning that batch is finalized |
| Rejection Warning | Card | Explains when and why to use post-L3 rejection |
| Batch Summary | Card | Shows finalized batch details and approval history |
| View Full Approval History | Link | Opens modal with complete approval trail |
| Rejection Reason | Text Area (required) | Detailed explanation of why batch is being rejected |
| Notify Stakeholders | Checkbox List | Select users to notify (defaults to all approvers + data team) |
| Return Batch To | Dropdown (required) | Select which stage to return batch to |
| Re-approval Required | Info Text | Shows which approval steps must be repeated |
| Cancel | Button | Abandons rejection and returns to Start Page |
| Reject Final Batch | Button | Opens confirmation modal |
| Confirm Rejection | Button | Executes rejection and reopens batch |

## Rejection Warning

Explains appropriate use cases for post-L3 rejection:
- Critical data error discovered (e.g., incorrect performance calculation)
- Material compliance breach identified
- Client-reported discrepancy requiring correction
- Regulatory reporting error

**What happens when you reject:**
- Batch is reopened for editing
- Approval status is reset to selected stage
- Requires re-approval through all subsequent levels
- All stakeholders are notified via email
- Permanent audit trail entry is created with "CRITICAL ACTION" flag

## Batch Summary

Shows context about the finalized batch:
- Report period
- Final approval date and approver
- Number of portfolios and total AUM
- Complete approval history (L1, L2, L3 with dates/users)

## Rejection Details

**Rejection Reason (Required):**
- Must be at least 50 characters (more detailed than standard rejection)
- Should explain: What is wrong, why it's critical, what needs to be fixed
- Will be included in email notifications and audit trail

**Notify Stakeholders:**
- Defaults to selecting all approvers (L1, L2, L3) + data confirmer + report generation team
- Can optionally notify compliance team, executive management, etc.
- All selected users receive email with rejection reason and link to batch

**Return Batch To:**
- Portfolio Files - if file imports need to be redone
- Other Files - if Bloomberg/custodian data needs to be re-imported
- Data Confirmation - if data validation needs to be re-run
- L1 - if only approval review is needed (data is correct)
- L2 - if only portfolio-level approval is needed

**Re-approval Required:**
System automatically shows which approval stages must be repeated based on where the batch is returned to.

## User Actions

- **Review batch details**: View summary and approval history
- **View full approval history**: Click link → modal with complete approval trail
- **Enter rejection reason**: Type detailed explanation (minimum 50 characters)
- **Select stakeholders to notify**: Check boxes (defaults pre-selected)
- **Select return stage**: Choose where batch should restart
- **Cancel**: Click "Cancel" → returns to Start Page without rejecting
- **Reject**: Click "Reject Final Batch" → opens confirmation modal → review summary → click "Confirm Rejection" → rejects batch

## Rejection Flow

When "Reject Final Batch" is clicked:
1. Validates rejection reason (min 50 characters)
2. Validates at least one stakeholder is selected
3. Opens confirmation modal with prominent warning
4. Shows batch details and first 100 characters of rejection reason
5. User reviews and clicks "Confirm Rejection"
6. System logs rejection with "CRITICAL ACTION" flag (user, date/time, IP, full reason)
7. Batch status changes to "Rejected (Post-L3)"
8. Batch is returned to selected stage
9. Error toast: "Final batch rejected - returned to [stage]"
10. Email notifications sent to all selected stakeholders with:
    - Rejection reason
    - Who rejected (name + role)
    - When rejected (date/time)
    - Link to batch
11. User is redirected to Start Page (Screen 1)

## Validation Rules

- Rejection reason must be at least 50 characters (stricter than standard rejection)
- At least one stakeholder must be selected for notification
- Return stage must be selected
- Only users with "Reject Final Reports" permission can access this screen
- Batch must be in "L3 Approved - Finalized" status (cannot reject if already rejected)

## Access Control

- Only users with "Reject Final Reports" role (typically compliance, senior management) can access this screen
- This permission is separate from L1/L2/L3 approver roles
- Audit trail captures rejector identity with special "POST-L3 REJECTION" flag
- Action is logged to compliance/audit systems for regulatory oversight

## Re-Approval Requirements

After rejection, batch must go through approval stages again:

| Returned To | Re-Approval Path |
|-------------|------------------|
| Portfolio Files | Data Conf. → L1 → L2 → L3 |
| Other Files | Data Conf. → L1 → L2 → L3 |
| Data Confirmation | L1 → L2 → L3 |
| L1 | L1 → L2 → L3 |
| L2 | L2 → L3 |

**Note:** L3 approval is always required after post-L3 rejection.

## Navigation

- **From:**
  - Start Page (Screen 1) - via "Reject Final Reports" button (only visible for finalized batches)
  - Monthly Process Workflow View (Screen 18) - via "Reject Final Reports" link
- **To:**
  - Approval History Modal (same screen)
  - Start Page (Screen 1) - after rejection or cancellation

## Audit Trail

Post-L3 rejections are logged with special flags:
- **Action Type:** "POST-L3 REJECTION" (distinct from standard rejections)
- **Severity:** "CRITICAL"
- **Logged Fields:** User, Role, Date/Time, IP Address, Full Rejection Reason, Stakeholders Notified, Return Stage
- **Compliance Flag:** Yes (for regulatory oversight)
- **Notification:** Audit/compliance team is automatically notified

## Notes

- Post-L3 rejection is a serious action - only use when necessary
- Rejection reason is permanently logged and may be reviewed during audits
- All previous approval comments and history are preserved (not deleted)
- After re-approval, the audit trail shows both the original approval sequence and the rejection + re-approval sequence
- Some organizations may require additional authorization (e.g., two-person rule) for post-L3 rejection
- Email notifications include severity warning and link to batch
- Batch retains its original Report Date (not changed by rejection/re-approval)
