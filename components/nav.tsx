"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";

const links = [
  { href: "/#comunidad", label: "Comunidad" },
  { href: "/#beneficios", label: "Beneficios" },
  { href: "/#sobre-nain", label: "Sobre Nain" },
  { href: "/#testimonios", label: "Testimonios" },
  { href: "/tools", label: "Herramientas" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-5">
      <nav className="w-full max-w-5xl flex items-center justify-between px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/8 shadow-[0_1px_30px_rgba(0,0,0,0.4)]">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Ecom Circle by Nain" width={120} height={40} className="h-9 w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors duration-200">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href="/#unirse"
          className="hidden md:flex items-center gap-2 bg-[#FF5911] text-white text-sm font-semibold rounded-full px-5 py-2 hover:bg-[#FF5911]/85 transition-all duration-200 active:scale-95"
        >
          Unirse ahora
          <span className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center text-xs">↗</span>
        </a>

        <button className="md:hidden p-2 rounded-full hover:bg-white/5 text-white/70" onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <List size={18} />}
        </button>
      </nav>

      {open && (
        <div className="absolute top-full mt-2 inset-x-4 rounded-2xl bg-[#111] border border-white/8 shadow-2xl p-5 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-white/60 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          <a href="/#unirse" onClick={() => setOpen(false)} className="mt-1 w-full text-center bg-[#FF5911] text-white text-sm font-semibold rounded-full px-5 py-2.5">
            Unirse ahora ↗
          </a>
        </div>
      )}
    </header>
  );
}
