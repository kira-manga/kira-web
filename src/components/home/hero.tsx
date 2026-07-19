import Link from 'next/link';

import {
  ArrowIcon,
  BookIcon,
  HistoryIcon,
  HomeIcon,
  LibraryIcon,
  SearchIcon,
  SettingsIcon,
} from '@/components/icons';

import styles from './home.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`${styles.heroInner} shell`}>
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}><span />Kira Manga for Android &amp; iOS</p>
          <h1 id="hero-title">Your manga.<br /><em>Your way.</em></h1>
          <p>Discover new stories, build your library, download chapters, and continue exactly where you stopped—all in one focused reader.</p>
          <div className={styles.heroActions}>
            <Link className="button buttonPrimary" href="/activate">Open Kira <ArrowIcon /></Link>
            <a className="button buttonGhost" href="#experience">See the app</a>
          </div>
          <ul className={styles.heroProof} aria-label="Kira highlights">
            <li><span />Read offline</li>
            <li><span />Local library</li>
            <li><span />Portable backups</li>
          </ul>
        </div>

        <div className={styles.productStage} aria-label="Preview of the Kira Manga app">
          <div className={styles.stageGlow} />
          <div className={styles.readerPeek} aria-hidden="true">
            <div className={styles.peekHeader}><span>‹</span><strong>Chapter 24</strong><span>•••</span></div>
            <div className={styles.peekPage}>
              <i /><i /><i /><i />
            </div>
            <div className={styles.peekProgress}><span /></div>
          </div>

          <div className={styles.phone}>
            <div className={styles.phoneStatus}><span>9:41</span><i /><span>● ◒</span></div>
            <div className={styles.appHeader}>
              <div><small>KIRA</small><strong>Discover</strong></div>
              <button type="button" tabIndex={-1} aria-hidden="true"><SearchIcon /></button>
            </div>
            <div className={styles.sourcePills} aria-hidden="true">
              <span className={styles.sourceActive}>All sources</span><span>Manga</span><span>Arabic</span>
            </div>
            <div className={styles.appSectionTitle}><strong>Popular now</strong><span>View all</span></div>
            <div className={styles.coverRow} aria-hidden="true">
              <article><div className={`${styles.appCover} ${styles.coverOne}`}><b>DUSK</b><i>01</i></div><strong>After Dusk</strong><small>Chapter 38</small></article>
              <article><div className={`${styles.appCover} ${styles.coverTwo}`}><b>NEON</b><i>02</i></div><strong>Neon Ronin</strong><small>Chapter 12</small></article>
              <article><div className={`${styles.appCover} ${styles.coverThree}`}><b>YAMI</b><i>03</i></div><strong>Yami</strong><small>Chapter 74</small></article>
            </div>
            <div className={styles.appSectionTitle}><strong>Latest updates</strong><span>Today</span></div>
            <div className={styles.updateList} aria-hidden="true">
              <article><div className={`${styles.updateCover} ${styles.coverFour}`} /><div><strong>Paper Moon</strong><small>Chapter 19 · 8 min ago</small></div><b>19</b></article>
              <article><div className={`${styles.updateCover} ${styles.coverFive}`} /><div><strong>Silent Current</strong><small>Chapter 42 · 1 hr ago</small></div><b>42</b></article>
            </div>
            <div className={styles.appNav} aria-hidden="true">
              <span className={styles.navActive}><HomeIcon /><small>Home</small></span>
              <span><HistoryIcon /><small>History</small></span>
              <span><LibraryIcon /><small>Library</small></span>
              <span><SettingsIcon /><small>Settings</small></span>
            </div>
          </div>

          <div className={styles.continueToast} aria-hidden="true">
            <span><BookIcon /></span>
            <div><small>Continue reading</small><strong>Yami · Chapter 24</strong><i><b /></i></div>
            <em>68%</em>
          </div>
        </div>
      </div>
      <div className={styles.heroMarquee} aria-hidden="true"><span>Discover</span><i /> <span>Save</span><i /> <span>Download</span><i /> <span>Read</span><i /> <span>Continue</span></div>
    </section>
  );
}
