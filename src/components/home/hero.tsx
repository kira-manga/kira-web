import Image from 'next/image';
import Link from 'next/link';

import { ArrowIcon, BookIcon, PlayIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';
import { LiveAppScreen } from '@/components/preferences';

import styles from './home.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroNoise} aria-hidden="true" />

      <div className={`${styles.heroInner} shell`}>
        <div className={styles.heroCopy}>
          <p className={styles.releasePill}>
            <span className={styles.releaseDot} />
            <LocalizedText en="A calmer way to read" ar="طريقة أهدأ للقراءة" />
            <ArrowIcon />
          </p>

          <h1 id="hero-title">
            <LocalizedText
              en={<>All your manga.<br /><span>None of the noise.</span></>}
              ar={<>كل المانجا التي تحبها.<br /><span>بلا ضوضاء.</span></>}
            />
          </h1>

          <p className={styles.heroIntro}>
            <LocalizedText
              en="Discover series, keep a local library, download chapters, and read in your language—inside one focused app."
              ar="اكتشف السلاسل، وابنِ مكتبتك، وحمّل الفصول، واقرأ بلغتك—داخل تطبيق واحد مصمم للتركيز."
            />
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/activate">
              <LocalizedText en="Start with Kira" ar="ابدأ مع كيرا" /> <ArrowIcon />
            </Link>
            <Link className={styles.secondaryAction} href="/tutorials">
              <PlayIcon /> <LocalizedText en="Explore tutorials" ar="استكشف الشروحات" />
            </Link>
          </div>

          <div className={styles.heroProof} aria-label="Kira product highlights">
            <span><i>01</i><LocalizedText en="Real app screens" ar="شاشات حقيقية" /></span>
            <span><i>02</i><LocalizedText en="Android & iOS" ar="أندرويد وiOS" /></span>
            <span><i>03</i><LocalizedText en="English & Arabic" ar="العربية والإنجليزية" /></span>
          </div>
        </div>

        <div className={styles.productStage} aria-label="Real Kira app preview">
          <div className={styles.stageOrbit} aria-hidden="true" />
          <figure className={styles.primaryCapture}>
            <div className={styles.captureBar}>
              <span><i /><i /><i /></span>
              <b>KIRA / DISCOVER</b>
              <em><span /> LIVE</em>
            </div>
            <div className={styles.liveCapture}><LiveAppScreen eager /></div>
            <figcaption>
              <span><LocalizedText en="Discover" ar="اكتشف" /></span>
              <small><LocalizedText en="Actual app capture" ar="لقطة حقيقية من التطبيق" /></small>
            </figcaption>
          </figure>

          <figure className={styles.secondaryCapture}>
            <Image
              src="/screens/manga-details.jpg"
              alt="A real Kira manga details screen"
              width={588}
              height={1280}
              priority
              unoptimized
            />
            <figcaption><LocalizedText en="Details & chapters" ar="التفاصيل والفصول" /></figcaption>
          </figure>

          <Link className={styles.tutorialCard} href="/tutorials/getting-started">
            <span className={styles.tutorialIcon}><BookIcon /></span>
            <span>
              <small><LocalizedText en="QUICK START · 4 MIN" ar="بدء سريع · ٤ دقائق" /></small>
              <strong><LocalizedText en="From setup to first chapter" ar="من الإعداد إلى أول فصل" /></strong>
            </span>
            <ArrowIcon />
          </Link>

          <div className={styles.realBadge}>
            <span />
            <LocalizedText en="CURRENT ANDROID BUILD" ar="نسخة أندرويد الحالية" />
          </div>
        </div>
      </div>

      <a className={styles.scrollCue} href="#features" aria-label="Scroll to product features">
        <span /><LocalizedText en="SCROLL TO EXPLORE" ar="مرّر للاستكشاف" />
      </a>
    </section>
  );
}
