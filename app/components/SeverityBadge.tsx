import { X } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/lib/utils';
import { SEVERITY_STYLES, type Severity } from '@/app/lib/severity';

export default function SeverityBadge({
  severity,
  className,
  removable,
}: {
  severity: Severity;
  className?: string;
  removable?: boolean;
}) {
  const { icon: Icon, badge } = SEVERITY_STYLES[severity];
  return (
    <Badge variant="outline" className={cn('gap-1 font-semibold', badge, className)}>
      <Icon className="size-3" />
      {severity}
      {removable && <X className="size-3 opacity-70" />}
    </Badge>
  );
}
