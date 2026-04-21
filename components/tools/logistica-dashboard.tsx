"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  UploadSimple,
  Package,
  CheckCircle,
  Warning,
  ArrowCounterClockwise,
  Truck,
  XCircle,
  FileXls,
} from "@phosphor-icons/react";

// ── Tipos ──────────────────────────────────────────────────────────────────

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

// ── Mapeo de estados ────────────────────────────────────────────────────────

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
  DEVOLUCION: "Devolución",
  CANCELADO: "Cancelado",
  ENTREGADO: "Entregado",
};

function grupoDeEstado(estatus: string): GrupoEstado {
  const key = (estatus ?? "").toUpperCase().trim();
  return GRUPOS[key] ?? "Despachado";
}

// ── Config visual por grupo ─────────────────────────────────────────────────

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

// ── Parseo del Excel ────────────────────────────────────────────────────────

function parsearExcel(file: File): Promise<{ ordenes: Orden[]; fechaReporte: string }> {
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

        const ordenes: Orden[] = rows.slice(1).map((row) => {
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

        resolve({ ordenes, fechaReporte });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
}

// ── Formato de moneda ───────────────────────────────────────────────────────

function formatCOP(n: number) {
  if (!n) return "$0";
  return "$" + Math.round(n).toLocaleString("es-CO");
}

// ── Componente principal ────────────────────────────────────────────────────

export function LogisticaDashboard() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [fechaReporte, setFechaReporte] = useState("");
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [filtro, setFiltro] = useState<GrupoEstado | "Todas">("Todas");
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
      const { ordenes: data, fechaReporte: fecha } = await parsearExcel(file);
      setOrdenes(data);
      setFechaReporte(fecha);
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

  // Métricas
  const conteosPorGrupo = GRUPOS_ORDEN.reduce(
    (acc, g) => {
      acc[g] = ordenes.filter((o) => o.estadoGrupo === g).length;
      return acc;
    },
    {} as Record<GrupoEstado, number>
  );

  const totalFacturado = ordenes.reduce((s, o) => s + o.total, 0);
  const totalGanancia = ordenes.reduce((s, o) => s + o.ganancia, 0);

  const filasFiltradas =
    filtro === "Todas" ? ordenes : ordenes.filter((o) => o.estadoGrupo === filtro);

  // ── Estado vacío ──────────────────────────────────────────────────────────

  if (ordenes.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
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

          {/* Zona de carga */}
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

  // ── Dashboard con datos ───────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header + acción cargar otro */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-1">
              Dashboard Logístico · Ecom Circle
            </p>
            <h1 className="font-extrabold text-2xl text-white">
              {fechaReporte || "Reporte"}
            </h1>
            <p className="text-xs text-white/30 mt-0.5">{nombreArchivo}</p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 bg-white/5 border border-white/8 text-white/50 text-xs rounded-xl px-4 py-2.5 hover:bg-white/8 hover:text-white/70 transition"
          >
            <UploadSimple size={14} />
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

        {/* Métricas globales */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total órdenes", value: ordenes.length.toString() },
            { label: "Total facturado", value: formatCOP(totalFacturado) },
            { label: "Ganancia neta", value: formatCOP(totalGanancia) },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-[#161616] border border-white/8 rounded-2xl p-4"
            >
              <p className="text-xs tracking-widest uppercase text-white/30 mb-1">
                {m.label}
              </p>
              <p className="text-xl font-extrabold text-white">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Cards por grupo */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {GRUPOS_ORDEN.map((grupo) => {
            const cfg = GRUPO_CONFIG[grupo];
            const Icon = cfg.icon;
            const count = conteosPorGrupo[grupo];
            const pct = ordenes.length
              ? Math.round((count / ordenes.length) * 100)
              : 0;
            return (
              <button
                key={grupo}
                onClick={() => setFiltro(filtro === grupo ? "Todas" : grupo)}
                className={`rounded-2xl border p-4 flex flex-col gap-2 text-left transition-all ${
                  filtro === grupo
                    ? `${cfg.bg} ${cfg.border}`
                    : "bg-[#161616] border-white/8 hover:border-white/15"
                }`}
              >
                <Icon
                  size={18}
                  weight="light"
                  className={filtro === grupo ? cfg.color : "text-white/30"}
                />
                <div>
                  <p className="text-lg font-extrabold text-white leading-none">
                    {count}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 leading-snug ${
                      filtro === grupo ? cfg.color : "text-white/35"
                    }`}
                  >
                    {grupo}
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5">{pct}%</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tabla */}
        <div className="bg-[#161616] border border-white/8 rounded-2xl overflow-hidden">
          {/* Tabs filtro */}
          <div className="flex items-center gap-1 p-3 border-b border-white/6 overflow-x-auto">
            {(["Todas", ...GRUPOS_ORDEN] as (GrupoEstado | "Todas")[]).map(
              (g) => {
                const activo = filtro === g;
                return (
                  <button
                    key={g}
                    onClick={() => setFiltro(g)}
                    className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-lg transition ${
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
              }
            )}
          </div>

          {/* Scroll table */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#111]">
                <tr>
                  {[
                    "ID",
                    "Fecha",
                    "Cliente",
                    "Producto",
                    "Cant.",
                    "Estado",
                    "Ciudad",
                    "Transportadora",
                    "Total",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] tracking-widest uppercase text-white/25 px-4 py-3 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filasFiltradas.map((o, i) => {
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
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                        >
                          {o.estadoGrupo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                        {o.ciudad}
                      </td>
                      <td className="px-4 py-3 text-white/40">{o.transportadora}</td>
                      <td className="px-4 py-3 text-white/60 text-right whitespace-nowrap">
                        {formatCOP(o.total)}
                      </td>
                    </tr>
                  );
                })}
                {filasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-white/25 text-sm">
                      Sin órdenes en este estado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer tabla */}
          <div className="px-4 py-2.5 border-t border-white/6 text-[11px] text-white/25">
            {filasFiltradas.length} orden{filasFiltradas.length !== 1 ? "es" : ""}
            {filtro !== "Todas" && ` en "${filtro}"`}
          </div>
        </div>

      </div>
    </div>
  );
}
