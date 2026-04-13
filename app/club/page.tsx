import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { ArrowUpRight, Users, BookOpen, Lightning, Handshake } from "@phosphor-icons/react/dist/ssr";

const beneficios = [
  { icon: BookOpen, titulo: "Clases prácticas", descripcion: "Ecommerce, dropshipping, mentalidad y más. Contenido que se puede aplicar desde el día 1." },
  { icon: Lightning, titulo: "Herramientas exclusivas", descripcion: "Scripts, calculadoras, plantillas y recursos que la comunidad construye junta." },
  { icon: Users, titulo: "Comunidad activa", descripcion: "Personas que no solo quieren vivir del ecommerce — quieren vivir para él y para servir." },
  { icon: Handshake, titulo: "Red de contactos", descripcion: "Socios, proveedores y emprendedores que se vuelven más que amigos. Se vuelven familia." },
];

export default function ClubPage() {
  return (
    <>
      <Nav />
      <main className="pt-28 min-h-[100dvh]">
        {/* Hero */}
        <section className="px-4 py-20 max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-widest uppercase text-[#0A0A0A]/40 mb-4">Membresía</p>
          <h1 className="font-[family-name:var(--font-jakarta)] font-extrabold text-5xl md:text-6xl text-[#0A0A0A] leading-tight mb-6">
            Ecom Circle Club
          </h1>
          <p className="text-[#0A0A0A]/55 text-lg max-w-xl mx-auto leading-relaxed mb-10">
            El club de enseñanza de ecommerce y dropshipping más comprometido de LATAM.
            Educación real, comunidad real, resultados reales.
          </p>
          <a
            href="https://skool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#0A0A0A] text-[#FDFBF7] font-medium rounded-full px-7 py-3.5 hover:bg-[#0A0A0A]/85 transition-colors"
          >
            Unirse al Club
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowUpRight size={12} weight="bold" />
            </span>
          </a>
        </section>

        {/* Beneficios */}
        <section className="px-4 pb-24 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {beneficios.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.titulo} className="p-1.5 rounded-[1.5rem] bg-white/50 ring-1 ring-black/6">
                <div className="p-6 rounded-[calc(1.5rem-6px)] bg-[#FDFBF7] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <Icon size={18} weight="light" className="text-[#0A0A0A]/60" />
                  </div>
                  <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-[#0A0A0A]">{b.titulo}</h3>
                  <p className="text-sm text-[#0A0A0A]/55 leading-relaxed">{b.descripcion}</p>
                </div>
              </div>
            );
          })}
        </section>
      </main>
      <Footer />
    </>
  );
}
