# Screen: Approve Level 2

## Purpose

Second approval stage - portfolio-level validation and approval to proceed to Level 3, or rejection with reason.

## Pattern

This screen follows the same pattern as **Approve Level 1 (Screen 12)** with portfolio-focused checklist and summary.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Approve L1]  Monthly Process > Approve Level 2 > Jan 2025                    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Approve Level 2 - January 2025                                                  |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  Status: ⏳ Awaiting Level 2 Approval                                             |
|  Level 1 Approval: ✓ Approved by Jane Approver on 2025-01-15 17:32              |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Approval Checklist                                                           │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  Before approving, verify the following:                                    │ |
|  │                                                                              │ |
|  │  [ ] Portfolio performance metrics reviewed                                 │ |
|  │  [ ] Portfolio compliance checks passed                                     │ |
|  │  [ ] Asset allocation within policy limits                                  │ |
|  │  [ ] Risk metrics (beta, duration, VaR) verified                            │ |
|  │  [ ] Benchmark comparisons reviewed                                         │ |
|  │  [ ] Fee calculations verified                                              │ |
|  │  [ ] Cash positions reconciled                                              │ |
|  │                                                                              │ |
|  │  (Check boxes are informational - not enforced by system)                   │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Portfolio Summary                                                            │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌────────────────────┬───────────┬────────────┬────────────┬───────────┐   │ |
|  │  | Portfolio          | AUM       | Return     | Risk       | Complianc |   │ |
|  │  |                    | (USD)     | (MTD %)    | (Beta)     | e Status  |   │ |
|  │  ├────────────────────┼───────────┼────────────┼────────────┼───────────┤   │ |
|  │  | PF-001             | $342.5M   | +1.23%     | 0.87       | ✓ Pass    |   │ |
|  │  | Conservative       |           |            |            |           |   │ |
|  │  | Growth             |           |            |            |           |   │ |
|  │  ├────────────────────┼───────────┼────────────┼────────────┼───────────┤   │ |
|  │  | PF-002             | $875.2M   | +2.45%     | 1.15       | ✓ Pass    |   │ |
|  │  | Balanced           |           |            |            |           |   │ |
|  │  | Portfolio          |           |            |            |           |   │ |
|  │  ├────────────────────┼───────────┼────────────┼────────────┼───────────┤   │ |
|  │  | PF-003             | $524.8M   | +3.12%     | 1.42       | ⚠️ Review |   │ |
|  │  | Growth             |           |            |            | (Rebal.   |   │ |
|  │  | Portfolio          |           |            |            | needed)   |   │ |
|  │  ├────────────────────┼───────────┼────────────┼────────────┼───────────┤   │ |
|  │  | ... (5 more)       |           |            |            |           |   │ |
|  │  └────────────────────┴───────────┴────────────┴────────────┴───────────┘   │ |
|  │                                                                              │ |
|  │  [View Detailed Portfolio Reports]                                          │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Outstanding Items                                                            │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ⚠️ 1 portfolio flagged for rebalancing review (PF-003)                      │ |
|  │  • Equity allocation 82% (policy limit: 80%)                                 │ |
|  │  • Rebalancing recommendation generated                                      │ |
|  │                                                                              │ |
|  │  [View Rebalancing Recommendations]                                         │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Comments (Optional)                                                          │ |
|  │ ───────────────────────────────────────────────────────────────────────────  │ |
|  │                                                                              │ |
|  │  ┌────────────────────────────────────────────────────────────────────────┐ │ |
|  │  │ PF-003 equity drift acknowledged - client prefers quarterly           │ │ |
|  │  │ rebalancing. Will address in next rebalancing cycle.                  │ │ |
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
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Status Banner | Text | Shows current approval status and L1 approval details |
| Approval Checklist | Checklist | Portfolio-focused checklist for reviewer (not enforced) |
| Portfolio Summary | Table | High-level metrics per portfolio |
| Outstanding Items | Card | Compliance warnings or portfolio-specific issues |
| View Detailed Reports | Link | Opens portfolio reports in new tab/modal |
| View Rebalancing | Link | Opens rebalancing recommendations screen |
| Comments | Text Area | Optional approval comments |
| Reject Button | Button | Opens rejection modal (same as L1) |
| Approve Button | Button | Opens approval confirmation modal (same as L1) |

## Approval Checklist (Portfolio-Focused)

Level 2 checklist focuses on portfolio-level validation:
- Portfolio performance metrics reviewed
- Portfolio compliance checks passed
- Asset allocation within policy limits
- Risk metrics (beta, duration, VaR) verified
- Benchmark comparisons reviewed
- Fee calculations verified
- Cash positions reconciled

**Note:** Checkboxes are informational - not enforced.

## Portfolio Summary Table

Shows key metrics per portfolio:

| Column | Description |
|--------|-------------|
| Portfolio | Portfolio code and name |
| AUM | Assets Under Management in USD |
| Return (MTD %) | Month-to-date return percentage |
| Risk (Beta) | Portfolio-level beta |
| Compliance Status | ✓ Pass, ⚠️ Review (flagged issues), ❌ Fail (blocking issues) |

## Outstanding Items

Highlights portfolio-specific issues requiring attention:
- Compliance warnings (e.g., allocation drift)
- Rebalancing recommendations
- Performance anomalies
- Risk limit breaches (warnings only - don't block approval)

## User Actions

- **Review portfolios**: View summary table
- **View detailed reports**: Click link → opens portfolio performance/compliance reports
- **View rebalancing**: Click link → opens rebalancing recommendations screen
- **Add comments**: Type optional comments (e.g., acknowledging compliance drift)
- **Approve**: Click "Approve" → opens confirmation modal → click "Confirm" → approves and advances to L3
- **Reject**: Click "Reject" → opens rejection modal → enter reason → select notify users → select return stage → click "Confirm Reject" → rejects and returns batch

## Approval Flow

When "Approve" is clicked:
1. Opens confirmation modal (same as L1)
2. User clicks "Confirm"
3. System logs approval (user, date/time, IP, comments)
4. Batch status changes to "L2 Approved - Awaiting L3"
5. Success toast: "Level 2 approved successfully"
6. User is redirected to Start Page or Workflow View
7. Email notification sent to L3 approvers (final approvers)

## Rejection Flow

Same as Level 1 (Screen 12):
- Rejection reason required
- Select users to notify
- Select return stage (Data Confirmation, L1, or earlier)
- Batch status changes to "Rejected at L2"
- Email notifications sent

## Validation Rules

- Level 1 approval must be complete before L2 approval is enabled
- If L1 is not approved, "Approve" button is disabled with tooltip: "Level 1 approval required first"
- Rejection reason must be at least 20 characters
- At least one user must be selected for rejection notification

## Access Control

- Only users with "L2 Approver" role can access this screen
- Users who performed L1 approval can perform L2 approval (no separation requirement at L2)
- Audit trail captures approver identity and timestamp

## Navigation

- **From:**
  - Approve Level 1 (Screen 12) - automatic redirect after L1 approval (for L2 approvers)
  - Monthly Process Workflow View (Screen 18) - via "Approve L2" step
  - Start Page (Screen 1) - via "View Details" → "Approve L2" button
- **To:**
  - Portfolio Reports (external link or separate page)
  - Rebalancing Recommendations (weekly process screen - not in monthly process scope)
  - Start Page (Screen 1) - after approval/rejection
  - Monthly Process Workflow View (Screen 18) - via breadcrumb or navigation
  - Approve Level 3 (Screen 14) - automatic redirect for L3 approvers after L2 approval

## Differences from Level 1

| Aspect | Level 1 | Level 2 |
|--------|---------|---------|
| **Focus** | Data completeness & accuracy | Portfolio performance & compliance |
| **Checklist** | File imports, data validation | Performance, risk, compliance |
| **Summary** | Overall data statistics | Per-portfolio metrics |
| **Issues** | Missing data, validation errors | Compliance drift, rebalancing needs |
| **Approver** | Data/operations team | Portfolio managers, compliance |

## Notes

- Level 2 approval focuses on portfolio-level validation (performance, risk, compliance)
- Compliance warnings (e.g., allocation drift) don't block approval but must be acknowledged in comments
- Portfolio summary shows month-to-date performance and compliance status
- Rebalancing recommendations are informational - don't block monthly process
- Comments field is important for documenting why warnings were accepted
- Batch can be rejected back to L1, Data Confirmation, or earlier stages
