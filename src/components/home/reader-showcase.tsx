import Link from 'next/link';

import { ArrowIcon, CheckIcon } from '@/components/icons';

import styles from './home.module.css';

export function ReaderShowcase() {
  return (
    <section className={styles.readerSection} aria-labelledby="reader-title">
      <div className={`${styles.readerInner} shell`}>
        <div className={styles.readerCopy}>
          <p className={styles.darkKicker}>Reading, uninterrupted</p>
          <h2 id="reader-title">Controls when you need them.<br /><em>Story when you don&apos;t.</em></h2>
          <p>Kira keeps navigation close, remembers your progress, and gives the page room to breathe.</p>
          <ul>
            <li><CheckIcon /> Continue from saved progress</li>
            <li><CheckIcon /> Read completed downloads offline</li>
            <li><CheckIcon /> Adjust the reader to your preference</li>
          </ul>
          <Link href="/guide">Explore the reading guide <ArrowIcon /></Link>
        </div>

        <div className={styles.readerMock} aria-label="Illustration of Kira's reader interface">
          <div className={styles.readerTop}><span>Falling Stars</span><strong>18 / 24</strong><span>•••</span></div>
          <div className={styles.mangaCanvas} aria-hidden="true">
            <div className={styles.mangaPanelA}><i /></div>
            <div className={styles.mangaPanelB}><i /></div>
            <div className={styles.mangaPanelC}><i /><i /><i /></div>
          </div>
          <div className={styles.readerBottom}><span>‹</span><i><b /></i><span>›</span></div>
        </div>
      </div>
    </section>
  );
}
