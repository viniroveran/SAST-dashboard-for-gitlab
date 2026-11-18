import { NextResponse } from 'next/server';

import { countSeverities } from '@/app/lib/store';
import { reportWebhook } from '@/app/lib/webhook';
import type { SastReport } from '@/app/types/vulnerability';

// POST { repoName, secretDetectionReport: { vulnerabilities } } — GitLab's
// gl-secret-detection-report.json, same shape as a SAST report.
export const POST = reportWebhook<SastReport>({
  kind: 'secret',
  field: 'secretDetectionReport',
  viewPath: '/secret-detection',
  title: (repoName) => `🔑 New Secret Detection Report for ${repoName}`,
  summarize: (report) => countSeverities((report.vulnerabilities ?? []).map((v) => v.severity)),
});

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
