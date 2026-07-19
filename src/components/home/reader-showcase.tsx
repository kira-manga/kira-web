import Link from 'next/link';

import { ArrowIcon, CheckIcon } from '@/components/icons';

import styles from './home.module.css';

export function ReaderShowcase() {
  return (
    <section className={styles.readerSection} id="experience" aria-labelledby="reader-title">
      <div className={`${styles.readerInner} shell`}>
        <div className={styles.readerCopy}>
          <p className={styles.sectionKicker}><span />A reader that gets out of the way</p>
          <h2 id="reader-title">Controls when you need them.<br /><em>Story when you don&apos;t.</em></h2>
          <p>Move through every page in a focused reader, then return later without losing your place.</p>
          <ul>
            <li><CheckIcon /> Continue from saved progress</li>
            <li><CheckIcon /> Read completed downloads offline</li>
            <li><CheckIcon /> Adjust the reader to your preference</li>
          </ul>
          <Link href="/guide">Explore the reading guide <ArrowIcon /></Link>
        </div>

        <div className={styles.readerMock} aria-label="Preview of Kira's reader interface">
          <div className={styles.readerTop}><span>‹</span><div><small>YAMI</small><strong>Chapter 24</strong></div><span>•••</span></div>
          <div className={styles.mangaCanvas} aria-hidden="true">
            <div className={styles.mangaPanelA}><i /><b /></div>
            <div className={styles.mangaPanelB}><i /></div>
            <div className={styles.mangaPanelC}><i /><i /><i /></div>
          </div>
          <div className={styles.readerBottom}><span>18</span><i><b /></i><span>24</span></div>
        </div>
      </div>
    </section>
  );
}
