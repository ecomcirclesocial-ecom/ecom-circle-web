"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChatCircle, X, WhatsappLogo } from "@phosphor-icons/react";

export function ToolsHelpWidget() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  if (!pathname.startsWith("/tools")) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {abierto && (
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-5 w-72 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="text-xs tracking-widest uppercase text-[#FF5911]">Soporte</p>
            <button
              onClick={() => setAbierto(false)}
              className="text-white/30 hover:text-white/60 transition mt-0.5"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            ¿Tienes algún error o no sabes cómo usar la herramienta? Escríbenos y te ayudamos.
          </p>
          <a
            href="https://wa.me/573116055251"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#FF5911] hover:bg-[#FF5911]/85 active:scale-95 text-white text-sm font-semibold rounded-xl py-3 transition"
          >
            <WhatsappLogo size={17} weight="fill" />
            Escribir por WhatsApp
          </a>
        </div>
      )}

      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 bg-[#FF5911] hover:bg-[#FF5911]/85 active:scale-95 text-white text-sm font-semibold rounded-full px-4 py-3 shadow-[0_4px_20px_rgba(255,89,17,0.35)] transition"
      >
        <ChatCircle size={18} weight="fill" />
        {!abierto && "¿Necesitas ayuda?"}
      </button>
    </div>
  );
}
