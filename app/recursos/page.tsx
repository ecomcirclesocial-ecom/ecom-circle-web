import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { ArrowUpRight, Robot, Layout } from "@phosphor-icons/react/dist/ssr";

const recursos = [
  {
    href: "/recursos/flujo-landing-pages",
    icon: Layout,
    nombre: "Flujo de landing pages — 9 secciones con Freepik Space",
    descripcion: "Plantilla completa de landing page de 9 secciones lista para usar en Freepik Space. Incluye instrucciones paso a paso y cómo incrustar un video de YouTube.",
    estado: "Disponible",
    featured: true,
  },
  {
    href: "#",
    icon: Robot,
    nombre: "Skill de Claude para Dropi",
    descripcion: "Skill personalizado para Claude que te ayuda a operar tu tienda en Dropi más rápido: fichas, seguimiento y respuestas.",
    estado: "En construcción",
    featured: false,
  },
  {
    href: "#",
    icon: Robot,
    nombre: "Agente de Búsqueda de Producto en AliExpress y Temu",
    descripcion: "Agente de Claude entrenado para encontrar productos ganadores en AliExpress y Temu listos para vender en Dropi.",
    estado: "En construcción",
    featured: false,
  },
];

export default function RecursosPage() {
  return (
    <>
      <Nav />
      <main className="min-h-[100dvh] bg-[#0A0A0A]">
        <section className="pt-32 pb-24 px-4 max-w-5xl mx-auto">

          <div className="mb-12">
            <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-3">Recursos gratuitos</p>
            <h1 className="font-extrabold text-4xl md:text-5xl text-white leading-tight mb-3">
              Para la comunidad.
            </h1>
            <p className="text-white/40 text-base max-w-sm leading-relaxed">
              Recursos, skills y plantillas para escalar tu negocio de dropshipping en LATAM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recursos.map((r) => {
              const Icon = r.icon;
              const disponible = r.estado === "Disponible";
              const cardClass = `group relative overflow-hidden rounded-2xl border border-white/8 bg-[#111111] p-5 flex flex-col gap-5 transition-all duration-300 ${r.featured ? "md:col-span-2" : "md:col-span-1"} ${disponible ? "hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]" : "cursor-not-allowed opacity-60"}`;
              const inner = (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[length:4px_4px]" />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center">
                      <Icon size={17} weight="light" className="text-white/60" />
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-medium ${disponible ? "text-emerald-400" : "text-[#FF5911]"}`}>
                      {r.estado}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 relative z-10 flex-1">
                    <h2 className="font-semibold text-white text-[15px]">{r.nombre}</h2>
                    <p className="text-sm text-white/45 leading-snug">{r.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-sm text-white/35 group-hover:text-white/70 transition-colors">Ver recurso</span>
                    <div className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center group-hover:translate-x-0.5 group-hover:bg-white/14 transition-all">
                      <ArrowUpRight size={11} weight="bold" className="text-white/40" />
                    </div>
                  </div>
                </>
              );
              return disponible ? (
                <Link key={r.nombre} href={r.href} className={cardClass}>{inner}</Link>
              ) : (
                <div key={r.nombre} className={cardClass}>{inner}</div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
