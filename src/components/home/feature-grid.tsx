import { BackupIcon, BookIcon, DownloadIcon } from '@/components/icons';

import styles from './home.module.css';

const features = [
  {
    icon: BookIcon,
    number: '01',
    label: 'LIBRARY',
    title: 'Everything you follow, in one calm place.',
    text: 'Save titles, see new chapters, and jump back into your current read without searching again.',
    className: styles.libraryFeature,
  },
  {
    icon: DownloadIcon,
    number: '02',
    label: 'OFFLINE',
    title: 'Your next chapter does not need a signal.',
    text: 'Download chapters before a trip and read completed downloads whenever you are offline.',
    className: styles.offlineFeature,
  },
  {
    icon: BackupIcon,
    number: '03',
    label: 'BACKUPS',
    title: 'Move your reading life, not just the app.',
    text: 'Export a Kira backup before switching devices or reinstalling, then bring your collection back.',
    className: styles.backupFeature,
  },
] as const;

export function FeatureGrid() {
  return (
    <section className={`${styles.section} shell`} id="features" aria-labelledby="features-title">
      <header className={styles.sectionHeader}>
        <p className={styles.sectionKicker}><span />Made for manga readers</p>
        <div>
          <h2 id="features-title">The useful parts stay close.<br /><em>The noise stays out.</em></h2>
          <p>Kira keeps discovery, reading, and ownership simple from the first chapter to the hundredth.</p>
        </div>
      </header>

      <div className={styles.featureGrid}>
        {features.map(({ icon: Icon, number, label, title, text, className }) => (
          <article className={`${styles.featureCard} ${className}`} key={number}>
            <div className={styles.featureMeta}><span>{number} · {label}</span><Icon /></div>
            <div className={styles.featureCopy}><h3>{title}</h3><p>{text}</p></div>
            <div className={styles.featureArt} aria-hidden="true"><i /><i /><i /><b /></div>
          </article>
        ))}
      </div>
    </section>
  );
}
