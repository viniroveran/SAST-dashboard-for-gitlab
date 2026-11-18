import { format } from 'date-fns';

import SeverityCounters from '@/app/components/SeverityCounters';
import VulnerabilityTable from '@/app/components/VulnerabilityTable';
import type { StoredReport } from '@/app/lib/store';
import type { SastReport } from '@/app/types/vulnerability';

// A GitLab-format report (SAST or Secret Detection — same shape), or its "not found" notice.
export default function SastReportView({
  entry,
  id,
  label,
}: {
  entry: StoredReport<SastReport> | null;
  id: string;
  label: string;
}) {
  if (!entry) {
    return (
      <div className="p-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg shadow-md text-center text-xl">
        <p>{label} with ID &quot;{id}&quot; not found.</p>
      </div>
    );
  }

  const vulnerabilities = entry.data.vulnerabilities ?? [];
  const formattedDate = format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss');

  return (
    <>
      <title>{`${label}: ${entry.repoName} - ${formattedDate}`}</title>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        {entry.repoName} - {formattedDate}
      </h1>

      {vulnerabilities.length > 0 ? (
        <>
          <SeverityCounters vulnerabilities={vulnerabilities} />

          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6 mt-10">
            Vulnerability Details
          </h2>
          <VulnerabilityTable vulnerabilities={vulnerabilities} />
        </>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300 text-xl">
          <p>No vulnerabilities found in this report.</p>
        </div>
      )}
    </>
  );
}
