"use client";

import { motion } from "framer-motion";
import { WhatsappLogo, ArrowDown } from "@phosphor-icons/react";

function PlanetScene() {
  return (
    <div className="relative w-[260px] h-[260px] md:w-[360px] md:h-[360px]">
      <div className="absolute inset-0 rounded-full bg-[#FF5911]/8 blur-3xl scale-125" />

      {/* Planeta */}
      <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#080808] border border-white/8 shadow-[inset_0_2px_20px_rgba(255,89,17,0.12),0_0_50px_rgba(255,89,17,0.06)]">
        <div className="absolute inset-[-18%] rounded-full border border-white/5" />
        <div className="absolute inset-[-30%] rounded-full border border-white/[0.03]" />

        {/* Centro: Shopify S */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="36" height="40" viewBox="0 0 110 124" fill="none">
              <path d="M95.2 23.4c-.1-.7-.7-1.1-1.2-1.1s-10.3-.8-10.3-.8-6.9-6.8-7.6-7.5c-.7-.7-2.1-.5-2.7-.3l-3.7 1.1C67.9 11 64.6 6.5 58.7 6.5c-.2 0-.4 0-.6.1C57 5 55.2 4.2 53.7 4.2c-11.7 0-17.3 14.6-19.1 22l-8.2 2.5c-2.5.8-2.6.9-2.9 3.2L16 92.4l54.3 9.4 29.4-6.3L95.2 23.4z" fill="#95BF47"/>
              <path d="M94 22.3c-.5 0-10.3-.8-10.3-.8s-6.9-6.8-7.6-7.5c-.3-.3-.6-.4-1-.4l-5.2 107.2 29.4-6.3L95.2 23.4c-.1-.6-.7-1.1-1.2-1.1z" fill="#5E8E3E"/>
              <path d="M58.7 40.5l-3.6 10.7s-3.2-1.7-7.1-1.7c-5.7 0-6 3.6-6 4.5 0 4.9 12.8 6.8 12.8 18.3 0 9-5.7 14.9-13.5 14.9-9.3 0-14-5.8-14-5.8l2.5-8.2s4.9 4.2 9 4.2c2.7 0 3.8-2.1 3.8-3.7 0-6.4-10.5-6.7-10.5-17.2 0-8.8 6.4-17.4 19.2-17.4 4.9.1 7.4 1.4 7.4 1.4z" fill="white"/>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Cohete orbitando */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
        <div className="absolute top-[6%] left-[18%] text-2xl drop-shadow-[0_0_10px_rgba(255,89,17,0.9)]">
          <motion.span animate={{ rotate: -360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}>
            🚀
          </motion.span>
        </div>
      </motion.div>

      {/* Badges flotantes */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-6 top-[28%] flex items-center gap-2 bg-[#111] border border-white/10 rounded-2xl px-3 py-2 shadow-xl backdrop-blur-sm"
      >
        <svg width="16" height="18" viewBox="0 0 110 124" fill="none">
          <path d="M95.2 23.4c-.1-.7-.7-1.1-1.2-1.1s-10.3-.8-10.3-.8-6.9-6.8-7.6-7.5c-.7-.7-2.1-.5-2.7-.3l-3.7 1.1C67.9 11 64.6 6.5 58.7 6.5c-.2 0-.4 0-.6.1C57 5 55.2 4.2 53.7 4.2c-11.7 0-17.3 14.6-19.1 22l-8.2 2.5c-2.5.8-2.6.9-2.9 3.2L16 92.4l54.3 9.4 29.4-6.3L95.2 23.4z" fill="#95BF47"/>
          <path d="M94 22.3c-.5 0-10.3-.8-10.3-.8s-6.9-6.8-7.6-7.5c-.3-.3-.6-.4-1-.4l-5.2 107.2 29.4-6.3L95.2 23.4c-.1-.6-.7-1.1-1.2-1.1z" fill="#5E8E3E"/>
          <path d="M58.7 40.5l-3.6 10.7s-3.2-1.7-7.1-1.7c-5.7 0-6 3.6-6 4.5 0 4.9 12.8 6.8 12.8 18.3 0 9-5.7 14.9-13.5 14.9-9.3 0-14-5.8-14-5.8l2.5-8.2s4.9 4.2 9 4.2c2.7 0 3.8-2.1 3.8-3.7 0-6.4-10.5-6.7-10.5-17.2 0-8.8 6.4-17.4 19.2-17.4 4.9.1 7.4 1.4 7.4 1.4z" fill="white"/>
        </svg>
        <span className="text-xs text-white/70 font-medium">Shopify</span>
      </motion.div>

      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-8 bottom-[28%] flex items-center gap-2 bg-[#111] border border-white/10 rounded-2xl px-3 py-2 shadow-xl backdrop-blur-sm"
      >
        <span className="text-sm">🌎</span>
        <span className="text-xs text-white/70 font-medium">Dropi LATAM</span>
      </motion.div>

      {/* Partículas */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
          className="absolute w-1 h-1 rounded-full bg-[#FF5911]"
          style={{ top: `${12 + i * 13}%`, left: `${8 + i * 14}%` }}
        />
      ))}
    </div>
  );
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,89,17,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Texto */}
        <div className="flex flex-col items-start gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/4 text-xs text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5911] animate-pulse" />
            Comunidad #1 de Ecommerce con IA en LATAM
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1, ease }}
            className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-white">
            Más que vivir <span className="text-white/25">del</span> ecommerce.
          </motion.h1>

          <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.18, ease }}
            className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            Vivir <span className="text-[#FF5911]">para</span> él.
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.26, ease }}
            className="text-base text-white/45 leading-relaxed max-w-md">
            La comunidad de ecommerce y dropshipping más comprometida de LATAM.
            Más de <span className="text-white/70 font-semibold">$3.1M USD facturados</span> por nuestros miembros.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.34, ease }}
            className="flex flex-col sm:flex-row items-start gap-3 mt-1">
            <a href="#unirse"
              className="group flex items-center gap-3 bg-[#FF5911] text-white font-bold rounded-full px-6 py-3.5 hover:bg-[#FF5911]/85 transition-all duration-200 active:scale-95 text-sm">
              <WhatsappLogo size={18} weight="fill" />
              Unirme a la comunidad
            </a>
            <a href="#sobre-nain" className="flex items-center gap-2 text-sm text-white/35 hover:text-white/70 transition-colors px-4 py-3.5">
              Conocer a Nain <ArrowDown size={14} />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.44, ease }}
            className="flex items-center gap-6 pt-2 border-t border-white/6 w-full">
            {[
              { valor: "$3.1M+", desc: "USD facturados" },
              { valor: "Top 10", desc: "Dropi LATAM" },
              { valor: "100%", desc: "con IA" },
            ].map((s) => (
              <div key={s.valor}>
                <p className="font-bold text-lg text-white">{s.valor}</p>
                <p className="text-[11px] text-white/30">{s.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Animación */}
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease }} className="flex justify-center items-center">
          <PlanetScene />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-10 bg-gradient-to-b from-white/15 to-transparent" />
    </section>
  );
}
