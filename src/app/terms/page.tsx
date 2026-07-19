import type { Metadata } from 'next';
import Link from 'next/link';

import { DocumentPage, MetaCard } from '@/components/document-page';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'Draft terms of service for Kira Manga.',
  alternates: { canonical: '/terms' },
};

const toc = [
  { href: '#using-kira', label: 'Using Kira' },
  { href: '#sources', label: 'Third-party sources' },
  { href: '#activation', label: 'Activation' },
  { href: '#files', label: 'Files and backups' },
  { href: '#safety', label: 'Safety' },
  { href: '#liability', label: 'Disclaimers' },
] as const;

export default function TermsPage() {
  return (
    <DocumentPage eyebrow="Draft terms" title="Terms of service" intro="These terms are a product draft, not final legal advice. Owner identity, jurisdiction, age rules, and mandatory consumer terms remain open." toc={toc}>
      <MetaCard><strong>Effective date:</strong> <span className="placeholder">[OWNER/LEGAL TO SET]</span><br /><strong>Service provider:</strong> <span className="placeholder">[LEGAL NAME, ADDRESS, AND CONTACT]</span><br /><strong>Governing law/forum:</strong> <span className="placeholder">[LEGAL REVIEW REQUIRED]</span></MetaCard>
      <section id="using-kira"><p className="sectionNumber">01</p><h2>Using Kira</h2><p>Kira is an Android and iOS manga reader with library, reading, download, backup, and source-management tools. You are responsible for using the app and third-party sources lawfully, respecting applicable rights, and following the terms of sites you choose to access.</p></section>
      <section id="sources"><p className="sectionNumber">02</p><h2>Third-party sources and content</h2><p>Kira does not host the manga obtained from configured third-party sources in this release. Source websites, their operators, and their content are independent from Kira. Availability, accuracy, safety, legality, licensing, and continuity of third-party content are not verified by the app merely because a source configuration exists.</p><p>Do not use Kira to infringe copyright, evade lawful restrictions, attack a service, or distribute material you do not have the right to distribute.</p></section>
      <section id="activation"><p className="sectionNumber">03</p><h2>Activation and source management</h2><p>The Start Reading activation flow is a discoverability gate that reveals source-management controls. It is permanent on the installation and is not an account, purchase, security credential, or promise that a third-party source will work.</p></section>
      <section id="files"><p className="sectionNumber">04</p><h2>Your files and backups</h2><p>You control Kira backups, exported manga packages, screenshots, and downloads created on your device. Keep your own safe copy before replacing a device or changing app data. Imports may merge local records according to the app&apos;s backup format. Arbitrary external CBZ files are not currently a supported import format.</p></section>
      <section id="safety"><p className="sectionNumber">05</p><h2>Adult content and safety</h2><p>Some third-party sources may contain mature material. Kira includes content controls, but no filter can guarantee every external item is classified correctly. The final minimum-age and parental-consent requirements are unresolved: <span className="placeholder">[OWNER/LEGAL DECISION REQUIRED]</span>.</p></section>
      <section><h2>Feedback and complaints</h2><p>You may submit a complaint through the internal-testing feature. Do not include passwords, payment information, identity documents, or other unnecessary sensitive data. Complaint authentication and authorization must be secured or the feature disabled before public release; see the <Link href="/privacy">privacy policy</Link>.</p></section>
      <section><h2>Service changes</h2><p>Features, supported sources, and compatibility may change. Third-party sites can change or stop working without notice. Kira may update or remove a source configuration when necessary, subject to applicable consumer obligations.</p></section>
      <section id="liability"><p className="sectionNumber">06</p><h2>Disclaimers and liability</h2><p>No warranty disclaimer or liability cap is finalized in this draft. Applicable consumer protections cannot be waived where the law prohibits it. The owner must obtain jurisdiction-specific wording before publication: <span className="placeholder">[LEGAL REVIEW REQUIRED — DO NOT COPY A GENERIC LIABILITY CLAUSE]</span>.</p></section>
      <section><h2>Termination and contact</h2><p>You may stop using Kira and remove local data at any time. Any operator suspension or termination right, notice method, dispute process, and official contact must be supplied by the owner: <span className="placeholder">[OWNER/LEGAL INPUT REQUIRED]</span>.</p></section>
    </DocumentPage>
  );
}
