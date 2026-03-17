import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ExampleCharts } from "@/components/landing/example-charts";
import { TrustBadge } from "@/components/landing/trust-badge";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <ExampleCharts />
      <TrustBadge />
      <Footer />
    </main>
  );
}
