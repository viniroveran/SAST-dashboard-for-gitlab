import SastReportView from '@/app/components/SastReportView';
import { getReport } from '@/app/lib/store';
import type { SastReport } from '@/app/types/vulnerability';

export default async function SecretDetectionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getReport<SastReport>('secret', id);

  return <SastReportView entry={entry} id={id} label="Secret Detection Report" />;
}
