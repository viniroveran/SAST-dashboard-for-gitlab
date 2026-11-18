#!/usr/bin/env node
// Moves the reports of the old lowdb db.json into the per-report store (app/lib/store.ts):
//   node scripts/migrate-db-json.mjs <old db.json> <data dir>
// Ids and timestamps are kept, so links already sent to Discord keep working. Safe to re-run:
// a report whose file already exists is skipped (and not added to the index twice).
import { promises as fs } from 'fs';
import path from 'path';

const [source, dataDir] = process.argv.slice(2);
if (!source || !dataDir) {
  console.error('usage: node scripts/migrate-db-json.mjs <old db.json> <data dir>');
  process.exit(2);
}

const KINDS = {
  reports: { kind: 'sast', vulns: (d) => (d.vulnerabilities ?? []).map((v) => v.severity) },
  trivyReports: { kind: 'dependency', vulns: (d) => (d.Results ?? []).flatMap((r) => r.Vulnerabilities ?? []).map((v) => v.Severity) },
  containerScanReports: {
    kind: 'container',
    vulns: (d) => (d.Results ?? []).flatMap((r) => r.Vulnerabilities ?? []).map((v) => v.Severity),
    extra: (d) => ({ artifactName: d.ArtifactName }),
  },
};

function summarize(severities) {
  const counts = {};
  for (const s of severities) counts[s || 'Unknown'] = (counts[s || 'Unknown'] ?? 0) + 1;
  return { severities: counts, total: severities.length };
}

const db = JSON.parse(await fs.readFile(source, 'utf8'));

for (const [collection, { kind, vulns, extra }] of Object.entries(KINDS)) {
  const entries = db[collection] ?? [];
  const dir = path.join(dataDir, kind);
  await fs.mkdir(dir, { recursive: true });

  let written = 0;
  let skipped = 0;
  const lines = [];
  for (const entry of entries) {
    const file = path.join(dir, `${entry.id}.json`);
    try {
      await fs.access(file);
      skipped += 1;
      continue;
    } catch {
      // not migrated yet
    }
    await fs.writeFile(file, JSON.stringify({ id: entry.id, repoName: entry.repoName, timestamp: entry.timestamp, data: entry.data }));
    const summary = { ...summarize(vulns(entry.data ?? {})), ...(extra ? extra(entry.data ?? {}) : {}) };
    lines.push(JSON.stringify({ id: entry.id, repoName: entry.repoName, timestamp: entry.timestamp, summary }));
    written += 1;
  }
  if (lines.length) await fs.appendFile(path.join(dir, 'index.jsonl'), `${lines.join('\n')}\n`);
  console.log(`${collection} -> ${kind}: ${written} written, ${skipped} already there`);
}
