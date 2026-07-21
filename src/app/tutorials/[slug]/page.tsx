import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowIcon, BookIcon, CheckIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { TutorialMediaImage } from '@/components/tutorials/tutorial-media-image';
import { tutorialsPageCopy } from '@/content/tutorials';
import { getTutorial, getTutorials, type TutorialMediaSlot } from '@/lib/tutorial-api';

import styles from '@/components/tutorials/tutorials.module.css';

interface TutorialPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: TutorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getTutorial(slug);
  if (result.status !== 'ok') return { title: tutorialsPageCopy.metadata.title };
  return {
    title: result.data.title.en,
    description: result.data.summary.en,
    alternates: { canonical: `/tutorials/${result.data.slug}` },
  };
}

function TutorialMediaFrame({ media, compact = false }: { media: TutorialMediaSlot; compact?: boolean }) {
  const copy = tutorialsPageCopy.article;
  return (
    <figure className={compact ? `${styles.tutorialMedia} ${styles.compactMedia}` : styles.tutorialMedia}>
      <div className={styles.mediaBar}>
        <span><i /><i /><i /></span>
        <b>{copy.mediaTitle}</b>
        <em><i /> {copy.mediaStatus}</em>
      </div>
      <div className={styles.mediaImage}><TutorialMediaImage media={media} priority={!compact} /></div>
      <figcaption><CheckIcon /><LocalizedText en={copy.mediaCaption.en} ar={copy.mediaCaption.ar} /></figcaption>
    </figure>
  );
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params;
  const [tutorialResult, listResult] = await Promise.all([getTutorial(slug), getTutorials()]);
  if (tutorialResult.status === 'not-found') notFound();
  if (tutorialResult.status === 'unavailable') {
    return (
      <article className={styles.articlePage}>
        <div className={`${styles.articleLayout} shell`}>
          <div className={`${styles.articleContent} ${styles.emptyState}`} aria-live="polite">
            <BookIcon />
            <h1><LocalizedText en={tutorialsPageCopy.article.unavailableTitle.en} ar={tutorialsPageCopy.article.unavailableTitle.ar} /></h1>
            <p><LocalizedText en={tutorialsPageCopy.article.unavailableDescription.en} ar={tutorialsPageCopy.article.unavailableDescription.ar} /></p>
            <Link className="button buttonPrimary" href="/tutorials"><LocalizedText en={tutorialsPageCopy.article.allTutorials.en} ar={tutorialsPageCopy.article.allTutorials.ar} /></Link>
          </div>
        </div>
      </article>
    );
  }

  const tutorial = tutorialResult.data;
  const tutorialList = listResult.status === 'ok' && listResult.data.length ? listResult.data : [tutorial];
  const currentIndex = tutorialList.findIndex((item) => item.slug === tutorial.slug);
  const nextTutorial = tutorialList.length > 1 ? tutorialList[(Math.max(currentIndex, 0) + 1) % tutorialList.length] : null;
  const copy = tutorialsPageCopy.article;

  return (
    <article className={styles.articlePage}>
      <div className={`${styles.articleLayout} shell`}>
        <aside className={styles.articleSidebar} aria-label={copy.tutorialLibraryLabel}>
          <Link className={styles.sidebarHome} href="/tutorials"><BookIcon /><LocalizedText en={copy.allTutorials.en} ar={copy.allTutorials.ar} /></Link>
          <p><LocalizedText en={copy.quickGuides.en} ar={copy.quickGuides.ar} /></p>
          <nav>
            {tutorialList.map((item, index) => (
              <Link className={item.slug === tutorial.slug ? styles.currentTutorial : undefined} href={`/tutorials/${item.slug}` as Route} key={item.slug}>
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
              <span><LocalizedText en={tutorial.category.label.en} ar={tutorial.category.label.ar} /></span>
            </nav>
            <div className={styles.articleMeta}>
              <LocalizedText en={<span>{tutorial.duration.en} · {tutorial.level.en}</span>} ar={<span>{tutorial.duration.ar} · {tutorial.level.ar}</span>} />
            </div>
            <h1><LocalizedText en={tutorial.title.en} ar={tutorial.title.ar} /></h1>
            <p><LocalizedText en={tutorial.introduction.en} ar={tutorial.introduction.ar} /></p>
          </header>

          <TutorialMediaFrame media={tutorial.cover} />

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
                  {step.tip ? <aside className={styles.tip}><span>✦</span><p><strong><LocalizedText en={copy.tipLabel.en} ar={copy.tipLabel.ar} /></strong><LocalizedText en={step.tip.en} ar={step.tip.ar} /></p></aside> : null}
                  {step.media ? <TutorialMediaFrame media={step.media} compact /> : null}
                </div>
              </section>
            ))}
          </div>

          {nextTutorial ? (
            <section className={styles.nextGuide}>
              <p><LocalizedText en={copy.continueLearning.en} ar={copy.continueLearning.ar} /></p>
              <Link href={`/tutorials/${nextTutorial.slug}` as Route}><span><LocalizedText en={nextTutorial.title.en} ar={nextTutorial.title.ar} /></span><ArrowIcon /></Link>
            </section>
          ) : null}
        </div>

        <aside className={styles.articleToc} aria-label={copy.onThisPageLabel}>
          <p><LocalizedText en={copy.inThisGuide.en} ar={copy.inThisGuide.ar} /></p>
          <nav>
            {tutorial.steps.map((step, index) => <a href={`#${step.id}`} key={step.id}><span>{String(index + 1).padStart(2, '0')}</span><LocalizedText en={step.title.en} ar={step.title.ar} /></a>)}
          </nav>
          <span className={styles.tocTime}><i /> <LocalizedText en={`${tutorial.duration.en} ${copy.readSuffix.en}`} ar={`${copy.readSuffix.ar} ${tutorial.duration.ar}`} /></span>
        </aside>
      </div>
    </article>
  );
}
