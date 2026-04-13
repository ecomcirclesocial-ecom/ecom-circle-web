"use client";

import { motion } from "framer-motion";

const hitos = [
  { edad: "12", texto: "Empezó a trabajar como domiciliario y mesero. Siempre con más ganas que el resto." },
  { edad: "15", texto: "Le dijo no al estudio para ir a hacer dinero. Lo reconoce como un error de rebeldía." },
  { edad: "17", texto: "Pandemia. Sin trabajo, sin bachiller. Empezó a estudiar ecommerce día y noche." },
  { edad: "18", texto: "Primer año en ecommerce: más de $2.000 USD al mes. La mentalidad aún no estaba lista." },
  { edad: "Hoy", texto: "Fundador de Ecom Circle. Fe sólida, hábitos claros, comunidad que sirve a otros." },
];

export function Story() {
  return (
    <section className="px-4 py-24 relative overflow-hidden">
      {/* Glow de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,89,17,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start relative z-10">
        {/* Izquierda */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="sticky top-32"
        >
          <p className="text-xs tracking-widest uppercase text-white/25 mb-4">La historia</p>
          <h2 className="font-[family-name:var(--font-jakarta)] font-bold text-3xl md:text-4xl text-white leading-tight mb-6">
            Colombia, rebeldía,
            <br />y la decisión
            <br />que lo cambió <span className="text-[#FF5911]">todo.</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            No es la historia del chico privilegiado que tuvo los recursos.
            Es la de quien se los buscó desde los 12, se perdió, y encontró
            el camino en la fe y el trabajo honesto.
          </p>

          <blockquote className="mt-8 border-l-2 border-[#FF5911]/40 pl-5">
            <p className="text-white/55 text-sm italic leading-relaxed">
              &ldquo;El éxito es 80% mental y 20% acción.&rdquo;
            </p>
            <footer className="mt-2 text-white/25 text-xs">— Nain Guevara</footer>
          </blockquote>
        </motion.div>

        {/* Derecha — Línea de tiempo */}
        <div className="relative flex flex-col gap-0">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/6" />
          {hitos.map((h, i) => (
            <motion.div
              key={h.edad}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="relative flex gap-5 pb-10 last:pb-0"
            >
              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${
                h.edad === "Hoy"
                  ? "bg-[#FF5911]/10 border-[#FF5911]/40"
                  : "bg-[#111] border-white/8"
              }`}>
                <span className={`text-[10px] font-bold ${h.edad === "Hoy" ? "text-[#FF5911]" : "text-white/40"}`}>
                  {h.edad}
                </span>
              </div>
              <div className="pt-2.5">
                <p className="text-white/55 text-sm leading-relaxed">{h.texto}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
