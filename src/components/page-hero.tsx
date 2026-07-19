import type { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, intro, children }: PageHeroProps) {
  return (
    <section className="pageHero">
      <p className="eyebrow"><span />{eyebrow}</p>
      <h1>{title}</h1>
      <p className="pageIntro">{intro}</p>
      {children}
    </section>
  );
}
