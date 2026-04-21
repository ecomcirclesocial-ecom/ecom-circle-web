import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { CalculadoraProducto } from "@/components/tools/calculadora-producto";

export const metadata = {
  title: "Calculadora de Producto · Ecom Circle",
};

export default function CalculadoraPage() {
  return (
    <>
      <Nav />
      <CalculadoraProducto />
      <Footer />
    </>
  );
}
