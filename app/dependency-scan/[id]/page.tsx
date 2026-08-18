import Head from 'next/head';
import db, { initializeDb } from '@/app/lib/db';
import SeverityCounters from '@/app/components/SeverityCounters';
import DependencyVulnerabilityTable from '@/app/components/DependencyVulnerabilityTable';
import { TrivyVulnerability } from '@/app/types/trivy';
import { format } from 'date-fns';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface Props {
  params: { id: string };
}

export default async function DependencyScanPage({ params }: Props) {
  const { id } = await params;

  await initializeDb();
  await db.read();

  const reportEntry = db.data.trivyReports.find((r) => r.id === id);

  if (!reportEntry) {
    return (
      <>
        <Head><title>Report Not Found</title></Head>
        <div className="p-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg shadow-md text-center text-xl">
          <p>Dependency scan report with ID "{id}" not found.</p>
        </div>
      </>
    );
  }

  const report = reportEntry.data;
  const formattedDate = format(new Date(reportEntry.timestamp), 'yyyy-MM-dd HH:mm:ss');

  const allVulnerabilities: TrivyVulnerability[] = report.Results.flatMap(
    (result) => result.Vulnerabilities ?? [],
  );

  const normalizedForCounters = allVulnerabilities.map((v) => ({
    severity: v.Severity.charAt(0).toUpperCase() + v.Severity.slice(1).toLowerCase(),
  }));

  return (
    <>
      <Head>
        <title>Dependency Scan: {reportEntry.repoName} - {formattedDate}</title>
      </Head>

      <h1 className="text-4xl font-bold text-gray-700 dark:text-gray-100 mb-8 text-center">
        {reportEntry.repoName} - {formattedDate}
      </h1>

      {allVulnerabilities.length > 0 ? (
        <>
          <SeverityCounters vulnerabilities={normalizedForCounters as any} />
          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6 mt-10">
            Dependency Vulnerabilities
          </h2>
          <DependencyVulnerabilityTable vulnerabilities={allVulnerabilities} />
        </>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300 text-xl">
          <p>No vulnerabilities found in this scan.</p>
        </div>
      )}
    </>
  );
}