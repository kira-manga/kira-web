'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ArrowIcon, SearchIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { LiveAppScreen, useKiraPreferences } from '@/components/ui/preferences';
import { media } from '@/content/media';
import { tutorialCategoryLabels, tutorials, tutorialsPageCopy, type TutorialCategory } from '@/content/tutorials';

import styles from './tutorials.module.css';

const filters: Array<'all' | TutorialCategory> = ['all', 'basics', 'discovery', 'reading', 'settings'];

export function TutorialLibrary() {
  const copy = tutorialsPageCopy.library;
  const { preferences } = useKiraPreferences();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | TutorialCategory>('all');

  const visibleTutorials = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return tutorials.filter((tutorial) => {
      const matchesCategory = category === 'all' || tutorial.category === category;
      const searchable = [
        tutorial.title.en,
        tutorial.title.ar,
        tutorial.summary.en,
        tutorial.summary.ar,
        tutorialCategoryLabels[tutorial.category].en,
        tutorialCategoryLabels[tutorial.category].ar,
      ].join(' ').toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query]);

  const language = preferences.language;

  return (
    <section className={styles.library} aria-labelledby="tutorial-library-title">
      <div className={styles.libraryTop}>
        <div>
          <p className={styles.sectionLabel}><LocalizedText en={copy.sectionLabel.en} ar={copy.sectionLabel.ar} /></p>
          <h2 id="tutorial-library-title"><LocalizedText en={copy.title.en} ar={copy.title.ar} /></h2>
        </div>
        <label className={styles.searchBox}>
          <SearchIcon />
          <span className={styles.srOnly}><LocalizedText en={copy.searchLabel.en} ar={copy.searchLabel.ar} /></span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder[language]}
          />
          <kbd>/</kbd>
        </label>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filters} aria-label={copy.categoriesLabel[language]}>
          {filters.map((filter) => (
            <button
              type="button"
              className={category === filter ? styles.activeFilter : undefined}
              aria-pressed={category === filter}
              onClick={() => setCategory(filter)}
              key={filter}
            >
              {tutorialCategoryLabels[filter][language]}
            </button>
          ))}
        </div>
        <p aria-live="polite">
          {language === 'ar'
            ? `${visibleTutorials.length} ${visibleTutorials.length === 1 ? copy.count.ar.one : copy.count.ar.many}`
            : `${visibleTutorials.length} ${visibleTutorials.length === 1 ? copy.count.en.one : copy.count.en.many}`}
        </p>
      </div>

      {visibleTutorials.length ? (
        <div className={styles.tutorialGrid}>
          {visibleTutorials.map((tutorial, index) => {
            const cover = media.appScreens[tutorial.cover];
            return (
              <Link className={styles.tutorialCard} href={`/tutorials/${tutorial.slug}` as Route} key={tutorial.slug}>
                <div className={styles.cardMedia}>
                  {tutorial.cover === 'discover' ? (
                    <LiveAppScreen />
                  ) : (
                    <Image src={cover.src} alt={`${cover.alt.en} — ${cover.alt.ar}`} width={cover.width} height={cover.height} unoptimized />
                  )}
                  <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.cardDuration}>{tutorial.duration[language]}</span>
                </div>
                <div className={styles.cardBody}>
                  <p>{tutorialCategoryLabels[tutorial.category][language]}</p>
                  <h3>{tutorial.title[language]}</h3>
                  <span>{tutorial.summary[language]}</span>
                  <strong><LocalizedText en={copy.openGuide.en} ar={copy.openGuide.ar} /> <ArrowIcon /></strong>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <SearchIcon />
          <h3><LocalizedText en={copy.emptyTitle.en} ar={copy.emptyTitle.ar} /></h3>
          <p><LocalizedText en={copy.emptyDescription.en} ar={copy.emptyDescription.ar} /></p>
          <button type="button" onClick={() => { setQuery(''); setCategory('all'); }}><LocalizedText en={copy.clearFilters.en} ar={copy.clearFilters.ar} /></button>
        </div>
      )}
    </section>
  );
}
