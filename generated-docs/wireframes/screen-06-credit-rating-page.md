# Screen: Credit Rating Page

## Purpose

CRUD screen for managing credit ratings with special "Retry Decision Flow" feature and comprehensive audit trail.

## Pattern

This screen follows the **CRUD Template Pattern** (see `_crud-template.md`) with the following customizations:

- **Special Feature:** "Retry Decision Flow" button to re-run credit rating decision logic
- **Additional Action:** "Full Audit Trail" link for comprehensive history view
- **Upload File:** Supports bulk upload of credit ratings via CSV

## Wireframe

```
+-----------------------------------------------------------------------------------+
|  InvestInsight                                    [User: Admin v]  [Logout]       |
+-----------------------------------------------------------------------------------+
|  [← Dashboard]  Data Maintenance > Credit Ratings                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  Credit Rating Management                                                        |
|  ─────────────────────────────────────────────────────────────────────────────── |
|                                                                                   |
|  [Add New Rating]  [Upload File]  [Export to CSV]  [Retry Decision Flow]        |
|                                                                                   |
|  [Search by Instrument Code or ISIN...]     [Filter by Rating Agency v]         |
|                                                                                   |
|  ┌─────────────────────────────────────────────────────────────────────────────┐ |
|  │ Credit Ratings Grid                                                          │ |
|  │                                                                              │ |
|  │  ┌──────┬────────────┬──────────┬────────────┬────────┬─────────────────┐   │ |
|  │  | Edit | Instrument | ISIN     | Rating     | Agency | Effective | Act  |   │ |
|  │  |      | Code       |          |            |        | Date      | ions |   │ |
|  │  ├──────┼────────────┼──────────┼────────────┼────────┼───────────┼──────┤   │ |
|  │  | [✏️] | ABC001     | US123456 | AAA        | S&P    | 2024-12   | [V]  |   │ |
|  │  |      |            | 7890     |            |        |           | [D]  |   │ |
|  │  |      |            |          |            |        |           | [A]  |   │ |
|  │  |      |            |          |            |        |           | [FA] |   │ |
|  │  ├──────┼────────────┼──────────┼────────────┼────────┼───────────┼──────┤   │ |
|  │  | [✏️] | ABC001     | US123456 | Aa1        | Moody's| 2024-12   | [V]  |   │ |
|  │  |      |            | 7890     |            |        |           | [D]  |   │ |
|  │  |      |            |          |            |        |           | [A]  |   │ |
|  │  |      |            |          |            |        |           | [FA] |   │ |
|  │  ├──────┼────────────┼──────────┼────────────┼────────┼───────────┼──────┤   │ |
|  │  | [✏️] | DEF002     | GB098765 | BB+        | Fitch  | 2025-01   | [V]  |   │ |
|  │  |      |            | 4321     |            |        |           | [D]  |   │ |
|  │  |      |            |          |            |        |           | [A]  |   │ |
|  │  |      |            |          |            |        |           | [FA] |   │ |
|  │  ├──────┼────────────┼──────────┼────────────┼────────┼───────────┼──────┤   │ |
|  │  | ...  | ...        | ...      | ...        | ...    | ...       | ...  |   │ |
|  │  └──────┴────────────┴──────────┴────────────┴────────┴───────────┴──────┘   │ |
|  │                                                                              │ |
|  │  Showing 1-50 of 523 ratings        [< Prev]  [1][2][3]...[11]  [Next >]   │ |
|  │                                                                              │ |
|  └──────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  © 2025 InvestInsight | Help | Documentation                                     |
+-----------------------------------------------------------------------------------+

Actions Legend: [V] = View  [D] = Delete  [A] = Audit Trail  [FA] = Full Audit Trail
```

## Screen-Specific Elements

| Element | Type | Description |
|---------|------|-------------|
| Retry Decision Flow | Button | Re-runs credit rating decision logic for all instruments |
| Full Audit Trail | Link | Opens comprehensive audit view including decision flow history |
| Rating Agency Filter | Dropdown | Filter by S&P, Moody's, Fitch, or All |
| Instrument Code | Text | Internal instrument identifier |
| ISIN | Text | International Securities Identification Number |
| Rating | Text | Credit rating (AAA, AA+, BB-, etc.) |
| Agency | Text | Rating agency (S&P, Moody's, Fitch) |
| Effective Date | Date | When this rating became effective |

## Unique Features

### Retry Decision Flow Button

When clicked:
1. Shows confirmation modal: "This will re-run the credit rating decision flow for all instruments. Continue?"
2. If confirmed, triggers background job
3. Shows progress toast: "Decision flow started - this may take several minutes"
4. On completion, shows result toast: "Decision flow complete: X ratings updated, Y unchanged"
5. Grid refreshes to show updated ratings

**Use case:** When credit rating rules change or Bloomberg data is updated, re-run the decision logic without manual re-import.

### Full Audit Trail

Regular "Audit Trail" button shows changes to a specific rating record.

"Full Audit Trail" link shows:
- All changes to this instrument's ratings across all agencies
- Decision flow execution history (when auto-rating was applied)
- Manual override history
- Source data changes (Bloomberg imports)

Opens in a larger modal with tabbed views:
- **Changes Tab:** Standard audit trail
- **Decision Flow Tab:** History of automated rating assignments
- **Overrides Tab:** Manual changes that overrode automated ratings

## Add/Edit Modal Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Instrument Code | Dropdown | Yes | Select from instrument master data |
| ISIN | Text (auto-populated) | - | Auto-filled based on selected Instrument Code |
| Rating Agency | Dropdown | Yes | S&P, Moody's, Fitch |
| Credit Rating | Dropdown | Yes | Rating scale specific to selected agency |
| Effective Date | Date Picker | Yes | When this rating takes effect |
| Source | Dropdown | No | Manual, Bloomberg, Other |
| Notes | Text Area | No | Additional context (e.g., "Downgrade due to...") |

## Upload File Format

CSV columns:
- InstrumentCode (required)
- RatingAgency (required) - S&P, Moody's, or Fitch
- CreditRating (required) - must match agency's rating scale
- EffectiveDate (required) - YYYY-MM-DD format
- Source (optional) - defaults to "Manual"
- Notes (optional)

## Validation Rules

- Instrument Code must exist in Instrument Static master data
- Each instrument can have one rating per agency per effective date
- Credit Rating must be valid for the selected Rating Agency (e.g., S&P uses AAA, AA+, etc.; Moody's uses Aaa, Aa1, etc.)
- Effective Date cannot be in the future
- Duplicate records (same Instrument + Agency + Effective Date) are rejected

## Navigation

- **From:**
  - Main Dashboard or Data Maintenance menu
  - Data Confirmation screen (Screen 11) - via "Update Credit Ratings" link
- **To:**
  - Add/Edit Modal (same screen)
  - Audit Trail Modal (same screen)
  - Full Audit Trail Modal (same screen)
  - File Import Popup (Screen 3) - via "Upload File"

## Notes

- One instrument can have multiple ratings (one per agency)
- Historical ratings are preserved when new ratings are added (not overwritten)
- "Retry Decision Flow" is typically used monthly after Bloomberg data import
- Decision flow applies rule-based logic to assign ratings automatically (e.g., "If Bloomberg rating is AAA, assign AAA")
- Manual ratings can override automated ratings - these are tracked separately in Full Audit Trail
