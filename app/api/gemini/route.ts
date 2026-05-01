import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { validateMediaType, sanitizeError, checkImageSize, MAX_IMAGE_BYTES } from "../_lib/guard";

export const maxDuration = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function geminiGenerate(genAI: GoogleGenerativeAI, modelId: string, parts: any[]): Promise<string> {
  const gemini = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
    }
  });
  const result = await gemini.generateContent(parts);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tipo, ...datos } = body;

  try {
    if (tipo === "imagen") {
      const { base64, mediaType } = datos;

      if (!validateMediaType(mediaType)) {
        return NextResponse.json({ error: "Tipo de imagen no válido" }, { status: 400 });
      }
      const imageBytes = Buffer.byteLength(base64 ?? "", "base64");
      if (!checkImageSize(imageBytes)) {
        return NextResponse.json({ error: `Imagen demasiado grande (máx ${MAX_IMAGE_BYTES / 1024 / 1024} MB)` }, { status: 400 });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

      const prompt = `Eres un experto en marketing de dropshipping para LATAM. Analiza esta imagen de producto y haz una investigación de mercado completa para crear un bot de ventas por WhatsApp.

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

Si no puedes inferir precios, déjalos vacíos. Todo en español.`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [
        { inlineData: { data: base64, mimeType: mediaType } },
        prompt
      ];

      let text: string;
      try {
        text = await geminiGenerate(genAI, "gemini-2.5-flash", parts);
      } catch (primaryErr) {
        console.warn("Gemini 2.5 Flash falló, usando fallback gemini-2.0-flash:", primaryErr);
        text = await geminiGenerate(genAI, "gemini-2.0-flash", parts);
      }

      // Limpiar markdown y extraer JSON
      let clean = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        clean = jsonMatch[0];
      }

      try {
        return NextResponse.json(JSON.parse(clean));
      } catch {
        console.error("Failed to parse JSON:", clean);
        return NextResponse.json({ error: "Respuesta inválida del modelo" }, { status: 500 });
      }
    }

    if (tipo === "url") {
      const { url } = datos;
      if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "URL no válida" }, { status: 400 });
      }

      // Fetch HTML de la página
      let html: string;
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; EcomCircleBot/1.0)" },
        });
        html = await res.text();
      } catch {
        return NextResponse.json({ error: "No se pudo acceder a la URL" }, { status: 400 });
      }

      // Limpiar HTML para reducir tokens
      const cleanHtml = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 15000);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

      const prompt = `Eres un experto en marketing de dropshipping para LATAM. Analiza el contenido de esta página de producto y haz una investigación de mercado completa para crear un bot de ventas por WhatsApp.

CONTENIDO DE LA PÁGINA:
${cleanHtml}

Responde SOLO con este JSON (sin markdown, sin explicaciones):
{
  "producto": "nombre comercial atractivo del producto",
  "problema": "dolor/problema principal que resuelve (en 1 frase corta, desde la perspectiva del cliente)",
  "caracteristicas": "lista de 4-5 características técnicas separadas por salto de línea con guión",
  "beneficios": "lista de 4-5 beneficios emocionales/prácticos separados por salto de línea con guión",
  "precio1": "precio encontrado para 1 unidad (mantén el formato original, ej: $89.900)",
  "precio2": "precio combo 2 unidades si existe, si no existe déjalo vacío",
  "precio3": "precio combo 3 unidades si existe, si no existe déjalo vacío",
  "nombreAgente": "nombre femenino colombiano natural para el bot (ej: Valeria, Daniela, Sara)",
  "enfoque": "nicho de mercado específico (ej: entretenimiento en casa, productividad, bienestar)",
  "metodo": "uno de: El Confidente, FOMO, Escasez, Empatía Total",
  "tono": "uno de: cálido, cercano y seguro, profesional y confiable, energético y motivador, amigable y casual",
  "publicoObjetivo": "descripción breve del cliente ideal (para mostrar como referencia)"
}

Si no encuentras algún dato, déjalo vacío. Todo en español.`;

      let text: string;
      try {
        text = await geminiGenerate(genAI, "gemini-2.5-flash", [prompt]);
      } catch (primaryErr) {
        console.warn("Gemini 2.5 Flash falló, usando fallback:", primaryErr);
        text = await geminiGenerate(genAI, "gemini-2.0-flash", [prompt]);
      }

      let cleanJson = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }

      try {
        return NextResponse.json(JSON.parse(cleanJson));
      } catch {
        console.error("Failed to parse JSON:", cleanJson);
        return NextResponse.json({ error: "Respuesta inválida del modelo" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
