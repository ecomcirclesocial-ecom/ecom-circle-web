"use client";

import { useState, useMemo } from "react";

type Pais = "colombia" | "ecuador";

const DEFAULTS: Record<Pais, {
  inversion: number; precioVenta: number; costoProducto: number;
  costoPlataforma: number; flete: number; costoDev: number;
  gastoAdmin: number; pctDespachos: number; pctEntregas: number;
  moneda: string;
}> = {
  colombia: {
    inversion: 100000, precioVenta: 89900, costoProducto: 35000,
    costoPlataforma: 0, flete: 15000, costoDev: 15000,
    gastoAdmin: 2000, pctDespachos: 80, pctEntregas: 80, moneda: "COP",
  },
  ecuador: {
    inversion: 500, precioVenta: 50, costoProducto: 10,
    costoPlataforma: 0, flete: 10, costoDev: 10,
    gastoAdmin: 1, pctDespachos: 85, pctEntregas: 85, moneda: "USD",
  },
};

const CPA_PCTS = [8, 10, 12, 15, 18, 20, 25, 30, 35, 40];

function fmt(n: number, moneda: string) {
  if (moneda === "USD") return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

function calcular(p: typeof DEFAULTS.colombia) {
  const totalCostos = p.costoProducto + p.costoPlataforma + p.flete;
  const margenBruto = p.precioVenta > 0 ? (p.precioVenta - totalCostos) / p.precioVenta : 0;
  const liquidacion = p.precioVenta - totalCostos;

  const filas = CPA_PCTS.map((pct) => {
    const cpa = (pct / 100) * p.precioVenta;
    const pedidos = cpa > 0 ? p.inversion / cpa : 0;
    const despachados = pedidos * (p.pctDespachos / 100);
    const entregas = despachados * (p.pctEntregas / 100);
    const devoluciones = despachados - entregas;
    const ingresoBruto = entregas * p.precioVenta * margenBruto;
    const costoDev = devoluciones * p.costoDev;
    const gastosAdmin = pedidos * p.gastoAdmin;
    const ganancia = ingresoBruto - p.inversion - costoDev - gastosAdmin;
    const ventaTotal = pedidos * p.precioVenta;
    return { pct, cpa, pedidos, despachados, entregas, ganancia, ventaTotal, roi: p.inversion > 0 ? ganancia / p.inversion : 0 };
  });

  return { margenBruto, totalCostos, liquidacion, filas };
}

function fmtInput(n: number) {
  if (!n && n !== 0) return "";
  return Math.round(n).toLocaleString("es-CO");
}


function InputField({ label, value, onChange, prefix }: { label: string; value: number; onChange: (v: number) => void; prefix?: string }) {
  const [focused, setFocused] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw === "" ? 0 : Number(raw));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-widest uppercase text-white/40">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">{prefix}</span>}
        <input
          type="text"
          inputMode="numeric"
          value={focused ? (value === 0 ? "" : String(value)) : fmtInput(value)}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-[#1a1a1a] border border-white/10 rounded-xl text-white text-sm py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50 ${prefix ? "pl-7 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

function PctField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-widest uppercase text-white/40">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl text-white text-sm py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#FF5911]/40 focus:border-[#FF5911]/50"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
      </div>
    </div>
  );
}

export function CalculadoraProducto() {
  const [pais, setPais] = useState<Pais>("colombia");
  const [params, setParams] = useState(DEFAULTS.colombia);

  function handlePais(p: Pais) {
    setPais(p);
    setParams(DEFAULTS[p]);
  }

  function set(key: keyof typeof params, val: number) {
    setParams((prev) => ({ ...prev, [key]: val }));
  }

  const { margenBruto, totalCostos, liquidacion, filas } = useMemo(() => calcular(params), [params]);
  const moneda = params.moneda;

  return (
    <main className="min-h-[100dvh] bg-[#0A0A0A] pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-2">Herramienta gratuita · Ecom Circle</p>
          <h1 className="font-extrabold text-4xl md:text-5xl text-white leading-tight">Calculadora de Producto</h1>
          <p className="text-white/40 text-sm mt-2 max-w-md leading-relaxed">
            Calcula el margen real y analiza hasta qué CPA eres rentable con tu presupuesto de pauta.
          </p>
        </div>

        {/* País selector */}
        <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-xl p-1 w-fit">
          {(["colombia", "ecuador"] as Pais[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePais(p)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${pais === p ? "bg-[#FF5911] text-white" : "text-white/40 hover:text-white/70"}`}
            >
              {p === "colombia" ? "Colombia" : "Ecuador"}
            </button>
          ))}
        </div>

        {/* Parámetros */}
        <div className="bg-[#161616] border border-white/8 rounded-2xl p-6 flex flex-col gap-6">
          <p className="text-xs tracking-widest uppercase text-[#FF5911] font-bold">Parámetros del producto</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InputField label="Inversión en publicidad" value={params.inversion} onChange={(v) => set("inversion", v)} prefix="$" />
            <InputField label="Precio de venta" value={params.precioVenta} onChange={(v) => set("precioVenta", v)} prefix="$" />
            <InputField label="Costo del producto" value={params.costoProducto} onChange={(v) => set("costoProducto", v)} prefix="$" />
            <InputField label="Costos plataforma" value={params.costoPlataforma} onChange={(v) => set("costoPlataforma", v)} prefix="$" />
            <InputField label="Flete promedio" value={params.flete} onChange={(v) => set("flete", v)} prefix="$" />
            <InputField label="Costo devolución" value={params.costoDev} onChange={(v) => set("costoDev", v)} prefix="$" />
            <InputField label="Gasto admin x pedido" value={params.gastoAdmin} onChange={(v) => set("gastoAdmin", v)} prefix="$" />
            <PctField label="% Despachos" value={params.pctDespachos} onChange={(v) => set("pctDespachos", v)} />
            <PctField label="% Entregas" value={params.pctEntregas} onChange={(v) => set("pctEntregas", v)} />
          </div>

          {/* Resumen margen */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/8">
            <div className="bg-white/5 border border-white/8 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[10px] tracking-widest uppercase text-white/40">Total costos</span>
              <span className="text-lg font-bold text-white">{fmt(totalCostos, moneda)}</span>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[10px] tracking-widest uppercase text-white/40">Liquidación x venta</span>
              <span className="text-lg font-bold text-white">{fmt(liquidacion, moneda)}</span>
            </div>
            <div className={`border rounded-xl p-4 flex flex-col gap-1 ${margenBruto >= 0.4 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
              <span className="text-[10px] tracking-widest uppercase text-white/40">Margen bruto</span>
              <span className={`text-lg font-bold ${margenBruto >= 0.4 ? "text-emerald-400" : "text-yellow-400"}`}>
                {(margenBruto * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-white/30">{margenBruto >= 0.4 ? "Ideal (40%+)" : "Bajo recomendado"}</span>
            </div>
          </div>
        </div>

        {/* Tabla de sensibilidad */}
        <div className="bg-[#161616] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#FF5911] font-bold">Análisis de rentabilidad por CPA</p>
            <p className="text-xs text-white/30 mt-1">Basado en {fmt(params.inversion, moneda)} de inversión en publicidad</p>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-[10px] tracking-widest uppercase text-white/30 pb-3 pr-4 font-normal">% CPA</th>
                  <th className="text-right text-[10px] tracking-widest uppercase text-white/30 pb-3 px-2 font-normal">CPA</th>
                  <th className="text-right text-[10px] tracking-widest uppercase text-white/30 pb-3 px-2 font-normal">Pedidos</th>
                  <th className="text-right text-[10px] tracking-widest uppercase text-white/30 pb-3 px-2 font-normal">Entregas</th>
                  <th className="text-right text-[10px] tracking-widest uppercase text-white/30 pb-3 px-2 font-normal">Ganancia</th>
                  <th className="text-right text-[10px] tracking-widest uppercase text-white/30 pb-3 pl-2 font-normal">ROI</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => {
                  const rentable = f.ganancia > 0;
                  const puntoCero = Math.abs(f.ganancia) < params.precioVenta * 0.5;
                  return (
                    <tr key={f.pct} className={`border-b border-white/5 transition-colors ${rentable ? "hover:bg-white/3" : "hover:bg-white/2"}`}>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${rentable ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                          {f.pct}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-white/60 tabular-nums">{fmt(f.cpa, moneda)}</td>
                      <td className="py-3 px-2 text-right text-white/60 tabular-nums">{f.pedidos.toFixed(1)}</td>
                      <td className="py-3 px-2 text-right text-white/60 tabular-nums">{f.entregas.toFixed(1)}</td>
                      <td className={`py-3 px-2 text-right font-semibold tabular-nums ${rentable ? "text-emerald-400" : "text-red-400"}`}>
                        {f.ganancia >= 0 ? "" : "-"}{fmt(Math.abs(f.ganancia), moneda)}
                      </td>
                      <td className={`py-3 pl-2 text-right font-semibold tabular-nums ${rentable ? "text-emerald-400" : "text-red-400"}`}>
                        {(f.roi * 100).toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-white/20 leading-relaxed pt-2 border-t border-white/5">
            ROI = Ganancia / Inversión en publicidad. Verde = rentable. El margen recomendado para dropshipping es 40%+.
          </p>
        </div>

      </div>
    </main>
  );
}
