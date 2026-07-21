import type { Route } from 'next';
import Link from 'next/link';

import { ArrowIcon, BookIcon, DownloadIcon, SearchIcon, SettingsIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { homeCopy } from '@/content/home';
import { getTutorials, type TutorialCategory } from '@/lib/tutorial-api';

import styles from './home.module.css';

const tutorialIcons = {
  book: BookIcon,
  search: SearchIcon,
  download: DownloadIcon,
  settings: SettingsIcon,
} satisfies Record<TutorialCategory['iconCode'], typeof BookIcon>;

export async function TutorialPreview() {
  const copy = homeCopy.tutorials;
  const result = await getTutorials({ featured: true });
  const previewTutorials = result.status === 'ok' ? result.data : [];

  return (
    <section className={styles.tutorialSection} id="tutorials" aria-labelledby="tutorials-title">
      <div className={`${styles.tutorialLayout} shell`}>
        <div className={styles.tutorialCopy}>
          <p className={styles.eyebrow}><span>03</span><LocalizedText en={copy.eyebrow.en} ar={copy.eyebrow.ar} /></p>
          <h2 id="tutorials-title">
            <LocalizedText
              en={<>{copy.title.lead.en}<br /><span>{copy.title.accent.en}</span></>}
              ar={<>{copy.title.lead.ar}<br /><span>{copy.title.accent.ar}</span></>}
            />
          </h2>
          <p><LocalizedText en={copy.description.en} ar={copy.description.ar} /></p>
          <Link className={styles.allTutorialsLink} href="/tutorials">
            <LocalizedText en={copy.cta.en} ar={copy.cta.ar} /> <ArrowIcon />
          </Link>
        </div>

        <div className={styles.guideBrowser}>
          <div className={styles.guideBrowserBar}>
            <span><i /><i /><i /></span>
            <b><LocalizedText en={copy.browserTitle.en} ar={copy.browserTitle.ar} /></b>
            <small>{copy.browserUrl}</small>
          </div>
          <div className={styles.guideBrowserBody}>
            {previewTutorials.length ? <><aside className={styles.guideSidebar}>
              <span className={styles.sidebarLogo}>{copy.sidebarMonogram}</span>
              <p><LocalizedText en={copy.sidebarLabel.en} ar={copy.sidebarLabel.ar} /></p>
              {previewTutorials.map((tutorial, index) => (
                <span className={index === 0 ? styles.activeSidebarItem : undefined} key={tutorial.slug}>{String(index + 1).padStart(2, '0')}</span>
              ))}
            </aside>
            <div className={styles.guideList}>
              <div className={styles.guideListHeader}>
                <span><LocalizedText en={copy.listLabel.en} ar={copy.listLabel.ar} /></span>
                <span>{previewTutorials.length} <LocalizedText en={copy.articlesLabel.en} ar={copy.articlesLabel.ar} /></span>
              </div>
              {previewTutorials.map((tutorial, index) => {
                const Icon = tutorialIcons[tutorial.category.iconCode];
                const step = String(index + 1).padStart(2, '0');
                return (
                  <Link href={`/tutorials/${tutorial.slug}` as Route} className={styles.guideRow} key={tutorial.slug}>
                    <span className={styles.guideIcon}><Icon /></span>
                    <span className={styles.guideMeta}>
                      <small>{step} · <LocalizedText en={tutorial.duration.en.toUpperCase()} ar={tutorial.duration.ar} /></small>
                      <strong><LocalizedText en={tutorial.title.en} ar={tutorial.title.ar} /></strong>
                    </span>
                    <ArrowIcon />
                  </Link>
                );
              })}
            </div>
            </> : <div className={styles.guideList}><p><LocalizedText en={copy.unavailable.en} ar={copy.unavailable.ar} /></p></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
