# Land Matrix CSV Assessment For Power BI

## Source files

All CSV files use:

- delimiter: `;`
- encoding: `UTF-8` / `UTF-8 with BOM`
- quoted text fields with embedded line breaks

This means Power BI import must use CSV parsing with `Delimiter=";"` and standard CSV quote handling. Do not split rows by newline before parsing.

## File inventory

| File | Rows | Columns | Main key | Notes |
|---|---:|---:|---|---|
| `deals.csv` | 6,631 | 147 | `Deal ID` | Main table, one row per deal |
| `investors.csv` | 12,128 | 8 | `Investor ID` | Investor dimension |
| `involvements.csv` | 7,776 | 12 | `Involvement ID` | Investor-to-investor ownership / financing links |
| `contracts.csv` | 3,184 | 7 | `ID` is not globally unique | Use composite key `ID + Deal ID` |
| `datasources.csv` | 43,552 | 13 | `ID` is not globally unique | Use composite key `ID + Deal ID` |
| `locations.csv` | 10,588 | 8 | `ID` is not globally unique | Use composite key `ID + Deal ID` |

## Relationships

Confirmed foreign keys:

- `contracts[Deal ID]` -> `deals[Deal ID]`
- `datasources[Deal ID]` -> `deals[Deal ID]`
- `locations[Deal ID]` -> `deals[Deal ID]`
- `deals[Operating company: Investor ID]` -> `investors[Investor ID]`
- `involvements[Investor ID Downstream]` -> `investors[Investor ID]`
- `involvements[Investor ID Upstream]` -> `investors[Investor ID]`

Relationship shape:

- one `deal` -> many `contracts`
- one `deal` -> many `datasources`
- one `deal` -> many `locations`
- one `investor` -> many downstream/upstream `involvements`
- one `deal` -> one operating company investor
- one `deal` -> many parent companies, but this is encoded inside `deals.csv`

Observed child-table density:

- contracts: 2,482 deals have contracts, average `1.28` contracts per deal, max `29`
- datasources: all 6,631 deals have sources, average `6.57` sources per deal, max `59`
- locations: all 6,631 deals have locations, average `1.60` locations per deal, max `49`

## What Is Simple To Import

These tables are already close to relational form:

- `investors.csv`
- `involvements.csv`
- `contracts.csv`
- `datasources.csv`
- `locations.csv`

Recommended cleaning only:

- add surrogate key or composite key for `contracts`, `datasources`, `locations`
- cast dates
- split coordinates
- trim empty strings to null

## Main Complexity: `deals.csv`

`deals.csv` is the central table, but several columns are not plain scalar values. Many fields encode history or multiple values using:

- `#` as an internal segment separator
- `|` as a multi-record separator

Typical encoded patterns found:

- `Negotiation status`: `2005-04-26#current#Заключенная (подписан договор)`
- `Implementation status`: `2008-01-24##Начальная стадия...|2015#current#Брошенный проект`
- `Size under contract`: `2005-04-26#current#9380.0`
- `Size in operation`: `2010##1340|2011#current#3000`
- `Top parent companies`: `Company Name#2538#Cambodia`
- `Intention of investment`: `2005-04-26#current#9380#Скот, Промышленность`

This means `deals.csv` is partly denormalized and contains embedded child entities and timelines.

## Columns That Need Special Handling

### History / timeline fields in `deals.csv`

These should not stay as plain text if the goal is analysis in Power BI:

- `Negotiation status`
- `Implementation status`
- `Size under contract (leased or purchased area, in ha)`
- `Size in operation (production, in ha)`
- `Intention of investment`
- `Current total number of jobs/employees/ daily/seasonal workers`
- `Current domestic number of jobs/employees/ daily/seasonal workers`
- `Current foreign number of jobs/employees/ daily/seasonal workers`
- `Crops area/yield/export`
- `Livestock area/yield/export`
- `Mineral resources area/yield/export`
- `Electricity generation`
- `Carbon sequestration/offsetting`

### Multi-value categorical fields in `deals.csv`

These often use `|` and should be split to bridge tables if filtering is needed:

- `Nature of the deal`
- `Negative impacts for local communities`
- `Promised benefits for local communities`
- `Materialized benefits for local communities`
- `Former land owner`
- `Former land use`
- `Former land cover`
- `Source of water extraction`
- `Recognition status of community land tenure`

### Encoded relationship fields in `deals.csv`

These represent separate entities and are better normalized:

- `Top parent companies`
- `Name of community`
- `Name of indigenous people`

## Type Notes

### Dates / datetimes

Good candidates for direct type conversion:

- `contracts[Contract date]`
- `involvements[Loan date]`
- many `datasources[Date]` values
- `deals[Fully updated]`
- `deals[Created at]`

Warning:

- `datasources[Date]` is not fully standardized. Example formats include `2012-09-24` and `2012-9-24`.
- some date-like fields in `deals.csv` are embedded inside encoded text and must be parsed first.

### Coordinates

`locations[Point]` stores `latitude,longitude` in one text field.

Recommended split:

- `Latitude`
- `Longitude`

Both should be converted to decimal numbers.

### Yes / No / Unknown flags

Many `deals.csv` columns are tri-state categorical values, not true booleans:

- `Carbon offset project`
- `Contract farming`
- `Jobs created (total)`
- `Has domestic use`
- `Has export`
- `In country processing of produce`
- `Water extraction envisaged`
- `Use of irrigation infrastructure`

Recommended type in Power BI:

- text dimension or nullable logical with an explicit `Unknown` mapping table

## Recommended Power BI Model

### Keep as base tables

- `Deals`
- `Investors`
- `Involvements`
- `Contracts`
- `DataSources`
- `Locations`

### Add derived tables from `deals.csv`

Recommended next normalization targets:

- `DealParentCompanies`
- `DealNegotiationStatusHistory`
- `DealImplementationStatusHistory`
- `DealSizeUnderContractHistory`
- `DealSizeInOperationHistory`
- `DealIntentions`
- `DealCommunities`
- `DealIndigenousPeoples`

### Suggested star-model direction

- central analytical table: `Deals`
- dimension: `Investors`
- fact/child tables: `Contracts`, `DataSources`, `Locations`
- bridge/network table: `Involvements`
- optional bridge/history tables extracted from encoded `deals` columns

## Concrete Import Rules

1. Load each CSV first into a raw staging query.
2. Force delimiter `;` and UTF-8 parsing.
3. Preserve quoted multiline text exactly as source.
4. Trim strings and convert empty strings to null.
5. For `contracts`, `datasources`, `locations`, create a key like `ID & "-" & Deal ID`.
6. Convert obvious numeric columns only after import.
7. Split `locations[Point]` into latitude/longitude.
8. Keep raw encoded fields in `deals.csv`, but create parsed helper tables from them instead of destroying original columns.
9. Do not rely on child-table `ID` alone as a unique key.
10. Treat `Yes/No/Unknown` fields as dimensions, not strict booleans.

## Practical Conclusion

The dataset is already suitable for Power BI if imported in two layers:

- Layer 1: raw relational tables as-is
- Layer 2: parsed helper tables derived from encoded columns in `deals.csv`

The biggest risk is not CSV size. The real risk is incorrectly treating encoded `deals.csv` text fields as simple scalar columns.

## Best Next Step

Create Power Query transformations that:

- load all 6 base tables
- generate safe keys for child tables
- split coordinates
- parse the first 4 most valuable encoded structures from `deals.csv`:
  - parent companies
  - negotiation status history
  - implementation status history
  - deal intentions

That will be enough to build a clean first Power BI model without over-processing the entire export.
