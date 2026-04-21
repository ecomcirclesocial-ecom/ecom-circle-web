import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { LogisticaDashboard } from "@/components/tools/logistica-dashboard";

export const metadata = {
  title: "Dashboard Logístico · Ecom Circle",
};

export default function LogisticaPage() {
  return (
    <>
      <Nav />
      <LogisticaDashboard />
      <Footer />
    </>
  );
}
