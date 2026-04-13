import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { ProductResearcher } from "@/components/tools/product-researcher";

export default function ProductResearcherPage() {
  return (
    <>
      <Nav />
      <main className="pt-28 min-h-[100dvh] bg-[#0A0A0A]">
        <section className="px-4 py-10 max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-3">Herramienta gratuita · Ecom Circle</p>
            <h1 className="font-[family-name:var(--font-jakarta)] font-extrabold text-4xl md:text-5xl text-white leading-tight mb-3">
              Investigación de Producto
            </h1>
            <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
              Sube una foto, ingresa el nombre y obtén un análisis completo de 30 puntos para dropshipping en LATAM.
            </p>
          </div>
          <ProductResearcher />
        </section>
      </main>
      <Footer />
    </>
  );
}
