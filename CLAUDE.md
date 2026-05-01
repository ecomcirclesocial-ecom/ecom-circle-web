@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Acceso al wiki

Este proyecto vive dentro del Second Brain. El conocimiento está en `../wiki/`:
- `../wiki/entities/Ecom Circle — Comunidad.md` — contexto del negocio
- `../wiki/entities/Marca Personal.md` — pilares de contenido
- `../wiki/index.md` — índice de todas las páginas

---

## Qué es este proyecto

Hub central del ecosistema **Ecom Circle** — Comunidad #1 de Ecommerce y dropshipping 100% con IA en LATAM, fundada por **Nain Guevara** (23 años, Cali, Colombia). +$3.1M USD facturados.

**Dominio:** ecomcircle.co
**Audiencia:** Jóvenes emprendedores de ecommerce/dropshipping en Latinoamérica.
**Idioma:** Todo el texto visible al usuario debe estar en **español**.

---

## Stack técnico

- **Framework:** Next.js 16.2.1 / React 19 / TypeScript
- **Estilos:** Tailwind CSS 4
- **Animaciones:** Framer Motion
- **Iconos:** `@phosphor-icons/react`
- **Componentes:** shadcn/ui
- **Dev:** `npm run dev`

---

## Marca y diseño

| Elemento | Valor |
|---------|-------|
| Fondo | `#0A0A0A` — dark mode por defecto |
| Acento | `#FF5911` — naranja |
| Texto | `#FFFFFF` |
| Fuente | Inter (Google Fonts) |
| Tono | Profesional, minimalista, aspiracional — estilo Iman Gadzhi |
| Mobile | `min-h-[100dvh]` nunca `h-screen` |

---

## Contenido clave

- **Tagline:** Comunidad #1 de Ecommerce y dropshipping 100% con IA
- **Cifra principal:** +$3.1M USD facturados
- **Fundador:** Nain Guevara, 23 años, Cali, Colombia
- **Historia:** Empezó vendiendo perros calientes → compra de mercancía → campañas por WhatsApp → éxito en ecommerce
- **Marcas aliadas:** Dropi, Shopify, Chatea Pro, Lucid Bot, Scallbots, Funnelish

---

## Secciones de la página principal (orden)

Navbar → Hero → LogosSection → AboutSection → BenefitsSection → ToolsSection → TestimonialsSection → FormSection → FAQSection → Footer

---

## Beneficios VIP

1. Masterclass semanal (ads, logística, etc.)
2. Seguimiento personalizado (Top 10 / +1000 pedidos)
3. DropsKiller GRATIS (Top 10 / +1000 pedidos)
4. Productos validados cada 15 días (Top 10)
5. Precios preferenciales en bodegas: Vitalcom, Goldbox, Dropster
6. Reuniones presenciales y días de trabajo

---

## Formulario de cambio de comunidad

Campos: nombre, WhatsApp, comunidad actual, razón del cambio → envío por email.

---

## Redes sociales

- Instagram: https://www.instagram.com/nain_guevara/
- TikTok: https://www.tiktok.com/@nain_guevara
- YouTube: https://www.youtube.com/@nainGuevara

---

## Rutas

```
/                          → Hub principal (todas las secciones)
/club                      → Ecom Circle Club (Skool)
/lifestyle                 → Programa 1:1 high ticket
/dropi                     → Comunidad Dropi
/tools                     → Índice de herramientas
/tools/prompt-builder      → Constructor de prompts
/tools/product-validator   → Validador de productos
```

---

## gstack

- Para toda navegación web, usar el skill `/browse` de gstack
- **Nunca** usar las herramientas `mcp__claude-in-chrome__*`

Skills disponibles:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

---

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

---

## Reglas de código

- Comentar y responder siempre en **español**
- No embeber contenido de YouTube/TikTok
- Testimonios y FAQ son placeholder por ahora
- Componentes del site → `components/sections/`
- Herramientas → `components/tools/` (portables, aisladas para futura migración a app.ecomcircle.co)
- Sin features ni error handling que no se hayan pedido
- Si algo puede hacerse con menos código, hacerlo con menos
