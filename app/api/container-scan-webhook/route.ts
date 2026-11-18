import { NextResponse } from 'next/server';

import { countSeverities } from '@/app/lib/store';
import { reportWebhook } from '@/app/lib/webhook';
import type { ContainerScanReport } from '@/app/types/containerScan';

// POST { repoName, containerScanReport } — raw `trivy image --format json` output.
export const POST = reportWebhook<ContainerScanReport>({
  kind: 'container',
  field: 'containerScanReport',
  viewPath: '/container-scan',
  title: (repoName) => `🐳 New Container Scan Report for ${repoName}`,
  summarize: (report) => ({
    ...countSeverities((report.Results ?? []).flatMap((result) => result.Vulnerabilities ?? []).map((v) => v.Severity)),
    artifactName: report.ArtifactName,
  }),
});

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
