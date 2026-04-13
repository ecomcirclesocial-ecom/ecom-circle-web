"use client";

import { motion } from "framer-motion";
import { Star } from "@phosphor-icons/react";

const testimonios = [
  { nombre: "Andrés M.", ciudad: "Bogotá, CO", texto: "Antes de Ecom Circle lo intenté tres veces solo. En dos meses con la comunidad hice mis primeras ventas reales.", resultado: "Primeras ventas en 60 días" },
  { nombre: "Laura V.", ciudad: "Medellín, CO", texto: "El Lifestyle me cambió la perspectiva. No es solo técnica — es mentalidad. Nain te habla como nadie más lo hace.", resultado: "+$800 USD / mes" },
  { nombre: "Carlos R.", ciudad: "Ciudad de México, MX", texto: "La comunidad Dropi de Ecom Circle es diferente. Dan herramientas reales, no solo motivación vacía.", resultado: "Top vendedor región" },
  { nombre: "María J.", ciudad: "Santiago, CL", texto: "Lo que más me sorprendió es que Nain es igual en persona que en redes. Eso te da confianza para seguir.", resultado: "1er pedido internacional" },
  { nombre: "Felipe O.", ciudad: "Cali, CO", texto: "Vine sin saber nada de ecommerce. El Club tiene todo estructurado para que no te pierdas.", resultado: "Tienda activa en 45 días" },
  { nombre: "Valentina S.", ciudad: "Lima, PE", texto: "La sesión 1:1 con Nain fue lo que me faltaba. En 30 minutos resolvió lo que llevaba meses bloqueándome.", resultado: "Problema clave resuelto" },
];

export function Testimonials() {
  return (
    <section className="px-4 py-24 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="mb-14"
      >
        <p className="text-xs tracking-widest uppercase text-white/30 mb-3">Resultados</p>
        <h2 className="font-[family-name:var(--font-jakarta)] font-bold text-3xl md:text-4xl text-white leading-tight max-w-sm">
          Lo que dicen los que <span className="text-[#FF5911]">ya están adentro.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonios.map((t, i) => (
          <motion.div
            key={t.nombre}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="p-[1px] rounded-[1.5rem] bg-white/8 hover:bg-white/12 transition-colors duration-200"
          >
            <div className="h-full p-5 rounded-[calc(1.5rem-1px)] bg-[#0F0F0F] flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={12} weight="fill" className="text-[#FF5911]" />
                ))}
              </div>
              <p className="text-sm text-white/50 leading-relaxed flex-1">
                &ldquo;{t.texto}&rdquo;
              </p>
              <div className="flex items-end justify-between pt-2 border-t border-white/5">
                <div>
                  <p className="text-xs font-medium text-white/80">{t.nombre}</p>
                  <p className="text-[10px] text-white/30">{t.ciudad}</p>
                </div>
                <span className="text-[10px] bg-[#FF5911]/10 text-[#FF5911]/80 px-2.5 py-1 rounded-full">
                  {t.resultado}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
