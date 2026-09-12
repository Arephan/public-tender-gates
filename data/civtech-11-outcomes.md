# CivTech 11 — how many suppliers actually bid, and who won

Source: Public Contracts Scotland award-notice API, `noticeType=3`, read 2026-09-12.
Four CivTech 11 challenges have published a contract-award notice. Each notice carries
`NB_Tenders_Received` and `NB_Tenders_Received_SME`, so the competition size is a published
number, not an estimate.

| Challenge | Buyer | Value (GBP) | Bidders | SME bidders | Winner |
|---|---|---|---|---|---|
| 11.6 teacher workload | Scottish Government | 598,363 | 37 | 37 | Poteris (London) |
| 11.x | Scottish Government | 599,859 | 29 | 29 | Daysix Ltd (Edinburgh) |
| 11.1 flooding impact | SEPA | 563,870 | 15 | 15 | Ocean intelligence (Nelson) |
| 11.3 environmental impact | The GRAB Trust | 550,000 | 5 | 5 | 4c Design Limited (Glasgow) |

Two things the numbers say:

**Every bidder in all four was an SME.** 86 of 86. There is no large-supplier field to lose to
here, which is unusual for a ~GBP 550-600k public contract and is the reason this competition is
worth a small firm's time at all.

**Competition size varies seven-fold between challenges on the same programme.** 5 bidders on
11.3, 37 on 11.6, same deadline, same money. A challenge's subject matter, not the programme,
decides the odds — so "CivTech is 1-in-20" is not a usable number and picking which challenge
to answer matters more than how the answer is written.

Values are the awarded totals; each is close to the GBP 650,000 advertised ceiling.
Re-run the read against `https://api.publiccontractsscotland.gov.uk/v1/Notices?noticeType=3&outputType=1`
and grep for `CivTech`.
