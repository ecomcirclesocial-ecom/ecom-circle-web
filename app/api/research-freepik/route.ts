import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { validateMediaType, sanitizeError, checkImageSize, MAX_IMAGE_BYTES } from "../_lib/guard";

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INVESTIGATION_PROMPT = (p: Record<string, string>) => `Eres un investigador experto en ecommerce COD (contra entrega) para Colombia y Latinoamérica. Analiza la imagen del producto y genera una investigación de mercado con exactamente 10 bloques. Todo en español.

DATOS DEL PRODUCTO:
- Nombre: ${p.nombre}
- Precio de venta: ${p.precio}${p.precioAnterior ? ` · Precio anterior: ${p.precioAnterior} · Descuento: ${Math.round((1 - parseFloat(p.precio.replace(/\D/g, "")) / parseFloat(p.precioAnterior.replace(/\D/g, ""))) * 100)}%` : ""}
- Método de pago: Contra entrega (COD)
- Contenido de la caja: ${p.contenido}
- Características conocidas: ${p.caracteristicas || "Inferir de la imagen"}
- Mercado objetivo: ${p.mercado}

Genera exactamente estos 10 bloques con sus títulos:

## 1. PRODUCTO
Nombre completo, categoría, precio de venta, precio anterior, % de descuento, método de pago.

## 2. ESPECIFICACIONES TÉCNICAS
Todas las specs del producto con detalle: materiales, dimensiones, peso, capacidad, compatibilidad, colores disponibles, vida útil, certificaciones si aplican.

## 3. QUÉ INCLUYE LA CAJA / KIT
Lista numerada de todos los elementos incluidos en el paquete.

## 4. DIFERENCIADOR
Qué hace mejor este producto vs la versión barata genérica y vs la competencia directa. Argumentos concretos.

## 5. MERCADO
Tamaño del mercado en Colombia, tendencias actuales, estacionalidad, plataformas líderes, volumen de búsquedas relevantes.

## 6. COMPETENCIA
Directa: [3-4 productos del mismo tipo con precios en Colombia]
Indirecta: [2-3 sustitutos con precios]

## 7. CANALES DE VENTA
Dónde se vende en Colombia: MercadoLibre, Falabella, tiendas COD, WhatsApp, redes sociales. Con datos de presencia.

## 8. BUYER PERSONA
Nombre ficticio, edad, género, ciudad, NSE, ocupación, estilo de vida, motivaciones de compra, perfil tecnológico, cómo descubre productos.

## 9. DOLORES
5 problemas/frustraciones reales del cliente relacionados con este producto. Escríbelos en sus propias palabras, como si fueran comentarios reales.

## 10. OBJECIONES + CONTRAARGUMENTO
5 objeciones comunes que tiene el comprador antes de comprar + respuesta directa y convincente para cada una.`;

const ANGLE_SUGGESTIONS_PROMPT = (investigation: string) => `Con base en esta investigación de mercado, genera EXACTAMENTE 4 ángulos de venta y 3 paletas de color.

INVESTIGACIÓN:
${investigation.slice(0, 3000)}

Responde SOLO con este JSON (sin texto adicional, sin markdown):
{
  "angles": [
    { "nombre": "Nombre del ángulo (3-4 palabras)", "descripcion": "Una frase que describe la narrativa emocional central — máx 20 palabras" },
    { "nombre": "...", "descripcion": "..." },
    { "nombre": "...", "descripcion": "..." },
    { "nombre": "...", "descripcion": "..." }
  ],
  "palettes": [
    { "nombre": "Nombre evocador", "fondo": "#hex", "primario": "#hex", "acento": "#hex", "sensacion": "Qué transmite en 1 frase" },
    { "nombre": "...", "fondo": "#hex", "primario": "#hex", "acento": "#hex", "sensacion": "..." },
    { "nombre": "...", "fondo": "#hex", "primario": "#hex", "acento": "#hex", "sensacion": "..." }
  ]
}`;

const ANGLE_FULL_PROMPT = (investigation: string, angle: { nombre: string; descripcion: string }) => `Eres un copywriter experto en marketing de respuesta directa para ecommerce COD en Colombia y LATAM.

INVESTIGACIÓN DE MERCADO:
${investigation}

ÁNGULO ELEGIDO: ${angle.nombre} — ${angle.descripcion}

Desarrolla el ángulo de venta completo con exactamente 8 bloques:

## 1. CONCEPTO CENTRAL
[1 frase poderosa que resume todo el ángulo y puede usarse como north star de todas las piezas]

## 2. CONTEXTO DEL ÁNGULO
[Datos de soporte que dan urgencia o relevancia al ángulo: fechas, estadísticas, temporada, tendencias. Mín 3 datos concretos]

## 3. NARRATIVA EMOCIONAL
Párrafo 1 — Situación actual (dolor): [Descripción vívida de cómo vive el cliente SIN el producto]
Párrafo 2 — Punto de quiebre: [El momento en que el cliente decide que ya no puede seguir así]
Párrafo 3 — Solución: [Cómo el producto cambia su realidad concretamente]

## 4. ESTRUCTURA EMOCIONAL POR SECCIÓN
Hero: [qué dice y qué emoción activa]
Sección dolor: [qué dice]
Sección solución: [qué dice]
Sección experiencia: [qué dice]
Sección urgencia: [qué dice]
Sección comparación: [qué dice]
CTA final: [qué dice]

## 5. COMPARACIÓN DE PRECIO
[3 alternativas caras que el cliente consideraría + su precio vs nuestro producto. Formato: "X alternativa ($precio) vs nuestro producto ($precio)"]

## 6. URGENCIA
[Por qué actuar AHORA y no después — razón real: fecha, escasez, consecuencia de no actuar, tendencia]

## 7. GANCHOS PARA ADS (META / TIKTOK)
[5-7 frases cortas listas para usar como hook de video o texto de anuncio. Máx 12 palabras cada una. En español colombiano]

## 8. HASHTAGS
[20-25 hashtags relevantes para Colombia y LATAM]

Todo en español. Los ganchos deben generar pausa en el scroll.`;

const BRANDING_PROMPT = (
  investigation: string,
  angle: { nombre: string; descripcion: string },
  palette: { nombre: string; fondo: string; primario: string; acento: string; sensacion: string },
  brandingData: { marca: string; duracion: string }
) => `Eres un director de arte especializado en landing pages de ecommerce COD para Colombia y LATAM.

INVESTIGACIÓN (resumen):
${investigation.slice(0, 2000)}

ÁNGULO: ${angle.nombre} — ${angle.descripcion}
PALETA BASE: ${palette.nombre} | Fondo: ${palette.fondo} | Primario: ${palette.primario} | Acento: ${palette.acento} | Sensación: ${palette.sensacion}
MARCA: ${brandingData.marca?.trim() || "Genérica (sin nombre de marca)"}
TIPO DE LANDING: ${brandingData.duracion}

Genera el documento de Branding e Identidad Visual con exactamente 8 bloques:

## 1. CONCEPTO VISUAL
[Nombre del concepto visual en 2-3 palabras]
[Descripción del concepto en 2 líneas: qué sensación visual crea, qué referencia estética sigue]

## 2. PALETA DE COLORES
Fondos: [hex1 — uso], [hex2 — uso], [hex3 — uso si aplica]
Primario (1): [hex — tono más intenso, botones principales, highlights]
Primario (2): [hex — tono complementario]
Secundario: [hex — uso]
Acento / urgencia: [hex — ofertas, timers, badges de descuento]
Confianza: [hex — COD, garantía, envío]
Texto nivel 1 (headlines): [hex]
Texto nivel 2 (cuerpo): [hex]
Texto nivel 3 (detalles, placeholders): [hex]
Gradiente principal: linear-gradient([deg], [hex], [hex])
Gradiente hero: [descripción + valores]
Gradiente urgencia: [descripción + valores]

## 3. TIPOGRAFÍA
Headlines (H1, H2): [Familia Google Fonts] — [peso] — [estilo] — color [hex]
Subtítulos (H3, H4): [Familia] — [peso]
Cuerpo de texto: [Familia] — [peso] — [tamaño referencia]
CTAs y botones: [Familia] — [peso]
Precios y números: [Familia] — [peso] — [tamaño grande para impacto]

## 4. ESTILO FOTOGRÁFICO
Mood general: [descripción en 1 frase]
Iluminación: [tipo, dirección, temperatura de color]
Tipo de modelos: [edad, género, estilo, expresión]
Ambientes: [dónde se fotografía el producto en uso]
Colores de ropa y props: [paleta específica]
Qué evitar: [2-3 elementos visuales que NO van]

## 5. PROMPTS FREEPIK AI (en inglés — listos para pegar)
Hero background: "[prompt hiperdetallado, 50-70 palabras]"
Product shot principal: "[prompt, 40-60 palabras]"
Lifestyle / producto en uso: "[prompt, 40-60 palabras]"
Antes / después: "[prompt, 30-50 palabras]"
Unboxing / contenido de caja: "[prompt, 30-50 palabras]"
Personas / testimonios: "[prompt, 30-50 palabras]"

## 6. ICONOGRAFÍA Y ELEMENTOS
Estilo de íconos: [outline / filled / duotone — con grosor y color hex]
Badges: [diseño de badge de descuento, envío gratis, COD, garantía — colores hex]
Separadores: [tipo de separador entre secciones]
Elementos decorativos: [texturas, formas, patrones que se usan — si aplica]

## 7. BOTONES
Primario (CTA principal): fondo [hex] · texto [hex] · borde [hex o none] · hover: [hex] · border-radius: [px]
Secundario: fondo [hex] · texto [hex] · borde [hex] · border-radius: [px]
Urgencia / oferta: fondo [hex] · texto [hex] · animación sugerida: [pulso, brillo, etc.]

## 8. TONO VISUAL
[3-5 frases que describen exactamente qué sensación debe dar la landing al primer vistazo]
[Incluir: qué se siente, qué NO se siente, qué nivel de premium, qué emoción activa]`;

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { step } = body;

  try {
    // ── Step 1: Investigación de mercado ─────────────────────────────────────
    if (step === "investigation") {
      const { imageBase64, mediaType, productData, model } = body;

      if (imageBase64) {
        if (!validateMediaType(mediaType)) {
          return NextResponse.json({ error: "Tipo de imagen no válido" }, { status: 400 });
        }
        const imageBytes = Buffer.byteLength(imageBase64, "base64");
        if (!checkImageSize(imageBytes)) {
          return NextResponse.json({ error: `Imagen demasiado grande (máx ${MAX_IMAGE_BYTES / 1024 / 1024} MB)` }, { status: 400 });
        }
      }

      const prompt = INVESTIGATION_PROMPT(productData);
      let investigation = "";

      if (model === "jiminy") {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const gemini = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parts: any[] = [];
        if (imageBase64) {
          parts.push({ inlineData: { data: imageBase64, mimeType: mediaType } });
        }
        parts.push(prompt);
        const result = await gemini.generateContent(parts);
        investigation = result.response.text();
      } else {
        const content: Anthropic.MessageParam["content"] = [];
        if (imageBase64) {
          content.push({
            type: "image",
            source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp", data: imageBase64 },
          });
        }
        content.push({ type: "text", text: prompt });
        const msg = await anthropic.messages.create({
          model: "claude-opus-4-6",
          max_tokens: 6000,
          messages: [{ role: "user", content }],
        });
        investigation = (msg.content[0] as { type: "text"; text: string }).text;
      }

      // Ángulos y paletas con Claude Haiku (rápido, JSON limpio)
      const suggestionsMsg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: ANGLE_SUGGESTIONS_PROMPT(investigation) }],
      });
      const raw = (suggestionsMsg.content[0] as { type: "text"; text: string }).text;
      const clean = raw.replace(/```(?:json)?\n?/g, "").trim();
      let suggestions;
      try {
        suggestions = JSON.parse(clean);
      } catch {
        return NextResponse.json({ error: "Respuesta inválida al generar ángulos" }, { status: 500 });
      }

      return NextResponse.json({ investigation, ...suggestions });
    }

    // ── Step 2: Ángulo + Branding (paralelo) ─────────────────────────────────
    if (step === "generate") {
      const { investigation, angleChoice, paletteChoice, brandingData } = body;

      const [angle, branding] = await Promise.all([
        anthropic.messages.create({
          model: "claude-opus-4-6",
          max_tokens: 4000,
          messages: [{ role: "user", content: ANGLE_FULL_PROMPT(investigation, angleChoice) }],
        }),
        anthropic.messages.create({
          model: "claude-opus-4-6",
          max_tokens: 5000,
          messages: [{ role: "user", content: BRANDING_PROMPT(investigation, angleChoice, paletteChoice, brandingData) }],
        }),
      ]);

      return NextResponse.json({
        angle: (angle.content[0] as { type: "text"; text: string }).text,
        branding: (branding.content[0] as { type: "text"; text: string }).text,
      });
    }

    return NextResponse.json({ error: "Step inválido" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
