import { Nav } from "@/components/nav";
import { PromptBuilder } from "@/components/tools/prompt-builder";

export default function PromptBuilderPage() {
  return (
    <div className="min-h-[100dvh] bg-[#080808] relative overflow-hidden">
      {/* Glow naranja central */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[700px] h-[500px] rounded-full bg-[#FF5911]/10 blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#FF5911]/6 blur-[80px]" />

      <Nav />

      <main className="relative z-10 flex flex-col items-center justify-start pt-28 pb-20 px-4">
        {/* Título */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#FF5911]/50 mb-4">Herramienta gratuita · Ecom Circle</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
            Construye tu prompt
            <br />
            <span className="text-white/40 font-normal">de ventas por WhatsApp</span>
          </h1>
          <p className="text-white/30 text-sm mt-4">
            Sube la foto del producto o rellena los campos — genera el sistema completo en segundos.
          </p>
        </div>

        {/* Card central */}
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm p-6 shadow-[0_0_60px_rgba(255,89,17,0.05)]">
            <PromptBuilder />
          </div>
        </div>

        {/* Chips decorativos abajo */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {["🎯 AIDA", "🔥 PAS", "⚡ OBC", "🚀 HOOK→PRECIO", "📸 Desde imagen"].map((c) => (
            <span key={c} className="px-3 py-1.5 rounded-full bg-white/4 border border-white/6 text-xs text-white/30">
              {c}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
