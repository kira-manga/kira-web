import type { Metadata, Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowIcon, BookIcon, CheckIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { LiveAppScreen } from '@/components/ui/preferences';
import { media, type AppScreenKey } from '@/content/media';
import { getTutorial, tutorialCategoryLabels, tutorials, tutorialsPageCopy } from '@/content/tutorials';

import styles from '@/components/tutorials/tutorials.module.css';

interface TutorialPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return tutorials.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: TutorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = getTutorial(slug);
  if (!tutorial) return {};

  return {
    title: tutorial.title.en,
    description: tutorial.summary.en,
    alternates: { canonical: `/tutorials/${tutorial.slug}` },
  };
}

function TutorialMediaFrame({ screen, compact = false }: { screen: AppScreenKey; compact?: boolean }) {
  const copy = tutorialsPageCopy.article;
  const asset = media.appScreens[screen];

  return (
    <figure className={compact ? `${styles.tutorialMedia} ${styles.compactMedia}` : styles.tutorialMedia}>
      <div className={styles.mediaBar}>
        <span><i /><i /><i /></span>
        <b>{copy.mediaTitle}</b>
        <em><i /> {copy.mediaStatus}</em>
      </div>
      <div className={styles.mediaImage}>
        {screen === 'discover' ? (
          <LiveAppScreen />
        ) : (
          <Image src={asset.src} alt={`${asset.alt.en} — ${asset.alt.ar}`} width={asset.width} height={asset.height} unoptimized />
        )}
      </div>
      <figcaption><CheckIcon /><LocalizedText en={copy.mediaCaption.en} ar={copy.mediaCaption.ar} /></figcaption>
    </figure>
  );
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params;
  const tutorial = getTutorial(slug);
  if (!tutorial) notFound();

  const currentIndex = tutorials.findIndex((item) => item.slug === tutorial.slug);
  const nextTutorial = tutorials[(currentIndex + 1) % tutorials.length];
  const copy = tutorialsPageCopy.article;

  return (
    <article className={styles.articlePage}>
      <div className={`${styles.articleLayout} shell`}>
        <aside className={styles.articleSidebar} aria-label={copy.tutorialLibraryLabel}>
          <Link className={styles.sidebarHome} href="/tutorials"><BookIcon /><LocalizedText en={copy.allTutorials.en} ar={copy.allTutorials.ar} /></Link>
          <p><LocalizedText en={copy.quickGuides.en} ar={copy.quickGuides.ar} /></p>
          <nav>
            {tutorials.map((item, index) => (
              <Link
                className={item.slug === tutorial.slug ? styles.currentTutorial : undefined}
                href={`/tutorials/${item.slug}` as Route}
                key={item.slug}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <LocalizedText en={item.title.en} ar={item.title.ar} />
              </Link>
            ))}
          </nav>
          <Link className={styles.sidebarSupport} href="/support"><LocalizedText en={copy.stillNeedHelp.en} ar={copy.stillNeedHelp.ar} /><span><LocalizedText en={copy.openSupport.en} ar={copy.openSupport.ar} /> <ArrowIcon /></span></Link>
        </aside>

        <div className={styles.articleContent}>
          <header className={styles.articleHeader}>
            <nav className={styles.breadcrumbs} aria-label={copy.breadcrumbLabel}>
              <Link href="/tutorials"><LocalizedText en={copy.tutorials.en} ar={copy.tutorials.ar} /></Link>
              <span>/</span>
              <span><LocalizedText en={tutorialCategoryLabels[tutorial.category].en} ar={tutorialCategoryLabels[tutorial.category].ar} /></span>
            </nav>
            <div className={styles.articleMeta}>
              <LocalizedText
                en={<span>{tutorial.duration.en} · {tutorial.level.en}</span>}
                ar={<span>{tutorial.duration.ar} · {tutorial.level.ar}</span>}
              />
            </div>
            <h1><LocalizedText en={tutorial.title.en} ar={tutorial.title.ar} /></h1>
            <p><LocalizedText en={tutorial.intro.en} ar={tutorial.intro.ar} /></p>
          </header>

          <TutorialMediaFrame screen={tutorial.cover} />

          <div className={styles.mobileOnPage}>
            <p><LocalizedText en={copy.inThisGuide.en} ar={copy.inThisGuide.ar} /></p>
            {tutorial.steps.map((step, index) => <a href={`#${step.id}`} key={step.id}>{index + 1}. <LocalizedText en={step.title.en} ar={step.title.ar} /></a>)}
          </div>

          <div className={styles.steps}>
            {tutorial.steps.map((step, index) => (
              <section id={step.id} className={styles.tutorialStep} key={step.id}>
                <div className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</div>
                <div className={styles.stepCopy}>
                  <p><LocalizedText en={`${copy.stepPrefix.en} ${index + 1}`} ar={`${copy.stepPrefix.ar} ${index + 1}`} /></p>
                  <h2><LocalizedText en={step.title.en} ar={step.title.ar} /></h2>
                  <div className={styles.stepBody}><LocalizedText en={step.body.en} ar={step.body.ar} /></div>
                  {step.tip ? (
                    <aside className={styles.tip}><span>✦</span><p><strong><LocalizedText en={copy.tipLabel.en} ar={copy.tipLabel.ar} /></strong><LocalizedText en={step.tip.en} ar={step.tip.ar} /></p></aside>
                  ) : null}
                  {step.media ? <TutorialMediaFrame screen={step.media} compact /> : null}
                </div>
              </section>
            ))}
          </div>

          <section className={styles.nextGuide}>
            <p><LocalizedText en={copy.continueLearning.en} ar={copy.continueLearning.ar} /></p>
            <Link href={`/tutorials/${nextTutorial.slug}` as Route}>
              <span><LocalizedText en={nextTutorial.title.en} ar={nextTutorial.title.ar} /></span>
              <ArrowIcon />
            </Link>
          </section>
        </div>

        <aside className={styles.articleToc} aria-label={copy.onThisPageLabel}>
          <p><LocalizedText en={copy.inThisGuide.en} ar={copy.inThisGuide.ar} /></p>
          <nav>
            {tutorial.steps.map((step, index) => (
              <a href={`#${step.id}`} key={step.id}><span>{String(index + 1).padStart(2, '0')}</span><LocalizedText en={step.title.en} ar={step.title.ar} /></a>
            ))}
          </nav>
          <span className={styles.tocTime}><i /> <LocalizedText en={`${tutorial.duration.en} ${copy.readSuffix.en}`} ar={`${copy.readSuffix.ar} ${tutorial.duration.ar}`} /></span>
        </aside>
      </div>
    </article>
  );
}
