"use client";

import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import * as XLSX from "xlsx";
import {
  UploadSimple,
  CheckCircle,
  Warning,
  ArrowCounterClockwise,
  Truck,
  XCircle,
  FileXls,
} from "@phosphor-icons/react";

interface Orden {
  id: string;
  fecha: string;
  cliente: string;
  telefono: string;
  guia: string;
  estadoOriginal: string;
  estadoGrupo: GrupoEstado;
  ciudad: string;
  departamento: string;
  transportadora: string;
  producto: string;
  cantidad: string;
  total: number;
  ganancia: number;
  novedad: string;
}

type GrupoEstado =
  | "Guía generada"
  | "Despachado"
  | "Novedad"
  | "Devolución"
  | "Cancelado"
  | "Entregado";

const GRUPOS: Record<string, GrupoEstado> = {
  GUIA_GENERADA: "Guía generada",
  "PENDIENTE CONFIRMACION": "Guía generada",
  PENDIENTE: "Guía generada",
  "PREPARADO PARA TRANSPORTADORA": "Guía generada",
  DESPACHADA: "Despachado",
  "EN BODEGA ORIGEN": "Despachado",
  "EN REPARTO": "Despachado",
  "EN BODEGA TRANSPORTADORA": "Despachado",
  "EN TRANSITO": "Despachado",
  "EN RUTA": "Despachado",
  "EN ESPERA DE RUTA DOMESTICA": "Despachado",
  "BODEGA DESTINO": "Despachado",
  "EN BODEGA DESTINO": "Despachado",
  "EN PROCESAMIENTO": "Despachado",
  "INTENTO DE ENTREGA": "Despachado",
  "RECLAME EN OFICINA": "Despachado",
  "SIN MOVIMIENTOS": "Despachado",
  NOVEDAD: "Novedad",
  "NOVEDAD SOLUCIONADA": "Despachado",
  DEVOLUCION: "Devolución",
  "EN PROCESO DE DEVOLUCION": "Devolución",
  CANCELADO: "Cancelado",
  RECHAZADO: "Cancelado",
  ENTREGADO: "Entregado",
};

function grupoDeEstado(estatus: string): GrupoEstado {
  const key = (estatus ?? "").toUpperCase().trim();
  return GRUPOS[key] ?? "Despachado";
}

const GRUPO_CONFIG: Record<
  GrupoEstado,
  { color: string; bg: string; border: string; icon: React.ElementType }
> = {
  "Guía generada": {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: FileXls,
  },
  Despachado: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Truck,
  },
  Novedad: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: Warning,
  },
  Devolución: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: ArrowCounterClockwise,
  },
  Cancelado: {
    color: "text-white/30",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: XCircle,
  },
  Entregado: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle,
  },
};

const GRUPOS_ORDEN: GrupoEstado[] = [
  "Guía generada",
  "Despachado",
  "Novedad",
  "Devolución",
  "Cancelado",
  "Entregado",
];

function parsearExcel(
  file: File
): Promise<{ ordenes: Orden[]; fechaReporte: string; fechaDesde: string; fechaHasta: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          raw: false,
          defval: "",
        }) as string[][];

        if (rows.length < 2) {
          reject(new Error("El archivo no contiene datos."));
          return;
        }

        const headers = rows[0].map((h) => String(h).trim().toUpperCase());
        const idx = (name: string) => headers.indexOf(name);

        const COL = {
          fechaReporte: idx("FECHA DE REPORTE"),
          id: idx("ID"),
          fecha: idx("FECHA"),
          cliente: idx("NOMBRE CLIENTE"),
          telefono: idx("TELÉFONO"),
          guia: idx("NÚMERO GUIA"),
          estatus: idx("ESTATUS"),
          ciudad: idx("CIUDAD DESTINO"),
          departamento: idx("DEPARTAMENTO DESTINO"),
          transportadora: idx("TRANSPORTADORA"),
          totalOrden: idx("TOTAL DE LA ORDEN"),
          ganancia: idx("GANANCIA"),
          producto: idx("PRODUCTO"),
          cantidad: idx("CANTIDAD"),
          novedad: idx("NOVEDAD"),
        };

        const fechaReporte =
          COL.fechaReporte >= 0 ? String(rows[1][COL.fechaReporte] ?? "") : "";

        const rawOrdenes: Orden[] = rows.slice(1).map((row) => {
          const get = (i: number) => (i >= 0 ? String(row[i] ?? "").trim() : "");
          const getNum = (i: number) =>
            i >= 0 ? parseFloat(String(row[i] ?? "0").replace(/,/g, "")) || 0 : 0;

          return {
            id: get(COL.id),
            fecha: get(COL.fecha),
            cliente: get(COL.cliente),
            telefono: get(COL.telefono),
            guia: get(COL.guia),
            estadoOriginal: get(COL.estatus),
            estadoGrupo: grupoDeEstado(get(COL.estatus)),
            ciudad: get(COL.ciudad),
            departamento: get(COL.departamento),
            transportadora: get(COL.transportadora),
            total: getNum(COL.totalOrden),
            ganancia: getNum(COL.ganancia),
            producto: get(COL.producto),
            cantidad: get(COL.cantidad),
            novedad: get(COL.novedad),
          };
        });

        // Merge filas con mismo ID (orden con múltiples productos)
        const mapaOrdenes = new Map<string, Orden>();
        for (const o of rawOrdenes) {
          if (!o.id) continue;
          if (mapaOrdenes.has(o.id)) {
            const base = mapaOrdenes.get(o.id)!;
            base.producto = base.producto
              ? `${base.producto} + ${o.producto}`
              : o.producto;
            base.cantidad = String(
              (parseInt(base.cantidad) || 0) + (parseInt(o.cantidad) || 0)
            );
            base.total += o.total;
            base.ganancia += o.ganancia;
            if (o.novedad && !base.novedad) base.novedad = o.novedad;
          } else {
            mapaOrdenes.set(o.id, { ...o });
          }
        }
        const ordenes = Array.from(mapaOrdenes.values());

        const fechas = ordenes.map((o) => o.fecha).filter(Boolean);
        const fechaDesde = fechas[fechas.length - 1] ?? "";
        const fechaHasta = fechas[0] ?? "";
        resolve({ ordenes, fechaReporte, fechaDesde, fechaHasta });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
}

function dmdyToISO(fecha: string): string {
  const [d, m, y] = fecha.split("-");
  if (!d || !m || !y) return "";
  return `${y}-${m}-${d}`;
}

function formatCOP(n: number) {
  if (!n) return "$0";
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export function LogisticaDashboard() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [fechaReporte, setFechaReporte] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [filtro, setFiltro] = useState<GrupoEstado | "Todas">("Todas");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [filtroDesdeISO, setFiltroDesdeISO] = useState("");
  const [filtroHastaISO, setFiltroHastaISO] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function procesar(file: File) {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("El archivo debe ser .xlsx o .xls");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const { ordenes: data, fechaReporte: fecha, fechaDesde: desde, fechaHasta: hasta } =
        await parsearExcel(file);
      setOrdenes(data);
      setFechaReporte(fecha);
      setFechaDesde(desde);
      setFechaHasta(hasta);
      setFiltroDesdeISO(dmdyToISO(desde));
      setFiltroHastaISO(dmdyToISO(hasta));
      setNombreArchivo(file.name);
      setFiltro("Todas");
    } catch {
      setError("No se pudo leer el archivo. Asegúrate de que sea el reporte de Dropi.");
    } finally {
      setCargando(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) procesar(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesar(file);
  }

  const ordenesFiltradas = ordenes.filter((o) => {
    if (!filtroDesdeISO && !filtroHastaISO) return true;
    const iso = dmdyToISO(o.fecha);
    if (filtroDesdeISO && iso < filtroDesdeISO) return false;
    if (filtroHastaISO && iso > filtroHastaISO) return false;
    return true;
  });

  const conteosPorGrupo = GRUPOS_ORDEN.reduce(
    (acc, g) => {
      acc[g] = ordenesFiltradas.filter((o) => o.estadoGrupo === g).length;
      return acc;
    },
    {} as Record<GrupoEstado, number>
  );

  const totalFacturado = ordenesFiltradas.reduce((s, o) => s + o.total, 0);
  const totalGanancia = ordenesFiltradas.reduce((s, o) => s + o.ganancia, 0);

  const filasFiltradas =
    filtro === "Todas"
      ? ordenesFiltradas
      : ordenesFiltradas.filter((o) => o.estadoGrupo === filtro);

  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const filasVisibles = filasFiltradas.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina
  );

  function cambiarFiltro(g: GrupoEstado | "Todas") {
    setFiltro(g);
    setPagina(1);
  }
  function cambiarPorPagina(n: number) {
    setPorPagina(n);
    setPagina(1);
  }

  // ── Estado vacío ────────────────────────────────────────────────────────────
  if (ordenes.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-3">
              Herramienta gratuita · Ecom Circle
            </p>
            <h1 className="font-extrabold text-4xl md:text-5xl text-white mb-2">
              Dashboard Logístico
            </h1>
            <p className="text-white/40 text-sm">
              Sube tu reporte diario de Dropi y visualiza el estado de tus órdenes.
            </p>
          </div>

          <div
            className={`rounded-2xl border-2 border-dashed p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${
              drag
                ? "border-[#FF5911]/60 bg-[#FF5911]/5"
                : "border-white/10 bg-[#161616] hover:border-white/20"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
              {cargando ? (
                <div className="w-5 h-5 border-2 border-[#FF5911]/40 border-t-[#FF5911] rounded-full animate-spin" />
              ) : (
                <UploadSimple size={24} weight="light" className="text-white/40" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60">
                {cargando ? "Procesando..." : "Arrastra tu archivo aquí o haz clic para subir"}
              </p>
              <p className="text-xs text-white/25 mt-1">Reporte .xlsx de Dropi</p>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      </div>
    );
  }

  // ── Dashboard con datos ──────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pt-24 pb-20 px-6">
      <div className="w-full flex flex-col gap-6">

        {/* Header */}
        <div className="bg-[#161616] border border-white/8 rounded-2xl px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-xs tracking-widest uppercase text-[#FF5911]">
              Dashboard Logístico · Ecom Circle
            </p>
            <h1 className="font-extrabold text-xl text-white leading-tight truncate">
              {nombreArchivo}
            </h1>
            <p className="text-xs text-white/30">
              {fechaDesde && fechaHasta
                ? `Reporte del ${fechaDesde}${fechaDesde !== fechaHasta ? ` al ${fechaHasta}` : ""}`
                : fechaReporte}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
            <span className="text-xs text-white/30 shrink-0">Filtrar</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filtroDesdeISO}
                min={dmdyToISO(fechaDesde)}
                max={filtroHastaISO || dmdyToISO(fechaHasta)}
                onChange={(e) => { setFiltroDesdeISO(e.target.value); setPagina(1); }}
                className="bg-transparent text-sm text-white/70 outline-none cursor-pointer [color-scheme:dark]"
              />
              <span className="text-white/20">—</span>
              <input
                type="date"
                value={filtroHastaISO}
                min={filtroDesdeISO || dmdyToISO(fechaDesde)}
                max={dmdyToISO(fechaHasta)}
                onChange={(e) => { setFiltroHastaISO(e.target.value); setPagina(1); }}
                className="bg-transparent text-sm text-white/70 outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
            {(filtroDesdeISO !== dmdyToISO(fechaDesde) ||
              filtroHastaISO !== dmdyToISO(fechaHasta)) && (
              <button
                onClick={() => {
                  setFiltroDesdeISO(dmdyToISO(fechaDesde));
                  setFiltroHastaISO(dmdyToISO(fechaHasta));
                  setPagina(1);
                }}
                className="text-xs text-[#FF5911]/70 hover:text-[#FF5911] transition shrink-0"
              >
                Limpiar
              </button>
            )}
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 bg-white/5 border border-white/8 text-white/50 text-sm rounded-xl px-4 py-2.5 hover:bg-white/8 hover:text-white/70 transition shrink-0"
          >
            <UploadSimple size={15} />
            Cargar otro
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onInputChange}
          />
        </div>

        {/* Resumen general */}
        <p className="text-sm tracking-widest uppercase text-white font-semibold">Resumen general</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total órdenes", value: ordenesFiltradas.length.toString() },
            { label: "Total facturado", value: formatCOP(totalFacturado) },
            { label: "Ganancia neta", value: formatCOP(totalGanancia) },
            {
              label: "Ticket promedio",
              value: ordenesFiltradas.length
                ? formatCOP(totalFacturado / ordenesFiltradas.length)
                : "$0",
            },
            {
              label: "Tasa de devolución",
              value: (() => {
                const dev = conteosPorGrupo["Devolución"];
                const ent = conteosPorGrupo["Entregado"];
                return dev + ent > 0
                  ? `${Math.round((dev / (dev + ent)) * 100)}%`
                  : "0%";
              })(),
            },
          ].map((m) => (
            <div key={m.label} className="bg-[#161616] border border-white/8 rounded-2xl p-4">
              <p className="text-xs tracking-widest uppercase text-white/30 mb-1">{m.label}</p>
              <p className="text-xl font-extrabold text-white">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Estados generales */}
        <div className="flex flex-col gap-2">
          <p className="text-sm tracking-widest uppercase text-white font-semibold">Estados generales</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {GRUPOS_ORDEN.map((grupo) => {
              const cfg = GRUPO_CONFIG[grupo];
              const Icon = cfg.icon;
              const count = conteosPorGrupo[grupo];
              const pct = ordenesFiltradas.length
                ? Math.round((count / ordenesFiltradas.length) * 100)
                : 0;
              return (
                <button
                  key={grupo}
                  onClick={() => cambiarFiltro(filtro === grupo ? "Todas" : grupo)}
                  className={`rounded-2xl border p-4 flex flex-col gap-2 text-left transition-all ${
                    filtro === grupo
                      ? `${cfg.bg} ${cfg.border}`
                      : "bg-[#161616] border-white/8 hover:border-white/15"
                  }`}
                >
                  <Icon
                    size={22}
                    weight="light"
                    className={filtro === grupo ? cfg.color : "text-white/30"}
                  />
                  <div>
                    <p className="text-2xl font-extrabold text-white leading-none">{count}</p>
                    <p className={`text-xs mt-1 leading-snug ${filtro === grupo ? cfg.color : "text-white/35"}`}>
                      {grupo}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">{pct}%</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Distribución */}
        <p className="text-sm tracking-widest uppercase text-white font-semibold">Distribución</p>
        <div className="bg-[#161616] border border-white/8 rounded-2xl p-6 flex gap-8 items-center">
          {/* Donut SVG */}
          {(() => {
            const r = 70;
            const cx = 100;
            const cy = 100;
            const circum = 2 * Math.PI * r;
            const BAR_COLOR: Record<GrupoEstado, string> = {
              "Guía generada": "#3b82f6",
              Despachado:      "#f59e0b",
              Novedad:         "#f97316",
              Devolución:      "#ef4444",
              Cancelado:       "rgba(255,255,255,0.2)",
              Entregado:       "#10b981",
            };
            let offset = 0;
            const totalSinCancelado = ordenesFiltradas.filter(
              (o) => o.estadoGrupo !== "Cancelado"
            ).length;
            const pctEntregado = totalSinCancelado
              ? Math.round((conteosPorGrupo["Entregado"] / totalSinCancelado) * 100)
              : 0;
            return (
              <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={18}
                  />
                  {GRUPOS_ORDEN.filter((g) => g !== "Cancelado").map((grupo) => {
                    const count = conteosPorGrupo[grupo];
                    if (!count) return null;
                    const pct = count / totalSinCancelado;
                    const dash = pct * circum;
                    const gap = circum - dash;
                    const seg = (
                      <circle
                        key={grupo}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={BAR_COLOR[grupo]}
                        strokeWidth={18}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={circum * 0.25 - offset}
                        strokeLinecap="butt"
                      />
                    );
                    offset += dash;
                    return seg;
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{pctEntregado}%</span>
                  <span className="text-xs text-white/30 mt-0.5">entregado</span>
                </div>
              </div>
            );
          })()}

          {/* Leyenda */}
          <div className="flex flex-col gap-3 flex-1">
            <p className="text-xs tracking-widest uppercase text-white/25 mb-1">Por estado</p>
            {GRUPOS_ORDEN.filter((g) => g !== "Cancelado").map((grupo) => {
              const cfg = GRUPO_CONFIG[grupo];
              const count = conteosPorGrupo[grupo];
              const totalSinCancelado = ordenesFiltradas.filter(
                (o) => o.estadoGrupo !== "Cancelado"
              ).length;
              const pct = totalSinCancelado ? (count / totalSinCancelado) * 100 : 0;
              const BAR_COLOR_TW: Record<GrupoEstado, string> = {
                "Guía generada": "bg-blue-500",
                Despachado:      "bg-amber-500",
                Novedad:         "bg-orange-500",
                Devolución:      "bg-red-500",
                Cancelado:       "bg-white/20",
                Entregado:       "bg-emerald-500",
              };
              return (
                <div key={grupo} className="flex items-center gap-3">
                  <span className={`text-sm w-32 shrink-0 ${cfg.color}`}>{grupo}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${BAR_COLOR_TW[grupo]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-white/40 w-10 text-right">{Math.round(pct)}%</span>
                  <span className="text-sm text-white/25 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Análisis por categoría */}
        <p className="text-sm tracking-widest uppercase text-white font-semibold">Análisis por categoría</p>
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { titulo: "Por transportadora", key: "transportadora" as keyof Orden },
              { titulo: "Por departamento",   key: "departamento"   as keyof Orden },
              { titulo: "Por producto",        key: "producto"       as keyof Orden },
            ] as { titulo: string; key: keyof Orden }[]
          ).map(({ titulo, key }) => {
            const conteo: Record<string, number> = {};
            for (const o of ordenesFiltradas) {
              const val = (o[key] as string) || "Sin dato";
              conteo[val] = (conteo[val] ?? 0) + 1;
            }
            const items = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const total = ordenesFiltradas.length;
            return (
              <div key={titulo} className="bg-[#161616] border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-xs tracking-widest uppercase text-white/25">{titulo}</p>
                <div className="flex flex-col gap-2.5">
                  {items.map(([nombre, count]) => {
                    const pct = total ? (count / total) * 100 : 0;
                    return (
                      <div key={nombre} className="flex items-center gap-3">
                        <span className="text-sm text-white/60 truncate flex-1 min-w-0">{nombre}</span>
                        <div className="w-28 shrink-0 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#FF5911]/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-white/35 w-9 text-right shrink-0">{Math.round(pct)}%</span>
                        <span className="text-sm text-white/20 w-8 text-right shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Eficiencia operativa */}
        <p className="text-sm tracking-widest uppercase text-white font-semibold">Eficiencia operativa</p>
        {(() => {
          const trans: Record<string, { total: number; entregadas: number; devoluciones: number }> = {};
          for (const o of ordenesFiltradas) {
            const t = o.transportadora || "Sin dato";
            if (!trans[t]) trans[t] = { total: 0, entregadas: 0, devoluciones: 0 };
            trans[t].total++;
            if (o.estadoGrupo === "Entregado") trans[t].entregadas++;
            if (o.estadoGrupo === "Devolución") trans[t].devoluciones++;
          }
          const items = Object.entries(trans).sort((a, b) => b[1].total - a[1].total);
          return (
            <div className="bg-[#161616] border border-white/8 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#111]">
                  <tr>
                    {["Transportadora", "Total", "Entregadas", "Tasa entrega", "Devoluciones", "Tasa devolución"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs tracking-widest uppercase text-white/25 px-5 py-3 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(([nombre, d]) => {
                    const tasaEnt = d.total ? (d.entregadas / d.total) * 100 : 0;
                    const tasaDev = d.total ? (d.devoluciones / d.total) * 100 : 0;
                    return (
                      <tr key={nombre} className="border-t border-white/4 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3 text-white/70 font-medium">{nombre}</td>
                        <td className="px-5 py-3 text-white/40">{d.total}</td>
                        <td className="px-5 py-3 text-emerald-400">{d.entregadas}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${tasaEnt}%` }} />
                            </div>
                            <span className="text-sm text-emerald-400 font-semibold">{Math.round(tasaEnt)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-red-400">{d.devoluciones}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-red-500" style={{ width: `${tasaDev}%` }} />
                            </div>
                            <span className="text-sm text-red-400 font-semibold">{Math.round(tasaDev)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* Novedades + Gráfica por fecha */}
        <div className="grid grid-cols-2 gap-4 items-stretch" style={{ gridAutoRows: "400px" }}>
          {/* Novedades agrupadas */}
          {(() => {
            const novedades: Record<string, number> = {};
            for (const o of ordenesFiltradas) {
              const n = o.novedad?.trim();
              if (n) novedades[n] = (novedades[n] ?? 0) + 1;
            }
            const items = Object.entries(novedades).sort((a, b) => b[1] - a[1]);
            const totalNov = items.reduce((s, [, c]) => s + c, 0);
            return (
              <div className="bg-[#161616] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 h-full">
                <p className="text-xs tracking-widest uppercase text-white/25">
                  Novedades{" "}
                  <span className="text-white/40 normal-case tracking-normal">({totalNov})</span>
                </p>
                {items.length === 0 ? (
                  <p className="text-sm text-white/25">Sin novedades registradas</p>
                ) : (
                  <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
                    {items.map(([nombre, count]) => {
                      const pct = totalNov ? (count / totalNov) * 100 : 0;
                      return (
                        <div key={nombre} className="flex items-center gap-3">
                          <span className="text-sm text-orange-400/80 truncate flex-1 min-w-0">
                            {nombre}
                          </span>
                          <div className="w-28 shrink-0 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-orange-500/60"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm text-white/35 w-9 text-right shrink-0">
                            {Math.round(pct)}%
                          </span>
                          <span className="text-sm text-white/20 w-8 text-right shrink-0">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Órdenes por fecha */}
          {(() => {
            const porFecha: Record<string, number> = {};
            for (const o of ordenesFiltradas) {
              if (o.fecha) porFecha[o.fecha] = (porFecha[o.fecha] ?? 0) + 1;
            }
            const diasConDatos = Object.entries(porFecha).sort((a, b) =>
              a[0].localeCompare(b[0])
            );
            if (diasConDatos.length < 2) return null;

            const primerISO = dmdyToISO(diasConDatos[0][0]);
            const ultimoISO = dmdyToISO(diasConDatos[diasConDatos.length - 1][0]);
            const dias: [string, number][] = [];
            const cur = new Date(primerISO);
            const fin = new Date(ultimoISO);
            while (cur <= fin) {
              const dd = String(cur.getDate()).padStart(2, "0");
              const mm = String(cur.getMonth() + 1).padStart(2, "0");
              const yyyy = cur.getFullYear();
              const dmdy = `${dd}-${mm}-${yyyy}`;
              dias.push([dmdy, porFecha[dmdy] ?? 0]);
              cur.setDate(cur.getDate() + 1);
            }

            const maxVal = Math.max(...dias.map(([, c]) => c));
            const totalOrd = dias.reduce((s, [, c]) => s + c, 0);
            const promedio = Math.round(totalOrd / dias.length);
            const data = dias.map(([fecha, count]) => ({ fecha: fecha.slice(0, 5), count }));

            return (
              <div className="bg-[#161616] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <p className="text-xs tracking-widest uppercase text-white/25">Órdenes por fecha</p>
                  <div className="flex gap-5 text-xs text-white/40">
                    <span>
                      Total <span className="text-white font-semibold">{totalOrd}</span>
                    </span>
                    <span>
                      Promedio/día <span className="text-white font-semibold">{promedio}</span>
                    </span>
                    <span>
                      Pico <span className="text-[#FF5911] font-semibold">{maxVal}</span>
                    </span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    barCategoryGap="20%"
                    margin={{ top: 8, right: 4, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={dias.length > 20 ? Math.floor(dias.length / 10) : 0}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        fontSize: 13,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                      itemStyle={{ color: "#FF5911" }}
                      formatter={(v: unknown) => [
                        typeof v === "number" ? v.toLocaleString() : String(v ?? ""),
                        "Órdenes",
                      ]}
                    />
                    <ReferenceLine
                      y={promedio}
                      stroke="#FF5911"
                      strokeDasharray="4 3"
                      strokeOpacity={0.4}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                      {data.map((entry) => (
                        <Cell
                          key={entry.fecha}
                          fill="#FF5911"
                          opacity={entry.count === maxVal ? 1 : 0.5}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </div>

        {/* Detalle de órdenes */}
        <p className="text-sm tracking-widest uppercase text-white font-semibold">Detalle de órdenes</p>
        <div className="bg-[#161616] border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1 p-3 border-b border-white/6 overflow-x-auto">
            {(["Todas", ...GRUPOS_ORDEN] as (GrupoEstado | "Todas")[]).map((g) => {
              const activo = filtro === g;
              return (
                <button
                  key={g}
                  onClick={() => cambiarFiltro(g)}
                  className={`text-sm whitespace-nowrap px-3 py-1.5 rounded-lg transition ${
                    activo
                      ? "bg-[#FF5911] text-white font-semibold"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {g}
                  {g !== "Todas" && (
                    <span className="ml-1 opacity-60">
                      ({conteosPorGrupo[g as GrupoEstado]})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#111]">
                <tr>
                  {[
                    "ID",
                    "Fecha",
                    "Cliente",
                    "Producto",
                    "Cant.",
                    "Estado general",
                    "Estado Dropi",
                    "Ciudad",
                    "Transportadora",
                    "Total",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs tracking-widest uppercase text-white/25 px-4 py-3 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filasVisibles.map((o, i) => {
                  const cfg = GRUPO_CONFIG[o.estadoGrupo];
                  return (
                    <tr
                      key={o.id + i}
                      className="border-t border-white/4 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3 text-white/50 font-mono">{o.id}</td>
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap">{o.fecha}</td>
                      <td className="px-4 py-3 text-white/70 max-w-[140px] truncate">
                        {o.cliente}
                      </td>
                      <td className="px-4 py-3 text-white/60 max-w-[160px] truncate">
                        {o.producto}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-center">{o.cantidad}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                        >
                          {o.estadoGrupo}
                        </span>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-xs ${cfg.color}`}>
                        {o.estadoOriginal}
                      </td>
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap">{o.ciudad}</td>
                      <td className="px-4 py-3 text-white/40">{o.transportadora}</td>
                      <td className="px-4 py-3 text-white/60 text-right whitespace-nowrap">
                        {formatCOP(o.total)}
                      </td>
                    </tr>
                  );
                })}
                {filasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-white/25 text-sm">
                      Sin órdenes en este estado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-white/6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/25">
                {filasFiltradas.length} orden{filasFiltradas.length !== 1 ? "es" : ""}
                {filtro !== "Todas" && ` · "${filtro}"`}
              </span>
              <div className="flex items-center gap-1">
                {[10, 50, 100, 500, 1000].map((n) => (
                  <button
                    key={n}
                    onClick={() => cambiarPorPagina(n)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition ${
                      porPagina === n
                        ? "bg-white/10 text-white"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(1)}
                disabled={paginaActual === 1}
                className="text-xs px-2.5 py-1 rounded-lg text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition"
              >
                «
              </button>
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="text-xs px-2.5 py-1 rounded-lg text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition"
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPaginas ||
                    Math.abs(p - paginaActual) <= 2
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="text-xs px-2 text-white/20">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPagina(p as number)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition ${
                        paginaActual === p
                          ? "bg-[#FF5911] text-white font-semibold"
                          : "text-white/30 hover:text-white/60"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="text-xs px-2.5 py-1 rounded-lg text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition"
              >
                ›
              </button>
              <button
                onClick={() => setPagina(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                className="text-xs px-2.5 py-1 rounded-lg text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition"
              >
                »
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
