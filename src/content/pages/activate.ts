import { inlineCode, strong, type DocumentPageContent } from '@/content/pages/types';

export const activatePageContent = {
  metadata: {
    title: 'Start reading',
    description: 'Open Kira Manga and learn how to activate source management.',
    canonical: '/activate',
  },
  hero: {
    eyebrow: 'Activation',
    title: 'Continue in Kira.',
    intro: 'Open this page on the Android or iOS device where Kira is installed. The official link connects the website to the app.',
    actions: [
      { label: 'Open the Kira app', href: 'kiramanga://activate', variant: 'primary', arrow: true },
      { label: 'Activation help', href: '/support', variant: 'ghost' },
    ],
  },
  preface: [
    { kind: 'banner', title: 'Official Kira activation', description: 'No account, password, or payment is required.' },
  ],
  sections: [
    {
      id: 'how-it-works',
      number: '01',
      title: 'How source activation works',
      tocLabel: 'How activation works',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'Install Kira', body: ['Use the Android or iOS device where the app is installed.'] },
            { title: 'Open the official link', body: ['Visit ', inlineCode('https://kiramanga.me/activate'), ' in your default browser.'] },
            { title: 'Choose your sources', body: ['Kira permanently reveals its Sources management screen for that installation.'] },
          ],
        },
        {
          kind: 'paragraph',
          content: ['Activation is a discoverability gate for source-management controls. It is not an account login, purchase, or security credential.'],
        },
      ],
    },
    {
      id: 'troubleshooting',
      number: '02',
      title: 'If the app does not open',
      blocks: [
        {
          kind: 'unorderedList',
          items: [
            ['Use Safari on iOS or your default browser on Android rather than an in-app social browser.'],
            ['Choose “Open in app” if the browser asks.'],
            ['Open Kira manually, then use Start Reading from Home or Settings.'],
            ['Use ', inlineCode('kiramanga://activate'), ' as the custom-scheme fallback.'],
          ],
        },
      ],
    },
  ],
  afterword: [
    {
      kind: 'notice',
      content: ['Only follow activation guidance published on ', strong('kiramanga.me'), " or Kira's confirmed social profiles. Kira never asks for a password or payment to activate Sources management."],
    },
  ],
} as const satisfies DocumentPageContent;
