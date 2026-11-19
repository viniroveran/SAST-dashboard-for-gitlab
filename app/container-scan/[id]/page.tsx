import { format } from 'date-fns';
import { Box, Cpu, FileQuestion, ShieldCheck } from 'lucide-react';
import EmptyState from '@/app/components/EmptyState';
import ReportHeader from '@/app/components/ReportHeader';
import TrivyReportExplorer from '@/app/components/TrivyReportExplorer';
import { expiresAt, getReport, reportTtlLabel } from '@/app/lib/store';
import { ContainerScanReport, ContainerVulnerability } from '@/app/types/containerScan';

export default async function ContainerScanReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getReport<ContainerScanReport>('container', id);
  if (!entry) {
    return (
      <>
        <title>Report Not Found</title>
        <EmptyState icon={FileQuestion}>
          Container scan report with ID &quot;{id}&quot; not found. Reports are deleted {reportTtlLabel()} after they
          are received.
        </EmptyState>
      </>
    );
  }

  const report = entry.data;
  const formattedDate = format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss');

  // Flatten all vulnerabilities across all results
  const allVulnerabilities: ContainerVulnerability[] = (report.Results ?? []).flatMap(
    (result) => result.Vulnerabilities ?? [],
  );

  return (
    <>
      <title>{`Container Scan: ${entry.repoName} - ${formattedDate}`}</title>
      <ReportHeader
        kind="Container Scan"
        repoName={entry.repoName}
        date={formattedDate}
        expiresAt={expiresAt(entry.timestamp)}
      >
        {report.ArtifactName && (
          <span className="flex items-center gap-1.5 font-mono text-xs break-all">
            <Box className="size-4 shrink-0" />
            {report.ArtifactName}
          </span>
        )}
        {report.Metadata?.OS && (
          <span className="flex items-center gap-1.5">
            <Cpu className="size-4" />
            {report.Metadata.OS.Family} {report.Metadata.OS.Name}
          </span>
        )}
      </ReportHeader>

      {allVulnerabilities.length > 0 ? (
        <TrivyReportExplorer vulnerabilities={allVulnerabilities} variant="container" />
      ) : (
        <EmptyState icon={ShieldCheck}>No vulnerabilities found in this scan.</EmptyState>
      )}
    </>
  );
}
