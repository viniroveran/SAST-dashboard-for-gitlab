import { NextResponse } from 'next/server';

import { countSeverities } from '@/app/lib/store';
import { reportWebhook } from '@/app/lib/webhook';
import type { TrivyReport } from '@/app/types/trivy';

// POST { repoName, trivyReport } — raw `trivy fs --format json` output.
export const POST = reportWebhook<TrivyReport>({
  kind: 'dependency',
  field: 'trivyReport',
  viewPath: '/dependency-scan',
  title: (repoName) => `📦 New Dependency Scan Report for ${repoName}`,
  summarize: (report) =>
    countSeverities((report.Results ?? []).flatMap((result) => result.Vulnerabilities ?? []).map((v) => v.Severity)),
});

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
