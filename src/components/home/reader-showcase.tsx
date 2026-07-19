import Image from 'next/image';

import { CheckIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { LiveAppScreen } from '@/components/ui/preferences';
import { homeCopy } from '@/content/home';
import { media } from '@/content/media';

import styles from './home.module.css';

export function ReaderShowcase() {
  const copy = homeCopy.screens;
  const detailsScreen = media.appScreens.mangaDetails;
  const settingsScreen = media.appScreens.settings;

  return (
    <section className={styles.screensSection} id="real-screens" aria-labelledby="screens-title">
      <div className={`${styles.sectionHeading} ${styles.screenHeading} shell`}>
        <div>
          <p className={styles.eyebrow}><span>02</span><LocalizedText en={copy.eyebrow.en} ar={copy.eyebrow.ar} /></p>
          <h2 id="screens-title">
            <LocalizedText
              en={<>{copy.title.lead.en}<br /><span>{copy.title.accent.en}</span></>}
              ar={<>{copy.title.lead.ar}<br /><span>{copy.title.accent.ar}</span></>}
            />
          </h2>
        </div>
        <div className={styles.authenticNote}>
          <CheckIcon />
          <p><LocalizedText en={copy.authenticity.en} ar={copy.authenticity.ar} /></p>
        </div>
      </div>

      <div className={`${styles.productWindow} shell`}>
        <div className={styles.windowBar}>
          <span className={styles.windowDots}><i /><i /><i /></span>
          <span className={styles.windowTitle}>{copy.windowTitle}</span>
          <span className={styles.windowStatus}><i /> <LocalizedText en={copy.windowStatus.en} ar={copy.windowStatus.ar} /></span>
        </div>

        <div className={styles.windowGrid}>
          <div className={styles.windowStory}>
            <span className={styles.storyNumber}>01 / 03</span>
            <p className={styles.storyLabel}><LocalizedText en={copy.storyLabel.en} ar={copy.storyLabel.ar} /></p>
            <h3><LocalizedText en={copy.storyTitle.en} ar={copy.storyTitle.ar} /></h3>
            <p><LocalizedText en={copy.storyDescription.en} ar={copy.storyDescription.ar} /></p>
            <div className={styles.storySignals}>
              {copy.signals.map((signal) => <span key={signal.en}><i /><LocalizedText en={signal.en} ar={signal.ar} /></span>)}
            </div>
          </div>

          <figure className={`${styles.appPanel} ${styles.discoverPanel}`}>
            <div className={styles.appPanelImage}><LiveAppScreen /></div>
            <figcaption><b>01</b><span><LocalizedText en={copy.captions.discover.en} ar={copy.captions.discover.ar} /></span></figcaption>
          </figure>

          <figure className={`${styles.appPanel} ${styles.detailsPanel}`}>
            <div className={styles.appPanelImage}>
              <Image src={detailsScreen.src} alt={`${detailsScreen.alt.en} — ${detailsScreen.alt.ar}`} width={detailsScreen.width} height={detailsScreen.height} loading="lazy" unoptimized />
            </div>
            <figcaption><b>02</b><span><LocalizedText en={copy.captions.details.en} ar={copy.captions.details.ar} /></span></figcaption>
          </figure>

          <figure className={`${styles.appPanel} ${styles.settingsPanel}`}>
            <div className={styles.appPanelImage}>
              <Image src={settingsScreen.src} alt={`${settingsScreen.alt.en} — ${settingsScreen.alt.ar}`} width={settingsScreen.width} height={settingsScreen.height} loading="lazy" unoptimized />
            </div>
            <figcaption><b>03</b><span><LocalizedText en={copy.captions.settings.en} ar={copy.captions.settings.ar} /></span></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
