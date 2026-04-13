"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "@phosphor-icons/react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const faqs = [
  { pregunta: "¿Cómo me uno a la comunidad Ecom Circle?", respuesta: "Completa el formulario de cambio de comunidad en esta página. Te contactamos por WhatsApp para gestionar el proceso en menos de 24 horas." },
  { pregunta: "¿Necesito experiencia previa en ecommerce?", respuesta: "No. Tenemos miembros que empezaron desde cero y hoy facturan miles de dólares al mes. Lo importante es el compromiso." },
  { pregunta: "¿Qué plataformas usan?", respuesta: "Principalmente Dropi para dropshipping y Shopify para tiendas propias. También integramos herramientas con IA como Chatea Pro, Lucid Bot y Scallbots." },
  { pregunta: "¿Qué es el programa Ecom Circle Lifestyle?", respuesta: "Es el acompañamiento 1:1 de alto valor. Para personas que ya tienen base y quieren escalar de verdad. Cupos muy limitados, proceso de aplicación requerido." },
  { pregunta: "¿La comunidad es solo para Colombia?", respuesta: "No. Tenemos miembros en toda LATAM — Colombia, México, Perú, Chile, Argentina — y también en España y Portugal." },
];

export function FAQSection() {
  const [abierto, setAbierto] = useState<number | null>(null);

  return (
    <section className="px-4 py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease }}
        className="mb-12 text-center"
      >
        <p className="text-xs tracking-widest uppercase text-white/25 mb-3">FAQ</p>
        <h2 className="font-black text-3xl md:text-4xl text-white">Preguntas frecuentes.</h2>
      </motion.div>

      <div className="flex flex-col gap-2">
        {faqs.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.45, delay: i * 0.05, ease }}
            className="rounded-2xl border border-white/6 overflow-hidden"
          >
            <button
              onClick={() => setAbierto(abierto === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white/3 hover:bg-white/5 transition-colors"
            >
              <span className="text-sm font-semibold text-white/80">{f.pregunta}</span>
              <motion.span animate={{ rotate: abierto === i ? 45 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                <Plus size={16} className="text-white/40" />
              </motion.span>
            </button>

            <AnimatePresence>
              {abierto === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease }}
                >
                  <p className="px-5 py-4 text-sm text-white/45 leading-relaxed border-t border-white/5">
                    {f.respuesta}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
