import type { ReactNode } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { CalendarClock, Hourglass } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

// Title block of a report page: kind, repository, scan date, expiry and optional extra metadata.
export default function ReportHeader({
  kind,
  repoName,
  date,
  expiresAt,
  children,
}: {
  kind: string;
  repoName: string;
  date: string;
  expiresAt: Date;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 space-y-2">
      <Badge variant="secondary">{kind}</Badge>
      <h1 className="text-3xl font-bold tracking-tight break-all">{repoName}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-4" />
          {date}
        </span>
        <span className="flex items-center gap-1.5" title={expiresAt.toISOString()}>
          <Hourglass className="size-4" />
          Deleted in {formatDistanceToNowStrict(expiresAt)}
        </span>
        {children}
      </div>
    </div>
  );
}
