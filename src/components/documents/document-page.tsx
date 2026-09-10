import { useId, type ReactNode } from 'react';

import { PageHero } from '@/components/documents/page-hero';
import { LocalizedText } from '@/components/ui/localized-text';
import { siteCopy } from '@/content/site';

interface TocItem {
  href: `#${string}`;
  label: string;
}

interface DocumentPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  toc?: readonly TocItem[];
  heroActions?: ReactNode;
  children: ReactNode;
}

export function DocumentPage({ eyebrow, title, intro, toc, heroActions, children }: DocumentPageProps) {
  const tocLabelId = useId();

  // Keep the localized TOC's name in the root language, outside the English prose islands.
  return (
    <article className="documentPage shell">
      <PageHero eyebrow={eyebrow} title={title} intro={intro}>{heroActions}</PageHero>
      <p className="documentLanguageNotice" lang="ar" dir="rtl">{siteCopy.documents.englishOnlyNotice}</p>
      <div className={toc?.length ? 'documentGrid' : 'documentGrid documentGridSolo'}>
        <div className="documentBody" lang="en" dir="ltr">{children}</div>
        {toc?.length ? (
          <aside className="tableOfContents" aria-labelledby={`${tocLabelId}-document-toc`}>
            <p id={`${tocLabelId}-document-toc`}><LocalizedText en={siteCopy.documents.onThisPage.en} ar={siteCopy.documents.onThisPage.ar} /></p>
            <nav lang="en" dir="ltr">{toc.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
          </aside>
        ) : null}
      </div>
    </article>
  );
}

export function Notice({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return <div className={warning ? 'notice noticeWarning' : 'notice'}>{children}</div>;
}

export function MetaCard({ children }: { children: ReactNode }) {
  return <div className="metaCard">{children}</div>;
}
