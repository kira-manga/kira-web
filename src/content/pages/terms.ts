import { contentLink, placeholder, type DocumentPageContent } from '@/content/pages/types';

export const termsPageContent = {
  metadata: {
    title: 'Terms of service',
    description: 'Draft terms of service for Kira Manga.',
    canonical: '/terms',
  },
  hero: {
    eyebrow: 'Draft terms',
    title: 'Terms of service',
    intro: 'These terms are a product draft, not final legal advice. Owner identity, jurisdiction, age rules, and mandatory consumer terms remain open.',
  },
  preface: [{
    kind: 'meta',
    rows: [
      { label: 'Effective date:', value: [placeholder('[OWNER/LEGAL TO SET]')] },
      { label: 'Service provider:', value: [placeholder('[LEGAL NAME, ADDRESS, AND CONTACT]')] },
      { label: 'Governing law/forum:', value: [placeholder('[LEGAL REVIEW REQUIRED]')] },
    ],
  }],
  sections: [
    {
      id: 'using-kira',
      number: '01',
      title: 'Using Kira',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira is an Android and iOS manga reader with library, reading, download, backup, and source-management tools. You are responsible for using the app and third-party sources lawfully, respecting applicable rights, and following the terms of sites you choose to access.'],
      }],
    },
    {
      id: 'sources',
      number: '02',
      title: 'Third-party sources and content',
      blocks: [
        {
          kind: 'paragraph',
          content: ['Kira does not host the manga obtained from configured third-party sources in this release. Source websites, their operators, and their content are independent from Kira. Availability, accuracy, safety, legality, licensing, and continuity of third-party content are not verified by the app merely because a source configuration exists.'],
        },
        {
          kind: 'paragraph',
          content: ['Do not use Kira to infringe copyright, evade lawful restrictions, attack a service, or distribute material you do not have the right to distribute.'],
        },
      ],
    },
    {
      id: 'activation',
      number: '03',
      title: 'Activation and source management',
      tocLabel: 'Activation',
      blocks: [{
        kind: 'paragraph',
        content: ['The Start Reading activation flow is a discoverability gate that reveals source-management controls. It is permanent on the installation and is not an account, purchase, security credential, or promise that a third-party source will work.'],
      }],
    },
    {
      id: 'files',
      number: '04',
      title: 'Your files and backups',
      tocLabel: 'Files and backups',
      blocks: [{
        kind: 'paragraph',
        content: ['You control Kira backups, exported manga packages, screenshots, and downloads created on your device. Keep your own safe copy before replacing a device or changing app data. Imports may merge local records according to the app\'s backup format. Arbitrary external CBZ files are not currently a supported import format.'],
      }],
    },
    {
      id: 'safety',
      number: '05',
      title: 'Adult content and safety',
      tocLabel: 'Safety',
      blocks: [{
        kind: 'paragraph',
        content: ['Some third-party sources may contain mature material. Kira includes content controls, but no filter can guarantee every external item is classified correctly. The final minimum-age and parental-consent requirements are unresolved: ', placeholder('[OWNER/LEGAL DECISION REQUIRED]'), '.'],
      }],
    },
    {
      title: 'Feedback and complaints',
      blocks: [{
        kind: 'paragraph',
        content: ['You may submit a complaint through the internal-testing feature. Do not include passwords, payment information, identity documents, or other unnecessary sensitive data. Complaint authentication and authorization must be secured or the feature disabled before public release; see the ', contentLink('privacy policy', '/privacy'), '.'],
      }],
    },
    {
      title: 'Service changes',
      blocks: [{
        kind: 'paragraph',
        content: ['Features, supported sources, and compatibility may change. Third-party sites can change or stop working without notice. Kira may update or remove a source configuration when necessary, subject to applicable consumer obligations.'],
      }],
    },
    {
      id: 'liability',
      number: '06',
      title: 'Disclaimers and liability',
      tocLabel: 'Disclaimers',
      blocks: [{
        kind: 'paragraph',
        content: ['No warranty disclaimer or liability cap is finalized in this draft. Applicable consumer protections cannot be waived where the law prohibits it. The owner must obtain jurisdiction-specific wording before publication: ', placeholder('[LEGAL REVIEW REQUIRED — DO NOT COPY A GENERIC LIABILITY CLAUSE]'), '.'],
      }],
    },
    {
      title: 'Termination and contact',
      blocks: [{
        kind: 'paragraph',
        content: ['You may stop using Kira and remove local data at any time. Any operator suspension or termination right, notice method, dispute process, and official contact must be supplied by the owner: ', placeholder('[OWNER/LEGAL INPUT REQUIRED]'), '.'],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
