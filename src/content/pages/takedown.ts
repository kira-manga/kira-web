import { contentLink, strong, type DocumentPageContent } from '@/content/pages/types';

export const takedownPageContent = {
  metadata: {
    title: 'Copyright and takedown',
    description: 'Draft copyright complaint and content-review process for Kira Manga.',
    canonical: '/takedown',
  },
  hero: {
    eyebrow: 'Draft policy',
    title: 'Copyright complaints',
    intro: 'Kira does not claim ownership of third-party manga. This draft explains how copyright owners and authorized representatives can request a source or item review.',
  },
  preface: [{
    kind: 'meta',
    rows: [
      { label: 'Effective date:', value: ['July 1, 2026'] },
      { label: 'Copyright contact:', value: [contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com')] },
    ],
  }],
  sections: [
    {
      id: 'before',
      number: '01',
      title: 'Before submitting a notice',
      tocLabel: 'Before submitting',
      blocks: [{
        kind: 'paragraph',
        content: ['Manga files are not permanently hosted on Kira servers. The application retrieves or displays manga from sources available on the internet. Public availability does not remove copyright restrictions or grant Kira ownership or redistribution rights. Contacting the source operator or hosting provider may be the most direct way to remove the underlying file.'],
      }],
    },
    {
      id: 'include',
      number: '02',
      title: 'Information to include',
      tocLabel: 'What to include',
      blocks: [
        {
          kind: 'orderedList',
          items: [
            ['Identification of the copyrighted work.'],
            ['Identification of the affected manga, chapter, image, or other content.'],
            ['The source URL or enough information to locate the material in Kira.'],
            ['Your name and monitored contact information.'],
            ['Evidence that you own the rights or are authorized to act for the owner.'],
            ['A good-faith statement that the complained-of use is not authorized by the owner, its representative, or applicable law.'],
            ['Confirmation that the information you submitted is accurate.'],
          ],
        },
        {
          kind: 'paragraph',
          content: ['Include a clear description of the action requested. Do not send passwords, payment details, or unrelated identity documents. Additional information may be requested when it is reasonably needed to verify or locate the complaint.'],
        },
      ],
    },
    {
      id: 'send',
      number: '03',
      title: 'Where to send it',
      blocks: [
        {
          kind: 'paragraph',
          content: [strong('Email: '), contentLink('abdelrahmanfahmy.dev@gmail.com', 'mailto:abdelrahmanfahmy.dev@gmail.com')],
        },
        {
          kind: 'notice',
          content: ['There is no registered DMCA agent. This is a general copyright complaint and content-review process and does not claim registered-agent status.'],
        },
      ],
    },
    {
      id: 'review',
      number: '04',
      title: 'Review and response',
      blocks: [{
        kind: 'paragraph',
        content: ['A sufficiently detailed complaint will be investigated. The relevant content, link, or source may be blocked from appearing in Kira when appropriate. A report does not guarantee removal, and Kira may request clarification or consider a response from the affected source or party before acting.'],
      }],
    },
    {
      id: 'misuse',
      number: '05',
      title: 'Misuse',
      blocks: [{
        kind: 'paragraph',
        content: ['Do not knowingly submit false or abusive complaints. Complaint correspondence and a minimal action record may be retained as reasonably necessary to investigate the request, document the response, prevent repeated abuse, and meet applicable obligations.'],
      }],
    },
  ],
} as const satisfies DocumentPageContent;
