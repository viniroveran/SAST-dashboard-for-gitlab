'use client';

import { useState } from 'react';
import { TableCell } from '@/app/components/ui/table';
import { ClickableRow, ExplorerTable } from '@/app/components/ExplorerTable';
import ExternalLink from '@/app/components/ExternalLink';
import ReportToolbar from '@/app/components/ReportToolbar';
import SeverityBadge from '@/app/components/SeverityBadge';
import SeverityCounters from '@/app/components/SeverityCounters';
import { VulnerabilityDetailsModal } from '@/app/components/VulnerabilityDetailsModal';
import { useVulnerabilityFilter } from '@/app/hooks/useVulnerabilityFilter';
import { normalizeSeverity } from '@/app/lib/severity';
import type { Vulnerability } from '@/app/types/vulnerability';
import { buildOwaspUrl } from '@/app/utils/vulnerabilityUtils';

const getSeverity = (v: Vulnerability) => normalizeSeverity(v.severity);
const getSearchText = (v: Vulnerability) =>
  [
    v.name,
    v.category,
    v.cve,
    v.location?.file,
    ...(v.identifiers ?? []).flatMap((id) => [id.name, id.value]),
  ].join(' ');

const COLUMNS = [
  { label: 'Severity', className: 'w-28' },
  { label: 'Name' },
  { label: 'File' },
  { label: 'Line', className: 'w-16' },
  { label: 'CWE / OWASP' },
];

// GitLab-format report (SAST or Secret Detection): severity cards act as filters for the table below.
export default function SastReportExplorer({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const { counts, filtered, total, selected, toggle, clear, query, setQuery } = useVulnerabilityFilter(
    vulnerabilities,
    getSeverity,
    getSearchText,
  );
  const [open, setOpen] = useState<Vulnerability | null>(null);

  return (
    <div className="space-y-6">
      <SeverityCounters counts={counts} selected={selected} onToggle={toggle} />
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search name, file, CWE…"
        selected={selected}
        onToggle={toggle}
        onClear={clear}
        shown={filtered.length}
        total={total}
      />
      <ExplorerTable columns={COLUMNS} empty={filtered.length === 0}>
        {filtered.map(({ item: v, key, severity }) => {
          const cwe = v.identifiers?.find((id) => id.type === 'cwe');
          const owasp = v.identifiers?.find((id) => id.type === 'owasp');
          const owaspUrl = owasp ? buildOwaspUrl(owasp) : undefined;
          return (
            <ClickableRow key={v.id ?? key} onOpen={() => setOpen(v)}>
              <TableCell>
                <SeverityBadge severity={severity} />
              </TableCell>
              <TableCell className="min-w-64 font-medium whitespace-normal">{v.name}</TableCell>
              <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground" title={v.location?.file}>
                {v.location?.file}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                {v.location?.start_line}
              </TableCell>
              <TableCell className="text-xs">
                <div className="flex flex-col gap-0.5">
                  {cwe && (cwe.url ? <ExternalLink href={cwe.url}>{cwe.name}</ExternalLink> : <span>{cwe.name}</span>)}
                  {owasp &&
                    (owaspUrl ? <ExternalLink href={owaspUrl}>{owasp.name}</ExternalLink> : <span>{owasp.name}</span>)}
                </div>
              </TableCell>
            </ClickableRow>
          );
        })}
      </ExplorerTable>
      <VulnerabilityDetailsModal vulnerability={open} onClose={() => setOpen(null)} />
    </div>
  );
}
