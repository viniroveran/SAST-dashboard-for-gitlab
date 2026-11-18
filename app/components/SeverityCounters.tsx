'use client';

import { Card } from '@/app/components/ui/card';
import { cn } from '@/app/lib/utils';
import { SEVERITIES, SEVERITY_STYLES, type Severity } from '@/app/lib/severity';

interface Props {
  counts: Record<Severity, number>;
  selected: Set<Severity>;
  onToggle: (severity: Severity) => void;
}

// One card per level; clicking toggles that level in the table filter (multi-select).
export default function SeverityCounters({ counts, selected, onToggle }: Props) {
  // "Unknown" only shows up when the report actually has some, so those rows stay reachable.
  const levels = SEVERITIES.filter((s) => s !== 'Unknown' || counts.Unknown > 0);
  const filtering = selected.size > 0;

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3',
        levels.length > 5 ? 'lg:grid-cols-6' : 'lg:grid-cols-5',
      )}
      role="group"
      aria-label="Filter by severity"
    >
      {levels.map((severity) => {
        const { icon: Icon, text, ring, tint } = SEVERITY_STYLES[severity];
        const active = selected.has(severity);
        const count = counts[severity];
        return (
          <button
            key={severity}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(severity)}
            className="group rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card
              className={cn(
                'gap-3 px-5 py-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md',
                active && ['ring-2', ring, tint],
                filtering && !active && 'opacity-50 group-hover:opacity-80',
                count === 0 && !active && 'opacity-60',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{severity}</span>
                <span className={cn('rounded-md p-1.5', tint)}>
                  <Icon className={cn('size-4', text)} />
                </span>
              </div>
              <span className={cn('text-3xl font-bold tabular-nums', count > 0 ? text : 'text-muted-foreground')}>
                {count}
              </span>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
