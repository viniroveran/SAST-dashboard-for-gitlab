import { format } from 'date-fns';
import { FileQuestion, ShieldCheck } from 'lucide-react';

import EmptyState from '@/app/components/EmptyState';
import ReportHeader from '@/app/components/ReportHeader';
import SastReportExplorer from '@/app/components/SastReportExplorer';
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
      <EmptyState icon={FileQuestion}>
        {label} with ID &quot;{id}&quot; not found.
      </EmptyState>
    );
  }

  const vulnerabilities = entry.data.vulnerabilities ?? [];
  const formattedDate = format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss');

  return (
    <>
      <title>{`${label}: ${entry.repoName} - ${formattedDate}`}</title>
      <ReportHeader kind={label} repoName={entry.repoName} date={formattedDate} />

      {vulnerabilities.length > 0 ? (
        <SastReportExplorer vulnerabilities={vulnerabilities} />
      ) : (
        <EmptyState icon={ShieldCheck}>No vulnerabilities found in this report.</EmptyState>
      )}
    </>
  );
}
