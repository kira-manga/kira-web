import { BookIcon, DownloadIcon, GlobeIcon, SearchIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { homeCopy } from '@/content/home';

import styles from './home.module.css';

const featureIcons = {
  search: SearchIcon,
  book: BookIcon,
  download: DownloadIcon,
  globe: GlobeIcon,
} as const;

export function FeatureGrid() {
  const copy = homeCopy.features;

  return (
    <section className={styles.featureSection} id="features" aria-labelledby="features-title">
      <div className={`${styles.sectionHeading} shell`}>
        <div>
          <p className={styles.eyebrow}><span>01</span><LocalizedText en={copy.eyebrow.en} ar={copy.eyebrow.ar} /></p>
          <h2 id="features-title">
            <LocalizedText
              en={<>{copy.title.lead.en}<br /><span>{copy.title.accent.en}</span></>}
              ar={<>{copy.title.lead.ar}<br /><span>{copy.title.accent.ar}</span></>}
            />
          </h2>
        </div>
        <p>
          <LocalizedText
            en={copy.description.en}
            ar={copy.description.ar}
          />
        </p>
      </div>

      <div className={`${styles.featureGrid} shell`}>
        {copy.items.map((item, index) => {
          const Icon = featureIcons[item.icon];
          const number = String(index + 1).padStart(2, '0');
          return (
            <article className={styles.featureCard} key={item.title.en}>
              <div className={styles.featureTop}>
                <span className={styles.featureIcon}><Icon /></span>
                <span className={styles.featureNumber}>{number}</span>
              </div>
              <h3><LocalizedText en={item.title.en} ar={item.title.ar} /></h3>
              <p><LocalizedText en={item.description.en} ar={item.description.ar} /></p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
