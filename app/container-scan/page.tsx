import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight, Inbox } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import EmptyState from '@/app/components/EmptyState';
import SeverityBadge from '@/app/components/SeverityBadge';
import { listReports } from '@/app/lib/store';
import { normalizeSeverity, SEVERITIES, type Severity } from '@/app/lib/severity';

// Read on every request: prerendered at build time it would freeze the build's (empty) data dir.
export const dynamic = 'force-dynamic';

function severityCounts(raw: Record<string, number>) {
  const counts = new Map<Severity, number>();
  for (const [name, n] of Object.entries(raw)) {
    const s = normalizeSeverity(name);
    counts.set(s, (counts.get(s) ?? 0) + n);
  }
  return SEVERITIES.filter((s) => (counts.get(s) ?? 0) > 0).map((s) => [s, counts.get(s)!] as const);
}

export default async function ContainerScansPage() {
  // The index only (newest first): no report file is read to build the list.
  const reports = await listReports('container');

  return (
    <>
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Container Scan Reports</h1>
        <p className="text-muted-foreground">Trivy image scans received from CI, newest first.</p>
      </div>

      {reports.length === 0 ? (
        <EmptyState icon={Inbox}>No container scan reports found.</EmptyState>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent [&>th]:px-4 [&>th]:text-xs [&>th]:text-muted-foreground [&>th]:uppercase">
                <TableHead>Repository</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vulnerabilities</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const href = `/container-scan/${report.id}`;
                const bySeverity = severityCounts(report.summary.severities ?? {});
                return (
                  <TableRow key={report.id} className="group relative [&>td]:px-4 [&>td]:py-3">
                    <TableCell className="font-medium">
                      {/* Stretched link: the whole row is clickable. */}
                      <Link href={href} className="after:absolute after:inset-0">
                        {report.repoName}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                      {report.summary.artifactName ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {format(new Date(report.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {report.summary.total === 0 ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Clean
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {bySeverity.map(([s, n]) => (
                            <span key={s} className="flex items-center gap-1">
                              <SeverityBadge severity={s} />
                              <span className="text-xs tabular-nums text-muted-foreground">{n}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
