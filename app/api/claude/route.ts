import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { validateMediaType, sanitizeError, checkImageSize, MAX_IMAGE_BYTES } from "../_lib/guard";

if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY no definida");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tipo, ...datos } = body;

  try {
    if (tipo === "apertura") {
      const { problema, producto, tono, flujo } = datos;
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `Genera exactamente 3 preguntas de apertura para un bot de ventas por WhatsApp.
Producto: ${producto}
Problema que resuelve: ${problema}
Tono: ${tono}
Flujo: ${flujo}

Reglas:
- Máx 20 palabras cada una
- Sonar como persona real, NO como bot
- Pregunta abierta o de confirmación
- Tocar el dolor/deseo sin mencionar el producto directamente
- 1 emoji máximo por pregunta
- Adaptada al flujo ${flujo}

Responde SOLO con JSON: {"opciones":["opcion1","opcion2","opcion3"]}`
        }]
      });
      const text = (msg.content[0] as { type: string; text: string }).text;
      const clean = text.replace(/```(?:json)?\n?/g, "").trim();
      try {
        return NextResponse.json(JSON.parse(clean));
      } catch {
        return NextResponse.json({ error: "Respuesta inválida del modelo" }, { status: 500 });
      }
    }

    if (tipo === "imagen") {
      const { base64, mediaType } = datos;

      if (!validateMediaType(mediaType)) {
        return NextResponse.json({ error: "Tipo de imagen no válido" }, { status: 400 });
      }
      const imageBytes = Buffer.byteLength(base64 ?? "", "base64");
      if (!checkImageSize(imageBytes)) {
        return NextResponse.json({ error: `Imagen demasiado grande (máx ${MAX_IMAGE_BYTES / 1024 / 1024} MB)` }, { status: 400 });
      }

      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `Eres un experto en marketing de dropshipping para LATAM. Analiza esta imagen de producto y haz una investigación de mercado completa para crear un bot de ventas por WhatsApp.

Responde SOLO con este JSON (sin markdown, sin explicaciones):
{
  "producto": "nombre comercial atractivo del producto",
  "problema": "dolor/problema principal que resuelve (en 1 frase corta, desde la perspectiva del cliente)",
  "caracteristicas": "lista de 4-5 características técnicas separadas por salto de línea con guión",
  "beneficios": "lista de 4-5 beneficios emocionales/prácticos separados por salto de línea con guión",
  "precio1": "precio sugerido para 1 unidad en Colombia (ej: $89.900)",
  "precio2": "precio combo 2 unidades con descuento",
  "precio3": "precio combo 3 unidades con mayor descuento",
  "nombreAgente": "nombre femenino colombiano natural para el bot (ej: Valeria, Daniela, Sara)",
  "enfoque": "nicho de mercado específico (ej: entretenimiento en casa, productividad, bienestar)",
  "metodo": "uno de: El Confidente, FOMO, Escasez, Empatía Total",
  "tono": "uno de: cálido, cercano y seguro, profesional y confiable, energético y motivador, amigable y casual",
  "publicoObjetivo": "descripción breve del cliente ideal (para mostrar como referencia)"
}

Si no puedes inferir precios, déjalos vacíos. Todo en español.` }
          ]
        }]
      });
      const text2 = (msg.content[0] as { type: string; text: string }).text;
      const clean2 = text2.replace(/```(?:json)?\n?/g, "").trim();
      try {
        return NextResponse.json(JSON.parse(clean2));
      } catch {
        return NextResponse.json({ error: "Respuesta inválida del modelo" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
