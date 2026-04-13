import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { LogosSection } from "@/components/sections/logos";
import { AboutSection } from "@/components/sections/about";
import { BenefitsSection } from "@/components/sections/benefits";
import { Products } from "@/components/sections/products";
import { Testimonials } from "@/components/sections/testimonials";
import { FormSection } from "@/components/sections/form-section";
import { FAQSection } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LogosSection />
        <section id="comunidad">
          <Products />
        </section>
        <AboutSection />
        <BenefitsSection />
        <section id="testimonios">
          <Testimonials />
        </section>
        <FormSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
