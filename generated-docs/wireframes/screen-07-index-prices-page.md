# Screen: Index Prices Page

## Purpose

CRUD screen for maintaining index pricing data with upload capability and price history view.

## Pattern

This screen follows the **CRUD Template Pattern** (see `_crud-template.md`) with the following customizations:

- **Additional Feature:** "Price History" popup for quick historical view
- **Upload File:** Supports bulk upload of index prices via CSV
- **History View:** Can be popup or separate page showing price trends

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Data Maintenance > Index Prices                                  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Index Prices Management                                                         |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Add New Index Price]  [Upload File]  [Export to CSV]  [View Full History]     |
|                                                                                   |
|  [Search by Index Code or Name...]              [Filter by Date Range v]        |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Index Prices Grid                                                            │ |
|  │                                                                              │ |
|  │  ┌──────┬────────────┬──────────────┬──────────┬────────┬────────────────┐  │ |
|  │  | Edit | Index Code | Index Name   | Price    | Price  | Actions        |  │ |
|  │  |      |            |              |          | Date   |                |  │ |
|  │  ├──────┼────────────┼──────────────┼──────────┼────────┼────────────────┤  │ |
|  │  | [✏️] | SP500      | S&P 500      | 4,783.45 | Jan 31 | [View]         |  │ |
|  │  |      |            |              |          | 2025   | [Delete]       |  │ |
|  │  |      |            |              |          |        | [Audit]        |  │ |
|  │  |      |            |              |          |        | [Price Hist.] |  │ |
|  │  ├──────┼────────────┼──────────────┼──────────┼────────┼────────────────┤  │ |
|  │  | [✏️] | FTSE100    | FTSE 100     | 7,952.62 | Jan 31 | [View]         |  │ |
|  │  |      |            |              |          | 2025   | [Delete]       |  │ |
|  │  |      |            |              |          |        | [Audit]        |  │ |
|  │  |      |            |              |          |        | [Price Hist.] |  │ |
|  │  ├──────┼────────────┼──────────────┼──────────┼────────┼────────────────┤  │ |
|  │  | [✏️] | DAX        | DAX Index    | 17,234.89| Jan 31 | [View]         |  │ |
|  │  |      |            |              |          | 2025   | [Delete]       |  │ |
|  │  |      |            |              |          |        | [Audit]        |  │ |
|  │  |      |            |              |          |        | [Price Hist.] |  │ |
|  │  ├──────┼────────────┼──────────────┼──────────┼────────┼────────────────┤  │ |
|  │  | ...  | ...        | ...          | ...      | ...    | ...            |  │ |
|  │  └──────┴────────────┴──────────────┴──────────┴────────┴────────────────┘  │ |
|  │                                                                              │ |
|  │  Showing 1-50 of 87 index prices     [< Prev]  [1][2]  [Next >]            │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

PRICE HISTORY POPUP:

+-----------------------------------------------------------------------------------+
|                                                                                   |
|     ┌────────────────────────────────────────────────────────────────────┐       |
|     │ Price History: S&P 500 (SP500)                              [X]    │       |
|     ├────────────────────────────────────────────────────────────────────┤       |
|     │                                                                     │       |
|     │  Date Range: [Last 12 Months v]       [Export History to CSV]     │       |
|     │                                                                     │       |
|     │  ┌──────────────────────────────────────────────────────────────┐  │       |
|     │  | Date       | Price     | Change   | % Change | Updated By   |  │       |
|     │  ├────────────┼───────────┼──────────┼──────────┼──────────────┤  │       |
|     │  | Jan 31     | 4,783.45  | +45.23   | +0.95%   | Auto Import  |  │       |
|     │  | 2025       |           |          |          |              |  │       |
|     │  ├────────────┼───────────┼──────────┼──────────┼──────────────┤  │       |
|     │  | Dec 31     | 4,738.22  | -12.50   | -0.26%   | Auto Import  |  │       |
|     │  | 2024       |           |          |          |              |  │       |
|     │  ├────────────┼───────────┼──────────┼──────────┼──────────────┤  │       |
|     │  | Nov 30     | 4,750.72  | +88.15   | +1.89%   | John Doe     |  │       |
|     │  | 2024       |           |          |          | (Manual)     |  │       |
|     │  ├────────────┼───────────┼──────────┼──────────┼──────────────┤  │       |
|     │  | ...        | ...       | ...      | ...      | ...          |  │       |
|     │  └────────────┴───────────┴──────────┴──────────┴──────────────┘  │       |
|     │                                                                     │       |
|     │  (Optional: Line chart showing price trend over time)              │       |
|     │                                                                     │       |
|     │                                                       [Close]       │       |
|     │                                                                     │       |
|     └────────────────────────────────────────────────────────────────────┘       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

## Screen-Specific Elements

| Element | Type | Description |
|---------|------|-------------|
| View Full History | Button | Opens full history page showing all index price trends |
| Date Range Filter | Dropdown | Filter by This Month, Last 3 Months, Last 12 Months, Custom Range |
| Index Code | Text | Unique identifier for the index (SP500, FTSE100, etc.) |
| Index Name | Text | Full name of the index |
| Price | Number | Current price value (formatted with comma separators) |
| Price Date | Date | Date for this price (typically month-end) |
| Price History Button | Button | Opens Price History popup for this index |

## Add/Edit Modal Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Index Code | Text Input | Yes | Unique identifier (e.g., SP500, FTSE100) |
| Index Name | Text Input | Yes | Full name (e.g., "S&P 500 Index") |
| Price | Number Input | Yes | Price value (positive number, max 2 decimals) |
| Price Date | Date Picker | Yes | Date for this price (typically month-end) |
| Currency | Dropdown | Yes | Price currency (USD, GBP, EUR, etc.) |
| Source | Dropdown | No | Manual, Bloomberg, Reuters, Other |
| Notes | Text Area | No | Additional context |

## Upload File Format

CSV columns:
- IndexCode (required) - must match existing index or be new
- IndexName (required) - used for new indexes only
- Price (required) - numeric value
- PriceDate (required) - YYYY-MM-DD format
- Currency (required) - USD, GBP, EUR, etc.
- Source (optional) - defaults to "Manual"
- Notes (optional)

## Price History Popup

Shows historical prices for a specific index:
- **Date Range Selector:** Last Month, Last 3 Months, Last 12 Months, All Time, Custom
- **Price Grid:** Date, Price, Change from previous, % Change, Updated By
- **Optional Chart:** Line chart showing price trend
- **Export Button:** Download history as CSV

## Validation Rules

- Index Code must be unique (for new entries)
- Price must be a positive number
- Price Date cannot be in the future
- Duplicate records (same Index Code + Price Date) are rejected
- Currency must be a valid ISO currency code

## Navigation

- **From:**
  - Main Dashboard or Data Maintenance menu
  - Data Confirmation screen (Screen 11) - via "Update Index Prices" link
- **To:**
  - Add/Edit Modal (same screen)
  - Audit Trail Modal (same screen)
  - Price History Popup (same screen)
  - Full History Page (separate page with charts and analytics)
  - File Import Popup (Screen 3) - via "Upload File"

## Notes

- Index prices are typically updated monthly (month-end)
- Prices can be imported from Bloomberg files or entered manually
- Price History popup is for quick reference; Full History page provides detailed analytics
- Change and % Change are calculated automatically based on previous price
- Historical prices are never deleted, only new prices are added
- Latest price per index is used for benchmark calculations
