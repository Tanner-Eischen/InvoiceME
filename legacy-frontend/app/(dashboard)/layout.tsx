import { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { UserAccountNav } from '@/components/dashboard/user-account-nav';
import { ModeToggle } from '@/components/dashboard/mode-toggle';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4 md:gap-2">
            <span className="text-xl font-bold tracking-tight">Invoicing System</span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserAccountNav />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
