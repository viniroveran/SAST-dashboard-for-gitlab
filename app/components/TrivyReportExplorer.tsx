'use client';

import { useState } from 'react';
import { TableCell } from '@/app/components/ui/table';
import { ClickableRow, ExplorerTable } from '@/app/components/ExplorerTable';
import ExternalLink from '@/app/components/ExternalLink';
import ReportToolbar from '@/app/components/ReportToolbar';
import SeverityBadge from '@/app/components/SeverityBadge';
import SeverityCounters from '@/app/components/SeverityCounters';
import TrivyVulnerabilityDialog, { type AnyTrivyVulnerability } from '@/app/components/TrivyVulnerabilityDialog';
import { useVulnerabilityFilter } from '@/app/hooks/useVulnerabilityFilter';
import { normalizeSeverity } from '@/app/lib/severity';

const getSeverity = (v: AnyTrivyVulnerability) => normalizeSeverity(v.Severity);
const getSearchText = (v: AnyTrivyVulnerability) =>
  [v.VulnerabilityID, v.PkgName, v.Title, v.InstalledVersion, v.FixedVersion, 'PkgPath' in v ? v.PkgPath : '']
    .filter(Boolean)
    .join(' ');

const BASE_COLUMNS = [
  { label: 'Severity', className: 'w-28' },
  { label: 'CVE / ID' },
  { label: 'Package' },
  { label: 'Installed' },
  { label: 'Fixed in' },
];

// Trivy report: `dependency` (trivy fs) or `container` (trivy image, adds the package location column).
export default function TrivyReportExplorer({
  vulnerabilities,
  variant,
}: {
  vulnerabilities: AnyTrivyVulnerability[];
  variant: 'dependency' | 'container';
}) {
  const { counts, filtered, total, selected, toggle, clear, query, setQuery } = useVulnerabilityFilter(
    vulnerabilities,
    getSeverity,
    getSearchText,
  );
  const [open, setOpen] = useState<AnyTrivyVulnerability | null>(null);
  const showLocation = variant === 'container';
  const columns = showLocation ? [...BASE_COLUMNS, { label: 'Location' }] : BASE_COLUMNS;

  return (
    <div className="space-y-6">
      <SeverityCounters counts={counts} selected={selected} onToggle={toggle} />
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search CVE, package, title…"
        selected={selected}
        onToggle={toggle}
        onClear={clear}
        shown={filtered.length}
        total={total}
      />
      <ExplorerTable columns={columns} empty={filtered.length === 0}>
        {filtered.map(({ item: v, key, severity }) => (
          <ClickableRow key={key} onOpen={() => setOpen(v)}>
            <TableCell>
              <SeverityBadge severity={severity} />
            </TableCell>
            <TableCell className="font-mono text-xs">
              {v.PrimaryURL ? <ExternalLink href={v.PrimaryURL}>{v.VulnerabilityID}</ExternalLink> : v.VulnerabilityID}
            </TableCell>
            <TableCell className="max-w-xs whitespace-normal">
              <div className="font-medium">{v.PkgName}</div>
              {v.Title && <div className="line-clamp-1 text-xs text-muted-foreground">{v.Title}</div>}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{v.InstalledVersion}</TableCell>
            <TableCell className="font-mono text-xs">
              {v.FixedVersion ? (
                <span className="text-emerald-600 dark:text-emerald-400">{v.FixedVersion}</span>
              ) : (
                <span className="text-muted-foreground italic">none</span>
              )}
            </TableCell>
            {showLocation && (
              <TableCell
                className="max-w-xs truncate font-mono text-xs text-muted-foreground"
                title={'PkgPath' in v ? v.PkgPath : undefined}
              >
                {('PkgPath' in v && v.PkgPath) || '—'}
              </TableCell>
            )}
          </ClickableRow>
        ))}
      </ExplorerTable>
      <TrivyVulnerabilityDialog vulnerability={open} onClose={() => setOpen(null)} />
    </div>
  );
}
