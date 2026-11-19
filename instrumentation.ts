// Runs once when a Next.js server starts (dev, `next start` and the standalone server.js).
export async function register() {
  // fs and timers: Node.js runtime only.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startReportExpiry } = await import('./app/lib/report-expiry');
    startReportExpiry();
  }
}
