import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sanitizeError } from "../_lib/guard";

export const maxDuration = 120;

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB

const PROMPT = `Eres un experto en marketing y ventas para ecommerce/dropshipping en LATAM.

Basándote en la investigación de mercado adjunta (si se proporcionó), genera exactamente 10 ángulos de venta únicos y accionables para el siguiente producto en el mercado de {PAIS}.

Producto: {PRODUCTO}

Considera el contexto cultural, económico y los hábitos de compra específicos de {PAIS}. Cada ángulo debe ser distinto y abordar una motivación diferente del comprador.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional antes ni después:
{
  "angulos": [
    {
      "numero": 1,
      "tipo": "Dolor",
      "titulo": "...",
      "gancho": "...",
      "descripcion": "..."
    }
  ]
}

Tipos posibles (úsalos variados): Dolor, Deseo, Objeción, Aspiracional, Miedo, Curiosidad, Urgencia, Social, Transformación, Beneficio

- titulo: nombre corto del ángulo (máx 6 palabras)
- gancho: frase de apertura lista para usar en un anuncio (máx 15 palabras, impactante)
- descripcion: por qué funciona este ángulo en {PAIS} y cómo desarrollarlo (2-3 oraciones concretas)`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const producto = formData.get("producto") as string;
    const pais = formData.get("pais") as string;
    const pdfFile = formData.get("pdf") as File | null;

    if (!producto?.trim() || !pais?.trim()) {
      return NextResponse.json({ error: "Producto y país son requeridos" }, { status: 400 });
    }

    if (pdfFile && pdfFile.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF demasiado grande (máx 20 MB)" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = PROMPT.replace(/{PAIS}/g, pais).replace("{PRODUCTO}", producto);

    type ContentBlock = Anthropic.MessageParam["content"];
    const content: ContentBlock = [];

    if (pdfFile) {
      const buffer = await pdfFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      (content as Anthropic.ContentBlockParam[]).push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      } as unknown as Anthropic.ContentBlockParam);
    }

    (content as Anthropic.ContentBlockParam[]).push({ type: "text", text: prompt });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content }],
    });

    const raw = (message.content[0] as { type: "text"; text: string }).text;

    // Extraer JSON aunque haya texto extra
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Respuesta inválida del modelo" }, { status: 500 });
    }

    const data = JSON.parse(match[0]);
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
