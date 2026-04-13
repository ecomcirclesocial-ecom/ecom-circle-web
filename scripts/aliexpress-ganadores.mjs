/**
 * aliexpress-ganadores.mjs
 * Busca productos ganadores en AliExpress ordenados por más pedidos.
 *
 * Uso:
 *   node scripts/aliexpress-ganadores.mjs "bolsos mujer"
 *   node scripts/aliexpress-ganadores.mjs "auriculares" --limit 20
 *   npm run aliexpress -- "cargador inalambrico" --limit 15
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ── Args ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (!args[0] || args[0].startsWith("--")) {
  console.error('\n  USO: node scripts/aliexpress-ganadores.mjs "keyword" [--limit N]\n');
  process.exit(1);
}

const keyword = args[0];
const limitIndex = args.indexOf("--limit");
const limit = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1]) : 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convierte texto de pedidos ("10K+", "1,234 sold", "500+") a número para ordenar.
 */
function parsearPedidos(texto) {
  if (!texto) return 0;
  const limpio = texto.toLowerCase().replace(/,/g, "").replace(/\s/g, "");
  if (limpio.includes("k")) {
    return parseFloat(limpio.replace("k+", "").replace("k", "")) * 1000;
  }
  const num = parseInt(limpio.replace(/[^0-9]/g, ""));
  return isNaN(num) ? 0 : num;
}

/**
 * Acorta URL de AliExpress a solo el dominio + /item/ID
 */
function acortarUrl(href) {
  if (!href) return "";
  try {
    const url = new URL(href.startsWith("//") ? "https:" + href : href);
    const match = url.pathname.match(/\/item\/(\d+)/);
    if (match) return `https://www.aliexpress.com/item/${match[1]}.html`;
    return "https://www.aliexpress.com" + url.pathname;
  } catch {
    return href;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function buscarProductosGanadores() {
  const url = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(keyword)}&SortType=total_transy_desc`;

  console.log(`\n🔍 Buscando: "${keyword}" | Ordenado por: más pedidos\n`);

  const browser = await chromium.launch({
    headless: false, // visible para evitar detección anti-bot
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "es-CO",
  });

  const page = await context.newPage();

  // Ocultar webdriver fingerprint
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Esperar a que aparezcan tarjetas de producto
    await page
      .waitForSelector('a[href*="/item/"]', { timeout: 20000 })
      .catch(() => {
        console.warn("  ⚠️  Timeout esperando productos. AliExpress puede haber bloqueado la solicitud.");
      });

    // Scroll para cargar más productos
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(2000);

    // ── Extracción de datos ────────────────────────────────────────────────────
    const productos = await page.evaluate(() => {
      const resultados = [];

      // Selectores posibles para tarjetas (AliExpress los cambia frecuentemente)
      const selectorTarjetas = [
        '[class*="search-item-card"]',
        '[class*="list--gallery"]  > [class*="item"]',
        'div[class*="product-snippet"]',
        'div[class*="manhattan--"]',
      ];

      let tarjetas = [];
      for (const sel of selectorTarjetas) {
        tarjetas = Array.from(document.querySelectorAll(sel));
        if (tarjetas.length > 0) break;
      }

      // Fallback: agrupamos por anchor de producto
      if (tarjetas.length === 0) {
        const anchors = Array.from(document.querySelectorAll('a[href*="/item/"]'));
        // Subir al contenedor padre para evitar duplicados
        const vistos = new Set();
        for (const a of anchors) {
          const contenedor = a.closest('div[class]') || a.parentElement;
          if (!contenedor || vistos.has(contenedor)) continue;
          vistos.add(contenedor);
          tarjetas.push(contenedor);
        }
      }

      for (const tarjeta of tarjetas) {
        // Título
        const tituloEl =
          tarjeta.querySelector('[class*="title--"] span') ||
          tarjeta.querySelector('h3') ||
          tarjeta.querySelector('[class*="title"]') ||
          tarjeta.querySelector('a[title]');
        const titulo = tituloEl?.textContent?.trim() || tituloEl?.getAttribute("title") || "";

        // Pedidos — busca texto con patrón de número + "sold"/"orders"/"vendidos"
        // y excluye textos de descuento que contienen "$"
        const REGEX_PEDIDOS = /(\d[\d.,k+]*\s*(sold|orders|vendido|pedido|order))/i;
        const pedidosEl = Array.from(tarjeta.querySelectorAll("span, div, strong")).find((el) => {
          if (el.children.length > 0) return false;
          const t = el.textContent.trim();
          // Excluir si tiene símbolo de precio
          if (t.includes("$") || t.includes("USD") || t.includes("COP")) return false;
          return REGEX_PEDIDOS.test(t);
        });
        const pedidos = pedidosEl?.textContent?.trim() || "";

        // URL
        const linkEl = tarjeta.querySelector('a[href*="/item/"]');
        const href = linkEl?.getAttribute("href") || "";

        if (titulo && href) {
          resultados.push({ titulo, pedidos, href });
        }
      }

      return resultados;
    });

    await browser.close();

    if (productos.length === 0) {
      console.error(
        "  ❌ No se encontraron productos. Posibles causas:\n" +
          "     • AliExpress bloqueó el scraping\n" +
          "     • Los selectores cambiaron (actualiza el script)\n" +
          "     • Verifica tu conexión a internet\n"
      );
      process.exit(1);
    }

    // Normalizar y ordenar
    const normalizados = productos
      .map((p, i) => ({
        "#": i + 1,
        Producto: p.titulo.slice(0, 60) + (p.titulo.length > 60 ? "…" : ""),
        Pedidos: p.pedidos || "—",
        _pedidosNum: parsearPedidos(p.pedidos),
        Link: acortarUrl(p.href),
      }))
      .sort((a, b) => b._pedidosNum - a._pedidosNum)
      .slice(0, limit)
      .map((p, i) => ({ "#": i + 1, Producto: p.Producto, Pedidos: p.Pedidos, Link: p.Link }));

    // Output consola
    console.table(normalizados);
    console.log(`\n✅ ${normalizados.length} productos encontrados`);

    // Guardar JSON
    const __dir = dirname(fileURLToPath(import.meta.url));
    const outputPath = join(__dir, "..", "aliexpress-resultados.json");
    writeFileSync(
      outputPath,
      JSON.stringify(
        {
          keyword,
          fecha: new Date().toISOString(),
          total: normalizados.length,
          productos: normalizados,
        },
        null,
        2
      )
    );
    console.log(`💾 Guardado en: aliexpress-resultados.json\n`);
  } catch (err) {
    await browser.close();
    console.error("\n  ❌ Error durante la ejecución:", err.message, "\n");
    process.exit(1);
  }
}

buscarProductosGanadores();
