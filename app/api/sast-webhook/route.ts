import { NextResponse } from 'next/server';

import { countSeverities } from '@/app/lib/store';
import { reportWebhook } from '@/app/lib/webhook';
import type { SastReport } from '@/app/types/vulnerability';

// POST { repoName, sastReport: { vulnerabilities } } — GitLab's gl-sast-report.json.
export const POST = reportWebhook<SastReport>({
  kind: 'sast',
  field: 'sastReport',
  viewPath: '/reports',
  title: (repoName) => `🚨 New SAST Report for ${repoName}`,
  summarize: (report) => countSeverities((report.vulnerabilities ?? []).map((v) => v.severity)),
});

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
