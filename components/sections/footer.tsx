import Link from "next/link";
import Image from "next/image";
import { InstagramLogo, TiktokLogo, YoutubeLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-16 bg-[#050505]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        <div className="flex flex-col gap-4 max-w-xs">
          <Image src="/logo.png" alt="Ecom Circle by Nain" width={130} height={44} className="h-10 w-auto" />
          <p className="text-white/30 text-sm leading-relaxed">
            Comunidad #1 de Ecommerce y dropshipping 100% con IA en LATAM.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/nain_guevara/" target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-[#FF5911] transition-colors">
              <InstagramLogo size={18} />
            </a>
            <a href="https://www.tiktok.com/@nain_guevara" target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-[#FF5911] transition-colors">
              <TiktokLogo size={18} />
            </a>
            <a href="https://www.youtube.com/@nainGuevara" target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-[#FF5911] transition-colors">
              <YoutubeLogo size={18} />
            </a>
            <a href="https://wa.me/57XXXXXXXXXX" target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-[#FF5911] transition-colors">
              <WhatsappLogo size={18} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-3">
          {[
            { href: "#comunidad", label: "Comunidad" },
            { href: "#beneficios", label: "Beneficios VIP" },
            { href: "#sobre-nain", label: "Sobre Nain" },
            { href: "#testimonios", label: "Testimonios" },
            { href: "/tools", label: "Herramientas" },
            { href: "#unirse", label: "Unirse" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-white/30 text-sm hover:text-white/70 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} Ecom Circle. Cali, Colombia.</p>
        <p className="text-[#FF5911]/40 text-xs font-bold">Dios primero.</p>
      </div>
    </footer>
  );
}
