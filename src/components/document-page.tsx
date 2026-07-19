import type { ReactNode } from 'react';

import { PageHero } from '@/components/page-hero';

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
      <div className={toc?.length ? 'documentGrid' : 'documentGrid documentGridSolo'}>
        <div className="documentBody">{children}</div>
        {toc?.length ? (
          <aside className="tableOfContents" aria-label="On this page">
            <p>On this page</p>
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
