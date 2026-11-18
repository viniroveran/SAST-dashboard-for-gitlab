'use client';

import { Search, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import SeverityBadge from '@/app/components/SeverityBadge';
import { SEVERITIES, type Severity } from '@/app/lib/severity';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  selected: Set<Severity>;
  onToggle: (s: Severity) => void;
  onClear: () => void;
  shown: number;
  total: number;
}

export default function ReportToolbar({
  query,
  onQueryChange,
  placeholder,
  selected,
  onToggle,
  onClear,
  shown,
  total,
}: Props) {
  const hasFilters = selected.size > 0 || query.trim() !== '';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="pl-8"
            aria-label="Search vulnerabilities"
          />
        </div>
        {SEVERITIES.filter((s) => selected.has(s)).map((s) => (
          <button key={s} type="button" onClick={() => onToggle(s)} aria-label={`Remove ${s} filter`}>
            <SeverityBadge severity={s} className="cursor-pointer hover:opacity-80" removable />
          </button>
        ))}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onQueryChange('');
              onClear();
            }}
          >
            <X />
            Clear filters
          </Button>
        )}
      </div>
      <p className="text-sm whitespace-nowrap text-muted-foreground">
        Showing <span className="font-medium text-foreground tabular-nums">{shown}</span> of{' '}
        <span className="tabular-nums">{total}</span>
      </p>
    </div>
  );
}
