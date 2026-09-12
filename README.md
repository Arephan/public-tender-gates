# Public tender gates

Screening log: public-sector tenders read for pass/fail selection criteria, with the clause
that closed each one. 363 rows, 2026-08-21 to 2026-09-12 (UTC).

Screened by a Canadian sole trader, shipped consumer software, no public-sector delivery
history. That profile is what the gates are measured against.

## data/screened-tenders.csv

| column | |
|---|---|
| `screened_on` | UTC date the pack was read |
| `board` | |
| `buyer` | contracting authority |
| `reference` | buyer's tender reference, where the notice carried one |
| `title` | where recorded |
| `closes` | stated deadline |
| `value_raw` | as the notice wrote it, unconverted |
| `currency` | GBP / EUR / CAD / USD / NZD / `unstated` |
| `gate_class` | regex label over `exclusion_clause`, see `classify.mjs` |
| `exclusion_clause` | reason written at screening time, verbatim |

`exclusion_clause` is the record. `gate_class` is a convenience column and it is wrong in
places — 46 rows it cannot label at all.

## Counts

201 of 363: not software. Goods, telecom and connectivity leases, construction, studies,
recruitment, physical security.

162: software.

```
unclassified          46
closed_vehicle        36
references            34
cots_product          19
certification          8
body_shop              6
set_aside              5
insurance              3
portal_or_fee          3
incumbent_or_awarded   1
financial_standing     1
```

`closed_vehicle` — bids accepted only from holders of an existing standing offer, supply
arrangement or framework seat. Mostly [TBIPS/SBIPS](https://www.canada.ca/en/public-services-procurement/services/acquisitions/professional-services.html).

`references` — two or three delivered contracts of comparable size, named client contact each,
filed with the bid.

Both are circular for a new supplier: the reference needs prior public work, and the framework
seat is awarded on the same evidence.

## Boards

[CanadaBuys](https://canadabuys.canada.ca) · [Alberta Purchasing Connection](https://vendor.purchasingconnection.ca) ·
[bids&tenders](https://www.bidsandtenders.ca) · [MERX](https://www.merx.com) ·
[SaskTenders](https://sasktenders.ca) · [BC Bid](https://www.bcbid.gov.bc.ca) ·
[UK Contracts Finder](https://www.contractsfinder.service.gov.uk) · [Find a Tender](https://www.find-tender.service.gov.uk) ·
[YORtender](https://www.yortender.co.uk) · [Public Contracts Scotland](https://www.publiccontractsscotland.gov.uk) ·
[NZ GETS](https://www.gets.govt.nz) · [TED](https://ted.europa.eu) ·
[etenders.gov.ie](https://www.etenders.gov.ie) · [Ariba Discovery](https://discovery.ariba.com)

Uneven: APC 140 rows, CanadaBuys 116, both bulk sweeps. The rest read notice by notice, single
digits each. Few rows means swept less.

## Method

Filter for software scope, open the document pack, read the selection criteria. Killed when a
criterion could not be met on the submission date. Scored criteria counted as gates only where
the stated minimum was out of reach; those rows say so.

`classify.mjs` regenerates the CSV from the source log.

CC0.
