"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  ClipboardList,
  Link2,
  Package,
  Settings,
  LogOut,
} from "lucide-react";

const items = [
  { href: "/painel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/painel/clientes", label: "Clientes", icon: Users },
  { href: "/painel/novo-diagnostico", label: "Novo Diagnóstico", icon: Sparkles },
  { href: "/painel/diagnosticos", label: "Diagnósticos", icon: ClipboardList },
  { href: "/painel/link", label: "Meu Link", icon: Link2 },
  { href: "/painel/pacotes", label: "Pacotes", icon: Package },
  { href: "/painel/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ professionalName }: { professionalName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-graphite/10 bg-white/60 px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <p className="font-display text-lg italic text-ink">Beauty DNA</p>
        <p className="text-xs text-graphite/60">{professionalName}</p>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/painel" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-ink text-ivory"
                  : "text-graphite/80 hover:bg-ivory-deep"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-graphite/60 transition hover:bg-ivory-deep"
        >
          <LogOut size={17} />
          Sair
        </button>
      </form>
    </aside>
  );
}
