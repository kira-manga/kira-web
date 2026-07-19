import type { Metadata, Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowIcon, BookIcon, CheckIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';
import { LiveAppScreen } from '@/components/preferences';
import { getTutorial, tutorialCategoryLabels, tutorials, type TutorialMedia } from '@/content/tutorials';

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

function TutorialMediaFrame({ media, compact = false }: { media: TutorialMedia; compact?: boolean }) {
  return (
    <figure className={compact ? `${styles.tutorialMedia} ${styles.compactMedia}` : styles.tutorialMedia}>
      <div className={styles.mediaBar}>
        <span><i /><i /><i /></span>
        <b>KIRA / REAL APP</b>
        <em><i /> LIVE CAPTURE</em>
      </div>
      <div className={styles.mediaImage}>
        {media.kind === 'live' ? (
          <LiveAppScreen />
        ) : (
          <Image src={media.src ?? ''} alt={media.alt} width={588} height={1280} unoptimized />
        )}
      </div>
      <figcaption><CheckIcon /><LocalizedText en="Captured from Kira’s installed Android build" ar="لقطة من نسخة أندرويد المثبّتة لكيرا" /></figcaption>
    </figure>
  );
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params;
  const tutorial = getTutorial(slug);
  if (!tutorial) notFound();

  const currentIndex = tutorials.findIndex((item) => item.slug === tutorial.slug);
  const nextTutorial = tutorials[(currentIndex + 1) % tutorials.length];

  return (
    <article className={styles.articlePage}>
      <div className={`${styles.articleLayout} shell`}>
        <aside className={styles.articleSidebar} aria-label="Tutorial library">
          <Link className={styles.sidebarHome} href="/tutorials"><BookIcon /><LocalizedText en="All tutorials" ar="كل الشروحات" /></Link>
          <p><LocalizedText en="QUICK GUIDES" ar="أدلة سريعة" /></p>
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
          <Link className={styles.sidebarSupport} href="/support"><LocalizedText en="Still need help?" ar="ما زلت تحتاج مساعدة؟" /><span><LocalizedText en="Open support" ar="افتح الدعم" /> <ArrowIcon /></span></Link>
        </aside>

        <div className={styles.articleContent}>
          <header className={styles.articleHeader}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/tutorials"><LocalizedText en="Tutorials" ar="الشروحات" /></Link>
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

          <TutorialMediaFrame media={tutorial.cover} />

          <div className={styles.mobileOnPage}>
            <p><LocalizedText en="IN THIS GUIDE" ar="في هذا الشرح" /></p>
            {tutorial.steps.map((step, index) => <a href={`#${step.id}`} key={step.id}>{index + 1}. <LocalizedText en={step.title.en} ar={step.title.ar} /></a>)}
          </div>

          <div className={styles.steps}>
            {tutorial.steps.map((step, index) => (
              <section id={step.id} className={styles.tutorialStep} key={step.id}>
                <div className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</div>
                <div className={styles.stepCopy}>
                  <p><LocalizedText en={`STEP ${index + 1}`} ar={`الخطوة ${index + 1}`} /></p>
                  <h2><LocalizedText en={step.title.en} ar={step.title.ar} /></h2>
                  <div className={styles.stepBody}><LocalizedText en={step.body.en} ar={step.body.ar} /></div>
                  {step.tip ? (
                    <aside className={styles.tip}><span>✦</span><p><strong><LocalizedText en="Good to know" ar="معلومة مفيدة" /></strong><LocalizedText en={step.tip.en} ar={step.tip.ar} /></p></aside>
                  ) : null}
                  {step.media ? <TutorialMediaFrame media={step.media} compact /> : null}
                </div>
              </section>
            ))}
          </div>

          <section className={styles.nextGuide}>
            <p><LocalizedText en="CONTINUE LEARNING" ar="أكمل التعلّم" /></p>
            <Link href={`/tutorials/${nextTutorial.slug}` as Route}>
              <span><LocalizedText en={nextTutorial.title.en} ar={nextTutorial.title.ar} /></span>
              <ArrowIcon />
            </Link>
          </section>
        </div>

        <aside className={styles.articleToc} aria-label="On this page">
          <p><LocalizedText en="IN THIS GUIDE" ar="في هذا الشرح" /></p>
          <nav>
            {tutorial.steps.map((step, index) => (
              <a href={`#${step.id}`} key={step.id}><span>{String(index + 1).padStart(2, '0')}</span><LocalizedText en={step.title.en} ar={step.title.ar} /></a>
            ))}
          </nav>
          <span className={styles.tocTime}><i /> <LocalizedText en={`${tutorial.duration.en} read`} ar={`قراءة ${tutorial.duration.ar}`} /></span>
        </aside>
      </div>
    </article>
  );
}
