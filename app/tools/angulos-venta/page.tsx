import { Nav } from "@/components/nav";
import { AngulosVenta } from "@/components/tools/angulos-venta";

export const metadata = {
  title: "Generador de Ángulos de Venta — Ecom Circle",
  description: "Sube tu investigación de mercado y genera 10 ángulos de venta accionables para tu producto.",
};

export default function AngulosVentaPage() {
  return (
    <>
      <Nav />
      <main className="min-h-[100dvh] bg-[#0A0A0A]">
        <section className="pt-28 pb-24 px-4 max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase text-[#FF5911] mb-3">
              Herramienta gratuita · Ecom Circle
            </p>
            <h1 className="font-extrabold text-4xl text-white leading-tight mb-2">
              Ángulos de Venta
            </h1>
            <p className="text-white/50 text-base font-normal">
              10 formas distintas de vender tu producto
            </p>
            <p className="text-sm text-white/40 max-w-md mt-1.5">
              Sube tu investigación de mercado en PDF y selecciona el país. La IA genera ángulos accionables: dolor, deseo, objeción, urgencia y más.
            </p>
          </div>

          <AngulosVenta />

        </section>
      </main>
    </>
  );
}
