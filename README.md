# Public tender gates

363 public-sector tenders, screened one at a time between 21 August and 12 September 2026,
with the clause that ruled out a supplier who has no client references, no ISO or SOC 2
certificate, no framework seat and no staff besides the owner.

`data/screened-tenders.csv` — one row per tender.

| column | meaning |
|---|---|
| `screened_on` | date the document pack was read |
| `board` | where the notice was published |
| `buyer` | contracting authority |
| `reference` | the buyer's own tender reference, where the notice carried one |
| `title` | notice title, where recorded |
| `closes` | stated deadline |
| `value` | stated value, in the currency the notice used |
| `gate_class` | heuristic label, assigned by regex over `exclusion_clause` |
| `exclusion_clause` | the reason written at screening time, verbatim |

`gate_class` is a convenience column and it is wrong in places. `exclusion_clause` is the
record; re-judge from that.

## What the 363 break down into

201 were not software work at all: goods purchases, telecom and connectivity leases,
construction, studies, recruitment, physical security. That is the larger half of a
software-filtered board sweep.

The remaining 162 were software, and these are the clauses that closed them:

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

The two largest named classes are circular. `closed_vehicle` means the buyer will only accept
bids from suppliers already holding a standing offer, supply arrangement or framework seat —
TBIPS and SBIPS account for most of the Canadian federal cases. `references` means two or
three delivered contracts of comparable size, each with a named client contact, filed with the
bid. Neither can be obtained without first winning public work of the kind the clause excludes
you from bidding on.

## Boards covered

CanadaBuys, Alberta Purchasing Connection, bids&tenders, MERX, SaskTenders, BC Bid, UK
Contracts Finder, UK Find a Tender, YORtender, Public Contracts Scotland, NZ GETS, TED,
etenders.gov.ie, and Ariba Discovery.

Coverage is uneven. CanadaBuys (116 rows) and APC (140) were swept in bulk; the European and
Pacific boards were read notice by notice and contribute single digits each. This is a working
log, not a census: a board with few rows here was swept less, not necessarily cleaner.

## Method

Each notice was filtered for software scope, then its document pack was opened and read for
pass/fail selection criteria. A tender was recorded as killed when a criterion could not be met
on the day of submission. Criteria that are scored rather than pass/fail were treated as gates
where the stated minimum could not be reached — those rows say so in `exclusion_clause`.

Screening is by a Canadian sole trader with shipped consumer software and no public-sector
delivery history. A supplier with a different profile will re-judge many of these rows
differently, which is why the clause text is here.

## Licence

CC0. Use it, correct it, argue with it.
