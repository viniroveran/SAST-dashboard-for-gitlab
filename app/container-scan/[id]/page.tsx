import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import db, { initializeDb } from '@/app/lib/db';
import { ContainerVulnerability } from '@/app/types/containerScan';
import SeverityCounters from '@/app/components/SeverityCounters';
import ContainerVulnerabilityTable from '@/app/components/ContainerVulnerabilityTable';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ContainerScanReportPage({ params }: { params: { id: string } }) {
  await initializeDb();
  await db.read();

  const entry = db.data?.containerScanReports.find((r) => r.id === params.id);
  if (!entry) notFound();

  const report = entry.data;
  const formattedDate = format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss');

  // Flatten all vulnerabilities across all results
  const allVulnerabilities: ContainerVulnerability[] = report.Results.flatMap(
    (result) => result.Vulnerabilities ?? []
  );

  // Normalize for SeverityCounters (expects lowercase `severity`)
  const normalizedForCounters = allVulnerabilities.map((v) => ({
    severity: v.Severity.charAt(0).toUpperCase() + v.Severity.slice(1).toLowerCase(),
  }));

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {entry.repoName}
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-4 font-mono text-sm">
        {report.ArtifactName}
      </p>
      {report.Metadata?.OS && (
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
          {report.Metadata.OS.Family} {report.Metadata.OS.Name}
        </p>
      )}
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">{formattedDate}</p>

      {allVulnerabilities.length > 0 ? (
        <>
          <SeverityCounters vulnerabilities={normalizedForCounters as never} />
          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6 mt-10">
            Vulnerability Details
          </h2>
          <ContainerVulnerabilityTable vulnerabilities={allVulnerabilities} />
        </>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300 text-xl">
          <p>No vulnerabilities found in this scan.</p>
        </div>
      )}
    </>
  );
}