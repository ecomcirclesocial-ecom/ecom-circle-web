"use client";

import { motion } from "framer-motion";

const marcas = ["Dropi", "Shopify", "Chatea Pro", "Lucid Bot", "Scallbots", "Funnelish"];

export function LogosSection() {
  return (
    <section className="py-14 border-y border-white/5 overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs tracking-widest uppercase text-white/25 mb-8"
      >
        Aliados y plataformas
      </motion.p>

      {/* Marquee */}
      <div className="relative flex overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 items-center shrink-0"
        >
          {[...marcas, ...marcas].map((marca, i) => (
            <span
              key={i}
              className="text-white/30 font-bold text-xl tracking-tight whitespace-nowrap hover:text-white/60 transition-colors cursor-default"
            >
              {marca}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
