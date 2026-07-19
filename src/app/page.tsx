import { FeatureGrid } from '@/components/home/feature-grid';
import { FinalCta } from '@/components/home/final-cta';
import { Hero } from '@/components/home/hero';
import { TutorialPreview } from '@/components/home/tutorial-preview';
import { ReaderShowcase } from '@/components/home/reader-showcase';

export default function HomePage() {
  return (
    <div className="homePage">
      <Hero />
      <FeatureGrid />
      <ReaderShowcase />
      <TutorialPreview />
      <FinalCta />
    </div>
  );
}
