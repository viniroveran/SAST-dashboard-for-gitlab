import type { ReactNode } from 'react';
import { cn } from '@/app/lib/utils';

// Stops propagation so a link inside a clickable table row doesn't also open the details dialog.
export default function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn('text-sev-low underline-offset-4 hover:underline', className)}
    >
      {children}
    </a>
  );
}
