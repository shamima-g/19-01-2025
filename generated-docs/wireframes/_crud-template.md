# CRUD Template Pattern

## Purpose

This template describes the common CRUD (Create, Read, Update, Delete) pattern used by multiple data maintenance screens. The following screens use this pattern with slight variations:

- **Screen 6:** Credit Rating Page
- **Screen 7:** Index Prices Page
- **Screen 8:** Duration & YTM Page
- **Screen 9:** Beta Page
- **Screen 10:** Custom Holding Capture

## Standard CRUD Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Data Maintenance > [Entity Name]                                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Entity Name] Management                                                        |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Add New [Entity]]  [Upload File (if applicable)]  [Export to CSV]             |
|                                                                                   |
|  [Search by [key field]...]                    [Filter by [dimension] v]        |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ [Entity Name] Grid                                                           │ |
|  │                                                                              │ |
|  │  ┌──────┬───────────┬───────────┬───────────┬──────────┬─────────────────┐  │ |
|  │  | Edit | [Field 1] | [Field 2] | [Field 3] | [Field 4]| Actions         |  │ |
|  │  ├──────┼───────────┼───────────┼───────────┼──────────┼─────────────────┤  │ |
|  │  | [✏️] | Value 1   | Value 2   | Value 3   | Value 4  | [View]          |  │ |
|  │  |      |           |           |           |          | [Delete]        |  │ |
|  │  |      |           |           |           |          | [Audit Trail]   |  │ |
|  │  ├──────┼───────────┼───────────┼───────────┼──────────┼─────────────────┤  │ |
|  │  | [✏️] | Value 1   | Value 2   | Value 3   | Value 4  | [View]          |  │ |
|  │  |      |           |           |           |          | [Delete]        |  │ |
|  │  |      |           |           |           |          | [Audit Trail]   |  │ |
|  │  ├──────┼───────────┼───────────┼───────────┼──────────┼─────────────────┤  │ |
|  │  | ...  | ...       | ...       | ...       | ...      | ...             |  │ |
|  │  └──────┴───────────┴───────────┴───────────┴──────────┴─────────────────┘  │ |
|  │                                                                              │ |
|  │  Showing 1-50 of XXX records       [< Prev]  [1][2][3]...[N]  [Next >]     │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

ADD/EDIT MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ [Add New | Edit] [Entity Name]                              [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  [Field 1 Label] *                                                 │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [Input value or dropdown]                                 │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  [Field 2 Label] *                                                 │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [Input value or dropdown]                                 │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  [Field 3 Label]                                                   │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [Input value or dropdown]                                 │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  [Field 4 Label]                                                   │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [Input value or date picker]                              │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  * Required fields                                                 │       |
|     │                                                                     │       |
|     │  [Cancel]                                            [Save]        │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+

DELETE CONFIRMATION MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ Confirm Delete                                              [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  ⚠️ Are you sure you want to delete this [entity name]?            │       |
|     │                                                                     │       |
|     │  [Summary of record being deleted]                                 │       |
|     │                                                                     │       |
|     │  This action cannot be undone.                                     │       |
|     │                                                                     │       |
|     │  [Cancel]                                       [Delete]           │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+

AUDIT TRAIL MODAL:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ Audit Trail: [Entity Name] - [Record Identifier]           [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  Change History                                                    │       |
|     │  ───────────────────────────────────────────────────────────────   │       |
|     │                                                                     │       |
|     │  ┌──────────┬──────────┬────────────┬────────────┬─────────────┐  │       |
|     │  | Date     | User     | Field      | Old Value  | New Value   |  │       |
|     │  ├──────────┼──────────┼────────────┼────────────┼─────────────┤  │       |
|     │  | 01-15    | John Doe | Field 2    | Old Val    | New Val     |  │       |
|     │  | 14:32    |          |            |            |             |  │       |
|     │  ├──────────┼──────────┼────────────┼────────────┼─────────────┤  │       |
|     │  | 01-10    | Jane S.  | Field 1    | -          | Initial Val |  │       |
|     │  | 09:15    |          | (Created)  |            |             |  │       |
|     │  └──────────┴──────────┴────────────┴────────────┴─────────────┘  │       |
|     │                                                                     │       |
|     │  [Export to CSV]                                     [Close]       │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Standard Elements

| Element | Type | Description |
|---------|------|-------------|
| Add New [Entity] | Button | Opens modal/form to create new record |
| Upload File | Button | Opens File Import Popup (Screen 3) for bulk import (optional) |
| Export to CSV | Button | Downloads all records (respecting filters) as CSV |
| Search Input | Text Input | Filter records by key field |
| Filter Dropdown | Dropdown | Filter by dimension (portfolio, date range, type, etc.) |
| Edit Icon | Button | Opens edit modal with record pre-populated |
| View Button | Button | Opens read-only detail modal |
| Delete Button | Button | Opens delete confirmation modal |
| Audit Trail Button | Button | Opens audit trail modal showing change history |
| Pagination | Navigation | Navigate through pages of records |

## Standard User Actions

- **Add new record**: Click "Add New [Entity]" → opens modal → fill fields → click "Save"
- **Edit record**: Click [✏️] → opens modal with data pre-populated → modify → click "Save"
- **View record**: Click "View" → opens read-only modal with all fields displayed
- **Delete record**: Click "Delete" → opens confirmation modal → click "Delete" to confirm
- **View audit trail**: Click "Audit Trail" → opens modal with change history
- **Search records**: Type in search box → filters grid in real-time
- **Filter records**: Select from dropdown → shows only matching records
- **Export data**: Click "Export to CSV" → downloads filtered records
- **Upload bulk data**: Click "Upload File" → opens File Import Popup (Screen 3)

## Standard Validation Rules

- Required fields marked with `*` cannot be empty
- Date fields must be valid dates (use date picker)
- Dropdown fields must select from predefined options
- Numeric fields must contain valid numbers
- Duplicate key fields (e.g., InstrumentCode + Date) are prevented

## Standard Behaviors

- Grid refreshes after Add/Edit/Delete operations
- Success toast shows after successful operation: "[Entity] saved successfully"
- Error toast shows if operation fails: "Failed to save [entity]: [error message]"
- Audit trail shows: Date/Time, User, Field Changed, Old Value, New Value
- Audit trail includes creation record (Old Value = "-", New Value = initial value)
- Delete is soft delete (sets IsActive = false) unless hard delete is required
- Last changed user is captured for audit trail
- Grid supports sorting by clicking column headers
- Grid supports pagination (50 records per page default)

## Navigation Pattern

- **From:**
  - Main Dashboard or Data Maintenance menu
  - Data Confirmation screen (Screen 11) - via "Fix [entity]" links
- **To:**
  - Add/Edit Modal (same screen, modal overlay)
  - Audit Trail Modal (same screen, modal overlay)
  - File Import Popup (Screen 3) - if "Upload File" is available

## Notes

This pattern is intentionally consistent across multiple screens to provide a familiar user experience. Screen-specific variations are documented in each individual screen wireframe (Screens 6-10).
