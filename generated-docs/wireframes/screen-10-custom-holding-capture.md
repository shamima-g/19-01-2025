# Screen: Custom Holding Capture

## Purpose

CRUD screen for manually capturing custom holdings that aren't included in portfolio file imports (e.g., private investments, manual adjustments).

## Pattern

This screen follows the **CRUD Template Pattern** (see `_crud-template.md`) with the following customizations:

- **Portfolio Selector:** Dropdown to select which portfolio the holding belongs to
- **Instrument Selector:** Dropdown to select instrument (with search/autocomplete)
- **No Upload File:** Manual entry only (no bulk import for custom holdings)

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Data Maintenance > Custom Holdings                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Custom Holding Capture                                                          |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Add New Holding]  [Export to CSV]                                             |
|                                                                                   |
|  [Search by Portfolio or Instrument...]         [Filter by Portfolio v]         |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Custom Holdings Grid                                                         │ |
|  │                                                                              │ |
|  │  ┌────┬──────────┬────────┬─────────┬─────────┬───────┬──────────┬────────┐ │ |
|  │  | Ed | Portfoli | Instr. | ISIN    | Name    | Qty   | Value    | Action │ │ |
|  │  | it | o Code   | Code   |         |         |       | (Base    | s      │ │ |
|  │  |    |          |        |         |         |       | Curr)    |        │ │ |
|  │  ├────┼──────────┼────────┼─────────┼─────────┼───────┼──────────┼────────┤ │ |
|  │  | [✏️]| PF-001  | PRIV01 | -       | Private | 1,000 | 150,000  | [View] │ │ |
|  │  |    | (Cons.   |        |         | Equity  |       | USD      | [Del]  │ │ |
|  │  |    | Growth)  |        |         | Fund X  |       |          | [Audt] │ │ |
|  │  |    |          |        |         |         |       |          | [FA]   │ │ |
|  │  ├────┼──────────┼────────┼─────────┼─────────┼───────┼──────────┼────────┤ │ |
|  │  | [✏️]| PF-002  | REAL01 | -       | Real    | 500   | 2,500,00 | [View] │ │ |
|  │  |    | (Bal.    |        |         | Estate  |       | GBP      | [Del]  │ │ |
|  │  |    | Port.)   |        |         | Hold.   |       |          | [Audt] │ │ |
|  │  |    |          |        |         |         |       |          | [FA]   │ │ |
|  │  ├────┼──────────┼────────┼─────────┼─────────┼───────┼──────────┼────────┤ │ |
|  │  | [✏️]| PF-001  | ADJ001 | -       | Manual  | -100  | -5,000   | [View] │ │ |
|  │  |    | (Cons.   |        |         | Adjust. |       | USD      | [Del]  │ │ |
|  │  |    | Growth)  |        |         |         |       |          | [Audt] │ │ |
|  │  |    |          |        |         |         |       |          | [FA]   │ │ |
|  │  ├────┼──────────┼────────┼─────────┼─────────┼───────┼──────────┼────────┤ │ |
|  │  | ...| ...      | ...    | ...     | ...     | ...   | ...      | ...    │ │ |
|  │  └────┴──────────┴────────┴─────────┴─────────┴───────┴──────────┴────────┘ │ |
|  │                                                                              │ |
|  │  Showing 1-15 of 15 custom holdings                                         │ |
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
|     │ Add New Custom Holding                                      [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  Portfolio *                                                       │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [Select Portfolio...                                    v] │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │  (Dropdown with searchable list: PF-001 - Conservative Growth,    │       |
|     │   PF-002 - Balanced Portfolio, etc.)                              │       |
|     │                                                                     │       |
|     │  Instrument *                                                      │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [Select or search instrument...                         v] │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │  (Dropdown with autocomplete: Type to search by code or name)     │       |
|     │                                                                     │       |
|     │  OR create new custom instrument:                                 │       |
|     │  [ ] Create new custom instrument (for private/unlisted holdings) │       |
|     │                                                                     │       |
|     │  ┌─ If "Create new" is checked: ─────────────────────────────┐    │       |
|     │  │  Instrument Code: [_____________]                         │    │       |
|     │  │  Instrument Name: [_____________]                         │    │       |
|     │  │  Instrument Type: [Select v]  (Private Equity, Real       │    │       |
|     │  │                                Estate, Other)             │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  Quantity *                                                        │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [1000]                                                     │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │  (Can be negative for adjustments/corrections)                     │       |
|     │                                                                     │       |
|     │  Unit Price                                                        │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [150.00]                                                   │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  Total Value (Base Currency) *                                     │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [150000.00]                                                │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │  (Auto-calculated: Quantity × Unit Price)                          │       |
|     │                                                                     │       |
|     │  As-of Date *                                                      │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ [2025-01-31]                                               │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │  (Date picker - defaults to current report date)                  │       |
|     │                                                                     │       |
|     │  Notes                                                             │       |
|     │  ┌────────────────────────────────────────────────────────────┐    │       |
|     │  │ Private equity investment - quarterly valuation            │    │       |
|     │  └────────────────────────────────────────────────────────────┘    │       |
|     │                                                                     │       |
|     │  * Required fields                                                 │       |
|     │                                                                     │       |
|     │  [Cancel]                                            [Save]        │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+

Actions Legend: [Del] = Delete  [Audt] = Audit Trail  [FA] = Full Audit Trail
```

## Screen-Specific Elements

| Element | Type | Description |
|---------|------|-------------|
| Portfolio Filter | Dropdown | Filter holdings by portfolio |
| Portfolio Code | Text | Identifies which portfolio holds this position |
| Instrument Code | Text | Internal instrument identifier |
| ISIN | Text | Usually "-" for custom/private holdings |
| Name | Text | Instrument name |
| Quantity | Number | Number of units held (can be negative for adjustments) |
| Value (Base Currency) | Number | Total value in portfolio's base currency |

## Add/Edit Modal Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Portfolio | Dropdown (searchable) | Yes | Select portfolio for this holding |
| Instrument | Dropdown (autocomplete) | Yes | Select existing instrument or create new |
| Create new custom instrument | Checkbox | No | If checked, shows fields to create a new unlisted instrument |
| Instrument Code (new) | Text Input | Yes (if creating) | Unique code for new instrument |
| Instrument Name (new) | Text Input | Yes (if creating) | Name of new instrument |
| Instrument Type (new) | Dropdown | Yes (if creating) | Private Equity, Real Estate, Other |
| Quantity | Number Input | Yes | Number of units (can be negative) |
| Unit Price | Number Input | No | Price per unit (optional for non-standard holdings) |
| Total Value | Number Input | Yes | Total value (auto-calculated if Qty × Price provided) |
| As-of Date | Date Picker | Yes | Effective date for this holding |
| Notes | Text Area | No | Additional context |

## Use Cases

Custom holdings are used for:

1. **Private Equity:** Unlisted companies, PE funds
2. **Real Estate:** Direct property holdings
3. **Manual Adjustments:** Corrections to imported holdings
4. **Off-market Investments:** Assets not traded on exchanges
5. **Pending Settlements:** Holdings not yet reflected in custodian files
6. **Custom Instruments:** Securities not in standard Bloomberg/custodian feeds

## Validation Rules

- Portfolio Code must exist in Portfolio master data
- Instrument Code must exist in Instrument Static OR be created via "Create new" option
- If creating new instrument, Instrument Code must be unique
- Quantity can be positive or negative (negative for adjustments)
- Total Value must be provided (can be calculated or entered manually)
- As-of Date cannot be in the future
- Duplicate records (same Portfolio + Instrument + As-of Date) are rejected with warning

## Navigation

- **From:**
  - Main Dashboard or Data Maintenance menu
  - Data Confirmation screen (Screen 11) - via "Add Custom Holdings" link
- **To:**
  - Add/Edit Modal (same screen)
  - Audit Trail Modal (same screen)
  - Full Audit Trail Modal (same screen)

## Notes

- No "Upload File" button - custom holdings are manual entry only (by design, to prevent accidental bulk imports)
- Creating a new custom instrument also adds it to Instrument Static master data
- Custom holdings are included in portfolio reporting alongside imported holdings
- Negative quantities are allowed for manual adjustments/corrections
- Total Value is in the portfolio's base currency (converted if needed)
- Full Audit Trail shows all changes to this custom holding record
- Custom holdings are flagged as "Custom" in reports to distinguish from custodian-sourced holdings
