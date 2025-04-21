import HeroSection from "./_components/hero-section";
import FeaturesSection from "./_components/features-section";
import HowItWorksSection from "./_components/how-it-works-section";
import CTASection from "./_components/cta-section";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}
