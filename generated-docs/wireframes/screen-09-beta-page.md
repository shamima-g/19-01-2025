# Screen: Beta Page

## Purpose

CRUD screen for maintaining instrument beta values (measure of volatility relative to market benchmark).

## Pattern

This screen follows the **CRUD Template Pattern** (see `_crud-template.md`) with minimal customizations.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Data Maintenance > Beta                                          |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Beta Management                                                                 |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Add New Beta]  [Upload File]  [Export to CSV]                                 |
|                                                                                   |
|  [Search by Instrument Code or ISIN...]         [Filter by Benchmark v]         |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Beta Grid                                                                    │ |
|  │                                                                              │ |
|  │  ┌──────┬────────┬─────────┬─────────┬───────┬──────────┬────────┬────────┐ │ |
|  │  | Edit | Instr. | ISIN    | Name    | Beta  | Benchmrk | Effect | Action │ │ |
|  │  |      | Code   |         |         |       |          | ive    | s      │ │ |
|  │  |      |        |         |         |       |          | Date   |        │ │ |
|  │  ├──────┼────────┼─────────┼─────────┼───────┼──────────┼────────┼────────┤ │ |
|  │  | [✏️] | ABC001 | US12345 | Apple   | 1.23  | SP500    | Jan 31 | [View] │ │ |
|  │  |      |        | 67890   | Inc.    |       |          | 2025   | [Del]  │ │ |
|  │  |      |        |         |         |       |          |        | [Audt] │ │ |
|  │  |      |        |         |         |       |          |        | [FA]   │ │ |
|  │  ├──────┼────────┼─────────┼─────────┼───────┼──────────┼────────┼────────┤ │ |
|  │  | [✏️] | DEF002 | GB09876 | BP PLC  | 0.87  | FTSE100  | Jan 31 | [View] │ │ |
|  │  |      |        | 54321   |         |       |          | 2025   | [Del]  │ │ |
|  │  |      |        |         |         |       |          |        | [Audt] │ │ |
|  │  |      |        |         |         |       |          |        | [FA]   │ │ |
|  │  ├──────┼────────┼─────────┼─────────┼───────┼──────────┼────────┼────────┤ │ |
|  │  | [✏️] | JKL004 | US55551 | Tesla   | 2.15  | SP500    | Jan 31 | [View] │ │ |
|  │  |      |        | 23456   | Inc.    |       |          | 2025   | [Del]  │ │ |
|  │  |      |        |         |         |       |          |        | [Audt] │ │ |
|  │  |      |        |         |         |       |          |        | [FA]   │ │ |
|  │  ├──────┼────────┼─────────┼─────────┼───────┼──────────┼────────┼────────┤ │ |
|  │  | ...  | ...    | ...     | ...     | ...   | ...      | ...    | ...    │ │ |
|  │  └──────┴────────┴─────────┴─────────┴───────┴──────────┴────────┴────────┘ │ |
|  │                                                                              │ |
|  │  Showing 1-50 of 856 beta values      [< Prev]  [1][2][3]...[18]  [Next >] │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

Actions Legend: [Del] = Delete  [Audt] = Audit Trail  [FA] = Full Audit Trail
```

## Screen-Specific Elements

| Element | Type | Description |
|---------|------|-------------|
| Benchmark Filter | Dropdown | Filter by benchmark index (SP500, FTSE100, DAX, etc., or All) |
| Instrument Code | Text | Internal instrument identifier |
| ISIN | Text | International Securities Identification Number |
| Name | Text | Instrument name (abbreviated) |
| Beta | Number | Beta value (volatility relative to benchmark) |
| Benchmark | Text | Index used as benchmark (SP500, FTSE100, etc.) |
| Effective Date | Date | Date this beta value is effective from |
| Full Audit Trail | Link | Opens comprehensive audit view |

## Add/Edit Modal Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Instrument Code | Dropdown | Yes | Select from instrument master data (equities only) |
| ISIN | Text (auto-populated) | - | Auto-filled based on selected Instrument Code |
| Beta | Number Input | Yes | Beta value (can be negative, typically -3 to +3) |
| Benchmark | Dropdown | Yes | Index used for beta calculation (SP500, FTSE100, etc.) |
| Effective Date | Date Picker | Yes | Date from which this beta applies |
| Calculation Period | Dropdown | No | 1-Year, 2-Year, 3-Year, 5-Year |
| Source | Dropdown | No | Bloomberg, Manual, Model, Other |
| Notes | Text Area | No | Additional context |

## Upload File Format

CSV columns:
- InstrumentCode (required) - must exist in Instrument Static
- Beta (required) - numeric value (can be negative)
- Benchmark (required) - must match index codes (SP500, FTSE100, etc.)
- EffectiveDate (required) - YYYY-MM-DD format
- CalculationPeriod (optional) - 1Y, 2Y, 3Y, 5Y
- Source (optional) - defaults to "Manual"
- Notes (optional)

## Validation Rules

- Instrument Code must exist in Instrument Static master data
- Instrument should be an equity (bonds typically don't have beta, though system allows it)
- Beta is typically between -3 and +3 (system warns but allows outliers)
- Benchmark must be a valid index code
- Effective Date cannot be in the future
- Duplicate records (same Instrument Code + Benchmark + Effective Date) are rejected

## Common Beta Interpretations

| Beta Value | Meaning |
|------------|---------|
| Beta = 1.0 | Moves exactly with the market |
| Beta > 1.0 | More volatile than market (e.g., 1.5 = 50% more volatile) |
| Beta < 1.0 | Less volatile than market (e.g., 0.5 = 50% less volatile) |
| Beta = 0 | No correlation to market |
| Beta < 0 | Moves opposite to market (rare) |

## Navigation

- **From:**
  - Main Dashboard or Data Maintenance menu
  - Data Confirmation screen (Screen 11) - via "Update Beta Values" link
- **To:**
  - Add/Edit Modal (same screen)
  - Audit Trail Modal (same screen)
  - Full Audit Trail Modal (same screen)
  - File Import Popup (Screen 3) - via "Upload File"

## Notes

- Beta values are typically updated monthly or quarterly
- Most beta values are calculated against market benchmarks (SP500 for US equities, FTSE100 for UK equities, etc.)
- An instrument can have multiple beta values (one per benchmark)
- Historical beta values are preserved when new values are added
- Beta is used for portfolio risk analysis and CAPM calculations
- Filter by Benchmark is useful when reviewing beta values for specific markets
- Full Audit Trail shows all historical beta values and benchmark changes
