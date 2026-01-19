# Screen: Duration & YTM Page

## Purpose

CRUD screen for maintaining instrument duration and yield-to-maturity (YTM) values.

## Pattern

This screen follows the **CRUD Template Pattern** (see `_crud-template.md`) with minimal customizations.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Data Maintenance > Duration & YTM                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Duration & YTM Management                                                       |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Add New Record]  [Upload File]  [Export to CSV]                               |
|                                                                                   |
|  [Search by Instrument Code or ISIN...]         [Filter by Asset Type v]        |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Duration & YTM Grid                                                          │ |
|  │                                                                              │ |
|  │  ┌──────┬────────┬─────────┬────────┬──────┬───────┬────────┬──────────┐   │ |
|  │  | Edit | Instr. | ISIN    | Name   | Dura | YTM   | Effect | Actions  |   │ |
|  │  |      | Code   |         |        | tion | (%)   | ive    |          |   │ |
|  │  |      |        |         |        |(Yrs) |       | Date   |          |   │ |
|  │  ├──────┼────────┼─────────┼────────┼──────┼───────┼────────┼──────────┤   │ |
|  │  | [✏️] | BND001 | US12345 | Corp   | 5.23 | 3.45  | Jan 31 | [View]   |   │ |
|  │  |      |        | 67890   | Bond A |      |       | 2025   | [Delete] |   │ |
|  │  |      |        |         |        |      |       |        | [Audit]  |   │ |
|  │  |      |        |         |        |      |       |        | [FA]     |   │ |
|  │  ├──────┼────────┼─────────┼────────┼──────┼───────┼────────┼──────────┤   │ |
|  │  | [✏️] | BND002 | GB09876 | Govt   | 8.71 | 2.15  | Jan 31 | [View]   |   │ |
|  │  |      |        | 54321   | Bond B |      |       | 2025   | [Delete] |   │ |
|  │  |      |        |         |        |      |       |        | [Audit]  |   │ |
|  │  |      |        |         |        |      |       |        | [FA]     |   │ |
|  │  ├──────┼────────┼─────────┼────────┼──────┼───────┼────────┼──────────┤   │ |
|  │  | [✏️] | BND003 | DE55551 | Muni   | 3.14 | 4.02  | Jan 31 | [View]   |   │ |
|  │  |      |        | 23456   | Bond C |      |       | 2025   | [Delete] |   │ |
|  │  |      |        |         |        |      |       |        | [Audit]  |   │ |
|  │  |      |        |         |        |      |       |        | [FA]     |   │ |
|  │  ├──────┼────────┼─────────┼────────┼──────┼───────┼────────┼──────────┤   │ |
|  │  | ...  | ...    | ...     | ...    | ...  | ...   | ...    | ...      |   │ |
|  │  └──────┴────────┴─────────┴────────┴──────┴───────┴────────┴──────────┘   │ |
|  │                                                                              │ |
|  │  Showing 1-50 of 342 records         [< Prev]  [1][2][3]...[7]  [Next >]   │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

Actions Legend: [FA] = Full Audit Trail
```

## Screen-Specific Elements

| Element | Type | Description |
|---------|------|-------------|
| Asset Type Filter | Dropdown | Filter by Bond, Preferred Stock, or All |
| Instrument Code | Text | Internal instrument identifier |
| ISIN | Text | International Securities Identification Number |
| Name | Text | Instrument name (abbreviated) |
| Duration | Number | Duration in years (modified duration) |
| YTM | Number | Yield to Maturity as percentage |
| Effective Date | Date | Date these values are effective from |
| Full Audit Trail | Link | Opens comprehensive audit view |

## Add/Edit Modal Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Instrument Code | Dropdown | Yes | Select from instrument master data (bonds only) |
| ISIN | Text (auto-populated) | - | Auto-filled based on selected Instrument Code |
| Duration (Years) | Number Input | Yes | Modified duration (e.g., 5.23) |
| YTM (%) | Number Input | Yes | Yield to Maturity percentage (e.g., 3.45) |
| Effective Date | Date Picker | Yes | Date from which these values apply |
| Source | Dropdown | No | Bloomberg, Manual, Model, Other |
| Notes | Text Area | No | Additional context |

## Upload File Format

CSV columns:
- InstrumentCode (required) - must exist in Instrument Static
- Duration (required) - numeric value (years)
- YTM (required) - numeric value (percentage)
- EffectiveDate (required) - YYYY-MM-DD format
- Source (optional) - defaults to "Manual"
- Notes (optional)

## Validation Rules

- Instrument Code must exist in Instrument Static master data
- Instrument must be a bond or fixed-income security (not equity)
- Duration must be a positive number (0-50 years typically)
- YTM can be positive or negative (negative rates are valid)
- Effective Date cannot be in the future
- Duplicate records (same Instrument Code + Effective Date) are rejected

## Navigation

- **From:**
  - Main Dashboard or Data Maintenance menu
  - Data Confirmation screen (Screen 11) - via "Update Duration/YTM" link
- **To:**
  - Add/Edit Modal (same screen)
  - Audit Trail Modal (same screen)
  - Full Audit Trail Modal (same screen)
  - File Import Popup (Screen 3) - via "Upload File"

## Notes

- Duration and YTM are typically updated monthly for all bonds
- Values are usually sourced from Bloomberg but can be entered manually or calculated
- Historical values are preserved (not overwritten) when new values are added
- Duration shown is Modified Duration (most common for risk analysis)
- YTM is expressed as annual percentage (e.g., 3.45% entered as 3.45, not 0.0345)
- Filter by Asset Type defaults to "Bond" to exclude equities (which don't have duration/YTM)
- Full Audit Trail shows all historical duration/YTM values for the instrument
