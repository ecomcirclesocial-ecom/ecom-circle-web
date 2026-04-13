"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Lightning, Globe, Package, ArrowUpRight } from "@phosphor-icons/react";

const productos = [
  {
    href: "/club",
    icon: Users,
    etiqueta: "Membresía",
    nombre: "Ecom Circle Club",
    descripcion: "Educación práctica de ecommerce y dropshipping. Clases, herramientas y una comunidad que te empuja a ser mejor.",
    cta: "Unirse al Club",
    destaca: true,
  },
  {
    href: "/lifestyle",
    icon: Lightning,
    etiqueta: "High Ticket · 1:1",
    nombre: "Ecom Circle Lifestyle",
    descripcion: "Acompañamiento personalizado para escalar tu negocio. Para quienes van en serio.",
    cta: "Aplicar al programa",
    destaca: false,
  },
  {
    href: "/dropi",
    icon: Globe,
    etiqueta: "Comunidad Dropi",
    nombre: "Comunidad en Dropi",
    descripcion: "Top 10 de 800+ comunidades. Dropshipping activo en toda LATAM, España y Portugal.",
    cta: "Unirse a la comunidad",
    destaca: false,
  },
  {
    href: "#",
    icon: Package,
    etiqueta: "Proveedor",
    nombre: "Bodega Dropster",
    descripcion: "Importamos desde China y vendemos en Colombia a través de Dropi.co. Productos reales, entregas reales.",
    cta: "Conocer más",
    destaca: false,
  },
];

export function Products() {
  return (
    <section id="comunidades" className="px-4 py-24 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="mb-14"
      >
        <p className="text-xs tracking-widest uppercase text-white/30 mb-3">El ecosistema</p>
        <h2 className="font-[family-name:var(--font-jakarta)] font-bold text-3xl md:text-4xl text-white leading-tight max-w-sm">
          Cuatro formas de crecer <span className="text-[#FF5911]">con nosotros.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {productos.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.nombre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <Link
                href={p.href}
                className={`group block h-full p-[1px] rounded-[2rem] transition-all duration-200 hover:-translate-y-1 ${
                  p.destaca
                    ? "bg-gradient-to-br from-[#FF5911] to-[#FF5911]/40"
                    : "bg-white/8 hover:bg-white/12"
                }`}
              >
                <div className={`h-full p-6 rounded-[calc(2rem-1px)] flex flex-col gap-5 ${
                  p.destaca ? "bg-[#0F0F0F]" : "bg-[#0F0F0F]"
                }`}>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      p.destaca ? "bg-[#FF5911]/15" : "bg-white/6"
                    }`}>
                      <Icon size={18} weight="light" className={p.destaca ? "text-[#FF5911]" : "text-white/50"} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full bg-white/6 text-white/35">
                      {p.etiqueta}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-white leading-tight">
                      {p.nombre}
                    </h3>
                    <p className="text-sm text-white/45 leading-relaxed">{p.descripcion}</p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium transition-colors ${
                      p.destaca ? "text-[#FF5911] group-hover:text-[#FF5911]" : "text-white/50 group-hover:text-white"
                    }`}>
                      {p.cta}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/6 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200">
                      <ArrowUpRight size={12} weight="bold" className="text-white/40" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
