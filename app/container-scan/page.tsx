import Link from 'next/link';
import { format } from 'date-fns';
import { listReports } from '@/app/lib/store';

// Read on every request: prerendered at build time it would freeze the build's (empty) data dir.
export const dynamic = 'force-dynamic';

export default async function ContainerScansPage() {
  // The index only (newest first): no report file is read to build the list.
  const reports = await listReports('container');

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
              const totalVulns = report.summary.total;
              return (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {report.repoName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                    {report.summary.artifactName ?? '—'}
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
                      href={`/container-scan/${report.id}`}
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