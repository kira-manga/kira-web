import Link from 'next/link';

import { KiraMark } from '@/components/brand';
import { ArrowIcon } from '@/components/icons';

const product = [
  { href: '/activate', label: 'Open Kira' },
  { href: '/guide', label: 'Reading guide' },
  { href: '/support', label: 'Support' },
] as const;

const legal = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/takedown', label: 'Takedown' },
  { href: '/data-deletion', label: 'Data deletion' },
] as const;

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="shell footerTop">
        <div className="footerBrand">
          <KiraMark />
          <h2>Every story deserves<br />a beautiful reader.</h2>
          <p>Kira is a focused manga reader for Android and iOS.</p>
        </div>
        <div className="footerLinks">
          <div>
            <p className="footerLabel">Product</p>
            {product.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </div>
          <div>
            <p className="footerLabel">Legal</p>
            {legal.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </div>
        </div>
      </div>
      <div className="shell footerBottom">
        <p>© {new Date().getFullYear()} Kira Manga</p>
        <Link href="/activate">Start reading <ArrowIcon /></Link>
      </div>
    </footer>
  );
}
