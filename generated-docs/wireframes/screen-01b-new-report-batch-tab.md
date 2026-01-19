# Screen: New Report Batch Tab

## Purpose

Form to create a new monthly report batch by selecting report date and optionally auto-importing files via SFTP.

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
|                    ──────────────────                                             |
|                                                                                   |
|  ┌─ New Report Batch Tab (Active) ────────────────────────────────────────────┐  |
|  │                                                                             │  |
|  │  Create New Report Batch                                                   │  |
|  │  ─────────────────────────────────────────────────────────────────────     │  |
|  │                                                                             │  |
|  │  Report Date *                                                              │  |
|  │  ┌────────────────────────────────────────┐                                │  |
|  │  │ [Select Month/Year...              v ] │  (Month/Year picker)           │  |
|  │  └────────────────────────────────────────┘                                │  |
|  │                                                                             │  |
|  │  Description (Optional)                                                     │  |
|  │  ┌────────────────────────────────────────────────────────────────────┐    │  |
|  │  │ Monthly reporting for January 2025...                              │    │  |
|  │  └────────────────────────────────────────────────────────────────────┘    │  |
|  │                                                                             │  |
|  │  [ ] Auto-import files via SFTP                                            │  |
|  │                                                                             │  |
|  │  ┌─ If SFTP is enabled: ──────────────────────────────────────────────┐   │  |
|  │  │                                                                      │   │  |
|  │  │  Files will be automatically imported from the configured SFTP      │   │  |
|  │  │  location for the selected report date. You can manually upload     │   │  |
|  │  │  files later if needed.                                              │   │  |
|  │  │                                                                      │   │  |
|  │  └──────────────────────────────────────────────────────────────────────┘   │  |
|  │                                                                             │  |
|  │                                                                             │  |
|  │  [Cancel]                                        [Create Report Batch]     │  |
|  │                                                                             │  |
|  └─────────────────────────────────────────────────────────────────────────────┘  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Report Date | Month/Year Picker | Select the month/year for this report batch (required) |
| Description | Text Area | Optional notes about this batch |
| Auto-import via SFTP | Checkbox | If checked, triggers SFTP import after creation |
| Cancel | Button | Return to Report Batches tab without creating |
| Create Report Batch | Button | Creates batch and navigates to Portfolio File Dashboard |

## User Actions

- **Select report date**: Click dropdown → choose month and year
- **Add description**: Type optional notes
- **Enable SFTP auto-import**: Check checkbox (if SFTP is configured)
- **Cancel**: Click "Cancel" → switches to Report Batches tab
- **Create batch**: Click "Create Report Batch" → creates batch record and navigates to Portfolio File Dashboard (Screen 2)

## Validation Rules

- Report Date is required
- Report Date cannot be in the future
- Report Date cannot duplicate an existing batch (show error if already exists)
- Description is optional (max 500 characters)

## Navigation

- **From:** Report Batches tab (same screen)
- **To:**
  - Portfolio File Dashboard (Screen 2) - after successful creation
  - Report Batches tab - via Cancel button

## Behavior

- When "Create Report Batch" is clicked:
  1. Validate inputs
  2. Create batch record with status "In Progress"
  3. If SFTP checkbox is checked, trigger SFTP import job
  4. Navigate to Portfolio File Dashboard (Screen 2) for this batch
  5. Show success toast: "Report batch for [Month Year] created successfully"

## Notes

- SFTP checkbox only visible if SFTP is configured in system settings
- Report Date dropdown should show last 24 months as options
- Description field is helpful for notes like "Includes restated data for Portfolio X"
