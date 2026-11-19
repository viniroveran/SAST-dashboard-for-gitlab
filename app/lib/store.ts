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
//
// Reports are short-lived: REPORT_TTL_SECONDS after their timestamp (default 24 hours) they stop
// being served at once (getReport/listReports), and purgeExpiredReports(), run every few
// minutes from instrumentation.ts, deletes their files and drops them from the index.

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

const DEFAULT_TTL_SECONDS = 24 * 60 * 60;

/** How long a report lives after its timestamp, in ms (REPORT_TTL_SECONDS, default 24 hours). */
export function reportTtlMs(): number {
  const seconds = Number(process.env.REPORT_TTL_SECONDS);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_TTL_SECONDS) * 1000;
}

/** The TTL in words, for notices ("1 hour", "30 minutes"). */
export function reportTtlLabel(): string {
  const minutes = Math.round(reportTtlMs() / 60000);
  if (minutes % 60 === 0) return minutes === 60 ? '1 hour' : `${minutes / 60} hours`;
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

/** When a report created at `timestamp` expires. */
export function expiresAt(timestamp: string): Date {
  return new Date(new Date(timestamp).getTime() + reportTtlMs());
}

function isExpired(timestamp: string, now = Date.now()): boolean {
  const created = new Date(timestamp).getTime();
  // An unparseable timestamp can't be dated: treat it as expired rather than keep it forever.
  return !Number.isFinite(created) || created + reportTtlMs() <= now;
}

const KINDS: ReportKind[] = ['sast', 'secret', 'dependency', 'container'];

// Serializes index writers of a kind: saveReport's append and the purge's rewrite must not
// interleave, or an append landing between the purge's read and its rename would be lost.
// On globalThis because instrumentation.ts and the route handlers are separate bundles, each
// with its own copy of this module, in the same (single) server process.
const indexLocks: Map<ReportKind, Promise<unknown>> = ((globalThis as Record<string, unknown>).__reportIndexLocks ??=
  new Map()) as Map<ReportKind, Promise<unknown>>;

function withIndexLock<R>(kind: ReportKind, fn: () => Promise<R>): Promise<R> {
  const previous = indexLocks.get(kind) ?? Promise.resolve();
  const run = previous.then(fn, fn);
  indexLocks.set(kind, run.catch(() => undefined));
  return run;
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
  await withIndexLock(kind, () => fs.appendFile(path.join(dir, 'index.jsonl'), `${JSON.stringify(line)}\n`));

  return entry;
}

/**
 * A stored report, or null when the id is unknown, isn't a UUID (never a path) or the report has
 * expired (even if the purge hasn't deleted its file yet).
 */
export async function getReport<T>(kind: ReportKind, id: string): Promise<StoredReport<T> | null> {
  if (!isUuid(id)) return null;

  let entry: StoredReport<T>;
  try {
    entry = JSON.parse(await fs.readFile(path.join(kindDir(kind), `${id}.json`), 'utf8')) as StoredReport<T>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
  return isExpired(entry.timestamp) ? null : entry;
}

async function readIndex(kind: ReportKind): Promise<IndexEntry[]> {
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
    });
}

/** Every live (unexpired) report of a kind, newest first (from the index; no report file is read). */
export async function listReports(kind: ReportKind): Promise<IndexEntry[]> {
  const now = Date.now();
  return (await readIndex(kind))
    .filter((entry) => !isExpired(entry.timestamp, now))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// A report file is written before its index line is appended: don't take a file missing from
// the index for an orphan until it's older than this.
const ORPHAN_GRACE_MS = 60 * 1000;

/**
 * Deletes expired reports: rewrites each index without them, then removes every report file
 * (and leftover .tmp) whose id is no longer live in the index. Returns how many files went.
 */
export async function purgeExpiredReports(): Promise<number> {
  let removed = 0;
  for (const kind of KINDS) {
    const dir = kindDir(kind);
    const now = Date.now();

    const { liveIds, expiredIds } = await withIndexLock(kind, async () => {
      const entries = await readIndex(kind);
      const live = entries.filter((entry) => !isExpired(entry.timestamp, now));
      if (live.length !== entries.length) {
        await writeAtomic(
          path.join(dir, 'index.jsonl'),
          live.map((entry) => `${JSON.stringify(entry)}\n`).join(''),
        );
      }
      const liveIds = new Set(live.map((entry) => entry.id));
      const expiredIds = new Set(entries.map((entry) => entry.id).filter((id) => !liveIds.has(id)));
      return { liveIds, expiredIds };
    });

    let files: string[];
    try {
      files = await fs.readdir(dir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }

    for (const file of files) {
      if (file === 'index.jsonl') continue;
      const id = file.split('.')[0];
      if (liveIds.has(id) && !file.endsWith('.tmp')) continue;

      const filePath = path.join(dir, file);
      try {
        // Expired per the index: delete. Anything else unknown is an orphan (crash between the
        // file write and the index append, or a leftover .tmp): only once past the grace period,
        // since a report being saved right now looks just like one.
        if (!expiredIds.has(id) || file.endsWith('.tmp')) {
          const { mtimeMs } = await fs.stat(filePath);
          if (now - mtimeMs < ORPHAN_GRACE_MS) continue;
        }
        await fs.unlink(filePath);
        removed++;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
  }
  return removed;
}

export function countSeverities(severities: (string | undefined)[]): ReportSummary {
  const counts: Record<string, number> = {};
  for (const severity of severities) {
    const key = severity || 'Unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return { severities: counts, total: severities.length };
}
