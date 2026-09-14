// Count TED notice types for IT services (CPV 72) and software (CPV 48)
// published in the last 30 days. Node 18+, no dependencies, no account.
// Writes data/ted-notice-types.csv.
//
// Why: a TED search on those CPV codes returns award notices, modifications
// and voluntary ex-ante notices alongside open calls. A scanner that treats
// every hit as a tender sends you to read contracts that are already awarded.
import { writeFileSync } from 'node:fs';

const OPEN = /^(cn-|pin-cfc|pin-rtl|subco|qu-sy)/;
const counts = {};
let total = 0;
for (let page = 1; page <= 20; page++) {
  const res = await fetch('https://api.ted.europa.eu/v3/notices/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: 'classification-cpv IN (72000000 48000000) AND publication-date>=today(-30)',
      fields: ['publication-number', 'notice-type'], limit: 250, page,
    }),
  });
  if (!res.ok) break;
  const j = await res.json();
  const n = j.notices || [];
  for (const x of n) {
    const t = String([].concat(x['notice-type'] ?? '')[0] || 'unknown');
    counts[t] = (counts[t] || 0) + 1;
    total++;
  }
  if (n.length < 250) break;
}
const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
const csv = ['notice_type,count,share_pct,open_competition']
  .concat(rows.map(([t, c]) => `${t},${c},${(100 * c / total).toFixed(1)},${OPEN.test(t) ? 'yes' : 'no'}`))
  .join('\n') + '\n';
writeFileSync('data/ted-notice-types.csv', csv);
const open = rows.filter(([t]) => OPEN.test(t)).reduce((s, [, c]) => s + c, 0);
console.log(csv);
console.log(`total ${total}, open ${open} (${(100 * open / total).toFixed(1)}%)`);
