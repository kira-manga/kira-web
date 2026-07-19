import { FeatureGrid } from '@/components/home/feature-grid';
import { FinalCta } from '@/components/home/final-cta';
import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { ReaderShowcase } from '@/components/home/reader-showcase';

export default function HomePage() {
  return (
    <div className="homePage">
      <Hero />
      <FeatureGrid />
      <ReaderShowcase />
      <HowItWorks />
      <FinalCta />
    </div>
  );
}
