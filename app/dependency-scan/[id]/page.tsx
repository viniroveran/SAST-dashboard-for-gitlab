import { format } from 'date-fns';
import { FileQuestion, GitCommit, ShieldCheck } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import ReportHeader from '@/app/components/ReportHeader';
import TrivyReportExplorer from '@/app/components/TrivyReportExplorer';
import { expiresAt, getReport, reportTtlLabel } from '@/app/lib/store';
import { TrivyReport, TrivyVulnerability } from '@/app/types/trivy';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DependencyScanPage({ params }: Props) {
  const { id } = await params;

  const reportEntry = await getReport<TrivyReport>('dependency', id);

  if (!reportEntry) {
    return (
      <>
        <title>Report Not Found</title>
        <EmptyState icon={FileQuestion}>
          Dependency scan report with ID &quot;{id}&quot; not found. Reports are deleted {reportTtlLabel()} after they
          are received.
        </EmptyState>
      </>
    );
  }

  const report = reportEntry.data;
  const formattedDate = format(new Date(reportEntry.timestamp), 'yyyy-MM-dd HH:mm:ss');

  const allVulnerabilities: TrivyVulnerability[] = (report.Results ?? []).flatMap(
    (result) => result.Vulnerabilities ?? [],
  );

  return (
    <>
      <title>{`Dependency Scan: ${reportEntry.repoName} - ${formattedDate}`}</title>
      <ReportHeader
        kind="Dependency Scan"
        repoName={reportEntry.repoName}
        date={formattedDate}
        expiresAt={expiresAt(reportEntry.timestamp)}
      >
        {report.Metadata?.Commit && (
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <GitCommit className="size-4" />
            {report.Metadata.Commit.slice(0, 8)}
          </span>
        )}
      </ReportHeader>

      {allVulnerabilities.length > 0 ? (
        <TrivyReportExplorer vulnerabilities={allVulnerabilities} variant="dependency" />
      ) : (
        <EmptyState icon={ShieldCheck}>No vulnerabilities found in this scan.</EmptyState>
      )}
    </>
  );
}
