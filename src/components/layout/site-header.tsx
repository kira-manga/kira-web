import type { Route } from 'next';
import Link from 'next/link';
import { useId } from 'react';

import { Brand } from '@/components/layout/brand';
import { ArrowIcon, CloseIcon, MenuIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { PreferenceControls } from '@/components/ui/preferences';
import { siteCopy } from '@/content/site';

export function SiteHeader() {
  const labelId = useId();

  return (
    <header className="siteHeader">
      <nav className="nav shell" aria-labelledby={`${labelId}-header-navigation`}>
        <span className="srOnly" id={`${labelId}-header-navigation`}>
          <LocalizedText en={siteCopy.header.navigationLabel.en} ar={siteCopy.header.navigationLabel.ar} />
        </span>
        <Brand />
        <div className="desktopNav" role="group" aria-labelledby={`${labelId}-primary-links`}>
          <span className="srOnly" id={`${labelId}-primary-links`}>
            <LocalizedText en={siteCopy.header.primaryLinksLabel.en} ar={siteCopy.header.primaryLinksLabel.ar} />
          </span>
          {siteCopy.navigation.map((item) => <Link key={item.href} href={item.href as Route}><LocalizedText en={item.label.en} ar={item.label.ar} /></Link>)}
        </div>
        <div className="headerActions">
          <PreferenceControls compact />
          <Link className="headerCta" href="/activate">
            <LocalizedText en={siteCopy.header.cta.en} ar={siteCopy.header.cta.ar} /> <ArrowIcon />
          </Link>
        </div>
        <details className="mobileMenu">
          <summary>
            <span className="srOnly"><LocalizedText en={siteCopy.header.menuLabel.en} ar={siteCopy.header.menuLabel.ar} /></span>
            <span className="menuOpen"><MenuIcon /></span>
            <span className="menuClose"><CloseIcon /></span>
          </summary>
          <div className="mobileMenuPanel">
            <PreferenceControls />
            {siteCopy.navigation.map((item) => <Link key={item.href} href={item.href as Route}><LocalizedText en={item.label.en} ar={item.label.ar} /></Link>)}
            <Link className="button buttonPrimary" href="/activate"><LocalizedText en={siteCopy.header.cta.en} ar={siteCopy.header.cta.ar} /> <ArrowIcon /></Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
