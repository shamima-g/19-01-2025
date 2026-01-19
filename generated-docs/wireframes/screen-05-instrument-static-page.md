# Screen: Instrument Static Page

## Purpose

View and manage instrument master data with ability to toggle between summary and detailed column views. Export ISINs and upload bulk updates.

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Data Maintenance > Instrument Static                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Instrument Static Data                                                          |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Export ISINs (.csv)]  [Upload File]  [Add New Instrument]                     |
|                                                                                   |
|  View Mode:  ( ) Summary View    (•) All Columns                                |
|                                                                                   |
|  [Search Instrument Code or ISIN...]                        [Filter by Type v]  |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Instrument Static Grid                                                       │ |
|  │                                                                              │ |
|  │  ┌──────┬─────────┬────────┬──────────┬────────┬────────┬──────┬─────────┐  │ |
|  │  | Edit | Instrum | ISIN   | Name     | Type   | Curren | Stat | Actions |  │ |
|  │  |      | entCode |        |          |        | cy     | us   |         |  │ |
|  │  ├──────┼─────────┼────────┼──────────┼────────┼────────┼──────┼─────────┤  │ |
|  │  | [✏️] | ABC001  | US1234 | Apple    | Equity | USD    | ✓Act | [View]  |  │ |
|  │  |      |         | 567890 | Inc.     |        |        | ive  | [Audit] |  │ |
|  │  ├──────┼─────────┼────────┼──────────┼────────┼────────┼──────┼─────────┤  │ |
|  │  | [✏️] | DEF002  | GB0987 | BP PLC   | Equity | GBP    | ✓Act | [View]  |  │ |
|  │  |      |         | 654321 |          |        |        | ive  | [Audit] |  │ |
|  │  ├──────┼─────────┼────────┼──────────┼────────┼────────┼──────┼─────────┤  │ |
|  │  | [✏️] | GHI003  | -      | Custom   | Bond   | EUR    | ⚠️Mis| [View]  |  │ |
|  │  |      |         |        | Bond     |        |        | sing | [Audit] |  │ |
|  │  |      |         |        |          |        |        | Data | [Fix]   |  │ |
|  │  ├──────┼─────────┼────────┼──────────┼────────┼────────┼──────┼─────────┤  │ |
|  │  | [✏️] | JKL004  | US5555 | Tesla    | Equity | USD    | ✓Act | [View]  |  │ |
|  │  |      |         | 123456 | Inc.     |        |        | ive  | [Audit] |  │ |
|  │  ├──────┼─────────┼────────┼──────────┼────────┼────────┼──────┼─────────┤  │ |
|  │  | ...  | ...     | ...    | ...      | ...    | ...    | ...  | ...     |  │ |
|  │  └──────┴─────────┴────────┴──────────┴────────┴────────┴──────┴─────────┘  │ |
|  │                                                                              │ |
|  │  Showing 1-50 of 1,247 instruments   [< Prev]  [1][2][3]...[25]  [Next >]  │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
|  ┌─ Collapsible Column Groups ──────────────────────────────────────────────┐   |
|  │                                                                            │   |
|  │  [▼] Pricing Data   [▼] Risk Metrics   [▶] Classification   [▶] Dates    │   |
|  │                                                                            │   |
|  │  (When expanded, additional columns appear in the grid above)             │   |
|  │                                                                            │   |
|  └────────────────────────────────────────────────────────────────────────────┘   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

EXPANDED "ALL COLUMNS" VIEW:

+-----------------------------------------------------------------------------------+
|  (When "All Columns" is selected, grid shows all available columns)             |
|                                                                                   |
|  ┌────────────────────────────────────────────────────────────────────────────┐  |
|  │ [✏️] | ABC001 | US1234567890 | Apple Inc. | Equity | AAPL | NASDAQ | USD |  │  |
|  │      | Active | Technology | US | 100 | AAA | 4.5 | 0.8 | 2020-01-15 | ... │  │  |
|  │                                                                             │  |
|  │ (Grid becomes horizontally scrollable with 20+ columns visible)            │  |
|  └─────────────────────────────────────────────────────────────────────────────┘  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Export ISINs | Button | Download CSV of all InstrumentCode + ISIN mappings |
| Upload File | Button | Opens File Import Popup for bulk instrument data upload |
| Add New Instrument | Button | Opens instrument creation form (modal or new page) |
| View Mode Radio | Radio Buttons | Toggle between Summary View (8 columns) and All Columns (20+ columns) |
| Search Input | Text Input | Filter instruments by InstrumentCode or ISIN |
| Filter by Type | Dropdown | Filter by instrument type (Equity, Bond, Fund, etc.) |
| Edit Icon | Button | Opens inline edit mode for that row |
| InstrumentCode | Text | Unique internal identifier |
| ISIN | Text | International Securities Identification Number |
| Name | Text | Instrument name |
| Type | Text | Equity, Bond, Fund, etc. |
| Currency | Text | Base currency code (USD, EUR, GBP, etc.) |
| Status | Badge | ✓ Active, ⚠️ Missing Data, ❌ Inactive |
| View Button | Button | Opens read-only detail view modal |
| Audit Button | Button | Opens audit trail popup showing change history |
| Fix Button | Button | Opens form to complete missing required fields |
| Column Groups | Collapsible Sections | Expand/collapse groups of related columns |

## User Actions

- **Export ISINs**: Click "Export ISINs" → downloads CSV with InstrumentCode and ISIN columns
- **Upload bulk data**: Click "Upload File" → opens File Import Popup (Screen 3) for CSV/Excel upload
- **Add new instrument**: Click "Add New Instrument" → opens creation form
- **Switch view mode**: Click radio button → toggles between summary and all columns
- **Search instruments**: Type in search box → filters grid in real-time
- **Filter by type**: Select from dropdown → shows only instruments of that type
- **Edit instrument**: Click [✏️] → row becomes editable with Save/Cancel buttons
- **View details**: Click "View" → opens read-only modal with all instrument details
- **View audit trail**: Click "Audit" → opens modal showing change history (who, when, what)
- **Fix missing data**: Click "Fix" → opens form pre-populated with existing data, highlighting missing fields
- **Expand column group**: Click [▼] → shows/hides additional columns in that category
- **Navigate pages**: Click pagination controls → loads next/previous 50 instruments

## Column Groups (for "All Columns" mode)

| Group | Columns |
|-------|---------|
| **Core** (always visible) | InstrumentCode, ISIN, Name, Type, Currency, Status |
| **Pricing Data** | Last Price, Price Date, Price Source, Price Currency |
| **Risk Metrics** | Duration, YTM, Beta, Credit Rating |
| **Classification** | Sector, Industry, Region, Asset Class |
| **Dates** | Issue Date, Maturity Date, First Settlement Date, Last Updated |

## Status Values

| Status | Icon | Meaning |
|--------|------|---------|
| Active | ✓ | Instrument is complete and ready for use |
| Missing Data | ⚠️ | Required fields are empty (ISIN, sector, etc.) |
| Inactive | ❌ | Instrument has been deactivated/delisted |

## Navigation

- **From:**
  - Main Dashboard or Data Maintenance menu
  - Data Confirmation screen (Screen 11) - via "Fix missing instruments" link
- **To:**
  - Add/Edit Instrument Form (modal or separate page)
  - Audit Trail Modal
  - File Import Popup (Screen 3) - via "Upload File"

## Upload File Behavior

When "Upload File" is clicked:
1. Opens File Import Popup (Screen 3)
2. User uploads CSV/Excel with instrument data
3. Validation checks for:
   - Required fields (InstrumentCode, Name, Type, Currency)
   - ISIN format validation (if provided)
   - Duplicate InstrumentCode
4. Import creates new instruments and updates existing ones (based on InstrumentCode match)
5. Success toast: "X instruments imported, Y updated"

## Export ISINs Behavior

When "Export ISINs" is clicked:
1. Downloads CSV with 2 columns: InstrumentCode, ISIN
2. Includes all instruments in current filter/search (not just current page)
3. Filename: `instrument_isins_YYYY-MM-DD.csv`
4. Can be edited in Excel and re-uploaded via "Upload File"

## Notes

- "Summary View" is the default - shows most commonly needed columns
- "All Columns" mode makes grid horizontally scrollable
- Missing ISIN triggers "Missing Data" status only if instrument type requires ISIN
- Audit trail shows: Date, User, Field Changed, Old Value, New Value
- Grid supports column sorting (click header to sort)
- Grid supports column resizing (drag column dividers)
- Inline editing saves immediately when row loses focus or user clicks Save
