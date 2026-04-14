"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChartBar, Copy, Check, Warning, Lightbulb, ArrowRight } from "@phosphor-icons/react";

type EstadoMetrica = "bueno" | "regular" | "malo";

interface MetricaClave {
  nombre: string;
  valor: string;
  estado: EstadoMetrica;
  referencia: string;
}

interface Item {
  titulo: string;
  descripcion: string;
}

interface Analisis {
  resumen: string;
  puntuacion: number;
  metricas_clave: MetricaClave[];
  problemas: Item[];
  oportunidades: Item[];
  acciones: string[];
  conclusion: string;
}

const estadoColor: Record<EstadoMetrica, string> = {
  bueno: "text-emerald-400",
  regular: "text-yellow-400",
  malo: "text-red-400",
};

const estadoDot: Record<EstadoMetrica, string> = {
  bueno: "bg-emerald-400",
  regular: "bg-yellow-400",
  malo: "bg-red-400",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#FF5911] transition-colors"
    >
      {copied ? <Check size={13} weight="bold" className="text-[#FF5911]" /> : <Copy size={13} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export function MetaAdsAnalyzer() {
  const [metricas, setMetricas] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analizar() {
    if (!metricas.trim()) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metricas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al analizar");
      setResultado(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-28">

        {/* Header */}
        <div className="mb-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs mb-6 transition-colors">
            <ArrowLeft size={13} />
            Herramientas
          </Link>
          <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-2">Herramienta gratuita · Ecom Circle</p>
          <h1 className="font-extrabold text-4xl md:text-5xl text-white leading-tight mb-2">
            Análisis de campañas
          </h1>
          <p className="text-white/50 text-base">Meta Ads · Facebook e Instagram</p>
          <p className="text-sm text-white/40 mt-2 max-w-md">
            Pega las métricas de tu campaña y obtén un diagnóstico completo con acciones concretas.
          </p>
        </div>

        {/* Input */}
        <div className="bg-[#161616] border border-white/8 rounded-2xl p-6 mb-4">
          <label className="text-xs tracking-widest uppercase text-white/40 mb-2 block">
            Métricas de tu campaña
          </label>
          <textarea
            value={metricas}
            onChange={e => setMetricas(e.target.value)}
            placeholder={`Pega aquí los datos de tu campaña. Por ejemplo:\n\nAlcance: 45.200\nImpresiones: 98.000\nCTR: 1.2%\nCPC: $450\nCPM: $5.800\nConversiones: 38\nCosto por conversión: $11.700\nROAS: 2.4\nGasto total: $440.000\nIngresos: $1.050.000`}
            rows={10}
            className="w-full bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50 resize-none"
          />
          <button
            onClick={analizar}
            disabled={cargando || !metricas.trim()}
            className="w-full mt-4 bg-[#FF5911] text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-[#FF5911]/85 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <ChartBar size={16} weight="bold" />
                Analizar campañas
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="flex flex-col gap-4">

            {/* Puntuación + resumen */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-widest uppercase text-[#FF5911]">Diagnóstico general</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white">{resultado.puntuacion}</span>
                  <span className="text-white/30 text-sm">/10</span>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{resultado.resumen}</p>
            </div>

            {/* Métricas clave */}
            {resultado.metricas_clave?.length > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-[#FF5911] mb-4">Métricas clave</p>
                <div className="flex flex-col gap-3">
                  {resultado.metricas_clave.map((m, i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${estadoDot[m.estado]}`} />
                        <span className="text-sm text-white/70 truncate">{m.nombre}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${estadoColor[m.estado]}`}>{m.valor}</p>
                        <p className="text-[11px] text-white/30">{m.referencia}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problemas */}
            {resultado.problemas?.length > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Warning size={14} weight="bold" className="text-red-400" />
                  <p className="text-xs font-bold tracking-widest uppercase text-red-400">Problemas detectados</p>
                </div>
                <div className="flex flex-col gap-4">
                  {resultado.problemas.map((p, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-white mb-1">{p.titulo}</p>
                      <p className="text-sm text-white/50 leading-relaxed">{p.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Oportunidades */}
            {resultado.oportunidades?.length > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={14} weight="bold" className="text-yellow-400" />
                  <p className="text-xs font-bold tracking-widest uppercase text-yellow-400">Oportunidades</p>
                </div>
                <div className="flex flex-col gap-4">
                  {resultado.oportunidades.map((o, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-white mb-1">{o.titulo}</p>
                      <p className="text-sm text-white/50 leading-relaxed">{o.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            {resultado.acciones?.length > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-[#FF5911] mb-4">Acciones inmediatas</p>
                <div className="flex flex-col gap-2">
                  {resultado.acciones.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#FF5911]/15 flex items-center justify-center shrink-0 mt-0.5">
                        <ArrowRight size={10} weight="bold" className="text-[#FF5911]" />
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conclusión */}
            {resultado.conclusion && (
              <div className="bg-[#FF5911]/8 border border-[#FF5911]/20 rounded-2xl p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-[#FF5911] mb-2">Próximo paso</p>
                <p className="text-sm text-white/80 leading-relaxed">{resultado.conclusion}</p>
                <div className="flex justify-end mt-3">
                  <CopyButton text={resultado.conclusion} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
