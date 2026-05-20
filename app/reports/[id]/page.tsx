import Head from 'next/head';
import db, { initializeDb } from '@/app/lib/db';
import SeverityCounters from '@/app/components/SeverityCounters';
import VulnerabilityTable from '@/app/components/VulnerabilityTable';
import { SastReport } from '@/app/types/vulnerability';
import { format } from 'date-fns';

interface ReportPageProps {
  params: { id: string };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  await initializeDb();
  await db.read();

  const reportEntry = db.data.reports.find((r) => r.id === id);

  if (!reportEntry) {
    return (
      <>
        <Head>
          <title>Report Not Found</title>
        </Head>
        <div className="p-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg shadow-md text-center text-xl">
          <p>Report with ID "{id}" not found.</p>
        </div>
      </>
    );
  }

  const report: SastReport = reportEntry.data;
  const repoName = reportEntry.repoName;
  const creationDate = new Date(reportEntry.timestamp);
  const formattedDate = format(creationDate, 'yyyy-MM-dd HH:mm:ss');

  return (
    <>
      <Head>
        <title>SAST Report: {repoName} - {formattedDate}</title>
        <meta name="description" content={`SAST Report for ${repoName} - ${formattedDate}`} />
      </Head>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        {repoName} - {formattedDate}
      </h1>

      {report.vulnerabilities.length > 0 && (
        <>
          <SeverityCounters vulnerabilities={report.vulnerabilities} />

          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6 mt-10">
            Vulnerability Details
          </h2>
          <VulnerabilityTable vulnerabilities={report.vulnerabilities} />
        </>
      )}

      {report.vulnerabilities.length === 0 && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300 text-xl">
          <p>No vulnerabilities found in this report.</p>
        </div>
      )}
    </>
  );
}