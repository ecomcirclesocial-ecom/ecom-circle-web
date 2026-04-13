import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { WhatsappLogo, CheckCircle } from "@phosphor-icons/react/dist/ssr";

const incluye = [
  "Diagnóstico completo de tu negocio actual",
  "Plan personalizado semana a semana",
  "Sesiones 1:1 con Nain Guevara",
  "Acceso al grupo privado de participantes",
  "Seguimiento de métricas y ajustes en tiempo real",
  "Mentalidad, sistemas y acción — los tres pilares",
];

export default function LifestylePage() {
  return (
    <>
      <Nav />
      <main className="pt-28 min-h-[100dvh]">
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Izquierda */}
            <div>
              <p className="text-xs tracking-widest uppercase text-[#0A0A0A]/40 mb-4">High Ticket · 1:1</p>
              <h1 className="font-[family-name:var(--font-jakarta)] font-extrabold text-4xl md:text-5xl text-[#0A0A0A] leading-tight mb-5">
                Ecom Circle Lifestyle
              </h1>
              <p className="text-[#0A0A0A]/55 text-base leading-relaxed mb-8">
                El programa más personalizado del ecosistema. Para quienes ya
                tienen base y quieren escalar de verdad. No es para todos —
                es para los que van en serio.
              </p>
              <a
                href="https://wa.me/57XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#0A0A0A] text-[#FDFBF7] font-medium rounded-full px-7 py-3.5 hover:bg-[#0A0A0A]/85 transition-colors"
              >
                <WhatsappLogo size={18} />
                Aplicar al programa
              </a>
            </div>

            {/* Derecha — Card de qué incluye */}
            <div className="p-1.5 rounded-[2rem] bg-[#0A0A0A] ring-1 ring-black/5">
              <div className="p-7 rounded-[calc(2rem-6px)] bg-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] flex flex-col gap-5">
                <p className="text-white/40 text-xs tracking-widest uppercase">Qué incluye</p>
                <ul className="flex flex-col gap-3.5">
                  {incluye.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle size={16} weight="fill" className="text-white/30 flex-shrink-0 mt-0.5" />
                      <span className="text-white/65 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-white/25 text-xs pt-3 border-t border-white/8">
                  Cupos limitados. Proceso de aplicación requerido.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
