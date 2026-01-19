# Wireframes: Monthly Process Workflow

## Summary

This wireframe set documents the complete Monthly Process workflow for the InvestInsight application. The monthly process consists of 5 main phases: Data Import, Data Maintenance, Data Verification, Approvals, and Monitoring. These wireframes were created based on the product specifications and represent the user interface for conducting monthly portfolio reporting cycles.

**Total Screens:** 18

## Screens

| #   | Screen                          | Description                                                                 | File                                         |
| --- | ------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | Start Page                      | Landing page with 2 tabs: Report Batches + New Report Batch                | `screen-01-start-page.md`                    |
| 1b  | New Report Batch Tab            | Form to create new monthly batch with optional SFTP auto-import            | `screen-01b-new-report-batch-tab.md`         |
| 2   | Portfolio File Dashboard        | Grid showing 7 file types per portfolio with status icons                  | `screen-02-portfolio-file-dashboard.md`      |
| 3   | File Import Popup               | Multi-step modal: Upload → Validate → Import                               | `screen-03-file-import-popup.md`             |
| 4   | Other Files Dashboard           | Bloomberg and Custodian file imports                                        | `screen-04-other-files-dashboard.md`         |
| 5   | Instrument Static Page          | View/manage instrument master data with collapsible columns                | `screen-05-instrument-static-page.md`        |
| 6   | Credit Rating Page              | CRUD with "Retry Decision Flow" and Full Audit Trail                       | `screen-06-credit-rating-page.md`            |
| 7   | Index Prices Page               | CRUD with upload and price history view                                    | `screen-07-index-prices-page.md`             |
| 8   | Duration & YTM Page             | CRUD for bond duration and yield-to-maturity values                        | `screen-08-duration-ytm-page.md`             |
| 9   | Beta Page                       | CRUD for equity beta values                                                | `screen-09-beta-page.md`                     |
| 10  | Custom Holding Capture          | CRUD for manually entered holdings with portfolio/instrument dropdowns     | `screen-10-custom-holding-capture.md`        |
| 11  | Data Confirmation               | 3-tab verification: File Check, Main Data Check, Other Data Check          | `screen-11-data-confirmation.md`             |
| 12  | Approve Level 1                 | First approval stage with data summary and approval/rejection               | `screen-12-approve-level-1.md`               |
| 13  | Approve Level 2                 | Second approval stage with portfolio-level validation                      | `screen-13-approve-level-2.md`               |
| 14  | Approve Level 3                 | Final executive approval stage                                              | `screen-14-approve-level-3.md`               |
| 15  | Reject Final Reports            | Post-L3 rejection capability for reopening finalized batches               | `screen-15-reject-final-reports.md`          |
| 16  | Monthly Process Logs            | Workflow and approval logs with 3 tabs                                      | `screen-16-monthly-process-logs.md`          |
| 17  | File Process Logs               | File-level import tracking with download capability                        | `screen-17-file-process-logs.md`             |
| 18  | Monthly Process Workflow View   | Orchestration checklist showing all workflow steps and current status      | `screen-18-monthly-process-workflow-view.md` |
| -   | CRUD Template Pattern           | Reusable pattern for data maintenance screens (Screens 6-10)               | `_crud-template.md`                          |

## Screen Flow

```
START
  ↓
[1] Start Page
  ├─ [1b] New Report Batch Tab → Create Batch
  └─ View Existing Batch → [18] Workflow View
                              ↓
PHASE 1: DATA IMPORT
  ↓
[2] Portfolio File Dashboard → [3] File Import Popup
  ↓
[4] Other Files Dashboard → [3] File Import Popup
  ↓
PHASE 2: DATA MAINTENANCE
  ↓
[5] Instrument Static Page
[6] Credit Rating Page
[7] Index Prices Page
[8] Duration & YTM Page
[9] Beta Page
[10] Custom Holding Capture
  ↓
PHASE 3: DATA VERIFICATION
  ↓
[11] Data Confirmation (3 tabs)
  ↓
PHASE 4: APPROVALS
  ↓
[12] Approve Level 1
  ↓
[13] Approve Level 2
  ↓
[14] Approve Level 3
  ↓
FINALIZED
  ↓
[15] Reject Final Reports (if needed)
  ↓
PHASE 5: MONITORING
  ↓
[16] Monthly Process Logs
[17] File Process Logs
[18] Monthly Process Workflow View (available throughout)
```

## Design Notes

### Common Patterns

1. **Status Badges:**
   - ✓ Done / Complete / Approved (green)
   - 🔄 In Progress / Processing (blue)
   - ⚠️ Warning / Fix Data (yellow/orange)
   - ❌ Failed / Rejected (red)
   - ⏳ Pending (gray)

2. **Action Buttons:**
   - Primary actions: Blue/prominent (e.g., "Approve", "Save", "Upload")
   - Secondary actions: Gray/subtle (e.g., "Cancel", "View Details")
   - Destructive actions: Red (e.g., "Delete", "Reject")

3. **Modal Patterns:**
   - Confirmation modals for all destructive actions
   - File Import Popup reused across multiple screens
   - Audit Trail modals with consistent format

4. **Grid/Table Patterns:**
   - Searchable and filterable
   - Sortable columns (click header)
   - Pagination (50 items per page default)
   - Export to CSV capability

5. **Navigation:**
   - Breadcrumb navigation at top
   - "Back" buttons to previous screen
   - "Proceed to Next" buttons for linear workflows
   - Workflow View (Screen 18) accessible from anywhere

### CRUD Template

Screens 6-10 follow a consistent CRUD pattern (detailed in `_crud-template.md`):
- Add/Edit/View/Delete functionality
- Audit Trail tracking
- Optional bulk upload
- Search and filter capabilities
- Validation error handling

### Responsive Considerations

- Tables/grids become horizontally scrollable on smaller screens
- Modals stack content vertically on mobile
- Action buttons group into dropdowns on smaller viewports
- Phase sections in Workflow View collapse by default on mobile

### Accessibility

- All interactive elements have clear labels
- Status icons paired with text (not icon-only)
- Form fields have visible labels and validation messages
- Keyboard navigation support throughout
- Color contrast meets WCAG AA standards

### Audit Trail & Compliance

- All approval actions log user, date/time, IP address
- Rejection reasons are required and permanently stored
- Post-L3 rejections flagged as "CRITICAL ACTION"
- File imports preserve original uploaded files
- All logs retained per regulatory requirements (2-7 years)

## Implementation Priority

### Phase 1: Core Workflow (MVP)
1. Screen 1 & 1b - Start Page + New Batch
2. Screen 2 - Portfolio File Dashboard
3. Screen 3 - File Import Popup
4. Screen 4 - Other Files Dashboard
5. Screen 11 - Data Confirmation
6. Screen 12-14 - Approval Levels 1-3
7. Screen 18 - Workflow View

### Phase 2: Data Maintenance
8. Screen 5 - Instrument Static Page
9. Screens 6-10 - CRUD screens (use template)

### Phase 3: Monitoring & Advanced Features
10. Screen 16 - Monthly Process Logs
11. Screen 17 - File Process Logs
12. Screen 15 - Reject Final Reports

## Related Documentation

- Product Specification: `documentation/InvestInsight-Product-Guide.md`
- Frontend Requirements: `documentation/FrontEndRequirements_AI.md`
- Views Hierarchy: `documentation/InvestInsightViewsHierarchy.md`
- API Definition: `api/Api Definition.yaml`

## Next Steps

After wireframe approval:
1. Use **feature-planner** agent to create epics and stories
2. Create detailed component specifications
3. Build UI components using Shadcn UI
4. Implement API integration
5. Add comprehensive tests (integration-focused)

---

**Created:** 2025-01-19
**Created By:** ui-ux-designer agent
**Status:** Ready for Review
