"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const beneficios = [
  { num: "01", icono: "🎓", titulo: "Masterclass semanal", desc: "Ads, logística, mentalidad y más. Contenido nuevo cada semana con lo que funciona hoy." },
  { num: "02", icono: "📊", titulo: "Seguimiento personalizado", desc: "Para los que llegan a Top 10 o más de 1.000 pedidos: acompañamiento directo con Nain." },
  { num: "03", icono: "🔪", titulo: "DropsKiller GRATIS", desc: "Herramienta de validación de productos sin costo para los mejores de la comunidad (Top 10 / +1000 pedidos)." },
  { num: "04", icono: "✅", titulo: "Productos validados c/15 días", desc: "Recibe los mejores productos validados cada quince días si estás en el Top 10." },
  { num: "05", icono: "💰", titulo: "Precios preferenciales", desc: "Acceso a precios exclusivos en Vitalcom, Goldbox y Dropster — las bodegas de la comunidad." },
  { num: "06", icono: "🤝", titulo: "Reuniones y días de trabajo", desc: "Encuentros presenciales y días de trabajo en equipo. La comunidad se vuelve familia." },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="px-4 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,89,17,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
          className="mb-14 text-center"
        >
          <p className="text-xs tracking-widest uppercase text-white/25 mb-3">Beneficios VIP</p>
          <h2 className="font-black text-3xl md:text-4xl text-white leading-tight">
            Lo que obtienes al <span className="text-[#FF5911]">unirte.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficios.map((b, i) => (
            <motion.div
              key={b.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease }}
              className="group p-[1px] rounded-2xl bg-white/6 hover:bg-[#FF5911]/20 transition-all duration-300"
            >
              <div className="h-full p-5 rounded-[calc(1rem-1px)] bg-[#0D0D0D] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{b.icono}</span>
                  <span className="text-xs text-white/15 font-bold">{b.num}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{b.titulo}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.35, ease }}
          className="mt-10 flex justify-center"
        >
          <a
            href="#unirse"
            className="bg-[#FF5911] text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-[#FF5911]/85 transition active:scale-95"
          >
            Unirse a la comunidad
          </a>
        </motion.div>
      </div>
    </section>
  );
}
