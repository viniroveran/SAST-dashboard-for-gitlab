import {
  CircleAlert,
  Info,
  type LucideIcon,
  OctagonAlert,
  ShieldQuestion,
  TriangleAlert,
  ShieldAlert,
} from 'lucide-react';

// Highest first: this order drives the counter cards and the default table sort.
export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Info', 'Unknown'] as const;
export type Severity = (typeof SEVERITIES)[number];

const BY_LOWER: Record<string, Severity> = Object.fromEntries(
  SEVERITIES.map((s) => [s.toLowerCase(), s]),
);
// Trivy's "NEGLIGIBLE" (some distros) is informational.
BY_LOWER.negligible = 'Info';

// GitLab reports use "Critical", Trivy "CRITICAL"; anything unrecognised is "Unknown".
export function normalizeSeverity(raw: string | null | undefined): Severity {
  return BY_LOWER[(raw ?? '').trim().toLowerCase()] ?? 'Unknown';
}

export function severityRank(s: Severity): number {
  return SEVERITIES.indexOf(s);
}

export function countBySeverity<T>(items: T[], getSeverity: (item: T) => Severity) {
  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<Severity, number>;
  for (const item of items) counts[getSeverity(item)]++;
  return counts;
}

interface SeverityStyle {
  icon: LucideIcon;
  /** Solid badge (table cells, dialogs). */
  badge: string;
  /** Icon / number accent and selected ring on the counter cards. */
  text: string;
  ring: string;
  tint: string;
}

// Literal class strings so Tailwind picks them up.
export const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
  Critical: {
    icon: OctagonAlert,
    badge: 'bg-sev-critical/15 text-sev-critical border-sev-critical/30',
    text: 'text-sev-critical',
    ring: 'ring-sev-critical',
    tint: 'bg-sev-critical/10',
  },
  High: {
    icon: TriangleAlert,
    badge: 'bg-sev-high/15 text-sev-high border-sev-high/30',
    text: 'text-sev-high',
    ring: 'ring-sev-high',
    tint: 'bg-sev-high/10',
  },
  Medium: {
    icon: CircleAlert,
    badge: 'bg-sev-medium/15 text-sev-medium border-sev-medium/30',
    text: 'text-sev-medium',
    ring: 'ring-sev-medium',
    tint: 'bg-sev-medium/10',
  },
  Low: {
    icon: ShieldAlert,
    badge: 'bg-sev-low/15 text-sev-low border-sev-low/30',
    text: 'text-sev-low',
    ring: 'ring-sev-low',
    tint: 'bg-sev-low/10',
  },
  Info: {
    icon: Info,
    badge: 'bg-sev-info/15 text-sev-info border-sev-info/30',
    text: 'text-sev-info',
    ring: 'ring-sev-info',
    tint: 'bg-sev-info/10',
  },
  Unknown: {
    icon: ShieldQuestion,
    badge: 'bg-sev-unknown/15 text-sev-unknown border-sev-unknown/30',
    text: 'text-sev-unknown',
    ring: 'ring-sev-unknown',
    tint: 'bg-sev-unknown/10',
  },
};
