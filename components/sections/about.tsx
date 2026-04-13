"use client";

import { motion } from "framer-motion";
import { InstagramLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const hitos = [
  { icono: "🌭", titulo: "El inicio", texto: "Vendiendo perros calientes y comprando mercancía. Así empezó el camino." },
  { icono: "📱", titulo: "WhatsApp", texto: "Campañas de ventas por WhatsApp. Aprendiendo marketing de la manera difícil." },
  { icono: "🌐", titulo: "Ecommerce", texto: "Pandemia. Sin trabajo, sin bachiller. Estudió ecommerce día y noche hasta que funcionó." },
  { icono: "🚀", titulo: "Hoy", texto: "+$3.1M USD facturados. Fundador de Ecom Circle, comunidad #1 en LATAM." },
];

export function AboutSection() {
  return (
    <section id="sobre-nain" className="px-4 py-24 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease }}
        className="mb-14"
      >
        <p className="text-xs tracking-widest uppercase text-white/25 mb-3">El fundador</p>
        <h2 className="font-black text-3xl md:text-4xl text-white leading-tight">
          Nain Guevara, 23 años. <br />
          <span className="text-[#FF5911]">Cali, Colombia.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Izquierda: hitos */}
        <div className="flex flex-col gap-5">
          {hitos.map((h, i) => (
            <motion.div
              key={h.titulo}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="flex gap-4 p-4 rounded-2xl bg-white/3 border border-white/6 hover:border-white/10 transition-colors"
            >
              <span className="text-2xl flex-shrink-0">{h.icono}</span>
              <div>
                <p className="text-sm font-bold text-white mb-1">{h.titulo}</p>
                <p className="text-sm text-white/45 leading-relaxed">{h.texto}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Derecha: cita + redes */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col gap-6"
        >
          <blockquote className="border-l-2 border-[#FF5911] pl-6">
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              &ldquo;El éxito es 80% mental y 20% acción. La mesa tiene 4 patas, no 8 ni mil. Menos siempre va a ser más.&rdquo;
            </p>
            <footer className="mt-3 text-white/30 text-sm">— Nain Guevara, fundador de Ecom Circle</footer>
          </blockquote>

          <div className="p-5 rounded-2xl bg-[#FF5911]/8 border border-[#FF5911]/15">
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Siendo la misma persona en redes que en persona. Eso es lo que lo hace diferente.
              La autenticidad y el carisma que ves en pantalla es el mismo que encuentras en persona.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/nain_guevara/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                <InstagramLogo size={16} />
                Instagram
              </a>
              <a href="https://www.tiktok.com/@nain_guevara" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                <TiktokLogo size={16} />
                TikTok
              </a>
              <a href="https://www.youtube.com/@nainGuevara" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                <YoutubeLogo size={16} />
                YouTube
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
