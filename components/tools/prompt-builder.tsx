"use client";

import { useState, useRef } from "react";
import { Copy, Check, ArrowRight, ArrowLeft, Sparkle, Image as ImgIcon, PencilSimple } from "@phosphor-icons/react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Flujo = "AIDA" | "PAS" | "OBC" | "HOOK";
type ModoInput = "manual" | "imagen";
type ModoApertura = "ia" | "manual";

interface FormData {
  nombreAgente: string;
  enfoque: string;
  metodo: string;
  tono: string;
  producto: string;
  problema: string;
  caracteristicas: string;
  beneficios: string;
  tieneTalla: boolean;
  precio1: string;
  precio2: string;
  precio3: string;
  entrega: string;
  pago: string;
  flujo: Flujo;
  modoApertura: ModoApertura;
  aperturaSeleccionada: string;
  aperturaManual: string;
  upsellProducto: string;
  upsellPrecio: string;
}

const INIT: FormData = {
  nombreAgente: "", enfoque: "", metodo: "El Confidente", tono: "cálido, cercano y seguro",
  producto: "", problema: "", caracteristicas: "", beneficios: "", tieneTalla: false,
  precio1: "", precio2: "", precio3: "", entrega: "4-6 días hábiles", pago: "Pago contra entrega",
  flujo: "AIDA", modoApertura: "ia", aperturaSeleccionada: "", aperturaManual: "",
  upsellProducto: "", upsellPrecio: "",
};

// ─── Utilidades UI ────────────────────────────────────────────────────────────
const input = "w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF5911]/50 transition-colors";
const textarea = input + " resize-none";

function Chips({ options, value, onChange }: { options: { val: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((o) => (
        <button key={o.val} type="button" onClick={() => onChange(o.val)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${value === o.val ? "bg-[#FF5911] text-white" : "bg-white/5 text-white/45 hover:bg-white/10 hover:text-white"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ─── Generador de prompt final ────────────────────────────────────────────────
function buildPrompt(d: FormData): string {
  const apertura = d.modoApertura === "manual" ? d.aperturaManual : d.aperturaSeleccionada;
  const precios = `🔥 1 unidad → ${d.precio1}${d.precio2 ? `\n🔥🔥 Combo 2 unidades → ${d.precio2}` : ""}${d.precio3 ? `\n🔥🔥🔥 Combo 3 unidades → ${d.precio3}` : ""}`;

  const bloqueBase = `# =====================
# BLOQUE BASE
# =====================

## 1.1 Rol y persona:
*${d.nombreAgente}* es una asesora en ventas experta que actúa bajo el principio de "${d.metodo}" como método de persuasión, especialmente bajo la idea de ser "El Confidente" o "El Semejante" (un cliente que recomienda). Su enfoque es ${d.enfoque} y debe ser cerradora de ventas con alto nivel de empatía. Su misión es entender el dolor del cliente y mostrar el producto como la única solución real y confiable. Habla con tono ${d.tono}, como una amiga que quiere ayudar de verdad.

## 1.2 Contexto:
El usuario llega desde un anuncio en redes sociales que aborda el problema de ${d.problema}, por lo tanto es probable que se sienta cansado, frustrado y en busca de una solución rápida, segura y definitiva. Debes guiarlo cuidadosamente a través de cada etapa de la conversación siguiendo el orden establecido *sin saltarse ninguna*.

## 1.3 Objetivo principal (inquebrantable):
Cerrar la venta recopilando los datos de envío. Cada respuesta debe acercar al cliente a este objetivo. No eres un chatbot de soporte: eres un **agente de ventas persuasivo**, enfocado en que la conversión termine en venta.

## 2. Información del producto:
- **Producto:** ${d.producto}
- **Problema que resuelve:** ${d.problema}

**Precios:**
${precios}

- **Entrega:** ${d.entrega}
- **Pago:** ${d.pago}

### 2.1 Características:
${d.caracteristicas}

### 2.2 Beneficios clave:
${d.beneficios}`;

  const flujos: Record<Flujo, string> = {
    AIDA: `
# =====================
# FLUJO AIDA (Atención → Interés → Deseo → Acción)
# =====================

*[!IMPORTANTE]:* AIDA = Atención → Interés → Deseo → Acción.
El objetivo: que el cliente sienta que *no comprar* sería perder una oportunidad.

**PRIMER MENSAJE DEL BOT:**
CHATBOT: "${apertura}"

### Etapa 1 — ATENCIÓN
CLIENTE: [Responde con curiosidad o confirmando el problema de ${d.problema}]
CHATBOT: [Valida con empatía 💛, menciona que conoces ese problema y que encontraste la solución. Genera curiosidad. Máx. 30 palabras.]

### Etapa 2 — INTERÉS
CLIENTE: [Muestra interés, pide más información]
CHATBOT: [Profundiza en el problema con preguntas de descubrimiento. ¿Cuándo ocurre? ¿Con qué frecuencia? No menciones el producto aún. Usa emojis cálidos 😊. Máx. 30 palabras.]

CLIENTE: [Describe su situación con más detalle]
CHATBOT: [Reformula con empatía lo que describió. Hazle sentir comprendido 💛. Dile que tienes algo que puede cambiar eso. Genera expectativa. Máx. 30 palabras.]

### Etapa 3 — DESEO
CLIENTE: [Quiere saber de qué se trata la solución]
CHATBOT: [Presenta ${d.producto} como la solución creada exactamente para ${d.problema}. Menciona 2 características y su beneficio emocional. No des el precio aún ✨. Máx. 30 palabras.]

CLIENTE: [Muestra interés, pregunta cómo funciona]
CHATBOT: [Refuerza con el beneficio más poderoso. Añade garantía o prueba social. Prepara el terreno para el precio 💫. Máx. 30 palabras.]

### Etapa 4 — ACCIÓN
CLIENTE: [Pregunta el precio o dice que le interesa comprar]
CHATBOT: [Presenta precios como inversión. "La inversión para resolver ${d.problema} es solo ${d.precio1}, pagas al recibirlo 💛". Presenta las 3 opciones con emojis. Pregunta cuál quiere.]

CLIENTE: [Elige una opción]
→ Ir a ETAPA DE CIERRE`,

    PAS: `
# =====================
# FLUJO PAS (Problem → Agitate → Solution)
# =====================

*[!IMPORTANTE]:* PAS = Problem → Agitate → Solution.
El objetivo: tocar el dolor, intensificarlo y presentar la solución con precio en máximo 3 mensajes.

**PRIMER MENSAJE DEL BOT:**
CHATBOT: "${apertura}"

### Etapa 1 — PROBLEM (Tocar el dolor)
CLIENTE: [Saluda o describe su problema]
CHATBOT: [Pregunta empática que toque el dolor principal en 1 línea. Confirma que conoces esa frustración. Máx. 30 palabras. Usa emoji 😊]

### Etapa 2 — AGITATE (Intensificar)
CLIENTE: [Confirma el problema o responde]
CHATBOT: [Intensifica el dolor en 1 línea: lo que se pierde por no resolverlo, lo frustrante que es. Luego transición: "pero tranqui, por eso estás aquí". Máx. 30 palabras.]

### Etapa 3 — SOLUTION (Solución + Precio)
CHATBOT: [Presenta ${d.producto} con 2 beneficios clave + los precios con emojis + "pagas al recibir, sin adelantos 💛" + "¿Cuál te aparto?"]
${precios}

CLIENTE: [Elige una opción]
→ Ir a ETAPA DE CIERRE`,

    OBC: `
# =====================
# FLUJO OBC (Offer → Benefits → Close)
# =====================

*[!IMPORTANTE]:* OBC = Offer → Benefits → Close.
El objetivo: dar precio inmediato, reforzar con beneficios solo si pregunta, y cerrar lo más rápido posible.

**PRIMER MENSAJE DEL BOT:**
CHATBOT: "${apertura}"

### Etapa 1 — OFFER (Oferta directa)
CLIENTE: [Pregunta precio: "cuánto cuesta?", "precio?"]
CHATBOT: [Saludo corto + presenta los precios con emojis inmediatamente + "pagas cuando te llegue, sin adelantos 💛". Máx. 40 palabras.]
${precios}

### Etapa 2 — BENEFITS (Solo si el cliente pregunta)
CLIENTE: [Pregunta si funciona, pide más info, duda]
CHATBOT: [3 beneficios clave en 1 mensaje + prueba social + "¿Cuál te aparto?" Máx. 40 palabras.]

[!IMPORTANTE]: Si el cliente elige directamente después del precio SIN preguntar, salta Etapa 2 y ve directo al cierre.

CLIENTE: [Elige una opción]
→ Ir a ETAPA DE CIERRE`,

    HOOK: `
# =====================
# FLUJO HOOK → PRECIO → PRUEBA SOCIAL
# =====================

*[!IMPORTANTE]:* El anuncio ya hizo el trabajo de venta. El bot solo tiene que NO ESTORBAR la compra.

**PRIMER MENSAJE DEL BOT:**
CHATBOT: "${apertura}"

### Etapa 1 — HOOK (Enganchar con urgencia + Precio)
CLIENTE: [Menciona el anuncio: "vi el anuncio", "vi tu publicación"]
CHATBOT: [Saludo + gancho de urgencia/escasez: "llegaste justo, es la más vendida y quedan pocas" + los precios con emojis + "pagas al recibir, $0 adelanto 💛". Máx. 40 palabras.]
${precios}

### Etapa 2 — PRUEBA SOCIAL (Solo si el cliente duda)
CLIENTE: [Duda: "será que funciona?", "es bueno?"]
CHATBOT: [Prueba social fuerte (% de recompra) + 2 beneficios clave + "la mayoría lo lleva en combo" + "¿Te aparto?" Máx. 40 palabras.]

[!IMPORTANTE]: Si el cliente elige directamente SIN dudar, salta Etapa 2 y ve directo al cierre.

CLIENTE: [Elige una opción]
→ Ir a ETAPA DE CIERRE`,
  };

  const bloqueCierre = `

# =====================
# BLOQUE CIERRE
# =====================

### Paso 1 — Celebrar + Pedir datos
CLIENTE: [Dice cuál opción quiere]
CHATBOT:
"Perfecto! 😊 Para procesar tu pedido, envíame estos datos:
📌 Nombre y apellido: 😊
📌 Teléfono: 📞${d.tieneTalla ? "\n📌 Talla/color: {la que ya escogió}" : ""}
📌 Departamento: 🌄
📌 Ciudad: 🏙
📌 Barrio: 🏡
📌 Dirección: 🏡"

### Paso 2 — Confirmar datos
CLIENTE: [Envía sus datos]
CHATBOT: [Enlista los datos EXACTOS y pregunta si están correctos. Confirma el valor total y el tiempo de entrega ${d.entrega}. 🎉]

### Paso 3 — Cerrar pedido
CLIENTE: [Confirma que los datos están correctos]
CHATBOT: "🎉 El número de guía y mensajes de seguimiento del viaje de tu pedido te los enviaremos apenas sea despachado al número que nos facilitaste. ¡Estaremos atentos a cualquier duda! Gracias por tu compra 💛"

${d.upsellProducto ? `## Upsell
CHATBOT: "Un último consejo 😊: aprovecha el *${d.upsellProducto}* por solo *${d.upsellPrecio}* para que lo tengas lo más rápido posible. La mayoría de clientes eligen esta opción porque saben que cada hora cuenta ⚡. ¿Te gustaría agregarlo?"` : ""}

## Reglas de Objeciones (OBLIGATORIO responder con el guion exacto):

"Lo pensaré" → "Perfecto 💛, aunque recuerda que hoy tenemos precio especial. Te lo puedo dejar reservado, ¿quieres que te lo aparte?"

"Más barato en otra tienda" → "En algunas sí 😊, pero muchos venden imitaciones sin garantía. Los nuestros son originales, con envío rápido y opción de devolución. ¿No crees que vale la pena?"

"No tengo dinero" → "Tranquilo 😊, puedes pagar al recibirlo, sin adelantos. Así lo pruebas primero. ¿Te aparto uno así?"

"Es caro" → "Entiendo 💛, pero piensa que es una inversión en ${d.problema}. Además con el combo de 2 te ahorras más y pagas al recibir. ¿Quieres que te arme el combo?"

"Déjame consultarlo" → "Claro! 😊 Te lo dejo reservado mientras decides. Solo ten en cuenta que la promo es por tiempo limitado 🔥"

## Reglas Generales:
1. Cada mensaje ≤ 30 palabras (excepto datos de envío y precios).
2. Solo una pregunta por turno.
3. Personaliza con el nombre del cliente desde que lo sepas.
4. No cierres si falta algún dato de envío.
5. Usa emojis para dar calidez.
6. NUNCA des más información de la necesaria si el cliente ya quiere comprar.
7. Si el cliente envía audio o imagen: "Disculpa, por el momento solo puedo leer mensajes de texto 😊 ¿Me lo puedes escribir?"`;

  return `${bloqueBase}\n${flujos[d.flujo]}${bloqueCierre}`;
}

// ─── Datos de flujos ──────────────────────────────────────────────────────────
const FLUJOS: { val: Flujo; icono: string; nombre: string; desc: string; tag: string }[] = [
  { val: "AIDA", icono: "🎯", nombre: "AIDA", desc: "Atención → Interés → Deseo → Acción. Ideal para ticket alto o producto que necesita explicación.", tag: "5-8 msgs · 3-4 preguntas" },
  { val: "PAS", icono: "🔥", nombre: "PAS", desc: "Problem → Agitate → Solution. Ideal para clientes que llegan con un dolor claro.", tag: "3 msgs · 1 pregunta" },
  { val: "OBC", icono: "⚡", nombre: "OBC", desc: "Offer → Benefits → Close. Para compras por impulso, precio directo sin rodeos.", tag: "1 msg · 0 preguntas" },
  { val: "HOOK", icono: "🚀", nombre: "HOOK→PRECIO→PS", desc: "Hook + Precio + Prueba Social. Para clientes que vienen calientes del anuncio.", tag: "2 msgs · 0 preguntas" },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export function PromptBuilder() {
  const [modo, setModo] = useState<ModoInput>("manual");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [aperturas, setAperturas] = useState<string[]>([]);
  const [loadingApertura, setLoadingApertura] = useState(false);
  const [loadingImagen, setLoadingImagen] = useState(false);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenAnalizada, setImagenAnalizada] = useState(false);
  const [imagenError, setImagenError] = useState(false);
  const [resumenImagen, setResumenImagen] = useState<{ publicoObjetivo?: string; camposLlenos: number } | null>(null);
  const [promptFinal, setPromptFinal] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // ── Imagen ──────────────────────────────────────────────────────────────────
  async function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Imagen muy grande (máx 5MB)"); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagenPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";

      setLoadingImagen(true);
      setImagenAnalizada(false);
      setImagenError(false);
      try {
        const res = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "imagen", base64, mediaType }),
        });
        const data = await res.json();
        const tonoMap: Record<string, string> = {
          "cálido, cercano y seguro": "cálido, cercano y seguro",
          "profesional y confiable": "profesional y confiable",
          "energético y motivador": "energético y motivador",
          "amigable y casual": "amigable y casual",
        };
        const tonoValido = tonoMap[data.tono] || "cálido, cercano y seguro";
        const metodos = ["El Confidente", "FOMO", "Escasez", "Empatía Total"];
        const metodoValido = metodos.includes(data.metodo) ? data.metodo : "El Confidente";

        setForm((p) => ({
          ...p,
          producto: data.producto || p.producto,
          problema: data.problema || p.problema,
          caracteristicas: data.caracteristicas || p.caracteristicas,
          beneficios: data.beneficios || p.beneficios,
          precio1: data.precio1 || p.precio1,
          precio2: data.precio2 || p.precio2,
          precio3: data.precio3 || p.precio3,
          nombreAgente: data.nombreAgente || p.nombreAgente,
          enfoque: data.enfoque || p.enfoque,
          metodo: metodoValido,
          tono: tonoValido,
        }));

        const filled = [data.producto, data.problema, data.caracteristicas, data.beneficios,
          data.precio1, data.nombreAgente, data.enfoque].filter(Boolean).length;
        setResumenImagen({ publicoObjetivo: data.publicoObjetivo, camposLlenos: filled });
        setImagenAnalizada(true);
      } catch {
        setImagenError(true);
      }
      finally { setLoadingImagen(false); }
    };
    reader.readAsDataURL(file);
  }

  // ── Apertura con IA ──────────────────────────────────────────────────────────
  async function generarAperturas() {
    setLoadingApertura(true);
    setAperturas([]);
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "apertura",
          producto: form.producto,
          problema: form.problema,
          tono: form.tono,
          flujo: form.flujo,
        }),
      });
      const data = await res.json();
      setAperturas(data.opciones || []);
    } catch { /* silencio */ }
    finally { setLoadingApertura(false); }
  }

  // ── Generar prompt final ─────────────────────────────────────────────────────
  function generar() {
    const p = buildPrompt(form);
    setPromptFinal(p);
  }

  function copiar() {
    if (!promptFinal) return;
    navigator.clipboard.writeText(promptFinal);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  function reiniciar() {
    setForm(INIT);
    setStep(1);
    setPromptFinal(null);
    setAperturas([]);
    setImagenPreview(null);
    setImagenAnalizada(false);
    setImagenError(false);
    setResumenImagen(null);
    setModo("manual");
  }

  function continuarDesdeImagen(f: FormData) {
    // Saltar al primer paso con datos faltantes obligatorios
    if (!f.nombreAgente || !f.enfoque) { setModo("manual"); setStep(1); return; }
    if (!f.producto || !f.problema || !f.caracteristicas || !f.beneficios) { setModo("manual"); setStep(2); return; }
    if (!f.precio1) { setModo("manual"); setStep(3); return; }
    setModo("manual"); setStep(4); // Todo lleno, ir a flujo
  }

  // ── Si ya hay prompt generado ────────────────────────────────────────────────
  if (promptFinal) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">Prompt generado</span>
          </div>
          <div className="flex gap-2">
            <button onClick={reiniciar} className="text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5">
              ↩ Nuevo
            </button>
            <button onClick={copiar}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full transition-all ${copiado ? "bg-emerald-500/20 text-emerald-400" : "bg-[#FF5911] text-white hover:bg-[#FF5911]/85"}`}>
              {copiado ? <Check size={12} weight="bold" /> : <Copy size={12} />}
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="flex gap-4 text-xs text-white/30 border-b border-white/5 pb-3">
          <span>Flujo: <strong className="text-white/60">{form.flujo}</strong></span>
          <span>Producto: <strong className="text-white/60">{form.producto}</strong></span>
          <span>Chars: <strong className="text-white/60">{promptFinal.length.toLocaleString()}</strong></span>
        </div>

        <div className="rounded-2xl bg-[#0A0A0A] border border-white/6 overflow-hidden">
          <pre className="p-5 text-xs text-white/55 leading-relaxed font-mono whitespace-pre-wrap max-h-[520px] overflow-y-auto">
            {promptFinal}
          </pre>
        </div>
      </div>
    );
  }

  // ── Pasos del formulario ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Selector de modo */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { val: "manual", icono: <PencilSimple size={18} />, label: "Manual", desc: "Rellena los campos" },
          { val: "imagen", icono: <ImgIcon size={18} />, label: "Desde imagen", desc: "Sube foto del producto" },
        ] as { val: ModoInput; icono: React.ReactNode; label: string; desc: string }[]).map((m) => (
          <button key={m.val} onClick={() => setModo(m.val)}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${modo === m.val ? "border-[#FF5911]/50 bg-[#FF5911]/8" : "border-white/6 bg-white/3 hover:border-white/12"}`}>
            <span className={modo === m.val ? "text-[#FF5911]" : "text-white/40"}>{m.icono}</span>
            <div>
              <p className={`text-sm font-bold ${modo === m.val ? "text-white" : "text-white/60"}`}>{m.label}</p>
              <p className="text-xs text-white/30">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Modo imagen */}
      {modo === "imagen" && (
        <div className="flex flex-col gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF5911]/40 hover:bg-[#FF5911]/3 transition-all"
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagen} />
            {imagenPreview ? (
              <img src={imagenPreview} alt="preview" className="max-h-40 mx-auto rounded-xl border border-white/10" />
            ) : (
              <>
                <p className="text-3xl mb-3">📸</p>
                <p className="text-sm font-bold text-white/60 mb-1">Arrastra o haz clic para subir</p>
                <p className="text-xs text-white/25">PNG, JPG, WEBP · Máx. 5MB</p>
              </>
            )}
          </div>
          {loadingImagen && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/8">
              <div className="w-5 h-5 border-2 border-[#FF5911] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Claude está analizando la imagen…</p>
                <p className="text-xs text-white/35">Extrayendo nombre, precio y características</p>
              </div>
            </div>
          )}
          {imagenAnalizada && (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-lg flex-shrink-0">✓</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Investigación completada</p>
                  <p className="text-xs text-white/40">{resumenImagen?.camposLlenos ?? 0} campos pre-rellenados automáticamente</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Producto", val: form.producto },
                  { label: "Agente sugerido", val: form.nombreAgente },
                  { label: "Nicho", val: form.enfoque },
                  { label: "Método", val: form.metodo },
                  { label: "Problema", val: form.problema },
                  { label: "Precio 1", val: form.precio1 },
                ].map((r) => r.val ? (
                  <div key={r.label} className="flex items-start gap-2 p-2 rounded-lg bg-white/4">
                    <span className="text-emerald-400 text-xs mt-0.5">✓</span>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">{r.label}</p>
                      <p className="text-xs text-white/70 leading-snug">{r.val}</p>
                    </div>
                  </div>
                ) : null)}
              </div>
              {resumenImagen?.publicoObjetivo && (
                <div className="p-3 rounded-lg bg-[#FF5911]/6 border border-[#FF5911]/15">
                  <p className="text-[10px] text-[#FF5911]/60 uppercase tracking-wider mb-1">Cliente ideal</p>
                  <p className="text-xs text-white/55">{resumenImagen.publicoObjetivo}</p>
                </div>
              )}
              <button onClick={() => continuarDesdeImagen(form)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FF5911] text-white text-sm font-bold hover:bg-[#FF5911]/85 transition-all">
                Continuar al formulario <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          )}
          {imagenError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/10">
              <span className="text-white/40 text-lg flex-shrink-0">⚠</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white/70">No se pudo analizar la imagen</p>
                <p className="text-xs text-white/35">Rellena el formulario manualmente</p>
              </div>
              <button onClick={() => { setModo("manual"); setStep(1); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 text-white/70 text-xs font-bold hover:bg-white/12 transition-all">
                Ir al formulario <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          )}
          {imagenPreview && !loadingImagen && !imagenAnalizada && !imagenError && (
            <button onClick={() => { setModo("manual"); setStep(1); }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/8 transition-all">
              Continuar sin análisis <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* Modo manual — barra de progreso */}
      {modo === "manual" && (
        <div className="flex flex-col gap-6">
          <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/6">
            {["Agente", "Producto", "Precios", "Flujo", "Extras"].map((s, i) => (
              <button key={s} onClick={() => i + 1 < step && setStep(i + 1)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${step === i + 1 ? "bg-[#FF5911] text-white" : i + 1 < step ? "text-emerald-400" : "text-white/25"}`}>
                <span className="block text-[10px] opacity-60">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </button>
            ))}
          </div>

          {/* STEP 1 — Agente */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <StepHeader icono="🤖" titulo="Configura tu agente" sub="Identidad y estilo del bot" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre del agente *">
                  <input className={input} value={form.nombreAgente} onChange={(e) => set("nombreAgente", e.target.value)} placeholder="Ej: Sofía, Laura…" />
                </Field>
                <Field label="Nicho / enfoque *">
                  <input className={input} value={form.enfoque} onChange={(e) => set("enfoque", e.target.value)} placeholder="Ej: bienestar infantil, fitness…" />
                </Field>
              </div>
              <Field label="Método de persuasión">
                <Chips options={[
                  { val: "El Confidente", label: "El Confidente" },
                  { val: "FOMO", label: "FOMO" },
                  { val: "Escasez", label: "Escasez" },
                  { val: "Empatía Total", label: "Empatía Total" },
                ]} value={form.metodo} onChange={(v) => set("metodo", v)} />
              </Field>
              <Field label="Tono del agente">
                <Chips options={[
                  { val: "cálido, cercano y seguro", label: "Cálido y cercano" },
                  { val: "profesional y confiable", label: "Profesional" },
                  { val: "energético y motivador", label: "Energético" },
                  { val: "amigable y casual", label: "Amigable" },
                ]} value={form.tono} onChange={(v) => set("tono", v)} />
              </Field>
              <NavRow onNext={() => {
                if (!form.nombreAgente || !form.enfoque) { alert("Completa nombre del agente y nicho"); return; }
                setStep(2);
              }} />
            </div>
          )}

          {/* STEP 2 — Producto */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <StepHeader icono="📦" titulo="Información del producto" sub="Qué vendes y qué problema resuelve" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre del producto *">
                  <input className={input} value={form.producto} onChange={(e) => set("producto", e.target.value)} placeholder="Ej: Biberón Anti-Cólicos Pro-Flujo" />
                </Field>
                <Field label="Problema que resuelve *">
                  <input className={input} value={form.problema} onChange={(e) => set("problema", e.target.value)} placeholder="Ej: cólicos en bebés…" />
                </Field>
              </div>
              <Field label="Características *">
                <textarea className={textarea} rows={3} value={form.caracteristicas} onChange={(e) => set("caracteristicas", e.target.value)} placeholder="- Silicona grado médico&#10;- Válvula de aire patentada" />
              </Field>
              <Field label="Beneficios clave *">
                <textarea className={textarea} rows={3} value={form.beneficios} onChange={(e) => set("beneficios", e.target.value)} placeholder="- Reduce cólicos hasta un 80%&#10;- Facilita la transición" />
              </Field>
              <Field label="¿El producto tiene tallas o colores?">
                <Chips options={[{ val: "no", label: "No aplica" }, { val: "si", label: "Sí tiene tallas/colores" }]}
                  value={form.tieneTalla ? "si" : "no"} onChange={(v) => set("tieneTalla", v === "si")} />
              </Field>
              <NavRow onBack={() => setStep(1)} onNext={() => {
                if (!form.producto || !form.problema || !form.caracteristicas || !form.beneficios) { alert("Completa todos los campos obligatorios"); return; }
                setStep(3);
              }} />
            </div>
          )}

          {/* STEP 3 — Precios */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <StepHeader icono="💰" titulo="Precios y ofertas" sub="Configura hasta 3 opciones" />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Precio 1 unidad *">
                  <input className={input} value={form.precio1} onChange={(e) => set("precio1", e.target.value)} placeholder="Ej: $59.900" />
                </Field>
                <Field label="Combo 2 unidades">
                  <input className={input} value={form.precio2} onChange={(e) => set("precio2", e.target.value)} placeholder="Ej: $99.900" />
                </Field>
                <Field label="Combo 3 unidades">
                  <input className={input} value={form.precio3} onChange={(e) => set("precio3", e.target.value)} placeholder="Ej: $139.900" />
                </Field>
              </div>
              <Field label="Tiempo de entrega">
                <Chips options={[
                  { val: "4-6 días hábiles", label: "4–6 días" },
                  { val: "2-3 días hábiles", label: "2–3 días" },
                  { val: "1-2 días hábiles", label: "1–2 días" },
                  { val: "3-5 días hábiles", label: "3–5 días" },
                ]} value={form.entrega} onChange={(v) => set("entrega", v)} />
              </Field>
              <Field label="Método de pago">
                <Chips options={[
                  { val: "Pago contra entrega", label: "Contra entrega" },
                  { val: "Transferencia o contra entrega", label: "Transferencia" },
                  { val: "Cualquier método", label: "Múltiples" },
                ]} value={form.pago} onChange={(v) => set("pago", v)} />
              </Field>
              <NavRow onBack={() => setStep(2)} onNext={() => {
                if (!form.precio1) { alert("Agrega el precio de 1 unidad"); return; }
                setStep(4);
              }} />
            </div>
          )}

          {/* STEP 4 — Flujo + Apertura */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <StepHeader icono="🧠" titulo="Flujo de conversación" sub="Elige la metodología ideal para tu producto" />

              <div className="grid grid-cols-2 gap-3">
                {FLUJOS.map((f) => (
                  <button key={f.val} onClick={() => { set("flujo", f.val); setAperturas([]); set("aperturaSeleccionada", ""); }}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${form.flujo === f.val ? "border-[#FF5911] bg-[#FF5911]/8" : "border-white/6 bg-white/3 hover:border-white/15"}`}>
                    <span className="text-xl block mb-2">{f.icono}</span>
                    <p className={`text-sm font-bold mb-1 ${form.flujo === f.val ? "text-[#FF5911]" : "text-white"}`}>{f.nombre}</p>
                    <p className="text-xs text-white/40 leading-relaxed mb-2">{f.desc}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${form.flujo === f.val ? "bg-[#FF5911]/20 text-[#FF5911]" : "bg-white/5 text-white/25"}`}>{f.tag}</span>
                  </button>
                ))}
              </div>

              {/* Apertura */}
              <div className="border-t border-white/6 pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3">Pregunta de apertura</p>
                <div className="p-3 rounded-xl bg-[#FF5911]/6 border border-[#FF5911]/15 text-xs text-white/50 leading-relaxed mb-4">
                  Es el primer mensaje que envía tu bot. Recomendamos generarlo con IA para que quede adaptado al flujo y producto.
                </div>
                <Field label="Modo de apertura">
                  <Chips options={[{ val: "ia", label: "🤖 Generar con IA" }, { val: "manual", label: "✏️ Escribir la mía" }]}
                    value={form.modoApertura} onChange={(v) => set("modoApertura", v as ModoApertura)} />
                </Field>

                {form.modoApertura === "ia" && (
                  <div className="mt-3 flex flex-col gap-3">
                    <button onClick={generarAperturas} disabled={loadingApertura}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/70 hover:bg-[#FF5911]/10 hover:border-[#FF5911]/30 hover:text-white transition-all disabled:opacity-40">
                      {loadingApertura ? (
                        <><div className="w-4 h-4 border-2 border-[#FF5911] border-t-transparent rounded-full animate-spin" />Generando…</>
                      ) : (
                        <><Sparkle size={16} />✨ Generar 3 opciones con IA</>
                      )}
                    </button>
                    {aperturas.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {aperturas.map((a, i) => (
                          <button key={i} onClick={() => set("aperturaSeleccionada", a)}
                            className={`text-left p-4 rounded-xl border transition-all ${form.aperturaSeleccionada === a ? "border-[#FF5911]/50 bg-[#FF5911]/8" : "border-white/6 bg-white/3 hover:border-white/15"}`}>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${form.aperturaSeleccionada === a ? "text-[#FF5911]" : "text-white/30"}`}>Opción {i + 1}</span>
                            <p className="text-sm text-white/70 leading-relaxed">{a}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {form.modoApertura === "manual" && (
                  <div className="mt-3">
                    <textarea className={textarea} rows={3} value={form.aperturaManual}
                      onChange={(e) => set("aperturaManual", e.target.value)}
                      placeholder="Ej: ¿Tu bebé llora mucho después de comer y no sabes cómo calmarlo? 😔" />
                  </div>
                )}
              </div>

              <NavRow onBack={() => setStep(3)} onNext={() => {
                const apertura = form.modoApertura === "ia" ? form.aperturaSeleccionada : form.aperturaManual;
                if (!apertura) { alert("Selecciona o escribe una pregunta de apertura"); return; }
                setStep(5);
              }} />
            </div>
          )}

          {/* STEP 5 — Extras */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <StepHeader icono="✨" titulo="Extras opcionales" sub="Personaliza el upsell (si dejas vacío se usan guiones estándar)" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Producto upsell">
                  <input className={input} value={form.upsellProducto} onChange={(e) => set("upsellProducto", e.target.value)} placeholder="Ej: Envío prioritario" />
                </Field>
                <Field label="Precio upsell">
                  <input className={input} value={form.upsellPrecio} onChange={(e) => set("upsellPrecio", e.target.value)} placeholder="Ej: $5.000" />
                </Field>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(4)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button onClick={generar}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FF5911] text-white font-bold rounded-full py-3 text-sm hover:bg-[#FF5911]/85 transition-all active:scale-[0.98]">
                  ⚡ Generar Prompt
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function StepHeader({ icono, titulo, sub }: { icono: string; titulo: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-white/5">
      <div className="w-9 h-9 rounded-xl bg-[#FF5911]/10 flex items-center justify-center text-lg flex-shrink-0">{icono}</div>
      <div>
        <p className="text-sm font-bold text-white">{titulo}</p>
        <p className="text-xs text-white/35">{sub}</p>
      </div>
    </div>
  );
}

function NavRow({ onBack, onNext }: { onBack?: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-3 mt-2">
      {onBack && (
        <button onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
          <ArrowLeft size={14} /> Atrás
        </button>
      )}
      <button onClick={onNext}
        className="flex-1 flex items-center justify-center gap-2 bg-[#FF5911] text-white font-bold rounded-full py-3 text-sm hover:bg-[#FF5911]/85 transition-all active:scale-[0.98]">
        Siguiente <ArrowRight size={14} weight="bold" />
      </button>
    </div>
  );
}
