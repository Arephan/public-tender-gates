# Public tender gates

363 public-sector tenders were screened one at a time between 21 August and 12 September 2026.
Timestamps are UTC, so the newest rows carry a date ahead of local time in North America. Each
row records the clause that ruled out a supplier holding no client references, no ISO or SOC 2
certificate and no framework seat.

`data/screened-tenders.csv` — one row per tender.

| column | meaning |
|---|---|
| `screened_on` | UTC date the document pack was read |
| `board` | where the notice was published |
| `buyer` | contracting authority |
| `reference` | the buyer's own tender reference, where the notice carried one |
| `title` | notice title, where recorded |
| `closes` | stated deadline |
| `value_raw` | stated value, as the notice wrote it |
| `currency` | GBP, EUR, CAD, USD, NZD, or `unstated` where a figure was recorded without one |
| `gate_class` | heuristic label, assigned by regex over `exclusion_clause` |
| `exclusion_clause` | the reason written at screening time, verbatim |

`gate_class` is wrong in places. `exclusion_clause` is the record. Values are not converted and
several rows carry a figure whose currency the notice never stated, so `value_raw` is a display
field rather than a comparable one.

## Breakdown

201 of the 363 were not software work: goods purchases, telecom and connectivity leases,
construction, studies, recruitment, physical security.

The remaining 162 were software. Their clauses fall out as:

| gate_class | n |
|---|---|
| unclassified | 46 |
| closed_vehicle | 36 |
| references | 34 |
| cots_product | 19 |
| certification | 8 |
| body_shop | 6 |
| set_aside | 5 |
| insurance | 3 |
| portal_or_fee | 3 |
| incumbent_or_awarded | 1 |
| financial_standing | 1 |

`closed_vehicle` means the buyer accepts bids only from suppliers already holding a standing
offer, supply arrangement or framework seat. TBIPS and SBIPS account for most of the Canadian
federal cases. `references` means two or three delivered contracts of comparable size, each
with a named client contact, filed with the bid.

Both requirements are circular for a new supplier. The reference cannot be obtained without
first winning public work, and the framework seat is itself awarded on the same evidence.

## Boards covered

CanadaBuys, Alberta Purchasing Connection, bids&tenders, MERX, SaskTenders, BC Bid, UK
Contracts Finder, UK Find a Tender, YORtender, Public Contracts Scotland, NZ GETS, TED,
etenders.gov.ie, Ariba Discovery.

Coverage is uneven. CanadaBuys contributes 116 rows and Alberta Purchasing Connection 140,
both from bulk sweeps. The European and Pacific boards were read notice by notice and
contribute single digits each. A board with few rows here was swept less.

## Method

Each notice was filtered for software scope. Its document pack was then opened and read for
pass/fail selection criteria, and the tender was recorded as killed when a criterion could not
be met on the day of submission. Scored criteria were treated as gates only where the stated
minimum was out of reach; those rows say so in `exclusion_clause`.

Screening was done by a Canadian sole trader with shipped consumer software and no
public-sector delivery history. A supplier with a different profile will re-judge many of these
rows, which is why the clause text is included.

## Licence

CC0.
