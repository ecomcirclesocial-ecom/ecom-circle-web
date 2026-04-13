"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Warning } from "@phosphor-icons/react";

type Criterio = {
  pregunta: string;
  peso: number;
  respuesta: boolean | null;
};

const criteriosIniciales: Criterio[] = [
  { pregunta: "¿El producto resuelve un problema concreto o satisface un deseo claro?", peso: 20, respuesta: null },
  { pregunta: "¿El precio de venta puede ser al menos 3x el costo del producto?", peso: 20, respuesta: null },
  { pregunta: "¿Hay demanda comprobada (lo buscan en Google o se vende en otras tiendas)?", peso: 20, respuesta: null },
  { pregunta: "¿El producto es fácil de enviar (pequeño, liviano, no frágil)?", peso: 15, respuesta: null },
  { pregunta: "¿Tiene potencial viral o de recomendación boca a boca?", peso: 10, respuesta: null },
  { pregunta: "¿El nicho de clientes es claro y se puede segmentar fácilmente?", peso: 15, respuesta: null },
];

export function ProductValidator() {
  const [criterios, setCriterios] = useState<Criterio[]>(criteriosIniciales);

  const respondidos = criterios.filter((c) => c.respuesta !== null).length;
  const puntaje = criterios
    .filter((c) => c.respuesta === true)
    .reduce((acc, c) => acc + c.peso, 0);

  const total = criteriosIniciales.reduce((a, c) => a + c.peso, 0);
  const porcentaje = respondidos === criterios.length ? Math.round((puntaje / total) * 100) : null;

  function responder(i: number, valor: boolean) {
    setCriterios((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, respuesta: valor } : c))
    );
  }

  function reiniciar() {
    setCriterios(criteriosIniciales.map((c) => ({ ...c, respuesta: null })));
  }

  const veredicto =
    porcentaje === null
      ? null
      : porcentaje >= 75
      ? { texto: "Producto con buen potencial", color: "emerald", icono: CheckCircle }
      : porcentaje >= 50
      ? { texto: "Potencial moderado — evalúa los puntos débiles", color: "amber", icono: Warning }
      : { texto: "Producto riesgoso — considera otra opción", color: "red", icono: XCircle };

  return (
    <div className="flex flex-col gap-5">
      {/* Criterios */}
      {criterios.map((c, i) => (
        <div key={i} className="p-1.5 rounded-[1.5rem] bg-white/50 ring-1 ring-black/6">
          <div className="p-5 rounded-[calc(1.5rem-6px)] bg-[#FDFBF7] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col gap-4">
            <p className="text-sm text-[#0A0A0A]/75 leading-relaxed">{c.pregunta}</p>
            <div className="flex gap-2">
              <button
                onClick={() => responder(i, true)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  c.respuesta === true
                    ? "bg-[#0A0A0A] text-white"
                    : "bg-black/5 text-[#0A0A0A]/55 hover:bg-black/10"
                }`}
              >
                Sí
              </button>
              <button
                onClick={() => responder(i, false)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  c.respuesta === false
                    ? "bg-[#0A0A0A] text-white"
                    : "bg-black/5 text-[#0A0A0A]/55 hover:bg-black/10"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Resultado */}
      {porcentaje !== null && veredicto && (
        <div className="p-1.5 rounded-[1.5rem] bg-[#0A0A0A] ring-1 ring-black/5">
          <div className="p-6 rounded-[calc(1.5rem-6px)] bg-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-xs tracking-widest uppercase">Resultado</p>
              <span className="text-2xl font-bold text-white">{porcentaje}%</span>
            </div>
            <div className="flex items-center gap-2">
              <veredicto.icono size={18} weight="fill" className={`text-${veredicto.color}-400`} />
              <p className={`text-sm font-medium text-${veredicto.color}-400`}>{veredicto.texto}</p>
            </div>
            <button
              onClick={reiniciar}
              className="mt-1 text-xs text-white/30 hover:text-white/60 transition-colors self-start"
            >
              Evaluar otro producto →
            </button>
          </div>
        </div>
      )}

      {/* Progreso */}
      {respondidos > 0 && porcentaje === null && (
        <p className="text-xs text-[#0A0A0A]/40 text-center">
          {respondidos} de {criterios.length} criterios respondidos
        </p>
      )}
    </div>
  );
}
