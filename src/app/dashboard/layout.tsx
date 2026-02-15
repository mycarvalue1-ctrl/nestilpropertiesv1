import { DashboardNav } from '@/components/dashboard-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="md:w-1/4 lg:w-1/5">
          <DashboardNav />
        </aside>
        <main className="flex-1 w-full overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
