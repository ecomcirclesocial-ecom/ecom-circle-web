import Link from "next/link";
import { Nav } from "@/components/nav";

export default function ProductValidatorPage() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      <Nav />
      {/* Destellos naranja */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF5911] rounded-full opacity-15 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#FF5911] rounded-full opacity-10 blur-[100px]" />

      {/* Contenido */}
      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        <p className="text-xs tracking-widest uppercase text-white/40 mb-6">
          Herramienta
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          En construcción
        </h1>
        <p className="text-white/60 text-base leading-relaxed mb-10">
          Con amor, por <span className="text-white font-medium">Nain</span> y la comunidad{" "}
          <span className="text-[#FF5911] font-medium">Ecom Circle</span>.
        </p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 bg-white text-[#0A0A0A] text-sm font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
        >
          ← Ver otras herramientas
        </Link>
      </div>
    </div>
  );
}
