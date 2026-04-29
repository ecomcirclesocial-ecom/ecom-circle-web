import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { validateMediaType, sanitizeError, checkImageSize, MAX_IMAGE_BYTES } from "../_lib/guard";
import { scrapeAll, formatScrapingForPrompt } from "./scraper";

export const maxDuration = 300;

const PAISES_CONFIG: Record<string, { moneda: string; nombre: string }> = {
  colombia: { moneda: "COP", nombre: "Colombia" },
  mexico: { moneda: "MXN", nombre: "México" },
  argentina: { moneda: "ARS", nombre: "Argentina" },
  chile: { moneda: "CLP", nombre: "Chile" },
  peru: { moneda: "PEN", nombre: "Perú" },
  ecuador: { moneda: "USD", nombre: "Ecuador" },
  espana: { moneda: "EUR", nombre: "España" },
};

function buildPrompt(nombre: string, info: string, pais: string, scrapingData: string): string {
  const config = PAISES_CONFIG[pais] || PAISES_CONFIG.colombia;

  return `Eres un consultor experto en ecommerce y dropshipping para ${config.nombre}. Genera una INVESTIGACIÓN DE MERCADO PROFESIONAL para el siguiente producto.

REGLAS ESTRICTAS:
- Cada sección DEBE tener mínimo 2 párrafos completos y detallados (no oraciones sueltas)
- Incluye datos específicos, números y ejemplos concretos
- Precios en ${config.moneda} (moneda de ${config.nombre})
- Escribe como un consultor profesional
- Usa los datos de mercado proporcionados

${scrapingData}

═══════════════════════════════════════════════════════════════════════════════
PRODUCTO: ${nombre}
INFORMACIÓN ADICIONAL: ${info}
PAÍS OBJETIVO: ${config.nombre}
═══════════════════════════════════════════════════════════════════════════════

Genera EXACTAMENTE las siguientes 30 secciones. Usa el formato "NÚMERO. TÍTULO EN MAYÚSCULAS" seguido del contenido:

1. DESCRIPCIÓN DEL PRODUCTO
Describe el producto en detalle: diseño, materiales, funcionalidades principales, tamaño, colores disponibles. Explica qué hace único a este producto y para qué sirve. Mínimo 2 párrafos.

2. PÚBLICO OBJETIVO
Define los 3 perfiles principales de compradores: edad, género, ubicación, ingresos, estilo de vida, por qué comprarían este producto. Sé específico con cada perfil.

3. PROPUESTA DE VALOR
¿Cuál es la promesa principal del producto? ¿Qué problema resuelve? ¿Qué experiencia vende? Escribe la propuesta de valor en una oración potente y luego explícala.

4. ANÁLISIS DE MERCADO EN ${config.nombre.toUpperCase()}
Analiza el mercado específico de ${config.nombre}: tendencias de consumo, poder adquisitivo, penetración de ecommerce, demanda de este tipo de productos. Usa datos concretos.

5. POTENCIAL DE VENTAS
Evalúa el potencial real: ¿es un producto viral? ¿tiene demanda estable? ¿qué volumen de ventas se puede esperar? Justifica con argumentos.

6. PRECIO DE VENTA RECOMENDADO
Precio sugerido en ${config.moneda} basado en el análisis de competencia y costos. Explica el razonamiento detrás del precio elegido.

7. MARGEN DE GANANCIA ESTIMADO
Calcula: costo de producto, precio de venta, costo de envío, comisiones, publicidad estimada. Presenta el margen bruto y neto por unidad.

8. COMPETENCIA EN EL MERCADO
Analiza la competencia en Mercado Libre, Amazon, AliExpress y otras tiendas. ¿Cuántos competidores hay? ¿A qué precios venden? ¿Cuál es su estrategia?

9. DIFERENCIADORES CLAVE
¿Cómo puedes destacar de la competencia? Ideas de branding, empaque, servicio, bundles, garantías. Mínimo 5 diferenciadores concretos.

10. ÁNGULOS DE MARKETING
Define 5 ángulos diferentes para vender el producto:
- Ángulo 1: Problema/Solución
- Ángulo 2: Aspiracional/Lifestyle
- Ángulo 3: Urgencia/Escasez
- Ángulo 4: Social Proof
- Ángulo 5: Comparación/Ahorro
Describe cada uno brevemente.

11. COPY PARA ANUNCIO (FACEBOOK/INSTAGRAM)
Escribe 3 versiones de copy completo para Facebook/Instagram Ads. Cada uno con: hook, cuerpo, beneficios y CTA. Usa emojis apropiados.

12. COPY PARA ANUNCIO (TIKTOK)
Escribe 3 versiones de copy/guión para TikTok. Formato: hook viral en los primeros 3 segundos, desarrollo rápido, CTA. Estilo conversacional y dinámico.

13. PALABRAS CLAVE PRINCIPALES
Lista de 20 palabras clave relevantes para SEO y campañas de búsqueda. Incluye variaciones locales para ${config.nombre}.

14. OBJECIONES COMUNES Y CÓMO MANEJARLAS
Lista las 10 objeciones más comunes que tendrán los clientes y proporciona la respuesta/script exacto para cada una.

15. GATILLOS EMOCIONALES DE COMPRA
Identifica los 8 gatillos emocionales más efectivos para este producto: miedo, deseo, urgencia, pertenencia, etc. Explica cómo activar cada uno.

16. ESTRATEGIA DE PRECIO PSICOLÓGICO
Técnicas de pricing: precios terminados en 9, anclaje con precio anterior, bundles, "envío gratis", ofertas por tiempo limitado. Ejemplos concretos.

17. UPSELLS Y CROSS-SELLS RECOMENDADOS
Lista 5 productos para upsell y 5 para cross-sell con precios sugeridos. Explica por qué funcionan con este producto.

18. TEMPORADAS Y ÉPOCAS DE ALTA DEMANDA
Identifica los meses y fechas de mayor demanda: Black Friday, Navidad, Día de las Madres, eventos deportivos, etc. Crea un calendario anual.

19. PAÍSES DE LATAM CON MAYOR POTENCIAL
Ranking de los 5 países con mejor potencial para este producto. Justifica cada uno: tamaño de mercado, logística, competencia, poder adquisitivo.

20. PLATAFORMAS DE VENTA RECOMENDADAS
¿Dónde vender? Shopify, Mercado Libre, WhatsApp Business, Instagram Shopping. Pros y contras de cada plataforma para este producto.

21. ESTRATEGIA DE CONTENIDO ORGÁNICO
Plan de contenido orgánico: tipos de videos, formatos de posts, frecuencia, temas. Ideas específicas para TikTok, Instagram y YouTube Shorts.

22. INFLUENCERS Y NICHOS AFINES
Tipos de influencers ideales, nichos relacionados, rango de seguidores recomendado, qué ofrecerles, cómo contactarlos.

23. POSIBLES PROBLEMAS LOGÍSTICOS
Desafíos de envío a ${config.nombre}: tiempos, aduanas, costos, direcciones. Soluciones para cada problema.

24. CALIDAD Y DURABILIDAD PERCIBIDA
¿Cómo se percibe la calidad del producto? ¿Qué decir sobre materiales y durabilidad? ¿Qué garantía ofrecer?

25. ELEMENTOS VISUALES PARA CREATIVOS
Qué debe incluir el contenido visual: tipos de fotos, escenarios, estilo de video, colores, música, textos en pantalla.

26. TESTIMONIOS Y PRUEBA SOCIAL (PLANTILLA)
3 plantillas de testimonios realistas que se pueden usar. Incluye nombre ficticio, ubicación y experiencia detallada.

27. PREGUNTAS FRECUENTES (FAQ)
Las 10 preguntas más frecuentes que harán los clientes con respuestas completas y profesionales.

28. POLÍTICA DE DEVOLUCIONES SUGERIDA
Política de garantía y devoluciones recomendada. Cómo manejar productos defectuosos vs insatisfacción del cliente.

29. ESCALA Y CRECIMIENTO
Plan de crecimiento en 3 etapas: validación (0-50 ventas), escala (50-500 ventas), consolidación (500+ ventas). Qué hacer en cada etapa.

30. VEREDICTO FINAL Y RECOMENDACIÓN
Puntuación de viabilidad del 1 al 10. Recomendación clara: ¿Proceder o no? Plan de acción concreto para los primeros 15 días.

═══════════════════════════════════════════════════════════════════════════════

IMPORTANTE: Desarrolla CADA sección completamente. No dejes ninguna incompleta. Escribe en español.`;
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function geminiGenerate(genAI: GoogleGenerativeAI, modelId: string, parts: any[]): Promise<string> {
  const gemini = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      maxOutputTokens: 32000,
      temperature: 0.7,
    }
  });
  const result = await gemini.generateContent(parts);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const model = formData.get("model") as string;
    const nombre = formData.get("nombre") as string;
    const info = (formData.get("info") as string) || "Sin información adicional";
    const pais = (formData.get("pais") as string) || "colombia";
    const imageFile = formData.get("imagen") as File | null;

    if (imageFile) {
      if (!validateMediaType(imageFile.type)) {
        return NextResponse.json({ error: "Tipo de imagen no válido" }, { status: 400 });
      }
      if (!checkImageSize(imageFile.size)) {
        return NextResponse.json({ error: `Imagen demasiado grande (máx ${MAX_IMAGE_BYTES / 1024 / 1024} MB)` }, { status: 400 });
      }
    }

    let scrapingData = "";
    try {
      const scraped = await scrapeAll(nombre, pais);
      scrapingData = formatScrapingForPrompt(scraped, pais);
    } catch (e) {
      console.warn("Scraping falló:", e);
      scrapingData = "\n\n=== DATOS DE MERCADO ===\nNo se pudieron obtener datos de scraping. Genera la investigación basándote en tu conocimiento del mercado.\n\n";
    }

    const prompt = buildPrompt(nombre, info, pais, scrapingData);

    if (model === "jiminy") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [];

      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        parts.push({ inlineData: { data: base64, mimeType: imageFile.type } });
      }
      parts.push(prompt);

      let text: string;
      try {
        text = await geminiGenerate(genAI, "gemini-3.1-pro-preview", parts);
      } catch (primaryErr) {
        console.warn("Gemini 3.1 Pro falló, usando fallback 2.5 Pro:", primaryErr);
        try {
          text = await geminiGenerate(genAI, "gemini-2.5-pro", parts);
        } catch (fallbackErr) {
          console.error("Ambos modelos fallaron:", fallbackErr);
          throw primaryErr;
        }
      }

      return NextResponse.json({ resultado: text });
    }

    if (model === "claude") {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const content: Anthropic.MessageParam["content"] = [];

      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: imageFile.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: base64,
          },
        });
      }
      content.push({ type: "text", text: prompt });

      const message = await client.messages.create({
        model: "claude-opus-4-7-20250219",
        max_tokens: 16000,
        messages: [{ role: "user", content }],
      });

      const text = (message.content[0] as { type: "text"; text: string }).text;
      return NextResponse.json({ resultado: text });
    }

    return NextResponse.json({ error: "Modelo inválido" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
