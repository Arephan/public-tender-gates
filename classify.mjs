import fs from 'fs';
const L=fs.readFileSync('PIPELINE.jsonl','utf8').trim().split('\n').map(l=>{try{return JSON.parse(l)}catch(e){return null}}).filter(Boolean);
const k=L.filter(r=>/^killed|^no-bid/i.test(r.stage||r.state||''));
const RULES=[
 ['closed_vehicle',     /standing[- ]offer|supply arrangement|\bTBIPS\b|\bSBIPS\b|already hold|restricted to existing|pre-?qualified list|existing supplier list|framework agreement|approved supplier/i],
 ['set_aside',          /set-?aside|reserved for|\bPSAB\b|indigenous business|social enterprise only/i],
 ['prior_engagements_passfail', /pass ?\/ ?fail[\s\S]{0,300}?minimum of (one|two|three|four|five|\d+)[\s\S]{0,120}?(project|engagement|implementation|contract)s?|minimum of (one|two|three|four|five|\d+) ?\(?\d*\)?[\s\S]{0,120}?(project|engagement|implementation)s?[\s\S]{0,200}?pass ?\/ ?fail|minimum (company|proponent|firm|project manager) qualifications?/i],
 ['references',         /\breferences?\b|referee/i],
 ['financial_standing', /turnover|audited|auditor|financial standing|balance sheet|bonding|\bbid bond\b|net worth|annual revenue/i],
 ['insurance',          /insurance|professional indemnity|indemnit|liability cover/i],
 ['certification',      /soc ?2|soc ?3|iso ?270|iso ?9001|cyber essentials|certificat|accredit|assurance questionnaire/i],
 ['prior_contracts',    /prior implementation|comparable contract|previous contract|years.{0,25}(experience|business)|track record|case stud|minimum .{0,15}experience|\b\d+\+? ?(yrs|years)\b/i],
 ['staffing_evidence',  /headcount|staff name|qualifications of|named personnel|\bCVs?\b|key personnel|team of \d/i],
 ['body_shop',          /body shop|staffing|help ?desk|service desk|roster of|on-demand roster|per hour|hourly|staff augmentation|embedded engineer|forward deployed|full-time equivalent|resource request/i],
 ['cots_product',       /\bCOTS\b|off-the-shelf|existing (commercial )?product|established solution|commercial product|licence resale|license resale|\bresale\b|reseller|Microsoft 365|SharePoint Online|already licens/i],
 ['goods_not_services', /category GD|goods purchase|\brental\b|leasing|location de|telecom|internet infrastructure|ISP circuit|connectivity procurement|approvisionnement \(biens\)/i],
 ['out_of_scope',       /hardware|construction|trades|site work|\bstudy\b|marketing|recruit|translat|physical security|cabling|furniture|no fit|not software|consulting engagement|non-binding RFI|information gathering/i],
 ['portal_or_fee',      /\bfee\b|registration|prequalif|pre-qualif|portal-only|portal only|account required|login wall/i],
 ['site_visit',         /site visit|mandatory attendance|pre-bid meeting/i],
 ['geography',          /only\b.{0,25}(resident|citizen|based|registered)|work authorization|province of registration|locally based|must be based|domiciled/i],
 ['incumbent_or_awarded',/\bACAN\b|already awarded|incumbent|sole source/i],
];
const cls=t=>{for(const [n,re] of RULES) if(re.test(t)) return n; return 'unclassified';};
const rows=[];
for(const r of k){
  const note=(r.reason||r.note||r.gate||r.why||'').replace(/\s+/g,' ').trim();
  if(note.length<15) continue;
  const vr=r.value||r.value_gbp||r.valueGbp||r.valueEur||''; const cur=/GBP|£/.test(vr)?'GBP':/EUR|€/.test(vr)?'EUR':/CAD|CA\$/.test(vr)?'CAD':/USD|US\$/.test(vr)?'USD':/NZD/.test(vr)?'NZD':(String(vr).trim()?'unstated':''); rows.push({screened_on:(r.ts||'').slice(0,10),board:r.board||r.source||'',buyer:r.buyer||'',reference:r.bid||r.id||r.ref||'',title:r.title||'',closes:(r.closes||r.deadline||'').slice(0,10),value_raw:vr,currency:cur,gate_class:cls(note),exclusion_clause:note});
}
const t={}; for(const r of rows) t[r.gate_class]=(t[r.gate_class]||0)+1;
console.log('rows',rows.length);
console.log(Object.entries(t).sort((a,b)=>b[1]-a[1]).map(([a,b])=>a+'='+b).join('  '));
const q=s=>{s=String(s??''); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
const hdr=Object.keys(rows[0]);
fs.writeFileSync('/tmp/tg/screened-tenders.csv',[hdr.join(',')].concat(rows.map(r=>hdr.map(h=>q(r[h])).join(','))).join('\n')+'\n');
fs.writeFileSync('/tmp/tg/tally.json',JSON.stringify(t,null,1));
