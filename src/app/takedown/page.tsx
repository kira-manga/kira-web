import type { Metadata } from 'next';

import { DocumentPage, Notice } from '@/components/document-page';

export const metadata: Metadata = {
  title: 'Copyright and takedown',
  description: 'Draft copyright and takedown process for Kira Manga.',
  alternates: { canonical: '/takedown' },
};

const toc = [
  { href: '#before', label: 'Before submitting' },
  { href: '#include', label: 'What to include' },
  { href: '#send', label: 'Where to send it' },
  { href: '#review', label: 'Review and response' },
  { href: '#misuse', label: 'Misuse' },
] as const;

export default function TakedownPage() {
  return (
    <DocumentPage eyebrow="Draft policy" title="Copyright and takedown" intro="Kira is a reader that sends requests to third-party source sites; it does not claim ownership of their content. This process must be adapted by legal counsel to the operator's jurisdiction." toc={toc}>
      <Notice warning>The repository does not establish a registered DMCA agent, legal entity, service address, or governing takedown regime. The placeholders below must be completed and legally reviewed before publication.</Notice>
      <section id="before"><p className="sectionNumber">01</p><h2>Before submitting a notice</h2><p>If the material is hosted by a third-party source, contacting that site&apos;s operator or hosting provider may be the direct way to remove it. A notice to Kira can be used to request that a source configuration or link be reviewed, but Kira may not control the underlying file.</p></section>
      <section id="include"><p className="sectionNumber">02</p><h2>Information to include</h2><ol><li>Your full legal name and a monitored email address.</li><li>Identification of the copyrighted work or other protected material.</li><li>The exact Kira source name and URL(s) at issue.</li><li>A clear description of the requested action.</li><li>The good-faith, accuracy, authority, signature, and penalty-of-perjury statements required by the law that actually applies to you and the operator, as confirmed by counsel.</li></ol><p>Do not send identity documents or unrelated personal information unless a verified legal process requires them.</p></section>
      <section id="send"><p className="sectionNumber">03</p><h2>Where to send it</h2><p><strong>Takedown email:</strong> <span className="placeholder">[OWNER TO CREATE TAKEDOWN EMAIL]</span><br /><strong>Legal name and address:</strong> <span className="placeholder">[OWNER/LEGAL TO SUPPLY]</span><br /><strong>Registered agent details, if applicable:</strong> <span className="placeholder">[LEGAL TO CONFIRM OR MARK NOT APPLICABLE]</span></p></section>
      <section id="review"><p className="sectionNumber">04</p><h2>Review and response</h2><p>No response deadline, counter-notice process, repeat-infringer policy, or jurisdiction-specific remedy is promised by this draft. The owner must define a staffed and lawful process before public release: <span className="placeholder">[LEGAL/OPERATIONS DECISION REQUIRED]</span>.</p></section>
      <section id="misuse"><p className="sectionNumber">05</p><h2>Misuse</h2><p>Knowingly false or abusive notices may have legal consequences. Kira may preserve a minimal audit record where legally required, but no retention schedule is established in the repository: <span className="placeholder">[LEGAL RETENTION DECISION REQUIRED]</span>.</p></section>
    </DocumentPage>
  );
}
