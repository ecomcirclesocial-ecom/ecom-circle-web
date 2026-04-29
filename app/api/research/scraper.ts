import { JSDOM } from "jsdom";

export interface ScrapedProduct {
  titulo: string;
  precio: string;
  url: string;
  vendidos?: string;
  rating?: string;
  reviews?: string[];
}

export interface ScrapingResult {
  mercadoLibre: ScrapedProduct[];
  amazon: ScrapedProduct[];
  aliexpress: ScrapedProduct[];
  resenas: string[];
}

const MERCADOLIBRE_DOMAINS: Record<string, string> = {
  colombia: "listado.mercadolibre.com.co",
  mexico: "listado.mercadolibre.com.mx",
  argentina: "listado.mercadolibre.com.ar",
  chile: "listado.mercadolibre.cl",
  peru: "listado.mercadolibre.com.pe",
  ecuador: "listado.mercadolibre.com.ec",
};

async function fetchWithTimeout(url: string, timeout = 10000): Promise<string | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });
    clearTimeout(id);
    if (!res.ok) return null;
    return res.text();
  } catch {
    clearTimeout(id);
    return null;
  }
}

export async function scrapeMercadoLibre(query: string, pais: string): Promise<ScrapedProduct[]> {
  const domain = MERCADOLIBRE_DOMAINS[pais] || MERCADOLIBRE_DOMAINS.colombia;
  const url = `https://${domain}/${encodeURIComponent(query)}`;
  const html = await fetchWithTimeout(url);
  if (!html) return [];

  const products: ScrapedProduct[] = [];
  try {
    const dom = new JSDOM(html);
    const items = dom.window.document.querySelectorAll(".ui-search-layout__item");

    items.forEach((item, i) => {
      if (i >= 10) return;
      const titleEl = item.querySelector(".ui-search-item__title");
      const priceEl = item.querySelector(".andes-money-amount__fraction");
      const linkEl = item.querySelector("a.ui-search-link");
      const reviewsEl = item.querySelector(".ui-search-reviews__rating-number");
      const soldEl = item.querySelector(".ui-search-item__group__element--subtitle");

      if (titleEl && priceEl) {
        products.push({
          titulo: titleEl.textContent?.trim() || "",
          precio: priceEl.textContent?.trim() || "",
          url: linkEl?.getAttribute("href") || "",
          rating: reviewsEl?.textContent?.trim(),
          vendidos: soldEl?.textContent?.trim(),
        });
      }
    });
  } catch (e) {
    console.error("Error parsing MercadoLibre:", e);
  }
  return products;
}

export async function scrapeAmazon(query: string): Promise<ScrapedProduct[]> {
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  const html = await fetchWithTimeout(url);
  if (!html) return [];

  const products: ScrapedProduct[] = [];
  try {
    const dom = new JSDOM(html);
    const items = dom.window.document.querySelectorAll("[data-component-type='s-search-result']");

    items.forEach((item, i) => {
      if (i >= 10) return;
      const titleEl = item.querySelector("h2 span");
      const priceEl = item.querySelector(".a-price-whole");
      const linkEl = item.querySelector("h2 a");
      const ratingEl = item.querySelector(".a-icon-alt");
      const reviewCountEl = item.querySelector(".a-size-base.s-underline-text");

      if (titleEl) {
        products.push({
          titulo: titleEl.textContent?.trim() || "",
          precio: priceEl?.textContent?.trim() || "N/A",
          url: linkEl ? `https://www.amazon.com${linkEl.getAttribute("href")}` : "",
          rating: ratingEl?.textContent?.trim(),
          vendidos: reviewCountEl?.textContent?.trim(),
        });
      }
    });
  } catch (e) {
    console.error("Error parsing Amazon:", e);
  }
  return products;
}

export async function scrapeAliExpress(query: string): Promise<ScrapedProduct[]> {
  const url = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}`;
  const html = await fetchWithTimeout(url);
  if (!html) return [];

  const products: ScrapedProduct[] = [];
  try {
    const dom = new JSDOM(html);
    const items = dom.window.document.querySelectorAll(".search-item-card-wrapper-gallery");

    items.forEach((item, i) => {
      if (i >= 10) return;
      const titleEl = item.querySelector("h3");
      const priceEl = item.querySelector(".multi--price-sale--U-S0jtj");
      const linkEl = item.querySelector("a");
      const soldEl = item.querySelector(".multi--trade--Ktbl2jB");

      if (titleEl) {
        products.push({
          titulo: titleEl.textContent?.trim() || "",
          precio: priceEl?.textContent?.trim() || "N/A",
          url: linkEl?.getAttribute("href") || "",
          vendidos: soldEl?.textContent?.trim(),
        });
      }
    });
  } catch (e) {
    console.error("Error parsing AliExpress:", e);
  }
  return products;
}

export async function scrapeAll(query: string, pais: string): Promise<ScrapingResult> {
  const [mercadoLibre, amazon, aliexpress] = await Promise.all([
    scrapeMercadoLibre(query, pais),
    scrapeAmazon(query),
    scrapeAliExpress(query),
  ]);

  return {
    mercadoLibre,
    amazon,
    aliexpress,
    resenas: [],
  };
}

export function formatScrapingForPrompt(data: ScrapingResult, pais: string): string {
  let text = `\n\n=== DATOS DE MERCADO RECOPILADOS ===\n\n`;

  text += `📍 PAÍS OBJETIVO: ${pais.toUpperCase()}\n\n`;

  if (data.mercadoLibre.length > 0) {
    text += `🛒 MERCADO LIBRE (${pais}):\n`;
    data.mercadoLibre.forEach((p, i) => {
      text += `${i + 1}. ${p.titulo}\n   Precio: $${p.precio}\n`;
      if (p.vendidos) text += `   Ventas: ${p.vendidos}\n`;
      if (p.rating) text += `   Rating: ${p.rating}\n`;
      text += `\n`;
    });
  } else {
    text += `🛒 MERCADO LIBRE: No se encontraron productos similares\n\n`;
  }

  if (data.amazon.length > 0) {
    text += `\n📦 AMAZON (USA - referencia internacional):\n`;
    data.amazon.forEach((p, i) => {
      text += `${i + 1}. ${p.titulo}\n   Precio: $${p.precio} USD\n`;
      if (p.rating) text += `   Rating: ${p.rating}\n`;
      if (p.vendidos) text += `   Reviews: ${p.vendidos}\n`;
      text += `\n`;
    });
  }

  if (data.aliexpress.length > 0) {
    text += `\n🌏 ALIEXPRESS (precio proveedor):\n`;
    data.aliexpress.forEach((p, i) => {
      text += `${i + 1}. ${p.titulo}\n   Precio: ${p.precio}\n`;
      if (p.vendidos) text += `   Ventas: ${p.vendidos}\n`;
      text += `\n`;
    });
  }

  return text;
}
