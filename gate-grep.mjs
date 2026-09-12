#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const GATES = [
  ['REFEREES/CLIENT REFERENCES', /\b(referee|reference project|customer reference|two \(2\) refer|three \(3\) refer|contact details for refer)/i],
  ['PRIOR-CONTRACT COUNT',       /\b(three \(3\) instances|two \(2\) instances|previous comparable|similar (?:contracts|projects) (?:in|within) the last)/i],
  ['INSURANCE AT SUBMISSION',    /\b(employer'?s liability|public liability|professional indemnity|certificate of insurance)/i],
  ['CERTIFICATION',              /\b(ISO ?27001|ISO ?9001|Cyber Essentials|SOC ?2|ISO ?14001)/i],
  ['TURNOVER',                   /\b(annual turnover|minimum turnover|turnover requirement|turnover of (?:at least|not less than)|turnover during the last|turnover (?:in|over) each of the last)/i],
  ['GEOGRAPHY / DATA LOCATION',  /\b(within the EEA|outside of the EEA|must be established in|resident in the (?:UK|EU|State))/i],
  ['NAMED STACK',                /\b(must have been developed in|non matching technolog|equivalent technolog)/i],
  ['HEADCOUNT',                  /\b(minimum of \d+ (?:staff|employees|personnel)|team of at least)/i],
  ['FEE TO BID',                 /\b(non-?refundable (?:fee|deposit)|document fee of)/i],
  ['CHECKLIST POINTER',          /\bchecklist\b/i],
];

// A tender pack is PDF and Office documents, never .txt. Reading only .txt/.md
// made this script print "No gate signals found" on every real pack it was ever
// pointed at — a false all-clear. It missed a EUR 950,000 minimum-turnover gate
// on BIM 2026-09 (eTenders 8799836) on 2026-09-12.
function extract(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.txt' || ext === '.md' || ext === '.xml' || ext === '.csv') {
    return fs.readFileSync(file, 'utf8');
  }
  if (ext === '.pdf') {
    return execFileSync('pdftotext', ['-layout', file, '-'], { maxBuffer: 64 << 20 }).toString('utf8');
  }
  if (ext === '.docx' || ext === '.xlsx' || ext === '.pptx') {
    // Office Open XML: the body parts are XML inside the zip. Strip tags, keep
    // one line per paragraph/row so the reported line number still points somewhere.
    const parts = ext === '.docx' ? ['word/document.xml']
      : ext === '.xlsx' ? ['xl/sharedStrings.xml']
      : ['ppt/slides/slide1.xml'];
    let out = '';
    for (const p of parts) {
      let xml = '';
      try { xml = execFileSync('unzip', ['-p', file, p], { maxBuffer: 64 << 20 }).toString('utf8'); }
      catch { continue; }
      out += xml
        .replace(/<\/w:p>|<\/si>|<\/row>/g, '\n')
        .replace(/<[^>]*>/g, ' ')
        .replace(/[ \t]+/g, ' ');
    }
    return out;
  }
  return null;
}

const files = [];
const t = process.argv[2];
if (!t) { console.error('usage: gate-grep.mjs <file|dir>'); process.exit(2); }
if (fs.statSync(t).isDirectory()) for (const f of fs.readdirSync(t).sort()) files.push(path.join(t, f));
else files.push(t);

let hits = 0, read = 0;
const skipped = [];
for (const f of files) {
  if (fs.statSync(f).isDirectory()) continue;
  let text;
  try { text = extract(f); } catch (e) { skipped.push(`${path.basename(f)} (${e.message.split('\n')[0]})`); continue; }
  if (text === null) { skipped.push(`${path.basename(f)} (unsupported type)`); continue; }
  read++;
  const lines = text.split('\n');
  for (const [name, re] of GATES) {
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        hits++;
        console.log(`${name}\n  ${path.basename(f)}:${i + 1}  ${lines[i].trim().slice(0, 200)}`);
        break; // one hit per gate per file is enough to send you to the page
      }
    }
  }
}
console.log(`\nread ${read} file(s)` + (skipped.length ? `, COULD NOT READ ${skipped.length}: ${skipped.join(', ')}` : ''));
if (!read) console.log('NOTHING WAS READ. This is not a clean pack — do not score the bid off this run.');
console.log(hits ? `${hits} gate signal(s). Read each page before scoring the bid.` : 'No gate signals in what was read. Still read the submission checklist.');
