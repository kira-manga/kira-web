import type { ReactNode } from 'react';

import { PageHero } from '@/components/page-hero';
import { LocalizedText } from '@/components/localized-text';

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
  return (
    <article className="documentPage shell">
      <PageHero eyebrow={eyebrow} title={title} intro={intro}>{heroActions}</PageHero>
      <p className="documentLanguageNotice"><LocalizedText en="" ar="هذه الصفحة المرجعية متاحة حاليًا باللغة الإنجليزية لضمان دقة الإرشادات والنصوص القانونية." /></p>
      <div className={toc?.length ? 'documentGrid' : 'documentGrid documentGridSolo'}>
        <div className="documentBody">{children}</div>
        {toc?.length ? (
          <aside className="tableOfContents" aria-label="On this page">
            <p><LocalizedText en="On this page" ar="في هذه الصفحة" /></p>
            <nav>{toc.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
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
