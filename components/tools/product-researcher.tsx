"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { CloudArrowUp, MagicWand, Copy, Check, DownloadSimple, ArrowLeft } from "@phosphor-icons/react";
import { DescargaPDF } from "@/components/tools/investigacion-pdf";

// ─── Types ───────────────────────────────────────────────────────────────────

type Model = "jiminy" | "claude";
type FreepikStep = "form" | "loading_investigation" | "picking" | "loading_generate" | "resultado";
type Angle = { nombre: string; descripcion: string };
type Palette = { nombre: string; fondo: string; primario: string; acento: string; sensacion: string };

const TIEMPO_ESTIMADO: Record<Model, { segundos: number; etiqueta: string }> = {
  jiminy: { segundos: 60, etiqueta: "~1 minuto" },
  claude: { segundos: 150, etiqueta: "~2 minutos" },
};

const SEP = "══════════════════════════════════════════════";

// ─── CopyButton ──────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#FF5911] transition-colors shrink-0"
    >
      {copied ? <Check size={13} weight="bold" className="text-[#FF5911]" /> : <Copy size={13} />}
      {copied ? "Copiado" : label}
    </button>
  );
}

// ─── ProductResearcher ───────────────────────────────────────────────────────

export function ProductResearcher() {
  const [mode, setMode] = useState<"normal" | "freepik">("normal");

  // ── Normal mode state ──────────────────────────────────────────────────
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [modelo, setModelo] = useState<Model>("jiminy");
  const [info, setInfo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Freepik mode state ─────────────────────────────────────────────────
  const [freepikStep, setFreepikStep] = useState<FreepikStep>("form");
  const [freepikImage, setFreepikImage] = useState<{ base64: string; mediaType: string; preview: string } | null>(null);
  const [freepikIsDragging, setFreepikIsDragging] = useState(false);
  const freepikFileRef = useRef<HTMLInputElement>(null);
  const [freepikModel, setFreepikModel] = useState<Model>("claude");
  const [freepikProduct, setFreepikProduct] = useState({
    nombre: "", precio: "", precioAnterior: "", contenido: "", caracteristicas: "", mercado: "Colombia",
  });
  const [investigation, setInvestigation] = useState("");
  const [angles, setAngles] = useState<Angle[]>([]);
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<Angle | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  const [brandingData, setBrandingData] = useState({ marca: "", duracion: "Permanente" });
  const [freepikResult, setFreepikResult] = useState<{ angle: string; branding: string } | null>(null);
  const [freepikError, setFreepikError] = useState("");

  // ── Normal mode effects ────────────────────────────────────────────────
  useEffect(() => {
    if (cargando) {
      const total = TIEMPO_ESTIMADO[modelo].segundos;
      setProgreso(0); setSegundos(0);
      let elapsed = 0;
      intervalRef.current = setInterval(() => {
        elapsed += 0.5;
        setSegundos(Math.floor(elapsed));
        setProgreso(Math.round(Math.min(90, (elapsed / total) * 100 * 0.9 + Math.sqrt(elapsed) * 1.2)));
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (resultado) setProgreso(100);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  // ── Normal mode handlers ───────────────────────────────────────────────
  function onImagen(file: File) {
    setImagen(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onImagen(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setCargando(true); setResultado(null); setError(null);
    const fd = new FormData();
    fd.append("model", modelo); fd.append("nombre", nombre.trim()); fd.append("info", info.trim());
    if (imagen) fd.append("imagen", imagen);
    try {
      const res = await fetch("/api/research", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error del servidor");
      setResultado(data.resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  function parsearResultado(texto: string) {
    const limpio = texto.replace(/\*\*/g, "").replace(/\*/g, "").replace(/__/g, "");
    const secciones: { titulo: string; contenido: string }[] = [];
    const regex = /^(\d+\.\s+[A-ZÁÉÍÓÚÑ\s\/\(\)\-]+?):\s*([\s\S]*?)(?=^\d+\.\s+[A-ZÁÉÍÓÚÑ\s\/\(\)\-]+?:|$)/gm;
    let match;
    while ((match = regex.exec(limpio)) !== null) {
      const contenido = match[2].trim();
      if (contenido) secciones.push({ titulo: match[1].trim(), contenido });
    }
    return secciones.length > 0 ? secciones : null;
  }

  // ── Freepik mode handlers ──────────────────────────────────────────────
  const handleFreepikFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFreepikImage({ base64: dataUrl.split(",")[1], mediaType: file.type, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  }, []);

  async function runInvestigation() {
    if (!freepikProduct.nombre.trim() || !freepikProduct.precio.trim() || !freepikProduct.contenido.trim()) return;
    setFreepikError(""); setFreepikStep("loading_investigation");
    try {
      const res = await fetch("/api/research-freepik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "investigation",
          imageBase64: freepikImage?.base64 ?? null,
          mediaType: freepikImage?.mediaType ?? "image/jpeg",
          productData: freepikProduct,
          model: freepikModel,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInvestigation(data.investigation);
      setAngles(data.angles ?? []);
      setPalettes(data.palettes ?? []);
      setFreepikStep("picking");
    } catch (e) {
      setFreepikError(e instanceof Error ? e.message : "Error al generar");
      setFreepikStep("form");
    }
  }

  async function runGenerate() {
    if (!selectedAngle || !selectedPalette) return;
    setFreepikError(""); setFreepikStep("loading_generate");
    try {
      const res = await fetch("/api/research-freepik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "generate", investigation, angleChoice: selectedAngle, paletteChoice: selectedPalette, brandingData }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFreepikResult(data);
      setFreepikStep("resultado");
    } catch (e) {
      setFreepikError(e instanceof Error ? e.message : "Error al generar");
      setFreepikStep("picking");
    }
  }

  function downloadFreepikMd() {
    if (!freepikResult) return;
    const blocks = [
      { label: "INVESTIGACIÓN DE MERCADO", text: investigation },
      { label: "ÁNGULO DE VENTA", text: freepikResult.angle },
      { label: "BRANDING E IDENTIDAD VISUAL", text: freepikResult.branding },
    ];
    const content = blocks.map(b => `${SEP}\n${b.label}\n${SEP}\n\n${b.text.trim()}`).join("\n\n\n");
    const slug = freepikProduct.nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const blob = new Blob([content], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${slug}-freepik.md`; a.click();
  }

  function resetFreepik() {
    setFreepikStep("form"); setFreepikImage(null); setFreepikResult(null);
    setInvestigation(""); setAngles([]); setPalettes([]);
    setSelectedAngle(null); setSelectedPalette(null);
    setFreepikProduct({ nombre: "", precio: "", precioAnterior: "", contenido: "", caracteristicas: "", mercado: "Colombia" });
    setBrandingData({ marca: "", duracion: "Permanente" });
    setFreepikError("");
  }

  // ── Derived ────────────────────────────────────────────────────────────
  const seccionesParsed = resultado ? parsearResultado(resultado) : null;
  const secciones = seccionesParsed ?? (resultado ? [{ titulo: "Investigación completa", contenido: resultado }] : null);

  // ── Mode selector ──────────────────────────────────────────────────────
  const ModeSelector = (
    <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-1 mb-6">
      {(["normal", "freepik"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => { setMode(m); setResultado(null); setFreepikStep("form"); setFreepikResult(null); }}
          className={`py-2.5 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-[#FF5911] text-white" : "text-white/40 hover:text-white/70"}`}
        >
          {m === "normal" ? "Investigación normal" : "Modo Freepik"}
        </button>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // FREEPIK MODE RENDERS
  // ═══════════════════════════════════════════════════════════════════════

  if (mode === "freepik") {
    // Loading: investigation
    if (freepikStep === "loading_investigation") {
      return (
        <div className="max-w-2xl mx-auto bg-[#161616] border border-white/8 rounded-2xl p-6">
          {ModeSelector}
          <div className="flex flex-col items-center gap-5 py-12 text-center">
            <div className="w-10 h-10 border-2 border-[#FF5911]/30 border-t-[#FF5911] rounded-full animate-spin" />
            <div>
              <p className="text-white font-semibold">Generando investigación de mercado</p>
              <p className="text-white/40 text-sm mt-1">Analizando imagen y datos del producto...</p>
              <p className="text-white/25 text-xs mt-2">Tiempo estimado: {TIEMPO_ESTIMADO[freepikModel].etiqueta}</p>
            </div>
          </div>
        </div>
      );
    }

    // Loading: generate
    if (freepikStep === "loading_generate") {
      return (
        <div className="max-w-2xl mx-auto bg-[#161616] border border-white/8 rounded-2xl p-6">
          {ModeSelector}
          <div className="flex flex-col items-center gap-5 py-12 text-center">
            <div className="w-10 h-10 border-2 border-[#FF5911]/30 border-t-[#FF5911] rounded-full animate-spin" />
            <div>
              <p className="text-white font-semibold">Generando ángulo y branding</p>
              <p className="text-white/40 text-sm mt-1">Esto toma ~30-60 segundos...</p>
            </div>
          </div>
        </div>
      );
    }

    // Resultado
    if (freepikStep === "resultado" && freepikResult) {
      const blocks = [
        { label: "INVESTIGACIÓN DE MERCADO", text: investigation },
        { label: "ÁNGULO DE VENTA", text: freepikResult.angle },
        { label: "BRANDING E IDENTIDAD VISUAL", text: freepikResult.branding },
      ];
      return (
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[#FF5911] text-xs tracking-widest uppercase font-medium">Freepik listo</p>
              <p className="text-white font-semibold mt-0.5">{freepikProduct.nombre}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetFreepik}
                className="text-xs text-white/40 hover:text-white/70 px-3 py-2 rounded-lg border border-white/8 hover:border-white/15 transition"
              >
                Nuevo
              </button>
              <button
                onClick={downloadFreepikMd}
                className="flex items-center gap-2 bg-[#FF5911] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#FF5911]/85 transition active:scale-95"
              >
                <DownloadSimple size={14} weight="bold" />
                Descargar .md
              </button>
            </div>
          </div>

          {blocks.map(({ label, text }) => (
            <div key={label} className="bg-[#161616] border border-white/8 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#FF5911]">{label}</p>
                <CopyButton text={text} />
              </div>
              <pre className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap font-sans">{text.trim()}</pre>
            </div>
          ))}
          <div className="text-center pt-2">
            <Link href="/tools" className="text-sm text-white/30 hover:text-white/60 transition">← Volver a herramientas</Link>
          </div>
        </div>
      );
    }

    // Picking: angle + branding
    if (freepikStep === "picking") {
      const canGenerate = selectedAngle && selectedPalette;
      return (
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {/* Investigación generada (colapsada) */}
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-1">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#FF5911]">Investigación de mercado</p>
              <CopyButton text={investigation} />
            </div>
            <pre className="text-xs text-white/40 leading-relaxed whitespace-pre-wrap font-sans line-clamp-6">{investigation.trim().slice(0, 600)}...</pre>
          </div>

          {/* Ángulo */}
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs tracking-widest uppercase text-white/40 font-medium">Elige el ángulo de venta</p>
            {angles.map((angle) => {
              const active = selectedAngle?.nombre === angle.nombre;
              return (
                <button
                  key={angle.nombre}
                  onClick={() => setSelectedAngle(angle)}
                  className={`text-left p-4 rounded-xl border transition-all ${active ? "bg-[#FF5911]/10 border-[#FF5911]/50" : "bg-white/3 border-white/8 hover:border-white/15"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${active ? "border-[#FF5911] bg-[#FF5911]" : "border-white/25"}`}>
                      {active && <div className="w-1 h-1 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${active ? "text-white" : "text-white/70"}`}>{angle.nombre}</p>
                      <p className="text-xs text-white/40 mt-0.5">{angle.descripcion}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Branding */}
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-xs tracking-widest uppercase text-white/40 font-medium">Branding</p>

            <div>
              <label className="text-xs tracking-widest uppercase text-white/35 mb-2 block">Nombre de marca</label>
              <input
                type="text"
                placeholder="Dejar vacío para marca genérica"
                value={brandingData.marca}
                onChange={(e) => setBrandingData((p) => ({ ...p, marca: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/25 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50"
              />
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-white/35 mb-2 block">Tipo de landing</label>
              <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-1">
                {["Permanente", "Temporal (campaña)"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setBrandingData((p) => ({ ...p, duracion: opt }))}
                    className={`text-sm font-medium py-2 rounded-lg transition-all ${brandingData.duracion === opt ? "bg-[#FF5911] text-white" : "text-white/40 hover:text-white/70"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-white/35 mb-3 block">Paleta de colores</label>
              <div className="flex flex-col gap-2">
                {palettes.map((palette) => {
                  const active = selectedPalette?.nombre === palette.nombre;
                  return (
                    <button
                      key={palette.nombre}
                      onClick={() => setSelectedPalette(palette)}
                      className={`text-left p-4 rounded-xl border transition-all ${active ? "bg-[#FF5911]/10 border-[#FF5911]/50" : "bg-white/3 border-white/8 hover:border-white/15"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${active ? "border-[#FF5911] bg-[#FF5911]" : "border-white/25"}`}>
                          {active && <div className="w-1 h-1 rounded-full bg-white" />}
                        </div>
                        <div className="flex gap-1.5">
                          {[palette.fondo, palette.primario, palette.acento].map((hex, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: hex }} />
                          ))}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${active ? "text-white" : "text-white/70"}`}>{palette.nombre}</p>
                          <p className="text-xs text-white/35">{palette.sensacion}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {freepikError && <p className="text-red-400 text-sm px-1">{freepikError}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setFreepikStep("form")}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 px-4 py-3 rounded-xl border border-white/8 transition"
            >
              <ArrowLeft size={14} /> Atrás
            </button>
            <button
              onClick={runGenerate}
              disabled={!canGenerate}
              className="flex-1 bg-[#FF5911] text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-[#FF5911]/85 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Generar ángulo y branding
            </button>
          </div>
        </div>
      );
    }

    // Freepik form
    const canSubmitFreepik = freepikProduct.nombre.trim() && freepikProduct.precio.trim() && freepikProduct.contenido.trim();
    return (
      <div className="max-w-2xl mx-auto bg-[#161616] border border-white/8 rounded-2xl p-6">
        {ModeSelector}
        <div className="flex flex-col gap-5">
          {/* Image */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/40 mb-2">Foto del producto</label>
            <input ref={freepikFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFreepikFile(e.target.files[0])} />
            {freepikImage ? (
              <div
                onClick={() => freepikFileRef.current?.click()}
                className="relative rounded-xl border border-[#FF5911]/40 bg-[#1a1a1a] overflow-hidden cursor-pointer group"
              >
                <img src={freepikImage.preview} alt="Producto" className="w-full h-36 object-contain py-3" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs">Cambiar imagen</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => freepikFileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setFreepikIsDragging(true); }}
                onDragLeave={() => setFreepikIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setFreepikIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFreepikFile(f); }}
                className={`border border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${freepikIsDragging ? "border-[#FF5911]/60 bg-[#FF5911]/5" : "border-white/15 hover:border-white/25 bg-white/3"}`}
              >
                <CloudArrowUp size={24} className="text-white/30" />
                <p className="text-sm text-white/40">Arrastra la imagen o <span className="text-[#FF5911]">haz clic</span></p>
              </div>
            )}
          </div>

          {/* Product fields */}
          {[
            { key: "nombre", label: "Nombre del producto", placeholder: "Ej: Corrector de postura lumbar", required: true },
            { key: "precio", label: "Precio de venta", placeholder: "Ej: $89.900", required: true },
            { key: "precioAnterior", label: "Precio anterior / tachado", placeholder: "Ej: $150.000 (opcional)", required: false },
            { key: "contenido", label: "Contenido de la caja", placeholder: "Ej: 1 corrector + instrucciones + bolsa", required: true },
            { key: "caracteristicas", label: "Características conocidas", placeholder: "Opcional — Claude las infiere de la imagen", required: false },
            { key: "mercado", label: "Mercado objetivo", placeholder: "Colombia", required: false },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs tracking-widest uppercase text-white/40 mb-2">
                {label}{required && <span className="text-[#FF5911] ml-1">*</span>}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={freepikProduct[key as keyof typeof freepikProduct]}
                onChange={(e) => setFreepikProduct((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50 transition"
              />
            </div>
          ))}

          {/* Model */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/40 mb-2">Modelo de IA</label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-1">
              <button type="button" onClick={() => setFreepikModel("jiminy")} className={`py-2 rounded-lg text-sm font-medium transition-all ${freepikModel === "jiminy" ? "bg-[#FF5911] text-white" : "text-white/40 hover:text-white/70"}`}>
                Gemini 3.1 Pro
              </button>
              <button type="button" onClick={() => setFreepikModel("claude")} className={`py-2 rounded-lg text-sm font-medium transition-all ${freepikModel === "claude" ? "bg-[#FF5911] text-white" : "text-white/40 hover:text-white/70"}`}>
                Claude Opus 4.6
              </button>
            </div>
            <p className="text-xs text-white/25 mt-1.5">
              {freepikModel === "jiminy" ? "Gemini 3.1 Pro — rápido, ~1 minuto" : "Claude Opus 4.6 — máxima profundidad, ~2 minutos"}
            </p>
          </div>

          {freepikError && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 px-4 py-3 rounded-xl">{freepikError}</p>
          )}

          <button
            onClick={runInvestigation}
            disabled={!canSubmitFreepik}
            className="flex items-center justify-center gap-2 w-full bg-[#FF5911] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#FF5911]/85 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MagicWand size={16} weight="bold" />
            Generar investigación de mercado
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NORMAL MODE RENDERS
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="max-w-2xl mx-auto">
      {!resultado ? (
        <form onSubmit={onSubmit} className="bg-[#161616] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
          {ModeSelector}

          {/* Upload imagen */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/40 mb-2">Foto del producto</label>
            <div
              className="relative border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#FF5911]/40 hover:bg-[#FF5911]/5 transition-all"
              onClick={() => inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onImagen(e.target.files[0])} />
              {preview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                  </div>
                  <p className="text-xs text-white/30">{imagen?.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3">
                  <CloudArrowUp size={28} weight="light" className="text-white/25" />
                  <p className="text-sm text-white/40">Arrastra una foto o haz clic para subir</p>
                  <p className="text-xs text-white/20">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/40 mb-2">
              Nombre del producto <span className="text-[#FF5911]">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Masajeador facial de rodillo de jade"
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50 transition"
            />
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/40 mb-2">Modelo de IA</label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-1 mb-2">
              <button type="button" onClick={() => setModelo("jiminy")} className={`py-2 rounded-lg text-sm font-medium transition-all ${modelo === "jiminy" ? "bg-[#FF5911] text-white" : "text-white/40 hover:text-white/70"}`}>
                Gemini 3.1 Pro
              </button>
              <button type="button" onClick={() => setModelo("claude")} className={`py-2 rounded-lg text-sm font-medium transition-all ${modelo === "claude" ? "bg-[#FF5911] text-white" : "text-white/40 hover:text-white/70"}`}>
                Claude Opus 4.6
              </button>
            </div>
            <p className="text-xs text-white/25">
              {modelo === "jiminy" ? "Usando gemini-3.1-pro-preview — el más avanzado de Google" : "Usando claude-opus-4-6 — máxima profundidad de análisis"}
            </p>
          </div>

          {/* Info opcional */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-white/40 mb-1">
              Información adicional <span className="text-white/20 normal-case tracking-normal">(opcional)</span>
            </label>
            <p className="text-xs text-white/25 mb-2">Copia y pega descripciones, reseñas, fichas técnicas — sin importar el idioma.</p>
            <textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Pega aquí toda la información que encuentres del producto..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50 transition resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 px-4 py-3 rounded-xl">{error}</p>
          )}

          {cargando ? (
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>Analizando 30 secciones...</span>
                <span>{progreso}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5911] rounded-full transition-all duration-500 ease-out" style={{ width: `${progreso}%` }} />
              </div>
              <p className="text-xs text-white/25 text-center">{segundos}s · tiempo promedio {TIEMPO_ESTIMADO[modelo].etiqueta}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-white/25 text-center">
                Tiempo promedio: <span className="text-white/40 font-medium">{TIEMPO_ESTIMADO[modelo].etiqueta}</span>
              </p>
              <button
                type="submit"
                disabled={!nombre.trim()}
                className="flex items-center justify-center gap-2 w-full bg-[#FF5911] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#FF5911]/85 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MagicWand size={16} weight="bold" />
                Generar investigación
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-1">Investigación completa</p>
              <h2 className="font-bold text-xl text-white">{nombre}</h2>
            </div>
            <button
              onClick={() => { setResultado(null); setNombre(""); setImagen(null); setPreview(null); setInfo(""); }}
              className="text-sm text-white/40 hover:text-white transition px-4 py-2 rounded-full border border-white/10 hover:border-white/20"
            >
              Nueva investigación
            </button>
          </div>

          {secciones && (
            <div className="bg-[#161616] border border-white/8 rounded-2xl p-6 flex flex-col items-center gap-5 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FF5911]/15 flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Investigación lista</p>
                <p className="text-xs text-white/35">{seccionesParsed ? `${secciones.length} secciones · ` : ""}{nombre}</p>
              </div>
              <DescargaPDF nombre={nombre} secciones={secciones} />
            </div>
          )}

          <div className="text-center pt-2">
            <Link href="/tools" className="text-sm text-white/30 hover:text-white/60 transition">← Volver a herramientas</Link>
          </div>
        </div>
      )}
    </div>
  );
}
