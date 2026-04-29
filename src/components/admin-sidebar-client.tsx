"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, CalendarCheck2, ClipboardList, KeyRound, LayoutDashboard, Settings2, Users } from "lucide-react";
import Image from "next/image";

const items = [
  { href: "/admin", label: "Inscrições", icon: ClipboardList },
  { href: "/admin/turmas", label: "Turmas", icon: LayoutDashboard },
  { href: "/admin/alunos", label: "Alunos", icon: Users },
  { href: "/admin/notas", label: "Notas e Atividades", icon: BookOpen },
  { href: "/admin/chamadas", label: "Chamada e Roteiro", icon: CalendarCheck2 },
  { href: "/admin/comunicados", label: "Comunicados", icon: Bell },
  { href: "/admin/credenciais", label: "Credenciais", icon: KeyRound },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings2 },
];

export function AdminSidebarClient() {
  const pathname = usePathname();

  return (
    <aside className="liquid-panel fade-up sticky top-4 h-fit rounded-3xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-cyan-400/30">
          <Image src="/logo.png" alt="Visão Nobre" fill className="object-cover" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Painel Admin</h2>
          <p className="text-xs text-slate-400">Gestão rápida do projeto</p>
        </div>
      </div>
      <nav className="space-y-2 text-sm">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                active
                  ? "bg-cyan-400 text-[#0a1628] font-bold shadow-[0_8px_30px_rgba(0,212,255,0.3)]"
                  : "bg-white/5 text-slate-200 hover:bg-white/15 hover:translate-x-1"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
