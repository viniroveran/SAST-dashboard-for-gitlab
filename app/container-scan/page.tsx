import Link from 'next/link';
import { format } from 'date-fns';
import db, { initializeDb } from '@/app/lib/db';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ContainerScansPage() {
  await initializeDb();
  await db.read();

  const reports = [...(db.data?.containerScanReports ?? [])]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Container Scan Reports
      </h1>

      {reports.length === 0 ? (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300 text-xl">
          <p>No container scan reports found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white dark:bg-gray-800 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Repository</th>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Vulnerabilities</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => {
              const totalVulns = report.data.Results.reduce(
                (sum, r) => sum + (r.Vulnerabilities?.length ?? 0), 0
              );
              return (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {report.repoName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                    {report.data.ArtifactName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {format(new Date(report.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        totalVulns === 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {totalVulns} found
                      </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/container-scans/${report.id}`}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}