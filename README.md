# Public tender gates

Screening log: public-sector tenders read for pass/fail selection criteria, with the clause
that closed each one. 367 rows, 2026-08-21 to 2026-09-12 (UTC).

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

201 of 367: not software. Goods, telecom and connectivity leases, construction, studies,
recruitment, physical security.

166: software.

```
unclassified                46
closed_vehicle              36
references                  34
cots_product                21
certification                8
body_shop                    6
set_aside                    5
portal_or_fee                4
insurance                    3
incumbent_or_awarded         1
financial_standing           1
prior_engagements_passfail   1
```

`prior_engagements_passfail` — the firm, or a named individual on it, must already have
delivered a minimum number of comparable projects, checked pass/fail before anything is
scored. Distinct from `references`, where prior work earns points and a bidder with none
can still bid and lose them. Richmond 8617P requires three prior ERM projects for Canadian
public-sector bodies from the proponent *and* three more, personally, from the proposed
project manager.

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

## data/bidsandtenders-tenant-access.csv

A second, smaller screening log, added 2026-09-12. Same question asked one level up: before
you read a tender pack for gates, can you reach the pack at all?

bids&tenders is a single platform with one subdomain per buyer. Access is set per tenant,
not per notice, and the notice page does not say so until you open it. 129 tenant subdomains
were probed anonymously on 2026-09-12:

| `access_state` | n | what it means |
|---|---|---|
| `FEE` | 45 | the first open notice's detail page says *"you will need to have a subscription plan or buy Pay-Per-Bid access for this opportunity"*. Every notice on that tenant is behind that. |
| `FREE` | 27 | no such string. Documents and plan-taker registration are free. |
| `NO-OPEN-BIDS` | 12 | reachable, nothing open at probe time, so access untested. |
| `DEAD-SLUG` | 45 | `<slug>.bidsandtenders.ca` redirected to `/Error?aspxerrorpath=`. |

`DEAD-SLUG` means **the subdomain guess was wrong, not that the buyer is absent** — Niagara
Region is `niagararegion`, not `niagara`. Treat that column as "this list had the wrong
address", nothing more.

The fee band is regional rather than random: the 45 `FEE` tenants are almost entirely
Ontario, including Hamilton, London, Kitchener, Mississauga, Markham, Brampton, Durham,
York and Niagara Region. The `FREE` tenants are mostly Western Canada and the Maritimes.

### Reproducing it

`probe-tenant-access.mjs` is the whole method — Node 18+, no dependencies, no account:

```
node probe-tenant-access.mjs hamilton sturgeoncounty
{"slug":"hamilton","state":"FEE","open_notices":5,"sampled":"C11-71-26 - Tender for Supply and Delivery of Sodium Bisulfite"}
{"slug":"sturgeoncounty","state":"FREE","open_notices":4,"sampled":"2026-115 - Reconstruction and Surfacing of Twp Rd 560 - Engineering"}
```

It fetches the tenant homepage for a cookie and the anti-forgery token, posts the open-bid
search, then reads the first notice's detail page and greps it. Nine of the 129 rows were
re-probed with this script after the CSV was written and all nine matched.

A state can change the day a buyer changes plan. The `measured_on` column is there so a
stale row is visible as a stale row.

## `gate-grep.mjs` — read a tender document pack and print its pass/fail gates

Point it at the folder you downloaded the tender pack into. It reads PDF, DOCX,
XLSX and plain text, and prints every line that looks like a gate a small
supplier cannot clear on submission day: client references, prior-contract
counts, insurance certificates, ISO/SOC certification, minimum turnover,
geography or establishment clauses, headcount minimums, a fee to bid.

```
node gate-grep.mjs ./my-tender-pack
```

Needs Node 18+ and `pdftotext` (poppler) on PATH. No account, no API key, no
network — it only reads files you already have.

It prints how many files it read and names the ones it could not, because the
failure mode that matters is a screener that reports a clean pack when it in
fact read nothing. That is not hypothetical: until 2026-09-12 this script only
opened `.txt` and `.md`, so on every real pack it printed *"No gate signals
found"*. Pointed at the Bord Iascaigh Mhara FMS tender (eTenders 8799836) it
reported nothing; the fixed version reports 13 signals in the same folder,
including a **EUR 950,000 minimum turnover over each of the last three financial
years** in the CPD and an **ISO 27001** requirement in the requirements matrix —
two independent pass/fail gates, either of which ends the bid for a supplier
without three years of audited accounts.

A gate is not a judgement. It tells you which page to read before you spend a
day writing a proposal.
