"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/painel", label: "Dashboard" },
  { href: "/painel/clientes", label: "Clientes" },
  { href: "/painel/novo-diagnostico", label: "Novo" },
  { href: "/painel/diagnosticos", label: "Diagnósticos" },
  { href: "/painel/link", label: "Meu Link" },
  { href: "/painel/pacotes", label: "Pacotes" },
  { href: "/painel/configuracoes", label: "Ajustes" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-graphite/10 bg-white/70 px-4 py-3 md:hidden">
      {items.map(({ href, label }) => {
        const active =
          href === "/painel" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium",
              active ? "bg-ink text-ivory" : "bg-ivory-deep text-graphite/70"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
