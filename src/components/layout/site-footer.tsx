import type { Route } from 'next';
import Link from 'next/link';

import { KiraMark } from '@/components/layout/brand';
import { ArrowIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { siteConfig, siteCopy } from '@/content/site';

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="shell footerTop">
        <div className="footerBrand">
          <KiraMark />
          <h2><LocalizedText en={siteCopy.footer.title.en} ar={siteCopy.footer.title.ar} /></h2>
          <p><LocalizedText en={siteCopy.footer.description.en} ar={siteCopy.footer.description.ar} /></p>
        </div>
        <div className="footerLinks">
          <div>
            <p className="footerLabel"><LocalizedText en={siteCopy.footer.productLabel.en} ar={siteCopy.footer.productLabel.ar} /></p>
            {siteCopy.footer.productLinks.map((item) => <Link key={item.href} href={item.href as Route}><LocalizedText en={item.label.en} ar={item.label.ar} /></Link>)}
          </div>
          <div>
            <p className="footerLabel"><LocalizedText en={siteCopy.footer.legalLabel.en} ar={siteCopy.footer.legalLabel.ar} /></p>
            {siteCopy.footer.legalLinks.map((item) => <Link key={item.href} href={item.href as Route}><LocalizedText en={item.label.en} ar={item.label.ar} /></Link>)}
          </div>
        </div>
      </div>
      <div className="shell footerBottom">
        <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        <Link href="/activate"><LocalizedText en={siteCopy.footer.bottomCta.en} ar={siteCopy.footer.bottomCta.ar} /> <ArrowIcon /></Link>
      </div>
    </footer>
  );
}
