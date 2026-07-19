import Link from 'next/link';

import { Brand } from '@/components/brand';
import { ArrowIcon, CloseIcon, MenuIcon } from '@/components/icons';

const navigation = [
  { href: '/#features', label: 'Features' },
  { href: '/guide', label: 'Guide' },
  { href: '/support', label: 'Support' },
] as const;

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <nav className="nav shell" aria-label="Main navigation">
        <Brand />
        <div className="desktopNav">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>
        <Link className="headerCta" href="/activate">
          Open Kira <ArrowIcon />
        </Link>
        <details className="mobileMenu">
          <summary aria-label="Toggle navigation">
            <span className="menuOpen"><MenuIcon /></span>
            <span className="menuClose"><CloseIcon /></span>
          </summary>
          <div className="mobileMenuPanel">
            {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
            <Link className="button buttonPrimary" href="/activate">Open Kira <ArrowIcon /></Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
