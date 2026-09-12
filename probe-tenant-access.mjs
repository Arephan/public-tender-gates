// Anonymous access-state probe for one bidsandtenders tenant.
// node probe.mjs hamilton sturgeoncounty
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'

async function probe (slug) {
  const base = `https://${slug}.bidsandtenders.ca`
  const r = await fetch(base + '/Module/Tenders/en/Home/BidsHomepage', { headers: { 'User-Agent': UA }, redirect: 'follow' })
  if (r.url.includes('/Error?aspxerrorpath')) return { slug, state: 'DEAD-SLUG' }
  const html = await r.text()
  const cookies = (r.headers.getSetCookie?.() || []).map(c => c.split(';')[0]).join('; ')
  const tok = (html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/) || [])[1]
  const node = (html.match(/id="NodeId"[^>]*value="([^"]+)"/) || [])[1]
  const home = (html.match(/id="Home"[^>]*value="([^"]*)"/) || [])[1] || '/Module/Tenders/en'
  if (!tok || !node) return { slug, state: 'NO-TOKEN' }

  const url = `${base}${home}/Tender/Search/${node}?status=Open&limit=5&start=0&dir=ASC&from=&to=&sort=DateClosing ASC,Id`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest', Cookie: cookies, Referer: base + '/Module/Tenders/en/Home/BidsHomepage' },
    body: new URLSearchParams({ keywords: '', __RequestVerificationToken: tok }).toString(),
  })
  const j = await res.json().catch(() => null)
  const data = (j && (j.data || j.Data)) || []
  if (!data.length) return { slug, state: 'NO-OPEN-BIDS' }

  const id = data[0].Id || data[0].id
  const d = await fetch(`${base}${home}/Tender/Detail/${id}`, { headers: { 'User-Agent': UA, Cookie: cookies } })
  const dh = await d.text()
  const fee = /Pay-Per-Bid/i.test(dh) || /subscription plan/i.test(dh)
  return { slug, state: fee ? 'FEE' : 'FREE', open_notices: data.length, sampled: (data[0].Title || data[0].title || '').slice(0, 70) }
}

for (const s of process.argv.slice(2)) {
  try { console.log(JSON.stringify(await probe(s))) } catch (e) { console.log(JSON.stringify({ slug: s, state: 'ERROR', why: e.message })) }
}
