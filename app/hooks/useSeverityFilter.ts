'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { normalizeSeverity, SEVERITIES, type Severity } from '@/app/lib/severity';

const PARAM = 'severity';

function parse(raw: string | null): Set<Severity> {
  const set = new Set<Severity>();
  for (const part of (raw ?? '').split(',')) {
    if (part.trim()) set.add(normalizeSeverity(part));
  }
  return set;
}

// Selected severity levels, kept in the URL (`?severity=critical,high`) so a filtered view can be shared.
// An empty selection means "no filter".
//
// Writes go through the native History API, which Next syncs into useSearchParams without a server
// round-trip: router.replace would re-render the report page and re-send the whole report on every click.
// Each update starts from the live URL rather than the last render, so rapid clicks don't act on stale state.
export function useSeverityFilter() {
  const raw = useSearchParams().get(PARAM);
  const selected = useMemo(() => parse(raw), [raw]);

  const update = useCallback((change: (current: Set<Severity>) => Set<Severity>) => {
    const url = new URL(window.location.href);
    const next = change(parse(url.searchParams.get(PARAM)));
    const value = SEVERITIES.filter((s) => next.has(s))
      .map((s) => s.toLowerCase())
      .join(',');
    if (value) url.searchParams.set(PARAM, value);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(null, '', url);
  }, []);

  const toggle = useCallback(
    (s: Severity) =>
      update((current) => {
        if (current.has(s)) current.delete(s);
        else current.add(s);
        return current;
      }),
    [update],
  );

  const clear = useCallback(() => update(() => new Set()), [update]);

  return { selected, toggle, clear };
}
