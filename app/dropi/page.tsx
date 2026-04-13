import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { Globe, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const paises = ["Colombia", "México", "Perú", "Chile", "Argentina", "España", "Portugal", "Ecuador", "Venezuela", "Bolivia"];

export default function DropiPage() {
  return (
    <>
      <Nav />
      <main className="pt-28 min-h-[100dvh]">
        <section className="px-4 py-20 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-[#0A0A0A]/40 mb-4">Comunidad Dropi</p>
            <h1 className="font-[family-name:var(--font-jakarta)] font-extrabold text-5xl md:text-6xl text-[#0A0A0A] leading-tight mb-5">
              Top 10 en LATAM.
            </h1>
            <p className="text-[#0A0A0A]/55 text-lg max-w-lg mx-auto leading-relaxed">
              Más de 800 comunidades en Dropi. Nosotros estamos en el top 10.
              Dropshipping activo, valor real, resultados concretos.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-16">
            {[
              { valor: "Top 10", etiqueta: "de 800+ comunidades" },
              { valor: "LATAM", etiqueta: "+ España y Portugal" },
              { valor: "1:1", etiqueta: "seguimiento por miembro" },
            ].map((s) => (
              <div key={s.etiqueta} className="p-1.5 rounded-[1.5rem] bg-white/50 ring-1 ring-black/6 text-center">
                <div className="p-5 rounded-[calc(1.5rem-6px)] bg-[#FDFBF7] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <p className="font-[family-name:var(--font-jakarta)] font-extrabold text-2xl text-[#0A0A0A] mb-1">{s.valor}</p>
                  <p className="text-xs text-[#0A0A0A]/45">{s.etiqueta}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Países */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Globe size={16} weight="light" className="text-[#0A0A0A]/40" />
              <p className="text-xs tracking-widest uppercase text-[#0A0A0A]/40">Presencia activa</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {paises.map((p) => (
                <span key={p} className="text-sm text-[#0A0A0A]/60 bg-black/5 px-3.5 py-1.5 rounded-full">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a
            href="https://dropi.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#0A0A0A] text-[#FDFBF7] font-medium rounded-full px-7 py-3.5 hover:bg-[#0A0A0A]/85 transition-colors"
          >
            Unirse a la comunidad Dropi
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowUpRight size={12} weight="bold" />
            </span>
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
