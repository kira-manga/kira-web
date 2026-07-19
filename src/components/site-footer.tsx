import Link from 'next/link';

import { KiraMark } from '@/components/brand';
import { ArrowIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';

const product = [
  { href: '/activate', en: 'Start reading', ar: 'ابدأ القراءة' },
  { href: '/tutorials', en: 'Tutorials', ar: 'الشروحات' },
  { href: '/guide', en: 'Quick-start guide', ar: 'دليل البدء السريع' },
  { href: '/support', en: 'Support', ar: 'الدعم' },
] as const;

const legal = [
  { href: '/privacy', en: 'Privacy', ar: 'الخصوصية' },
  { href: '/terms', en: 'Terms', ar: 'الشروط' },
  { href: '/takedown', en: 'Takedown', ar: 'إزالة المحتوى' },
  { href: '/data-deletion', en: 'Data deletion', ar: 'حذف البيانات' },
] as const;

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="shell footerTop">
        <div className="footerBrand">
          <KiraMark />
          <h2><LocalizedText en={<>Keep the story.<br />Lose the noise.</>} ar={<>احتفظ بالقصة.<br />واترك الضوضاء.</>} /></h2>
          <p><LocalizedText en="A focused manga reader for discovery, offline chapters, and a library that stays yours." ar="قارئ مانجا هادئ للاكتشاف والفصول دون إنترنت ومكتبة تبقى لك." /></p>
        </div>
        <div className="footerLinks">
          <div>
            <p className="footerLabel"><LocalizedText en="Product" ar="المنتج" /></p>
            {product.map((item) => <Link key={item.href} href={item.href}><LocalizedText en={item.en} ar={item.ar} /></Link>)}
          </div>
          <div>
            <p className="footerLabel"><LocalizedText en="Legal" ar="قانوني" /></p>
            {legal.map((item) => <Link key={item.href} href={item.href}><LocalizedText en={item.en} ar={item.ar} /></Link>)}
          </div>
        </div>
      </div>
      <div className="shell footerBottom">
        <p>© {new Date().getFullYear()} Kira Manga</p>
        <Link href="/activate"><LocalizedText en="Start reading" ar="ابدأ القراءة" /> <ArrowIcon /></Link>
      </div>
    </footer>
  );
}
