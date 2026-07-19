import type { Metadata } from 'next';
import Link from 'next/link';

import { DocumentPage, Notice } from '@/components/document-page';
import { ArrowIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Reading guide',
  description: 'A quick guide to starting, importing, and reading manga with Kira Manga.',
  alternates: { canonical: '/guide' },
};

const toc = [
  { href: '#library', label: 'Start with your library' },
  { href: '#activate', label: 'Activate sources' },
  { href: '#read', label: 'Add manga and read' },
  { href: '#backup', label: 'Protect your library' },
] as const;

export default function GuidePage() {
  return (
    <DocumentPage
      eyebrow="Getting started"
      title="Read with Kira."
      intro="Build a local library from a Kira backup or, after activation, choose the sources you want to manage."
      toc={toc}
      heroActions={<div className="pageActions"><Link className="button buttonPrimary" href="/activate">Open Kira <ArrowIcon /></Link><Link className="button buttonGhost" href="/support">Troubleshooting</Link></div>}
    >
      <section id="library">
        <p className="sectionNumber">01</p><h2>Start with your library</h2>
        <p>You can continue to Library without activating Sources management. Import a complete Kira backup ZIP or an individual manga package previously exported by Kira. Arbitrary third-party CBZ imports are not supported in this release.</p>
      </section>
      <section id="activate">
        <p className="sectionNumber">02</p><h2>Activate Sources management</h2>
        <p>Open the official <Link href="/activate">activation page</Link> on your Android or iOS device. Once activated, Kira permanently reveals the Sources screen so you can enable, disable, and configure available sources. Activation is a simple UI discoverability step, not an account or security credential.</p>
      </section>
      <section id="read">
        <p className="sectionNumber">03</p><h2>Add manga and download chapters</h2>
        <p>Open an enabled source, find a title, and add it to your library. From a manga&apos;s details screen you can refresh chapters or download them for offline reading. Source websites are independent services, so availability and response formats can change.</p>
      </section>
      <section id="backup">
        <p className="sectionNumber">04</p><h2>Protect your library</h2>
        <p>Use Kira&apos;s Backup screen to export a complete backup before changing devices or reinstalling. Keep the original ZIP until you verify that library metadata, chapters, covers, downloaded files, and reading state restored correctly.</p>
      </section>
      <Notice>Use only links published on <strong>kiramanga.me</strong> or Kira&apos;s confirmed social profiles. Kira never asks for a password or payment to reveal Sources management.</Notice>
    </DocumentPage>
  );
}
