import type { Route } from 'next';
import Link from 'next/link';

import { Brand } from '@/components/layout/brand';
import { ArrowIcon, CloseIcon, MenuIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { PreferenceControls } from '@/components/ui/preferences';
import { siteCopy } from '@/content/site';

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <nav className="nav shell" aria-label={siteCopy.header.navigationLabel}>
        <Brand />
        <div className="desktopNav" aria-label={siteCopy.header.primaryLinksLabel}>
          {siteCopy.navigation.map((item) => <Link key={item.href} href={item.href as Route}><LocalizedText en={item.label.en} ar={item.label.ar} /></Link>)}
        </div>
        <div className="headerActions">
          <PreferenceControls compact />
          <Link className="headerCta" href="/activate">
            <LocalizedText en={siteCopy.header.cta.en} ar={siteCopy.header.cta.ar} /> <ArrowIcon />
          </Link>
        </div>
        <details className="mobileMenu">
          <summary aria-label={siteCopy.header.menuLabel}>
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
