import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';

export default function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
        <Icon className="size-8" />
        <div className="text-lg">{children}</div>
      </CardContent>
    </Card>
  );
}
