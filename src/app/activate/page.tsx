import type { Metadata } from 'next';
import Link from 'next/link';

import { DocumentPage, Notice } from '@/components/document-page';
import { ArrowIcon, CheckIcon, SparkIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Start reading',
  description: 'Open Kira Manga and learn how to activate source management.',
  alternates: { canonical: '/activate' },
};

const toc = [
  { href: '#how-it-works', label: 'How activation works' },
  { href: '#troubleshooting', label: 'If Kira does not open' },
] as const;

export default function ActivatePage() {
  return (
    <DocumentPage
      eyebrow="Activation"
      title="Continue in Kira."
      intro="Open this page on the Android or iOS device where Kira is installed. The official link connects the website to the app."
      toc={toc}
      heroActions={(
        <div className="pageActions">
          <a className="button buttonPrimary" href="kiramanga://activate">Open the Kira app <ArrowIcon /></a>
          <Link className="button buttonGhost" href="/support">Activation help</Link>
        </div>
      )}
    >
      <div className="activationBanner">
        <span><SparkIcon /></span>
        <div><strong>Official Kira activation</strong><p>No account, password, or payment is required.</p></div>
      </div>

      <section id="how-it-works">
        <p className="sectionNumber">01</p>
        <h2>How source activation works</h2>
        <ol className="stepList">
          <li><span><CheckIcon /></span><div><strong>Install Kira</strong><p>Use the Android or iOS device where the app is installed.</p></div></li>
          <li><span><CheckIcon /></span><div><strong>Open the official link</strong><p>Visit <code>https://kiramanga.me/activate</code> in your default browser.</p></div></li>
          <li><span><CheckIcon /></span><div><strong>Choose your sources</strong><p>Kira permanently reveals its Sources management screen for that installation.</p></div></li>
        </ol>
        <p>Activation is a discoverability gate for source-management controls. It is not an account login, purchase, or security credential.</p>
      </section>

      <section id="troubleshooting">
        <p className="sectionNumber">02</p>
        <h2>If the app does not open</h2>
        <ul>
          <li>Use Safari on iOS or your default browser on Android rather than an in-app social browser.</li>
          <li>Choose “Open in app” if the browser asks.</li>
          <li>Open Kira manually, then use Start Reading from Home or Settings.</li>
          <li>Use <code>kiramanga://activate</code> as the custom-scheme fallback.</li>
        </ul>
      </section>

      <Notice>Only follow activation guidance published on <strong>kiramanga.me</strong> or Kira&apos;s confirmed social profiles. Kira never asks for a password or payment to activate Sources management.</Notice>
    </DocumentPage>
  );
}
