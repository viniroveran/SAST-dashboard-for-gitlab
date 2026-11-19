import { purgeExpiredReports } from '@/app/lib/store';

// Reports live REPORT_TTL_SECONDS (default 24 hours, see store.ts). Expired ones are already hidden
// on read; this sweep deletes their files. Every 5 minutes, plus once at startup, so a restart
// after downtime catches up right away.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

const state = globalThis as typeof globalThis & { __reportExpiryTimer?: NodeJS.Timeout };

async function sweep(): Promise<void> {
  try {
    const removed = await purgeExpiredReports();
    if (removed > 0) console.log(`report expiry: deleted ${removed} expired report file(s)`);
  } catch (error) {
    console.error('report expiry: purge failed:', error);
  }
}

export function startReportExpiry(): void {
  if (state.__reportExpiryTimer) return; // register() ran twice in this process (dev reloads)
  void sweep();
  state.__reportExpiryTimer = setInterval(() => void sweep(), SWEEP_INTERVAL_MS);
  state.__reportExpiryTimer.unref(); // never what keeps the process alive
}
