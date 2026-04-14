import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { MetaAdsAnalyzer } from "@/components/tools/meta-ads-analyzer";

export const metadata = {
  title: "Análisis de Campañas Meta Ads · Ecom Circle",
};

export default function MetaAdsPage() {
  return (
    <>
      <Nav />
      <MetaAdsAnalyzer />
      <Footer />
    </>
  );
}
