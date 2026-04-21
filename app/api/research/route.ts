import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { validateMediaType, sanitizeError, checkImageSize, MAX_IMAGE_BYTES } from "../_lib/guard";

export const maxDuration = 120;

const PROMPT = `Eres un experto en ecommerce y dropshipping para el mercado latinoamericano. Analiza el producto y genera una investigación completa y detallada con exactamente las siguientes 30 secciones. Responde en español. Sé específico, práctico y orientado a ventas en LATAM.

Formato de respuesta: usa exactamente estos títulos de sección seguidos de dos puntos y tu análisis. Cada sección debe tener al menos 3-5 oraciones con información valiosa y accionable.

1. DESCRIPCIÓN DEL PRODUCTO
2. PÚBLICO OBJETIVO
3. PROPUESTA DE VALOR
4. ANÁLISIS DE MERCADO EN LATAM
5. POTENCIAL DE VENTAS
6. PRECIO DE VENTA RECOMENDADO
7. MARGEN DE GANANCIA ESTIMADO
8. COMPETENCIA EN EL MERCADO
9. DIFERENCIADORES CLAVE
10. ÁNGULOS DE MARKETING
11. COPY PARA ANUNCIO (FACEBOOK/INSTAGRAM)
12. COPY PARA ANUNCIO (TIKTOK)
13. PALABRAS CLAVE PRINCIPALES
14. OBJECIONES COMUNES Y CÓMO MANEJARLAS
15. GATILLOS EMOCIONALES DE COMPRA
16. ESTRATEGIA DE PRECIO PSICOLÓGICO
17. UPSELLS Y CROSS-SELLS RECOMENDADOS
18. TEMPORADAS Y ÉPOCAS DE ALTA DEMANDA
19. PAÍSES DE LATAM CON MAYOR POTENCIAL
20. PLATAFORMAS DE VENTA RECOMENDADAS
21. ESTRATEGIA DE CONTENIDO ORGÁNICO
22. INFLUENCERS Y NICHOS AFINES
23. POSIBLES PROBLEMAS LOGÍSTICOS
24. CALIDAD Y DURABILIDAD PERCIBIDA
25. ELEMENTOS VISUALES PARA CREATIVOS
26. TESTIMONIOS Y PRUEBA SOCIAL (PLANTILLA)
27. PREGUNTAS FRECUENTES (FAQ)
28. POLÍTICA DE DEVOLUCIONES SUGERIDA
29. ESCALA Y CRECIMIENTO
30. VEREDICTO FINAL Y RECOMENDACIÓN

Producto: {NOMBRE}

Información adicional: {INFO}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const model = formData.get("model") as string;
    const nombre = formData.get("nombre") as string;
    const info = (formData.get("info") as string) || "Sin información adicional";
    const imageFile = formData.get("imagen") as File | null;

    if (imageFile) {
      if (!validateMediaType(imageFile.type)) {
        return NextResponse.json({ error: "Tipo de imagen no válido" }, { status: 400 });
      }
      if (!checkImageSize(imageFile.size)) {
        return NextResponse.json({ error: `Imagen demasiado grande (máx ${MAX_IMAGE_BYTES / 1024 / 1024} MB)` }, { status: 400 });
      }
    }

    const prompt = PROMPT.replace("{NOMBRE}", nombre).replace("{INFO}", info);

    if (model === "jiminy") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [];

      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        parts.push({ inlineData: { data: base64, mimeType: imageFile.type } });
      }

      parts.push(prompt);

      const PRIMARY_MODEL = "gemini-3.1-pro-preview";
      const FALLBACK_MODEL = "gemini-2.5-flash";

      let lastError: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const gemini = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
          const result = await gemini.generateContent(parts);
          const text = result.response.text();
          return NextResponse.json({ resultado: text });
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status;
          if (status !== 503) throw err;
          lastError = err;
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }

      // Fallback tras 3 intentos fallidos con 503
      console.warn("Gemini primario no disponible, usando fallback:", lastError);
      const gemini = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      const result = await gemini.generateContent(parts);
      const text = result.response.text();
      return NextResponse.json({ resultado: text, usedFallback: true });
    }

    if (model === "claude") {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const content: Anthropic.MessageParam["content"] = [];

      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        content.push({
          type: "image",
          source: { type: "base64", media_type: imageFile.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64 },
        });
      }

      content.push({ type: "text", text: prompt });

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        messages: [{ role: "user", content }],
      });

      const text = (message.content[0] as { type: "text"; text: string }).text;
      return NextResponse.json({ resultado: text });
    }

    return NextResponse.json({ error: "Modelo inválido" }, { status: 400 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
