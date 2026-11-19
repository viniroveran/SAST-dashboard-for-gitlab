import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

// Report storage: one JSON file per report plus a small append-only index per kind.
//
//   $DATA_DIR/<kind>/<id>.json    the full report entry ({ id, repoName, timestamp, data })
//   $DATA_DIR/<kind>/index.jsonl  one line per report: { id, repoName, timestamp, summary }
//
// It replaces the single lowdb db.json, which held every report ever received and was read,
// parsed and rewritten whole on each request: at ~80 MB that ran Node out of heap on every
// dependency-scan webhook and the container crash-looped. A webhook now writes one file and
// appends one line; a report page reads one file; a list page reads only the index.
//
// DATA_DIR defaults to ./data — /app/data in the production image, the mounted volume.

export type ReportKind = 'sast' | 'secret' | 'dependency' | 'container';

export interface ReportSummary {
  /** Findings by severity, as the scanner names them ("Critical", "HIGH"…). */
  severities: Record<string, number>;
  total: number;
  /** Container scans: the scanned image. */
  artifactName?: string;
}

export interface IndexEntry {
  id: string;
  repoName: string;
  timestamp: string;
  summary: ReportSummary;
}

export interface StoredReport<T> {
  id: string;
  repoName: string;
  timestamp: string;
  data: T;
}

// turbopackIgnore: these paths are runtime data (the volume), not code. Without it Turbopack
// can't scope the dynamic path and traces the whole project into the standalone output.
export function dataDir(): string {
  return process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), 'data');
}

function kindDir(kind: ReportKind): string {
  return path.join(/*turbopackIgnore: true*/ dataDir(), kind);
}

/** Writes a file atomically: a reader never sees a half-written report. */
async function writeAtomic(file: string, contents: string): Promise<void> {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, contents);
  await fs.rename(tmp, file);
}

export async function saveReport<T>(
  kind: ReportKind,
  repoName: string,
  data: T,
  summary: ReportSummary,
  options: { id?: string; timestamp?: string } = {}
): Promise<StoredReport<T>> {
  const dir = kindDir(kind);
  await fs.mkdir(dir, { recursive: true });

  const entry: StoredReport<T> = {
    id: options.id ?? uuidv4(),
    repoName,
    timestamp: options.timestamp ?? new Date().toISOString(),
    data,
  };

  await writeAtomic(path.join(dir, `${entry.id}.json`), JSON.stringify(entry));
  const line: IndexEntry = { id: entry.id, repoName, timestamp: entry.timestamp, summary };
  // One short line per append: concurrent webhooks can't interleave within it.
  await fs.appendFile(path.join(dir, 'index.jsonl'), `${JSON.stringify(line)}\n`);

  return entry;
}

/** A stored report, or null when the id is unknown (or isn't a UUID — never a path). */
export async function getReport<T>(kind: ReportKind, id: string): Promise<StoredReport<T> | null> {
  if (!isUuid(id)) return null;

  try {
    return JSON.parse(await fs.readFile(path.join(kindDir(kind), `${id}.json`), 'utf8')) as StoredReport<T>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

/** Every report of a kind, newest first (from the index; no report file is read). */
export async function listReports(kind: ReportKind): Promise<IndexEntry[]> {
  let raw: string;
  try {
    raw = await fs.readFile(path.join(kindDir(kind), 'index.jsonl'), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  return raw
    .split('\n')
    .filter((line) => line.trim() !== '')
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as IndexEntry];
      } catch {
        return []; // a line cut short by a crash mid-append
      }
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function countSeverities(severities: (string | undefined)[]): ReportSummary {
  const counts: Record<string, number> = {};
  for (const severity of severities) {
    const key = severity || 'Unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return { severities: counts, total: severities.length };
}
