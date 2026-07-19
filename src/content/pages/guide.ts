import { contentLink, strong, type DocumentPageContent } from '@/content/pages/types';

export const guidePageContent = {
  metadata: {
    title: 'Reading guide',
    description: 'A quick guide to starting, importing, and reading manga with Kira Manga.',
    canonical: '/guide',
  },
  hero: {
    eyebrow: 'Getting started',
    title: 'Read with Kira.',
    intro: 'Build a local library from a Kira backup or, after activation, choose the sources you want to manage.',
    actions: [
      { label: 'Open Kira', href: '/activate', variant: 'primary', arrow: true },
      { label: 'Troubleshooting', href: '/support', variant: 'ghost' },
    ],
  },
  sections: [
    {
      id: 'library',
      number: '01',
      title: 'Start with your library',
      blocks: [{
        kind: 'paragraph',
        content: ['You can continue to Library without activating Sources management. Import a complete Kira backup ZIP or an individual manga package previously exported by Kira. Arbitrary third-party CBZ imports are not supported in this release.'],
      }],
    },
    {
      id: 'activate',
      number: '02',
      title: 'Activate Sources management',
      tocLabel: 'Activate sources',
      blocks: [{
        kind: 'paragraph',
        content: ['Open the official ', contentLink('activation page', '/activate'), ' on your Android or iOS device. Once activated, Kira permanently reveals the Sources screen so you can enable, disable, and configure available sources. Activation is a simple UI discoverability step, not an account or security credential.'],
      }],
    },
    {
      id: 'read',
      number: '03',
      title: 'Add manga and download chapters',
      tocLabel: 'Add manga and read',
      blocks: [{
        kind: 'paragraph',
        content: ["Open an enabled source, find a title, and add it to your library. From a manga's details screen you can refresh chapters or download them for offline reading. Source websites are independent services, so availability and response formats can change."],
      }],
    },
    {
      id: 'backup',
      number: '04',
      title: 'Protect your library',
      blocks: [{
        kind: 'paragraph',
        content: ["Use Kira's Backup screen to export a complete backup before changing devices or reinstalling. Keep the original ZIP until you verify that library metadata, chapters, covers, downloaded files, and reading state restored correctly."],
      }],
    },
  ],
  afterword: [{
    kind: 'notice',
    content: ['Use only links published on ', strong('kiramanga.me'), " or Kira's confirmed social profiles. Kira never asks for a password or payment to reveal Sources management."],
  }],
} as const satisfies DocumentPageContent;
