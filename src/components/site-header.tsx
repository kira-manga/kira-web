import Link from 'next/link';

import { Brand } from '@/components/brand';
import { ArrowIcon, CloseIcon, MenuIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';
import { PreferenceControls } from '@/components/preferences';

const navigation = [
  { href: '/#features', en: 'Product', ar: 'المنتج' },
  { href: '/#real-screens', en: 'Inside Kira', ar: 'داخل كيرا' },
  { href: '/tutorials', en: 'Tutorials', ar: 'الشروحات' },
  { href: '/support', en: 'Support', ar: 'الدعم' },
] as const;

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <nav className="nav shell" aria-label="Main navigation">
        <Brand />
        <div className="desktopNav" aria-label="Primary links">
          {navigation.map((item) => <Link key={item.href} href={item.href}><LocalizedText en={item.en} ar={item.ar} /></Link>)}
        </div>
        <div className="headerActions">
          <PreferenceControls compact />
          <Link className="headerCta" href="/activate">
            <LocalizedText en="Start reading" ar="ابدأ القراءة" /> <ArrowIcon />
          </Link>
        </div>
        <details className="mobileMenu">
          <summary aria-label="Toggle navigation">
            <span className="menuOpen"><MenuIcon /></span>
            <span className="menuClose"><CloseIcon /></span>
          </summary>
          <div className="mobileMenuPanel">
            <PreferenceControls />
            {navigation.map((item) => <Link key={item.href} href={item.href}><LocalizedText en={item.en} ar={item.ar} /></Link>)}
            <Link className="button buttonPrimary" href="/activate"><LocalizedText en="Start reading" ar="ابدأ القراءة" /> <ArrowIcon /></Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
