"use client";

import { useState, useRef } from "react";
import { CloudArrowUp, Target, Copy, Check, ArrowCounterClockwise } from "@phosphor-icons/react";

type Angulo = {
  numero: number;
  tipo: string;
  titulo: string;
  gancho: string;
  descripcion: string;
};

const PAISES = [
  "Colombia", "México", "Argentina", "Chile", "Perú",
  "Ecuador", "Venezuela", "Bolivia", "Paraguay", "Uruguay",
  "Guatemala", "Costa Rica", "Panamá", "República Dominicana", "España",
];

const TIPO_COLOR: Record<string, string> = {
  Dolor: "text-red-400",
  Deseo: "text-pink-400",
  Objeción: "text-yellow-400",
  Aspiracional: "text-blue-400",
  Miedo: "text-orange-400",
  Curiosidad: "text-purple-400",
  Urgencia: "text-[#FF5911]",
  Social: "text-cyan-400",
  Transformación: "text-emerald-400",
  Beneficio: "text-lime-400",
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-[11px] text-white/25 hover:text-[#FF5911] transition-colors"
    >
      {copied ? <Check size={11} weight="bold" className="text-[#FF5911]" /> : <Copy size={11} />}
      {copied ? "Copiado" : "Copiar gancho"}
    </button>
  );
}

export function AngulosVenta() {
  const [producto, setProducto] = useState("");
  const [pais, setPais] = useState("Colombia");
  const [pdf, setPdf] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [angulos, setAngulos] = useState<Angulo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function generar() {
    if (!producto.trim()) return;
    setCargando(true);
    setError(null);
    setAngulos(null);

    const fd = new FormData();
    fd.append("producto", producto.trim());
    fd.append("pais", pais);
    if (pdf) fd.append("pdf", pdf);

    try {
      const res = await fetch("/api/angulos-venta", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando ángulos");
      setAngulos(data.angulos);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setAngulos(null);
    setError(null);
    setProducto("");
    setPdf(null);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Formulario */}
      {!angulos && (
        <div className="bg-[#161616] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">

          {/* Producto */}
          <div>
            <label className="text-xs tracking-widest uppercase text-white/40 mb-2 block">
              Nombre del producto
            </label>
            <input
              type="text"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              placeholder="Ej: Masajeador de cuello eléctrico"
              className="w-full bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50"
            />
          </div>

          {/* País */}
          <div>
            <label className="text-xs tracking-widest uppercase text-white/40 mb-2 block">
              País objetivo
            </label>
            <div className="flex flex-wrap gap-2">
              {PAISES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPais(p)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                    pais === p
                      ? "bg-[#FF5911] text-white"
                      : "bg-white/8 text-white/50 border border-white/10 hover:bg-white/12"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* PDF */}
          <div>
            <label className="text-xs tracking-widest uppercase text-white/40 mb-2 block">
              Investigación de mercado (PDF) — opcional
            </label>
            <button
              onClick={() => inputRef.current?.click()}
              className={`w-full border border-dashed rounded-xl py-5 flex flex-col items-center gap-2 transition-all ${
                pdf
                  ? "border-[#FF5911]/50 bg-[#FF5911]/5"
                  : "border-white/10 hover:border-white/20 bg-[#1a1a1a]"
              }`}
            >
              <CloudArrowUp size={22} className={pdf ? "text-[#FF5911]" : "text-white/30"} />
              <span className="text-xs text-white/40">
                {pdf ? pdf.name : "Haz clic para subir tu PDF"}
              </span>
              {pdf && (
                <span className="text-[10px] text-white/25">
                  {(pdf.size / 1024).toFixed(0)} KB
                </span>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={generar}
            disabled={cargando || !producto.trim()}
            className="w-full bg-[#FF5911] text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-[#FF5911]/85 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando ángulos...
              </>
            ) : (
              <>
                <Target size={16} weight="bold" />
                Generar 10 ángulos de venta
              </>
            )}
          </button>
        </div>
      )}

      {/* Resultados */}
      {angulos && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#FF5911]">10 ángulos generados</p>
              <p className="text-white/40 text-sm mt-0.5">{producto} · {pais}</p>
            </div>
            <button
              onClick={reiniciar}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowCounterClockwise size={13} />
              Nueva consulta
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {angulos.map((a) => (
              <div key={a.numero} className="bg-white/5 border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#FF5911]">#{a.numero}</span>
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${TIPO_COLOR[a.tipo] ?? "text-white/40"}`}>
                      {a.tipo}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white">{a.titulo}</h3>

                <div className="bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
                  <p className="text-sm text-white/80 leading-relaxed italic">"{a.gancho}"</p>
                  <CopyBtn text={a.gancho} />
                </div>

                <p className="text-sm text-white/50 leading-relaxed">{a.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
