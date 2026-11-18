'use client';

import type { ReactNode } from 'react';
import { SearchX } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

// Card-wrapped table with a header row and a "nothing matches" row when filters hide everything.
export function ExplorerTable({
  columns,
  empty,
  children,
}: {
  columns: { label: string; className?: string }[];
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.label} className={`px-4 text-xs text-muted-foreground uppercase ${c.className ?? ''}`}>
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {empty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                <SearchX className="mx-auto mb-2 size-6" />
                No vulnerabilities match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// Row that opens the details dialog on click or Enter/Space.
export function ClickableRow({ onOpen, children }: { onOpen: () => void; children: ReactNode }) {
  return (
    <TableRow
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none [&>td]:px-4 [&>td]:py-3"
    >
      {children}
    </TableRow>
  );
}
