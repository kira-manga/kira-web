import { BackupIcon, BookIcon, DownloadIcon } from '@/components/icons';

import styles from './home.module.css';

const features = [
  {
    icon: BookIcon,
    number: '01',
    title: 'A library with a memory',
    text: 'Save titles, follow progress, and return to the chapter you left behind.',
    className: styles.libraryFeature,
  },
  {
    icon: DownloadIcon,
    number: '02',
    title: 'Ready when the signal is not',
    text: 'Download chapters in advance and keep completed reads available offline.',
    className: styles.offlineFeature,
  },
  {
    icon: BackupIcon,
    number: '03',
    title: 'Your collection can travel',
    text: 'Export Kira backups and manga packages before moving or reinstalling.',
    className: styles.backupFeature,
  },
] as const;

export function FeatureGrid() {
  return (
    <section className={`${styles.section} shell`} id="features" aria-labelledby="features-title">
      <header className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Built for the long read</p>
        <div>
          <h2 id="features-title">The details should fade.<br /><em>The story should not.</em></h2>
          <p>Kira keeps the practical parts of reading close without turning them into the main event.</p>
        </div>
      </header>

      <div className={styles.featureGrid}>
        {features.map(({ icon: Icon, number, title, text, className }) => (
          <article className={`${styles.featureCard} ${className}`} key={number}>
            <div className={styles.featureMeta}><span>{number}</span><Icon /></div>
            <div><h3>{title}</h3><p>{text}</p></div>
            <div className={styles.featureArt} aria-hidden="true"><i /><i /><i /></div>
          </article>
        ))}
      </div>
    </section>
  );
}
