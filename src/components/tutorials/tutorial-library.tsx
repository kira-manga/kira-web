'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ArrowIcon, SearchIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { useKiraPreferences } from '@/components/ui/preferences';
import { tutorialsPageCopy } from '@/content/tutorials';
import type { Tutorial, TutorialCategory } from '@/lib/tutorial-api';
import { TutorialMediaImage } from './tutorial-media-image';

import styles from './tutorials.module.css';

export function TutorialLibrary({ tutorials, categories }: { tutorials: Tutorial[]; categories: TutorialCategory[] }) {
  const copy = tutorialsPageCopy.library;
  const { preferences } = useKiraPreferences();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  const visibleTutorials = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return tutorials.filter((tutorial) => {
      const matchesCategory = category === 'all' || tutorial.category.slug === category;
      const searchable = [
        tutorial.title.en,
        tutorial.title.ar,
        tutorial.summary.en,
        tutorial.summary.ar,
        tutorial.category.label.en,
        tutorial.category.label.ar,
      ].join(' ').toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query, tutorials]);

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
          {['all', ...categories.map((item) => item.slug)].map((filter) => (
            <button
              type="button"
              className={category === filter ? styles.activeFilter : undefined}
              aria-pressed={category === filter}
              onClick={() => setCategory(filter)}
              key={filter}
            >
              {filter === 'all' ? copy.allCategory[language] : categories.find((item) => item.slug === filter)?.label[language]}
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
            return (
              <Link className={styles.tutorialCard} href={`/tutorials/${tutorial.slug}` as Route} key={tutorial.slug}>
                <div className={styles.cardMedia}>
                  <TutorialMediaImage media={tutorial.cover} />
                  <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.cardDuration}>{tutorial.duration[language]}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTopline}>
                    <p>{tutorial.category.label[language]}</p>
                    <span>{tutorial.level[language]}</span>
                  </div>
                  <h3>{tutorial.title[language]}</h3>
                  <p className={styles.cardSummary}>{tutorial.summary[language]}</p>
                  <div className={styles.cardFooter}>
                    <strong><LocalizedText en={copy.openGuide.en} ar={copy.openGuide.ar} /> <ArrowIcon /></strong>
                    <small>{tutorial.steps.length} {copy.steps[language]}</small>
                  </div>
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
