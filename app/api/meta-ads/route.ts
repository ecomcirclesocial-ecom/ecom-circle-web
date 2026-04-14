import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeError } from "../_lib/guard";

export const maxDuration = 60;

const PROMPT = `Eres un experto en publicidad de Meta Ads (Facebook e Instagram) especializado en ecommerce y dropshipping para LATAM.

El usuario te va a pegar métricas crudas de sus campañas de Meta Ads. Analízalas y genera un diagnóstico completo y accionable.

MÉTRICAS DEL USUARIO:
{METRICAS}

Responde SOLO con este JSON (sin markdown, sin texto extra):
{
  "resumen": "1-2 oraciones resumiendo el estado general de las campañas",
  "puntuacion": número del 1 al 10 indicando la salud general,
  "metricas_clave": [
    { "nombre": "nombre de la métrica", "valor": "valor detectado", "estado": "bueno|regular|malo", "referencia": "benchmark de referencia para LATAM ecommerce" }
  ],
  "problemas": [
    { "titulo": "nombre del problema", "descripcion": "qué está mal y por qué" }
  ],
  "oportunidades": [
    { "titulo": "nombre de la oportunidad", "descripcion": "qué se puede mejorar y cómo" }
  ],
  "acciones": [
    "acción concreta #1",
    "acción concreta #2",
    "acción concreta #3"
  ],
  "conclusion": "párrafo final con el próximo paso más importante a tomar"
}

Reglas:
- Si no puedes identificar alguna métrica clave, omítela de metricas_clave
- Sé directo, específico y orientado a resultados en ecommerce LATAM
- Todo en español`;

export async function POST(req: NextRequest) {
  try {
    const { metricas } = await req.json();
    if (!metricas || typeof metricas !== "string" || metricas.trim().length < 10) {
      return NextResponse.json({ error: "Pega las métricas de tu campaña" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(PROMPT.replace("{METRICAS}", metricas));
    const text = result.response.text().replace(/```(?:json)?\n?/g, "").trim();

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
