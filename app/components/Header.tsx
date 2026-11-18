'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher';
import { cn } from '@/app/lib/utils';

const NAV = [
  { href: '/', label: 'Upload' },
  { href: '/container-scan', label: 'Container Scans' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-5 text-sev-low" />
          <span className="hidden sm:inline">Vulnerabilities Dashboard</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground',
                  active ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
