import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[300px_1fr]">
      <AdminSidebar />
      <main className="min-w-0 space-y-4 fade-up">
        <header className="liquid-panel rounded-3xl px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/90">Admin Master</p>
          <h1 className="text-2xl font-black text-white">Visão Nobre Control Center</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
