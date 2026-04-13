import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { Wrench, MagicWand, ArrowUpRight, Microscope } from "@phosphor-icons/react/dist/ssr";

const herramientas = [
  {
    href: "/tools/product-researcher",
    icon: Microscope,
    nombre: "Investigación de Producto",
    descripcion: "Análisis de 30 puntos para dropshipping en LATAM — o modo Freepik: investigación, ángulo y branding completo para tu landing.",
    estado: "Disponible",
    featured: true,
  },
  {
    href: "/tools/prompt-builder",
    icon: MagicWand,
    nombre: "Constructor de Prompts",
    descripcion: "Crea prompts optimizados para tus fichas de productos, descripciones y copy de ventas en ecommerce.",
    estado: "Disponible",
    featured: false,
  },
  {
    href: "/tools/product-validator",
    icon: Wrench,
    nombre: "Validador de Productos",
    descripcion: "Evalúa si un producto tiene potencial en dropshipping antes de invertir tiempo y dinero.",
    estado: "En construcción",
    featured: false,
  },
];

export default function ToolsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-[100dvh] bg-[#0A0A0A]">
        <section className="pt-32 pb-24 px-4 max-w-5xl mx-auto">

          {/* Título */}
          <div className="mb-12">
            <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-3">Herramientas gratuitas</p>
            <h1 className="font-extrabold text-4xl md:text-5xl text-white leading-tight mb-3">
              Para la comunidad.
            </h1>
            <p className="text-white/40 text-base max-w-sm leading-relaxed">
              Construidas con IA para acelerar tu negocio de dropshipping en LATAM.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {herramientas.map((h) => {
              const Icon = h.icon;
              const disponible = h.estado === "Disponible";
              return (
                <Link
                  key={h.nombre}
                  href={h.href}
                  className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-[#111111] p-5 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${h.featured ? "md:col-span-2" : "md:col-span-1"}`}
                >
                  {/* Dot pattern */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[length:4px_4px]" />

                  {/* Top row */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center">
                      <Icon size={17} weight="light" className="text-white/60" />
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-medium ${disponible ? "text-emerald-400" : "text-[#FF5911]"}`}>
                      {h.estado}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 relative z-10 flex-1">
                    <h2 className="font-semibold text-white text-[15px]">{h.nombre}</h2>
                    <p className="text-sm text-white/45 leading-snug">{h.descripcion}</p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-sm text-white/35 group-hover:text-white/70 transition-colors">Abrir herramienta</span>
                    <div className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center group-hover:translate-x-0.5 group-hover:bg-white/14 transition-all">
                      <ArrowUpRight size={11} weight="bold" className="text-white/40" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
