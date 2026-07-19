import type { Metadata } from 'next';
import Link from 'next/link';

import { DocumentPage, Notice } from '@/components/document-page';
import { ArrowIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Support and troubleshooting for Kira Manga.',
  alternates: { canonical: '/support' },
};

const toc = [
  { href: '#activation', label: 'Activation' },
  { href: '#library', label: 'Empty library' },
  { href: '#import', label: 'Import and restore' },
  { href: '#downloads', label: 'Downloads and pages' },
  { href: '#links', label: 'Notifications and links' },
  { href: '#report', label: 'Report a problem' },
] as const;

export default function SupportPage() {
  return (
    <DocumentPage
      eyebrow="Help center"
      title="How can we help?"
      intro="Start with the checks below. Never send passwords, signing files, full private backups, or unrelated personal data to support."
      toc={toc}
      heroActions={<div className="pageActions"><Link className="button buttonPrimary" href="/activate">Start reading <ArrowIcon /></Link><Link className="button buttonGhost" href="/data-deletion">Delete data</Link></div>}
    >
      <section id="activation"><p className="sectionNumber">01</p><h2>Activate Sources management</h2><p>Open <Link href="/activate">kiramanga.me/activate</Link> on the device where Kira is installed. If an in-app social browser keeps the page inside itself, open the link in Safari or your default Android browser. You can also use Start Reading from Kira&apos;s Home or Settings screen.</p></section>
      <section id="library"><p className="sectionNumber">02</p><h2>No manga appears on Home</h2><p>If activation is still locked and no usable source is enabled, Kira shows the Start Reading guidance. After activation, open Sources management and enable at least one source. A real network, parsing, Cloudflare, or source-site error is separate and should not be treated as an activation problem.</p></section>
      <section id="import"><p className="sectionNumber">03</p><h2>Import and restore</h2><p>Kira imports complete Kira backup ZIP files and manga packages previously exported by Kira. Arbitrary external CBZ files are not supported. Keep the original archive until you confirm its library metadata, chapters, cover, downloaded files, and reading state restored correctly.</p></section>
      <section id="downloads"><p className="sectionNumber">04</p><h2>Downloads or pages fail</h2><ul><li>Confirm the device is online and has enough free storage.</li><li>Retry without a VPN or restrictive content filter if the source blocks it.</li><li>Some sources require a Cloudflare challenge in the built-in WebView.</li><li>A source site can be offline or change its page format independently of Kira.</li><li>Downloaded chapters should remain readable offline after completion.</li></ul></section>
      <section id="links"><p className="sectionNumber">05</p><h2>Notifications and deep links</h2><p>Enable notification permission in system settings. Android App Links and iOS Universal Links use <code>https://kiramanga.me/activate</code>; the fallback scheme is <code>kiramanga://activate</code>. Push behavior also depends on Firebase/APNs configuration in the installed build.</p></section>
      <section id="report"><p className="sectionNumber">06</p><h2>Report a problem</h2><p>The internal-testing app includes a complaint form. Include the smallest useful description and avoid sensitive information. The complaint system is not approved for public production until authenticated authorization or equivalent strict rules are verified.</p><Notice warning><strong>Support email:</strong> <span className="placeholder">[OWNER TO SUPPLY MONITORED SUPPORT EMAIL]</span><br /><strong>Expected response time:</strong> <span className="placeholder">[OWNER TO SET — DO NOT PROMISE UNTIL STAFFED]</span></Notice></section>
      <section><h2>Copyright requests</h2><p>Use the <Link href="/takedown">copyright and takedown process</Link>. Support cannot determine ownership from a general app complaint.</p></section>
    </DocumentPage>
  );
}
