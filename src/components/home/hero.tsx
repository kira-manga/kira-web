import Image from 'next/image';
import Link from 'next/link';

import { ArrowIcon, BookIcon, PlayIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { LiveAppScreen } from '@/components/ui/preferences';
import { homeCopy } from '@/content/home';
import { media } from '@/content/media';

import styles from './home.module.css';

export function Hero() {
  const copy = homeCopy.hero;
  const detailsScreen = media.appScreens.mangaDetails;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroNoise} aria-hidden="true" />

      <div className={`${styles.heroInner} shell`}>
        <div className={styles.heroCopy}>
          <p className={styles.releasePill}>
            <span className={styles.releaseDot} />
            <LocalizedText en={copy.badge.en} ar={copy.badge.ar} />
            <ArrowIcon />
          </p>

          <h1 id="hero-title">
            <LocalizedText
              en={<>{copy.title.lead.en}<br /><span>{copy.title.accent.en}</span></>}
              ar={<>{copy.title.lead.ar}<br /><span>{copy.title.accent.ar}</span></>}
            />
          </h1>

          <p className={styles.heroIntro}>
            <LocalizedText
              en={copy.intro.en}
              ar={copy.intro.ar}
            />
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/activate">
              <LocalizedText en={copy.primaryCta.en} ar={copy.primaryCta.ar} /> <ArrowIcon />
            </Link>
            <Link className={styles.secondaryAction} href="/tutorials">
              <PlayIcon /> <LocalizedText en={copy.secondaryCta.en} ar={copy.secondaryCta.ar} />
            </Link>
          </div>

          <div className={styles.heroProof} aria-label={copy.proofLabel}>
            {copy.proof.map((item, index) => (
              <span key={item.en}><i>{String(index + 1).padStart(2, '0')}</i><LocalizedText en={item.en} ar={item.ar} /></span>
            ))}
          </div>
        </div>

        <div className={styles.productStage} aria-label={copy.previewLabel}>
          <div className={styles.stageOrbit} aria-hidden="true" />
          <figure className={styles.primaryCapture}>
            <div className={styles.captureBar}>
              <span><i /><i /><i /></span>
              <b>{copy.captureBar.title}</b>
              <em><span /> {copy.captureBar.status}</em>
            </div>
            <div className={styles.liveCapture}><LiveAppScreen eager /></div>
            <figcaption>
              <span><LocalizedText en={copy.discoverCaption.en} ar={copy.discoverCaption.ar} /></span>
              <small><LocalizedText en={copy.realCaptureCaption.en} ar={copy.realCaptureCaption.ar} /></small>
            </figcaption>
          </figure>

          <figure className={styles.secondaryCapture}>
            <Image
              src={detailsScreen.src}
              alt={`${detailsScreen.alt.en} — ${detailsScreen.alt.ar}`}
              width={detailsScreen.width}
              height={detailsScreen.height}
              priority
              unoptimized
            />
            <figcaption><LocalizedText en={copy.detailsCaption.en} ar={copy.detailsCaption.ar} /></figcaption>
          </figure>

          <Link className={styles.tutorialCard} href="/tutorials/getting-started">
            <span className={styles.tutorialIcon}><BookIcon /></span>
            <span>
              <small><LocalizedText en={copy.tutorialKicker.en} ar={copy.tutorialKicker.ar} /></small>
              <strong><LocalizedText en={copy.tutorialTitle.en} ar={copy.tutorialTitle.ar} /></strong>
            </span>
            <ArrowIcon />
          </Link>

          <div className={styles.realBadge}>
            <span />
            <LocalizedText en={copy.buildBadge.en} ar={copy.buildBadge.ar} />
          </div>
        </div>
      </div>

      <a className={styles.scrollCue} href="#features" aria-label={copy.scrollAriaLabel}>
        <span /><LocalizedText en={copy.scrollLabel.en} ar={copy.scrollLabel.ar} />
      </a>
    </section>
  );
}
