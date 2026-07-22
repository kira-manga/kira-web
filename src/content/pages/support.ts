import {
  contentLink,
  inlineCode,
  lineBreak,
  strong,
  type DocumentPageContent,
} from '@/content/pages/types';

export const supportPageContent = {
  metadata: {
    title: 'Support',
    description: 'Support and troubleshooting for Kira Manga.',
    canonical: '/support',
  },
  hero: {
    eyebrow: 'Help center',
    title: 'How can we help?',
    intro: 'Start with the checks below. Never send passwords, signing files, full private backups, or unrelated personal data to support.',
    actions: [
      { label: 'Start reading', href: '/activate', variant: 'primary', arrow: true },
      { label: 'Delete data', href: '/data-deletion', variant: 'ghost' },
    ],
  },
  sections: [
    {
      id: 'activation',
      number: '01',
      title: 'Activate Sources management',
      tocLabel: 'Activation',
      blocks: [{
        kind: 'paragraph',
        content: ['Open ', contentLink('kiramanga.me/activate', '/activate'), " on the device where Kira is installed. If an in-app social browser keeps the page inside itself, open the link in Safari or your default Android browser. You can also use Start Reading from Kira's Home or Settings screen."],
      }],
    },
    {
      id: 'library',
      number: '02',
      title: 'No manga appears on Home',
      tocLabel: 'Empty library',
      blocks: [{
        kind: 'paragraph',
        content: ['If activation is still locked and no usable source is enabled, Kira shows the Start Reading guidance. After activation, open Sources management and enable at least one source. A real network, parsing, Cloudflare, or source-site error is separate and should not be treated as an activation problem.'],
      }],
    },
    {
      id: 'import',
      number: '03',
      title: 'Import and restore',
      blocks: [{
        kind: 'paragraph',
        content: ['Kira imports complete Kira backup ZIP files and manga packages previously exported by Kira. Arbitrary external CBZ files are not supported. Keep the original archive until you confirm its library metadata, chapters, cover, downloaded files, and reading state restored correctly.'],
      }],
    },
    {
      id: 'downloads',
      number: '04',
      title: 'Downloads or pages fail',
      tocLabel: 'Downloads and pages',
      blocks: [{
        kind: 'unorderedList',
        items: [
          ['Confirm the device is online and has enough free storage.'],
          ['Retry without a VPN or restrictive content filter if the source blocks it.'],
          ['Some sources require a Cloudflare challenge in the built-in WebView.'],
          ['A source site can be offline or change its page format independently of Kira.'],
          ['Downloaded chapters should remain readable offline after completion.'],
        ],
      }],
    },
    {
      id: 'links',
      number: '05',
      title: 'Notifications and deep links',
      tocLabel: 'Notifications and links',
      blocks: [{
        kind: 'paragraph',
        content: ['Enable notification permission in system settings. Android App Links and iOS Universal Links use ', inlineCode('https://kiramanga.me/activate'), '; the fallback scheme is ', inlineCode('kiramanga://activate'), '. Push behavior also depends on Firebase/APNs configuration in the installed build.'],
      }],
    },
    {
      id: 'report',
      number: '06',
      title: 'Report a problem',
      blocks: [
        {
          kind: 'paragraph',
          content: ['Kira includes an in-app report form for technical problems, sources, features, and content concerns. Include the smallest useful description and avoid passwords, payment information, identity documents, and unrelated personal information. Reports will be investigated, and appropriate action will be taken when necessary, but a specific outcome cannot be guaranteed.'],
        },
        {
          kind: 'notice',
          warning: true,
          content: [
            strong('Support email:'), ' ', contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com'), lineBreak(),
            strong('Expected response time:'), ' Within two business days',
          ],
        },
      ],
    },
    {
      title: 'Copyright requests',
      blocks: [{
        kind: 'paragraph',
        content: ['Use the ', contentLink('copyright and takedown process', '/takedown'), '. Support cannot determine ownership from a general app complaint.'],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
