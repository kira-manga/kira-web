import { contentLink, type DocumentPageContent } from '@/content/pages/types';

export const termsPageContent = {
  metadata: {
    title: 'Terms of service',
    description: 'Draft terms of service for Kira Manga.',
    canonical: '/terms',
  },
  hero: {
    eyebrow: 'Draft terms',
    title: 'Terms of service',
    intro: 'These draft terms describe the current Kira application and should receive final legal review before publication.',
  },
  preface: [{
    kind: 'meta',
    rows: [
      { label: 'Effective date:', value: ['July 1, 2026'] },
      { label: 'Contact:', value: [contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com')] },
    ],
  }],
  sections: [
    {
      id: 'using-kira',
      number: '01',
      title: 'Using Kira',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira is an Android and iOS manga reader with library, reading, download, backup, and source-management tools. You must be at least 13 years old to use Kira. You are responsible for using the app and third-party sources lawfully, respecting applicable rights, and following the terms of sites you choose to access.'],
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
        content: ['Kira uses source-specific genre and metadata blacklists and blocks titles classified as adult content from opening. Adult-oriented content is not intended to be displayed, but third-party metadata may be incomplete or inaccurate, so the filter cannot guarantee that every inappropriate item will always be identified. Kira does not currently provide a parental-consent procedure.'],
      }],
    },
    {
      id: 'reports',
      title: 'Reports and complaints',
      blocks: [{
        kind: 'paragraph',
        content: ['You may report technical problems, sources, or content through the application. Reports will be investigated, and appropriate action will be taken when necessary, but submitting a report does not guarantee a particular outcome. Do not include passwords, payment information, identity documents, or unrelated sensitive information. See the ', contentLink('privacy policy', '/privacy'), ' for the data included with a report.'],
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
        content: ['Kira and third-party sources can be unavailable, delayed, incomplete, or incompatible after a source changes. Keep independent copies of important backups and verify exported files before removing the original data. These draft terms do not limit rights that cannot lawfully be limited and should receive final legal review before publication.'],
      }],
    },
    {
      id: 'accounts',
      title: 'Accounts and access',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira does not currently provide account registration, so there is no user account to suspend or terminate. You may stop using Kira and remove local data at any time. Access to a source or feature may be limited when necessary to address security, abuse, technical, or valid copyright concerns. Appropriate account rules will be introduced if accounts are added in the future.'],
      }],
    },
    {
      title: 'Contact',
      blocks: [{
        kind: 'paragraph',
        content: ['For support, privacy, legal, copyright, or general questions, contact ', contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com'), '. Copyright complaints should include the information described in the ', contentLink('copyright complaint process', '/takedown'), '.'],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
