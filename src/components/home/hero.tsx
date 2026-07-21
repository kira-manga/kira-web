import Link from 'next/link';

import { ArrowIcon, BookIcon, PlayIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { AppScreen, LiveAppScreen } from '@/components/ui/preferences';
import { homeCopy } from '@/content/home';

import { PhoneMockup } from './phone-mockup';

import styles from './home.module.css';

export function Hero() {
  const copy = homeCopy.hero;

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
          <PhoneMockup
            variant="android"
            className={styles.primaryCapture}
            platform={copy.devices.android.platform}
            caption={<LocalizedText en={copy.devices.android.caption.en} ar={copy.devices.android.caption.ar} />}
          >
            <div className={styles.liveCapture}><LiveAppScreen eager /></div>
          </PhoneMockup>

          <PhoneMockup
            variant="iphone"
            className={styles.secondaryCapture}
            platform={copy.devices.iphone.platform}
            caption={<LocalizedText en={copy.devices.iphone.caption.en} ar={copy.devices.iphone.caption.ar} />}
          >
            <div className={styles.liveCapture}><AppScreen screen="mangaDetails" eager /></div>
          </PhoneMockup>

          <Link className={styles.tutorialCard} href="/tutorials">
            <span className={styles.tutorialIcon}><BookIcon /></span>
            <span className={styles.tutorialCardCopy}>
              <small><LocalizedText en={copy.tutorialKicker.en} ar={copy.tutorialKicker.ar} /></small>
              <strong><LocalizedText en={copy.tutorialTitle.en} ar={copy.tutorialTitle.ar} /></strong>
            </span>
            <ArrowIcon />
          </Link>
        </div>
      </div>

    </section>
  );
}
