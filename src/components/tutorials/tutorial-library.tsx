'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ArrowIcon, SearchIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';
import { LiveAppScreen, useKiraPreferences } from '@/components/preferences';
import { tutorialCategoryLabels, tutorials, type TutorialCategory } from '@/content/tutorials';

import styles from './tutorials.module.css';

const filters: Array<'all' | TutorialCategory> = ['all', 'basics', 'discovery', 'reading', 'settings'];

export function TutorialLibrary() {
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
          <p className={styles.sectionLabel}><LocalizedText en="GUIDE LIBRARY" ar="مكتبة الشروحات" /></p>
          <h2 id="tutorial-library-title"><LocalizedText en="Find the answer, then keep reading." ar="اعثر على الإجابة ثم أكمل القراءة." /></h2>
        </div>
        <label className={styles.searchBox}>
          <SearchIcon />
          <span className={styles.srOnly}><LocalizedText en="Search tutorials" ar="ابحث في الشروحات" /></span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === 'ar' ? 'ابحث في الشروحات…' : 'Search tutorials…'}
          />
          <kbd>/</kbd>
        </label>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filters} aria-label={language === 'ar' ? 'تصنيفات الشروحات' : 'Tutorial categories'}>
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
            ? `${visibleTutorials.length} ${visibleTutorials.length === 1 ? 'شرح' : 'شروحات'}`
            : `${visibleTutorials.length} ${visibleTutorials.length === 1 ? 'guide' : 'guides'}`}
        </p>
      </div>

      {visibleTutorials.length ? (
        <div className={styles.tutorialGrid}>
          {visibleTutorials.map((tutorial, index) => (
            <Link className={styles.tutorialCard} href={`/tutorials/${tutorial.slug}` as Route} key={tutorial.slug}>
              <div className={styles.cardMedia}>
                {tutorial.cover.kind === 'live' ? (
                  <LiveAppScreen />
                ) : (
                  <Image src={tutorial.cover.src ?? ''} alt={tutorial.cover.alt} width={588} height={1280} unoptimized />
                )}
                <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.cardDuration}>{tutorial.duration[language]}</span>
              </div>
              <div className={styles.cardBody}>
                <p>{tutorialCategoryLabels[tutorial.category][language]}</p>
                <h3>{tutorial.title[language]}</h3>
                <span>{tutorial.summary[language]}</span>
                <strong><LocalizedText en="Open guide" ar="افتح الشرح" /> <ArrowIcon /></strong>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <SearchIcon />
          <h3><LocalizedText en="No guide matches that search." ar="لا يوجد شرح يطابق هذا البحث." /></h3>
          <p><LocalizedText en="Try a shorter phrase or choose All guides." ar="جرّب عبارة أقصر أو اختر «كل الشروحات»." /></p>
          <button type="button" onClick={() => { setQuery(''); setCategory('all'); }}><LocalizedText en="Clear filters" ar="امسح الفلاتر" /></button>
        </div>
      )}
    </section>
  );
}
