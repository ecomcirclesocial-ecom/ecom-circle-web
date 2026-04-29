import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { ArrowUpRight, ArrowLeft, NumberOne, NumberTwo, NumberThree, NumberFour, NumberFive, NumberSix } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const LINK_FREEPIK_SPACE = "https://www.freepik.es/pikaso/spaces/a17ce684-50f8-401a-ac60-ce8f83d4408d/invite?payload=eyJpdiI6IlJCOTFDQzdkVlRzdElBNlV0UE1RcFE9PSIsInZhbHVlIjoiWUFZc1Iwa21vRUc2NStmUUZSZlgyc2ZiTWh1NUpEOTZLcXV2L1FsTnJCV1hZMjFoUVVLQi9kM1NqZEg3UWU2SDlTZXAwMlhvay9KWXB6dGZCSUNBS1cwZGNxMmNVTTcwQmdGOThiUDVtMEl4T3llbXEvUU16cmJIck9zUU9FU3UiLCJtYWMiOiI5NDRkOWVkNjgxNTkzMDk1NjdmNDJkNGI4Y2I3NDU2NmY4YWYyNWE2MmQ0MDI3N2E5NmJiZGI1NGYzOTRhMjk1IiwidGFnIjoiIn0%3D";

const pasos = [
  {
    num: "01",
    titulo: "Acepta la invitación a Freepik Space",
    desc: "Haz clic en el botón de abajo para abrir el link de invitación. Si no tienes cuenta en Freepik, créala gratis con tu correo.",
  },
  {
    num: "02",
    titulo: "Ingresa al Space",
    desc: 'Una vez dentro, verás el espacio compartido "Flujo Landing Pages". Ábrelo haciendo clic sobre él.',
  },
  {
    num: "03",
    titulo: "Duplica el diseño",
    desc: 'En la esquina superior derecha haz clic en "Duplicar" para tener tu propia copia editable. Nunca edites el original.',
  },
  {
    num: "04",
    titulo: "Personaliza cada sección",
    desc: "El flujo tiene 9 secciones listas: Hero, Problema, Solución, Beneficios, Cómo funciona, Testimonios, FAQ, CTA y Footer. Reemplaza los textos e imágenes con los de tu producto.",
  },
];

export default function FlujoLandingPages() {
  return (
    <>
      <Nav />
      <main className="min-h-[100dvh] bg-[#0A0A0A]">
        <section className="pt-32 pb-24 px-4 max-w-2xl mx-auto">

          {/* Volver */}
          <Link href="/recursos" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-10 transition-colors">
            <ArrowLeft size={14} weight="bold" />
            Recursos
          </Link>

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-3">Recurso gratuito · Ecom Circle</p>
            <h1 className="font-extrabold text-3xl md:text-4xl text-white leading-tight mb-3">
              Flujo de landing pages<br />
              <span className="text-white/40 font-normal">9 secciones con Freepik Space</span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-md">
              Plantilla completa y editable para construir tu landing page de producto en minutos. Sin saber diseño.
            </p>
          </div>

          {/* Video tutorial */}
          <div className="rounded-2xl overflow-hidden border border-white/8 mb-10">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/lRhWYJIKtgk?si=mFf-AWfSnT3qHHKi"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          {/* Pasos */}
          <div className="mb-3">
            <p className="text-xs tracking-widest uppercase text-white/25 mb-4">Paso a paso</p>
          </div>

          <div className="flex flex-col gap-3 mb-10">
            {pasos.map((p) => (
              <div key={p.num} className="flex gap-4 items-start p-4 rounded-2xl bg-white/4 border border-white/8">
                <span className="text-[#FF5911] font-bold text-xs pt-0.5 shrink-0">{p.num}</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{p.titulo}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA principal */}
          <a
            href={LINK_FREEPIK_SPACE}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 w-full bg-[#FF5911] text-white font-bold rounded-full py-4 hover:bg-[#FF5911]/85 transition-all duration-200 active:scale-[0.98] text-sm"
          >
            Abrir Freepik Space
            <span className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowUpRight size={12} weight="bold" />
            </span>
          </a>

        </section>
      </main>
      <Footer />
    </>
  );
}
