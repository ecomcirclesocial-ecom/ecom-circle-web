"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const pasos = [
  {
    num: "01",
    titulo: "Ingresa al link oficial",
    desc: "Accede a la herramienta oficial de Dropi para solicitar tu cambio de comunidad.",
  },
  {
    num: "02",
    titulo: "Completa con tu correo de Dropi",
    desc: "Usa el correo vinculado a tu usuario en Dropi. Es vital para que el cambio se refleje.",
  },
  {
    num: "03",
    titulo: "Selecciona ECOM CIRCLE",
    desc: "Asegúrate de que la comunidad de destino diga exactamente ECOM CIRCLE.",
  },
  {
    num: "04",
    titulo: "Envía y espera 24 horas",
    desc: "Una vez enviado, en menos de 24 horas serás parte de la comunidad VIP.",
  },
];

const LINK_DROPI =
  "https://script.google.com/a/macros/dropi.co/s/AKfycbywbfC2qvHoXEZNrYoyjI9JlZlN1fxL4Ne_mUSpeSsUxitOkM4sypu1okNN1pvFhGe1bA/exec";

export function FormSection() {
  return (
    <section id="unirse" className="px-4 py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease }}
        className="mb-12 text-center"
      >
        <p className="text-xs tracking-widest uppercase text-white/25 mb-3">Únete a VIP</p>
        <h2 className="font-black text-3xl md:text-4xl text-white leading-tight mb-3">
          Haz esto y únete a VIP{" "}
          <span className="text-[#FF5911]">de inmediato.</span>
        </h2>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          Sigue estos pasos y en menos de 24 horas serás parte de la comunidad VIP de Ecom Circle.
        </p>
      </motion.div>

      {/* Placeholder de video */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease }}
        className="mb-10 rounded-2xl overflow-hidden border border-white/8 bg-white/4 aspect-video flex items-center justify-center"
      >
        <p className="text-white/20 text-sm">Video próximamente</p>
      </motion.div>

      {/* Pasos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1, ease }}
        className="flex flex-col gap-3 mb-8"
      >
        {pasos.map((p) => (
          <div
            key={p.num}
            className="flex gap-4 items-start p-4 rounded-2xl bg-white/4 border border-white/8"
          >
            <span className="text-[#FF5911] font-bold text-xs pt-0.5 shrink-0">{p.num}</span>
            <div>
              <p className="text-white font-semibold text-sm mb-0.5">{p.titulo}</p>
              <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.a
        href={LINK_DROPI}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        className="group flex items-center justify-center gap-3 w-full bg-[#FF5911] text-white font-bold rounded-full py-4 hover:bg-[#FF5911]/85 transition-all duration-200 active:scale-[0.98] text-sm"
      >
        Acceder al formulario oficial
        <span className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
          <ArrowRight size={12} weight="bold" />
        </span>
      </motion.a>
    </section>
  );
}
