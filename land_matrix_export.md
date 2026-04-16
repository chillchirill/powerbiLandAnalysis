# Land Matrix Data Export

## About Land Matrix
The Land Matrix is an independent land monitoring initiative that promotes transparency and accountability in decisions over large-scale land acquisitions (LSLAs) in low- and middle-income countries (World Bank classification 2010). It records and shares data about these land deals.

## What is a land deal?
See: https://landmatrix.org/list/deals/

---

## Data Export Information

- **Format:** XLSX or CSV (zip)
- **Date:** [YYYY-MM-DD]
- **Time:** [HH:MM:SS] UTC

### Download Source
https://landmatrix.org/list/deals/

> ⚠️ The exported data depends on the filters selected before download.

### Export URL
https://landmatrix.org/api/legacy_export/?subset=PUBLIC&negotiation_status=ORAL_AGREEMENT&negotiation_status=CONTRACT_SIGNED&negotiation_status=CHANGE_OF_OWNERSHIP&format=csv

---

## ⚠️ Important Notes

- Only part of the dataset is systematically collected.
- Focus areas:
  - Transnational land acquisitions (foreign investors)
  - Agriculture and forestry
- Since 2024:
  - Added focus on **green deals**:
    - Wind farms
    - Solar parks
    - Carbon offsetting projects
- ⚠️ Green deals dataset is **not complete yet**.
- Data completeness varies by country due to transparency issues.

---

## License

- **License:** Creative Commons Attribution International (CC BY 4.0)

### Citation Format
```
Land Matrix [year]. Data downloaded from [URL] on [date].
```

---

## Dataset Structure (Tabs / Files)

### 1. Variable descriptions
- Contains:
  - Variable definitions
  - Data types
  - Formats

---

### 2. Deals
- One row = one land deal
- Core dataset with most variables

#### Relationships:
- Linked to investors via:
  - `Operating company: Investor ID` (column BI)
  - `Operating company: Name` (column BJ)
  - `Top parent companies` (column K)

#### Notes:
- One deal → one operating company
- One deal → multiple parent companies possible
- If no parent company:
  - Operating company = top parent company
- Full investor network → see **Involvements**

---

### 3. Locations
- One row = one location
- One deal → multiple locations
- Linked via:
  - `Deal ID`

---

### 4. Contracts
- One row = one contract
- One deal → multiple contracts
- Linked via:
  - `Deal ID`

---

### 5. Data sources
- One row = one source
- One deal → multiple sources
- Linked via:
  - `Deal ID`

---

### 6. Involvements
- One row = one relationship
- Represents:
  - Investor → investor ownership (parent-child)

---

### 7. Investors
- One row = one investor
- Contains all investor entities in the database

---
