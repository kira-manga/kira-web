import Link from 'next/link';

import { ArrowIcon, BackupIcon, BookIcon, DownloadIcon } from '@/components/icons';

import styles from './home.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <picture className={styles.heroMedia}>
        <source
          media="(max-width: 700px)"
          srcSet="/images/kira-hero-960.jpg"
        />
        <img
          src="/images/kira-hero-1693.jpg"
          alt=""
          width="1693"
          height="929"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <div className={styles.heroShade} />

      <div className={styles.heroFrame}>
        <div className={styles.heroIndex} aria-hidden="true">
          <span className={styles.active}>01</span>
          <span>02</span>
          <span>03</span>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>Kira Manga · Android &amp; iOS</p>
          <h1 id="hero-title">Immerse in<br />every <em>chapter.</em></h1>
          <p>Your library, downloads, and reading progress—kept together in one beautifully focused reader.</p>
          <div className={styles.heroActions}>
            <Link className="button buttonPrimary" href="/activate">Open Kira <ArrowIcon /></Link>
            <Link className="button buttonGlass" href="/guide">View the guide</Link>
          </div>
        </div>

        <div className={styles.heroCards}>
          <article className={`${styles.glassCard} ${styles.exploreCard}`}>
            <span className={styles.cardIcon}><BookIcon /></span>
            <div><p>Explore, save, and</p><h2>Enjoy</h2></div>
            <Link href="/activate">Start reading <ArrowIcon /></Link>
          </article>

          <div className={styles.statGroup} aria-label="Kira highlights">
            <div><DownloadIcon /><span>Offline</span><strong>Chapters</strong></div>
            <div><BookIcon /><span>Local</span><strong>Library</strong></div>
          </div>

          <article className={`${styles.glassCard} ${styles.backupCard}`}>
            <span className={styles.cardIcon}><BackupIcon /></span>
            <div><p>Back up and</p><h2>Keep going</h2></div>
            <Link href="/guide">Learn how <ArrowIcon /></Link>
          </article>
        </div>
      </div>
    </section>
  );
}
